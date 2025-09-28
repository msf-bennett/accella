import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Animated,
  StatusBar,
  Alert,
  TouchableOpacity,
  FlatList,
  Dimensions,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const CompetitionResults = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const competitionResults = useSelector(state => state.performance.competitionResults);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for demonstration
  const mockCompetitionData = [
    {
      id: '1',
      competitionName: 'City Youth Football Championship',
      sport: 'Football',
      date: '2024-08-15',
      position: 2,
      totalParticipants: 12,
      points: 850,
      achievements: ['Silver Medal 🥈', 'Best Team Player'],
      coach: 'Coach Martinez',
      location: 'Nairobi Sports Complex',
      category: 'Under 16',
      medals: { gold: 0, silver: 1, bronze: 0 },
      personalBests: ['Sprint: 11.2s', 'Endurance: 12min'],
    },
    {
      id: '2',
      competitionName: 'Regional Swimming Meet',
      sport: 'Swimming',
      date: '2024-07-28',
      position: 1,
      totalParticipants: 8,
      points: 1200,
      achievements: ['Gold Medal 🥇', 'New Record'],
      coach: 'Coach Williams',
      location: 'Aquatic Center',
      category: 'Under 16',
      medals: { gold: 1, silver: 0, bronze: 0 },
      personalBests: ['Freestyle 50m: 28.5s'],
    },
    {
      id: '3',
      competitionName: 'Basketball Tournament',
      sport: 'Basketball',
      date: '2024-08-01',
      position: 3,
      totalParticipants: 16,
      points: 650,
      achievements: ['Bronze Medal 🥉', 'Most Assists'],
      coach: 'Coach Johnson',
      location: 'Indoor Arena',
      category: 'Under 16',
      medals: { gold: 0, silver: 0, bronze: 1 },
      personalBests: ['Points per game: 18'],
    },
  ];

  useEffect(() => {
    // Entrance animations
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

    // Load competition results
    loadCompetitionResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [searchQuery, selectedSport, selectedTimeframe]);

  const loadCompetitionResults = useCallback(async () => {
    try {
      // In a real app, this would fetch from API or local storage
      setFilteredResults(mockCompetitionData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load competition results');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCompetitionResults();
    setRefreshing(false);
  }, [loadCompetitionResults]);

  const filterResults = useCallback(() => {
    let filtered = mockCompetitionData;

    if (searchQuery) {
      filtered = filtered.filter(result =>
        result.competitionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.sport.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSport !== 'all') {
      filtered = filtered.filter(result => result.sport === selectedSport);
    }

    if (selectedTimeframe !== 'all') {
      const now = new Date();
      const resultDate = new Date(filtered.date);
      
      switch (selectedTimeframe) {
        case 'month':
          filtered = filtered.filter(result => {
            const date = new Date(result.date);
            return (now - date) <= 30 * 24 * 60 * 60 * 1000;
          });
          break;
        case 'quarter':
          filtered = filtered.filter(result => {
            const date = new Date(result.date);
            return (now - date) <= 90 * 24 * 60 * 60 * 1000;
          });
          break;
      }
    }

    setFilteredResults(filtered);
  }, [searchQuery, selectedSport, selectedTimeframe]);

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return COLORS.warning; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return COLORS.primary;
    }
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return 'jump-rope';
      case 2: return 'jump-rope';
      case 3: return 'jump-rope';
      default: return 'sports';
    }
  };

  const renderCompetitionCard = ({ item, index }) => {
    const cardOpacity = scrollY.interpolate({
      inputRange: [0, 100 * index, 100 * (index + 2)],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={{ opacity: cardOpacity }}>
        <Card style={styles.competitionCard}>
          <LinearGradient
            colors={position === 1 ? ['#FFD700', '#FFA500'] : 
                   position === 2 ? ['#C0C0C0', '#A8A8A8'] :
                   position === 3 ? ['#CD7F32', '#A0522D'] :
                   [COLORS.primary, COLORS.secondary]}
            style={styles.cardHeader}
          >
            <View style={styles.headerContent}>
              <View style={styles.positionBadge}>
                <Icon 
                  name={getPositionIcon(item.position)} 
                  size={24} 
                  color="#FFFFFF" 
                />
                <Text style={styles.positionText}>#{item.position}</Text>
              </View>
              <View style={styles.competitionInfo}>
                <Text style={styles.competitionName} numberOfLines={2}>
                  {item.competitionName}
                </Text>
                <Text style={styles.competitionDate}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <Card.Content style={styles.cardContent}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="sports" size={20} color={COLORS.primary} />
                <Text style={styles.statLabel}>Sport</Text>
                <Text style={styles.statValue}>{item.sport}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="people" size={20} color={COLORS.primary} />
                <Text style={styles.statLabel}>Participants</Text>
                <Text style={styles.statValue}>{item.totalParticipants}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="star" size={20} color={COLORS.primary} />
                <Text style={styles.statLabel}>Points</Text>
                <Text style={styles.statValue}>{item.points}</Text>
              </View>
            </View>

            <View style={styles.achievementsSection}>
              <Text style={styles.sectionTitle}>🏆 Achievements</Text>
              <View style={styles.achievementsContainer}>
                {item.achievements.map((achievement, idx) => (
                  <Chip
                    key={idx}
                    mode="outlined"
                    style={[styles.achievementChip, { borderColor: getPositionColor(item.position) }]}
                    textStyle={{ color: getPositionColor(item.position) }}
                  >
                    {achievement}
                  </Chip>
                ))}
              </View>
            </View>

            {item.personalBests.length > 0 && (
              <View style={styles.personalBestsSection}>
                <Text style={styles.sectionTitle}>⚡ Personal Bests</Text>
                {item.personalBests.map((best, idx) => (
                  <View key={idx} style={styles.personalBestItem}>
                    <Icon name="trending-up" size={16} color={COLORS.success} />
                    <Text style={styles.personalBestText}>{best}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.competitionDetails}>
              <View style={styles.detailRow}>
                <Icon name="person" size={16} color={COLORS.secondary} />
                <Text style={styles.detailText}>Coach: {item.coach}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="location-on" size={16} color={COLORS.secondary} />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="category" size={16} color={COLORS.secondary} />
                <Text style={styles.detailText}>Category: {item.category}</Text>
              </View>
            </View>
          </Card.Content>

          <Card.Actions style={styles.cardActions}>
            <Button
              mode="text"
              onPress={() => Alert.alert('Feature Coming Soon', 'Detailed analysis will be available soon!')}
              textColor={COLORS.primary}
            >
              View Details
            </Button>
            <Button
              mode="text"
              onPress={() => Alert.alert('Feature Coming Soon', 'Share functionality will be available soon!')}
              textColor={COLORS.primary}
            >
              Share
            </Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  const renderStatsOverview = () => {
    const totalCompetitions = filteredResults.length;
    const totalMedals = filteredResults.reduce((sum, result) => 
      sum + result.medals.gold + result.medals.silver + result.medals.bronze, 0
    );
    const avgPosition = filteredResults.reduce((sum, result) => sum + result.position, 0) / totalCompetitions;

    return (
      <Card style={styles.statsCard}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statsHeader}>
          <Text style={styles.statsTitle}>📊 Competition Overview</Text>
        </LinearGradient>
        <Card.Content>
          <View style={styles.statsGrid}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatNumber}>{totalCompetitions}</Text>
              <Text style={styles.overviewStatLabel}>Competitions</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatNumber}>{totalMedals}</Text>
              <Text style={styles.overviewStatLabel}>Total Medals</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatNumber}>{avgPosition.toFixed(1)}</Text>
              <Text style={styles.overviewStatLabel}>Avg Position</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderFilters = () => {
    const sports = ['all', 'Football', 'Swimming', 'Basketball'];
    const timeframes = [
      { key: 'all', label: 'All Time' },
      { key: 'month', label: 'Last Month' },
      { key: 'quarter', label: 'Last 3 Months' },
    ];

    return (
      <Card style={styles.filtersCard}>
        <Card.Content>
          <Text style={styles.filtersTitle}>🔍 Filters</Text>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sport:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sports.map(sport => (
                <Chip
                  key={sport}
                  selected={selectedSport === sport}
                  onPress={() => setSelectedSport(sport)}
                  style={styles.filterChip}
                  mode={selectedSport === sport ? 'flat' : 'outlined'}
                >
                  {sport === 'all' ? 'All Sports' : sport}
                </Chip>
              ))}
            </ScrollView>
          </View>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Time Period:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {timeframes.map(timeframe => (
                <Chip
                  key={timeframe.key}
                  selected={selectedTimeframe === timeframe.key}
                  onPress={() => setSelectedTimeframe(timeframe.key)}
                  style={styles.filterChip}
                  mode={selectedTimeframe === timeframe.key ? 'flat' : 'outlined'}
                >
                  {timeframe.label}
                </Chip>
              ))}
            </ScrollView>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🏆 Competition Results</Text>
          <Text style={styles.headerSubtitle}>Track your competitive achievements</Text>
        </View>
        <IconButton
          icon="filter-list"
          iconColor="#FFFFFF"
          size={24}
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        />
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Searchbar
          placeholder="Search competitions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />

        <ScrollView
          style={styles.scrollView}
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
          scrollEventThrottle={16}
        >
          {renderStatsOverview()}
          
          {showFilters && renderFilters()}

          {filteredResults.length === 0 ? (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyStateContent}>
                <Icon name="jump-rope" size={80} color={COLORS.secondary} />
                <Text style={styles.emptyStateTitle}>No Competition Results</Text>
                <Text style={styles.emptyStateText}>
                  Your competition results will appear here once you participate in events
                </Text>
                <Button
                  mode="contained"
                  style={styles.emptyStateButton}
                  onPress={() => Alert.alert('Feature Coming Soon', 'Competition registration will be available soon!')}
                >
                  Find Competitions
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <FlatList
              data={filteredResults}
              renderItem={renderCompetitionCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.competitionsList}
            />
          )}
        </ScrollView>
      </Animated.View>

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => Alert.alert('Feature Coming Soon', 'Add competition results manually will be available soon!')}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.medium,
  },
  searchBar: {
    marginTop: SPACING.medium,
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    marginBottom: SPACING.medium,
    elevation: 4,
  },
  statsHeader: {
    padding: SPACING.medium,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.medium,
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  overviewStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  filtersCard: {
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  filtersTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.medium,
  },
  filterSection: {
    marginBottom: SPACING.medium,
  },
  filterLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
    color: COLORS.primary,
  },
  filterChip: {
    marginRight: SPACING.small,
  },
  competitionsList: {
    paddingBottom: 100,
  },
  competitionCard: {
    marginBottom: SPACING.medium,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.medium,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  positionText: {
    ...TEXT_STYLES.caption,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 2,
  },
  competitionInfo: {
    flex: 1,
  },
  competitionName: {
    ...TEXT_STYLES.h3,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  competitionDate: {
    ...TEXT_STYLES.body,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  cardContent: {
    paddingTop: SPACING.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.medium,
    paddingVertical: SPACING.small,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  statValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 2,
  },
  achievementsSection: {
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    marginBottom: SPACING.small,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.small,
  },
  achievementChip: {
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  personalBestsSection: {
    marginBottom: SPACING.medium,
  },
  personalBestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  personalBestText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.small,
    color: COLORS.success,
  },
  competitionDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.medium,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.small,
    color: COLORS.secondary,
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  emptyStateCard: {
    marginTop: SPACING.large,
    elevation: 2,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    right: SPACING.medium,
    bottom: SPACING.medium,
  },
};

export default CompetitionResults;
