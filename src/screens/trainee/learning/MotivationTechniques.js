import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
  Vibration,
  Share,
  ImageBackground,
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
  Portal,
  Modal,
  Searchbar,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const MotivationTechniques = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, motivation } = useSelector(state => state.user);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [dailyQuoteIndex, setDailyQuoteIndex] = useState(0);
  const [favoriteQuotes, setFavoriteQuotes] = useState([]);
  const [completedTechniques, setCompletedTechniques] = useState([]);
  const [motivationScore, setMotivationScore] = useState(85);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const quoteAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  // Motivation categories
  const categories = [
    { id: 'all', label: 'All', icon: 'favorite', color: COLORS.primary },
    { id: 'mindset', label: 'Mindset', icon: 'psychology', color: '#FF6B6B' },
    { id: 'goals', label: 'Goal Setting', icon: 'flag', color: '#4ECDC4' },
    { id: 'habits', label: 'Habits', icon: 'repeat', color: '#45B7D1' },
    { id: 'rewards', label: 'Rewards', icon: 'card-giftcard', color: '#96CEB4' },
    { id: 'inspiration', label: 'Inspiration', icon: 'auto-awesome', color: '#FFEAA7' },
  ];

  // Daily motivational quotes
  const motivationalQuotes = [
    {
      id: 1,
      text: "The only impossible journey is the one you never begin.",
      author: "Tony Robbins",
      category: "mindset",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: 2,
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "mindset",
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      id: 3,
      text: "Your body can stand almost anything. It's your mind that you have to convince.",
      author: "Unknown",
      category: "mindset",
      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      id: 4,
      text: "Champions aren't made in the gyms. Champions are made from something deep inside them: a desire, a dream, a vision.",
      author: "Muhammad Ali",
      category: "inspiration",
      background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      id: 5,
      text: "The groundwork for all happiness is good health.",
      author: "Leigh Hunt",
      category: "inspiration",
      background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    },
  ];

  // Motivation techniques
  const motivationTechniques = [
    {
      id: 1,
      title: 'SMART Goals Framework 🎯',
      category: 'goals',
      duration: '15 min setup',
      difficulty: 'Beginner',
      description: 'Create Specific, Measurable, Achievable, Relevant, Time-bound goals',
      steps: [
        'Write down your fitness goal',
        'Make it specific and measurable',
        'Ensure it\'s achievable and relevant',
        'Set a clear deadline',
        'Break it into smaller milestones'
      ],
      benefits: ['Clear direction', 'Better focus', 'Track progress', 'Stay accountable'],
      completed: false,
      points: 100,
    },
    {
      id: 2,
      title: 'Habit Stacking 🔗',
      category: 'habits',
      duration: '10 min daily',
      difficulty: 'Beginner',
      description: 'Link new habits to existing ones for better consistency',
      steps: [
        'Identify a current strong habit',
        'Choose the new habit to add',
        'Stack them together',
        'Practice the sequence daily',
        'Track your consistency'
      ],
      benefits: ['Easy implementation', 'Higher success rate', 'Natural reminders', 'Compound growth'],
      completed: true,
      points: 75,
    },
    {
      id: 3,
      title: 'Visualization Mastery 👁️',
      category: 'mindset',
      duration: '20 min',
      difficulty: 'Intermediate',
      description: 'Mental rehearsal of success to boost motivation and performance',
      steps: [
        'Find a quiet, comfortable space',
        'Close your eyes and relax',
        'Visualize your ideal fitness outcome',
        'Engage all your senses',
        'Feel the emotions of success'
      ],
      benefits: ['Increased confidence', 'Better focus', 'Reduced anxiety', 'Enhanced performance'],
      completed: false,
      points: 90,
    },
    {
      id: 4,
      title: 'Reward System Design 🏆',
      category: 'rewards',
      duration: '30 min setup',
      difficulty: 'Intermediate',
      description: 'Create meaningful rewards to celebrate your fitness achievements',
      steps: [
        'List your fitness milestones',
        'Choose appropriate rewards',
        'Set reward criteria',
        'Track your progress',
        'Celebrate achievements'
      ],
      benefits: ['Positive reinforcement', 'Milestone celebration', 'Sustained motivation', 'Progress recognition'],
      completed: false,
      points: 80,
    },
    {
      id: 5,
      title: 'Identity Transformation 🦋',
      category: 'mindset',
      duration: '25 min',
      difficulty: 'Advanced',
      description: 'Shift your identity to become the person who naturally makes healthy choices',
      steps: [
        'Define your ideal fitness identity',
        'Identify current vs desired behaviors',
        'Start with small identity-based actions',
        'Use positive self-talk',
        'Consistently reinforce the new identity'
      ],
      benefits: ['Lasting change', 'Intrinsic motivation', 'Behavior alignment', 'Self-confidence'],
      completed: false,
      points: 120,
    },
    {
      id: 6,
      title: 'Accountability Partnership 🤝',
      category: 'habits',
      duration: '45 min setup',
      difficulty: 'Beginner',
      description: 'Partner with someone to stay committed to your fitness goals',
      steps: [
        'Find a reliable partner',
        'Share your goals clearly',
        'Set check-in schedules',
        'Create mutual support systems',
        'Celebrate successes together'
      ],
      benefits: ['External motivation', 'Shared responsibility', 'Social support', 'Consistent feedback'],
      completed: true,
      points: 85,
    },
  ];

  // Initialize animations and data
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
      Animated.timing(scoreAnim, {
        toValue: motivationScore,
        duration: 2000,
        useNativeDriver: false,
      }),
    ]).start();

    // Daily quote rotation
    const today = new Date().getDate();
    setDailyQuoteIndex(today % motivationalQuotes.length);

    // Animate quote entrance
    Animated.loop(
      Animated.sequence([
        Animated.timing(quoteAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(quoteAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    loadUserData();
  }, []);

  const loadUserData = () => {
    // Mock data loading
    setCompletedTechniques([2, 6]);
    setFavoriteQuotes([1, 4]);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      loadUserData();
    }, 1500);
  }, []);

  const openTechnique = (technique) => {
    setSelectedTechnique(technique);
    setShowTechniqueModal(true);
    Vibration.vibrate(50);
  };

  const completeTechnique = () => {
    if (selectedTechnique) {
      setCompletedTechniques(prev => [...prev, selectedTechnique.id]);
      setMotivationScore(prev => Math.min(prev + 5, 100));
      
      Alert.alert(
        '🎉 Technique Completed!',
        `Great job! You earned ${selectedTechnique.points} points and boosted your motivation score by 5 points.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              setShowTechniqueModal(false);
              Vibration.vibrate([0, 500, 200, 500]);
            },
          },
        ]
      );
    }
  };

  const shareQuote = async (quote) => {
    try {
      await Share.share({
        message: `"${quote.text}" - ${quote.author}`,
        title: 'Daily Motivation',
      });
    } catch (error) {
      console.log('Error sharing quote:', error);
    }
  };

  const toggleFavoriteQuote = (quoteId) => {
    setFavoriteQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
    Vibration.vibrate(30);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return '#FFA726';
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const filteredTechniques = motivationTechniques.filter(technique => {
    const matchesCategory = selectedCategory === 'all' || technique.category === selectedCategory;
    const matchesSearch = technique.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         technique.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Motivation Hub 💪</Text>
            <Text style={styles.headerSubtitle}>Fuel your fitness journey</Text>
          </View>
          <Avatar.Text
            size={50}
            label={user?.name?.charAt(0) || 'U'}
            style={styles.avatar}
          />
        </View>
        
        {/* Motivation Score */}
        <View style={styles.scoreContainer}>
          <Surface style={styles.scoreCard}>
            <View style={styles.scoreContent}>
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreLabel}>Motivation Score</Text>
                <Animated.Text style={styles.scoreValue}>
                  {motivationScore}%
                </Animated.Text>
              </View>
              <View style={styles.scoreVisual}>
                <ProgressBar
                  progress={motivationScore / 100}
                  color={COLORS.success}
                  style={styles.scoreProgress}
                />
                <View style={styles.scoreBadges}>
                  <Text style={styles.badgeText}>🔥 {Math.floor(motivationScore / 10)} Streaks</Text>
                  <Text style={styles.badgeText}>⭐ {completedTechniques.length} Completed</Text>
                </View>
              </View>
            </View>
          </Surface>
        </View>
      </View>
    </LinearGradient>
  );

  const renderDailyQuote = () => {
    const quote = motivationalQuotes[dailyQuoteIndex];
    return (
      <View style={styles.quoteContainer}>
        <Card style={styles.quoteCard}>
          <LinearGradient
            colors={['#fa709a', '#fee140']}
            style={styles.quoteGradient}
          >
            <View style={styles.quoteContent}>
              <Animated.View style={{ opacity: quoteAnim }}>
                <Text style={styles.quoteText}>"{quote.text}"</Text>
                <Text style={styles.quoteAuthor}>- {quote.author}</Text>
              </Animated.View>
              <View style={styles.quoteActions}>
                <IconButton
                  icon={favoriteQuotes.includes(quote.id) ? "favorite" : "favorite-border"}
                  iconColor="#fff"
                  size={24}
                  onPress={() => toggleFavoriteQuote(quote.id)}
                />
                <IconButton
                  icon="share"
                  iconColor="#fff"
                  size={24}
                  onPress={() => shareQuote(quote)}
                />
                <IconButton
                  icon="refresh"
                  iconColor="#fff"
                  size={24}
                  onPress={() => setDailyQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length)}
                />
              </View>
            </View>
          </LinearGradient>
        </Card>
      </View>
    );
  };

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => {
              setSelectedCategory(category.id);
              Vibration.vibrate(30);
            }}
          >
            <Surface
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardSelected
              ]}
            >
              <Icon 
                name={category.icon} 
                size={24} 
                color={selectedCategory === category.id ? '#fff' : category.color}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected
              ]}>
                {category.label}
              </Text>
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTechniqueCard = (technique) => (
    <Animated.View
      key={technique.id}
      style={[
        styles.techniqueCardContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Card style={styles.techniqueCard}>
        <Card.Content>
          <View style={styles.techniqueHeader}>
            <View style={styles.techniqueTitleContainer}>
              <Text style={styles.techniqueTitle}>{technique.title}</Text>
              <View style={styles.techniqueMeta}>
                <Chip
                  style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(technique.difficulty) + '20' }]}
                  textStyle={[styles.difficultyText, { color: getDifficultyColor(technique.difficulty) }]}
                >
                  {technique.difficulty}
                </Chip>
                <View style={styles.durationContainer}>
                  <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.durationText}>{technique.duration}</Text>
                </View>
              </View>
            </View>
            {completedTechniques.includes(technique.id) ? (
              <Icon name="check-circle" size={30} color={COLORS.success} />
            ) : (
              <IconButton
                icon="play-arrow"
                iconColor={COLORS.primary}
                size={30}
                style={styles.playButton}
                onPress={() => openTechnique(technique)}
              />
            )}
          </View>
          
          <Text style={styles.techniqueDescription}>{technique.description}</Text>
          
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Key Benefits:</Text>
            <View style={styles.benefitsList}>
              {technique.benefits.slice(0, 2).map((benefit, index) => (
                <Chip key={index} style={styles.benefitChip} compact>
                  {benefit}
                </Chip>
              ))}
            </View>
          </View>
          
          <View style={styles.techniqueFooter}>
            <View style={styles.pointsContainer}>
              <Icon name="stars" size={16} color="#FFD700" />
              <Text style={styles.pointsText}>{technique.points} points</Text>
            </View>
            {completedTechniques.includes(technique.id) && (
              <Text style={styles.completedText}>✅ Mastered</Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderTechniqueModal = () => (
    <Portal>
      <Modal
        visible={showTechniqueModal}
        onDismiss={() => setShowTechniqueModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="dark" blurAmount={10}>
          <Surface style={styles.modalContent}>
            {selectedTechnique && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedTechnique.title}</Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowTechniqueModal(false)}
                  />
                </View>
                
                <Text style={styles.modalDescription}>
                  {selectedTechnique.description}
                </Text>
                
                <View style={styles.stepsContainer}>
                  <Text style={styles.stepsTitle}>How to Apply:</Text>
                  {selectedTechnique.steps.map((step, index) => (
                    <View key={index} style={styles.stepItem}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.benefitsSection}>
                  <Text style={styles.benefitsSectionTitle}>Benefits You'll Gain:</Text>
                  <View style={styles.benefitsGrid}>
                    {selectedTechnique.benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <Icon name="check-circle" size={16} color={COLORS.success} />
                        <Text style={styles.benefitItemText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.modalActions}>
                  {!completedTechniques.includes(selectedTechnique.id) ? (
                    <Button
                      mode="contained"
                      style={styles.completeButton}
                      onPress={completeTechnique}
                      icon="check"
                    >
                      Mark as Completed
                    </Button>
                  ) : (
                    <Button
                      mode="outlined"
                      style={styles.reviewButton}
                      icon="refresh"
                    >
                      Review Technique
                    </Button>
                  )}
                </View>
              </ScrollView>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
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
        showsVerticalScrollIndicator={false}
      >
        {renderDailyQuote()}
        
        <Searchbar
          placeholder="Search motivation techniques..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />
        
        {renderCategories()}
        
        <View style={styles.techniquesContainer}>
          <Text style={styles.sectionTitle}>
            Motivation Techniques ({filteredTechniques.length})
          </Text>
          
          {filteredTechniques.length > 0 ? (
            filteredTechniques.map(renderTechniqueCard)
          ) : (
            <Surface style={styles.emptyState}>
              <Icon name="psychology" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateText}>
                No techniques found
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or category filter
              </Text>
            </Surface>
          )}
        </View>
      </ScrollView>
      
      {renderTechniqueModal()}
      
      <FAB
        icon="lightbulb"
        label="Quick Tip"
        style={styles.fab}
        onPress={() => {
          const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
          Alert.alert(
            '💡 Quick Motivation',
            `"${randomQuote.text}" - ${randomQuote.author}`,
            [{ text: 'Thanks!', onPress: () => {} }]
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
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: '#fff',
    fontSize: 28,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scoreContainer: {
    marginTop: SPACING.md,
  },
  scoreCard: {
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 4,
  },
  scoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  scoreValue: {
    ...TEXT_STYLES.heading,
    fontSize: 32,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  scoreVisual: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  scoreProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  scoreBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
  },
  quoteContainer: {
    margin: SPACING.md,
  },
  quoteCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
  },
  quoteGradient: {
    padding: SPACING.lg,
  },
  quoteContent: {
    alignItems: 'center',
  },
  quoteText: {
    ...TEXT_STYLES.subheading,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  quoteAuthor: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  searchbar: {
    margin: SPACING.md,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryCard: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    elevation: 2,
  },
  categoryCardSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  techniquesContainer: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  techniqueCardContainer: {
    marginBottom: SPACING.md,
  },
  techniqueCard: {
    borderRadius: 16,
    elevation: 3,
  },
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  techniqueTitleContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  techniqueTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  techniqueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  difficultyChip: {
    height: 24,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  durationText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  playButton: {
    backgroundColor: COLORS.primary + '20',
  },
  techniqueDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  benefitsContainer: {
    marginBottom: SPACING.md,
  },
  benefitsTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  benefitChip: {
    backgroundColor: COLORS.success + '20',
  },
  techniqueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: '#FFD700',
    fontWeight: '600',
  },
  completedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  modalContent: {
    width: width - SPACING.lg * 2,
    maxHeight: height * 0.8,
    borderRadius: 20,
    padding: SPACING.lg,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 20,
    color: COLORS.textPrimary,
    flex: 1,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  stepsContainer: {
    marginBottom: SPACING.lg,
  },
  stepsTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    fontWeight: 'bold',
  },
  stepText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  divider: {
    marginVertical: SPACING.lg,
    height: 1,
    backgroundColor: COLORS.border,
  },
  benefitsSection: {
    marginBottom: SPACING.lg,
  },
  benefitsSectionTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  benefitsGrid: {
    gap: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  benefitItemText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  modalActions: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  completeButton: {
    borderRadius: 12,
    paddingVertical: SPACING.xs,
  },
  reviewButton: {
    borderRadius: 12,
    paddingVertical: SPACING.xs,
    borderColor: COLORS.primary,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 16,
    elevation: 1,
  },
  emptyStateText: {
    ...TEXT_STYLES.subheading,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MotivationTechniques;