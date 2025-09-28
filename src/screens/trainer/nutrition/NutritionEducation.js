import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
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
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/ios';

// Design system imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4ade80',
  error: '#ef4444',
  warning: '#f59e0b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySecondary: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const NutritionEducation = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [readingProgress, setReadingProgress] = useState({});
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  
  const slideAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  // Mock data for nutrition education content
  const nutritionCategories = [
    { id: 'all', name: 'All Topics', icon: 'restaurant', color: COLORS.primary },
    { id: 'macros', name: 'Macronutrients', icon: 'pie-chart', color: '#10b981' },
    { id: 'hydration', name: 'Hydration', icon: 'local-drink', color: '#06b6d4' },
    { id: 'supplements', name: 'Supplements', icon: 'medication', color: '#8b5cf6' },
    { id: 'meal-timing', name: 'Meal Timing', icon: 'schedule', color: '#f59e0b' },
    { id: 'recovery', name: 'Recovery Foods', icon: 'healing', color: '#ef4444' },
    { id: 'weight-management', name: 'Weight Management', icon: 'fitness-center', color: '#ec4899' },
  ];

  const educationArticles = [
    {
      id: 1,
      title: 'The Complete Guide to Macronutrients for Athletes',
      category: 'macros',
      readTime: 8,
      difficulty: 'Beginner',
      points: 25,
      thumbnail: 'https://via.placeholder.com/300x200?text=Macronutrients',
      author: 'Dr. Sarah Johnson',
      authorAvatar: 'https://via.placeholder.com/50x50?text=SJ',
      summary: 'Learn about proteins, carbohydrates, and fats - the building blocks of optimal athletic performance.',
      content: 'Detailed article content about macronutrients...',
      keyPoints: [
        'Protein requirements for muscle building',
        'Carbohydrate timing for energy',
        'Healthy fats for hormone production',
        'Daily macro calculations'
      ],
      quiz: [
        {
          question: 'How much protein should an athlete consume per kg of body weight?',
          options: ['0.8g', '1.2-2.0g', '3.0g', '0.5g'],
          correct: 1
        }
      ]
    },
    {
      id: 2,
      title: 'Hydration Strategies for Peak Performance',
      category: 'hydration',
      readTime: 5,
      difficulty: 'Beginner',
      points: 15,
      thumbnail: 'https://via.placeholder.com/300x200?text=Hydration',
      author: 'Mike Rodriguez',
      authorAvatar: 'https://via.placeholder.com/50x50?text=MR',
      summary: 'Master the art of proper hydration before, during, and after training sessions.',
      content: 'Detailed article content about hydration...',
      keyPoints: [
        'Pre-exercise hydration protocols',
        'During exercise fluid replacement',
        'Post-exercise rehydration',
        'Electrolyte balance importance'
      ]
    },
    {
      id: 3,
      title: 'Supplement Science: What Really Works',
      category: 'supplements',
      readTime: 12,
      difficulty: 'Advanced',
      points: 40,
      thumbnail: 'https://via.placeholder.com/300x200?text=Supplements',
      author: 'Dr. Alex Chen',
      authorAvatar: 'https://via.placeholder.com/50x50?text=AC',
      summary: 'Evidence-based review of sports supplements and their effectiveness.',
      content: 'Detailed article content about supplements...',
      keyPoints: [
        'Proven supplements vs. marketing hype',
        'Timing and dosage protocols',
        'Safety considerations',
        'Cost-benefit analysis'
      ]
    },
    {
      id: 4,
      title: 'Post-Workout Nutrition: The Recovery Window',
      category: 'recovery',
      readTime: 6,
      difficulty: 'Intermediate',
      points: 20,
      thumbnail: 'https://via.placeholder.com/300x200?text=Recovery',
      author: 'Lisa Thompson',
      authorAvatar: 'https://via.placeholder.com/50x50?text=LT',
      summary: 'Optimize recovery with strategic post-workout nutrition timing and choices.',
      content: 'Detailed article content about recovery nutrition...',
      keyPoints: [
        'The anabolic window explained',
        'Protein synthesis optimization',
        'Glycogen replenishment',
        'Anti-inflammatory foods'
      ]
    }
  ];

  const achievements = [
    { id: 1, title: 'Nutrition Novice', description: 'Read your first article', icon: 'school', earned: true },
    { id: 2, title: 'Knowledge Seeker', description: 'Complete 5 quizzes', icon: 'quiz', earned: false },
    { id: 3, title: 'Macro Master', description: 'Complete all macronutrient articles', icon: 'pie-chart', earned: false },
    { id: 4, title: 'Hydration Hero', description: 'Master hydration strategies', icon: 'local-drink', earned: true },
  ];

  useEffect(() => {
    // Initialize animations
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Load bookmarked articles from storage
    loadBookmarkedArticles();
  }, []);

  const loadBookmarkedArticles = async () => {
    try {
      // Implementation for loading bookmarked articles from AsyncStorage
      // const bookmarks = await AsyncStorage.getItem('bookmarkedArticles');
      // setBookmarkedArticles(bookmarks ? JSON.parse(bookmarks) : []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
    Vibration.vibrate(50);
  };

  const handleArticlePress = (article) => {
    setSelectedArticle(article);
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  const handleBookmark = (articleId) => {
    const isBookmarked = bookmarkedArticles.includes(articleId);
    if (isBookmarked) {
      setBookmarkedArticles(prev => prev.filter(id => id !== articleId));
    } else {
      setBookmarkedArticles(prev => [...prev, articleId]);
    }
    Vibration.vibrate(50);
  };

  const markAsRead = (articleId) => {
    setReadingProgress(prev => ({
      ...prev,
      [articleId]: 100
    }));
  };

  const filteredArticles = educationArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderCategoryChip = ({ item }) => (
    <Chip
      key={item.id}
      selected={selectedCategory === item.id}
      onPress={() => handleCategoryPress(item.id)}
      style={[
        styles.categoryChip,
        selectedCategory === item.id && { backgroundColor: item.color }
      ]}
      textStyle={{
        color: selectedCategory === item.id ? COLORS.surface : COLORS.text
      }}
      icon={() => (
        <Icon 
          name={item.icon} 
          size={16} 
          color={selectedCategory === item.id ? COLORS.surface : COLORS.textSecondary} 
        />
      )}
    >
      {item.name}
    </Chip>
  );

  const renderArticleCard = ({ item }) => {
    const isBookmarked = bookmarkedArticles.includes(item.id);
    const progress = readingProgress[item.id] || 0;
    
    return (
      <Card style={styles.articleCard} onPress={() => handleArticlePress(item)}>
        <Card.Content>
          <View style={styles.articleHeader}>
            <View style={styles.articleInfo}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.xs }]}>{item.title}</Text>
              <View style={styles.articleMeta}>
                <Chip 
                  compact 
                  style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(item.difficulty) }]}
                  textStyle={{ color: COLORS.surface, fontSize: 10 }}
                >
                  {item.difficulty}
                </Chip>
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                  {item.readTime} min read
                </Text>
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                  +{item.points} pts 🏆
                </Text>
              </View>
            </View>
            <IconButton
              icon={isBookmarked ? 'bookmark' : 'bookmark-border'}
              iconColor={isBookmarked ? COLORS.warning : COLORS.textSecondary}
              size={24}
              onPress={() => handleBookmark(item.id)}
            />
          </View>
          
          <Text style={[TEXT_STYLES.bodySecondary, { marginVertical: SPACING.sm }]}>
            {item.summary}
          </Text>
          
          <View style={styles.authorSection}>
            <Avatar.Image size={32} source={{ uri: item.authorAvatar }} />
            <Text style={[TEXT_STYLES.bodySecondary, { marginLeft: SPACING.sm }]}>
              By {item.author}
            </Text>
          </View>
          
          {progress > 0 && (
            <View style={styles.progressSection}>
              <Text style={TEXT_STYLES.caption}>Progress: {progress}%</Text>
              <ProgressBar 
                progress={progress / 100} 
                color={COLORS.success}
                style={styles.progressBar}
              />
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const renderAchievementBadge = ({ item }) => (
    <Surface style={[styles.achievementBadge, item.earned && styles.achievementEarned]}>
      <Icon 
        name={item.icon} 
        size={32} 
        color={item.earned ? COLORS.warning : COLORS.textSecondary} 
      />
      <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs, textAlign: 'center' }]}>
        {item.title}
      </Text>
      {item.earned && (
        <View style={styles.earnedBadge}>
          <Icon name="check" size={12} color={COLORS.surface} />
        </View>
      )}
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.surface }]}>
            Nutrition Education 📚
          </Text>
          <Text style={[TEXT_STYLES.bodySecondary, { color: COLORS.surface, opacity: 0.9 }]}>
            Master the science of sports nutrition
          </Text>
        </View>
      </LinearGradient>

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
      >
        {/* Search Bar */}
        <View style={styles.section}>
          <Searchbar
            placeholder="Search nutrition topics..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {nutritionCategories.map((category) => renderCategoryChip({ item: category }))}
            </View>
          </ScrollView>
        </View>

        {/* Achievements Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h3}>Your Progress 🎯</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
              <Text style={[TEXT_STYLES.bodySecondary, { color: COLORS.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.achievementsContainer}>
              {achievements.slice(0, 4).map((achievement) => renderAchievementBadge({ item: achievement }))}
            </View>
          </ScrollView>
        </View>

        {/* Articles */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Educational Articles ({filteredArticles.length})
          </Text>
          {filteredArticles.map((article) => renderArticleCard({ item: article }))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Quick Tools</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Feature Coming Soon', 'Macro calculator will be available in the next update! 🚀')}
            >
              <Icon name="calculate" size={32} color={COLORS.primary} />
              <Text style={TEXT_STYLES.bodySecondary}>Macro Calculator</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Feature Coming Soon', 'Meal planner will be available in the next update! 🚀')}
            >
              <Icon name="restaurant-menu" size={32} color={COLORS.success} />
              <Text style={TEXT_STYLES.bodySecondary}>Meal Planner</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Feature Coming Soon', 'Hydration tracker will be available in the next update! 🚀')}
            >
              <Icon name="local-drink" size={32} color={COLORS.secondary} />
              <Text style={TEXT_STYLES.bodySecondary}>Hydration Tracker</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Feature Coming Soon', 'Recipe library will be available in the next update! 🚀')}
            >
              <Icon name="book" size={32} color={COLORS.warning} />
              <Text style={TEXT_STYLES.bodySecondary}>Recipe Library</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Article Detail Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedArticle && (
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalHeader}>
                <Text style={[TEXT_STYLES.h2, { flex: 1 }]}>{selectedArticle.title}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>
              
              <View style={styles.articleDetailMeta}>
                <Text style={TEXT_STYLES.bodySecondary}>By {selectedArticle.author}</Text>
                <Text style={TEXT_STYLES.bodySecondary}>{selectedArticle.readTime} min read</Text>
              </View>
              
              <Text style={[TEXT_STYLES.body, { marginVertical: SPACING.lg }]}>
                {selectedArticle.summary}
              </Text>
              
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Key Points:</Text>
              {selectedArticle.keyPoints.map((point, index) => (
                <View key={index} style={styles.keyPoint}>
                  <Icon name="check-circle" size={20} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>
                    {point}
                  </Text>
                </View>
              ))}
              
              <Button
                mode="contained"
                onPress={() => {
                  markAsRead(selectedArticle.id);
                  setModalVisible(false);
                  Alert.alert('Great Job! 🎉', `You've earned ${selectedArticle.points} points!`);
                }}
                style={styles.completeButton}
                buttonColor={COLORS.success}
              >
                Mark as Complete (+{selectedArticle.points} pts)
              </Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Create custom nutrition content will be available in the next update! 🚀')}
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingRight: SPACING.lg,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  articleCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  articleInfo: {
    flex: 1,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  difficultyChip: {
    height: 24,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    marginTop: SPACING.xs,
    height: 6,
  },
  achievementsContainer: {
    flexDirection: 'row',
    paddingRight: SPACING.lg,
  },
  achievementBadge: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    position: 'relative',
  },
  achievementEarned: {
    backgroundColor: COLORS.surface,
  },
  earnedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.success,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - (SPACING.lg * 3)) / 2,
    height: 100,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 2,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: height * 0.8,
  },
  modalScrollView: {
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  articleDetailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  completeButton: {
    marginTop: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
});

export default NutritionEducation;