import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Dimensions,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  ProgressBar,
  Portal,
  Modal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width, height } = Dimensions.get('window');

const KnowledgeBase = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, coachProfile } = useSelector(state => state.auth);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredContent, setFilteredContent] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Mock data - Replace with Redux state/API calls
  const [knowledgeContent] = useState([
    {
      id: 1,
      title: 'Advanced Football Drills',
      description: 'Comprehensive collection of skill-building exercises',
      category: 'drills',
      type: 'video',
      duration: '15 min',
      views: 234,
      likes: 45,
      tags: ['football', 'advanced', 'skills'],
      createdAt: '2024-08-10',
      //thumbnail: require('../assets/images/drill-thumbnail.jpg'),
    },
    {
      id: 2,
      title: 'Nutrition Guide for Athletes',
      description: 'Complete nutrition plan for peak performance',
      category: 'nutrition',
      type: 'document',
      pages: 24,
      downloads: 156,
      likes: 78,
      tags: ['nutrition', 'performance', 'health'],
      createdAt: '2024-08-08',
    },
    {
      id: 3,
      title: 'Mental Preparation Techniques',
      description: 'Psychological strategies for competitive success',
      category: 'psychology',
      type: 'article',
      readTime: '8 min',
      views: 189,
      likes: 92,
      tags: ['mental', 'psychology', 'performance'],
      createdAt: '2024-08-05',
    },
  ]);

  const categories = [
    { id: 'all', name: 'All Content', icon: 'dashboard', count: knowledgeContent.length },
    { id: 'drills', name: 'Drills & Exercises', icon: 'fitness-center', count: 8 },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant', count: 5 },
    { id: 'psychology', name: 'Mental Training', icon: 'psychology', count: 3 },
    { id: 'strategy', name: 'Game Strategy', icon: 'sports-football', count: 6 },
    { id: 'recovery', name: 'Recovery', icon: 'healing', count: 4 },
  ];

  const contentTypes = [
    { type: 'video', icon: 'play-circle-filled', color: '#FF6B6B' },
    { type: 'document', icon: 'description', color: '#4ECDC4' },
    { type: 'article', icon: 'article', color: '#45B7D1' },
    { type: 'quiz', icon: 'quiz', color: '#96CEB4' },
  ];

  // Effects
  useEffect(() => {
    const animateIn = () => {
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
    };
    
    animateIn();
    filterContent();
  }, [searchQuery, selectedCategory]);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Knowledge base updated! 📚');
    }, 1500);
  }, []);

  const filterContent = useCallback(() => {
    let filtered = knowledgeContent;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredContent(filtered);
  }, [searchQuery, selectedCategory, knowledgeContent]);

  const handleCreateContent = () => {
    Vibration.vibrate(100);
    Alert.alert(
      'Create Content 📝',
      'Content creation feature coming soon! You\'ll be able to upload videos, documents, and create interactive quizzes.',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleContentPress = (content) => {
    Vibration.vibrate(50);
    navigation.navigate('ContentViewer', { contentId: content.id });
  };

  const handleCategorySelect = (categoryId) => {
    Vibration.vibrate(30);
    setSelectedCategory(categoryId);
  };

  // Render methods
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Knowledge Base 📚</Text>
            <Text style={styles.headerSubtitle}>
              Manage your coaching resources
            </Text>
          </View>
          <Avatar.Image
            size={45}
            source={{ uri: coachProfile?.avatar || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
        </View>
        
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{knowledgeContent.length}</Text>
            <Text style={styles.statLabel}>Total Content</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>1.2K</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>89%</Text>
            <Text style={styles.statLabel}>Engagement</Text>
          </Surface>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search knowledge base..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
        inputStyle={styles.searchInput}
      />
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((category, index) => (
          <Animated.View
            key={category.id}
            style={[
              styles.categoryWrapper,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 50],
                  })
                }],
                opacity: fadeAnim,
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => handleCategorySelect(category.id)}
              activeOpacity={0.8}
            >
              <Card
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
              >
                <View style={styles.categoryContent}>
                  <Icon
                    name={category.icon}
                    size={24}
                    color={selectedCategory === category.id ? COLORS.primary : '#666'}
                  />
                  <Text style={[
                    styles.categoryName,
                    selectedCategory === category.id && styles.selectedCategoryText
                  ]}>
                    {category.name}
                  </Text>
                  <Chip style={styles.categoryCount}>
                    {category.count}
                  </Chip>
                </View>
              </Card>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {[
          { title: 'Upload Video', icon: 'video-library', color: '#FF6B6B' },
          { title: 'Create Article', icon: 'create', color: '#4ECDC4' },
          { title: 'Add Document', icon: 'upload-file', color: '#45B7D1' },
          { title: 'Make Quiz', icon: 'quiz', color: '#96CEB4' },
        ].map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={handleCreateContent}
            activeOpacity={0.8}
            style={styles.quickActionCard}
          >
            <LinearGradient
              colors={[action.color + '20', action.color + '10']}
              style={styles.quickActionGradient}
            >
              <Icon name={action.icon} size={28} color={action.color} />
              <Text style={styles.quickActionText}>{action.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderContentItem = ({ item, index }) => {
    const contentType = contentTypes.find(type => type.type === item.type);
    
    return (
      <Animated.View
        style={[
          styles.contentItemWrapper,
          {
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50],
              })
            }],
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleContentPress(item)}
          activeOpacity={0.9}
        >
          <Card style={styles.contentCard}>
            <View style={styles.contentHeader}>
              <View style={styles.contentTypeIndicator}>
                <Icon
                  name={contentType?.icon || 'description'}
                  size={20}
                  color={contentType?.color || '#666'}
                />
                <Text style={[styles.contentType, { color: contentType?.color }]}>
                  {item.type.toUpperCase()}
                </Text>
              </View>
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => {
                  Alert.alert('Content Options', 'Edit, Share, or Delete content', [
                    { text: 'Edit', onPress: () => console.log('Edit') },
                    { text: 'Share', onPress: () => console.log('Share') },
                    { text: 'Delete', onPress: () => console.log('Delete'), style: 'destructive' },
                    { text: 'Cancel', style: 'cancel' }
                  ]);
                }}
              />
            </View>
            
            <View style={styles.contentBody}>
              <Text style={styles.contentTitle}>{item.title}</Text>
              <Text style={styles.contentDescription}>{item.description}</Text>
              
              <View style={styles.contentMeta}>
                <Text style={styles.metaText}>
                  {item.duration || `${item.readTime || `${item.pages} pages`}`}
                </Text>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>{item.views || item.downloads} views</Text>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>{item.likes} ❤️</Text>
              </View>
              
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 3).map((tag, tagIndex) => (
                  <Chip
                    key={tagIndex}
                    style={styles.tag}
                    textStyle={styles.tagText}
                    compact
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="library-books" size={80} color="#DDD" />
      <Text style={styles.emptyTitle}>No content found</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery 
          ? `No results for "${searchQuery}"`
          : 'Start building your knowledge base'}
      </Text>
      <Button
        mode="contained"
        onPress={handleCreateContent}
        style={styles.emptyActionButton}
        icon="add"
      >
        Create First Content
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressViewOffset={60}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderSearchBar()}
        {renderCategories()}
        {renderQuickActions()}
        
        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'All Content' : categories.find(c => c.id === selectedCategory)?.name} 
              ({filteredContent.length})
            </Text>
            <IconButton
              icon="sort"
              size={24}
              onPress={() => {
                Alert.alert('Sort Options', 'Sort by Date, Views, or Likes', [
                  { text: 'Date Created', onPress: () => console.log('Sort by date') },
                  { text: 'Most Views', onPress: () => console.log('Sort by views') },
                  { text: 'Most Liked', onPress: () => console.log('Sort by likes') },
                  { text: 'Cancel', style: 'cancel' }
                ]);
              }}
            />
          </View>
          
          {filteredContent.length > 0 ? (
            filteredContent.map((item, index) => renderContentItem({ item, index }))
          ) : (
            renderEmptyState()
          )}
        </View>
      </Animated.ScrollView>
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleCreateContent}
        color="#FFF"
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.large,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    paddingHorizontal: SPACING.large,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    elevation: 2,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: '#FFF',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#FFF',
    opacity: 0.8,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.large,
  },
  searchBar: {
    elevation: 4,
    borderRadius: 25,
  },
  searchInput: {
    fontSize: 16,
  },
  categoriesContainer: {
    paddingTop: SPACING.large,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    paddingHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
    color: '#333',
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.large,
  },
  categoryWrapper: {
    marginRight: SPACING.medium,
  },
  categoryCard: {
    minWidth: 140,
    borderRadius: 16,
    elevation: 3,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  categoryContent: {
    padding: SPACING.medium,
    alignItems: 'center',
  },
  categoryName: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginTop: SPACING.small,
    marginBottom: SPACING.small,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoryCount: {
    backgroundColor: COLORS.primary + '20',
  },
  quickActionsContainer: {
    paddingTop: SPACING.large,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.large,
  },
  quickActionCard: {
    width: (width - SPACING.large * 3) / 2,
    marginRight: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: SPACING.large,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  quickActionText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginTop: SPACING.small,
    textAlign: 'center',
  },
  contentSection: {
    paddingTop: SPACING.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
  },
  contentItemWrapper: {
    paddingHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
  },
  contentCard: {
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingTop: SPACING.small,
  },
  contentTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentType: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginLeft: 4,
  },
  contentBody: {
    padding: SPACING.medium,
  },
  contentTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: '600',
    marginBottom: SPACING.small,
  },
  contentDescription: {
    ...TEXT_STYLES.body,
    color: '#666',
    marginBottom: SPACING.medium,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  metaText: {
    ...TEXT_STYLES.caption,
    color: '#999',
    marginHorizontal: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
    backgroundColor: '#F0F0F0',
  },
  tagText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xlarge * 2,
    paddingHorizontal: SPACING.large,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.large,
    marginBottom: SPACING.small,
    color: '#666',
  },
  emptyDescription: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: '#999',
    marginBottom: SPACING.large,
  },
  emptyActionButton: {
    marginTop: SPACING.medium,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    elevation: 8,
  },
};

export default KnowledgeBase;