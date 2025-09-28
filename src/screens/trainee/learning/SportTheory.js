import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Searchbar,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SportsTheory = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [readProgress, setReadProgress] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userProgress = useSelector(state => state.learning.sportsTheoryProgress || {});

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
  }, []);

  const theoryCategories = [
    { id: 'all', name: 'All Topics', icon: 'library-books', color: COLORS.primary },
    { id: 'physiology', name: 'Exercise Physiology', icon: 'favorite', color: '#e74c3c' },
    { id: 'biomechanics', name: 'Biomechanics', icon: 'directions-run', color: '#f39c12' },
    { id: 'nutrition', name: 'Sports Nutrition', icon: 'restaurant', color: '#27ae60' },
    { id: 'psychology', name: 'Sports Psychology', icon: 'psychology', color: '#9b59b6' },
    { id: 'recovery', name: 'Recovery Science', icon: 'bedtime', color: '#3498db' },
    { id: 'training', name: 'Training Methods', icon: 'fitness-center', color: '#e67e22' },
  ];

  const theoryTopics = [
    {
      id: 1,
      category: 'physiology',
      title: 'Energy Systems in Exercise',
      description: 'Understanding ATP-PC, Glycolytic, and Oxidative systems',
      difficulty: 'Beginner',
      readTime: '8 min',
      points: 50,
      content: 'Detailed explanation of energy systems...',
      image: '⚡',
      tags: ['ATP', 'Metabolism', 'Energy'],
      completion: userProgress['energy-systems'] || 0,
    },
    {
      id: 2,
      category: 'biomechanics',
      title: 'Movement Analysis Fundamentals',
      description: 'Learn to analyze and optimize movement patterns',
      difficulty: 'Intermediate',
      readTime: '12 min',
      points: 75,
      content: 'Comprehensive guide to movement analysis...',
      image: '🏃‍♂️',
      tags: ['Movement', 'Analysis', 'Technique'],
      completion: userProgress['movement-analysis'] || 0,
    },
    {
      id: 3,
      category: 'nutrition',
      title: 'Pre and Post Workout Nutrition',
      description: 'Optimize your performance with proper nutrition timing',
      difficulty: 'Beginner',
      readTime: '10 min',
      points: 60,
      content: 'Essential nutrition strategies...',
      image: '🥗',
      tags: ['Nutrition', 'Performance', 'Recovery'],
      completion: userProgress['workout-nutrition'] || 0,
    },
    {
      id: 4,
      category: 'psychology',
      title: 'Mental Training Techniques',
      description: 'Develop mental toughness and focus for peak performance',
      difficulty: 'Advanced',
      readTime: '15 min',
      points: 100,
      content: 'Advanced mental training methods...',
      image: '🧠',
      tags: ['Mental', 'Focus', 'Performance'],
      completion: userProgress['mental-training'] || 0,
    },
    {
      id: 5,
      category: 'recovery',
      title: 'Sleep and Athletic Performance',
      description: 'The science behind sleep for optimal recovery',
      difficulty: 'Beginner',
      readTime: '7 min',
      points: 45,
      content: 'Understanding sleep science...',
      image: '😴',
      tags: ['Sleep', 'Recovery', 'Performance'],
      completion: userProgress['sleep-performance'] || 0,
    },
    {
      id: 6,
      category: 'training',
      title: 'Periodization Principles',
      description: 'Plan your training cycles for continuous improvement',
      difficulty: 'Advanced',
      readTime: '18 min',
      points: 120,
      content: 'Master periodization concepts...',
      image: '📈',
      tags: ['Periodization', 'Planning', 'Progressive'],
      completion: userProgress['periodization'] || 0,
    },
    {
      id: 7,
      category: 'physiology',
      title: 'Heart Rate Training Zones',
      description: 'Master training intensity using heart rate zones',
      difficulty: 'Intermediate',
      readTime: '11 min',
      points: 70,
      content: 'Heart rate zone training guide...',
      image: '❤️',
      tags: ['Heart Rate', 'Zones', 'Intensity'],
      completion: userProgress['hr-zones'] || 0,
    },
    {
      id: 8,
      category: 'biomechanics',
      title: 'Injury Prevention Through Mechanics',
      description: 'Use proper movement mechanics to prevent injuries',
      difficulty: 'Intermediate',
      readTime: '14 min',
      points: 85,
      content: 'Injury prevention strategies...',
      image: '🛡️',
      tags: ['Injury', 'Prevention', 'Mechanics'],
      completion: userProgress['injury-prevention'] || 0,
    },
  ];

  const filteredTopics = theoryTopics.filter(topic => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleTopicPress = (topic) => {
    setSelectedTopic(topic);
    setModalVisible(true);
  };

  const handleStartReading = (topic) => {
    setModalVisible(false);
    Alert.alert(
      'Start Reading',
      `Ready to dive into "${topic.title}"? You'll earn ${topic.points} points upon completion!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Reading', 
          onPress: () => {
            // Navigate to reading screen or handle reading logic
            Alert.alert('Feature Coming Soon', 'Interactive reading experience is being developed!');
          }
        },
      ]
    );
  };

  const toggleFavorite = (topicId) => {
    setFavorites(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.secondary;
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <Text style={[TEXT_STYLES.heading, styles.headerTitle]}>
          Sports Theory 📚
        </Text>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Master the science behind peak performance
        </Text>
        
        <Surface style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Topics Read</Text>
              <Text style={[TEXT_STYLES.heading, styles.statValue]}>
                {Object.keys(userProgress).length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Points Earned</Text>
              <Text style={[TEXT_STYLES.heading, styles.statValue]}>
                {Object.values(userProgress).reduce((sum, progress) => sum + (progress === 100 ? 50 : 0), 0)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Learning Streak</Text>
              <Text style={[TEXT_STYLES.heading, styles.statValue]}>7 🔥</Text>
            </View>
          </View>
        </Surface>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchSection}>
      <Searchbar
        placeholder="Search sports theory topics..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
        inputStyle={TEXT_STYLES.body}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}
      >
        {theoryCategories.map((category, index) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={[
              TEXT_STYLES.caption,
              selectedCategory === category.id && { color: 'white' }
            ]}
            icon={() => (
              <Icon 
                name={category.icon} 
                size={16} 
                color={selectedCategory === category.id ? 'white' : category.color} 
              />
            )}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderTopicCard = (topic, index) => (
    <Animated.View
      key={topic.id}
      style={[
        styles.topicCardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <Card style={styles.topicCard} onPress={() => handleTopicPress(topic)}>
        <Card.Content style={styles.topicContent}>
          <View style={styles.topicHeader}>
            <Text style={styles.topicEmoji}>{topic.image}</Text>
            <View style={styles.topicMeta}>
              <Chip
                style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(topic.difficulty) }]}
                textStyle={styles.difficultyText}
              >
                {topic.difficulty}
              </Chip>
              <IconButton
                icon={favorites.includes(topic.id) ? 'favorite' : 'favorite-border'}
                size={20}
                iconColor={favorites.includes(topic.id) ? COLORS.error : COLORS.text}
                onPress={() => toggleFavorite(topic.id)}
              />
            </View>
          </View>
          
          <Text style={[TEXT_STYLES.subheading, styles.topicTitle]}>
            {topic.title}
          </Text>
          <Text style={[TEXT_STYLES.body, styles.topicDescription]}>
            {topic.description}
          </Text>
          
          <View style={styles.topicTags}>
            {topic.tags.map((tag, tagIndex) => (
              <Chip key={tagIndex} style={styles.tag} textStyle={styles.tagText}>
                {tag}
              </Chip>
            ))}
          </View>
          
          <View style={styles.topicFooter}>
            <View style={styles.topicStats}>
              <View style={styles.statRow}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, styles.statText]}>{topic.readTime}</Text>
              </View>
              <View style={styles.statRow}>
                <Icon name="star" size={16} color={COLORS.secondary} />
                <Text style={[TEXT_STYLES.caption, styles.statText]}>{topic.points} pts</Text>
              </View>
            </View>
            
            {topic.completion > 0 && (
              <View style={styles.progressSection}>
                <Text style={[TEXT_STYLES.caption, styles.progressText]}>
                  {topic.completion}% complete
                </Text>
                <ProgressBar
                  progress={topic.completion / 100}
                  color={COLORS.success}
                  style={styles.progressBar}
                />
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedTopic && (
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalEmoji}>{selectedTopic.image}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              />
            </View>
            
            <Text style={[TEXT_STYLES.heading, styles.modalTitle]}>
              {selectedTopic.title}
            </Text>
            <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
              {selectedTopic.description}
            </Text>
            
            <View style={styles.modalStats}>
              <Surface style={styles.modalStatItem}>
                <Icon name="schedule" size={20} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, styles.modalStatText]}>
                  {selectedTopic.readTime}
                </Text>
              </Surface>
              <Surface style={styles.modalStatItem}>
                <Icon name="star" size={20} color={COLORS.secondary} />
                <Text style={[TEXT_STYLES.caption, styles.modalStatText]}>
                  {selectedTopic.points} points
                </Text>
              </Surface>
              <Surface style={styles.modalStatItem}>
                <Icon name="trending-up" size={20} color={getDifficultyColor(selectedTopic.difficulty)} />
                <Text style={[TEXT_STYLES.caption, styles.modalStatText]}>
                  {selectedTopic.difficulty}
                </Text>
              </Surface>
            </View>
            
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: COLORS.primary }]}
              onPress={() => handleStartReading(selectedTopic)}
            >
              <Text style={[TEXT_STYLES.buttonText, styles.startButtonText]}>
                Start Reading 📖
              </Text>
            </TouchableOpacity>
          </Surface>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
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
        {renderSearchAndFilters()}
        
        <View style={styles.topicsSection}>
          <Text style={[TEXT_STYLES.subheading, styles.sectionTitle]}>
            {selectedCategory === 'all' ? 'All Topics' : 
             theoryCategories.find(c => c.id === selectedCategory)?.name} 
            ({filteredTopics.length})
          </Text>
          
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic, index) => renderTopicCard(topic, index))
          ) : (
            <Surface style={styles.emptyState}>
              <Icon name="search-off" size={48} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.body, styles.emptyText]}>
                No topics found matching your search
              </Text>
            </Surface>
          )}
        </View>
      </ScrollView>
      
      {renderModal()}
    </View>
  );
};

const styles = {
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
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  statsCard: {
    borderRadius: 12,
    padding: SPACING.md,
    width: '100%',
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  categoriesScroll: {
    marginHorizontal: -SPACING.md,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  topicsSection: {
    padding: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  topicCardContainer: {
    marginBottom: SPACING.md,
  },
  topicCard: {
    elevation: 3,
    backgroundColor: COLORS.surface,
  },
  topicContent: {
    padding: SPACING.md,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  topicEmoji: {
    fontSize: 32,
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyChip: {
    marginRight: SPACING.sm,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
  },
  topicTitle: {
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  topicDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  topicTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tag: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  topicFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  topicStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  progressSection: {
    alignItems: 'flex-end',
  },
  progressText: {
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    width: 100,
    height: 4,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalEmoji: {
    fontSize: 40,
  },
  closeButton: {
    margin: 0,
  },
  modalTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
  },
  modalStatItem: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    elevation: 1,
  },
  modalStatText: {
    marginTop: SPACING.xs,
    color: COLORS.text,
  },
  startButton: {
    borderRadius: 25,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
  },
};

export default SportsTheory;
