import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Searchbar,
  Chip,
  Avatar,
  Surface,
  Button,
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const ExpertAdvice = ({ navigation }) => {
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Redux state
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => ({
    user: state.auth.user,
    loading: state.app.loading,
  }));

  // Expert advice categories
  const categories = [
    { id: 'All', label: 'All Topics', icon: 'apps' },
    { id: 'nutrition', label: '🥗 Nutrition', icon: 'restaurant' },
    { id: 'training', label: '💪 Training', icon: 'fitness-center' },
    { id: 'mental', label: '🧠 Mental Game', icon: 'psychology' },
    { id: 'recovery', label: '😴 Recovery', icon: 'hotel' },
    { id: 'safety', label: '🛡️ Safety', icon: 'security' },
  ];

  // Sample expert advice data
  const expertAdvice = [
    {
      id: 1,
      category: 'nutrition',
      title: '5 Power Snacks for Young Athletes',
      expert: 'Dr. Sarah Chen',
      expertTitle: 'Sports Nutritionist',
      readTime: '3 min',
      difficulty: 'Beginner',
      preview: 'Learn about healthy snacks that fuel your performance and help you grow strong!',
      content: 'Banana with peanut butter, Greek yogurt with berries, whole grain crackers with cheese, trail mix with nuts and dried fruit, and chocolate milk are perfect snacks for young athletes. These foods provide the energy and nutrients your growing body needs!',
      tips: [
        'Eat 30-60 minutes before training',
        'Always have water nearby',
        'Mix carbs with protein for best results',
      ],
      likes: 127,
      bookmarked: false,
      image: '🍌',
    },
    {
      id: 2,
      category: 'training',
      title: 'Fun Warm-Up Exercises for Kids',
      expert: 'Coach Mike Rodriguez',
      expertTitle: 'Youth Sports Coach',
      readTime: '4 min',
      difficulty: 'Beginner',
      preview: 'Make warming up exciting with these fun exercises that prepare your body for action!',
      content: 'High knees marching, arm circles, jumping jacks, butt kicks, and animal movements like bear crawls make warming up fun. These exercises get your heart pumping and muscles ready for sports!',
      tips: [
        'Warm up for 5-10 minutes before playing',
        'Make it fun with music or games',
        'Start slow and gradually increase intensity',
      ],
      likes: 89,
      bookmarked: true,
      image: '🏃‍♂️',
    },
    {
      id: 3,
      category: 'mental',
      title: 'Building Confidence in Young Athletes',
      expert: 'Dr. Lisa Thompson',
      expertTitle: 'Sports Psychologist',
      readTime: '5 min',
      difficulty: 'Intermediate',
      preview: 'Discover simple ways to stay positive and confident during games and training!',
      content: 'Confidence comes from practice, positive self-talk, and remembering that mistakes help us learn. Celebrate small wins, set achievable goals, and remember that every champion started as a beginner!',
      tips: [
        'Practice positive self-talk',
        'Focus on effort, not just results',
        'Learn from mistakes instead of dwelling on them',
      ],
      likes: 156,
      bookmarked: false,
      image: '🌟',
    },
    {
      id: 4,
      category: 'recovery',
      title: 'Why Sleep is a Superpower for Athletes',
      expert: 'Dr. James Wilson',
      expertTitle: 'Sleep Specialist',
      readTime: '3 min',
      difficulty: 'Beginner',
      preview: 'Learn how good sleep helps you perform better and grow stronger!',
      content: 'Sleep is when your body repairs muscles, forms memories, and grows stronger. Young athletes need 9-11 hours of sleep each night. Create a bedtime routine and avoid screens before bed for the best rest!',
      tips: [
        'Go to bed at the same time every night',
        'Keep your room cool and dark',
        'No screens 1 hour before bedtime',
      ],
      likes: 98,
      bookmarked: true,
      image: '😴',
    },
    {
      id: 5,
      category: 'safety',
      title: 'Staying Safe During Sports',
      expert: 'Coach Emma Davis',
      expertTitle: 'Safety Coordinator',
      readTime: '4 min',
      difficulty: 'Beginner',
      preview: 'Essential safety tips every young athlete should know to stay injury-free!',
      content: 'Always wear proper protective gear, listen to your coach, stay hydrated, and speak up if something hurts. Remember: it\'s better to take a break than to get injured!',
      tips: [
        'Tell an adult if you feel pain',
        'Wear all required safety gear',
        'Drink water before, during, and after activities',
      ],
      likes: 112,
      bookmarked: false,
      image: '🛡️',
    },
    {
      id: 6,
      category: 'mental',
      title: 'Dealing with Game Day Nerves',
      expert: 'Coach Alex Kim',
      expertTitle: 'Mental Performance Coach',
      readTime: '4 min',
      difficulty: 'Intermediate',
      preview: 'Turn nervous energy into excitement with these simple techniques!',
      content: 'Feeling nervous before games is normal! Try deep breathing, visualization, and remind yourself that you\'ve trained hard. Nerves mean you care, and that\'s awesome!',
      tips: [
        'Take 3 deep breaths before playing',
        'Imagine yourself succeeding',
        'Remember all your practice and training',
      ],
      likes: 134,
      bookmarked: false,
      image: '🎯',
    },
  ];

  // Filtered advice based on search and category
  const filteredAdvice = expertAdvice.filter(advice => {
    const matchesSearch = advice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advice.expert.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advice.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || advice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Component did mount animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Updated! 📚', 'Latest expert advice has been loaded!');
    }, 1500);
  }, []);

  // Toggle card expansion
  const toggleCardExpansion = (id) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  // Toggle bookmark
  const toggleBookmark = (id) => {
    Alert.alert('Feature Development 🔖', 'Bookmarking feature is being developed and will be available soon!');
  };

  // Like advice
  const likeAdvice = (id) => {
    Alert.alert('Thanks! 👍', 'Your feedback helps us provide better content!');
  };

  // Render category chips
  const renderCategoryChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <Chip
          key={category.id}
          selected={selectedCategory === category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.selectedChip
          ]}
          textStyle={[
            styles.chipText,
            selectedCategory === category.id && styles.selectedChipText
          ]}
          icon={category.icon}
        >
          {category.label}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render expert advice card
  const renderAdviceCard = (advice) => {
    const isExpanded = expandedCards.has(advice.id);
    
    return (
      <Card key={advice.id} style={styles.adviceCard}>
        <TouchableOpacity onPress={() => toggleCardExpansion(advice.id)}>
          <View style={styles.cardHeader}>
            <View style={styles.expertInfo}>
              <Surface style={styles.avatarContainer}>
                <Text style={styles.expertAvatar}>{advice.image}</Text>
              </Surface>
              <View style={styles.expertDetails}>
                <Text style={styles.expertName}>{advice.expert}</Text>
                <Text style={styles.expertTitle}>{advice.expertTitle}</Text>
              </View>
            </View>
            <View style={styles.cardMeta}>
              <Chip style={styles.difficultyChip} textStyle={styles.chipSmallText}>
                {advice.difficulty}
              </Chip>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.adviceTitle}>{advice.title}</Text>
            <Text style={styles.advicePreview}>{advice.preview}</Text>
            
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{advice.readTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="thumb-up" size={16} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{advice.likes} likes</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View 
            style={[
              styles.expandedContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.divider} />
            
            <Text style={styles.contentTitle}>Expert Advice:</Text>
            <Text style={styles.adviceContent}>{advice.content}</Text>
            
            <Text style={styles.tipsTitle}>Quick Tips:</Text>
            {advice.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Icon name="lightbulb" size={16} color={COLORS.primary} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}

            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => likeAdvice(advice.id)}
                style={styles.actionButton}
                icon="thumb-up"
                compact
              >
                Like
              </Button>
              <Button
                mode="outlined"
                onPress={() => toggleBookmark(advice.id)}
                style={styles.actionButton}
                icon={advice.bookmarked ? "bookmark" : "bookmark-outline"}
                compact
              >
                {advice.bookmarked ? 'Saved' : 'Save'}
              </Button>
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Share Feature 📤', 'Sharing feature coming soon!')}
                style={styles.actionButton}
                icon="share"
                compact
              >
                Share
              </Button>
            </View>
          </Animated.View>
        )}
      </Card>
    );
  };

  // Render stats section
  const renderStatsSection = () => (
    <Card style={styles.statsCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.statsGradient}
      >
        <Text style={styles.statsTitle}>Your Learning Progress 📊</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Articles Read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Tips Applied</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Bookmarked</Text>
          </View>
        </View>
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Knowledge Level</Text>
          <ProgressBar
            progress={0.65}
            color={COLORS.background}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>65% - Great job! 🌟</Text>
        </View>
      </LinearGradient>
    </Card>
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
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.headerTitle}>Expert Advice 🎓</Text>
          <Text style={styles.headerSubtitle}>
            Learn from top coaches and sports experts!
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search expert advice..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Category Filter */}
      {renderCategoryChips()}

      {/* Content */}
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
        {/* Stats Section */}
        {renderStatsSection()}

        {/* Featured Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="star" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Featured Advice</Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredScroll}
          >
            {filteredAdvice.slice(0, 3).map((advice) => (
              <Card key={`featured-${advice.id}`} style={styles.featuredCard}>
                <TouchableOpacity onPress={() => toggleCardExpansion(advice.id)}>
                  <LinearGradient
                    colors={['#667eea20', '#764ba220']}
                    style={styles.featuredContent}
                  >
                    <Text style={styles.featuredEmoji}>{advice.image}</Text>
                    <Text style={styles.featuredTitle} numberOfLines={2}>
                      {advice.title}
                    </Text>
                    <Text style={styles.featuredExpert}>{advice.expert}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* All Advice Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="school" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>
              All Expert Advice ({filteredAdvice.length})
            </Text>
          </View>

          {filteredAdvice.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Icon name="search-off" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No Advice Found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your search or category filter
                </Text>
              </View>
            </Card>
          ) : (
            filteredAdvice.map((advice) => renderAdviceCard(advice))
          )}
        </View>

        {/* Ask Expert Section */}
        <Card style={styles.askExpertCard}>
          <LinearGradient
            colors={['#667eea15', '#764ba215']}
            style={styles.askExpertContent}
          >
            <Icon name="help-outline" size={32} color={COLORS.primary} />
            <Text style={styles.askExpertTitle}>Have a Question? 🤔</Text>
            <Text style={styles.askExpertText}>
              Our experts are here to help! Ask anything about sports, training, or nutrition.
            </Text>
            <Button
              mode="contained"
              onPress={() => Alert.alert('Ask Expert 💬', 'Expert Q&A feature coming soon!')}
              style={styles.askButton}
              contentStyle={styles.buttonContent}
            >
              Ask an Expert
            </Button>
          </LinearGradient>
        </Card>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.background,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.background,
    opacity: 0.9,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    elevation: 0,
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoryContainer: {
    backgroundColor: COLORS.background,
  },
  categoryContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
  },
  selectedChipText: {
    color: COLORS.background,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.background,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.heading,
    color: COLORS.background,
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    opacity: 0.9,
  },
  progressSection: {
    alignItems: 'center',
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    width: 200,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.background,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  featuredScroll: {
    paddingLeft: SPACING.md,
  },
  featuredCard: {
    width: 160,
    marginRight: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredContent: {
    padding: SPACING.md,
    alignItems: 'center',
    height: 140,
  },
  featuredEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  featuredTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
  },
  featuredExpert: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  adviceCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  expertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  expertAvatar: {
    fontSize: 20,
  },
  expertDetails: {
    flex: 1,
  },
  expertName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  expertTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  cardMeta: {
    alignItems: 'flex-end',
  },
  difficultyChip: {
    backgroundColor: COLORS.primary + '20',
  },
  chipSmallText: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
    color: COLORS.primary,
  },
  cardContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  adviceTitle: {
    ...TEXT_STYLES.subheading,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  advicePreview: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  metaText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  expandedContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  contentTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  adviceContent: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  tipsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  tipText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    borderColor: COLORS.primary,
    borderRadius: 8,
  },
  buttonContent: {
    paddingHorizontal: SPACING.xs,
  },
  askExpertCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  askExpertContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  askExpertTitle: {
    ...TEXT_STYLES.subheading,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: SPACING.sm,
  },
  askExpertText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  askButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingHorizontal: SPACING.lg,
  },
  emptyCard: {
    marginHorizontal: SPACING.md,
    borderRadius: 16,
  },
  emptyContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...TEXT_STYLES.subheading,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

// Set navigation options
ExpertAdvice.navigationOptions = {
  title: 'Expert Advice',
  headerShown: false,
};

export default ExpertAdvice;