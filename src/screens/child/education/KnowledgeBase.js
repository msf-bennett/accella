import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Alert,
  Vibration,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const KnowledgeBase = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(['football-rules', 'basketball-tips']);
  const [recentlyViewed, setRecentlyViewed] = useState(['swimming-basics', 'nutrition-guide']);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Knowledge base articles data
  const [articles, setArticles] = useState([
    {
      id: 'football-rules',
      title: 'Football Rules Made Simple',
      category: 'Rules',
      sport: 'Football',
      readTime: '3 min',
      difficulty: 'Beginner',
      views: 2456,
      likes: 189,
      summary: 'Learn the basic rules of football in a fun and easy way!',
      content: `
## Basic Football Rules ⚽

### The Field
- Football is played on a rectangular field
- Two goals at each end
- The field is divided into two halves

### Players
- Each team has 11 players on the field
- One goalkeeper per team
- Players can use any part of their body except hands and arms
- Only the goalkeeper can use hands (in their penalty area)

### The Game
- Match lasts 90 minutes (two 45-minute halves)
- The team with more goals wins!
- If the ball goes out of bounds, play restarts with throw-ins or kicks

### Fun Facts
- The goalkeeper is the only player who can touch the ball with hands! 🥅
- A football field is about 100 meters long 📏
- The fastest goal ever scored was in 2.8 seconds! ⚡
      `,
      icon: 'sports_soccer',
      color: '#4CAF50',
      tags: ['basics', 'rules', 'beginner'],
      lastUpdated: '2024-08-20'
    },
    {
      id: 'basketball-tips',
      title: 'Basketball Skills for Beginners',
      category: 'Skills',
      sport: 'Basketball',
      readTime: '4 min',
      difficulty: 'Beginner',
      views: 1876,
      likes: 142,
      summary: 'Master the fundamental basketball skills step by step!',
      content: `
## Basketball Fundamentals 🏀

### Dribbling
- Keep your eyes up, not on the ball
- Use your fingertips, not your palm
- Practice with both hands
- Start slow, then increase speed

### Shooting
- Keep your shooting hand under the ball
- Use your guide hand on the side
- Follow through with your wrist
- Practice free throws daily

### Passing
- Chest pass for accuracy
- Bounce pass to avoid defenders
- Overhead pass for long distances
- Always aim for your teammate's chest

### Defense
- Stay low in defensive stance
- Keep your hands active
- Watch the opponent's midsection
- Communicate with your team

### Fun Tips
- Michael Jordan was cut from his high school team! 🏆
- Practice makes perfect - even pros practice basics daily 💪
- The basketball hoop is exactly 10 feet high 📐
      `,
      icon: 'sports_basketball',
      color: '#FF9800',
      tags: ['skills', 'fundamentals', 'practice'],
      lastUpdated: '2024-08-18'
    },
    {
      id: 'swimming-basics',
      title: 'Swimming Safety & Techniques',
      category: 'Safety',
      sport: 'Swimming',
      readTime: '5 min',
      difficulty: 'Beginner',
      views: 3201,
      likes: 278,
      summary: 'Essential swimming safety tips and basic techniques for young swimmers.',
      content: `
## Swimming Safety First! 🏊‍♂️

### Water Safety Rules
- Never swim alone - always have a buddy
- Always have an adult watching
- Learn to float before learning strokes
- Stay in areas where you can stand up

### Basic Techniques
- **Floating**: Relax and let the water support you
- **Breathing**: Turn your head to the side, not up
- **Kicking**: Keep legs straight, kick from the hips
- **Arms**: Reach forward and pull through the water

### Swimming Strokes
1. **Freestyle** - The fastest stroke
2. **Backstroke** - Swimming on your back
3. **Breaststroke** - Frog-like movements
4. **Butterfly** - Advanced stroke with both arms together

### Pool Rules
- Walk, don't run around the pool
- Wait for the "all clear" before diving
- Listen to the lifeguard always
- Stay hydrated and take breaks

### Amazing Facts
- Humans can float naturally in saltwater! 🌊
- Olympic swimmers can hold their breath for over 2 minutes 💨
- Swimming uses almost every muscle in your body! 💪
      `,
      icon: 'pool',
      color: '#2196F3',
      tags: ['safety', 'techniques', 'water'],
      lastUpdated: '2024-08-22'
    },
    {
      id: 'nutrition-guide',
      title: 'Eating Like a Champion',
      category: 'Nutrition',
      sport: 'General',
      readTime: '4 min',
      difficulty: 'Beginner',
      views: 1654,
      likes: 198,
      summary: 'Learn what foods fuel your body for peak athletic performance!',
      content: `
## Nutrition for Young Athletes 🍎

### Power Foods for Energy
- **Bananas** 🍌 - Quick energy and potassium
- **Oatmeal** 🥣 - Long-lasting energy
- **Sweet Potatoes** 🍠 - Complex carbohydrates
- **Whole Grain Bread** 🍞 - Sustained fuel

### Protein for Strong Muscles
- **Chicken** 🐔 - Lean protein
- **Fish** 🐟 - Protein plus omega-3s
- **Eggs** 🥚 - Complete protein
- **Greek Yogurt** 🥛 - Protein and probiotics

### Hydration Heroes
- **Water** 💧 - Your best friend!
- **Milk** 🥛 - Protein and calcium
- **Fresh Fruit Juice** 🧃 - Vitamins and minerals
- Avoid too many sugary drinks

### Pre-Game Meals
- Eat 2-3 hours before playing
- Include carbs and a little protein
- Stay hydrated throughout the day
- Avoid heavy, greasy foods

### Recovery Foods
- Eat within 30 minutes after exercise
- Combine protein and carbs
- Chocolate milk is a great recovery drink!
- Don't forget fruits and vegetables

### Fun Nutrition Facts
- Your brain needs glucose to think clearly! 🧠
- Athletes need more water than regular people 💧
- Eating colorful foods gives you different vitamins! 🌈
      `,
      icon: 'restaurant',
      color: '#4CAF50',
      tags: ['nutrition', 'health', 'performance'],
      lastUpdated: '2024-08-19'
    },
    {
      id: 'tennis-fundamentals',
      title: 'Tennis Basics for Kids',
      category: 'Skills',
      sport: 'Tennis',
      readTime: '3 min',
      difficulty: 'Beginner',
      views: 987,
      likes: 76,
      summary: 'Get started with tennis - the sport for a lifetime!',
      content: `
## Tennis Fundamentals 🎾

### Equipment Basics
- **Racket** - Choose the right size for your height
- **Balls** - Use low-compression balls for learning
- **Shoes** - Tennis shoes with good grip
- **Comfortable Clothes** - Move freely!

### Basic Strokes
- **Forehand** - Hit with your dominant hand side
- **Backhand** - Hit from your non-dominant side
- **Serve** - Start each point
- **Volley** - Hit the ball before it bounces

### Court Knowledge
- Tennis court has different areas
- Singles court is narrower than doubles
- Net is 3 feet high in the middle
- Lines matter - in or out!

### Scoring System
- Points: 0 (love), 15, 30, 40, game
- Sets: First to win 6 games (with 2 game lead)
- Match: Usually best of 3 sets for kids

### Practice Tips
- Start close to the net, then move back
- Focus on getting the ball over the net first
- Practice your swing without a ball
- Have fun and be patient with yourself!

### Tennis Fun Facts
- Tennis balls are fuzzy to control their speed! 🎾
- Wimbledon only uses white tennis balls 🤍
- The fastest tennis serve was 163.7 mph! ⚡
      `,
      icon: 'sports_tennis',
      color: '#E91E63',
      tags: ['tennis', 'basics', 'equipment'],
      lastUpdated: '2024-08-21'
    },
    {
      id: 'sportsmanship-guide',
      title: 'Being a Good Sport',
      category: 'Character',
      sport: 'General',
      readTime: '2 min',
      difficulty: 'Beginner',
      views: 2103,
      likes: 245,
      summary: 'Learn the values that make you a true champion on and off the field!',
      content: `
## True Champions Show Good Sportsmanship 🏆

### What is Sportsmanship?
- Treating everyone with respect
- Playing fair and following rules
- Being gracious in victory and defeat
- Encouraging teammates and opponents

### Good Sport Behaviors
- **Shake hands** before and after games
- **Cheer for good plays** by both teams
- **Help opponents up** if they fall
- **Thank the referee** for their time
- **Listen to your coach** and teammates

### When You Win
- Be humble and gracious
- Congratulate the other team
- Don't show off or boast
- Remember that teamwork helped you win

### When You Lose
- Congratulate the winners sincerely
- Learn from mistakes without blaming others
- Keep your head up - there's always next time
- Focus on what you did well

### Being a Team Player
- Pass the ball to open teammates
- Encourage others when they make mistakes
- Work together toward the team goal
- Celebrate everyone's successes

### Character Values in Sports
- **Integrity** - Do the right thing even when no one is watching
- **Perseverance** - Never give up, even when things get tough
- **Respect** - For teammates, opponents, officials, and yourself
- **Responsibility** - Own your actions and decisions

### Remember
- Winning isn't everything - having fun and improving is! 😊
- Everyone makes mistakes - that's how we learn 📚
- True champions are made by their character, not just their trophies 🌟
      `,
      icon: 'emoji_events',
      color: '#9C27B0',
      tags: ['character', 'values', 'teamwork'],
      lastUpdated: '2024-08-17'
    }
  ]);

  const categories = ['all', 'Rules', 'Skills', 'Safety', 'Nutrition', 'Character'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      Alert.alert(
        'Knowledge Updated! 📚',
        'New articles and tips have been added to help you learn and grow as an athlete!',
        [{ text: 'Great!', style: 'default' }]
      );
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = (articleId) => {
    Vibration.vibrate(50);
    if (bookmarkedArticles.includes(articleId)) {
      setBookmarkedArticles(prev => prev.filter(id => id !== articleId));
      Alert.alert('📚', 'Removed from bookmarks!');
    } else {
      setBookmarkedArticles(prev => [...prev, articleId]);
      Alert.alert('⭐', 'Added to bookmarks!');
    }
  };

  const openArticle = (article) => {
    setSelectedArticle(article);
    setModalVisible(true);
    Vibration.vibrate(50);
    
    // Add to recently viewed if not already there
    if (!recentlyViewed.includes(article.id)) {
      setRecentlyViewed(prev => [article.id, ...prev.slice(0, 4)]);
    }
    
    // Increment view count
    setArticles(prev => prev.map(a => 
      a.id === article.id ? { ...a, views: a.views + 1 } : a
    ));
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': '#4CAF50',
      'Intermediate': '#FF9800',
      'Advanced': '#F44336'
    };
    return colors[difficulty] || '#757575';
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      'Rules': '📋',
      'Skills': '⚽',
      'Safety': '🛡️',
      'Nutrition': '🍎',
      'Character': '🏆'
    };
    return emojis[category] || '📚';
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
          Knowledge Base 📚
        </Text>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Your sports learning library!
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{articles.length}</Text>
            <Text style={styles.statLabel}>Articles</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{bookmarkedArticles.length}</Text>
            <Text style={styles.statLabel}>Bookmarked</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{recentlyViewed.length}</Text>
            <Text style={styles.statLabel}>Recent</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search knowledge base..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <Chip
            key={category}
            mode={selectedCategory === category ? 'flat' : 'outlined'}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedChip
            ]}
            textStyle={[
              styles.chipText,
              selectedCategory === category && styles.selectedChipText
            ]}
          >
            {category === 'all' ? 'All Topics 📚' : `${category} ${getCategoryEmoji(category)}`}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickAccess = () => {
    const popularArticles = articles
      .sort((a, b) => b.views - a.views)
      .slice(0, 3);
    
    return (
      <View style={styles.quickAccessSection}>
        <Text style={[TEXT_STYLES.h4, styles.quickAccessTitle]}>
          🔥 Popular This Week
        </Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.popularScroll}
          contentContainerStyle={styles.popularContainer}
        >
          {popularArticles.map((article) => (
            <TouchableOpacity
              key={`popular-${article.id}`}
              onPress={() => openArticle(article)}
              style={[styles.popularCard, { backgroundColor: article.color + '15' }]}
            >
              <Surface style={[styles.popularIcon, { backgroundColor: article.color }]}>
                <Icon name={article.icon} size={20} color="white" />
              </Surface>
              <Text style={styles.popularTitle} numberOfLines={2}>
                {article.title}
              </Text>
              <View style={styles.popularMeta}>
                <Text style={styles.popularViews}>
                  👀 {article.views.toLocaleString()}
                </Text>
                <Text style={styles.popularTime}>
                  ⏱️ {article.readTime}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderArticleCard = (article) => {
    const isBookmarked = bookmarkedArticles.includes(article.id);
    const isRecentlyViewed = recentlyViewed.includes(article.id);
    
    return (
      <Card key={article.id} style={styles.articleCard}>
        <TouchableOpacity
          onPress={() => openArticle(article)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[article.color + '20', article.color + '10']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Surface style={[styles.articleIcon, { backgroundColor: article.color }]}>
                <Icon name={article.icon} size={24} color="white" />
              </Surface>
              
              <View style={styles.articleInfo}>
                <Text style={[TEXT_STYLES.h4, styles.articleTitle]}>
                  {article.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.articleSummary]} numberOfLines={2}>
                  {article.summary}
                </Text>
                
                <View style={styles.articleMeta}>
                  <Chip
                    compact
                    style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(article.difficulty) }]}
                    textStyle={styles.difficultyText}
                  >
                    {article.difficulty}
                  </Chip>
                  <Text style={styles.readTime}>⏱️ {article.readTime}</Text>
                  <Text style={styles.sport}>🏃‍♂️ {article.sport}</Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={() => toggleBookmark(article.id)}
                style={styles.bookmarkButton}
              >
                <Icon
                  name={isBookmarked ? "bookmark" : "bookmark_border"}
                  size={24}
                  color={isBookmarked ? article.color : "#757575"}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.articleFooter}>
              <View style={styles.engagementRow}>
                <View style={styles.engagementItem}>
                  <Icon name="visibility" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.engagementText}>{article.views.toLocaleString()}</Text>
                </View>
                <View style={styles.engagementItem}>
                  <Icon name="favorite" size={16} color="#E91E63" />
                  <Text style={styles.engagementText}>{article.likes}</Text>
                </View>
                <View style={styles.engagementItem}>
                  <Text style={[styles.categoryTag, { color: article.color }]}>
                    {article.category} {getCategoryEmoji(article.category)}
                  </Text>
                </View>
              </View>
              
              {isRecentlyViewed && (
                <View style={styles.recentBadge}>
                  <Icon name="history" size={12} color="white" />
                  <Text style={styles.recentText}>Recently Viewed</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderArticleModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedArticle && (
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={[selectedArticle.color, selectedArticle.color + '80']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderRow}>
                <IconButton
                  icon="close"
                  iconColor="white"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
                <IconButton
                  icon={bookmarkedArticles.includes(selectedArticle.id) ? "bookmark" : "bookmark_border"}
                  iconColor="white"
                  size={24}
                  onPress={() => toggleBookmark(selectedArticle.id)}
                />
              </View>
              
              <Surface style={[styles.modalIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Icon name={selectedArticle.icon} size={32} color="white" />
              </Surface>
              
              <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
                {selectedArticle.title}
              </Text>
              <Text style={[TEXT_STYLES.body, styles.modalMeta]}>
                {selectedArticle.category} • {selectedArticle.readTime} • {selectedArticle.difficulty}
              </Text>
            </LinearGradient>
            
            <View style={styles.modalContent}>
              <Text style={styles.articleContent}>
                {selectedArticle.content}
              </Text>
              
              <Divider style={styles.divider} />
              
              <View style={styles.articleActions}>
                <Button
                  mode="outlined"
                  icon="thumb-up"
                  onPress={() => Alert.alert('👍', 'Thanks for the feedback!')}
                  style={styles.actionButton}
                >
                  Helpful ({selectedArticle.likes})
                </Button>
                <Button
                  mode="outlined"
                  icon="share"
                  onPress={() => Alert.alert('📤', 'Sharing feature coming soon!')}
                  style={styles.actionButton}
                >
                  Share
                </Button>
              </View>
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="search-off" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
        No Articles Found
      </Text>
      <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
        Try a different search term or category
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {renderSearchAndFilters()}
          {renderQuickAccess()}
          
          <View style={styles.articlesSection}>
            <View style={styles.sectionHeader}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                All Knowledge Articles 📖
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.sectionSubtitle]}>
                Tap any article to read and learn!
              </Text>
            </View>
            
            {filteredArticles.length > 0 ? (
              filteredArticles.map(renderArticleCard)
            ) : (
              renderEmptyState()
            )}
          </View>
        </Animated.View>
      </Animated.ScrollView>
      
      {renderArticleModal()}
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
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
  },
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
    marginHorizontal: SPACING.xs,
    backgroundColor: 'white',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
  },
  selectedChipText: {
    color: 'white',
  },
  quickAccessSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quickAccessTitle: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  popularScroll: {
    marginBottom: SPACING.md,
  },
  popularContainer: {
    paddingHorizontal: SPACING.xs,
  },
  popularCard: {
    width: 140,
    height: 120,
    borderRadius: 12,
    padding: SPACING.sm,
    marginHorizontal: SPACING.xs,
    justifyContent: 'space-between',
  },
  popularIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  popularTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  popularMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popularViews: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  popularTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  articlesSection: {
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
  },
  articleCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  articleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  articleInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  articleTitle: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  articleSummary: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  difficultyChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  readTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  sport: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  bookmarkButton: {
    padding: SPACING.xs,
  },
  articleFooter: {
    position: 'relative',
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  categoryTag: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  recentBadge: {
    position: 'absolute',
    top: -8,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontSize: 10,
    marginLeft: SPACING.xs,
  },
  modalContainer: {
    margin: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: height * 0.9,
    overflow: 'hidden',
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  modalMeta: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  modalContent: {
    padding: SPACING.lg,
  },
  articleContent: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  divider: {
    marginVertical: SPACING.lg,
  },
  articleActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default KnowledgeBase;