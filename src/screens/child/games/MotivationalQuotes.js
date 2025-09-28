import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Vibration,
  Alert,
  Share,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const MotivationalQuotes = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, dailyStreak, achievements } = useSelector((state) => state.user);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteQuotes, setFavoriteQuotes] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [dailyQuoteViewed, setDailyQuoteViewed] = useState(false);
  const [streakBonus, setStreakBonus] = useState(false);

  // Motivational quotes specifically for children/young athletes
  const motivationalQuotes = [
    {
      id: 1,
      text: "Champions train when nobody is watching! 💪",
      author: "Your Inner Champion",
      category: "Training",
      emoji: "🏆",
      color: ['#ff6b6b', '#ff8e8e'],
      points: 10,
    },
    {
      id: 2,
      text: "Every great athlete started as a beginner. Keep going! 🌟",
      author: "Coach Wisdom",
      category: "Growth",
      emoji: "🌱",
      color: ['#4ecdc4', '#44a08d'],
      points: 15,
    },
    {
      id: 3,
      text: "Your only competition is who you were yesterday! 🚀",
      author: "Future You",
      category: "Improvement",
      emoji: "⚡",
      color: ['#667eea', '#764ba2'],
      points: 20,
    },
    {
      id: 4,
      text: "Practice makes progress, not perfect - and that's awesome! 🎯",
      author: "Growth Mindset",
      category: "Practice",
      emoji: "🎪",
      color: ['#ffa726', '#ff7043'],
      points: 12,
    },
    {
      id: 5,
      text: "Believe in yourself like your biggest fan believes in you! 🌈",
      author: "Your Cheerleader",
      category: "Confidence",
      emoji: "🦄",
      color: ['#ab47bc', '#8e24aa'],
      points: 18,
    },
    {
      id: 6,
      text: "Teamwork makes the dream work! Together we're unstoppable! 🤝",
      author: "Team Spirit",
      category: "Teamwork",
      emoji: "🎭",
      color: ['#26a69a', '#00897b'],
      points: 16,
    },
    {
      id: 7,
      text: "Fall down 7 times, get up 8 times. You've got this! 🔥",
      author: "Resilience Hero",
      category: "Perseverance",
      emoji: "🏃‍♀️",
      color: ['#ef5350', '#e53935'],
      points: 25,
    },
    {
      id: 8,
      text: "Your attitude determines your altitude! Aim high! ✈️",
      author: "Sky's The Limit",
      category: "Attitude",
      emoji: "🎈",
      color: ['#5c6bc0', '#3f51b5'],
      points: 14,
    },
  ];

  const categories = ['All', 'Training', 'Growth', 'Teamwork', 'Confidence'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter quotes by category
  const filteredQuotes = selectedCategory === 'All' 
    ? motivationalQuotes 
    : motivationalQuotes.filter(quote => quote.category === selectedCategory);

  // Animation functions
  const startEntryAnimation = useCallback(() => {
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
    ]).start();
  }, [fadeAnim, slideAnim]);

  const startSparkleAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [sparkleAnim]);

  const pulseAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pulseAnim]);

  // Effects
  useEffect(() => {
    startEntryAnimation();
    startSparkleAnimation();
    
    // Set daily quote if not viewed today
    if (!dailyQuoteViewed) {
      const today = new Date().getDay();
      setCurrentQuoteIndex(today % motivationalQuotes.length);
      setDailyQuoteViewed(true);
      
      // Add streak bonus for viewing daily quote
      if (dailyStreak > 0) {
        setStreakBonus(true);
        setTimeout(() => setStreakBonus(false), 3000);
      }
    }
  }, [startEntryAnimation, startSparkleAnimation, dailyQuoteViewed, dailyStreak]);

  // Handlers
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      Vibration.vibrate(50);
      
      // Simulate refreshing quotes (in real app, this would fetch new content)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show random quote
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      setCurrentQuoteIndex(randomIndex);
      
      setRefreshing(false);
    } catch (error) {
      console.error('Refresh error:', error);
      setRefreshing(false);
    }
  }, [filteredQuotes.length]);

  const handleQuoteShare = async (quote) => {
    try {
      const message = `"${quote.text}" - ${quote.author} 🌟\n\nShared from my training app! 💪`;
      
      await Share.share({
        message: message,
        title: 'Motivational Quote',
      });
      
      // Award points for sharing
      pulseAnimation();
      Vibration.vibrate(100);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleFavoriteToggle = (quoteId) => {
    setFavoriteQuotes(prev => {
      const isFavorite = prev.includes(quoteId);
      if (isFavorite) {
        return prev.filter(id => id !== quoteId);
      } else {
        pulseAnimation();
        Vibration.vibrate(50);
        return [...prev, quoteId];
      }
    });
  };

  const handleNextQuote = () => {
    const nextIndex = (currentQuoteIndex + 1) % filteredQuotes.length;
    setCurrentQuoteIndex(nextIndex);
    pulseAnimation();
    Vibration.vibrate(30);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentQuoteIndex(0);
    pulseAnimation();
  };

  const renderQuoteCard = (quote, index) => {
    const isActive = index === currentQuoteIndex;
    const isFavorite = favoriteQuotes.includes(quote.id);
    
    return (
      <Animated.View
        key={quote.id}
        style={{
          transform: [
            { scale: isActive ? pulseAnim : 1 },
            { translateY: isActive ? 0 : 20 }
          ],
          opacity: isActive ? 1 : 0.7,
        }}
      >
        <Card
          style={[
            styles.quoteCard,
            {
              marginHorizontal: SPACING.md,
              marginVertical: SPACING.sm,
              elevation: isActive ? 8 : 4,
            }
          ]}
        >
          <LinearGradient
            colors={quote.color}
            style={styles.quoteCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quoteHeader}>
              <View style={styles.quoteEmoji}>
                <Text style={styles.emojiText}>{quote.emoji}</Text>
                <Animated.View
                  style={[
                    styles.sparkle,
                    {
                      opacity: sparkleAnim,
                      transform: [{ scale: sparkleAnim }]
                    }
                  ]}
                >
                  <MaterialIcons name="star" size={12} color="#fff" />
                </Animated.View>
              </View>
              
              <View style={styles.quoteActions}>
                <IconButton
                  icon={isFavorite ? "favorite" : "favorite-border"}
                  iconColor={isFavorite ? "#ff4757" : "#fff"}
                  size={20}
                  onPress={() => handleFavoriteToggle(quote.id)}
                />
                <IconButton
                  icon="share"
                  iconColor="#fff"
                  size={20}
                  onPress={() => handleQuoteShare(quote)}
                />
              </View>
            </View>

            <View style={styles.quoteContent}>
              <Text style={styles.quoteText}>"{quote.text}"</Text>
              <Text style={styles.quoteAuthor}>- {quote.author}</Text>
              
              <View style={styles.quoteFooter}>
                <Chip
                  mode="outlined"
                  textStyle={styles.categoryChipText}
                  style={styles.categoryChip}
                >
                  {quote.category}
                </Chip>
                <View style={styles.pointsBadge}>
                  <MaterialIcons name="stars" size={16} color="#ffd700" />
                  <Text style={styles.pointsText}>+{quote.points}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Card>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Daily Motivation 🌟</Text>
            <Text style={styles.headerSubtitle}>
              Fuel your champion spirit! 💪
            </Text>
          </View>
          
          <View style={styles.streakContainer}>
            <MaterialIcons name="local-fire-department" size={24} color="#ff6b6b" />
            <Text style={styles.streakText}>{dailyStreak}</Text>
            {streakBonus && (
              <Animated.View style={[styles.bonusBadge, { opacity: fadeAnim }]}>
                <Text style={styles.bonusText}>+5</Text>
              </Animated.View>
            )}
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Today's Inspiration Progress</Text>
          <ProgressBar
            progress={0.75}
            color="#ffd700"
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>3 of 4 quotes viewed</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleCategorySelect(category)}
          >
            <Chip
              mode={selectedCategory === category ? "flat" : "outlined"}
              selected={selectedCategory === category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategoryChip
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === category && styles.selectedCategoryText
              ]}
            >
              {category}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
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
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              title="Pull for new inspiration..."
              titleColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderCategories()}

          <View style={styles.quotesContainer}>
            <View style={styles.mainQuoteContainer}>
              {filteredQuotes.length > 0 && renderQuoteCard(filteredQuotes[currentQuoteIndex], currentQuoteIndex)}
            </View>

            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Quick Actions ⚡</Text>
              
              <View style={styles.actionGrid}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={handleNextQuote}
                >
                  <LinearGradient
                    colors={['#26a69a', '#00897b']}
                    style={styles.actionCardGradient}
                  >
                    <MaterialIcons name="refresh" size={28} color="#fff" />
                    <Text style={styles.actionCardText}>New Quote</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('Achievements')}
                >
                  <LinearGradient
                    colors={['#ffa726', '#ff7043']}
                    style={styles.actionCardGradient}
                  >
                    <MaterialIcons name="jump-rope" size={28} color="#fff" />
                    <Text style={styles.actionCardText}>My Badges</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => Alert.alert('Feature Coming Soon!', 'Quote journal feature is under development 🚧')}
                >
                  <LinearGradient
                    colors={['#ab47bc', '#8e24aa']}
                    style={styles.actionCardGradient}
                  >
                    <MaterialIcons name="book" size={28} color="#fff" />
                    <Text style={styles.actionCardText}>My Journal</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.favoritesContainer}>
              <Text style={styles.sectionTitle}>Your Favorites ❤️</Text>
              {favoriteQuotes.length === 0 ? (
                <Surface style={styles.emptyState}>
                  <MaterialIcons name="favorite-border" size={48} color={COLORS.primary} />
                  <Text style={styles.emptyStateText}>
                    No favorites yet! Tap the ❤️ on quotes you love
                  </Text>
                </Surface>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {motivationalQuotes
                    .filter(quote => favoriteQuotes.includes(quote.id))
                    .map((quote, index) => (
                      <View key={quote.id} style={styles.favoriteQuote}>
                        {renderQuoteCard(quote, index)}
                      </View>
                    ))
                  }
                </ScrollView>
              )}
            </View>
          </View>
        </ScrollView>

        <FAB
          style={styles.fab}
          icon="auto-awesome"
          label="Daily Challenge"
          onPress={() => Alert.alert('Feature Coming Soon!', 'Daily motivation challenges coming soon! 🎯')}
          color="#fff"
        />
      </Animated.View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  streakText: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
  },
  bonusBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#ffd700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bonusText: {
    ...TEXT_STYLES.caption,
    color: '#333',
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: SPACING.md,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  categoriesContainer: {
    paddingVertical: SPACING.md,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.lg,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  quotesContainer: {
    paddingHorizontal: SPACING.lg,
  },
  mainQuoteContainer: {
    marginBottom: SPACING.xl,
  },
  quoteCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quoteCardGradient: {
    padding: SPACING.lg,
    minHeight: 200,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quoteEmoji: {
    position: 'relative',
  },
  emojiText: {
    fontSize: 32,
  },
  sparkle: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  quoteActions: {
    flexDirection: 'row',
  },
  quoteContent: {
    flex: 1,
    justifyContent: 'center',
  },
  quoteText: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: '#ffd700',
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  actionCardGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  actionCardText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginTop: SPACING.xs,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  favoritesContainer: {
    marginBottom: SPACING.xl,
  },
  favoriteQuote: {
    width: width * 0.8,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
    elevation: 8,
  },
};

export default MotivationalQuotes;