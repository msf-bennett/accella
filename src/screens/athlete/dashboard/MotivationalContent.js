import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  FlatList,
  Vibration,
  Alert,
  StyleSheet,
  ImageBackground,
  Share,
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
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f6fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  gold: '#FFD700',
  purple: '#9c27b0',
  pink: '#e91e63',
  teal: '#009688',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  heading2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  heading3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const MotivationalContent = ({ navigation }) => {
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [favoriteContent, setFavoriteContent] = useState(new Set());
  const [dailyStreak, setDailyStreak] = useState(7);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Redux State
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  // Mock Data
  const motivationalQuotes = [
    {
      id: 1,
      text: "Champions aren't made in comfort zones.",
      author: "Anonymous",
      category: 'mindset',
      tags: ['champions', 'comfort zone', 'growth'],
      likes: 342,
      shares: 89,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      color: COLORS.primary,
    },
    {
      id: 2,
      text: "The only impossible journey is the one you never begin.",
      author: "Tony Robbins",
      category: 'motivation',
      tags: ['journey', 'beginning', 'possibility'],
      likes: 567,
      shares: 123,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      color: COLORS.success,
    },
    {
      id: 3,
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: 'perseverance',
      tags: ['success', 'failure', 'courage'],
      likes: 789,
      shares: 201,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
      color: COLORS.warning,
    },
    {
      id: 4,
      text: "Your only limit is your mind.",
      author: "Anonymous",
      category: 'mindset',
      tags: ['limits', 'mind', 'potential'],
      likes: 445,
      shares: 67,
      image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=800',
      color: COLORS.purple,
    },
  ];

  const challenges = [
    {
      id: 1,
      title: "30-Day Consistency Challenge",
      description: "Complete your daily training for 30 consecutive days",
      difficulty: 'hard',
      duration: '30 days',
      participants: 1234,
      reward: '500 points',
      progress: 0.6,
      icon: 'event-repeat',
      color: COLORS.accent,
      isActive: true,
    },
    {
      id: 2,
      title: "Mental Toughness Week",
      description: "Push through 7 challenging workouts without giving up",
      difficulty: 'medium',
      duration: '7 days',
      participants: 856,
      reward: '200 points',
      progress: 0.3,
      icon: 'psychology',
      color: COLORS.primary,
      isActive: false,
    },
    {
      id: 3,
      title: "Early Bird Special",
      description: "Complete morning workouts for 14 days straight",
      difficulty: 'easy',
      duration: '14 days',
      participants: 643,
      reward: '150 points',
      progress: 0.8,
      icon: 'wb-sunny',
      color: COLORS.warning,
      isActive: true,
    },
  ];

  const videos = [
    {
      id: 1,
      title: "Champions Train Different",
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      duration: '3:45',
      views: '2.3M',
      category: 'training',
      author: 'Elite Sports',
    },
    {
      id: 2,
      title: "Never Give Up - Athlete Stories",
      thumbnail: 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=400',
      duration: '5:22',
      views: '1.8M',
      category: 'stories',
      author: 'Inspire Athletics',
    },
    {
      id: 3,
      title: "Mental Game Mastery",
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      duration: '4:17',
      views: '967K',
      category: 'mindset',
      author: 'Peak Performance',
    },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: 'apps', color: COLORS.text },
    { id: 'mindset', label: 'Mindset', icon: 'psychology', color: COLORS.purple },
    { id: 'motivation', label: 'Motivation', icon: 'trending-up', color: COLORS.success },
    { id: 'perseverance', label: 'Perseverance', icon: 'fitness-center', color: COLORS.accent },
    { id: 'training', label: 'Training', icon: 'sports', color: COLORS.primary },
    { id: 'stories', label: 'Stories', icon: 'auto-stories', color: COLORS.warning },
  ];

  // Effects
  useEffect(() => {
    // Animate content on mount
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

    // Rotating motivation icon
    const rotateAnimation = () => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    };
    rotateAnimation();
  }, []);

  // Callbacks
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      Vibration.vibrate(50);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh content');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleQuotePress = useCallback((quote) => {
    Vibration.vibrate(50);
    setSelectedQuote(quote);
    setShowQuoteModal(true);
  }, []);

  const handleShare = useCallback(async (item, type = 'quote') => {
    try {
      Vibration.vibrate(50);
      const shareContent = type === 'quote' 
        ? `"${item.text}" - ${item.author}`
        : `Check out this motivational video: ${item.title}`;
      
      await Share.share({
        message: shareContent,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share content');
    }
  }, []);

  const toggleFavorite = useCallback((itemId) => {
    Vibration.vibrate(75);
    setFavoriteContent(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleChallengeJoin = useCallback((challengeId) => {
    Vibration.vibrate(100);
    Alert.alert(
      '🎯 Join Challenge?',
      'Are you ready to push yourself and join this challenge?',
      [
        { text: 'Not Yet', style: 'cancel' },
        { 
          text: 'Let\'s Go!', 
          style: 'default',
          onPress: () => Alert.alert('Challenge Joined!', 'Good luck! You\'ve got this! 💪')
        }
      ]
    );
  }, []);

  const getFilteredContent = () => {
    let filtered = motivationalQuotes;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  // Render Functions
  const renderHeader = () => {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.headerGradient}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <View style={styles.headerTitleRow}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Icon name="auto-awesome" size={24} color={COLORS.gold} />
              </Animated.View>
              <Text style={styles.headerTitleText}>Motivation Hub</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Day {dailyStreak} of your journey 🔥
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => Alert.alert('Feature Coming Soon', 'Favorites view will be available soon! ⭐')}
            style={styles.headerAction}
          >
            <Icon name="favorite" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  const renderDailyMotivation = () => {
    const todayQuote = motivationalQuotes[0];
    
    return (
      <Animated.View
        style={[
          styles.dailyMotivationCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <ImageBackground
          source={{ uri: todayQuote.image }}
          style={styles.dailyMotivationBackground}
          imageStyle={{ borderRadius: 20 }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.dailyMotivationOverlay}
          >
            <View style={styles.dailyMotivationContent}>
              <View style={styles.dailyMotivationHeader}>
                <Icon name="wb-sunny" size={24} color={COLORS.gold} />
                <Text style={styles.dailyMotivationLabel}>Daily Inspiration</Text>
              </View>
              <Text style={styles.dailyQuoteText}>"{todayQuote.text}"</Text>
              <Text style={styles.dailyQuoteAuthor}>- {todayQuote.author}</Text>
              <View style={styles.dailyMotivationActions}>
                <TouchableOpacity 
                  style={styles.motivationActionBtn}
                  onPress={() => handleShare(todayQuote)}
                >
                  <Icon name="share" size={20} color="white" />
                  <Text style={styles.motivationActionText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.motivationActionBtn}
                  onPress={() => toggleFavorite(todayQuote.id)}
                >
                  <Icon 
                    name={favoriteContent.has(todayQuote.id) ? "favorite" : "favorite-border"} 
                    size={20} 
                    color={favoriteContent.has(todayQuote.id) ? COLORS.accent : "white"} 
                  />
                  <Text style={styles.motivationActionText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>
    );
  };

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
              { borderColor: category.color }
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Icon 
              name={category.icon} 
              size={18} 
              color={selectedCategory === category.id ? 'white' : category.color}
              style={{ marginRight: SPACING.xs }}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderChallenges = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[TEXT_STYLES.heading3, { flex: 1 }]}>Active Challenges 🎯</Text>
        <TouchableOpacity onPress={() => Alert.alert('Feature Coming Soon', 'Challenge hub will be available soon!')}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengesScroll}>
        {challenges.map((challenge) => (
          <Card key={challenge.id} style={styles.challengeCard} elevation={3}>
            <Card.Content>
              <View style={styles.challengeHeader}>
                <Surface 
                  style={[styles.challengeIcon, { backgroundColor: challenge.color + '20' }]}
                  elevation={1}
                >
                  <Icon name={challenge.icon} size={24} color={challenge.color} />
                </Surface>
                <Chip 
                  style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}
                  textStyle={styles.difficultyText}
                  compact
                >
                  {challenge.difficulty}
                </Chip>
              </View>
              
              <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginVertical: SPACING.sm }]} numberOfLines={2}>
                {challenge.title}
              </Text>
              
              <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md }]} numberOfLines={2}>
                {challenge.description}
              </Text>
              
              <View style={styles.challengeStats}>
                <View style={styles.challengeStat}>
                  <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                  <Text style={TEXT_STYLES.small}>{challenge.duration}</Text>
                </View>
                <View style={styles.challengeStat}>
                  <Icon name="group" size={16} color={COLORS.textSecondary} />
                  <Text style={TEXT_STYLES.small}>{challenge.participants}</Text>
                </View>
              </View>
              
              {challenge.isActive && (
                <View style={styles.challengeProgress}>
                  <View style={styles.progressHeader}>
                    <Text style={TEXT_STYLES.small}>Progress</Text>
                    <Text style={[TEXT_STYLES.small, { fontWeight: 'bold' }]}>
                      {Math.round(challenge.progress * 100)}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={challenge.progress}
                    color={challenge.color}
                    style={styles.challengeProgressBar}
                  />
                </View>
              )}
              
              <Button
                mode={challenge.isActive ? "outlined" : "contained"}
                onPress={() => handleChallengeJoin(challenge.id)}
                style={[styles.challengeButton, { borderColor: challenge.color }]}
                buttonColor={challenge.isActive ? 'transparent' : challenge.color}
                textColor={challenge.isActive ? challenge.color : 'white'}
                compact
              >
                {challenge.isActive ? 'Continue' : 'Join Now'}
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderVideos = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[TEXT_STYLES.heading3, { flex: 1 }]}>Inspiring Videos 🎬</Text>
        <TouchableOpacity onPress={() => Alert.alert('Feature Coming Soon', 'Video library will be available soon!')}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videosScroll}>
        {videos.map((video) => (
          <TouchableOpacity 
            key={video.id} 
            style={styles.videoCard}
            onPress={() => Alert.alert('Feature Coming Soon', 'Video player will be available soon! 🎥')}
          >
            <ImageBackground
              source={{ uri: video.thumbnail }}
              style={styles.videoThumbnail}
              imageStyle={{ borderRadius: 12 }}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                style={styles.videoOverlay}
              >
                <View style={styles.playButton}>
                  <Icon name="play-arrow" size={32} color="white" />
                </View>
                <View style={styles.videoMeta}>
                  <Text style={styles.videoDuration}>{video.duration}</Text>
                </View>
              </LinearGradient>
            </ImageBackground>
            <View style={styles.videoInfo}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]} numberOfLines={2}>
                {video.title}
              </Text>
              <Text style={TEXT_STYLES.caption}>{video.author}</Text>
              <Text style={[TEXT_STYLES.small, { color: COLORS.success }]}>{video.views} views</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuoteItem = ({ item: quote }) => (
    <TouchableOpacity onPress={() => handleQuotePress(quote)}>
      <Card style={styles.quoteCard} elevation={2}>
        <Card.Content>
          <View style={styles.quoteHeader}>
            <View style={[styles.quoteColorBar, { backgroundColor: quote.color }]} />
            <View style={styles.quoteActions}>
              <TouchableOpacity onPress={() => toggleFavorite(quote.id)}>
                <Icon 
                  name={favoriteContent.has(quote.id) ? "favorite" : "favorite-border"} 
                  size={20} 
                  color={favoriteContent.has(quote.id) ? COLORS.accent : COLORS.textSecondary} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleShare(quote)} style={{ marginLeft: SPACING.md }}>
                <Icon name="share" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.quoteText}>"{quote.text}"</Text>
          <Text style={styles.quoteAuthor}>- {quote.author}</Text>
          
          <View style={styles.quoteTags}>
            {quote.tags.slice(0, 3).map((tag, index) => (
              <Chip key={index} style={styles.quoteTag} textStyle={styles.quoteTagText} compact>
                #{tag}
              </Chip>
            ))}
          </View>
          
          <View style={styles.quoteStats}>
            <View style={styles.quoteStat}>
              <Icon name="favorite" size={16} color={COLORS.accent} />
              <Text style={TEXT_STYLES.small}>{quote.likes}</Text>
            </View>
            <View style={styles.quoteStat}>
              <Icon name="share" size={16} color={COLORS.primary} />
              <Text style={TEXT_STYLES.small}>{quote.shares}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return COLORS.success + '30';
      case 'medium': return COLORS.warning + '30';
      case 'hard': return COLORS.error + '30';
      default: return COLORS.textSecondary + '30';
    }
  };

  const filteredQuotes = getFilteredContent();

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.scrollContainer}
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
        <View style={styles.content}>
          {renderDailyMotivation()}
          {renderChallenges()}
          {renderVideos()}
          
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search quotes, authors, tags..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor={COLORS.primary}
            />
          </View>

          {renderCategoryFilter()}

          <View style={styles.quotesSection}>
            <Text style={[TEXT_STYLES.heading3, { marginBottom: SPACING.md }]}>
              Motivational Quotes ✨
            </Text>
            
            <FlatList
              data={filteredQuotes}
              renderItem={renderQuoteItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
            />
          </View>
        </View>
      </Animated.ScrollView>

      {/* Quote Detail Modal */}
      <Portal>
        <Modal
          visible={showQuoteModal}
          onDismiss={() => setShowQuoteModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedQuote && (
            <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
              <View style={styles.quoteModal}>
                <ImageBackground
                  source={{ uri: selectedQuote.image }}
                  style={styles.modalBackground}
                  imageStyle={{ borderRadius: 20 }}
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                    style={styles.modalOverlay}
                  >
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setShowQuoteModal(false)}
                    >
                      <Icon name="close" size={24} color="white" />
                    </TouchableOpacity>
                    
                    <View style={styles.modalQuoteContent}>
                      <Text style={styles.modalQuoteText}>"{selectedQuote.text}"</Text>
                      <Text style={styles.modalQuoteAuthor}>- {selectedQuote.author}</Text>
                      
                      <View style={styles.modalActions}>
                        <Button
                          mode="contained"
                          onPress={() => handleShare(selectedQuote)}
                          style={styles.modalActionButton}
                          buttonColor="rgba(255,255,255,0.2)"
                          icon="share"
                        >
                          Share
                        </Button>
                        <Button
                          mode="contained"
                          onPress={() => toggleFavorite(selectedQuote.id)}
                          style={styles.modalActionButton}
                          buttonColor={favoriteContent.has(selectedQuote.id) ? COLORS.accent : "rgba(255,255,255,0.2)"}
                          icon={favoriteContent.has(selectedQuote.id) ? "favorite" : "favorite-border"}
                        >
                          {favoriteContent.has(selectedQuote.id) ? 'Saved' : 'Save'}
                        </Button>
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </View>
            </BlurView>
          )}
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
  headerGradient: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerAction: {
    padding: SPACING.sm,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  dailyMotivationCard: {
    marginBottom: SPACING.xl,
    height: 200,
  },
  dailyMotivationBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dailyMotivationOverlay: {
    flex: 1,
    borderRadius: 20,
    padding: SPACING.lg,
    justifyContent: 'flex-end',
  },
  dailyMotivationContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dailyMotivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dailyMotivationLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dailyQuoteText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  dailyQuoteAuthor: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  dailyMotivationActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  motivationActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  motivationActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  filterContainer: {
    marginBottom: SPACING.lg,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  challengesScroll: {
    flexGrow: 0,
  },
  challengeCard: {
    width: 280,
    marginRight: SPACING.md,
    borderRadius: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyChip: {
    height: 24,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  challengeStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  challengeProgress: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  challengeProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
  },
  challengeButton: {
    borderRadius: 20,
    marginTop: SPACING.sm,
  },
  videosScroll: {
    flexGrow: 0,
  },
  videoCard: {
    width: 200,
    marginRight: SPACING.md,
  },
  videoThumbnail: {
    width: 200,
    height: 120,
    marginBottom: SPACING.sm,
  },
  videoOverlay: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoMeta: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
  },
  videoDuration: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  videoInfo: {
    paddingHorizontal: SPACING.xs,
  },
  searchSection: {
    marginBottom: SPACING.lg,
  },
  searchbar: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
  },
  quotesSection: {
    marginBottom: SPACING.xl,
  },
  quoteCard: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  quoteColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  quoteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.text,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  quoteAuthor: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.md,
  },
  quoteTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  quoteTag: {
    backgroundColor: COLORS.background,
    height: 28,
  },
  quoteTagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  quoteStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quoteStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteModal: {
    width: width - SPACING.xl,
    height: height * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalBackground: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    padding: SPACING.lg,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalQuoteContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalQuoteText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalQuoteAuthor: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalActionButton: {
    borderRadius: 25,
    minWidth: 120,
  },
});

export default MotivationalContent;