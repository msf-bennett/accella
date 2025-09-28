import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  Vibration,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Text,
  ProgressBar,
  FAB,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  header: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subheader: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const TrainingTips = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favoritesTips, setFavoritesTips] = useState(new Set());
  const [completedTips, setCompletedTips] = useState(new Set());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);

  // Training tip categories
  const tipCategories = [
    { id: 'all', name: 'All Tips', icon: 'tips-and-updates', color: COLORS.primary },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-center', color: '#e74c3c' },
    { id: 'skills', name: 'Skills', icon: 'sports', color: '#3498db' },
    { id: 'mental', name: 'Mental', icon: 'psychology', color: '#9b59b6' },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant', color: '#2ecc71' },
    { id: 'recovery', name: 'Recovery', icon: 'bedtime', color: '#f39c12' },
  ];

  // Training tips data
  const trainingTips = [
    {
      id: '1',
      title: 'Start Every Day with a Smile! 😊',
      category: 'mental',
      difficulty: 'Beginner',
      duration: '2 min',
      icon: '😊',
      shortDesc: 'Positive mindset for better training',
      content: 'Begin each training session with a positive attitude! A smile releases endorphins that help you feel happier and more confident. Remember: you\'re here to have fun and improve!',
      tips: [
        'Take 3 deep breaths before starting',
        'Think about what you want to achieve today',
        'Remind yourself that mistakes help you learn',
        'Celebrate small victories!',
      ],
      ageGroup: '6-18 years',
      points: 50,
      level: 'Easy',
    },
    {
      id: '2',
      title: 'Dynamic Warm-Up Magic ⚡',
      category: 'fitness',
      difficulty: 'Beginner',
      duration: '10 min',
      icon: '⚡',
      shortDesc: 'Fun ways to prepare your body',
      content: 'Warming up doesn\'t have to be boring! Dynamic movements prepare your muscles and joints for activity while making you feel energized and ready to perform.',
      tips: [
        'Do arm circles like a windmill',
        'March in place with high knees',
        'Do jumping jacks to music',
        'Stretch like your favorite animal',
      ],
      ageGroup: '8-18 years',
      points: 75,
      level: 'Easy',
    },
    {
      id: '3',
      title: 'Master Your First Touch ⚽',
      category: 'skills',
      difficulty: 'Intermediate',
      duration: '15 min',
      icon: '⚽',
      shortDesc: 'Ball control fundamentals',
      content: 'Your first touch sets up everything that happens next! Practice controlling the ball with different parts of your foot to become more confident and creative.',
      tips: [
        'Use the inside of your foot for control',
        'Keep your head up to see the field',
        'Practice with both feet equally',
        'Start slow, then increase speed',
      ],
      ageGroup: '10-18 years',
      points: 100,
      level: 'Medium',
    },
    {
      id: '4',
      title: 'Hydration Hero 💧',
      category: 'nutrition',
      difficulty: 'Beginner',
      duration: '5 min',
      icon: '💧',
      shortDesc: 'Stay hydrated like a champion',
      content: 'Water is your superpower! Proper hydration keeps your energy levels high, helps your muscles work better, and keeps your brain sharp during training.',
      tips: [
        'Drink water before you feel thirsty',
        'Bring a water bottle to every session',
        'Take small sips regularly',
        'Add fruit slices for extra taste!',
      ],
      ageGroup: '6-18 years',
      points: 60,
      level: 'Easy',
    },
    {
      id: '5',
      title: 'Sleep Like a Champion 🛌',
      category: 'recovery',
      difficulty: 'Beginner',
      duration: '8-10 hours',
      icon: '🛌',
      shortDesc: 'Rest and recovery importance',
      content: 'Your body grows stronger while you sleep! Good sleep helps your muscles recover, your brain remember what you learned, and gives you energy for tomorrow.',
      tips: [
        'Aim for 8-10 hours of sleep',
        'Create a bedtime routine',
        'Keep your room cool and dark',
        'Avoid screens 1 hour before bed',
      ],
      ageGroup: '6-18 years',
      points: 80,
      level: 'Easy',
    },
    {
      id: '6',
      title: 'Visualization Victory 🎯',
      category: 'mental',
      difficulty: 'Intermediate',
      duration: '10 min',
      icon: '🎯',
      shortDesc: 'Mental training techniques',
      content: 'Picture yourself succeeding! Visualization is like practice in your mind. Top athletes use this technique to improve performance and build confidence.',
      tips: [
        'Close your eyes and imagine success',
        'Picture yourself doing skills perfectly',
        'Feel the emotions of achieving goals',
        'Practice this before games/competitions',
      ],
      ageGroup: '12-18 years',
      points: 120,
      level: 'Medium',
    },
    {
      id: '7',
      title: 'Balanced Nutrition Plate 🍎',
      category: 'nutrition',
      difficulty: 'Beginner',
      duration: 'Daily',
      icon: '🍎',
      shortDesc: 'Fuel your body properly',
      content: 'Your body is like a race car - it needs the right fuel to perform! Eating a variety of foods gives you the energy and nutrients needed for training and recovery.',
      tips: [
        'Fill half your plate with colorful vegetables',
        'Include lean proteins for muscle recovery',
        'Choose whole grains for lasting energy',
        'Don\'t forget healthy fats like nuts!',
      ],
      ageGroup: '8-18 years',
      points: 90,
      level: 'Easy',
    },
    {
      id: '8',
      title: 'Practice Perfect Form 📐',
      category: 'skills',
      difficulty: 'Advanced',
      duration: '20 min',
      icon: '📐',
      shortDesc: 'Quality over quantity training',
      content: 'Perfect practice makes perfect! Focus on doing movements correctly rather than quickly. Building good habits now will make you unstoppable later.',
      tips: [
        'Start with slow, controlled movements',
        'Ask your coach to check your form',
        'Use mirrors or video to self-check',
        'Quality repetitions beat quantity',
      ],
      ageGroup: '12-18 years',
      points: 150,
      level: 'Hard',
    },
  ];

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = useCallback(() => {
    // Animation entrance
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

    // Load saved favorites and completed tips
    loadUserProgress();
  }, []);

  const loadUserProgress = useCallback(() => {
    try {
      // In a real app, this would load from AsyncStorage or Redux
      setFavoritesTips(new Set(['1', '4', '5']));
      setCompletedTips(new Set(['1', '2', '4']));
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadUserProgress();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadUserProgress]);

  const filteredTips = trainingTips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tip.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTipPress = useCallback((tip) => {
    Vibration.vibrate(30);
    navigation.navigate('TipDetails', { tip });
  }, [navigation]);

  const handleFavoriteToggle = useCallback((tipId) => {
    Vibration.vibrate(50);
    setFavoritesTips(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tipId)) {
        newFavorites.delete(tipId);
        Alert.alert('Removed from Favorites ❤️', 'Tip removed from your favorites list.');
      } else {
        newFavorites.add(tipId);
        Alert.alert('Added to Favorites! 🌟', 'Tip saved to your favorites list.');
      }
      return newFavorites;
    });
  }, []);

  const handleMarkComplete = useCallback((tipId) => {
    Vibration.vibrate(100);
    setCompletedTips(prev => {
      const newCompleted = new Set(prev);
      if (!newCompleted.has(tipId)) {
        newCompleted.add(tipId);
        const tip = trainingTips.find(t => t.id === tipId);
        Alert.alert(
          'Awesome Work! 🎉', 
          `You earned ${tip.points} points for completing "${tip.title}"!`
        );
      }
      return newCompleted;
    });
  }, []);

  const getTotalPoints = useCallback(() => {
    return Array.from(completedTips).reduce((total, tipId) => {
      const tip = trainingTips.find(t => t.id === tipId);
      return total + (tip ? tip.points : 0);
    }, 0);
  }, [completedTips]);

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Easy': return COLORS.success;
      case 'Medium': return COLORS.warning;
      case 'Hard': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Training Tips Hub 💡</Text>
        <Text style={styles.headerSubtitle}>
          Learn, practice, and become amazing!
        </Text>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getTotalPoints()}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedTips.size}</Text>
            <Text style={styles.statLabel}>Tips Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{favoritesTips.size}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <Surface style={styles.searchContainer} elevation={2}>
      <Searchbar
        placeholder="Search training tips..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
    </Surface>
  );

  const renderCategoryChips = () => (
    <View style={styles.chipContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScrollContent}
      >
        {tipCategories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => {
              setSelectedCategory(category.id);
              Vibration.vibrate(30);
            }}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={selectedCategory === category.id ? styles.selectedChipText : styles.chipText}
            icon={category.icon}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderMotivationalQuote = () => (
    <Card style={styles.quoteCard}>
      <Card.Content>
        <View style={styles.quoteHeader}>
          <Icon name="format-quote" size={24} color={COLORS.primary} />
          <Text style={styles.quoteTitle}>Daily Motivation 🌟</Text>
        </View>
        <Text style={styles.quote}>
          "Champions aren't made in gyms. Champions are made from something deep inside them - desire, dream, and vision."
        </Text>
        <Text style={styles.quoteAuthor}>- Muhammad Ali</Text>
      </Card.Content>
    </Card>
  );

  const renderTipItem = ({ item }) => {
    const isCompleted = completedTips.has(item.id);
    const isFavorite = favoritesTips.has(item.id);
    
    return (
      <Animated.View
        style={[
          styles.tipItemContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Card 
          style={[styles.tipCard, isCompleted && styles.completedTipCard]}
          onPress={() => handleTipPress(item)}
          elevation={3}
        >
          <Card.Content>
            <View style={styles.tipHeader}>
              <View style={styles.tipInfo}>
                <Text style={styles.tipEmoji}>{item.icon}</Text>
                <View style={styles.tipDetails}>
                  <Text style={[styles.tipTitle, isCompleted && styles.completedText]}>
                    {item.title}
                  </Text>
                  <Text style={styles.tipShortDesc}>{item.shortDesc}</Text>
                  <View style={styles.tipMeta}>
                    <Chip
                      compact
                      style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(item.level) }]}
                      textStyle={styles.difficultyText}
                    >
                      {item.level}
                    </Chip>
                    <Text style={styles.duration}>{item.duration}</Text>
                    <Text style={styles.ageGroup}>{item.ageGroup}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.tipActions}>
                <IconButton
                  icon={isFavorite ? 'favorite' : 'favorite-border'}
                  iconColor={isFavorite ? COLORS.error : COLORS.textSecondary}
                  onPress={() => handleFavoriteToggle(item.id)}
                  size={20}
                />
                <Text style={styles.points}>{item.points} pts</Text>
              </View>
            </View>
            
            <Text style={styles.tipContent} numberOfLines={3}>
              {item.content}
            </Text>
            
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.completedLabel}>Completed!</Text>
              </View>
            )}
          </Card.Content>
          
          <Card.Actions style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => handleTipPress(item)}
              style={styles.actionButton}
            >
              Read More
            </Button>
            {!isCompleted && (
              <Button
                mode="contained"
                onPress={() => handleMarkComplete(item.id)}
                style={styles.actionButton}
                buttonColor={COLORS.success}
              >
                Mark Complete
              </Button>
            )}
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <ScrollView
        style={styles.scrollView}
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
        {renderHeader()}
        {renderSearchBar()}
        {renderCategoryChips()}
        {renderMotivationalQuote()}
        
        <View style={styles.tipsList}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Training Tips' : 
             tipCategories.find(c => c.id === selectedCategory)?.name + ' Tips'} 
            ({filteredTips.length})
          </Text>
          
          {filteredTips.map((item) => (
            <View key={item.id}>
              {renderTipItem({ item })}
            </View>
          ))}
          
          {filteredTips.length === 0 && (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyState}>
                <Icon name="lightbulb-outline" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyStateText}>No training tips found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your search or category filter
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            'Suggest a Tip! 💡',
            'Have a great training tip to share? We\'d love to hear from you!',
            [
              { text: 'Maybe Later', style: 'cancel' },
              { text: 'Share Tip', onPress: () => navigation.navigate('SuggestTip') },
            ]
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.header,
    color: '#ffffff',
    fontSize: 28,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.header,
    color: '#ffffff',
    fontSize: 20,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
    opacity: 0.8,
    fontSize: 12,
  },
  searchContainer: {
    margin: SPACING.md,
    borderRadius: 12,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
  },
  chipContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  chipScrollContent: {
    paddingVertical: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  chipText: {
    color: COLORS.textSecondary,
  },
  selectedChipText: {
    color: '#ffffff',
  },
  quoteCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quoteTitle: {
    ...TEXT_STYLES.subheader,
    marginLeft: SPACING.sm,
    fontSize: 16,
  },
  quote: {
    ...TEXT_STYLES.body,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  quoteAuthor: {
    ...TEXT_STYLES.caption,
    textAlign: 'right',
    fontWeight: '600',
  },
  tipsList: {
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheader,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  tipItemContainer: {
    marginBottom: SPACING.md,
  },
  tipCard: {
    backgroundColor: COLORS.surface,
  },
  completedTipCard: {
    backgroundColor: '#f8fff9',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tipInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  tipEmoji: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  tipDetails: {
    flex: 1,
  },
  tipTitle: {
    ...TEXT_STYLES.subheader,
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  tipShortDesc: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.sm,
  },
  tipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  difficultyChip: {
    height: 24,
  },
  difficultyText: {
    color: '#ffffff',
    fontSize: 12,
  },
  duration: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  ageGroup: {
    ...TEXT_STYLES.caption,
  },
  tipActions: {
    alignItems: 'center',
  },
  points: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    fontWeight: 'bold',
    marginTop: -SPACING.sm,
  },
  tipContent: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  completedLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  cardActions: {
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  emptyStateCard: {
    marginTop: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    ...TEXT_STYLES.subheader,
    marginTop: SPACING.md,
  },
  emptyStateSubtext: {
    ...TEXT_STYLES.caption,
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
});

export default TrainingTips;
