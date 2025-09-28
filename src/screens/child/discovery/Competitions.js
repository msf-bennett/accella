import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e1e8ed',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textLight },
  small: { fontSize: 12, color: COLORS.textLight },
};

const { width } = Dimensions.get('window');

const Competitions = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAge, setSelectedAge] = useState('All Ages');
  const [competitions, setCompetitions] = useState([]);
  const [featuredCompetitions, setFeaturedCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  // Mock competitions data
  const mockCompetitions = [
    {
      id: 1,
      title: 'Youth Football League 2024',
      sport: 'Football',
      ageGroup: 'U12',
      location: 'City Sports Complex',
      startDate: '2024-09-15',
      endDate: '2024-12-15',
      participants: 156,
      maxParticipants: 200,
      registrationDeadline: '2024-08-30',
      entryFee: 50,
      prize: '$500 Trophy',
      difficulty: 'Beginner',
      image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=Football',
      description: 'Fun and competitive youth football league for beginners.',
      organizer: 'City Sports Academy',
      badges: ['🏆 Trophy', '🎖️ Medals', '⭐ Certificates'],
      registered: false,
    },
    {
      id: 2,
      title: 'Swimming Championship',
      sport: 'Swimming',
      ageGroup: 'U10',
      location: 'Aquatic Center',
      startDate: '2024-10-05',
      endDate: '2024-10-07',
      participants: 89,
      maxParticipants: 120,
      registrationDeadline: '2024-09-20',
      entryFee: 30,
      prize: 'Gold Medals',
      difficulty: 'Intermediate',
      image: 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=Swimming',
      description: 'Regional swimming championship for young athletes.',
      organizer: 'Swim Club Pro',
      badges: ['🥇 Gold Medal', '🏊 Certificate'],
      registered: true,
    },
    {
      id: 3,
      title: 'Basketball Skills Challenge',
      sport: 'Basketball',
      ageGroup: 'U14',
      location: 'Basketball Arena',
      startDate: '2024-11-10',
      endDate: '2024-11-12',
      participants: 124,
      maxParticipants: 160,
      registrationDeadline: '2024-10-25',
      entryFee: 40,
      prize: 'Trophies & Scholarships',
      difficulty: 'Advanced',
      image: 'https://via.placeholder.com/300x200/FF9800/ffffff?text=Basketball',
      description: 'Test your basketball skills in this exciting challenge.',
      organizer: 'Elite Basketball Academy',
      badges: ['🏆 Trophy', '🎓 Scholarship', '⭐ Recognition'],
      registered: false,
    },
    {
      id: 4,
      title: 'Tennis Junior Open',
      sport: 'Tennis',
      ageGroup: 'U16',
      location: 'Tennis Club',
      startDate: '2024-09-28',
      endDate: '2024-09-30',
      participants: 64,
      maxParticipants: 80,
      registrationDeadline: '2024-09-15',
      entryFee: 60,
      prize: 'Racket & Trophy',
      difficulty: 'Intermediate',
      image: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Tennis',
      description: 'Junior tennis tournament for aspiring champions.',
      organizer: 'Premier Tennis Club',
      badges: ['🏆 Trophy', '🎾 Equipment'],
      registered: false,
    },
  ];

  const categories = ['All', 'Football', 'Basketball', 'Swimming', 'Tennis', 'Athletics'];
  const ageGroups = ['All Ages', 'U8', 'U10', 'U12', 'U14', 'U16'];

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCompetitions(mockCompetitions);
      setFeaturedCompetitions(mockCompetitions.slice(0, 2));
    } catch (error) {
      console.error('Error loading competitions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCompetitions();
    setRefreshing(false);
  }, [loadCompetitions]);

  const filteredCompetitions = competitions.filter(competition => {
    const matchesSearch = competition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competition.sport.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || competition.sport === selectedCategory;
    const matchesAge = selectedAge === 'All Ages' || competition.ageGroup === selectedAge;
    
    return matchesSearch && matchesCategory && matchesAge;
  });

  const handleRegister = (competition) => {
    Alert.alert(
      'Register for Competition',
      `Would you like to register for ${competition.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: () => {
            // Update competition registration status
            const updatedCompetitions = competitions.map(comp =>
              comp.id === competition.id 
                ? { ...comp, registered: true, participants: comp.participants + 1 }
                : comp
            );
            setCompetitions(updatedCompetitions);
            
            Alert.alert(
              'Success! 🎉',
              'You have successfully registered for the competition!'
            );
          }
        }
      ]
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const renderFeaturedCompetition = ({ item }) => (
    <Card style={styles.featuredCard} elevation={4}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.featuredGradient}
      >
        <View style={styles.featuredContent}>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>⭐ FEATURED</Text>
          </View>
          <Text style={styles.featuredTitle}>{item.title}</Text>
          <Text style={styles.featuredSubtitle}>{item.sport} • {item.ageGroup}</Text>
          <Text style={styles.featuredLocation}>📍 {item.location}</Text>
          <View style={styles.featuredStats}>
            <Text style={styles.featuredStat}>{item.participants}/{item.maxParticipants} joined</Text>
            <Text style={styles.featuredStat}>💰 ${item.entryFee}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.featuredButton}
          onPress={() => handleRegister(item)}
        >
          <Text style={styles.featuredButtonText}>
            {item.registered ? '✅ Registered' : 'Join Now'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </Card>
  );

  const renderCompetition = ({ item }) => (
    <Card style={styles.competitionCard} elevation={2}>
      <View style={styles.competitionHeader}>
        <Avatar.Icon 
          size={40} 
          icon="trophy" 
          style={{ backgroundColor: getDifficultyColor(item.difficulty) }}
        />
        <View style={styles.competitionInfo}>
          <Text style={styles.competitionTitle}>{item.title}</Text>
          <Text style={styles.competitionSubtitle}>{item.sport} • {item.ageGroup}</Text>
        </View>
        <Chip 
          mode="outlined"
          textStyle={{ fontSize: 10 }}
          style={{ backgroundColor: getDifficultyColor(item.difficulty) + '20' }}
        >
          {item.difficulty}
        </Chip>
      </View>

      <View style={styles.competitionDetails}>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={16} color={COLORS.textLight} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="event" size={16} color={COLORS.textLight} />
          <Text style={styles.detailText}>{item.startDate} - {item.endDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="people" size={16} color={COLORS.textLight} />
          <Text style={styles.detailText}>{item.participants}/{item.maxParticipants} participants</Text>
        </View>
      </View>

      <ProgressBar 
        progress={item.participants / item.maxParticipants} 
        color={COLORS.primary}
        style={styles.progressBar}
      />

      <View style={styles.badgesContainer}>
        {item.badges.map((badge, index) => (
          <Chip key={index} compact style={styles.badge}>
            {badge}
          </Chip>
        ))}
      </View>

      <View style={styles.competitionFooter}>
        <View>
          <Text style={styles.prizeText}>🏆 {item.prize}</Text>
          <Text style={styles.feeText}>Entry: ${item.entryFee}</Text>
        </View>
        <Button
          mode={item.registered ? "outlined" : "contained"}
          onPress={() => handleRegister(item)}
          style={styles.registerButton}
          disabled={item.registered}
        >
          {item.registered ? 'Registered ✅' : 'Register'}
        </Button>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🏆 Competitions</Text>
        <Text style={styles.headerSubtitle}>Discover amazing competitions near you!</Text>
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search competitions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Sport Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
            {categories.map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={[styles.filterChip, selectedCategory === category && styles.selectedChip]}
                textStyle={selectedCategory === category ? styles.selectedChipText : null}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Age Groups</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
            {ageGroups.map((age) => (
              <Chip
                key={age}
                selected={selectedAge === age}
                onPress={() => setSelectedAge(age)}
                style={[styles.filterChip, selectedAge === age && styles.selectedChip]}
                textStyle={selectedAge === age ? styles.selectedChipText : null}
              >
                {age}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Featured Competitions */}
        {featuredCompetitions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Featured Competitions</Text>
            <FlatList
              data={featuredCompetitions}
              renderItem={renderFeaturedCompetition}
              keyExtractor={(item) => `featured-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* All Competitions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏅 All Competitions</Text>
            <Text style={styles.resultsCount}>
              {filteredCompetitions.length} found
            </Text>
          </View>
          
          {filteredCompetitions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Icon name="search-off" size={64} color={COLORS.textLight} />
                <Text style={styles.emptyTitle}>No competitions found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or filters
                </Text>
              </View>
            </Card>
          ) : (
            <FlatList
              data={filteredCompetitions}
              renderItem={renderCompetition}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.competitionsList}
            />
          )}
        </View>

        {/* Quick Stats */}
        <Card style={styles.statsCard} elevation={2}>
          <Text style={styles.statsTitle}>🎯 Your Competition Journey</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Registered</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Trophies</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Create Competition', 'Feature coming soon!')}
        color="white"
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
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.background,
  },
  filtersSection: {
    backgroundColor: 'white',
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterChips: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectedChipText: {
    color: 'white',
  },
  section: {
    marginVertical: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  resultsCount: {
    ...TEXT_STYLES.caption,
  },
  featuredList: {
    paddingHorizontal: SPACING.md,
  },
  featuredCard: {
    width: width * 0.8,
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  featuredGradient: {
    padding: SPACING.md,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  featuredContent: {
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  featuredBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  featuredSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.xs,
  },
  featuredLocation: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.sm,
  },
  featuredStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredStat: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  featuredButton: {
    backgroundColor: 'white',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: SPACING.sm,
  },
  featuredButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  competitionsList: {
    paddingHorizontal: SPACING.md,
  },
  competitionCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'white',
  },
  competitionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  competitionInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  competitionTitle: {
    ...TEXT_STYLES.h3,
    fontSize: 16,
  },
  competitionSubtitle: {
    ...TEXT_STYLES.caption,
  },
  competitionDetails: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  progressBar: {
    marginBottom: SPACING.sm,
    height: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  badge: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  competitionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizeText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  feeText: {
    ...TEXT_STYLES.caption,
  },
  registerButton: {
    minWidth: 100,
  },
  statsCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'white',
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
  },
  emptyCard: {
    margin: SPACING.md,
    padding: SPACING.xl,
    backgroundColor: 'white',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
  },
};

export default Competitions;
