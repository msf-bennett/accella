import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import { 
  Text,
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
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const CompetitionResults = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, competitions, loading } = useSelector(state => state.athlete);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Entrance animation
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

  const loadCompetitionResults = useCallback(async () => {
    try {
      // Simulate API call - replace with actual Redux action
      // dispatch(fetchCompetitionResults());
      console.log('Loading competition results...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load competition results');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCompetitionResults();
    Vibration.vibrate(50);
    setRefreshing(false);
  }, [loadCompetitionResults]);

  const handleCompetitionPress = (competition) => {
    Vibration.vibrate(30);
    navigation.navigate('CompetitionDetail', { competitionId: competition.id });
  };

  const handleShareResult = (competition) => {
    Vibration.vibrate(30);
    Alert.alert(
      'Share Result',
      `Share your ${competition.name} result?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => console.log('Sharing result...') }
      ]
    );
  };

  // Mock data - replace with actual data from Redux store
  const mockCompetitions = [
    {
      id: '1',
      name: 'Regional Championship',
      sport: 'Football',
      date: '2024-03-15',
      position: 1,
      score: '3-1',
      category: 'tournament',
      status: 'completed',
      participants: 16,
      location: 'City Stadium',
      performance: {
        goals: 2,
        assists: 1,
        rating: 9.2,
        motm: true
      }
    },
    {
      id: '2',
      name: 'State League Match',
      sport: 'Football',
      date: '2024-03-08',
      position: 2,
      score: '1-2',
      category: 'league',
      status: 'completed',
      participants: 2,
      location: 'Home Ground',
      performance: {
        goals: 0,
        assists: 1,
        rating: 7.5,
        motm: false
      }
    },
    {
      id: '3',
      name: 'Youth Cup Final',
      sport: 'Football',
      date: '2024-03-22',
      position: null,
      score: 'vs Eagles FC',
      category: 'cup',
      status: 'upcoming',
      participants: 2,
      location: 'Central Arena',
      performance: null
    }
  ];

  const competitions_data = competitions || mockCompetitions;

  const filteredCompetitions = competitions_data.filter(competition => {
    const matchesSearch = competition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competition.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competition.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'won' && competition.position === 1) ||
                         (selectedFilter === 'completed' && competition.status === 'completed') ||
                         (selectedFilter === 'upcoming' && competition.status === 'upcoming') ||
                         competition.category === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getPositionColor = (position) => {
    if (position === 1) return COLORS.success;
    if (position === 2) return '#FFA500';
    if (position === 3) return '#CD7F32';
    return COLORS.text.secondary;
  };

  const getPositionIcon = (position) => {
    if (position === 1) return 'jump-rope';
    if (position === 2) return 'looks-two';
    if (position === 3) return 'looks-3';
    return 'participation';
  };

  const renderCompetitionCard = (competition) => (
    <Card 
      key={competition.id} 
      style={styles.competitionCard}
      onPress={() => handleCompetitionPress(competition)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.competitionInfo}>
            <Text style={[TEXT_STYLES.h3, styles.competitionName]}>
              {competition.name}
            </Text>
            <View style={styles.metaInfo}>
              <Icon name="sports" size={16} color={COLORS.text.secondary} />
              <Text style={styles.metaText}>{competition.sport}</Text>
              <Icon name="location-on" size={16} color={COLORS.text.secondary} style={{ marginLeft: SPACING.sm }} />
              <Text style={styles.metaText}>{competition.location}</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(competition.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          
          {competition.status === 'completed' && competition.position && (
            <View style={[styles.positionBadge, { backgroundColor: getPositionColor(competition.position) }]}>
              <Icon name={getPositionIcon(competition.position)} size={24} color="white" />
              <Text style={styles.positionText}>{competition.position}</Text>
            </View>
          )}
          
          {competition.status === 'upcoming' && (
            <Chip icon="schedule" mode="outlined" textStyle={{ color: COLORS.primary }}>
              Upcoming
            </Chip>
          )}
        </View>

        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Result:</Text>
          <Text style={[styles.scoreText, { 
            color: competition.status === 'upcoming' ? COLORS.text.secondary : COLORS.text.primary 
          }]}>
            {competition.score}
          </Text>
        </View>

        {competition.performance && (
          <View style={styles.performanceSection}>
            <Text style={styles.sectionTitle}>Your Performance 📊</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="sports-soccer" size={20} color={COLORS.primary} />
                <Text style={styles.statValue}>{competition.performance.goals}</Text>
                <Text style={styles.statLabel}>Goals</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="sports-handball" size={20} color={COLORS.primary} />
                <Text style={styles.statValue}>{competition.performance.assists}</Text>
                <Text style={styles.statLabel}>Assists</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="star" size={20} color={COLORS.secondary} />
                <Text style={styles.statValue}>{competition.performance.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              {competition.performance.motm && (
                <View style={styles.statItem}>
                  <Icon name="jump-rope" size={20} color={COLORS.success} />
                  <Text style={[styles.statValue, { color: COLORS.success }]}>MOTM</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.cardActions}>
          <Button 
            mode="outlined" 
            icon="visibility"
            onPress={() => handleCompetitionPress(competition)}
            style={styles.actionButton}
          >
            View Details
          </Button>
          {competition.status === 'completed' && (
            <IconButton 
              icon="share" 
              onPress={() => handleShareResult(competition)}
              style={styles.shareButton}
            />
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderStatsOverview = () => {
    const completedCompetitions = competitions_data.filter(c => c.status === 'completed');
    const wins = completedCompetitions.filter(c => c.position === 1).length;
    const totalCompleted = completedCompetitions.length;
    const winRate = totalCompleted > 0 ? (wins / totalCompleted * 100).toFixed(1) : 0;

    return (
      <Surface style={styles.statsOverview}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.statsGradient}
        >
          <Text style={styles.statsTitle}>Competition Stats 🏆</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statsItem}>
              <Text style={styles.statsNumber}>{totalCompleted}</Text>
              <Text style={styles.statsLabel}>Completed</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsNumber}>{wins}</Text>
              <Text style={styles.statsLabel}>Victories</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsNumber}>{winRate}%</Text>
              <Text style={styles.statsLabel}>Win Rate</Text>
            </View>
            <View style={styles.statsItem}>
              <Text style={styles.statsNumber}>{competitions_data.filter(c => c.status === 'upcoming').length}</Text>
              <Text style={styles.statsLabel}>Upcoming</Text>
            </View>
          </View>
        </LinearGradient>
      </Surface>
    );
  };

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'all', label: 'All', icon: 'list' },
          { key: 'won', label: 'Victories', icon: 'jump-rope' },
          { key: 'completed', label: 'Completed', icon: 'check-circle' },
          { key: 'upcoming', label: 'Upcoming', icon: 'schedule' },
          { key: 'tournament', label: 'Tournaments', icon: 'sports' },
          { key: 'league', label: 'League', icon: 'groups' },
          { key: 'cup', label: 'Cups', icon: 'trophy' },
        ].map((filter) => (
          <Chip
            key={filter.key}
            icon={filter.icon}
            selected={selectedFilter === filter.key}
            onPress={() => {
              setSelectedFilter(filter.key);
              Vibration.vibrate(30);
            }}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.selectedFilterChip
            ]}
            textStyle={selectedFilter === filter.key ? styles.selectedFilterText : null}
          >
            {filter.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

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
        <Text style={styles.headerTitle}>Competition Results 🏆</Text>
        <Text style={styles.headerSubtitle}>Track your competitive journey</Text>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {renderStatsOverview()}

          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search competitions..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor={COLORS.primary}
            />
          </View>

          {renderFilterChips()}

          <View style={styles.resultsSection}>
            <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>
              Your Results ({filteredCompetitions.length})
            </Text>
            
            {filteredCompetitions.length > 0 ? (
              filteredCompetitions.map(renderCompetitionCard)
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Icon name="search-off" size={48} color={COLORS.text.secondary} />
                  <Text style={styles.emptyTitle}>No Results Found</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Try adjusting your search terms' : 'No competitions match the selected filter'}
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            'Add Competition Result',
            'This feature is coming soon! You\'ll be able to manually add competition results.',
            [{ text: 'Got it', style: 'default' }]
          );
        }}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    paddingTop: SPACING.xl + 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
  statsOverview: {
    margin: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsItem: {
    alignItems: 'center',
  },
  statsNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  statsLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  selectedFilterText: {
    color: 'white',
  },
  resultsSection: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text.primary,
  },
  competitionCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  competitionInfo: {
    flex: 1,
  },
  competitionName: {
    marginBottom: SPACING.xs,
    color: COLORS.text.primary,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  metaText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  dateText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
  },
  positionBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  positionText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    marginTop: -2,
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
  },
  scoreLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
  },
  scoreText: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  performanceSection: {
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
    color: COLORS.text.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  shareButton: {
    marginLeft: SPACING.sm,
  },
  emptyCard: {
    marginTop: SPACING.lg,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default CompetitionResults;