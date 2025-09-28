import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
  Alert,
  Vibration,
  Share,
  ImageBackground,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9ff',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e1e8ed',
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
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};

const { width, height } = Dimensions.get('window');

const MotivationalContent = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favoriteQuotes, setFavoriteQuotes] = useState([]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [activeQuote, setActiveQuote] = useState(null);
  const [dailyQuoteShown, setDailyQuoteShown] = useState(false);
  const [readArticles, setReadArticles] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Daily quote pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const contentCategories = [
    { id: 'all', name: 'All', icon: 'star', color: COLORS.primary },
    { id: 'quotes', name: 'Quotes', icon: 'format-quote', color: '#FF6B6B' },
    { id: 'videos', name: 'Videos', icon: 'play-circle-filled', color: '#4ECDC4' },
    { id: 'articles', name: 'Articles', icon: 'article', color: '#45B7D1' },
    { id: 'podcasts', name: 'Podcasts', icon: 'podcast', color: '#FFA07A' },
    { id: 'challenges', name: 'Challenges', icon: 'jump-rope', color: '#98D8C8' },
  ];

  const motivationalQuotes = [
    {
      id: 1,
      text: "Champions are made from something deep inside them - a desire, a dream, a vision.",
      author: "Muhammad Ali",
      category: 'quotes',
      likes: 1245,
      isLiked: false,
      sport: 'Boxing',
      difficulty: 'mindset',
      backgroundImage: 'boxing',
    },
    {
      id: 2,
      text: "Success is where preparation and opportunity meet.",
      author: "Bobby Unser",
      category: 'quotes',
      likes: 892,
      isLiked: true,
      sport: 'General',
      difficulty: 'preparation',
      backgroundImage: 'success',
    },
    {
      id: 3,
      text: "You miss 100% of the shots you don't take.",
      author: "Wayne Gretzky",
      category: 'quotes',
      likes: 2156,
      isLiked: false,
      sport: 'Hockey',
      difficulty: 'courage',
      backgroundImage: 'hockey',
    },
    {
      id: 4,
      text: "The only impossible journey is the one you never begin.",
      author: "Tony Robbins",
      category: 'quotes',
      likes: 1678,
      isLiked: true,
      sport: 'General',
      difficulty: 'start',
      backgroundImage: 'journey',
    },
  ];

  const motivationalContent = [
    {
      id: 1,
      title: "Mental Toughness in Elite Athletes",
      description: "Discover how top performers build unbreakable mental resilience",
      type: 'article',
      category: 'articles',
      duration: '8 min read',
      author: 'Dr. Sarah Johnson',
      rating: 4.9,
      thumbnail: 'article1',
      tags: ['psychology', 'performance', 'mindset'],
      isRead: false,
    },
    {
      id: 2,
      title: "The Champion's Mindset",
      description: "Motivational documentary featuring Olympic champions",
      type: 'video',
      category: 'videos',
      duration: '45 min',
      author: 'Sports Psychology Institute',
      rating: 4.8,
      thumbnail: 'video1',
      tags: ['documentary', 'olympics', 'inspiration'],
      isRead: false,
    },
    {
      id: 3,
      title: "Overcoming Setbacks Podcast",
      description: "Stories of athletes who turned failures into victories",
      type: 'podcast',
      category: 'podcasts',
      duration: '32 min',
      author: 'Athletic Minds',
      rating: 4.7,
      thumbnail: 'podcast1',
      tags: ['resilience', 'comeback', 'stories'],
      isRead: true,
    },
    {
      id: 4,
      title: "30-Day Confidence Challenge",
      description: "Daily tasks to build unshakeable self-belief",
      type: 'challenge',
      category: 'challenges',
      duration: '30 days',
      author: 'Peak Performance Academy',
      rating: 4.9,
      thumbnail: 'challenge1',
      tags: ['confidence', 'daily', 'growth'],
      isRead: false,
      progress: 12,
      totalDays: 30,
    },
  ];

  const dailyQuote = motivationalQuotes[0]; // Today's featured quote

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filteredContent = motivationalContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavoriteQuote = (quote) => {
    Vibration.vibrate(50);
    const updatedQuotes = motivationalQuotes.map(q => 
      q.id === quote.id ? { ...q, isLiked: !q.isLiked, likes: q.isLiked ? q.likes - 1 : q.likes + 1 } : q
    );
    
    if (!quote.isLiked) {
      setFavoriteQuotes(prev => [...prev, quote.id]);
    } else {
      setFavoriteQuotes(prev => prev.filter(id => id !== quote.id));
    }
  };

  const shareQuote = async (quote) => {
    try {
      await Share.share({
        message: `"${quote.text}" - ${quote.author}\n\nShared via Athletic Excellence App 🏆`,
        title: 'Motivational Quote',
      });
    } catch (error) {
      console.log('Error sharing quote:', error);
    }
  };

  const openContent = (content) => {
    Vibration.vibrate(50);
    if (!readArticles.includes(content.id)) {
      setReadArticles(prev => [...prev, content.id]);
    }
    
    Alert.alert(
      `${content.type === 'video' ? '🎬' : content.type === 'article' ? '📖' : content.type === 'podcast' ? '🎧' : '🏆'} ${content.title}`,
      `Opening ${content.type} - ${content.duration}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => console.log(`Opening ${content.type}:`, content.title) }
      ]
    );
  };

  const showDailyQuote = () => {
    setActiveQuote(dailyQuote);
    setShowQuoteModal(true);
    setDailyQuoteShown(true);
  };

  const renderDailyQuoteCard = () => (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
      }}
    >
      <TouchableOpacity onPress={showDailyQuote}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={{
            marginHorizontal: SPACING.md,
            marginBottom: SPACING.lg,
            borderRadius: 20,
            padding: SPACING.lg,
            minHeight: 120,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="wb-sunny" size={24} color={COLORS.white} />
              <Text style={[TEXT_STYLES.h3, { color: COLORS.white, marginLeft: SPACING.sm }]}>
                Daily Inspiration ✨
              </Text>
            </View>
            {!dailyQuoteShown && (
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: 10,
                paddingHorizontal: SPACING.sm,
                paddingVertical: SPACING.xs,
              }}>
                <Text style={[TEXT_STYLES.small, { color: COLORS.white }]}>NEW</Text>
              </View>
            )}
          </View>
          
          <Text style={[TEXT_STYLES.body, { color: COLORS.white, fontStyle: 'italic', marginBottom: SPACING.sm }]}>
            "{dailyQuote.text.length > 80 ? dailyQuote.text.substring(0, 80) + '...' : dailyQuote.text}"
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.9 }]}>
              - {dailyQuote.author}
            </Text>
            <Icon name="arrow-forward" size={20} color={COLORS.white} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderQuickInspiration = () => (
    <View style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.lg }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.text }]}>
        Quick Inspiration 🚀
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {motivationalQuotes.slice(1, 4).map((quote, index) => (
          <TouchableOpacity
            key={quote.id}
            onPress={() => {
              setActiveQuote(quote);
              setShowQuoteModal(true);
            }}
            style={{
              marginRight: SPACING.md,
              width: width * 0.7,
            }}
          >
            <Surface
              style={{
                borderRadius: 15,
                overflow: 'hidden',
                backgroundColor: COLORS.white,
                elevation: 3,
              }}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={{ padding: SPACING.md, minHeight: 100 }}
              >
                <Text style={[TEXT_STYLES.caption, { color: COLORS.white, fontStyle: 'italic', marginBottom: SPACING.sm }]}>
                  "{quote.text.length > 60 ? quote.text.substring(0, 60) + '...' : quote.text}"
                </Text>
                <Text style={[TEXT_STYLES.small, { color: COLORS.white, opacity: 0.9 }]}>
                  - {quote.author}
                </Text>
              </LinearGradient>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: SPACING.sm,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="favorite" size={16} color={quote.isLiked ? COLORS.error : COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.small, { marginLeft: SPACING.xs, color: COLORS.textSecondary }]}>
                    {quote.likes}
                  </Text>
                </View>
                <Chip size="small" style={{ backgroundColor: COLORS.background }}>
                  {quote.sport}
                </Chip>
              </View>
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCategories = () => (
    <View style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.lg }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.text }]}>
        Content Categories 📚
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {contentCategories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={{ marginRight: SPACING.md, marginLeft: index === 0 ? 0 : 0 }}
          >
            <Chip
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={{
                backgroundColor: selectedCategory === category.id ? category.color : COLORS.white,
                borderWidth: 1,
                borderColor: category.color,
              }}
              textStyle={{
                color: selectedCategory === category.id ? COLORS.white : category.color,
                fontWeight: '600',
              }}
              icon={({ size, color }) => (
                <Icon 
                  name={category.icon} 
                  size={size} 
                  color={selectedCategory === category.id ? COLORS.white : category.color} 
                />
              )}
            >
              {category.name}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const getContentIcon = (type) => {
    switch (type) {
      case 'video': return 'play-circle-filled';
      case 'article': return 'article';
      case 'podcast': return 'podcast';
      case 'challenge': return 'jump-rope';
      default: return 'star';
    }
  };

  const getContentColor = (type) => {
    switch (type) {
      case 'video': return '#4ECDC4';
      case 'article': return '#45B7D1';
      case 'podcast': return '#FFA07A';
      case 'challenge': return '#98D8C8';
      default: return COLORS.primary;
    }
  };

  const renderContentCard = (content) => (
    <Card
      key={content.id}
      style={{
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        backgroundColor: COLORS.white,
        elevation: 3,
      }}
    >
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: getContentColor(content.type),
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SPACING.md,
            }}
          >
            <Icon name={getContentIcon(content.type)} size={24} color={COLORS.white} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600', flex: 1 }]}>
                {content.title}
              </Text>
              {readArticles.includes(content.id) && (
                <View style={{
                  backgroundColor: COLORS.success,
                  borderRadius: 8,
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: 2,
                }}>
                  <Text style={[TEXT_STYLES.small, { color: COLORS.white }]}>✓</Text>
                </View>
              )}
            </View>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.xs }]}>
              {content.description}
            </Text>
            <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>
              By {content.author}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} style={{ marginRight: SPACING.xs }} />
            <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>{content.duration}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="star" size={16} color={COLORS.warning} style={{ marginRight: SPACING.xs }} />
            <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>{content.rating}</Text>
          </View>
        </View>

        {content.type === 'challenge' && content.progress && (
          <View style={{ marginBottom: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
              <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>Progress</Text>
              <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>
                {content.progress}/{content.totalDays} days
              </Text>
            </View>
            <ProgressBar 
              progress={content.progress / content.totalDays} 
              color={getContentColor(content.type)}
              style={{ height: 4, borderRadius: 2 }}
            />
          </View>
        )}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
          {content.tags.map((tag, index) => (
            <Chip
              key={index}
              size="small"
              style={{
                marginRight: SPACING.xs,
                marginBottom: SPACING.xs,
                backgroundColor: COLORS.background,
              }}
              textStyle={{ color: COLORS.textSecondary }}
            >
              {tag}
            </Chip>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={() => openContent(content)}
          style={{ borderRadius: 25 }}
          buttonColor={getContentColor(content.type)}
          icon={getContentIcon(content.type)}
        >
          {content.type === 'challenge' ? 'Continue Challenge' : 
           content.type === 'video' ? 'Watch Now' :
           content.type === 'podcast' ? 'Listen Now' : 'Read Now'}
        </Button>
      </Card.Content>
    </Card>
  );

  const renderQuoteModal = () => (
    <Portal>
      <Modal
        visible={showQuoteModal}
        onDismiss={() => setShowQuoteModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.white,
          margin: SPACING.lg,
          borderRadius: 20,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {activeQuote && (
          <View>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              style={{ padding: SPACING.lg }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
                <Icon name="format-quote" size={32} color={COLORS.white} />
                <IconButton
                  icon="close"
                  iconColor={COLORS.white}
                  size={24}
                  onPress={() => setShowQuoteModal(false)}
                />
              </View>
              
              <Text style={[TEXT_STYLES.h2, { color: COLORS.white, fontStyle: 'italic', textAlign: 'center', marginBottom: SPACING.lg }]}>
                "{activeQuote.text}"
              </Text>
              
              <Text style={[TEXT_STYLES.body, { color: COLORS.white, textAlign: 'center', opacity: 0.9 }]}>
                - {activeQuote.author}
              </Text>
            </LinearGradient>
            
            <View style={{ padding: SPACING.lg }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
                <Chip
                  style={{ backgroundColor: COLORS.background }}
                  textStyle={{ color: COLORS.text }}
                >
                  {activeQuote.sport}
                </Chip>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="favorite" size={20} color={activeQuote.isLiked ? COLORS.error : COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.xs, color: COLORS.textSecondary }]}>
                    {activeQuote.likes}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  mode="outlined"
                  onPress={() => toggleFavoriteQuote(activeQuote)}
                  style={{ flex: 1, marginRight: SPACING.sm, borderRadius: 25 }}
                  textColor={activeQuote.isLiked ? COLORS.error : COLORS.textSecondary}
                  icon={activeQuote.isLiked ? "favorite" : "favorite-border"}
                >
                  {activeQuote.isLiked ? 'Liked' : 'Like'}
                </Button>
                
                <Button
                  mode="contained"
                  onPress={() => shareQuote(activeQuote)}
                  style={{ flex: 1, marginLeft: SPACING.sm, borderRadius: 25 }}
                  buttonColor="#FF6B6B"
                  icon="share"
                >
                  Share
                </Button>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
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
          contentContainerStyle={{ paddingTop: SPACING.lg, paddingBottom: 100 }}
        >
          {renderDailyQuoteCard()}
          
          <Searchbar
            placeholder="Search motivational content..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{
              marginHorizontal: SPACING.md,
              marginBottom: SPACING.lg,
              backgroundColor: COLORS.white,
              borderRadius: 25,
            }}
            iconColor={COLORS.primary}
          />

          {renderQuickInspiration()}
          {renderCategories()}

          <View style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
              Motivational Content 🔥
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.md }]}>
              {filteredContent.length} items available
            </Text>
          </View>

          {filteredContent.map(renderContentCard)}
        </ScrollView>
      </Animated.View>

      {renderQuoteModal()}

      <FAB
        icon="auto-awesome"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: '#FF6B6B',
        }}
        onPress={() => Alert.alert('✨ AI Motivation', 'Personalized motivational content recommendations coming soon!', [
          { text: 'OK', onPress: () => console.log('AI Motivation feature') }
        ])}
      />
    </View>
  );
};

export default MotivationalContent;