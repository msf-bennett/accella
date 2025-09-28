import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Alert,
  FlatList,
  ImageBackground,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Badge,
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  motivational: '#FF6B6B',
  inspiration: '#4ECDC4',
  wisdom: '#45B7D1',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' },
};

const { width, height } = Dimensions.get('window');

const MotivationalQuotes = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, favoriteQuotes, dailyQuote } = useSelector(state => ({
    user: state.auth.user,
    favoriteQuotes: state.quotes.favorites,
    dailyQuote: state.quotes.dailyQuote,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [likedQuotes, setLikedQuotes] = useState(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const quoteAnims = useRef({}).current;
  const dailyQuoteAnim = useRef(new Animated.Value(0)).current;

  // Mock data for demonstration
  const mockQuotes = [
    {
      id: '1',
      text: "Champions aren't made in comfort zones. They're forged in the fire of dedication and persistence.",
      author: 'Coach Johnson',
      category: 'motivation',
      sport: 'General',
      likes: 342,
      isDaily: true,
      backgroundColor: ['#FF6B6B', '#EE5A24'],
      image: 'https://via.placeholder.com/400x200/FF6B6B/ffffff?text=Champions',
      tags: ['dedication', 'persistence', 'growth'],
      date: '2024-08-24',
    },
    {
      id: '2',
      text: "The difference between ordinary and extraordinary is that little extra effort every single day.",
      author: 'Michael Jordan',
      category: 'success',
      sport: 'Basketball',
      likes: 567,
      isDaily: false,
      backgroundColor: ['#4ECDC4', '#44A08D'],
      image: 'https://via.placeholder.com/400x200/4ECDC4/ffffff?text=Extraordinary',
      tags: ['effort', 'consistency', 'excellence'],
      date: '2024-08-23',
    },
    {
      id: '3',
      text: "Your body can stand almost anything. It's your mind that you have to convince.",
      author: 'Unknown',
      category: 'mindset',
      sport: 'General',
      likes: 789,
      isDaily: false,
      backgroundColor: ['#45B7D1', '#2196F3'],
      image: 'https://via.placeholder.com/400x200/45B7D1/ffffff?text=Mindset',
      tags: ['mental strength', 'endurance', 'willpower'],
      date: '2024-08-22',
    },
    {
      id: '4',
      text: "Success isn't given. It's earned. In the gym, on the field, in every moment of doubt.",
      author: 'Serena Williams',
      category: 'success',
      sport: 'Tennis',
      likes: 445,
      isDaily: false,
      backgroundColor: ['#764ba2', '#667eea'],
      image: 'https://via.placeholder.com/400x200/764ba2/ffffff?text=Success',
      tags: ['earning success', 'hard work', 'perseverance'],
      date: '2024-08-21',
    },
    {
      id: '5',
      text: "The pain you feel today will be the strength you feel tomorrow.",
      author: 'Arnold Schwarzenegger',
      category: 'strength',
      sport: 'Fitness',
      likes: 623,
      isDaily: false,
      backgroundColor: ['#F093FB', '#F5576C'],
      image: 'https://via.placeholder.com/400x200/F093FB/ffffff?text=Strength',
      tags: ['growth', 'resilience', 'transformation'],
      date: '2024-08-20',
    },
    {
      id: '6',
      text: "Don't stop when you're tired. Stop when you're done.",
      author: 'Kobe Bryant',
      category: 'motivation',
      sport: 'Basketball',
      likes: 891,
      isDaily: false,
      backgroundColor: ['#FD746C', '#FF9068'],
      image: 'https://via.placeholder.com/400x200/FD746C/ffffff?text=Never+Stop',
      tags: ['persistence', 'determination', 'mamba mentality'],
      date: '2024-08-19',
    },
    {
      id: '7',
      text: "Believe in yourself and all that you are. Know that there is something inside you greater than any obstacle.",
      author: 'Christian D. Larson',
      category: 'confidence',
      sport: 'General',
      likes: 412,
      isDaily: false,
      backgroundColor: ['#36D1DC', '#5B86E5'],
      image: 'https://via.placeholder.com/400x200/36D1DC/ffffff?text=Believe',
      tags: ['self-belief', 'confidence', 'inner strength'],
      date: '2024-08-18',
    },
    {
      id: '8',
      text: "It's not about perfect. It's about effort and never giving up on yourself.",
      author: 'Jillian Michaels',
      category: 'perseverance',
      sport: 'Fitness',
      likes: 356,
      isDaily: false,
      backgroundColor: ['#A8E6CF', '#7FCDCD'],
      image: 'https://via.placeholder.com/400x200/A8E6CF/ffffff?text=Effort',
      tags: ['effort', 'self-compassion', 'progress'],
      date: '2024-08-17',
    },
  ];

  const categories = [
    { key: 'all', label: 'All Quotes', icon: 'format-quote', color: COLORS.primary },
    { key: 'motivation', label: 'Motivation', icon: 'local-fire-department', color: COLORS.motivational },
    { key: 'success', label: 'Success', icon: 'jump-rope', color: COLORS.warning },
    { key: 'mindset', label: 'Mindset', icon: 'psychology', color: COLORS.wisdom },
    { key: 'strength', label: 'Strength', icon: 'fitness-center', color: COLORS.success },
    { key: 'confidence', label: 'Confidence', icon: 'star', color: COLORS.inspiration },
    { key: 'perseverance', label: 'Perseverance', icon: 'trending-up', color: COLORS.secondary },
  ];

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent', true);

    // Initialize animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(dailyQuoteAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize quote animations
    mockQuotes.forEach((quote, index) => {
      quoteAnims[quote.id] = new Animated.Value(0);
      Animated.timing(quoteAnims[quote.id], {
        toValue: 1,
        duration: 800,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });

    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Quotes Refreshed', 'Fresh motivation loaded! 🌟');
    }, 1500);
  }, []);

  const handleLikeQuote = useCallback((quoteId) => {
    const newLikedQuotes = new Set(likedQuotes);
    if (newLikedQuotes.has(quoteId)) {
      newLikedQuotes.delete(quoteId);
    } else {
      newLikedQuotes.add(quoteId);
    }
    setLikedQuotes(newLikedQuotes);
  }, [likedQuotes]);

  const handleShareQuote = useCallback((quote) => {
    Alert.alert(
      'Share Quote',
      `Share this motivational quote: "${quote.text.substring(0, 50)}..."?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => Alert.alert('Feature Coming Soon', 'Social sharing will be available soon! 📱') }
      ]
    );
  }, []);

  const handleSaveQuote = useCallback((quote) => {
    Alert.alert(
      'Save to Favorites',
      `Save "${quote.text.substring(0, 50)}..." to your favorite quotes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: () => Alert.alert('Saved! ⭐', 'Quote added to your favorites') }
      ]
    );
  }, []);

  const getFilteredQuotes = () => {
    let filtered = mockQuotes;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quote => quote.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(quote =>
        quote.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getDailyQuote = () => mockQuotes.find(quote => quote.isDaily);

  const renderDailyQuote = () => {
    const dailyQuote = getDailyQuote();
    if (!dailyQuote) return null;

    return (
      <Animated.View
        style={[
          styles.dailyQuoteContainer,
          {
            opacity: dailyQuoteAnim,
            transform: [{
              scale: dailyQuoteAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            }],
          },
        ]}
      >
        <LinearGradient
          colors={dailyQuote.backgroundColor}
          style={styles.dailyQuoteCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.dailyQuoteHeader}>
            <View style={styles.dailyQuoteBadge}>
              <Icon name="wb-sunny" size={20} color="#fff" />
              <Text style={styles.dailyQuoteLabel}>Quote of the Day ☀️</Text>
            </View>
            <IconButton
              icon="dots-vertical"
              iconColor="#fff"
              size={20}
              onPress={() => Alert.alert('Feature Coming Soon', 'Quote options will be available soon!')}
            />
          </View>

          <Text style={styles.dailyQuoteText}>"{dailyQuote.text}"</Text>
          <Text style={styles.dailyQuoteAuthor}>- {dailyQuote.author}</Text>

          <View style={styles.dailyQuoteActions}>
            <TouchableOpacity
              style={styles.dailyQuoteAction}
              onPress={() => handleLikeQuote(dailyQuote.id)}
            >
              <Icon
                name={likedQuotes.has(dailyQuote.id) ? 'favorite' : 'favorite-border'}
                size={24}
                color="#fff"
              />
              <Text style={styles.dailyQuoteActionText}>{dailyQuote.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dailyQuoteAction}
              onPress={() => handleShareQuote(dailyQuote)}
            >
              <Icon name="share" size={24} color="#fff" />
              <Text style={styles.dailyQuoteActionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dailyQuoteAction}
              onPress={() => handleSaveQuote(dailyQuote)}
            >
              <Icon name="bookmark-border" size={24} color="#fff" />
              <Text style={styles.dailyQuoteActionText}>Save</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderQuoteCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.quoteCard,
        {
          opacity: quoteAnims[item.id] || 1,
          transform: [{
            translateY: quoteAnims[item.id] ? quoteAnims[item.id].interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }) : 0
          }],
        },
      ]}
    >
      <Card style={styles.card}>
        <LinearGradient
          colors={item.backgroundColor}
          style={styles.quoteGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.quoteHeader}>
            <View style={styles.quoteCategory}>
              <Chip
                mode="flat"
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
                icon={categories.find(cat => cat.key === item.category)?.icon || 'format-quote'}
              >
                {item.category}
              </Chip>
            </View>
            <Text style={styles.quoteSport}>{item.sport}</Text>
          </View>

          <View style={styles.quoteContent}>
            <Text style={styles.quoteText}>"{item.text}"</Text>
            <Text style={styles.quoteAuthor}>- {item.author}</Text>
          </View>

          <View style={styles.quoteTags}>
            {item.tags.slice(0, 3).map((tag, tagIndex) => (
              <Chip
                key={tagIndex}
                mode="outlined"
                compact
                style={styles.tagChip}
                textStyle={styles.tagText}
              >
                #{tag}
              </Chip>
            ))}
          </View>

          <View style={styles.quoteActions}>
            <TouchableOpacity
              style={styles.quoteAction}
              onPress={() => handleLikeQuote(item.id)}
            >
              <Icon
                name={likedQuotes.has(item.id) ? 'favorite' : 'favorite-border'}
                size={20}
                color="#fff"
              />
              <Text style={styles.quoteActionText}>{item.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quoteAction}
              onPress={() => handleShareQuote(item)}
            >
              <Icon name="share" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quoteAction}
              onPress={() => handleSaveQuote(item)}
            >
              <Icon name="bookmark-border" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quoteAction}
              onPress={() => Alert.alert('Feature Coming Soon', 'Quote details will be available soon!')}
            >
              <Icon name="more-horiz" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderCategoryChip = ({ item }) => (
    <Chip
      mode={selectedCategory === item.key ? 'flat' : 'outlined'}
      selected={selectedCategory === item.key}
      onPress={() => setSelectedCategory(item.key)}
      style={[
        styles.filterChip,
        selectedCategory === item.key && { backgroundColor: item.color + '20' }
      ]}
      textStyle={[
        styles.filterChipText,
        selectedCategory === item.key && { color: item.color }
      ]}
      icon={item.icon}
    >
      {item.label}
    </Chip>
  );

  const renderStatsSection = () => (
    <Surface style={styles.statsSection}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Your Motivation Stats 📊</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Icon name="favorite" size={24} color={COLORS.error} />
          <Text style={styles.statValue}>{likedQuotes.size}</Text>
          <Text style={styles.statLabel}>Liked Quotes</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="bookmark" size={24} color={COLORS.warning} />
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Saved Quotes</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="share" size={24} color={COLORS.success} />
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Shared Quotes</Text>
        </View>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              iconColor="#fff"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Daily Motivation 🌟</Text>
            <IconButton
              icon="shuffle"
              iconColor="#fff"
              size={24}
              onPress={() => {
                const randomIndex = Math.floor(Math.random() * mockQuotes.length);
                setCurrentQuoteIndex(randomIndex);
                Alert.alert('Random Quote', 'Shuffled to a random motivational quote! 🎲');
              }}
            />
          </View>

          <Searchbar
            placeholder="Search quotes, authors, tags..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
        </View>
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
        {/* Daily Quote */}
        {renderDailyQuote()}

        {/* Stats Section */}
        {renderStatsSection()}

        {/* Category Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Browse by Category</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryChip}
            keyExtractor={item => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          />
        </View>

        {/* Quotes List */}
        <View style={styles.quotesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'All Quotes' : `${categories.find(cat => cat.key === selectedCategory)?.label} Quotes`} 💭
            </Text>
            <Text style={styles.quotesCount}>
              {getFilteredQuotes().length} quotes
            </Text>
          </View>
          
          {getFilteredQuotes().map((quote, index) => (
            <View key={quote.id}>
              {renderQuoteCard({ item: quote, index })}
            </View>
          ))}

          {getFilteredQuotes().length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="format-quote" size={80} color={COLORS.border} />
              <Text style={styles.emptyStateTitle}>No Quotes Found</Text>
              <Text style={styles.emptyStateMessage}>
                Try adjusting your search or category filter
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: SPACING.xl * 2 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Submit your own motivational quote! ✨')}
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
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  content: {
    flex: 1,
  },
  dailyQuoteContainer: {
    margin: SPACING.md,
    marginBottom: SPACING.lg,
  },
  dailyQuoteCard: {
    borderRadius: 20,
    padding: SPACING.lg,
    elevation: 6,
  },
  dailyQuoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dailyQuoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dailyQuoteLabel: {
    ...TEXT_STYLES.body,
    color: '#fff',
    fontWeight: '600',
  },
  dailyQuoteText: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    lineHeight: 28,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  dailyQuoteAuthor: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'right',
    marginBottom: SPACING.lg,
  },
  dailyQuoteActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dailyQuoteAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
  },
  dailyQuoteActionText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    fontWeight: '600',
  },
  statsSection: {
    margin: SPACING.md,
    marginTop: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 3,
    padding: SPACING.lg,
  },
  statsHeader: {
    marginBottom: SPACING.md,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  filtersSection: {
    marginBottom: SPACING.lg,
  },
  filterTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    backgroundColor: '#fff',
    borderColor: COLORS.border,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  quotesSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  quotesCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  quoteCard: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  quoteGradient: {
    padding: SPACING.lg,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quoteCategory: {
    flex: 1,
  },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'transparent',
  },
  categoryChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  quoteSport: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.8,
  },
  quoteContent: {
    marginBottom: SPACING.lg,
  },
  quoteText: {
    ...TEXT_STYLES.body,
    color: '#fff',
    lineHeight: 24,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
    fontSize: 18,
  },
  quoteAuthor: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'right',
  },
  quoteTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tagChip: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.3)',
    height: 24,
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
  },
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
  },
  quoteActionText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyStateMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MotivationalQuotes;