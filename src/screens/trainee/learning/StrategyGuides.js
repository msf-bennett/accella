import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import {
  Card,
  Searchbar,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Modal,
  FAB,
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const StrategyGuides = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedGuides, setBookmarkedGuides] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userProgress = useSelector(state => state.learning.strategyProgress || {});

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const sportsCategories = [
    { id: 'all', name: 'All Sports', icon: 'sports', color: COLORS.primary, count: 24 },
    { id: 'football', name: 'Football', icon: 'sports-football', color: '#2ecc71', count: 8 },
    { id: 'basketball', name: 'Basketball', icon: 'sports-basketball', color: '#e74c3c', count: 6 },
    { id: 'tennis', name: 'Tennis', icon: 'sports-tennis', color: '#f39c12', count: 4 },
    { id: 'soccer', name: 'Soccer', icon: 'sports-soccer', color: '#3498db', count: 6 },
  ];

  const levelFilters = [
    { id: 'all', name: 'All Levels', icon: 'equalizer' },
    { id: 'beginner', name: 'Beginner', icon: 'trending-up' },
    { id: 'intermediate', name: 'Intermediate', icon: 'show-chart' },
    { id: 'advanced', name: 'Advanced', icon: 'assessment' },
  ];

  const strategyGuides = [
    {
      id: 1,
      sport: 'football',
      title: 'Offensive Line Strategies',
      subtitle: 'Mastering Pass Protection',
      description: 'Learn advanced blocking schemes and protection patterns for quarterbacks',
      level: 'advanced',
      duration: '25 min',
      diagrams: 12,
      videos: 4,
      points: 150,
      image: '🏈',
      tags: ['Blocking', 'Pass Protection', 'O-Line'],
      rating: 4.8,
      studiedBy: 2847,
      keyPoints: ['Zone blocking concepts', 'Slide protection', 'Hot routes'],
      difficulty: 'Advanced',
      completion: userProgress['offensive-line'] || 0,
      isNew: true,
    },
    {
      id: 2,
      sport: 'basketball',
      title: 'Pick and Roll Mastery',
      subtitle: 'Creating Scoring Opportunities',
      description: 'Master the most effective play in basketball with variations and counters',
      level: 'intermediate',
      duration: '18 min',
      diagrams: 8,
      videos: 6,
      points: 120,
      image: '🏀',
      tags: ['Pick & Roll', 'Offense', 'Screening'],
      rating: 4.9,
      studiedBy: 3521,
      keyPoints: ['Setting effective screens', 'Reading the defense', 'Roll vs. pop decisions'],
      difficulty: 'Intermediate',
      completion: userProgress['pick-roll'] || 0,
      isNew: false,
    },
    {
      id: 3,
      sport: 'soccer',
      title: 'Defensive Pressing Systems',
      subtitle: 'High Press Tactics',
      description: 'Implement coordinated pressing to win possession in dangerous areas',
      level: 'advanced',
      duration: '30 min',
      diagrams: 15,
      videos: 8,
      points: 180,
      image: '⚽',
      tags: ['Defense', 'Pressing', 'Tactics'],
      rating: 4.7,
      studiedBy: 1923,
      keyPoints: ['Trigger moments', 'Coordinated movement', 'Pressing traps'],
      difficulty: 'Advanced',
      completion: userProgress['pressing-systems'] || 0,
      isNew: true,
    },
    {
      id: 4,
      sport: 'tennis',
      title: 'Serve and Volley Strategy',
      subtitle: 'Net Play Fundamentals',
      description: 'Master the aggressive serve and volley approach for doubles and singles',
      level: 'intermediate',
      duration: '22 min',
      diagrams: 6,
      videos: 5,
      points: 110,
      image: '🎾',
      tags: ['Serve', 'Volley', 'Net Play'],
      rating: 4.6,
      studiedBy: 1456,
      keyPoints: ['First volley positioning', 'Approach shots', 'Court coverage'],
      difficulty: 'Intermediate',
      completion: userProgress['serve-volley'] || 0,
      isNew: false,
    },
    {
      id: 5,
      sport: 'football',
      title: 'Red Zone Offense',
      subtitle: 'Scoring in Tight Spaces',
      description: 'Maximize touchdown efficiency with specialized red zone plays and concepts',
      level: 'beginner',
      duration: '15 min',
      diagrams: 10,
      videos: 3,
      points: 90,
      image: '🏈',
      tags: ['Red Zone', 'Scoring', 'Short Yardage'],
      rating: 4.8,
      studiedBy: 2156,
      keyPoints: ['Fade routes', 'Pick plays', 'Goal line stands'],
      difficulty: 'Beginner',
      completion: userProgress['red-zone'] || 0,
      isNew: false,
    },
    {
      id: 6,
      sport: 'basketball',
      title: 'Zone Defense Breakdown',
      subtitle: 'Attacking Zone Coverage',
      description: 'Strategies to exploit gaps and weaknesses in zone defensive schemes',
      level: 'intermediate',
      duration: '20 min',
      diagrams: 9,
      videos: 4,
      points: 125,
      image: '🏀',
      tags: ['Zone Defense', 'Offense', 'Ball Movement'],
      rating: 4.7,
      studiedBy: 2834,
      keyPoints: ['Gap recognition', 'Ball reversal', 'High-low concepts'],
      difficulty: 'Intermediate',
      completion: userProgress['zone-breakdown'] || 0,
      isNew: false,
    },
    {
      id: 7,
      sport: 'soccer',
      title: 'Counter Attack Principles',
      subtitle: 'Fast Break Soccer',
      description: 'Turn defensive situations into quick scoring opportunities',
      level: 'beginner',
      duration: '16 min',
      diagrams: 7,
      videos: 5,
      points: 95,
      image: '⚽',
      tags: ['Counter Attack', 'Transition', 'Speed'],
      rating: 4.9,
      studiedBy: 3247,
      keyPoints: ['Quick transitions', 'Space utilization', 'Clinical finishing'],
      difficulty: 'Beginner',
      completion: userProgress['counter-attack'] || 0,
      isNew: false,
    },
    {
      id: 8,
      sport: 'tennis',
      title: 'Court Positioning Strategy',
      subtitle: 'Tactical Court Coverage',
      description: 'Master court positioning for both offensive and defensive situations',
      level: 'advanced',
      duration: '28 min',
      diagrams: 11,
      videos: 6,
      points: 160,
      image: '🎾',
      tags: ['Positioning', 'Court Coverage', 'Strategy'],
      rating: 4.8,
      studiedBy: 1789,
      keyPoints: ['Recovery patterns', 'Angle creation', 'Defensive positioning'],
      difficulty: 'Advanced',
      completion: userProgress['court-positioning'] || 0,
      isNew: true,
    },
  ];

  const filteredGuides = strategyGuides.filter(guide => {
    const matchesSport = selectedSport === 'all' || guide.sport === selectedSport;
    const matchesLevel = selectedLevel === 'all' || guide.level === selectedLevel;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSport && matchesLevel && matchesSearch;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleGuidePress = (guide) => {
    setSelectedGuide(guide);
    setModalVisible(true);
  };

  const handleStartGuide = (guide) => {
    setModalVisible(false);
    Alert.alert(
      'Start Strategy Guide',
      `Ready to master "${guide.title}"? This comprehensive guide includes ${guide.diagrams} diagrams and ${guide.videos} videos. You'll earn ${guide.points} points!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Learning', 
          onPress: () => {
            Alert.alert('Feature Coming Soon', 'Interactive strategy guides with diagrams and videos are being developed!');
          }
        },
      ]
    );
  };

  const toggleBookmark = (guideId) => {
    setBookmarkedGuides(prev => 
      prev.includes(guideId) 
        ? prev.filter(id => id !== guideId)
        : [...prev, guideId]
    );
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.secondary;
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const animateFAB = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[TEXT_STYLES.heading, styles.headerTitle]}>
              Strategy Guides 🎯
            </Text>
            <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
              Master winning tactics and strategies
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Icon 
              name={viewMode === 'grid' ? 'view-list' : 'view-module'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
        
        <Surface style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Guides Studied</Text>
              <Text style={[TEXT_STYLES.heading, styles.statValue]}>
                {Object.keys(userProgress).length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Strategy Points</Text>
              <Text style={[TEXT_STYLES.heading, styles.statValue]}>
                {Object.values(userProgress).reduce((sum, progress) => sum + (progress === 100 ? 100 : 0), 0)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Bookmarks</Text>
              <Text style={[TEXT_STYLES.heading, styles.statValue]}>
                {bookmarkedGuides.length} 📌
              </Text>
            </View>
          </View>
        </Surface>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchSection}>
      <Searchbar
        placeholder="Search strategy guides..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
        inputStyle={TEXT_STYLES.body}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filtersScroll}
      >
        {sportsCategories.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportFilter,
              selectedSport === sport.id && { backgroundColor: sport.color }
            ]}
            onPress={() => setSelectedSport(sport.id)}
          >
            <Icon 
              name={sport.icon} 
              size={20} 
              color={selectedSport === sport.id ? 'white' : sport.color} 
            />
            <Text style={[
              TEXT_STYLES.caption,
              styles.sportFilterText,
              selectedSport === sport.id && { color: 'white' }
            ]}>
              {sport.name}
            </Text>
            <Badge
              style={[
                styles.countBadge,
                selectedSport === sport.id && { backgroundColor: 'rgba(255,255,255,0.2)' }
              ]}
              size={18}
            >
              {sport.count}
            </Badge>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.levelFiltersContainer}
        style={styles.levelFiltersScroll}
      >
        {levelFilters.map((level) => (
          <Chip
            key={level.id}
            selected={selectedLevel === level.id}
            onPress={() => setSelectedLevel(level.id)}
            style={[
              styles.levelChip,
              selectedLevel === level.id && { backgroundColor: COLORS.primary }
            ]}
            textStyle={[
              TEXT_STYLES.caption,
              selectedLevel === level.id && { color: 'white' }
            ]}
            icon={() => (
              <Icon 
                name={level.icon} 
                size={14} 
                color={selectedLevel === level.id ? 'white' : COLORS.primary} 
              />
            )}
          >
            {level.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderGuideCard = (guide, index) => {
    const isBookmarked = bookmarkedGuides.includes(guide.id);
    
    return (
      <Animated.View
        key={guide.id}
        style={[
          viewMode === 'grid' ? styles.gridCard : styles.listCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Card 
          style={[
            viewMode === 'grid' ? styles.guideCard : styles.guideListCard,
            guide.isNew && styles.newGuideCard
          ]} 
          onPress={() => handleGuidePress(guide)}
        >
          {guide.isNew && (
            <Surface style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </Surface>
          )}
          
          <Card.Content style={styles.guideContent}>
            <View style={styles.guideHeader}>
              <Text style={styles.guideEmoji}>{guide.image}</Text>
              <View style={styles.guideMeta}>
                <Chip
                  style={[styles.levelChipSmall, { backgroundColor: getLevelColor(guide.level) }]}
                  textStyle={styles.levelTextSmall}
                >
                  {guide.difficulty}
                </Chip>
                <IconButton
                  icon={isBookmarked ? 'bookmark' : 'bookmark-border'}
                  size={18}
                  iconColor={isBookmarked ? COLORS.secondary : COLORS.textSecondary}
                  onPress={() => toggleBookmark(guide.id)}
                  style={styles.bookmarkButton}
                />
              </View>
            </View>
            
            <Text style={[TEXT_STYLES.subheading, styles.guideTitle]}>
              {guide.title}
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.guideSubtitle]}>
              {guide.subtitle}
            </Text>
            <Text style={[TEXT_STYLES.body, styles.guideDescription]} numberOfLines={2}>
              {guide.description}
            </Text>
            
            <View style={styles.guideStats}>
              <View style={styles.statRow}>
                <Icon name="schedule" size={14} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, styles.statText]}>{guide.duration}</Text>
              </View>
              <View style={styles.statRow}>
                <Icon name="assessment" size={14} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, styles.statText]}>{guide.diagrams} diagrams</Text>
              </View>
              <View style={styles.statRow}>
                <Icon name="play-circle" size={14} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, styles.statText]}>{guide.videos} videos</Text>
              </View>
            </View>
            
            <View style={styles.guideFooter}>
              <View style={styles.ratingSection}>
                <Icon name="star" size={16} color={COLORS.secondary} />
                <Text style={[TEXT_STYLES.caption, styles.ratingText]}>
                  {guide.rating} ({guide.studiedBy.toLocaleString()})
                </Text>
              </View>
              
              {guide.completion > 0 && (
                <View style={styles.progressSection}>
                  <Text style={[TEXT_STYLES.caption, styles.progressText]}>
                    {guide.completion}%
                  </Text>
                  <ProgressBar
                    progress={guide.completion / 100}
                    color={COLORS.success}
                    style={styles.progressBar}
                  />
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedGuide && (
          <Surface style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalEmoji}>{selectedGuide.image}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                />
              </View>
              
              <Text style={[TEXT_STYLES.heading, styles.modalTitle]}>
                {selectedGuide.title}
              </Text>
              <Text style={[TEXT_STYLES.subheading, styles.modalSubtitle]}>
                {selectedGuide.subtitle}
              </Text>
              <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
                {selectedGuide.description}
              </Text>
              
              <View style={styles.modalStatsGrid}>
                <Surface style={styles.modalStatItem}>
                  <Icon name="schedule" size={20} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.caption, styles.modalStatLabel]}>Duration</Text>
                  <Text style={[TEXT_STYLES.body, styles.modalStatValue]}>
                    {selectedGuide.duration}
                  </Text>
                </Surface>
                <Surface style={styles.modalStatItem}>
                  <Icon name="assessment" size={20} color={COLORS.secondary} />
                  <Text style={[TEXT_STYLES.caption, styles.modalStatLabel]}>Diagrams</Text>
                  <Text style={[TEXT_STYLES.body, styles.modalStatValue]}>
                    {selectedGuide.diagrams}
                  </Text>
                </Surface>
                <Surface style={styles.modalStatItem}>
                  <Icon name="play-circle" size={20} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.caption, styles.modalStatLabel]}>Videos</Text>
                  <Text style={[TEXT_STYLES.body, styles.modalStatValue]}>
                    {selectedGuide.videos}
                  </Text>
                </Surface>
                <Surface style={styles.modalStatItem}>
                  <Icon name="star" size={20} color={getLevelColor(selectedGuide.level)} />
                  <Text style={[TEXT_STYLES.caption, styles.modalStatLabel]}>Points</Text>
                  <Text style={[TEXT_STYLES.body, styles.modalStatValue]}>
                    {selectedGuide.points}
                  </Text>
                </Surface>
              </View>
              
              <View style={styles.keyPointsSection}>
                <Text style={[TEXT_STYLES.subheading, styles.keyPointsTitle]}>
                  Key Learning Points:
                </Text>
                {selectedGuide.keyPoints.map((point, index) => (
                  <View key={index} style={styles.keyPointItem}>
                    <Icon name="check-circle" size={16} color={COLORS.success} />
                    <Text style={[TEXT_STYLES.body, styles.keyPointText]}>
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: COLORS.primary }]}
                onPress={() => handleStartGuide(selectedGuide)}
              >
                <Text style={[TEXT_STYLES.buttonText, styles.startButtonText]}>
                  Start Strategy Guide 🚀
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Surface>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
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
        {renderSearchAndFilters()}
        
        <View style={styles.guidesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[TEXT_STYLES.subheading, styles.sectionTitle]}>
              Strategy Guides ({filteredGuides.length})
            </Text>
            <Chip 
              style={styles.filterIndicator}
              icon="tune"
              onPress={() => setShowFilters(!showFilters)}
            >
              Filters
            </Chip>
          </View>
          
          {filteredGuides.length > 0 ? (
            <View style={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}>
              {filteredGuides.map((guide, index) => renderGuideCard(guide, index))}
            </View>
          ) : (
            <Surface style={styles.emptyState}>
              <Icon name="search-off" size={48} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.body, styles.emptyText]}>
                No strategy guides found matching your criteria
              </Text>
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSelectedSport('all');
                  setSelectedLevel('all');
                  setSearchQuery('');
                }}
              >
                <Text style={[TEXT_STYLES.buttonText, styles.clearFiltersText]}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            </Surface>
          )}
        </View>
      </ScrollView>
      
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
        <FAB
          style={[styles.fab, { backgroundColor: COLORS.primary }]}
          icon="bookmark"
          onPress={() => {
            animateFAB();
            Alert.alert('Bookmarks', 'Feature coming soon! You\'ll be able to view all your bookmarked guides here.');
          }}
        />
      </Animated.View>
      
      {renderModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  viewToggle: {
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsCard: {
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  filtersScroll: {
    marginHorizontal: -SPACING.md,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sportFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  sportFilterText: {
    marginLeft: SPACING.xs,
    marginRight: SPACING.xs,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
  },
  levelFiltersScroll: {
    marginHorizontal: -SPACING.md,
  },
  levelFiltersContainer: {
    paddingHorizontal: SPACING.md,
  },
  levelChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  guidesSection: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
  },
  filterIndicator: {
    backgroundColor: COLORS.surface,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listContainer: {
    width: '100%',
  },
  gridCard: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  listCard: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  guideCard: {
    elevation: 3,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  guideListCard: {
    elevation: 3,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  newGuideCard: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    zIndex: 1,
    elevation: 5,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  guideContent: {
    padding: SPACING.sm,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  guideEmoji: {
    fontSize: 28,
  },
  guideMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelChipSmall: {
    height: 24,
    marginRight: SPACING.xs,
  },
  levelTextSmall: {
    color: 'white',
    fontSize: 10,
  },
  bookmarkButton: {
    margin: 0,
    padding: 0,
  },
  guideTitle: {
    marginBottom: SPACING.xs,
    color: COLORS.text,
    lineHeight: 20,
  },
  guideSubtitle: {
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  guideDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  guideStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  guideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  progressSection: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  progressText: {
    color: COLORS.success,
    marginBottom: 2,
    fontSize: 11,
  },
  progressBar: {
    width: 50,
    height: 3,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 12,
    marginTop: SPACING.lg,
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  clearFiltersText: {
    color: 'white',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.md,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalEmoji: {
    fontSize: 40,
  },
  closeButton: {
    margin: 0,
  },
  modalTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  modalDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  modalStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  modalStatItem: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 1,
    marginBottom: SPACING.sm,
  },
  modalStatLabel: {
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },
  modalStatValue: {
    marginTop: SPACING.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  keyPointsSection: {
    marginBottom: SPACING.xl,
  },
  keyPointsTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  keyPointText: {
    marginLeft: SPACING.sm,
    color: COLORS.text,
    flex: 1,
  },
  startButton: {
    borderRadius: 25,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    elevation: 3,
  },
  startButtonText: {
    color: 'white',
    fontWeight: '600',
  },
};

export default StrategyGuides;