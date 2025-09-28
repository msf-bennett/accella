import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  FlatList,
  RefreshControl,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  ProgressBar,
  IconButton,
  FAB,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SkillChallenges = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { challenges, userProgress } = useSelector(state => state.training);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const bounceAnim = new Animated.Value(0.9);
  const rotateAnim = new Animated.Value(0);

  // Component state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [userStats] = useState({
    level: 12,
    totalPoints: 2450,
    streak: 7,
    completedChallenges: 23,
    badgesEarned: 8,
  });

  const categories = ['All', 'Dribbling 🏃', 'Passing ⚽', 'Shooting 🥅', 'Defense 🛡️', 'Fitness 💪'];

  const [mockChallenges] = useState([
    {
      id: '1',
      title: 'Cone Weaving Master',
      description: 'Weave through 10 cones without touching any!',
      category: 'Dribbling 🏃',
      difficulty: 'Beginner',
      points: 50,
      timeLimit: '2 minutes',
      completed: true,
      progress: 100,
      attempts: 3,
      bestTime: '1:23',
      icon: 'sports-soccer',
      color: '#4CAF50',
      badge: '🏆',
    },
    {
      id: '2',
      title: 'Precision Passes',
      description: 'Hit 8 out of 10 targets with your passes',
      category: 'Passing ⚽',
      difficulty: 'Intermediate',
      points: 75,
      timeLimit: '3 minutes',
      completed: false,
      progress: 60,
      attempts: 2,
      bestScore: '6/10',
      icon: 'my-location',
      color: '#2196F3',
      badge: '🎯',
    },
    {
      id: '3',
      title: 'Speed Demon',
      description: 'Sprint 40 meters in under 6 seconds',
      category: 'Fitness 💪',
      difficulty: 'Advanced',
      points: 100,
      timeLimit: 'No limit',
      completed: false,
      progress: 25,
      attempts: 5,
      bestTime: '6.2s',
      icon: 'flash-on',
      color: '#FF9800',
      badge: '⚡',
    },
    {
      id: '4',
      title: 'Goal Machine',
      description: 'Score 5 goals from different angles',
      category: 'Shooting 🥅',
      difficulty: 'Intermediate',
      points: 80,
      timeLimit: '5 minutes',
      completed: true,
      progress: 100,
      attempts: 4,
      bestScore: '5/5',
      icon: 'sports-soccer',
      color: '#E91E63',
      badge: '⚽',
    },
    {
      id: '5',
      title: 'Tackle Champion',
      description: 'Successfully tackle 7 out of 10 attempts',
      category: 'Defense 🛡️',
      difficulty: 'Advanced',
      points: 90,
      timeLimit: '4 minutes',
      completed: false,
      progress: 40,
      attempts: 1,
      bestScore: '4/10',
      icon: 'security',
      color: '#795548',
      badge: '🛡️',
    },
    {
      id: '6',
      title: 'Juggling Pro',
      description: 'Keep the ball in the air for 30 touches',
      category: 'Dribbling 🏃',
      difficulty: 'Expert',
      points: 150,
      timeLimit: 'No limit',
      completed: false,
      progress: 10,
      attempts: 8,
      bestRecord: '18 touches',
      icon: 'sports-soccer',
      color: '#9C27B0',
      badge: '🤹',
    },
  ]);

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
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotate animation for level badge
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  }, []);

  const handleChallengePress = useCallback((challenge) => {
    Vibration.vibrate(50);
    
    if (challenge.completed) {
      Alert.alert(
        `${challenge.badge} Challenge Complete!`,
        `Great job! You earned ${challenge.points} points!\n\nBest Performance:\n${challenge.bestTime || challenge.bestScore || challenge.bestRecord}`,
        [
          { text: 'View Details', onPress: () => navigation.navigate('ChallengeDetails', { challenge }) },
          { text: 'Try Again', onPress: () => startChallenge(challenge) },
        ]
      );
    } else {
      startChallenge(challenge);
    }
  }, [navigation]);

  const startChallenge = useCallback((challenge) => {
    Alert.alert(
      `Start ${challenge.title}? ${challenge.badge}`,
      `${challenge.description}\n\nDifficulty: ${challenge.difficulty}\nPoints: ${challenge.points}\nTime Limit: ${challenge.timeLimit}`,
      [
        { text: 'Not Ready', style: 'cancel' },
        { 
          text: 'Let\'s Go! 🚀', 
          onPress: () => {
            // Navigate to challenge execution screen
            Alert.alert('Feature Coming Soon', 'Challenge execution screen is being developed! 🏗️');
          }
        },
      ]
    );
  }, []);

  const filteredChallenges = mockChallenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || challenge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      case 'Expert': return '#9C27B0';
      default: return COLORS.gray;
    }
  };

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statsGradient}>
        <View style={styles.statsContent}>
          <View style={styles.levelSection}>
            <Animated.View
              style={[
                styles.levelBadge,
                {
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.levelNumber}>{userStats.level}</Text>
            </Animated.View>
            <Text style={styles.levelText}>Level Champion</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.totalPoints}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak 🔥</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.completedChallenges}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.badgesEarned}</Text>
              <Text style={styles.statLabel}>Badges 🏆</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderChallengeCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.challengeCardContainer,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, index * 10],
            })
          }],
        }
      ]}
    >
      <TouchableOpacity
        onPress={() => handleChallengePress(item)}
        activeOpacity={0.8}
      >
        <Card style={[styles.challengeCard, item.completed && styles.completedCard]}>
          <View style={styles.challengeHeader}>
            <LinearGradient
              colors={[item.color, `${item.color}80`]}
              style={styles.challengeIcon}
            >
              <Icon name={item.icon} size={28} color="#fff" />
            </LinearGradient>
            
            <View style={styles.challengeInfo}>
              <View style={styles.challengeTitleRow}>
                <Text style={styles.challengeTitle}>{item.title}</Text>
                {item.completed && (
                  <View style={styles.completeBadge}>
                    <Icon name="check-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </View>
              <Text style={styles.challengeDescription}>{item.description}</Text>
              
              <View style={styles.challengeMeta}>
                <Chip
                  style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}
                  textStyle={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}
                >
                  {item.difficulty}
                </Chip>
                <Text style={styles.pointsText}>{item.points} pts</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Progress: {item.progress}%
              </Text>
              <Text style={styles.attemptsText}>
                Attempts: {item.attempts}
              </Text>
            </View>
            <ProgressBar
              progress={item.progress / 100}
              color={item.completed ? '#4CAF50' : item.color}
              style={styles.progressBar}
            />
            
            {item.bestTime && (
              <Text style={styles.bestPerformance}>
                Best Time: {item.bestTime}
              </Text>
            )}
            {item.bestScore && (
              <Text style={styles.bestPerformance}>
                Best Score: {item.bestScore}
              </Text>
            )}
            {item.bestRecord && (
              <Text style={styles.bestPerformance}>
                Best: {item.bestRecord}
              </Text>
            )}
          </View>

          <View style={styles.challengeFooter}>
            <View style={styles.timeLimit}>
              <Icon name="timer" size={16} color={COLORS.textSecondary} />
              <Text style={styles.timeLimitText}>{item.timeLimit}</Text>
            </View>
            <Text style={styles.challengeBadge}>{item.badge}</Text>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Skill Challenges 🏆</Text>
          <IconButton
            icon="leaderboard"
            iconColor="#fff"
            size={24}
            onPress={() => Alert.alert('Feature Coming Soon', 'Leaderboards coming soon! 📊')}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim }
          ]}
        >
          {/* Stats Card */}
          {renderStatsCard()}

          {/* Search Bar */}
          <Searchbar
            placeholder="Search challenges..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedCategoryChip
                ]}
                textStyle={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText
                ]}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>

          {/* Challenges List */}
          <View style={styles.challengesSection}>
            <Text style={styles.sectionTitle}>
              {filteredChallenges.length} Challenge{filteredChallenges.length !== 1 ? 's' : ''} Available
            </Text>
            <FlatList
              data={filteredChallenges}
              renderItem={renderChallengeCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Custom challenge creation coming soon! 🎯')}
        color="#fff"
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  statsCard: {
    marginBottom: SPACING.lg,
    elevation: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelSection: {
    alignItems: 'center',
    marginRight: SPACING.xl,
  },
  levelBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  levelNumber: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    fontWeight: 'bold',
  },
  levelText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: SPACING.lg,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.lightGray,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.text,
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  challengesSection: {
    flex: 1,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  challengeCardContainer: {
    marginBottom: SPACING.md,
  },
  challengeCard: {
    elevation: 4,
    borderRadius: 12,
    padding: SPACING.md,
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  challengeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  challengeTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    flex: 1,
  },
  completeBadge: {
    marginLeft: SPACING.sm,
  },
  challengeDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyChip: {
    height: 28,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  pointsText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  attemptsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  bestPerformance: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLimit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLimitText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  challengeBadge: {
    fontSize: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default SkillChallenges;