import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
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
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/styles';

const { width } = Dimensions.get('window');

const TeamStats = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { currentTeam, teamStats, seasonStats } = useSelector(state => state.teams);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('season');
  const [selectedCategory, setSelectedCategory] = useState('overview');
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  const periodOptions = [
    { key: 'week', label: 'This Week', icon: 'calendar-today' },
    { key: 'month', label: 'This Month', icon: 'event' },
    { key: 'season', label: 'Season', icon: 'sports-soccer' },
    { key: 'all', label: 'All Time', icon: 'history' },
  ];

  const categoryOptions = [
    { key: 'overview', label: 'Overview', icon: 'dashboard' },
    { key: 'performance', label: 'Performance', icon: 'trending-up' },
    { key: 'players', label: 'Players', icon: 'group' },
    { key: 'comparison', label: 'Compare', icon: 'compare-arrows' },
  ];

  useEffect(() => {
    loadTeamStats();
    animateEntrance();
  }, [selectedPeriod]);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 1200,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadTeamStats = useCallback(async () => {
    try {
      // dispatch(loadTeamStatistics(currentTeam.id, selectedPeriod));
    } catch (error) {
      console.error('Error loading team stats:', error);
      Alert.alert('Error', 'Failed to load team statistics');
    }
  }, [dispatch, currentTeam, selectedPeriod]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTeamStats();
    setRefreshing(false);
  }, [loadTeamStats]);

  const handleStatPress = (stat) => {
    Vibration.vibrate(50);
    setSelectedStat(stat);
    setShowDetailModal(true);
  };

  const handleCompareTeams = () => {
    setShowCompareModal(true);
  };

  const handleExportStats = () => {
    Alert.alert(
      "Export Statistics",
      "Choose export format:",
      [
        { text: "PDF Report", onPress: () => Alert.alert('PDF Export', 'Feature coming soon!') },
        { text: "Excel Sheet", onPress: () => Alert.alert('Excel Export', 'Feature coming soon!') },
        { text: "Share Link", onPress: () => Alert.alert('Share', 'Feature coming soon!') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  // Mock team statistics data
  const mockTeamStats = {
    overview: {
      matchesPlayed: 24,
      wins: 16,
      draws: 4,
      losses: 4,
      goalsFor: 42,
      goalsAgainst: 18,
      goalDifference: 24,
      points: 52,
      winPercentage: 66.7,
      cleanSheets: 12,
      position: 3,
      totalTeams: 20,
    },
    performance: {
      averageGoalsPerMatch: 1.75,
      averageGoalsConceeded: 0.75,
      possession: 58.3,
      passingAccuracy: 84.2,
      shotsOnTarget: 67.8,
      cornerKicks: 142,
      yellowCards: 28,
      redCards: 2,
      fouls: 156,
      attendance: 92.5,
    },
    recentForm: ['W', 'W', 'D', 'W', 'L'],
    topScorers: [
      { id: 1, name: 'Alex Johnson', goals: 12, assists: 5, avatar: 'https://via.placeholder.com/50' },
      { id: 2, name: 'Mike Wilson', goals: 8, assists: 3, avatar: 'https://via.placeholder.com/50' },
      { id: 3, name: 'Sarah Chen', goals: 6, assists: 10, avatar: 'https://via.placeholder.com/50' },
    ],
    upcomingFixtures: [
      { opponent: 'Thunder FC', date: '2024-08-28', home: true },
      { opponent: 'Lightning United', date: '2024-09-02', home: false },
      { opponent: 'Storm City', date: '2024-09-08', home: true },
    ],
  };

  const renderOverviewStats = () => (
    <View style={styles.categoryContainer}>
      {/* League Position Card */}
      <Animated.View
        style={[
          styles.positionCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Surface style={styles.positionSurface}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.positionGradient}
          >
            <View style={styles.positionContent}>
              <View style={styles.positionLeft}>
                <Icon name="jump-rope" size={40} color="white" />
                <Text style={styles.positionNumber}>#{mockTeamStats.overview.position}</Text>
              </View>
              <View style={styles.positionRight}>
                <Text style={styles.positionTitle}>League Position</Text>
                <Text style={styles.positionSubtitle}>
                  out of {mockTeamStats.overview.totalTeams} teams
                </Text>
                <View style={styles.pointsContainer}>
                  <Text style={styles.pointsText}>
                    {mockTeamStats.overview.points} points
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Surface>
      </Animated.View>

      {/* Match Statistics Grid */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          onPress={() => handleStatPress('matches')}
          activeOpacity={0.7}
        >
          <Surface style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="sports-soccer" size={32} color={COLORS.primary} />
              <Text style={styles.statValue}>{mockTeamStats.overview.matchesPlayed}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
          </Surface>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleStatPress('wins')}
          activeOpacity={0.7}
        >
          <Surface style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="check-circle" size={32} color={COLORS.success} />
              <Text style={styles.statValue}>{mockTeamStats.overview.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
          </Surface>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleStatPress('draws')}
          activeOpacity={0.7}
        >
          <Surface style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="remove-circle" size={32} color={COLORS.warning} />
              <Text style={styles.statValue}>{mockTeamStats.overview.draws}</Text>
              <Text style={styles.statLabel}>Draws</Text>
            </View>
          </Surface>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleStatPress('losses')}
          activeOpacity={0.7}
        >
          <Surface style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="cancel" size={32} color={COLORS.error} />
              <Text style={styles.statValue}>{mockTeamStats.overview.losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
          </Surface>
        </TouchableOpacity>
      </View>

      {/* Goals Statistics */}
      <Surface style={styles.goalsCard}>
        <Text style={styles.cardTitle}>Goals Statistics</Text>
        <View style={styles.goalsContainer}>
          <View style={styles.goalsStat}>
            <Text style={styles.goalsValue}>{mockTeamStats.overview.goalsFor}</Text>
            <Text style={styles.goalsLabel}>Goals For</Text>
            <ProgressBar
              progress={mockTeamStats.overview.goalsFor / 50}
              color={COLORS.success}
              style={styles.goalsProgress}
            />
          </View>
          <View style={styles.goalsStat}>
            <Text style={styles.goalsValue}>{mockTeamStats.overview.goalsAgainst}</Text>
            <Text style={styles.goalsLabel}>Goals Against</Text>
            <ProgressBar
              progress={mockTeamStats.overview.goalsAgainst / 30}
              color={COLORS.error}
              style={styles.goalsProgress}
            />
          </View>
          <View style={styles.goalsDifference}>
            <Text style={styles.goalsDiffValue}>
              +{mockTeamStats.overview.goalDifference}
            </Text>
            <Text style={styles.goalsDiffLabel}>Goal Difference</Text>
          </View>
        </View>
      </Surface>

      {/* Recent Form */}
      <Surface style={styles.formCard}>
        <Text style={styles.cardTitle}>Recent Form</Text>
        <View style={styles.formContainer}>
          {mockTeamStats.recentForm.map((result, index) => (
            <View
              key={index}
              style={[
                styles.formBadge,
                result === 'W' && styles.winBadge,
                result === 'D' && styles.drawBadge,
                result === 'L' && styles.lossBadge,
              ]}
            >
              <Text
                style={[
                  styles.formText,
                  result === 'W' && styles.winText,
                  result === 'D' && styles.drawText,
                  result === 'L' && styles.lossText,
                ]}
              >
                {result}
              </Text>
            </View>
          ))}
          <View style={styles.winPercentage}>
            <Text style={styles.winPercentageValue}>
              {mockTeamStats.overview.winPercentage}%
            </Text>
            <Text style={styles.winPercentageLabel}>Win Rate</Text>
          </View>
        </View>
      </Surface>

      {/* Top Scorers */}
      <Surface style={styles.scorersCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Top Scorers</Text>
          <Button
            mode="text"
            compact
            onPress={() => navigation.navigate('TeamRoster')}
          >
            View All
          </Button>
        </View>
        {mockTeamStats.topScorers.map((player, index) => (
          <View key={player.id} style={styles.scorerItem}>
            <View style={styles.scorerRank}>
              <Text style={styles.rankNumber}>#{index + 1}</Text>
            </View>
            <Avatar.Image
              size={40}
              source={{ uri: player.avatar }}
              style={styles.scorerAvatar}
            />
            <View style={styles.scorerInfo}>
              <Text style={styles.scorerName}>{player.name}</Text>
              <Text style={styles.scorerStats}>
                ⚽ {player.goals} goals • 🎯 {player.assists} assists
              </Text>
            </View>
            <View style={styles.scorerBadge}>
              <Badge size={24} style={styles.goalsBadge}>
                {player.goals}
              </Badge>
            </View>
          </View>
        ))}
      </Surface>
    </View>
  );

  const renderPerformanceStats = () => (
    <View style={styles.categoryContainer}>
      {/* Performance Metrics */}
      <Surface style={styles.performanceCard}>
        <Text style={styles.cardTitle}>Performance Metrics</Text>
        
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Possession</Text>
            <Text style={styles.metricValue}>{mockTeamStats.performance.possession}%</Text>
          </View>
          <ProgressBar
            progress={mockTeamStats.performance.possession / 100}
            color={COLORS.primary}
            style={styles.metricProgress}
          />
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Passing Accuracy</Text>
            <Text style={styles.metricValue}>{mockTeamStats.performance.passingAccuracy}%</Text>
          </View>
          <ProgressBar
            progress={mockTeamStats.performance.passingAccuracy / 100}
            color={COLORS.success}
            style={styles.metricProgress}
          />
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Shots on Target</Text>
            <Text style={styles.metricValue}>{mockTeamStats.performance.shotsOnTarget}%</Text>
          </View>
          <ProgressBar
            progress={mockTeamStats.performance.shotsOnTarget / 100}
            color={COLORS.secondary}
            style={styles.metricProgress}
          />
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Team Attendance</Text>
            <Text style={styles.metricValue}>{mockTeamStats.performance.attendance}%</Text>
          </View>
          <ProgressBar
            progress={mockTeamStats.performance.attendance / 100}
            color={COLORS.warning}
            style={styles.metricProgress}
          />
        </View>
      </Surface>

      {/* Discipline Stats */}
      <Surface style={styles.disciplineCard}>
        <Text style={styles.cardTitle}>Discipline</Text>
        <View style={styles.disciplineGrid}>
          <View style={styles.disciplineItem}>
            <Icon name="warning" size={24} color={COLORS.warning} />
            <Text style={styles.disciplineValue}>{mockTeamStats.performance.yellowCards}</Text>
            <Text style={styles.disciplineLabel}>Yellow Cards</Text>
          </View>
          <View style={styles.disciplineItem}>
            <Icon name="error" size={24} color={COLORS.error} />
            <Text style={styles.disciplineValue}>{mockTeamStats.performance.redCards}</Text>
            <Text style={styles.disciplineLabel}>Red Cards</Text>
          </View>
          <View style={styles.disciplineItem}>
            <Icon name="pan-tool" size={24} color={COLORS.textSecondary} />
            <Text style={styles.disciplineValue}>{mockTeamStats.performance.fouls}</Text>
            <Text style={styles.disciplineLabel}>Fouls</Text>
          </View>
        </View>
      </Surface>

      {/* Match Averages */}
      <Surface style={styles.averagesCard}>
        <Text style={styles.cardTitle}>Match Averages</Text>
        <View style={styles.averageItem}>
          <Icon name="sports-soccer" size={20} color={COLORS.success} />
          <Text style={styles.averageLabel}>Goals Scored</Text>
          <Text style={styles.averageValue}>{mockTeamStats.performance.averageGoalsPerMatch}</Text>
        </View>
        <View style={styles.averageItem}>
          <Icon name="shield" size={20} color={COLORS.error} />
          <Text style={styles.averageLabel}>Goals Conceded</Text>
          <Text style={styles.averageValue}>{mockTeamStats.performance.averageGoalsConceeded}</Text>
        </View>
        <View style={styles.averageItem}>
          <Icon name="flag" size={20} color={COLORS.primary} />
          <Text style={styles.averageLabel}>Corner Kicks</Text>
          <Text style={styles.averageValue}>
            {(mockTeamStats.performance.cornerKicks / mockTeamStats.overview.matchesPlayed).toFixed(1)}
          </Text>
        </View>
      </Surface>
    </View>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={showDetailModal}
        onDismiss={() => setShowDetailModal(false)}
        contentContainerStyle={styles.detailModal}
      >
        <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            {selectedStat && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedStat.charAt(0).toUpperCase() + selectedStat.slice(1)} Details
                  </Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowDetailModal(false)}
                  />
                </View>
                <ScrollView style={styles.modalScrollView}>
                  <Text style={styles.modalContent}>
                    Detailed statistics and analysis for {selectedStat} would be displayed here.
                    This could include trends, comparisons, and insights.
                  </Text>
                </ScrollView>
              </>
            )}
          </Surface>
        </BlurView>
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
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Team Statistics</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="compare-arrows"
              iconColor="white"
              size={24}
              onPress={handleCompareTeams}
            />
            <IconButton
              icon="file-download"
              iconColor="white"
              size={24}
              onPress={handleExportStats}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Period Selection */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodContainer}
        contentContainerStyle={styles.periodContent}
      >
        {periodOptions.map((option) => (
          <Chip
            key={option.key}
            mode={selectedPeriod === option.key ? 'flat' : 'outlined'}
            selected={selectedPeriod === option.key}
            onPress={() => setSelectedPeriod(option.key)}
            style={[
              styles.periodChip,
              selectedPeriod === option.key && styles.selectedPeriodChip,
            ]}
            icon={option.icon}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {categoryOptions.map((option) => (
          <Chip
            key={option.key}
            mode={selectedCategory === option.key ? 'flat' : 'outlined'}
            selected={selectedCategory === option.key}
            onPress={() => setSelectedCategory(option.key)}
            style={[
              styles.categoryChip,
              selectedCategory === option.key && styles.selectedCategoryChip,
            ]}
            icon={option.icon}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Statistics Content */}
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
        showsVerticalScrollIndicator={false}
      >
        {selectedCategory === 'overview' && renderOverviewStats()}
        {selectedCategory === 'performance' && renderPerformanceStats()}
        {selectedCategory === 'players' && (
          <View style={styles.placeholderContainer}>
            <Icon name="group" size={64} color={COLORS.textSecondary} />
            <Text style={styles.placeholderText}>
              Player Statistics Coming Soon
            </Text>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('TeamRoster')}
              style={styles.placeholderButton}
            >
              View Team Roster
            </Button>
          </View>
        )}
        {selectedCategory === 'comparison' && (
          <View style={styles.placeholderContainer}>
            <Icon name="compare-arrows" size={64} color={COLORS.textSecondary} />
            <Text style={styles.placeholderText}>
              Team Comparison Coming Soon
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.header,
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
  },
  periodContainer: {
    marginTop: SPACING.sm,
    marginHorizontal: SPACING.md,
  },
  periodContent: {
    paddingHorizontal: SPACING.xs,
  },
  periodChip: {
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  selectedPeriodChip: {
    backgroundColor: COLORS.primary,
  },
  categoryTabs: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  categoryTabsContent: {
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
    marginHorizontal: SPACING.xs,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.secondary,
  },
  content: {
    flex: 1,
  },
  categoryContainer: {
    padding: SPACING.md,
  },
  positionCard: {
    marginBottom: SPACING.lg,
  },
  positionSurface: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  positionGradient: {
    padding: SPACING.lg,
  },
  positionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionLeft: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  positionNumber: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  positionRight: {
    flex: 1,
  },
  positionTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  positionSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.sm,
  },
  pointsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pointsText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginVertical: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  goalsCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  goalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  goalsStat: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  goalsValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  goalsLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  goalsProgress: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  goalsDifference: {
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    marginHorizontal: SPACING.xs,
  },
  goalsDiffValue: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  goalsDiffLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginTop: SPACING.xs,
  },
  formCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  formContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  winBadge: {
    backgroundColor: COLORS.success,
  },
  drawBadge: {
    backgroundColor: COLORS.warning,
  },
  lossBadge: {
    backgroundColor: COLORS.error,
  },
  formText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  winText: {
    color: 'white',
  },
  drawText: {
    color: 'white',
  },
  lossText: {
    color: 'white',
  },
  winPercentage: {
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  winPercentageValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
  },
  winPercentageLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  scorersCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scorerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scorerRank: {
    width: 32,
    alignItems: 'center',
  },
  rankNumber: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  scorerAvatar: {
    marginHorizontal: SPACING.sm,
  },
  scorerInfo: {
    flex: 1,
  },
  scorerName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  scorerStats: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  scorerBadge: {
    alignItems: 'center',
  },
  goalsBadge: {
    backgroundColor: COLORS.primary,
  },
  performanceCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  metricItem: {
    marginBottom: SPACING.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  metricValue: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  metricProgress: {
    height: 6,
    borderRadius: 3,
  },
  disciplineCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  disciplineGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  disciplineItem: {
    alignItems: 'center',
  },
  disciplineValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginVertical: SPACING.xs,
  },
  disciplineLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  averagesCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  averageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  averageLabel: {
    ...TEXT_STYLES.body,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  averageValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  placeholderText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.lg,
  },
  placeholderButton: {
    marginTop: SPACING.md,
  },
  detailModal: {
    flex: 1,
    margin: 0,
  },
  blurContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
  },
});

export default TeamStats;