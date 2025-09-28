import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
  Share,
  Vibration,
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
  Modal,
  Searchbar,
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-blur/blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SuccessStories = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [likedStories, setLikedStories] = useState(new Set());
  const [bookmarkedStories, setBookmarkedStories] = useState(new Set());
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  // Mock data - Replace with Redux state
  const [successStories, setSuccessStories] = useState([
    {
      id: '1',
      user: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        age: 28,
        location: 'New York, NY'
      },
      title: '🔥 Lost 30 lbs in 4 Months!',
      category: 'weight-loss',
      timeframe: '4 months',
      achievement: 'Lost 30 lbs',
      story: 'Started my fitness journey feeling overwhelmed and out of shape. With consistent training and amazing support from my coach, I transformed my life! The key was taking it one day at a time.',
      beforeImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
      afterImage: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=300',
      metrics: {
        weight: { before: 180, after: 150, unit: 'lbs' },
        bodyFat: { before: 32, after: 22, unit: '%' },
        workouts: 96
      },
      likes: 234,
      comments: 45,
      shares: 12,
      date: '2024-08-15',
      verified: true,
      tags: ['weight-loss', 'strength-training', 'nutrition'],
      coach: 'Mike Chen - Certified Personal Trainer'
    },
    {
      id: '2',
      user: {
        name: 'Marcus Thompson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        age: 35,
        location: 'Los Angeles, CA'
      },
      title: '💪 From Couch to 5K Runner',
      category: 'endurance',
      timeframe: '3 months',
      achievement: 'Completed first 5K',
      story: 'Never thought I could run more than a few minutes. Started with walk-run intervals and now I am training for my first half marathon! Consistency beats perfection.',
      beforeImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
      afterImage: 'https://images.unsplash.com/photo-1571019614711-89847c624cb9?w=300',
      metrics: {
        distance: { before: 0.5, after: 3.1, unit: 'miles' },
        pace: { before: '12:00', after: '8:30', unit: 'min/mile' },
        workouts: 72
      },
      likes: 189,
      comments: 32,
      shares: 8,
      date: '2024-08-10',
      verified: true,
      tags: ['running', 'endurance', 'cardio'],
      coach: 'Lisa Rodriguez - Running Coach'
    },
    {
      id: '3',
      user: {
        name: 'Emily Chen',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        age: 24,
        location: 'Chicago, IL'
      },
      title: '🏋️‍♀️ Deadlifted 2x Bodyweight!',
      category: 'strength',
      timeframe: '6 months',
      achievement: '2x Bodyweight Deadlift',
      story: 'Started strength training to build confidence. Six months later, I deadlifted 240 lbs at 120 lbs bodyweight! Strength training changed my entire mindset.',
      beforeImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
      afterImage: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=300',
      metrics: {
        deadlift: { before: 95, after: 240, unit: 'lbs' },
        squat: { before: 75, after: 185, unit: 'lbs' },
        workouts: 144
      },
      likes: 312,
      comments: 67,
      shares: 23,
      date: '2024-08-05',
      verified: true,
      tags: ['strength-training', 'powerlifting', 'confidence'],
      coach: 'David Kim - Strength Coach'
    }
  ]);

  const categories = [
    { id: 'all', label: 'All Stories', icon: 'dashboard', color: COLORS.primary },
    { id: 'weight-loss', label: 'Weight Loss', icon: 'trending-down', color: '#ff6b6b' },
    { id: 'strength', label: 'Strength', icon: 'fitness-center', color: '#4ecdc4' },
    { id: 'endurance', label: 'Endurance', icon: 'directions-run', color: '#45b7d1' },
    { id: 'transformation', label: 'Body Recomposition', icon: 'autorenew', color: '#f9ca24' },
    { id: 'recovery', label: 'Recovery', icon: 'healing', color: '#6c5ce7' }
  ];

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    loadSuccessStories();
  }, []);

  const loadSuccessStories = async () => {
    try {
      // Replace with actual API call
      // const response = await dispatch(fetchSuccessStories());
      console.log('Loading success stories...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load success stories');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSuccessStories();
    setRefreshing(false);
  }, []);

  const handleLikeStory = (storyId) => {
    Vibration.vibrate(50);
    const newLikedStories = new Set(likedStories);
    if (likedStories.has(storyId)) {
      newLikedStories.delete(storyId);
    } else {
      newLikedStories.add(storyId);
    }
    setLikedStories(newLikedStories);
    
    // Update story likes count
    setSuccessStories(prev => prev.map(story => 
      story.id === storyId 
        ? { ...story, likes: likedStories.has(storyId) ? story.likes - 1 : story.likes + 1 }
        : story
    ));
  };

  const handleBookmarkStory = (storyId) => {
    Vibration.vibrate(30);
    const newBookmarkedStories = new Set(bookmarkedStories);
    if (bookmarkedStories.has(storyId)) {
      newBookmarkedStories.delete(storyId);
    } else {
      newBookmarkedStories.add(storyId);
    }
    setBookmarkedStories(newBookmarkedStories);
  };

  const handleShareStory = async (story) => {
    try {
      await Share.share({
        message: `Check out this amazing success story: "${story.title}" by ${story.user.name}. ${story.achievement} in ${story.timeframe}!`,
        title: story.title
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleViewFullStory = (story) => {
    setSelectedStory(story);
    setShowStoryModal(true);
  };

  const filteredStories = successStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.story.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
        <Text style={styles.headerTitle}>Success Stories 🏆</Text>
        <Text style={styles.headerSubtitle}>Get inspired by real transformations</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1,247</Text>
            <Text style={styles.statLabel}>Success Stories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>89%</Text>
            <Text style={styles.statLabel}>Goal Achievement</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8⭐</Text>
            <Text style={styles.statLabel}>Community Rating</Text>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search success stories..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
        inputStyle={styles.searchInput}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === category.id && { color: 'white' }
            ]}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderStoryCard = (story) => (
    <Card key={story.id} style={styles.storyCard} elevation={3}>
      <View style={styles.storyHeader}>
        <View style={styles.userInfo}>
          <Avatar.Image source={{ uri: story.user.avatar }} size={50} />
          <View style={styles.userDetails}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{story.user.name}</Text>
              {story.verified && (
                <Icon name="verified" size={16} color={COLORS.primary} style={styles.verifiedIcon} />
              )}
            </View>
            <Text style={styles.userMeta}>{story.user.age}yo • {story.user.location}</Text>
            <Text style={styles.timeframe}>{story.timeframe} transformation</Text>
          </View>
        </View>
        <IconButton
          icon={bookmarkedStories.has(story.id) ? 'bookmark' : 'bookmark-outline'}
          iconColor={bookmarkedStories.has(story.id) ? COLORS.primary : COLORS.textSecondary}
          onPress={() => handleBookmarkStory(story.id)}
        />
      </View>

      <Text style={styles.storyTitle}>{story.title}</Text>
      
      <View style={styles.achievementBanner}>
        <LinearGradient
          colors={['#ff6b6b', '#ee5a52']}
          style={styles.achievementGradient}
        >
          <Text style={styles.achievementText}>🎯 {story.achievement}</Text>
        </LinearGradient>
      </View>

      {story.beforeImage && story.afterImage && (
        <View style={styles.transformationImages}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: story.beforeImage }} style={styles.transformationImage} />
            <Text style={styles.imageLabel}>Before</Text>
          </View>
          <Icon name="arrow-forward" size={24} color={COLORS.primary} style={styles.arrowIcon} />
          <View style={styles.imageContainer}>
            <Image source={{ uri: story.afterImage }} style={styles.transformationImage} />
            <Text style={styles.imageLabel}>After</Text>
          </View>
        </View>
      )}

      <View style={styles.metricsContainer}>
        {Object.entries(story.metrics).map(([key, metric]) => (
          <Surface key={key} style={styles.metricCard} elevation={1}>
            <Text style={styles.metricLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            <Text style={styles.metricValue}>
              {typeof metric.before === 'string' ? metric.before : metric.before.toFixed(1)} → {typeof metric.after === 'string' ? metric.after : metric.after.toFixed(1)} {metric.unit}
            </Text>
            <ProgressBar
              progress={0.8}
              color={COLORS.success}
              style={styles.metricProgress}
            />
          </Surface>
        ))}
      </View>

      <Text style={styles.storyPreview} numberOfLines={3}>
        "{story.story}"
      </Text>

      <Button
        mode="outlined"
        onPress={() => handleViewFullStory(story)}
        style={styles.readMoreButton}
        labelStyle={styles.readMoreLabel}
      >
        Read Full Story
      </Button>

      <View style={styles.tagsContainer}>
        {story.tags.slice(0, 3).map((tag) => (
          <Chip key={tag} compact style={styles.tag} textStyle={styles.tagText}>
            #{tag}
          </Chip>
        ))}
      </View>

      <View style={styles.coachInfo}>
        <Icon name="person" size={16} color={COLORS.primary} />
        <Text style={styles.coachText}>{story.coach}</Text>
      </View>

      <View style={styles.storyActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLikeStory(story.id)}
        >
          <Icon
            name={likedStories.has(story.id) ? 'favorite' : 'favorite-outline'}
            size={24}
            color={likedStories.has(story.id) ? '#ff6b6b' : COLORS.textSecondary}
          />
          <Text style={styles.actionText}>{story.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Comments', 'Comments feature coming soon!')}
        >
          <Icon name="comment" size={24} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{story.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShareStory(story)}
        >
          <Icon name="share" size={24} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{story.shares}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Motivate', 'Send motivation feature coming soon!')}
        >
          <Icon name="emoji-emotions" size={24} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>Motivate</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderStoryModal = () => (
    <Portal>
      <Modal
        visible={showStoryModal}
        onDismiss={() => setShowStoryModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurContainer}
          blurType="light"
          blurAmount={10}
        >
          <ScrollView style={styles.modalContent}>
            {selectedStory && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedStory.title}</Text>
                  <IconButton
                    icon="close"
                    onPress={() => setShowStoryModal(false)}
                    iconColor={COLORS.text}
                  />
                </View>
                
                <View style={styles.modalUserInfo}>
                  <Avatar.Image source={{ uri: selectedStory.user.avatar }} size={60} />
                  <View style={styles.modalUserDetails}>
                    <Text style={styles.modalUserName}>{selectedStory.user.name}</Text>
                    <Text style={styles.modalUserMeta}>{selectedStory.user.age}yo • {selectedStory.user.location}</Text>
                  </View>
                </View>

                <Text style={styles.modalStoryText}>{selectedStory.story}</Text>
                
                <View style={styles.modalMetrics}>
                  <Text style={styles.modalMetricsTitle}>Transformation Metrics</Text>
                  {Object.entries(selectedStory.metrics).map(([key, metric]) => (
                    <View key={key} style={styles.modalMetricItem}>
                      <Text style={styles.modalMetricLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                      <Text style={styles.modalMetricValue}>
                        {typeof metric.before === 'string' ? metric.before : metric.before.toFixed(1)} → {typeof metric.after === 'string' ? metric.after : metric.after.toFixed(1)} {metric.unit}
                      </Text>
                    </View>
                  ))}
                </View>

                <Button
                  mode="contained"
                  onPress={() => {
                    setShowStoryModal(false);
                    Alert.alert('Connect', 'Connect with user feature coming soon!');
                  }}
                  style={styles.connectButton}
                >
                  Connect & Get Motivated
                </Button>
              </>
            )}
          </ScrollView>
        </BlurView>
      </Modal>
    </Portal>
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
        style={styles.content}
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {renderSearchAndFilters()}
        
        <View style={styles.storiesContainer}>
          {filteredStories.length > 0 ? (
            filteredStories.map(renderStoryCard)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="search-off" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateText}>No success stories found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Share Your Story', 'Share success story feature coming soon!')}
        label="Share Your Story"
      />

      {renderStoryModal()}
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchbar: {
    margin: SPACING.lg,
    elevation: 0,
    backgroundColor: COLORS.background,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoriesContainer: {
    paddingBottom: SPACING.lg,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
    paddingRight: SPACING.xl,
  },
  categoryChip: {
    marginRight: SPACING.md,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  categoryChipText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  storiesContainer: {
    padding: SPACING.lg,
  },
  storyCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
  },
  verifiedIcon: {
    marginLeft: SPACING.xs,
  },
  userMeta: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeframe: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  storyTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  achievementBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 8,
    overflow: 'hidden',
  },
  achievementGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  achievementText: {
    ...TEXT_STYLES.subtitle,
    color: 'white',
    fontWeight: 'bold',
  },
  transformationImages: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  imageContainer: {
    alignItems: 'center',
  },
  transformationImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  imageLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },
  arrowIcon: {
    marginHorizontal: SPACING.md,
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    padding: SPACING.md,
    margin: SPACING.xs,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  metricValue: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  metricProgress: {
    width: '100%',
    marginTop: SPACING.xs,
    height: 4,
  },
  storyPreview: {
    ...TEXT_STYLES.body,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  readMoreButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderColor: COLORS.primary,
  },
  readMoreLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  tagText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontSize: 11,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  coachText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  storyActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateText: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    width: '100%',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    flex: 1,
    marginRight: SPACING.md,
  },
  modalUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 12,
  },
  modalUserDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  modalUserName: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  modalUserMeta: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  modalStoryText: {
    ...TEXT_STYLES.body,
    padding: SPACING.lg,
    lineHeight: 24,
    color: COLORS.text,
    textAlign: 'justify',
  },
  modalMetrics: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  modalMetricsTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  modalMetricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalMetricLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalMetricValue: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  connectButton: {
    margin: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
  },
});

export default SuccessStories;
