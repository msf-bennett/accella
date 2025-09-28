import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Vibration,
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
  Portal,
  Searchbar,
  ProgressBar,
} from 'react-native-paper';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your design constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  accent: '#9c27b0',
  info: '#2196f3',
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
  h2: { fontSize: 22, fontWeight: '600' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
};

const { width, height } = Dimensions.get('window');

const KnowledgeBase = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading, bookmarks, recentlyViewed } = useSelector(state => ({
    user: state.auth.user,
    isLoading: state.content.isLoading || false,
    bookmarks: state.content.bookmarks || [],
    recentlyViewed: state.content.recentlyViewed || [],
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [readingProgress, setReadingProgress] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // dispatch(fetchKnowledgeBaseContent());
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh knowledge base content');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleBookmark = (articleId) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Vibration.vibrate(50);
    }
    // dispatch(toggleBookmark(articleId));
  };

  const handleReadArticle = (article) => {
    // dispatch(addToRecentlyViewed(article.id));
    navigation.navigate('ArticleReader', { articleId: article.id });
  };

  const handleWatchVideo = (video) => {
    Alert.alert(
      'Watch Video',
      `Ready to watch "${video.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Watch', 
          onPress: () => {
            navigation.navigate('VideoPlayer', { videoId: video.id });
          }
        }
      ]
    );
  };

  const handleDownloadResource = (resource) => {
    Alert.alert(
      'Download Resource',
      `Download "${resource.title}" for offline access?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Download', 
          onPress: () => {
            // dispatch(downloadResource(resource.id));
            Alert.alert('Success', 'Resource downloaded successfully!');
          }
        }
      ]
    );
  };

  // Mock data for knowledge base content
  const categories = [
    { id: 'all', name: 'All Topics', icon: 'library-books', count: 156 },
    { id: 'anatomy', name: 'Anatomy & Physiology', icon: 'favorite', count: 24 },
    { id: 'nutrition', name: 'Sports Nutrition', icon: 'local-dining', count: 32 },
    { id: 'psychology', name: 'Sports Psychology', icon: 'psychology', count: 18 },
    { id: 'biomechanics', name: 'Biomechanics', icon: 'directions-run', count: 21 },
    { id: 'injury', name: 'Injury Prevention', icon: 'healing', count: 28 },
    { id: 'recovery', name: 'Recovery Methods', icon: 'spa', count: 19 },
    { id: 'training', name: 'Training Science', icon: 'fitness-center', count: 14 },
  ];

  const featuredContent = [
    {
      id: 1,
      type: 'article',
      title: 'Advanced Periodization Strategies for Elite Athletes',
      author: 'Dr. Sarah Johnson',
      readTime: 12,
      difficulty: 'Advanced',
      category: 'training',
      thumbnail: null,
      summary: 'Comprehensive guide to periodization models including linear, non-linear, and block periodization approaches.',
      tags: ['periodization', 'elite training', 'performance'],
      downloads: 2847,
      rating: 4.8,
      isBookmarked: false,
      progress: 0,
    },
    {
      id: 2,
      type: 'video',
      title: 'Functional Movement Assessment Techniques',
      author: 'Mike Thompson, PT',
      duration: '18:34',
      difficulty: 'Intermediate',
      category: 'biomechanics',
      thumbnail: null,
      summary: 'Learn to identify movement dysfunctions and create corrective exercise programs.',
      tags: ['movement assessment', 'FMS', 'corrective exercise'],
      views: 15623,
      rating: 4.7,
      isBookmarked: true,
    },
    {
      id: 3,
      type: 'research',
      title: 'Impact of Sleep Quality on Athletic Performance',
      author: 'Sports Science Journal',
      readTime: 8,
      difficulty: 'Intermediate',
      category: 'recovery',
      thumbnail: null,
      summary: 'Recent research findings on the relationship between sleep quality and performance metrics.',
      tags: ['sleep', 'recovery', 'performance', 'research'],
      downloads: 1245,
      rating: 4.9,
      isBookmarked: false,
      progress: 65,
    },
  ];

  const recentArticles = [
    {
      id: 4,
      type: 'article',
      title: 'Nutrition Timing for Strength Athletes',
      author: 'Lisa Martinez, RD',
      readTime: 6,
      category: 'nutrition',
      publishDate: '2024-08-15',
      rating: 4.6,
    },
    {
      id: 5,
      type: 'video',
      title: 'Mental Training Techniques for Competition',
      author: 'Dr. Alex Chen',
      duration: '22:15',
      category: 'psychology',
      publishDate: '2024-08-12',
      rating: 4.8,
    },
    {
      id: 6,
      type: 'guide',
      title: 'Complete Guide to Plyometric Training',
      author: 'Training Institute',
      pages: 45,
      category: 'training',
      publishDate: '2024-08-10',
      rating: 4.7,
    },
  ];

  const filteredContent = featuredContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesBookmarks = !bookmarksOnly || item.isBookmarked;
    return matchesSearch && matchesCategory && matchesBookmarks;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'article': return 'article';
      case 'video': return 'play-circle-filled';
      case 'research': return 'science';
      case 'guide': return 'menu-book';
      default: return 'description';
    }
  };

  const renderCategoryChip = ({ item, index }) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => {
        setSelectedCategory(item.id);
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Vibration.vibrate(30);
        }
      }}
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.selectedCategoryChip
      ]}
    >
      <Icon 
        name={item.icon} 
        size={18} 
        color={selectedCategory === item.id ? COLORS.white : COLORS.primary} 
      />
      <Text style={[
        styles.categoryChipText,
        selectedCategory === item.id && { color: COLORS.white }
      ]}>
        {item.name}
      </Text>
      <Chip
        style={[
          styles.countChip,
          { backgroundColor: selectedCategory === item.id ? 'rgba(255,255,255,0.2)' : COLORS.background }
        ]}
        textStyle={{ 
          color: selectedCategory === item.id ? COLORS.white : COLORS.textSecondary,
          fontSize: 10 
        }}
      >
        {item.count}
      </Chip>
    </TouchableOpacity>
  );

  const renderFeaturedCard = ({ item, index }) => {
    const cardScale = new Animated.Value(0.95);
    const animateCard = () => {
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    useEffect(() => {
      const timeout = setTimeout(animateCard, index * 200);
      return () => clearTimeout(timeout);
    }, []);

    return (
      <Animated.View
        style={[
          styles.featuredCard,
          { transform: [{ scale: cardScale }] }
        ]}
      >
        <Card style={styles.contentCard}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.cardHeader}
          >
            <View style={styles.cardHeaderContent}>
              <View style={styles.typeIndicator}>
                <Icon 
                  name={getTypeIcon(item.type)} 
                  size={20} 
                  color={COLORS.white} 
                />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.white, marginLeft: 4 }]}>
                  {item.type.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleBookmark(item.id)}
                style={styles.bookmarkButton}
              >
                <Icon 
                  name={item.isBookmarked ? 'bookmark' : 'bookmark-border'} 
                  size={22} 
                  color={COLORS.white} 
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <Card.Content style={styles.contentBody}>
            <Text style={[TEXT_STYLES.h3, styles.contentTitle]}>
              {item.title}
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.authorText]}>
              by {item.author}
            </Text>
            
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.small, { marginLeft: 4 }]}>
                  {item.readTime ? `${item.readTime} min read` : item.duration || `${item.pages} pages`}
                </Text>
              </View>
              <Chip
                style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(item.difficulty) }]}
                textStyle={{ color: COLORS.white, fontSize: 10 }}
              >
                {item.difficulty}
              </Chip>
            </View>

            <Text style={[TEXT_STYLES.small, styles.summaryText]}>
              {item.summary}
            </Text>

            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  style={styles.tagChip}
                  textStyle={{ fontSize: 10 }}
                >
                  {tag}
                </Chip>
              ))}
            </View>

            {item.progress > 0 && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>
                    Progress
                  </Text>
                  <Text style={[TEXT_STYLES.small, { color: COLORS.primary }]}>
                    {item.progress}%
                  </Text>
                </View>
                <ProgressBar
                  progress={item.progress / 100}
                  color={COLORS.primary}
                  style={styles.progressBar}
                />
              </View>
            )}

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={[TEXT_STYLES.small, { marginLeft: 4 }]}>
                  {item.rating}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon 
                  name={item.type === 'video' ? 'visibility' : 'get-app'} 
                  size={16} 
                  color={COLORS.textSecondary} 
                />
                <Text style={[TEXT_STYLES.small, { marginLeft: 4 }]}>
                  {item.type === 'video' ? item.views : item.downloads}
                </Text>
              </View>
            </View>
          </Card.Content>

          <Card.Actions style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => handleDownloadResource(item)}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
            >
              <Icon name="download" size={16} />
              Save
            </Button>
            <Button
              mode="contained"
              onPress={() => item.type === 'video' ? handleWatchVideo(item) : handleReadArticle(item)}
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              contentStyle={styles.buttonContent}
            >
              <Icon name={item.type === 'video' ? 'play-arrow' : 'read-more'} size={16} color={COLORS.white} />
              {item.type === 'video' ? 'Watch' : 'Read'}
            </Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  const renderRecentItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => item.type === 'video' ? handleWatchVideo(item) : handleReadArticle(item)}
      style={styles.recentItem}
    >
      <View style={styles.recentIcon}>
        <Icon 
          name={getTypeIcon(item.type)} 
          size={24} 
          color={COLORS.primary} 
        />
      </View>
      <View style={styles.recentContent}>
        <Text style={[TEXT_STYLES.body, styles.recentTitle]}>
          {item.title}
        </Text>
        <Text style={[TEXT_STYLES.caption, styles.recentAuthor]}>
          {item.author}
        </Text>
        <View style={styles.recentMeta}>
          <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>
            {item.publishDate}
          </Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.small, { marginLeft: 2 }]}>
              {item.rating}
            </Text>
          </View>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="search-off" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: 16 }]}>
        No content found
      </Text>
      <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 }]}>
        Try adjusting your search or filter criteria
      </Text>
    </View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        contentContainerStyle={styles.modalContent}
        transparent
      >
        <View style={styles.modalOverlay}>
          <BlurView 
            intensity={20} 
            tint="light" 
            style={styles.blurContainer}
          >
            <Surface style={styles.modalSurface}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: 20 }]}>Filter Content</Text>
              
              <View style={styles.filterSection}>
                <Text style={[TEXT_STYLES.body, { marginBottom: 12 }]}>Content Type</Text>
                {['all', 'article', 'video', 'research', 'guide'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      setSelectedCategory(type);
                      if (Platform.OS === 'ios' || Platform.OS === 'android') {
                        Vibration.vibrate(50);
                      }
                    }}
                    style={[
                      styles.filterOption,
                      selectedCategory === type && styles.selectedFilter
                    ]}
                  >
                    <Text style={[
                      TEXT_STYLES.body,
                      selectedCategory === type && { color: COLORS.white }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                    {selectedCategory === type && (
                      <Icon name="check" size={20} color={COLORS.white} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.filterSection}>
                <TouchableOpacity
                  onPress={() => {
                    setBookmarksOnly(!bookmarksOnly);
                    if (Platform.OS === 'ios' || Platform.OS === 'android') {
                      Vibration.vibrate(50);
                    }
                  }}
                  style={[
                    styles.filterOption,
                    bookmarksOnly && styles.selectedFilter
                  ]}
                >
                  <Text style={[
                    TEXT_STYLES.body,
                    bookmarksOnly && { color: COLORS.white }
                  ]}>
                    Bookmarked Only
                  </Text>
                  {bookmarksOnly && (
                    <Icon name="check" size={20} color={COLORS.white} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSelectedCategory('all');
                    setBookmarksOnly(false);
                  }}
                  style={styles.modalButton}
                >
                  Clear
                </Button>
                <Button
                  mode="contained"
                  onPress={() => setFilterModalVisible(false)}
                  style={styles.modalButton}
                >
                  Apply
                </Button>
              </View>
            </Surface>
          </BlurView>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>
              Knowledge Base
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
              Expand your expertise with research-backed content
            </Text>
          </View>
          <IconButton
            icon="filter-list"
            size={24}
            iconColor={COLORS.white}
            onPress={() => setFilterModalVisible(true)}
            style={styles.filterButton}
          />
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search articles, videos, guides..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.text }}
        />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
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
          {/* Categories */}
          <View style={styles.section}>
            <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>Categories</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
            >
              {categories.map((category) => renderCategoryChip({ item: category }))}
            </ScrollView>
          </View>

          {/* Featured Content */}
          <View style={styles.section}>
            <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>Featured Content</Text>
            <FlatList
              data={filteredContent}
              renderItem={renderFeaturedCard}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyState}
              scrollEnabled={false}
            />
          </View>

          {/* Recent Articles */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>Recently Added</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AllArticles')}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentContainer}>
              {recentArticles.map((item, index) => renderRecentItem({ item, index }))}
            </View>
          </View>

          {/* Progress Stats */}
          <View style={[styles.section, { marginBottom: 100 }]}>
            <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>Your Progress</Text>
            <Card style={styles.statsCard}>
              <Card.Content>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={[TEXT_STYLES.h1, { color: COLORS.primary }]}>24</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      Articles Read
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[TEXT_STYLES.h1, { color: COLORS.success }]}>12</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      Videos Watched
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[TEXT_STYLES.h1, { color: COLORS.warning }]}>8</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      Bookmarks
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </Animated.View>

      <FAB
        icon="bookmark"
        style={[styles.fab, { backgroundColor: COLORS.accent }]}
        onPress={() => {
          setBookmarksOnly(!bookmarksOnly);
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            Vibration.vibrate(50);
          }
        }}
        label={bookmarksOnly ? "Show All" : "Bookmarks"}
      />

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    backgroundColor: COLORS.background,
    elevation: 0,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoriesContainer: {
    paddingVertical: SPACING.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    marginLeft: SPACING.xs,
    marginRight: SPACING.xs,
    color: COLORS.text,
  },
  countChip: {
    height: 20,
    marginLeft: SPACING.xs,
  },
  featuredCard: {
    marginBottom: SPACING.md,
  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkButton: {
    padding: SPACING.xs,
  },
  contentBody: {
    paddingTop: SPACING.md,
  },
  contentTitle: {
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  authorText: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyChip: {
    height: 24,
  },
  summaryText: {
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  tagChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  progressSection: {
    marginBottom: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActions: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
  },
  recentContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    marginBottom: 4,
    color: COLORS.text,
  },
  recentAuthor: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  recentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  blurContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSurface: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: SPACING.lg,
    borderRadius: 12,
    width: width * 0.85,
    maxHeight: height * 0.7,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  selectedFilter: {
    backgroundColor: COLORS.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default KnowledgeBase;