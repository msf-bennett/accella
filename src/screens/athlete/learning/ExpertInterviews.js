import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  Vibration,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Badge,
  FAB,
} from 'react-native-paper';
import { Text } from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const ExpertInterviews = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { interviews, loading } = useSelector(state => state.learning);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Mock data for expert interviews
  const mockInterviews = [
    {
      id: 1,
      title: 'Mental Toughness in Elite Sports',
      expert: {
        name: 'Dr. Sarah Johnson',
        title: 'Sports Psychologist',
        avatar: 'https://via.placeholder.com/100',
        credentials: 'PhD in Sports Psychology',
        experience: '15+ years',
      },
      category: 'Psychology',
      duration: '42:15',
      views: 15420,
      likes: 892,
      publishDate: '2024-01-15',
      description: 'Learn how elite athletes develop unshakeable mental resilience and overcome pressure in high-stakes competitions.',
      tags: ['Mental Health', 'Performance', 'Elite Athletes'],
      thumbnail: 'psychology',
      isWatched: false,
      isFavorite: false,
      difficulty: 'Intermediate',
      rating: 4.9,
      keyTopics: ['Visualization', 'Pressure Management', 'Focus Techniques'],
      sport: 'General',
      isPremium: false,
      watchProgress: 0,
    },
    {
      id: 2,
      title: 'Nutrition Secrets from Olympic Athletes',
      expert: {
        name: 'Maria Rodriguez',
        title: 'Olympic Nutritionist',
        avatar: 'https://via.placeholder.com/100',
        credentials: 'MSc Nutrition, Olympic Team',
        experience: '12+ years',
      },
      category: 'Nutrition',
      duration: '38:45',
      views: 22580,
      likes: 1240,
      publishDate: '2024-01-20',
      description: 'Discover the nutrition strategies that fuel Olympic champions and learn how to optimize your own performance through food.',
      tags: ['Olympic Training', 'Meal Planning', 'Recovery'],
      thumbnail: 'restaurant',
      isWatched: true,
      isFavorite: true,
      difficulty: 'Beginner',
      rating: 4.8,
      keyTopics: ['Macronutrients', 'Timing', 'Hydration'],
      sport: 'General',
      isPremium: false,
      watchProgress: 1.0,
    },
    {
      id: 3,
      title: 'Building Speed: Insights from World Record Holders',
      expert: {
        name: 'Coach Marcus Thompson',
        title: 'Sprint Coach',
        avatar: 'https://via.placeholder.com/100',
        credentials: 'Former Olympic Athlete',
        experience: '20+ years coaching',
      },
      category: 'Training',
      duration: '52:30',
      views: 18900,
      likes: 1050,
      publishDate: '2024-01-18',
      description: 'World-class sprint coach shares the training methods and techniques used to develop world record breaking speed.',
      tags: ['Speed Training', 'Track & Field', 'Biomechanics'],
      thumbnail: 'directions_run',
      isWatched: false,
      isFavorite: false,
      difficulty: 'Advanced',
      rating: 4.9,
      keyTopics: ['Sprint Mechanics', 'Power Development', 'Race Strategy'],
      sport: 'Track & Field',
      isPremium: true,
      watchProgress: 0.35,
    },
    {
      id: 4,
      title: 'Recovery Revolution: Modern Recovery Methods',
      expert: {
        name: 'Dr. Alex Chen',
        title: 'Sports Medicine Specialist',
        avatar: 'https://via.placeholder.com/100',
        credentials: 'MD, Sports Medicine',
        experience: '18+ years',
      },
      category: 'Recovery',
      duration: '45:20',
      views: 13250,
      likes: 720,
      publishDate: '2024-01-22',
      description: 'Explore cutting-edge recovery techniques and technologies used by professional athletes to maximize training adaptations.',
      tags: ['Recovery Science', 'Technology', 'Professional Sports'],
      thumbnail: 'healing',
      isWatched: false,
      isFavorite: true,
      difficulty: 'Intermediate',
      rating: 4.7,
      keyTopics: ['Sleep Optimization', 'Cold Therapy', 'Technology'],
      sport: 'General',
      isPremium: true,
      watchProgress: 0,
    },
    {
      id: 5,
      title: 'Youth Development: Building Future Champions',
      expert: {
        name: 'Lisa Williams',
        title: 'Youth Development Coach',
        avatar: 'https://via.placeholder.com/100',
        credentials: 'IAAF Level 5 Coach',
        experience: '25+ years',
      },
      category: 'Youth Development',
      duration: '36:15',
      views: 9680,
      likes: 540,
      publishDate: '2024-01-25',
      description: 'Learn the principles of long-term athlete development and how to nurture young talent while avoiding burnout.',
      tags: ['Youth Sports', 'Development', 'Coaching'],
      thumbnail: 'group',
      isWatched: true,
      isFavorite: false,
      difficulty: 'Beginner',
      rating: 4.8,
      keyTopics: ['LTAD Model', 'Skill Development', 'Motivation'],
      sport: 'General',
      isPremium: false,
      watchProgress: 0.80,
    },
  ];

  const categories = ['All', 'Psychology', 'Nutrition', 'Training', 'Recovery', 'Youth Development'];

  useEffect(() => {
    // Animate screen entrance
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

    // Filter interviews based on search and category
    filterInterviews();
  }, [searchQuery, selectedCategory]);

  const filterInterviews = useCallback(() => {
    let filtered = mockInterviews;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(interview => interview.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(interview =>
        interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        interview.keyTopics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredInterviews(filtered);
  }, [searchQuery, selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handlePlay = (interview) => {
    if (interview.isPremium && !user?.isPremium) {
      Alert.alert(
        'Premium Content 👑',
        'This expert interview is available for premium subscribers only. Upgrade to access exclusive content!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') }
        ]
      );
      return;
    }

    Vibration.vibrate(50);
    navigation.navigate('VideoPlayer', { 
      interviewId: interview.id,
      title: interview.title,
      expert: interview.expert.name
    });
  };

  const toggleFavorite = (interviewId) => {
    Vibration.vibrate(30);
    // Update favorite status in Redux store
    Alert.alert('Added to Favorites! ⭐', 'Interview saved to your favorites list.');
  };

  const formatDuration = (duration) => {
    return duration;
  };

  const formatViews = (views) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const renderInterviewCard = (interview) => (
    <Card key={interview.id} style={styles.interviewCard}>
      <TouchableOpacity onPress={() => handlePlay(interview)} activeOpacity={0.9}>
        <View style={styles.thumbnailContainer}>
          <LinearGradient
            colors={[COLORS.primary + '80', COLORS.primary + '40']}
            style={styles.thumbnailGradient}
          >
            <Icon name={interview.thumbnail} size={40} color="white" />
            <View style={styles.playButton}>
              <Icon name="play-arrow" size={24} color="white" />
            </View>
          </LinearGradient>
          
          <View style={styles.thumbnailOverlay}>
            <View style={styles.durationChip}>
              <Text style={styles.durationText}>{interview.duration}</Text>
            </View>
            {interview.isPremium && (
              <View style={styles.premiumBadge}>
                <Icon name="star" size={12} color="#FFD700" />
              </View>
            )}
          </View>

          {interview.watchProgress > 0 && (
            <View style={styles.progressOverlay}>
              <View style={[styles.progressBar, { width: `${interview.watchProgress * 100}%` }]} />
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.expertRow}>
            <Avatar.Text 
              size={32} 
              label={interview.expert.name.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: COLORS.primary }}
            />
            <View style={styles.expertInfo}>
              <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>
                {interview.expert.name}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontSize: 10 }]}>
                {interview.expert.title}
              </Text>
            </View>
            <IconButton
              icon={interview.isFavorite ? "favorite" : "favorite-border"}
              size={16}
              iconColor={interview.isFavorite ? COLORS.error : COLORS.textSecondary}
              onPress={() => toggleFavorite(interview.id)}
            />
          </View>

          <Text style={[TEXT_STYLES.body, styles.interviewTitle]} numberOfLines={2}>
            {interview.title}
          </Text>

          <Text style={[TEXT_STYLES.caption, styles.description]} numberOfLines={2}>
            {interview.description}
          </Text>

          <View style={styles.tagsContainer}>
            {interview.keyTopics.slice(0, 2).map((topic, index) => (
              <Chip
                key={index}
                mode="outlined"
                compact
                style={styles.topicChip}
                textStyle={{ fontSize: 9 }}
              >
                {topic}
              </Chip>
            ))}
            {interview.keyTopics.length > 2 && (
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                +{interview.keyTopics.length - 2} more
              </Text>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statGroup}>
              <Icon name="visibility" size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{formatViews(interview.views)}</Text>
            </View>
            <View style={styles.statGroup}>
              <Icon name="thumb-up" size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{interview.likes}</Text>
            </View>
            <View style={styles.statGroup}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.statText}>{interview.rating}</Text>
            </View>
            <Chip
              mode="flat"
              compact
              style={[styles.difficultyChip, { 
                backgroundColor: interview.difficulty === 'Beginner' ? '#4CAF50' + '20' :
                                interview.difficulty === 'Intermediate' ? '#FF9800' + '20' : '#F44336' + '20'
              }]}
              textStyle={{ 
                color: interview.difficulty === 'Beginner' ? '#4CAF50' :
                       interview.difficulty === 'Intermediate' ? '#FF9800' : '#F44336',
                fontSize: 9
              }}
            >
              {interview.difficulty}
            </Chip>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.heading2, { color: 'white' }]}>
            Expert Interviews 🎤
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
            Learn from the best in sports
          </Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search experts, topics..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={{ color: COLORS.text }}
          />
          <IconButton
            icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
            size={20}
            iconColor={COLORS.primary}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={styles.viewModeButton}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              mode={selectedCategory === category ? "flat" : "outlined"}
              style={[
                styles.categoryChip,
                selectedCategory === category && { backgroundColor: COLORS.primary }
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === category && { color: 'white' }
              ]}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.interviewsList}
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
          <View style={styles.interviewsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={TEXT_STYLES.heading3}>
                Featured Interviews ({filteredInterviews.length})
              </Text>
              <IconButton
                icon="filter-list"
                size={20}
                iconColor={COLORS.primary}
                onPress={() => Alert.alert('Filter', 'Advanced filtering coming soon! 🔧')}
              />
            </View>

            <View style={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}>
              {filteredInterviews.map(renderInterviewCard)}
            </View>

            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>
      </Animated.View>

      <FAB
        icon="video-call"
        label="Request Interview"
        style={styles.fab}
        color="white"
        onPress={() => Alert.alert('Request Interview 🎬', 'Feature coming soon! Request interviews with your favorite experts.')}
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
  content: {
    flex: 1,
    marginTop: -SPACING.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'white',
    elevation: 2,
    marginRight: SPACING.sm,
  },
  viewModeButton: {
    backgroundColor: 'white',
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
  },
  categoryChip: {
    marginRight: SPACING.xs,
  },
  categoryChipText: {
    fontSize: 12,
  },
  interviewsList: {
    flex: 1,
  },
  interviewsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listContainer: {
    flex: 1,
  },
  interviewCard: {
    width: width * 0.43,
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    height: 120,
    position: 'relative',
  },
  thumbnailGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: SPACING.xs,
  },
  durationChip: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  premiumBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 4,
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  cardContent: {
    padding: SPACING.sm,
  },
  expertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  expertInfo: {
    flex: 1,
    marginLeft: SPACING.xs,
  },
  interviewTitle: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  description: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    flexWrap: 'wrap',
  },
  topicChip: {
    height: 20,
    marginRight: 4,
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  difficultyChip: {
    height: 20,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: SPACING.xl * 2,
  },
});

export default ExpertInterviews;