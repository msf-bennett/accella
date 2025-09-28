import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SportsHistory = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedSport, setSelectedSport] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [historyData, setHistoryData] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for sports history
  const mockHistoryData = {
    overview: {
      totalSports: 4,
      totalSessions: 156,
      totalHours: 234,
      currentStreak: 12,
      longestStreak: 28,
      achievements: 23,
    },
    achievements: [
      {
        id: 1,
        title: 'First Goal Scorer',
        sport: 'Football',
        date: '2024-03-15',
        description: 'Scored first goal in academy match',
        icon: 'sports-soccer',
        color: '#4CAF50',
        level: 'Bronze',
        points: 50,
      },
      {
        id: 2,
        title: 'Perfect Attendance',
        sport: 'Swimming',
        date: '2024-02-28',
        description: 'Attended all sessions in February',
        icon: 'pool',
        color: '#2196F3',
        level: 'Gold',
        points: 100,
      },
      {
        id: 3,
        title: 'Skill Master',
        sport: 'Basketball',
        date: '2024-01-20',
        description: 'Mastered dribbling techniques',
        icon: 'sports-basketball',
        color: '#FF9800',
        level: 'Silver',
        points: 75,
      },
      {
        id: 4,
        title: 'Team Captain',
        sport: 'Football',
        date: '2024-04-10',
        description: 'Elected as team captain',
        icon: 'military-tech',
        color: '#9C27B0',
        level: 'Platinum',
        points: 150,
      },
    ],
    timeline: [
      {
        id: 1,
        date: '2024-08-25',
        type: 'training',
        sport: 'Football',
        title: 'Training Session',
        description: 'Advanced ball control drills',
        duration: '2 hours',
        performance: 'Excellent',
        coach: 'Coach Mike',
        notes: 'Great improvement in passing accuracy',
      },
      {
        id: 2,
        date: '2024-08-23',
        type: 'match',
        sport: 'Football',
        title: 'Academy Match vs Eagles FC',
        description: 'Home match victory 3-1',
        duration: '90 minutes',
        performance: 'Outstanding',
        stats: { goals: 1, assists: 2, saves: 0 },
        matchRating: 8.5,
      },
      {
        id: 3,
        date: '2024-08-20',
        type: 'achievement',
        sport: 'Swimming',
        title: 'Personal Best',
        description: 'New 50m freestyle record',
        time: '28.45s',
        previousBest: '29.12s',
        improvement: '0.67s',
      },
      {
        id: 4,
        date: '2024-08-18',
        type: 'training',
        sport: 'Basketball',
        title: 'Skills Development',
        description: 'Shooting and defensive drills',
        duration: '1.5 hours',
        performance: 'Good',
        coach: 'Coach Sarah',
      },
    ],
    progressCharts: {
      football: {
        sessions: [12, 15, 18, 20, 22, 25],
        performance: [6.5, 7.2, 7.8, 8.1, 8.3, 8.5],
      },
      swimming: {
        sessions: [8, 10, 12, 14, 16, 18],
        times: [32.1, 31.5, 30.8, 29.9, 29.2, 28.4],
      },
    },
  };

  const yearOptions = ['2024', '2023', '2022'];
  const sportOptions = ['All', 'Football', 'Swimming', 'Basketball', 'Tennis'];

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = useCallback(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setHistoryData(mockHistoryData);
      setLoading(false);
      
      // Animate screen entrance
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
    }, 1000);
  }, [fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Updated', 'Sports history refreshed successfully! 📊');
    }, 1500);
  }, []);

  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  const handleExportHistory = () => {
    Alert.alert(
      '📊 Export History',
      'Export your child\'s complete sports history as a PDF report?\n\nThis will include all achievements, progress charts, and timeline data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export PDF', onPress: () => console.log('Export sports history') }
      ]
    );
  };

  const renderOverviewCard = () => (
    <Card style={styles.overviewCard} elevation={3}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.overviewGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.overviewTitle}>Sports Journey Overview 🏆</Text>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewNumber}>{historyData.overview?.totalSports}</Text>
            <Text style={styles.overviewLabel}>Sports</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewNumber}>{historyData.overview?.totalSessions}</Text>
            <Text style={styles.overviewLabel}>Sessions</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewNumber}>{historyData.overview?.totalHours}h</Text>
            <Text style={styles.overviewLabel}>Training</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewNumber}>{historyData.overview?.achievements}</Text>
            <Text style={styles.overviewLabel}>Achievements</Text>
          </View>
        </View>
        <View style={styles.streakContainer}>
          <View style={styles.streakItem}>
            <Icon name="local-fire-department" size={20} color="#FFD700" />
            <Text style={styles.streakText}>Current Streak: {historyData.overview?.currentStreak} days</Text>
          </View>
          <Text style={styles.longestStreak}>Longest: {historyData.overview?.longestStreak} days 🔥</Text>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderAchievement = ({ item }) => {
    const getLevelColor = (level) => {
      switch (level) {
        case 'Bronze': return '#CD7F32';
        case 'Silver': return '#C0C0C0';
        case 'Gold': return '#FFD700';
        case 'Platinum': return '#E5E4E2';
        default: return COLORS.primary;
      }
    };

    return (
      <TouchableOpacity onPress={() => handleAchievementPress(item)}>
        <Surface style={styles.achievementCard} elevation={2}>
          <View style={styles.achievementHeader}>
            <View style={[styles.achievementIcon, { backgroundColor: item.color }]}>
              <Icon name={item.icon} size={24} color="white" />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{item.title}</Text>
              <Text style={styles.achievementSport}>{item.sport}</Text>
              <Text style={styles.achievementDate}>
                {new Date(item.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.achievementBadge}>
              <Chip
                mode="flat"
                textStyle={[styles.levelText, { color: getLevelColor(item.level) }]}
                style={[styles.levelChip, { backgroundColor: `${getLevelColor(item.level)}20` }]}
              >
                {item.level}
              </Chip>
              <Text style={styles.pointsText}>+{item.points} pts</Text>
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  const renderTimelineItem = ({ item }) => {
    const getTypeIcon = (type) => {
      switch (type) {
        case 'training': return 'fitness-center';
        case 'match': return 'sports';
        case 'achievement': return 'jump-rope';
        default: return 'event';
      }
    };

    const getTypeColor = (type) => {
      switch (type) {
        case 'training': return COLORS.primary;
        case 'match': return COLORS.success;
        case 'achievement': return '#FFD700';
        default: return COLORS.secondary;
      }
    };

    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineIcon, { backgroundColor: getTypeColor(item.type) }]}>
            <Icon name={getTypeIcon(item.type)} size={20} color="white" />
          </View>
          <View style={styles.timelineLine} />
        </View>
        
        <Card style={styles.timelineCard} elevation={2}>
          <Card.Content style={styles.timelineContent}>
            <View style={styles.timelineHeader}>
              <Text style={styles.timelineTitle}>{item.title}</Text>
              <Chip mode="outlined" compact style={styles.sportChip}>
                {item.sport}
              </Chip>
            </View>
            
            <Text style={styles.timelineDescription}>{item.description}</Text>
            <Text style={styles.timelineDate}>
              {new Date(item.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
            
            {item.duration && (
              <View style={styles.timelineDetail}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={styles.timelineDetailText}>{item.duration}</Text>
              </View>
            )}
            
            {item.performance && (
              <View style={styles.timelineDetail}>
                <Icon name="trending-up" size={16} color={COLORS.success} />
                <Text style={styles.timelineDetailText}>Performance: {item.performance}</Text>
              </View>
            )}
            
            {item.matchRating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Match Rating:</Text>
                <View style={styles.ratingStars}>
                  <Text style={styles.ratingNumber}>{item.matchRating}</Text>
                  <Icon name="star" size={16} color="#FFD700" />
                </View>
              </View>
            )}
            
            {item.stats && (
              <View style={styles.statsContainer}>
                {Object.entries(item.stats).map(([key, value]) => (
                  <View key={key} style={styles.statItem}>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statLabel}>{key}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
    );
  };

  const AchievementModal = () => (
    <Modal
      visible={showAchievementModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAchievementModal(false)}
    >
      <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
        <View style={styles.modalContainer}>
          <Surface style={styles.achievementModal} elevation={5}>
            {selectedAchievement && (
              <>
                <LinearGradient
                  colors={[selectedAchievement.color, `${selectedAchievement.color}80`]}
                  style={styles.modalHeader}
                >
                  <IconButton
                    icon="close"
                    size={24}
                    iconColor="white"
                    onPress={() => setShowAchievementModal(false)}
                    style={styles.closeButton}
                  />
                  <View style={styles.modalIconContainer}>
                    <Icon name={selectedAchievement.icon} size={60} color="white" />
                  </View>
                  <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>
                  <Text style={styles.modalSport}>{selectedAchievement.sport}</Text>
                </LinearGradient>
                
                <View style={styles.modalContent}>
                  <Text style={styles.modalDescription}>
                    {selectedAchievement.description}
                  </Text>
                  
                  <View style={styles.modalDetails}>
                    <View style={styles.modalDetailItem}>
                      <Icon name="event" size={20} color={COLORS.primary} />
                      <Text style={styles.modalDetailText}>
                        {new Date(selectedAchievement.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailItem}>
                      <Icon name="jump-rope" size={20} color="#FFD700" />
                      <Text style={styles.modalDetailText}>
                        {selectedAchievement.level} Achievement
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailItem}>
                      <Icon name="stars" size={20} color={COLORS.success} />
                      <Text style={styles.modalDetailText}>
                        +{selectedAchievement.points} Points Earned
                      </Text>
                    </View>
                  </View>
                  
                  <Button
                    mode="contained"
                    style={styles.shareButton}
                    buttonColor={selectedAchievement.color}
                    icon="share"
                    onPress={() => Alert.alert('Share Achievement', 'Share this achievement with friends and family!')}
                  >
                    Share Achievement
                  </Button>
                </View>
              </>
            )}
          </Surface>
        </View>
      </BlurView>
    </Modal>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
        <View style={styles.modalContainer}>
          <Surface style={styles.filterModal} elevation={5}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter History 📊</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowFilters(false)}
              />
            </View>
            
            <ScrollView style={styles.filterContent}>
              <Text style={styles.filterSectionTitle}>Year</Text>
              <View style={styles.chipContainer}>
                {yearOptions.map((year) => (
                  <Chip
                    key={year}
                    selected={selectedYear === year}
                    onPress={() => setSelectedYear(year)}
                    style={[
                      styles.filterChip,
                      selectedYear === year && styles.selectedChip
                    ]}
                  >
                    {year}
                  </Chip>
                ))}
              </View>
              
              <Text style={styles.filterSectionTitle}>Sport</Text>
              <View style={styles.chipContainer}>
                {sportOptions.map((sport) => (
                  <Chip
                    key={sport}
                    selected={selectedSport === sport}
                    onPress={() => setSelectedSport(sport)}
                    style={[
                      styles.filterChip,
                      selectedSport === sport && styles.selectedChip
                    ]}
                  >
                    {sport}
                  </Chip>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedYear('2024');
                  setSelectedSport('All');
                }}
                style={styles.clearButton}
              >
                Reset
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                buttonColor={COLORS.primary}
                style={styles.applyButton}
              >
                Apply
              </Button>
            </View>
          </Surface>
        </View>
      </BlurView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingGradient}>
          <Icon name="history" size={60} color="white" />
          <Text style={styles.loadingTitle}>Loading Sports History</Text>
          <Text style={styles.loadingSubtitle}>Gathering your athletic journey 📊</Text>
          <ProgressBar
            indeterminate
            color="white"
            style={styles.loadingProgress}
          />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Sports History 📊</Text>
        <Text style={styles.headerSubtitle}>Track your athletic journey and achievements</Text>
        
        <Searchbar
          placeholder="Search history, achievements, sports..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
        
        <View style={styles.quickFilters}>
          <Chip
            selected={selectedYear !== '2024'}
            onPress={() => setShowFilters(true)}
            icon="date-range"
            style={styles.filterChip}
          >
            {selectedYear}
          </Chip>
          <Chip
            selected={selectedSport !== 'All'}
            onPress={() => setShowFilters(true)}
            icon="sports"
            style={styles.filterChip}
          >
            {selectedSport}
          </Chip>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        <Animated.View
          style={[
            styles.animatedContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Overview Card */}
          {renderOverviewCard()}

          {/* Recent Achievements */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏆 Recent Achievements</Text>
              <TouchableOpacity onPress={() => Alert.alert('View All', 'Navigate to full achievements list')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={historyData.achievements?.slice(0, 3)}
              renderItem={renderAchievement}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.achievementsList}
            />
          </View>

          {/* Quick Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Quick Stats</Text>
            <View style={styles.quickStatsGrid}>
              <Surface style={styles.statCard} elevation={2}>
                <Icon name="event" size={30} color={COLORS.primary} />
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </Surface>
              <Surface style={styles.statCard} elevation={2}>
                <Icon name="trending-up" size={30} color={COLORS.success} />
                <Text style={styles.statNumber}>8.2</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </Surface>
              <Surface style={styles.statCard} elevation={2}>
                <Icon name="timer" size={30} color={COLORS.secondary} />
                <Text style={styles.statNumber}>24h</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </Surface>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Recent Activity</Text>
            <FlatList
              data={historyData.timeline?.slice(0, 5)}
              renderItem={renderTimelineItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.timelineContainer}
            />
          </View>
        </Animated.View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="file-download"
        onPress={handleExportHistory}
        color="white"
      />

      <AchievementModal />
      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  loadingSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  loadingProgress: {
    marginTop: SPACING.xl,
    width: 200,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.lg,
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  quickFilters: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
  },
  animatedContent: {
    flex: 1,
    paddingVertical: SPACING.lg,
  },
  overviewCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: SPACING.lg,
  },
  overviewTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewNumber: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  overviewLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  streakText: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  longestStreak: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  viewAllText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  achievementsList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  achievementCard: {
    borderRadius: 12,
    backgroundColor: 'white',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  achievementTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  achievementSport: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  achievementDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  achievementBadge: {
    alignItems: 'center',
  },
  levelChip: {
    marginBottom: SPACING.xs,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  timelineContainer: {
    paddingHorizontal: SPACING.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  timelineCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  timelineContent: {
    padding: SPACING.md,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  timelineTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  sportChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
  },
  timelineDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  timelineDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  timelineDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  timelineDetailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  ratingLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  blurContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  achievementModal: {
    backgroundColor: 'white',
    borderRadius: 25,
    maxWidth: width - SPACING.lg * 2,
    width: '100%',
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
  modalIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSport: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  modalDetails: {
    marginBottom: SPACING.xl,
  },
  modalDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  modalDetailText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
  },
  shareButton: {
    borderRadius: 12,
  },
  filterModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.6,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    maxHeight: height * 0.4,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearButton: {
    flex: 1,
    borderColor: COLORS.textSecondary,
  },
  applyButton: {
    flex: 1,
  },
});

export default SportsHistory;