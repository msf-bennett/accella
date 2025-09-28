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

const ExploreTraining = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [featuredPrograms, setFeaturedPrograms] = useState([]);
  const [quickDrills, setQuickDrills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState([]);

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  // Mock training programs data
  const mockTrainingPrograms = [
    {
      id: 1,
      title: 'Fun Football Fundamentals',
      sport: 'Football',
      type: 'Skill Development',
      level: 'Beginner',
      duration: '4 weeks',
      sessionsPerWeek: 3,
      sessionDuration: '45 mins',
      description: 'Learn the basics of football with fun games and activities!',
      emoji: '⚽',
      color: '#4CAF50',
      coach: 'Coach Sarah',
      coachRating: 4.9,
      participants: 234,
      ageRange: '6-10',
      skills: ['Dribbling', 'Passing', 'Shooting', 'Teamwork'],
      equipment: ['Football', 'Cones', 'Bibs'],
      price: 80,
      videoCount: 24,
      completionRate: 89,
      featured: true,
      achievements: ['⚽ Ball Master', '🎯 Sharp Shooter', '👥 Team Player'],
      preview: 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=Football',
    },
    {
      id: 2,
      title: 'Swimming Stroke Mastery',
      sport: 'Swimming',
      type: 'Technique',
      level: 'Intermediate',
      duration: '6 weeks',
      sessionsPerWeek: 2,
      sessionDuration: '60 mins',
      description: 'Perfect your swimming strokes and build endurance in the water!',
      emoji: '🏊',
      color: '#2196F3',
      coach: 'Coach Mike',
      coachRating: 4.8,
      participants: 156,
      ageRange: '8-14',
      skills: ['Freestyle', 'Backstroke', 'Breathing', 'Endurance'],
      equipment: ['Swimsuit', 'Goggles', 'Kickboard'],
      price: 120,
      videoCount: 18,
      completionRate: 92,
      featured: true,
      achievements: ['🏊 Stroke Expert', '💨 Speed Demon', '⏱️ Endurance King'],
      preview: 'https://via.placeholder.com/300x200/2196F3/ffffff?text=Swimming',
    },
    {
      id: 3,
      title: 'Basketball Skills Challenge',
      sport: 'Basketball',
      type: 'Skill Development',
      level: 'Beginner',
      duration: '5 weeks',
      sessionsPerWeek: 3,
      sessionDuration: '50 mins',
      description: 'Dribble, shoot, and score your way to basketball greatness!',
      emoji: '🏀',
      color: '#FF9800',
      coach: 'Coach Alex',
      coachRating: 4.7,
      participants: 189,
      ageRange: '7-12',
      skills: ['Dribbling', 'Shooting', 'Defense', 'Teamwork'],
      equipment: ['Basketball', 'Sneakers', 'Water Bottle'],
      price: 100,
      videoCount: 30,
      completionRate: 85,
      featured: false,
      achievements: ['🏀 Ball Handler', '🎯 Sharpshooter', '🛡️ Defender'],
      preview: 'https://via.placeholder.com/300x200/FF9800/ffffff?text=Basketball',
    },
    {
      id: 4,
      title: 'Tennis Technique Builder',
      sport: 'Tennis',
      type: 'Technique',
      level: 'Intermediate',
      duration: '8 weeks',
      sessionsPerWeek: 2,
      sessionDuration: '55 mins',
      description: 'Master your forehand, backhand, and serve with expert guidance!',
      emoji: '🎾',
      color: '#9C27B0',
      coach: 'Coach Emma',
      coachRating: 4.9,
      participants: 78,
      ageRange: '9-15',
      skills: ['Forehand', 'Backhand', 'Serve', 'Footwork'],
      equipment: ['Tennis Racket', 'Tennis Balls', 'Court Shoes'],
      price: 150,
      videoCount: 22,
      completionRate: 94,
      featured: false,
      achievements: ['🎾 Technique Master', '🎯 Ace Server', '👟 Quick Feet'],
      preview: 'https://via.placeholder.com/300x200/9C27B0/ffffff?text=Tennis',
    },
    {
      id: 5,
      title: 'Martial Arts Discipline',
      sport: 'Martial Arts',
      type: 'Character Building',
      level: 'Beginner',
      duration: '10 weeks',
      sessionsPerWeek: 2,
      sessionDuration: '45 mins',
      description: 'Build discipline, respect, and self-confidence through martial arts!',
      emoji: '🥋',
      color: '#F44336',
      coach: 'Sensei John',
      coachRating: 4.8,
      participants: 145,
      ageRange: '5-16',
      skills: ['Discipline', 'Respect', 'Self-Defense', 'Focus'],
      equipment: ['Gi (Uniform)', 'Belt', 'Protective Gear'],
      price: 130,
      videoCount: 35,
      completionRate: 91,
      featured: true,
      achievements: ['🥋 Disciplined Warrior', '🙏 Respectful Student', '🧘 Focused Mind'],
      preview: 'https://via.placeholder.com/300x200/F44336/ffffff?text=Martial+Arts',
    },
    {
      id: 6,
      title: 'Athletics Speed & Agility',
      sport: 'Athletics',
      type: 'Fitness',
      level: 'Intermediate',
      duration: '6 weeks',
      sessionsPerWeek: 4,
      sessionDuration: '40 mins',
      description: 'Get faster and more agile with our exciting athletics program!',
      emoji: '🏃',
      color: '#607D8B',
      coach: 'Coach Lisa',
      coachRating: 4.6,
      participants: 198,
      ageRange: '8-16',
      skills: ['Speed', 'Agility', 'Endurance', 'Coordination'],
      equipment: ['Running Shoes', 'Athletic Wear', 'Water Bottle'],
      price: 90,
      videoCount: 28,
      completionRate: 87,
      featured: false,
      achievements: ['💨 Speed Racer', '🦘 Agility Expert', '💪 Endurance Champion'],
      preview: 'https://via.placeholder.com/300x200/607D8B/ffffff?text=Athletics',
    },
  ];

  // Mock quick drills data
  const mockQuickDrills = [
    {
      id: 1,
      title: 'Ball Juggling Challenge',
      sport: 'Football',
      duration: '10 mins',
      difficulty: 'Easy',
      emoji: '⚽',
      color: '#4CAF50',
      equipment: ['Football'],
      steps: 3,
    },
    {
      id: 2,
      title: 'Free Throw Practice',
      sport: 'Basketball',
      duration: '15 mins',
      difficulty: 'Medium',
      emoji: '🏀',
      color: '#FF9800',
      equipment: ['Basketball', 'Hoop'],
      steps: 5,
    },
    {
      id: 3,
      title: 'Pool Breathing Exercise',
      sport: 'Swimming',
      duration: '8 mins',
      difficulty: 'Easy',
      emoji: '🏊',
      color: '#2196F3',
      equipment: ['Pool', 'Goggles'],
      steps: 4,
    },
    {
      id: 4,
      title: 'Wall Rally Practice',
      sport: 'Tennis',
      duration: '12 mins',
      difficulty: 'Medium',
      emoji: '🎾',
      color: '#9C27B0',
      equipment: ['Racket', 'Ball', 'Wall'],
      steps: 4,
    },
  ];

  const sports = ['All', 'Football', 'Basketball', 'Swimming', 'Tennis', 'Martial Arts', 'Athletics'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const types = ['All', 'Skill Development', 'Technique', 'Fitness', 'Character Building'];

  useEffect(() => {
    loadTrainingPrograms();
  }, []);

  const loadTrainingPrograms = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTrainingPrograms(mockTrainingPrograms);
      setFeaturedPrograms(mockTrainingPrograms.filter(program => program.featured));
      setQuickDrills(mockQuickDrills);
      setBookmarked([1, 5]); // Mock bookmarked programs
    } catch (error) {
      console.error('Error loading training programs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrainingPrograms();
    setRefreshing(false);
  }, [loadTrainingPrograms]);

  const filteredPrograms = trainingPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'All' || program.sport === selectedSport;
    const matchesLevel = selectedLevel === 'All' || program.level === selectedLevel;
    const matchesType = selectedType === 'All' || program.type === selectedType;
    
    return matchesSearch && matchesSport && matchesLevel && matchesType;
  });

  const toggleBookmark = (programId) => {
    setBookmarked(prev => 
      prev.includes(programId) 
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const handleJoinProgram = (program) => {
    Alert.alert(
      `Join ${program.title}! ${program.emoji}`,
      `Ready to start your ${program.duration} journey with Coach ${program.coach.split(' ')[1]}?`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        {
          text: `Join for $${program.price}`,
          onPress: () => {
            Alert.alert('Success! 🎉', 'You have successfully joined the training program!');
          }
        }
      ]
    );
  };

  const handleStartDrill = (drill) => {
    Alert.alert(
      `Start ${drill.title}! ${drill.emoji}`,
      `This ${drill.duration} drill will help improve your ${drill.sport.toLowerCase()} skills!`,
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Start Training',
          onPress: () => {
            Alert.alert('Let\'s Go! 💪', 'Starting your quick drill session...');
          }
        }
      ]
    );
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return COLORS.success;
      case 'Medium': return COLORS.warning;
      case 'Hard': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const renderFeaturedProgram = ({ item }) => (
    <Card style={[styles.featuredCard, { borderColor: item.color }]} elevation={4}>
      <TouchableOpacity onPress={() => handleJoinProgram(item)}>
        <LinearGradient
          colors={[item.color, item.color + '80']}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredHeader}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>⭐ FEATURED</Text>
            </View>
            <TouchableOpacity 
              style={styles.bookmarkButton}
              onPress={() => toggleBookmark(item.id)}
            >
              <Icon 
                name={bookmarked.includes(item.id) ? 'bookmark' : 'bookmark-border'} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.featuredContent}>
            <Text style={styles.featuredEmoji}>{item.emoji}</Text>
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <Text style={styles.featuredSport}>{item.sport} • {item.level}</Text>
            <Text style={styles.featuredDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>

          <View style={styles.featuredFooter}>
            <View style={styles.featuredStats}>
              <View style={styles.featuredStat}>
                <Icon name="schedule" size={16} color="white" />
                <Text style={styles.featuredStatText}>{item.duration}</Text>
              </View>
              <View style={styles.featuredStat}>
                <Icon name="people" size={16} color="white" />
                <Text style={styles.featuredStatText}>{item.participants}</Text>
              </View>
              <View style={styles.featuredStat}>
                <Icon name="star" size={16} color="white" />
                <Text style={styles.featuredStatText}>{item.coachRating}</Text>
              </View>
            </View>
            <Text style={styles.featuredPrice}>${item.price}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Card>
  );

  const renderQuickDrill = ({ item }) => (
    <TouchableOpacity 
      style={[styles.drillCard, { backgroundColor: item.color + '20' }]}
      onPress={() => handleStartDrill(item)}
    >
      <View style={styles.drillHeader}>
        <Text style={styles.drillEmoji}>{item.emoji}</Text>
        <Chip 
          mode="outlined" 
          compact
          textStyle={{ fontSize: 10, color: getDifficultyColor(item.difficulty) }}
          style={{ borderColor: getDifficultyColor(item.difficulty) }}
        >
          {item.difficulty}
        </Chip>
      </View>
      <Text style={styles.drillTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.drillDetails}>
        <View style={styles.drillDetail}>
          <Icon name="timer" size={14} color={COLORS.textLight} />
          <Text style={styles.drillDetailText}>{item.duration}</Text>
        </View>
        <View style={styles.drillDetail}>
          <Icon name="list" size={14} color={COLORS.textLight} />
          <Text style={styles.drillDetailText}>{item.steps} steps</Text>
        </View>
      </View>
      <Text style={styles.drillSport}>{item.sport}</Text>
    </TouchableOpacity>
  );

  const renderTrainingProgram = ({ item }) => (
    <Card style={styles.programCard} elevation={2}>
      <TouchableOpacity onPress={() => handleJoinProgram(item)}>
        <View style={styles.programHeader}>
          <View style={[styles.programIcon, { backgroundColor: item.color + '20' }]}>
            <Text style={styles.programEmoji}>{item.emoji}</Text>
          </View>
          <View style={styles.programInfo}>
            <View style={styles.programTitleRow}>
              <Text style={styles.programTitle}>{item.title}</Text>
              <TouchableOpacity 
                onPress={() => toggleBookmark(item.id)}
                style={styles.bookmarkIconButton}
              >
                <Icon 
                  name={bookmarked.includes(item.id) ? 'bookmark' : 'bookmark-border'} 
                  size={20} 
                  color={bookmarked.includes(item.id) ? item.color : COLORS.textLight} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.programSport}>{item.sport} • {item.type}</Text>
            <Text style={styles.programDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>

        <View style={styles.programDetails}>
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color={COLORS.textLight} />
            <Text style={styles.detailText}>
              {item.duration} • {item.sessionsPerWeek}x/week • {item.sessionDuration}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="person" size={16} color={COLORS.textLight} />
            <Text style={styles.detailText}>Coach {item.coach.split(' ')[1]} ⭐ {item.coachRating}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="groups" size={16} color={COLORS.textLight} />
            <Text style={styles.detailText}>Age {item.ageRange} • {item.participants} joined</Text>
          </View>
        </View>

        <View style={styles.skillsContainer}>
          <Text style={styles.skillsTitle}>🎯 You'll Learn:</Text>
          <View style={styles.skillsChips}>
            {item.skills.slice(0, 3).map((skill, index) => (
              <Chip key={index} compact style={styles.skillChip}>
                {skill}
              </Chip>
            ))}
            {item.skills.length > 3 && (
              <Chip compact style={styles.moreSkillsChip}>
                +{item.skills.length - 3} more
              </Chip>
            )}
          </View>
        </View>

        <View style={styles.achievementsContainer}>
          <Text style={styles.achievementsTitle}>🏆 Achievements:</Text>
          <View style={styles.achievementsRow}>
            {item.achievements.slice(0, 3).map((achievement, index) => (
              <Text key={index} style={styles.achievementBadge}>
                {achievement}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Completion Rate</Text>
            <Text style={styles.progressValue}>{item.completionRate}%</Text>
          </View>
          <ProgressBar 
            progress={item.completionRate / 100} 
            color={item.color}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.programFooter}>
          <View style={styles.programPricing}>
            <Text style={styles.programPrice}>${item.price}</Text>
            <Text style={styles.programPriceNote}>for {item.duration}</Text>
          </View>
          <View style={styles.programActions}>
            <Chip 
              mode="outlined"
              textStyle={{ color: getLevelColor(item.level) }}
              style={{ borderColor: getLevelColor(item.level) }}
              compact
            >
              {item.level}
            </Chip>
            <Button
              mode="contained"
              onPress={() => handleJoinProgram(item)}
              style={[styles.joinButton, { backgroundColor: item.color }]}
              labelStyle={{ fontSize: 12 }}
            >
              Join Program
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
        <Text style={styles.headerTitle}>🏋️ Explore Training</Text>
        <Text style={styles.headerSubtitle}>Discover amazing training programs & quick drills!</Text>
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
            placeholder="Search training programs..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Sports</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
            {sports.map((sport) => (
              <Chip
                key={sport}
                selected={selectedSport === sport}
                onPress={() => setSelectedSport(sport)}
                style={[styles.filterChip, selectedSport === sport && styles.selectedChip]}
                textStyle={selectedSport === sport ? styles.selectedChipText : null}
              >
                {sport}
              </Chip>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
            {levels.map((level) => (
              <Chip
                key={level}
                selected={selectedLevel === level}
                onPress={() => setSelectedLevel(level)}
                style={[styles.filterChip, selectedLevel === level && styles.selectedChip]}
                textStyle={selectedLevel === level ? styles.selectedChipText : null}
              >
                {level}
              </Chip>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Training Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
            {types.map((type) => (
              <Chip
                key={type}
                selected={selectedType === type}
                onPress={() => setSelectedType(type)}
                style={[styles.filterChip, selectedType === type && styles.selectedChip]}
                textStyle={selectedType === type ? styles.selectedChipText : null}
              >
                {type}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Quick Drills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Drills (5-15 mins)</Text>
          <FlatList
            data={quickDrills}
            renderItem={renderQuickDrill}
            keyExtractor={(item) => `drill-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.drillsList}
          />
        </View>

        {/* Featured Programs */}
        {featuredPrograms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Featured Training Programs</Text>
            <FlatList
              data={featuredPrograms}
              renderItem={renderFeaturedProgram}
              keyExtractor={(item) => `featured-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* All Training Programs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 All Training Programs</Text>
            <Text style={styles.resultsCount}>
              {filteredPrograms.length} found
            </Text>
          </View>
          
          {filteredPrograms.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Icon name="search-off" size={64} color={COLORS.textLight} />
                <Text style={styles.emptyTitle}>No programs found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or filters
                </Text>
              </View>
            </Card>
          ) : (
            <FlatList
              data={filteredPrograms}
              renderItem={renderTrainingProgram}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.programsList}
            />
          )}
        </View>

        {/* Personal Training Stats */}
        <Card style={styles.statsCard} elevation={2}>
          <Text style={styles.statsTitle}>📊 Your Training Journey</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Active Programs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>47</Text>
              <Text style={styles.statLabel}>Sessions Done</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Skills Learned</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="bookmark"
        style={styles.fab}
        onPress={() => Alert.alert('My Bookmarks', `You have ${bookmarked.length} saved programs!`)}
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
    backgroundColor: COLORS.surface,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectedChipText: {
    color: 'white',
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultsCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  // Featured Programs Styles
  featuredList: {
    paddingVertical: SPACING.sm,
  },
  featuredCard: {
    width: width * 0.8,
    marginRight: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
  },
  featuredGradient: {
    padding: SPACING.md,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featuredBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  featuredBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featuredEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  featuredTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  featuredSport: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.sm,
  },
  featuredDescription: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredStats: {
    flexDirection: 'row',
  },
  featuredStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featuredStatText: {
    color: 'white',
    fontSize: 12,
    marginLeft: SPACING.xs,
  },
  featuredPrice: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  // Quick Drills Styles
  drillsList: {
    paddingVertical: SPACING.sm,
  },
  drillCard: {
    width: 160,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  drillEmoji: {
    fontSize: 24,
  },
  drillTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    minHeight: 40,
  },
  drillDetails: {
    marginBottom: SPACING.sm,
  },
  drillDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  drillDetailText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
  },
  drillSport: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Training Programs Styles
  programsList: {
    paddingBottom: SPACING.xl,
  },
  programCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  programHeader: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  programIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  programEmoji: {
    fontSize: 28,
  },
  programInfo: {
    flex: 1,
  },
  programTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  programTitle: {
    ...TEXT_STYLES.h3,
    flex: 1,
    marginRight: SPACING.sm,
  },
  bookmarkIconButton: {
    padding: SPACING.xs,
  },
  programSport: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  programDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  programDetails: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  skillsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  skillsTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  skillsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  moreSkillsChip: {
    backgroundColor: COLORS.primary + '20',
  },
  achievementsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  achievementsTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  achievementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementBadge: {
    fontSize: 12,
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  progressContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  progressValue: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  programPricing: {
    flex: 1,
  },
  programPrice: {
    ...TEXT_STYLES.h3,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  programPriceNote: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
  },
  programActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  joinButton: {
    borderRadius: 20,
  },
  // Stats Card Styles
  statsCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
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
    ...TEXT_STYLES.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  // Empty State Styles
  emptyCard: {
    padding: SPACING.xl,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default ExploreTraining;