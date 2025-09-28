import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Alert,
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
  Text,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants';

const AcademyNews = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, academies, news } = useSelector(state => ({
    user: state.auth.user,
    academies: state.academies.followedAcademies || [],
    news: state.news.academyNews || []
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const categories = ['All', 'Updates', 'Events', 'Achievements', 'Training', 'Announcements'];

  // Sample news data - replace with actual data from Redux
  const newsData = [
    {
      id: '1',
      academyId: 'academy_1',
      academyName: 'Elite Football Academy',
      academyLogo: null,
      title: 'New Training Facility Opens',
      content: 'We are excited to announce the opening of our new state-of-the-art training facility with modern equipment and professional-grade pitches.',
      category: 'Updates',
      timestamp: new Date('2025-08-15T10:00:00Z'),
      image: null,
      likes: 45,
      comments: 12,
      isLiked: false,
      priority: 'high'
    },
    {
      id: '2',
      academyId: 'academy_2',
      academyName: 'Champions Basketball Camp',
      academyLogo: null,
      title: 'Tournament Victory! 🏆',
      content: 'Our U16 team won the regional championship! Congratulations to all players and coaches for this amazing achievement.',
      category: 'Achievements',
      timestamp: new Date('2025-08-14T15:30:00Z'),
      image: null,
      likes: 128,
      comments: 34,
      isLiked: true,
      priority: 'high'
    },
    {
      id: '3',
      academyId: 'academy_1',
      academyName: 'Elite Football Academy',
      academyLogo: null,
      title: 'Summer Training Camp Registration',
      content: 'Registration is now open for our intensive summer training camp. Limited spots available for ages 12-18.',
      category: 'Events',
      timestamp: new Date('2025-08-13T09:00:00Z'),
      image: null,
      likes: 67,
      comments: 8,
      isLiked: false,
      priority: 'medium'
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Load news data
    loadAcademyNews();
  }, []);

  const loadAcademyNews = useCallback(async () => {
    try {
      setLoading(true);
      // Dispatch action to load academy news
      // dispatch(loadAcademyNewsAction());
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading academy news:', error);
      Alert.alert('Error', 'Failed to load news updates');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAcademyNews();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadAcademyNews]);

  const handleLikeArticle = useCallback((articleId) => {
    Vibration.vibrate(30);
    // dispatch(toggleLikeArticleAction(articleId));
    Alert.alert('Feature Coming Soon', 'Like functionality will be available in the next update! 🚀');
  }, []);

  const handleShareArticle = useCallback((article) => {
    Vibration.vibrate(30);
    Alert.alert('Feature Coming Soon', 'Share functionality will be available in the next update! 📱');
  }, []);

  const handleOpenArticle = useCallback((article) => {
    setSelectedArticle(article);
    setModalVisible(true);
    Vibration.vibrate(30);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const filteredNews = newsData.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.academyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderNewsCard = (article, index) => (
    <Animated.View
      key={article.id}
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <Card style={styles.newsCard} elevation={3}>
        <TouchableOpacity onPress={() => handleOpenArticle(article)}>
          <LinearGradient
            colors={article.priority === 'high' ? ['#667eea', '#764ba2'] : ['#f093fb', '#f5576c']}
            style={styles.cardHeader}
          >
            <View style={styles.academyInfo}>
              <Avatar.Text
                size={40}
                label={article.academyName.charAt(0)}
                style={styles.academyAvatar}
              />
              <View style={styles.academyDetails}>
                <Text style={styles.academyName}>{article.academyName}</Text>
                <Text style={styles.timestamp}>{formatTimeAgo(article.timestamp)}</Text>
              </View>
            </View>
            <Chip
              mode="outlined"
              textStyle={styles.categoryChipText}
              style={styles.categoryChip}
            >
              {article.category}
            </Chip>
          </LinearGradient>
        </TouchableOpacity>

        <Card.Content style={styles.cardContent}>
          <Text style={styles.articleTitle}>{article.title}</Text>
          <Text style={styles.articlePreview} numberOfLines={3}>
            {article.content}
          </Text>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLikeArticle(article.id)}
            >
              <Icon
                name={article.isLiked ? 'favorite' : 'favorite-border'}
                size={20}
                color={article.isLiked ? COLORS.error : COLORS.primary}
              />
              <Text style={styles.actionText}>{article.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleOpenArticle(article)}
            >
              <Icon name="comment" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>{article.comments}</Text>
            </TouchableOpacity>
          </View>

          <IconButton
            icon="share"
            size={20}
            onPress={() => handleShareArticle(article)}
            iconColor={COLORS.primary}
          />
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderCategoryChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <Chip
          key={category}
          mode={selectedCategory === category ? 'flat' : 'outlined'}
          selected={selectedCategory === category}
          onPress={() => {
            setSelectedCategory(category);
            Vibration.vibrate(30);
          }}
          style={[
            styles.categoryChip,
            selectedCategory === category && styles.selectedCategoryChip
          ]}
          textStyle={[
            styles.categoryText,
            selectedCategory === category && styles.selectedCategoryText
          ]}
        >
          {category}
        </Chip>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Academy News 📰</Text>
        <Text style={styles.headerSubtitle}>
          Stay updated with your academies
        </Text>
      </LinearGradient>

      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search news..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={TEXT_STYLES.body}
        />
      </Surface>

      {renderCategoryChips()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
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
        {filteredNews.length > 0 ? (
          filteredNews.map((article, index) => renderNewsCard(article, index))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="article" size={64} color={COLORS.primary} />
            <Text style={styles.emptyStateTitle}>No News Found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search or filter'
                : 'Follow academies to see their latest news'}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AcademyExplore')}
              style={styles.exploreButton}
            >
              Explore Academies
            </Button>
          </View>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
          >
            <Card style={styles.modalCard}>
              <Card.Title
                title={selectedArticle?.title}
                subtitle={`${selectedArticle?.academyName} • ${formatTimeAgo(selectedArticle?.timestamp)}`}
                left={(props) => (
                  <Avatar.Text
                    {...props}
                    label={selectedArticle?.academyName?.charAt(0)}
                  />
                )}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="close"
                    onPress={() => setModalVisible(false)}
                  />
                )}
              />
              <Card.Content>
                <ScrollView style={styles.modalContent}>
                  <Text style={styles.modalText}>
                    {selectedArticle?.content}
                  </Text>
                </ScrollView>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained"
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  Close
                </Button>
              </Card.Actions>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  searchContainer: {
    elevation: 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 1,
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.sm,
  },
  categoryContent: {
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.primary,
  },
  selectedCategoryText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  newsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  academyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  academyAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  academyDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  academyName: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '600',
  },
  timestamp: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  categoryChipText: {
    color: 'white',
    fontSize: 12,
  },
  cardContent: {
    padding: SPACING.md,
  },
  articleTitle: {
    ...TEXT_STYLES.h4,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  articlePreview: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  cardActions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
  },
  modalContent: {
    maxHeight: 300,
  },
  modalText: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    color: COLORS.text,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
  },
});

export default AcademyNews;
