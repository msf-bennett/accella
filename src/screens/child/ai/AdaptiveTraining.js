import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const AdaptiveTraining = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('football');
  const [searchQuery, setSearchQuery] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  // Redux state
  const { user, isLoading } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleSportSelect = useCallback((sport) => {
    setSelectedSport(sport);
    Vibration.vibrate(30);
  }, []);

  const handleTrainingStart = useCallback((trainingType) => {
    Alert.alert(
      "🚀 AI Training Ready!",
      `Starting your personalized ${trainingType} training session. This feature is being enhanced with advanced AI capabilities!`,
      [{ text: "Got it! 🎯", style: "default" }]
    );
  }, []);

  const handleAIAnalysis = useCallback(() => {
    Alert.alert(
      "🤖 AI Analysis",
      "Our AI is analyzing your performance data to create the perfect training plan just for you! This advanced feature is coming soon.",
      [{ text: "Awesome! 🌟", style: "default" }]
    );
  }, []);

  // Mock data for AI recommendations
  const aiRecommendations = [
    {
      id: 1,
      title: "Speed & Agility Boost 🏃‍♂️",
      difficulty: "Beginner",
      duration: "20 min",
      points: 150,
      description: "Perfect for improving your quick footwork!",
      icon: "flash-on",
      color: "#FF6B6B",
      progress: 0.7,
    },
    {
      id: 2,
      title: "Ball Control Mastery ⚽",
      difficulty: "Intermediate",
      duration: "25 min",
      points: 200,
      description: "Take your dribbling skills to the next level!",
      icon: "sports-soccer",
      color: "#4ECDC4",
      progress: 0.4,
    },
    {
      id: 3,
      title: "Strength Building Fun 💪",
      difficulty: "Beginner",
      duration: "15 min",
      points: 120,
      description: "Build muscle with fun exercises!",
      icon: "fitness-center",
      color: "#45B7D1",
      progress: 0.2,
    },
  ];

  const sports = [
    { name: 'football', icon: 'sports-football', label: 'Football' },
    { name: 'basketball', icon: 'sports-basketball', label: 'Basketball' },
    { name: 'tennis', icon: 'sports-tennis', label: 'Tennis' },
    { name: 'soccer', icon: 'sports-soccer', label: 'Soccer' },
    { name: 'swimming', icon: 'pool', label: 'Swimming' },
  ];

  const currentLevel = 15;
  const nextLevelPoints = 2500;
  const currentPoints = 1850;
  const progressToNext = currentPoints / nextLevelPoints;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
                AI Training Hub 🤖
              </Text>
              <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
                Personalized just for you!
              </Text>
            </View>
            <Surface style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{currentLevel}</Text>
            </Surface>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              🎯 {currentPoints}/{nextLevelPoints} XP to Level {currentLevel + 1}
            </Text>
            <ProgressBar
              progress={progressToNext}
              color={COLORS.success}
              style={styles.progressBar}
            />
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary, COLORS.secondary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* AI Analysis Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Card style={styles.aiAnalysisCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.aiAnalysisGradient}
            >
              <View style={styles.aiAnalysisContent}>
                <Icon name="psychology" size={40} color="white" />
                <View style={styles.aiAnalysisText}>
                  <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                    🧠 Get AI Analysis
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: 'white', opacity: 0.9 }]}>
                    Let AI create your perfect training plan
                  </Text>
                </View>
                <IconButton
                  icon="arrow-forward"
                  iconColor="white"
                  size={24}
                  onPress={handleAIAnalysis}
                />
              </View>
            </LinearGradient>
          </Card>
        </Animated.View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search training exercises... 🔍"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={TEXT_STYLES.body}
          />
        </View>

        {/* Sport Selection */}
        <View style={styles.sectionContainer}>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
            🏆 Choose Your Sport
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.sportsContainer}
          >
            {sports.map((sport) => (
              <TouchableOpacity
                key={sport.name}
                onPress={() => handleSportSelect(sport.name)}
                activeOpacity={0.7}
              >
                <Surface
                  style={[
                    styles.sportChip,
                    selectedSport === sport.name && styles.selectedSportChip
                  ]}
                >
                  <Icon 
                    name={sport.icon} 
                    size={24} 
                    color={selectedSport === sport.name ? 'white' : COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.sportLabel,
                      selectedSport === sport.name && styles.selectedSportLabel
                    ]}
                  >
                    {sport.label}
                  </Text>
                </Surface>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AI Recommendations */}
        <View style={styles.sectionContainer}>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
            🌟 AI Recommendations
          </Text>
          {aiRecommendations.map((item, index) => (
            <Animated.View
              key={item.id}
              style={{
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })
                }]
              }}
            >
              <Card style={[styles.recommendationCard, { marginTop: index > 0 ? SPACING.md : 0 }]}>
                <View style={styles.cardContent}>
                  <LinearGradient
                    colors={[item.color, `${item.color}80`]}
                    style={styles.iconContainer}
                  >
                    <Icon name={item.icon} size={24} color="white" />
                  </LinearGradient>
                  
                  <View style={styles.cardInfo}>
                    <Text style={[TEXT_STYLES.h4, styles.cardTitle]}>
                      {item.title}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, styles.cardDescription]}>
                      {item.description}
                    </Text>
                    
                    <View style={styles.cardMeta}>
                      <Chip 
                        mode="outlined" 
                        textStyle={styles.chipText}
                        style={styles.difficultyChip}
                      >
                        {item.difficulty}
                      </Chip>
                      <Text style={[TEXT_STYLES.caption, styles.metaText]}>
                        ⏱️ {item.duration} • 🎯 {item.points} pts
                      </Text>
                    </View>

                    {/* Progress bar for ongoing trainings */}
                    {item.progress > 0 && (
                      <View style={styles.progressSection}>
                        <Text style={[TEXT_STYLES.caption, styles.progressLabel]}>
                          Progress: {Math.round(item.progress * 100)}% 📈
                        </Text>
                        <ProgressBar
                          progress={item.progress}
                          color={item.color}
                          style={styles.cardProgressBar}
                        />
                      </View>
                    )}
                  </View>

                  <IconButton
                    icon="play-arrow"
                    iconColor="white"
                    size={20}
                    style={[styles.playButton, { backgroundColor: item.color }]}
                    onPress={() => handleTrainingStart(item.title)}
                  />
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.sectionContainer}>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
            📊 Your Stats
          </Text>
          <View style={styles.statsContainer}>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>🔥 12</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>⭐ 85</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>🏆 24</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </Surface>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="auto-awesome"
        label="AI Suggest"
        style={styles.fab}
        onPress={handleAIAnalysis}
        color="white"
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  levelBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressContainer: {
    marginTop: SPACING.sm,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    marginBottom: SPACING.xs,
    opacity: 0.9,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  aiAnalysisCard: {
    marginTop: -SPACING.xl,
    marginBottom: SPACING.lg,
    elevation: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiAnalysisGradient: {
    padding: SPACING.lg,
  },
  aiAnalysisContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAnalysisText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  searchContainer: {
    marginBottom: SPACING.lg,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  sportsContainer: {
    flexDirection: 'row',
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 25,
    backgroundColor: 'white',
    elevation: 2,
  },
  selectedSportChip: {
    backgroundColor: COLORS.primary,
  },
  sportLabel: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontSize: 14,
  },
  selectedSportLabel: {
    color: 'white',
  },
  recommendationCard: {
    backgroundColor: 'white',
    elevation: 4,
    borderRadius: 16,
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  difficultyChip: {
    height: 28,
    marginRight: SPACING.sm,
  },
  chipText: {
    fontSize: 12,
  },
  metaText: {
    color: COLORS.textSecondary,
  },
  progressSection: {
    marginTop: SPACING.xs,
  },
  progressLabel: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  cardProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  playButton: {
    margin: 0,
    width: 40,
    height: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default AdaptiveTraining;