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
  Animated,
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
  Badge,
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

const { width, height } = Dimensions.get('window');

const DiscoverSports = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sports, setSports] = useState([]);
  const [recommendedSports, setRecommendedSports] = useState([]);
  const [trendingSports, setTrendingSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  // Mock sports data
  const mockSports = [
    {
      id: 1,
      name: 'Football',
      category: 'Team Sports',
      difficulty: 'Beginner',
      description: 'The world\'s most popular sport! Kick, pass, and score goals with your team.',
      emoji: '⚽',
      color: '#4CAF50',
      participants: '4 billion',
      ageRange: '5-18',
      equipment: ['Ball', 'Cleats', 'Shin Guards'],
      benefits: ['Teamwork', 'Cardio', 'Coordination'],
      funFact: 'A football match is 90 minutes long!',
      videoCount: 156,
      academiesNearby: 12,
      trending: true,
      recommended: true,
  };

export default DiscoverSports;
    {
      id: 2,
      name: 'Swimming',
      category: 'Individual Sports',
      difficulty: 'Beginner',
      description: 'Dive into the water and swim like a fish! Great for your whole body.',
      emoji: '🏊',
      color: '#2196F3',
      participants: '1.5 billion',
      ageRange: '3-18',
      equipment: ['Swimsuit', 'Goggles', 'Swim Cap'],
      benefits: ['Full Body Workout', 'Low Impact', 'Breathing Control'],
      funFact: 'Swimming is one of the best exercises for your heart!',
      videoCount: 89,
      academiesNearby: 8,
      trending: false,
      recommended: true,
    },
    {
      id: 3,
      name: 'Basketball',
      category: 'Team Sports',
      difficulty: 'Intermediate',
      description: 'Shoot hoops and dribble your way to victory! Perfect for building height and agility.',
      emoji: '🏀',
      color: '#FF9800',
      participants: '450 million',
      ageRange: '6-18',
      equipment: ['Basketball', 'Sneakers', 'Jersey'],
      benefits: ['Height Growth', 'Agility', 'Hand-Eye Coordination'],
      funFact: 'Basketball was invented in 1891 with peach baskets!',
      videoCount: 234,
      academiesNearby: 15,
      trending: true,
      recommended: false,
    },
    {
      id: 4,
      name: 'Tennis',
      category: 'Individual Sports',
      difficulty: 'Intermediate',
      description: 'Serve, volley, and smash your way to becoming a tennis champion!',
      emoji: '🎾',
      color: '#9C27B0',
      participants: '87 million',
      ageRange: '4-18',
      equipment: ['Racket', 'Tennis Balls', 'Tennis Shoes'],
      benefits: ['Reflexes', 'Strategy', 'Endurance'],
      funFact: 'Tennis balls are fuzzy to slow down their flight!',
      videoCount: 167,
      academiesNearby: 6,
      trending: false,
      recommended: true,
    },
    {
      id: 5,
      name: 'Martial Arts',
      category: 'Combat Sports',
      difficulty: 'Beginner',
      description: 'Learn discipline, respect, and self-defense through martial arts!',
      emoji: '🥋',
      color: '#F44336',
      participants: '200 million',
      ageRange: '4-18',
      equipment: ['Uniform (Gi)', 'Belt', 'Protective Gear'],
      benefits: ['Discipline', 'Self-Defense', 'Flexibility'],
      funFact: 'Martial arts can help you focus better in school!',
      videoCount: 143,
      academiesNearby: 9,
      trending: true,
      recommended: false,
    },
    {
      id: 6,
      name: 'Gymnastics',
      category: 'Individual Sports',
      difficulty: 'Advanced',
      description: 'Flip, tumble, and soar through the air with grace and strength!',
      emoji: '🤸',
      color: '#E91E63',
      participants: '15 million',
      ageRange: '3-18',
      equipment: ['Leotard', 'Grips', 'Gymnastics Shoes'],
      benefits: ['Flexibility', 'Strength', 'Balance'],
      funFact: 'Gymnastics helps develop amazing body control!',
      videoCount: 198,
      academiesNearby: 4,
      trending: false,
      recommended: true,
    },
    {
      id: 7,
      name: 'Cricket',
      category: 'Team Sports',
      difficulty: 'Intermediate',
      description: 'Bowl, bat, and field in this exciting sport loved by billions!',
      emoji: '🏏',
      color: '#795548',
      participants: '2.5 billion',
      ageRange: '6-18',
      equipment: ['Bat', 'Ball', 'Pads', 'Helmet'],
      benefits: ['Strategy', 'Patience', 'Hand-Eye Coordination'],
      funFact: 'Cricket matches can last for days!',
      videoCount: 112,
      academiesNearby: 7,
      trending: true,
      recommended: false,
    },
    {
      id: 8,
      name: 'Athletics',
      category: 'Individual Sports',
      difficulty: 'Beginner',
      description: 'Run, jump, and throw your way to becoming a track and field star!',
      emoji: '🏃',
      color: '#607D8B',
      participants: '500 million',
      ageRange: '5-18',
      equipment: ['Running Shoes', 'Athletic Wear', 'Starting Blocks'],
      benefits: ['Speed', 'Endurance', 'Personal Achievement'],
      funFact: 'Usain Bolt can run faster than some cars in the city!',
      videoCount: 176,
      academiesNearby: 11,
      trending: false,
      recommended: true,
    },
  ];

  const categories = ['All', 'Team Sports', 'Individual Sports', 'Combat Sports'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSports(mockSports);
      setRecommendedSports(mockSports.filter(sport => sport.recommended));
      setTrendingSports(mockSports.filter(sport => sport.trending));
      setFavorites([1, 4]); // Mock user favorites
    } catch (error) {
      console.error('Error loading sports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSports();
    setRefreshing(false);
  }, [loadSports]);

  const filteredSports = sports.filter(sport => {
    const matchesSearch = sport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sport.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || sport.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || sport.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const toggleFavorite = (sportId) => {
    setFavorites(prev => 
      prev.includes(sportId) 
        ? prev.filter(id => id !== sportId)
        : [...prev, sportId]
    );
  };

  const handleTrySport = (sport) => {
    Alert.alert(
      `Try ${sport.name}! ${sport.emoji}`,
      `Find academies and coaches near you to start your ${sport.name} journey!`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        {
          text: 'Find Academies',
          onPress: () => {
            Alert.alert('Success!', `Looking for ${sport.name} academies near you...`);
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

  const renderRecommendedSport = ({ item }) => (
    <Card style={[styles.recommendedCard, { borderColor: item.color }]} elevation={4}>
      <TouchableOpacity onPress={() => handleTrySport(item)}>
        <LinearGradient
          colors={[item.color, item.color + '80']}
          style={styles.recommendedGradient}
        >
          <View style={styles.recommendedHeader}>
            <Text style={styles.recommendedEmoji}>{item.emoji}</Text>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <Icon 
                name={favorites.includes(item.id) ? 'favorite' : 'favorite-border'} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.recommendedTitle}>{item.name}</Text>
          <Text style={styles.recommendedDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.recommendedFooter}>
            <View style={styles.recommendedStats}>
              <Text style={styles.recommendedStat}>🎥 {item.videoCount}</Text>
              <Text style={styles.recommendedStat}>🏫 {item.academiesNearby}</Text>
            </View>
            <Chip 
              mode="outlined" 
              textStyle={styles.difficultyChipText}
              style={[styles.difficultyChip, { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.2)' }]}
            >
              {item.difficulty}
            </Chip>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Card>
  );

  const renderTrendingSport = ({ item }) => (
    <TouchableOpacity 
      style={[styles.trendingCard, { backgroundColor: item.color + '20' }]}
      onPress={() => handleTrySport(item)}
    >
      <View style={styles.trendingContent}>
        <View style={styles.trendingHeader}>
          <Text style={styles.trendingEmoji}>{item.emoji}</Text>
          <View style={styles.trendingBadge}>
            <Text style={styles.trendingBadgeText}>🔥 HOT</Text>
          </View>
        </View>
        <Text style={styles.trendingName}>{item.name}</Text>
        <Text style={styles.trendingParticipants}>{item.participants} players</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSport = ({ item }) => (
    <Card style={styles.sportCard} elevation={2}>
      <TouchableOpacity onPress={() => handleTrySport(item)}>
        <View style={styles.sportHeader}>
          <View style={[styles.sportIcon, { backgroundColor: item.color + '20' }]}>
            <Text style={styles.sportEmoji}>{item.emoji}</Text>
          </View>
          <View style={styles.sportInfo}>
            <View style={styles.sportTitleRow}>
              <Text style={styles.sportName}>{item.name}</Text>
              <TouchableOpacity 
                onPress={() => toggleFavorite(item.id)}
                style={styles.heartButton}
              >
                <Icon 
                  name={favorites.includes(item.id) ? 'favorite' : 'favorite-border'} 
                  size={20} 
                  color={favorites.includes(item.id) ? COLORS.error : COLORS.textLight} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.sportCategory}>{item.category}</Text>
            <Text style={styles.sportDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>

        <View style={styles.sportDetails}>
          <View style={styles.detailRow}>
            <Icon name="groups" size={16} color={COLORS.textLight} />
            <Text style={styles.detailText}>Age: {item.ageRange} years</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="sports" size={16} color={COLORS.textLight} />
            <Text style={styles.detailText}>{item.participants} players worldwide</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="school" size={16} color={COLORS.textLight} />
            <Text style={styles.detailText}>{item.academiesNearby} academies nearby</Text>
          </View>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>💪 Benefits:</Text>
          <View style={styles.benefitsChips}>
            {item.benefits.map((benefit, index) => (
              <Chip key={index} compact style={styles.benefitChip}>
                {benefit}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.funFactContainer}>
          <Text style={styles.funFactTitle}>🤔 Fun Fact:</Text>
          <Text style={styles.funFactText}>{item.funFact}</Text>
        </View>

        <View style={styles.sportFooter}>
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentTitle}>🎒 Need:</Text>
            <Text style={styles.equipmentText}>
              {item.equipment.slice(0, 2).join(', ')}{item.equipment.length > 2 ? '...' : ''}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <Chip 
              mode="outlined"
              textStyle={{ color: getDifficultyColor(item.difficulty) }}
              style={{ borderColor: getDifficultyColor(item.difficulty) }}
            >
              {item.difficulty}
            </Chip>
            <Button
              mode="contained"
              onPress={() => handleTrySport(item)}
              style={[styles.tryButton, { backgroundColor: item.color }]}
              labelStyle={{ fontSize: 12 }}
            >
              Try It!
            </Button>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🌟 Discover Sports</Text>
        <Text style={styles.headerSubtitle}>Find your passion and start your journey!</Text>
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
            placeholder="Search sports..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
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

          <Text style={styles.sectionTitle}>Difficulty Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
            {difficulties.map((difficulty) => (
              <Chip
                key={difficulty}
                selected={selectedDifficulty === difficulty}
                onPress={() => setSelectedDifficulty(difficulty)}
                style={[styles.filterChip, selectedDifficulty === difficulty && styles.selectedChip]}
                textStyle={selectedDifficulty === difficulty ? styles.selectedChipText : null}
              >
                {difficulty}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Recommended Sports */}
        {recommendedSports.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Recommended for You</Text>
            <FlatList
              data={recommendedSports}
              renderItem={renderRecommendedSport}
              keyExtractor={(item) => `recommended-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedList}
            />
          </View>
        )}

        {/* Trending Sports */}
        {trendingSports.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
            <FlatList
              data={trendingSports}
              renderItem={renderTrendingSport}
              keyExtractor={(item) => `trending-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingList}
            />
          </View>
        )}

        {/* All Sports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏅 All Sports</Text>
            <Text style={styles.resultsCount}>
              {filteredSports.length} sports
            </Text>
          </View>
          
          {filteredSports.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Icon name="search-off" size={64} color={COLORS.textLight} />
                <Text style={styles.emptyTitle}>No sports found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or filters
                </Text>
              </View>
            </Card>
          ) : (
            <FlatList
              data={filteredSports}
              renderItem={renderSport}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.sportsList}
            />
          )}
        </View>

        {/* Sports Quiz Card */}
        <Card style={styles.quizCard} elevation={3}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.quizGradient}
          >
            <Text style={styles.quizTitle}>🧠 Not Sure What to Try?</Text>
            <Text style={styles.quizSubtitle}>Take our fun sports personality quiz!</Text>
            <Button
              mode="contained"
              onPress={() => Alert.alert('Sports Quiz', 'Feature coming soon!')}
              style={styles.quizButton}
              labelStyle={{ color: '#FF6B6B' }}
            >
              Start Quiz
            </Button>
          </LinearGradient>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="favorite"
        style={styles.fab}
        onPress={() => Alert.alert('My Favorites', `You have ${favorites.length} favorite sports!`)}
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
  recommendedList: {
    paddingHorizontal: SPACING.md,
  },
  recommendedCard: {
    width: width * 0.75,
    marginRight: SPACING.md,
    overflow: 'hidden',
    borderWidth: 2,
  },
  recommendedGradient: {
    padding: SPACING.md,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recommendedEmoji: {
    fontSize: 32,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  recommendedTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginVertical: SPACING.sm,
  },
  recommendedDescription: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.sm,
  },
  recommendedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendedStats: {
    flexDirection: 'row',
  },
  recommendedStat: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginRight: SPACING.md,
  },
  difficultyChip: {
    height: 24,
  },
  difficultyChipText: {
    color: 'white',
    fontSize: 10,
  },
  trendingList: {
    paddingHorizontal: SPACING.md,
  },
  trendingCard: {
    width: 120,
    marginRight: SPACING.sm,
    borderRadius: 12,
    padding: SPACING.sm,
  },
  trendingContent: {
    alignItems: 'center',
  },
  trendingHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  trendingEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  trendingBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendingBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  trendingName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  trendingParticipants: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
  },
  sportsList: {
    paddingHorizontal: SPACING.md,
  },
  sportCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'white',
  },
  sportHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  sportIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sportEmoji: {
    fontSize: 28,
  },
  sportInfo: {
    flex: 1,
  },
  sportTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sportName: {
    ...TEXT_STYLES.h3,
  },
  heartButton: {
    padding: SPACING.xs,
  },
  sportCategory: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  sportDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
  },
  sportDetails: {
    marginBottom: SPACING.md,
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
  benefitsContainer: {
    marginBottom: SPACING.md,
  },
  benefitsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  benefitsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  funFactContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  funFactTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  funFactText: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
  },
  sportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  equipmentText: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tryButton: {
    marginLeft: SPACING.sm,
    minWidth: 80,
  },
  quizCard: {
    margin: SPACING.md,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  quizGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  quizTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  quizSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  quizButton: {
    backgroundColor: 'white',
    minWidth: 120,
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
    backgroundColor: COLORS.error,
  },
};

export default DiscoverSports;