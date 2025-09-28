import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
  Animated,
  Platform,
  Vibration,
  Image,
  Share,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Searchbar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  ProgressBar,
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System Imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SportsNews = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading, news } = useSelector((state) => ({
    user: state.auth.user,
    isLoading: state.news.isLoading,
    news: state.news.sportsNews || [],
  }));

  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredNews, setFilteredNews] = useState([]);
  const [bookmarkedNews, setBookmarkedNews] = useState(new Set());
  const [viewMode, setViewMode] = useState('feed'); // 'feed' or 'headlines'
  const [showCategories, setShowCategories] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for sports news
  const mockNews = [
    {
      id: '1',
      title: 'Olympic Swimming Records Broken at World Championships',
      summary: 'Three world records were shattered in the swimming events during the final day of competition, with athletes from multiple countries achieving historic performances.',
      category: 'Swimming',
      source: 'Sports Central',
      author: 'Michael Johnson',
      publishedAt: '2024-03-15T10:30:00Z',
      readTime: '3 min read',
      image: 'https://via.placeholder.com/400x250',
      tags: ['Olympics', 'World Records', 'Swimming'],
      views: 15420,
      comments: 89,
      likes: 1240,
      isBreaking: true,
      priority: 'high',
      content: 'In a spectacular display of athletic prowess, the World Swimming Championships concluded with three new world records...',
      videoUrl: null,
      relatedArticles: ['2', '3'],
    },
    {
      id: '2',
      title: 'Football Transfer Window: Major Signings Announced',
      summary: 'Several top-tier football clubs have announced significant player transfers ahead of the new season, reshaping team dynamics across major leagues.',
      category: 'Football',
      source: 'Football Today',
      author: 'Sarah Williams',
      publishedAt: '2024-03-14T16:45:00Z',
      readTime: '5 min read',
      image: 'https://via.placeholder.com/400x250',
      tags: ['Transfers', 'Football', 'Premier League'],
      views: 24680,
      comments: 156,
      likes: 2180,
      isBreaking: false,
      priority: 'medium',
      content: 'The football transfer market has been bustling with activity as clubs finalize their squads...',
      videoUrl: 'https://example.com/video1',
      relatedArticles: ['4', '5'],
    },
    {
      id: '3',
      title: 'Tennis Grand Slam: Upset Victory Shakes Tournament',
      summary: 'An unexpected upset in the tennis championships has eliminated the defending champion, opening new possibilities for emerging players.',
      category: 'Tennis',
      source: 'Tennis Weekly',
      author: 'David Chen',
      publishedAt: '2024-03-14T14:20:00Z',
      readTime: '4 min read',
      image: 'https://via.placeholder.com/400x250',
      tags: ['Grand Slam', 'Tennis', 'Upset'],
      views: 18950,
      comments: 234,
      likes: 1650,
      isBreaking: false,
      priority: 'medium',
      content: 'In a stunning turn of events at the tennis grand slam, the unseeded player delivered...',
      videoUrl: null,
      relatedArticles: ['1', '6'],
    },
    {
      id: '4',
      title: 'Basketball Draft: Rising Stars Ready for Professional Leagues',
      summary: 'The upcoming basketball draft promises to introduce exceptional talent to professional leagues, with several college standouts expected to make immediate impact.',
      category: 'Basketball',
      source: 'Hoop Dreams',
      author: 'Marcus Thompson',
      publishedAt: '2024-03-13T11:15:00Z',
      readTime: '6 min read',
      image: 'https://via.placeholder.com/400x250',
      tags: ['Draft', 'Basketball', 'College'],
      views: 12340,
      comments: 67,
      likes: 890,
      isBreaking: false,
      priority: 'low',
      content: 'The basketball draft season brings excitement as scouts evaluate the next generation...',
      videoUrl: 'https://example.com/video2',
      relatedArticles: ['2', '7'],
    },
    {
      id: '5',
      title: 'Marathon Training: New Scientific Approach Shows Results',
      summary: 'Recent studies reveal innovative training methodologies that are helping marathon runners achieve personal bests and reduce injury rates significantly.',
      category: 'Running',
      source: 'Runner\'s Science',
      author: 'Dr. Lisa Park',
      publishedAt: '2024-03-12T09:00:00Z',
      readTime: '7 min read',
      image: 'https://via.placeholder.com/400x250',
      tags: ['Marathon', 'Training', 'Science'],
      views: 8760,
      comments: 43,
      likes: 520,
      isBreaking: false,
      priority: 'low',
      content: 'Revolutionary training techniques are transforming how athletes prepare for marathons...',
      videoUrl: null,
      relatedArticles: ['1', '3'],
    },
  ];

  const newsCategories = [
    'All', 'Breaking', 'Football', 'Basketball', 'Tennis', 'Swimming', 
    'Running', 'Olympics', 'Transfers', 'Training', 'Health'
  ];

  // Initialize animations
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
    ]).start();

    setFilteredNews(mockNews);
  }, []);

  // Filter news
  useEffect(() => {
    let filtered = mockNews;

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory === 'Breaking') {
      filtered = filtered.filter(article => article.isBreaking);
    } else if (selectedCategory !== 'All') {
      filtered = filtered.filter(article => 
        article.category === selectedCategory || 
        article.tags.includes(selectedCategory)
      );
    }

    // Sort by priority and date
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    setFilteredNews(filtered);
  }, [searchQuery, selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('📰 News Updated', 'Latest sports news has been loaded!');
    }, 2000);
  }, []);

  const handleNewsPress = (article) => {
    Vibration.vibrate(50);
    Alert.alert(
      '📖 Read Article',
      `Feature coming soon!\n\nArticle: "${article.title}"\nSource: ${article.source}\n\nThis will open the full article with comments and related content.`
    );
  };

  const handleBookmark = (articleId) => {
    Vibration.vibrate(30);
    const newBookmarks = new Set(bookmarkedNews);
    if (newBookmarks.has(articleId)) {
      newBookmarks.delete(articleId);
      Alert.alert('🔖 Bookmark Removed', 'Article removed from your bookmarks');
    } else {
      newBookmarks.add(articleId);
      Alert.alert('🔖 Article Bookmarked', 'Article saved to your reading list');
    }
    setBookmarkedNews(newBookmarks);
  };

  const handleShare = async (article) => {
    try {
      Vibration.vibrate(50);
      await Share.share({
        message: `Check out this sports news: ${article.title}\n\n${article.summary}\n\nSource: ${article.source}`,
        title: article.title,
      });
    } catch (error) {
      Alert.alert('Share Failed', 'Unable to share article at this time');
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const publishDate = new Date(dateString);
    const diffInHours = Math.floor((now - publishDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const renderCategoryChips = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: SPACING.sm }}>
      {newsCategories.map((category) => (
        <Chip
          key={category}
          selected={selectedCategory === category}
          onPress={() => setSelectedCategory(category)}
          style={{
            marginRight: SPACING.sm,
            backgroundColor: selectedCategory === category ? COLORS.primary : COLORS.background,
          }}
          textStyle={{
            color: selectedCategory === category ? '#fff' : COLORS.text,
            fontWeight: selectedCategory === category ? 'bold' : 'normal',
          }}
          icon={category === 'Breaking' ? 'flash-on' : undefined}
        >
          {category}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderNewsCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <TouchableOpacity onPress={() => handleNewsPress(item)} activeOpacity={0.8}>
        <Card style={{ margin: SPACING.xs, elevation: 4 }}>
          {item.isBreaking && (
            <LinearGradient
              colors={['#ff4757', '#ff3838']}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.xs,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Icon name="flash-on" size={16} color="#fff" />
              <Text style={[TEXT_STYLES.caption, { color: '#fff', marginLeft: 4, fontWeight: 'bold' }]}>
                BREAKING NEWS
              </Text>
            </LinearGradient>
          )}

          <Image
            source={{ uri: item.image }}
            style={{
              width: '100%',
              height: 200,
              backgroundColor: COLORS.background,
            }}
            resizeMode="cover"
          />

          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Chip
                compact
                style={{
                  backgroundColor: COLORS.primary,
                  height: 20,
                }}
                textStyle={{ color: '#fff', fontSize: 10 }}
              >
                {item.category}
              </Chip>
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm, color: COLORS.textSecondary }]}>
                {item.source} • {formatTimeAgo(item.publishedAt)}
              </Text>
            </View>

            <Text style={[TEXT_STYLES.heading, { fontSize: 18, marginBottom: SPACING.sm }]}>
              {item.title}
            </Text>

            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.md }]}>
              {item.summary}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Avatar.Text
                size={24}
                label={item.author.split(' ').map(n => n[0]).join('')}
                style={{ backgroundColor: COLORS.primary }}
                labelStyle={{ fontSize: 10 }}
              />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm, flex: 1 }]}>
                By {item.author} • {item.readTime}
              </Text>
              {item.videoUrl && (
                <Icon name="play-circle-filled" size={20} color={COLORS.primary} />
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md }}>
                  <Icon name="visibility" size={16} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
                    {item.views.toLocaleString()}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md }}>
                  <Icon name="thumb-up" size={16} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
                    {item.likes.toLocaleString()}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="comment" size={16} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
                    {item.comments}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row' }}>
                <IconButton
                  icon={bookmarkedNews.has(item.id) ? 'bookmark' : 'bookmark-border'}
                  size={20}
                  iconColor={bookmarkedNews.has(item.id) ? COLORS.primary : COLORS.textSecondary}
                  onPress={() => handleBookmark(item.id)}
                />
                <IconButton
                  icon="share"
                  size={20}
                  iconColor={COLORS.textSecondary}
                  onPress={() => handleShare(item)}
                />
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: SPACING.sm }}>
              {item.tags.map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  compact
                  style={{
                    marginRight: SPACING.xs,
                    backgroundColor: COLORS.background,
                    height: 24,
                  }}
                  textStyle={{ fontSize: 10 }}
                  onPress={() => setSelectedCategory(tag)}
                >
                  #{tag}
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderTopNews = () => {
    const topNews = filteredNews.slice(0, 3);
    return (
      <View style={{ marginBottom: SPACING.md }}>
        <Text style={[TEXT_STYLES.subheading, { marginHorizontal: SPACING.md, marginBottom: SPACING.sm }]}>
          🔥 Top Stories
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {topNews.map((article, index) => (
            <TouchableOpacity
              key={article.id}
              onPress={() => handleNewsPress(article)}
              style={{ marginLeft: index === 0 ? SPACING.md : SPACING.xs, marginRight: SPACING.xs }}
            >
              <Card style={{ width: 280, elevation: 4 }}>
                <Image
                  source={{ uri: article.image }}
                  style={{
                    width: '100%',
                    height: 150,
                    backgroundColor: COLORS.background,
                  }}
                  resizeMode="cover"
                />
                <Card.Content style={{ padding: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 4 }]}>
                    {article.source} • {formatTimeAgo(article.publishedAt)}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.heading, { color: '#fff', fontSize: 24, flex: 1 }]}>
            📰 Sports News
          </Text>
          <IconButton
            icon="notifications"
            iconColor="#fff"
            size={24}
            onPress={() => Alert.alert('🔔 Notifications', 'News notifications settings coming soon!')}
          />
          <IconButton
            icon="bookmark"
            iconColor="#fff"
            size={24}
            onPress={() => Alert.alert('🔖 Bookmarks', 'Your saved articles feature coming soon!')}
          />
        </View>

        <Searchbar
          placeholder="Search sports news..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            elevation: 4,
          }}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.text }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: SPACING.md }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              marginRight: SPACING.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => setViewMode(viewMode === 'feed' ? 'headlines' : 'feed')}
          >
            <Icon name={viewMode === 'feed' ? 'view-headline' : 'view-stream'} size={16} color="#fff" />
            <Text style={[TEXT_STYLES.body, { color: '#fff', marginLeft: 4 }]}>
              {viewMode === 'feed' ? 'Headlines' : 'Full Feed'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              marginRight: SPACING.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => Alert.alert('⚡ Live Updates', 'Live sports updates coming soon!')}
          >
            <Icon name="live-tv" size={16} color="#fff" />
            <Text style={[TEXT_STYLES.body, { color: '#fff', marginLeft: 4 }]}>
              Live
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => Alert.alert('🎥 Videos', 'Sports video content coming soon!')}
          >
            <Icon name="video-library" size={16} color="#fff" />
            <Text style={[TEXT_STYLES.body, { color: '#fff', marginLeft: 4 }]}>
              Videos
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

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
        {renderCategoryChips()}
        
        {selectedCategory === 'All' && renderTopNews()}

        <View style={{ paddingHorizontal: SPACING.sm }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.md,
          }}>
            <Text style={[TEXT_STYLES.body, { flex: 1 }]}>
              {filteredNews.length} articles found
            </Text>
            {selectedCategory !== 'All' && (
              <Chip
                onPress={() => setSelectedCategory('All')}
                style={{ backgroundColor: COLORS.primary }}
                textStyle={{ color: '#fff' }}
              >
                Clear Filter
              </Chip>
            )}
          </View>

          <FlatList
            data={filteredNews}
            renderItem={renderNewsCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: SPACING.xl }}
            ListEmptyComponent={
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: SPACING.xl,
              }}>
                <Icon name="newspaper" size={64} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.heading, {
                  marginTop: SPACING.md,
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                }]}>
                  No News Found
                </Text>
                <Text style={[TEXT_STYLES.body, {
                  marginTop: SPACING.sm,
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                }]}>
                  Try adjusting your search or category filter
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      <FAB
        icon="rss-feed"
        label="My Feed"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('📱 My Feed', 'Personalized news feed feature coming soon! This will show news tailored to your favorite sports and teams.')}
      />
    </View>
  );
};

export default SportsNews;