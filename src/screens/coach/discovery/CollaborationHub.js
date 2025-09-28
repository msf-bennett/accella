import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Alert,
  StatusBar,
  Dimensions,
  FlatList,
  Modal,
  TextInput,
  Vibration,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Badge,
  Portal,
  ProgressBar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width, height } = Dimensions.get('window');

const CollaborationHub = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('discussions');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Mock data - replace with actual Redux state
  const [discussions, setDiscussions] = useState([
    {
      id: '1',
      author: 'Sarah Wilson',
      role: 'Football Coach',
      avatar: 'https://i.pravatar.cc/150?img=1',
      title: 'Effective Youth Training Methodologies 🏈',
      content: 'Has anyone tried implementing gamification in youth football training? I\'ve been experimenting with point-based systems...',
      category: 'training',
      likes: 24,
      comments: 8,
      timestamp: '2 hours ago',
      tags: ['youth', 'football', 'gamification'],
      isLiked: false,
    },
    {
      id: '2',
      author: 'Mike Rodriguez',
      role: 'Tennis Instructor',
      avatar: 'https://i.pravatar.cc/150?img=2',
      title: 'Injury Prevention Strategies 🎾',
      content: 'Sharing my experience with dynamic warm-ups that reduced injury rates by 40% in my tennis academy...',
      category: 'health',
      likes: 31,
      comments: 12,
      timestamp: '4 hours ago',
      tags: ['tennis', 'injury-prevention', 'warm-up'],
      isLiked: true,
    },
    {
      id: '3',
      author: 'Emma Chen',
      role: 'Swimming Coach',
      avatar: 'https://i.pravatar.cc/150?img=3',
      title: 'Mental Performance Tips 🏊‍♀️',
      content: 'Visualization techniques that helped my swimmers break personal records at the last competition...',
      category: 'mental',
      likes: 18,
      comments: 6,
      timestamp: '6 hours ago',
      tags: ['swimming', 'mental-performance', 'visualization'],
      isLiked: false,
    },
  ]);

  const [resources, setResources] = useState([
    {
      id: '1',
      title: 'Advanced Drill Library',
      type: 'video',
      author: 'Pro Coach Academy',
      downloads: 1250,
      rating: 4.8,
      thumbnail: 'https://i.pravatar.cc/300?img=10',
      category: 'drills',
      premium: false,
    },
    {
      id: '2',
      title: 'Nutrition Plans for Athletes',
      type: 'document',
      author: 'Sports Nutritionist',
      downloads: 890,
      rating: 4.6,
      thumbnail: 'https://i.pravatar.cc/300?img=11',
      category: 'nutrition',
      premium: true,
    },
  ]);

  const [experts, setExperts] = useState([
    {
      id: '1',
      name: 'Dr. James Parker',
      speciality: 'Sports Psychology',
      experience: '15+ years',
      rating: 4.9,
      avatar: 'https://i.pravatar.cc/150?img=4',
      available: true,
      price: '$80/hour',
    },
    {
      id: '2',
      name: 'Lisa Thompson',
      speciality: 'Strength & Conditioning',
      experience: '12+ years',
      rating: 4.8,
      avatar: 'https://i.pravatar.cc/150?img=5',
      available: false,
      price: '$65/hour',
    },
  ]);

  const categories = [
    { id: 'general', name: 'General', icon: 'forum', color: COLORS.primary },
    { id: 'training', name: 'Training', icon: 'fitness-center', color: '#FF6B6B' },
    { id: 'health', name: 'Health', icon: 'health-and-safety', color: '#4ECDC4' },
    { id: 'mental', name: 'Mental', icon: 'psychology', color: '#45B7D1' },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant', color: '#96CEB4' },
  ];

  const tabs = [
    { id: 'discussions', name: 'Discussions', icon: 'chat-bubble' },
    { id: 'resources', name: 'Resources', icon: 'library-books' },
    { id: 'experts', name: 'Experts', icon: 'school' },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  const handleLike = useCallback((postId) => {
    Vibration.vibrate(50);
    setDiscussions(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  }, []);

  const handleCreatePost = useCallback(() => {
    if (!newPostContent.trim()) {
      Alert.alert('Validation', 'Please enter your post content');
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      author: user?.name || 'Anonymous',
      role: user?.role || 'Coach',
      avatar: user?.avatar || 'https://i.pravatar.cc/150?img=6',
      title: newPostContent.split('\n')[0] || 'New Discussion',
      content: newPostContent,
      category: selectedCategory,
      likes: 0,
      comments: 0,
      timestamp: 'Just now',
      tags: [],
      isLiked: false,
    };

    setDiscussions(prev => [newPost, ...prev]);
    setNewPostContent('');
    setShowCreateModal(false);
    Vibration.vibrate(100);
  }, [newPostContent, selectedCategory, user]);

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>
            Collaboration Hub 🤝
          </Text>
          <Text style={[TEXT_STYLES.caption, styles.headerSubtitle]}>
            Connect • Share • Learn • Grow
          </Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2.5K</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>148</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <Surface style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabItem,
              selectedTab === tab.id && styles.activeTabItem
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={selectedTab === tab.id ? COLORS.primary : '#666'}
            />
            <Text style={[
              styles.tabText,
              selectedTab === tab.id && styles.activeTabText
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderCategoryFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
    >
      {categories.map((category) => (
        <Chip
          key={category.id}
          selected={selectedCategory === category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && {
              backgroundColor: category.color + '20',
              borderColor: category.color,
            }
          ]}
          textStyle={[
            styles.categoryText,
            selectedCategory === category.id && { color: category.color }
          ]}
          icon={category.icon}
        >
          {category.name}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderDiscussionItem = ({ item }) => (
    <Card style={styles.discussionCard}>
      <Card.Content>
        <View style={styles.discussionHeader}>
          <Avatar.Image size={40} source={{ uri: item.avatar }} />
          <View style={styles.authorInfo}>
            <Text style={[TEXT_STYLES.h4, styles.authorName]}>{item.author}</Text>
            <Text style={[TEXT_STYLES.caption, styles.authorRole]}>{item.role}</Text>
          </View>
          <Text style={[TEXT_STYLES.caption, styles.timestamp]}>{item.timestamp}</Text>
        </View>
        
        <Text style={[TEXT_STYLES.h3, styles.discussionTitle]}>{item.title}</Text>
        <Text style={[TEXT_STYLES.body, styles.discussionContent]} numberOfLines={3}>
          {item.content}
        </Text>
        
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
              #{tag}
            </Chip>
          ))}
        </View>
        
        <View style={styles.discussionActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Icon 
              name={item.isLiked ? 'favorite' : 'favorite-border'} 
              size={20} 
              color={item.isLiked ? '#FF6B6B' : '#666'} 
            />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="comment" size={20} color="#666" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share" size={20} color="#666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderResourceItem = ({ item }) => (
    <Card style={styles.resourceCard}>
      <View style={styles.resourceHeader}>
        <Avatar.Image size={60} source={{ uri: item.thumbnail }} />
        <View style={styles.resourceInfo}>
          <Text style={[TEXT_STYLES.h4, styles.resourceTitle]}>{item.title}</Text>
          <Text style={[TEXT_STYLES.caption, styles.resourceAuthor]}>by {item.author}</Text>
          <View style={styles.resourceMeta}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.downloadCount}>{item.downloads} downloads</Text>
          </View>
        </View>
        {item.premium && (
          <Chip style={styles.premiumChip} textStyle={styles.premiumText}>
            Premium
          </Chip>
        )}
      </View>
      
      <Card.Actions>
        <Button 
          mode="contained" 
          style={styles.downloadButton}
          onPress={() => {
            Vibration.vibrate(50);
            Alert.alert('Download', 'Feature coming soon!');
          }}
        >
          <Icon name="download" size={16} color="white" />
          Download
        </Button>
        <Button 
          mode="outlined" 
          style={styles.previewButton}
          onPress={() => {
            Alert.alert('Preview', 'Feature coming soon!');
          }}
        >
          Preview
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderExpertItem = ({ item }) => (
    <Card style={styles.expertCard}>
      <Card.Content>
        <View style={styles.expertHeader}>
          <Avatar.Image size={50} source={{ uri: item.avatar }} />
          <View style={styles.expertInfo}>
            <Text style={[TEXT_STYLES.h4, styles.expertName]}>{item.name}</Text>
            <Text style={[TEXT_STYLES.caption, styles.expertSpeciality]}>
              {item.speciality}
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.expertExperience]}>
              {item.experience} experience
            </Text>
          </View>
          <View style={styles.expertStatus}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: item.available ? '#4CAF50' : '#FFC107' }
            ]} />
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        </View>
        
        <View style={styles.expertRating}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.ratingLabel}>rating</Text>
        </View>
      </Card.Content>
      
      <Card.Actions>
        <Button 
          mode="contained" 
          style={styles.consultButton}
          disabled={!item.available}
          onPress={() => {
            Vibration.vibrate(50);
            Alert.alert('Book Consultation', 'Feature coming soon!');
          }}
        >
          {item.available ? 'Book Consultation' : 'Unavailable'}
        </Button>
        <IconButton
          icon="message"
          size={20}
          onPress={() => Alert.alert('Message', 'Feature coming soon!')}
        />
      </Card.Actions>
    </Card>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'discussions':
        return (
          <FlatList
            data={discussions.filter(item => 
              selectedCategory === 'general' || item.category === selectedCategory
            )}
            renderItem={renderDiscussionItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        );
      case 'resources':
        return (
          <FlatList
            data={resources}
            renderItem={renderResourceItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        );
      case 'experts':
        return (
          <FlatList
            data={experts}
            renderItem={renderExpertItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        );
      default:
        return null;
    }
  };

  const renderCreateModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light">
          <Surface style={styles.modalContent}>
            <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>Create New Post</Text>
            
            <Text style={[TEXT_STYLES.caption, styles.modalLabel]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  selected={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={styles.modalCategoryChip}
                  icon={category.icon}
                >
                  {category.name}
                </Chip>
              ))}
            </ScrollView>
            
            <Text style={[TEXT_STYLES.caption, styles.modalLabel]}>Content</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={() => setShowCreateModal(false)}
                style={styles.modalCancelButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleCreatePost}
                style={styles.modalSubmitButton}
              >
                Post
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderHeader()}
        
        <Searchbar
          placeholder="Search discussions, resources, experts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
        
        {renderTabBar()}
        
        {selectedTab === 'discussions' && renderCategoryFilters()}
        
        <ScrollView
          style={styles.scrollView}
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
          {renderContent()}
        </ScrollView>
      </Animated.View>
      
      {selectedTab === 'discussions' && (
        <FAB
          style={styles.fab}
          icon="add"
          onPress={() => {
            Vibration.vibrate(50);
            setShowCreateModal(true);
          }}
          color="white"
          customSize={56}
        />
      )}
      
      {renderCreateModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  statNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  searchBar: {
    margin: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  tabBar: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.xs,
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  categoryContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.xs,
    backgroundColor: 'white',
  },
  categoryText: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 80,
  },
  discussionCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  authorInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  authorName: {
    fontWeight: 'bold',
  },
  authorRole: {
    color: '#666',
  },
  timestamp: {
    color: '#999',
  },
  discussionTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  discussionContent: {
    color: '#666',
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  tag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: '#f5f5f5',
  },
  tagText: {
    fontSize: 10,
    color: '#666',
  },
  discussionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  actionText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    color: '#666',
  },
  resourceCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  resourceInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  resourceTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  resourceAuthor: {
    color: '#666',
    marginBottom: SPACING.xs,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  ratingText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: '#666',
  },
  downloadCount: {
    fontSize: 12,
    color: '#999',
  },
  premiumChip: {
    backgroundColor: '#FFD700',
  },
  premiumText: {
    color: '#333',
    fontWeight: 'bold',
  },
  downloadButton: {
    flex: 1,
    marginRight: SPACING.xs,
    backgroundColor: COLORS.primary,
  },
  previewButton: {
    borderColor: COLORS.primary,
  },
  expertCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  expertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  expertInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  expertName: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  expertSpeciality: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  expertExperience: {
    color: '#666',
  },
  expertStatus: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  priceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  expertRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: '#666',
  },
  consultButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    width: width - 32,
    maxHeight: height * 0.8,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: 'bold',
  },
  modalLabel: {
    marginBottom: SPACING.xs,
    color: '#666',
    fontWeight: '500',
  },
  modalCategoryChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.md,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 14,
    minHeight: 120,
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
};

export default CollaborationHub;