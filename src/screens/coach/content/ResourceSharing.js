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
  FlatList,
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
  Badge,
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

const ResourceSharing = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, coachProfile } = useSelector(state => state.auth);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('discover');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredResources, setFilteredResources] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mySharedResources, setMySharedResources] = useState([]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;
  
  // Mock data - Replace with Redux state/API calls
  const [communityResources] = useState([
    {
      id: 1,
      title: 'Ultimate Football Training Program',
      description: 'Complete 16-week training program for youth football development',
      category: 'training_plans',
      type: 'program',
      author: {
        name: 'Coach Martinez',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.8,
        verified: true,
      },
      downloads: 847,
      likes: 156,
      rating: 4.9,
      price: 'free',
      tags: ['football', 'youth', 'development', 'comprehensive'],
      createdAt: '2024-08-12',
      preview: true,
      featured: true,
    },
    {
      id: 2,
      title: 'Basketball Conditioning Drills',
      description: 'High-intensity conditioning exercises for basketball players',
      category: 'drills',
      type: 'video_series',
      author: {
        name: 'Coach Johnson',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.6,
        verified: true,
      },
      downloads: 423,
      likes: 89,
      rating: 4.7,
      price: 'premium',
      tags: ['basketball', 'conditioning', 'fitness'],
      createdAt: '2024-08-10',
      preview: true,
    },
    {
      id: 3,
      title: 'Mental Toughness Workbook',
      description: 'Psychological exercises and techniques for competitive athletes',
      category: 'psychology',
      type: 'workbook',
      author: {
        name: 'Dr. Sarah Chen',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.9,
        verified: true,
      },
      downloads: 634,
      likes: 201,
      rating: 4.8,
      price: 'paid',
      tags: ['psychology', 'mental training', 'competition'],
      createdAt: '2024-08-08',
      preview: false,
    },
  ]);

  const categories = [
    { id: 'all', name: 'All Resources', icon: 'dashboard', color: '#667eea' },
    { id: 'training_plans', name: 'Training Plans', icon: 'event-note', color: '#FF6B6B' },
    { id: 'drills', name: 'Drills & Exercises', icon: 'fitness-center', color: '#4ECDC4' },
    { id: 'psychology', name: 'Mental Training', icon: 'psychology', color: '#45B7D1' },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant', color: '#96CEB4' },
    { id: 'strategy', name: 'Game Strategy', icon: 'sports-football', color: '#FECA57' },
    { id: 'equipment', name: 'Equipment', icon: 'sports', color: '#FF9FF3' },
  ];

  const tabs = [
    { id: 'discover', name: 'Discover', icon: 'explore', count: communityResources.length },
    { id: 'my_shared', name: 'My Shared', icon: 'share', count: 5 },
    { id: 'favorites', name: 'Favorites', icon: 'favorite', count: 12 },
    { id: 'downloads', name: 'Downloaded', icon: 'download', count: 8 },
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
    filterResources();
  }, [searchQuery, selectedCategory, selectedTab]);

  useEffect(() => {
    Animated.timing(tabSlideAnim, {
      toValue: tabs.findIndex(tab => tab.id === selectedTab) * (width / tabs.length),
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedTab]);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Resources updated! 🔄');
    }, 1500);
  }, []);

  const filterResources = useCallback(() => {
    let filtered = communityResources;
    
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
    
    // Sort by featured first, then by rating
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });
    
    setFilteredResources(filtered);
  }, [searchQuery, selectedCategory, communityResources]);

  const handleShareResource = () => {
    Vibration.vibrate(100);
    Alert.alert(
      'Share Resource 📤',
      'Resource sharing feature coming soon! You\'ll be able to upload and share your training materials with the community.',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleResourcePress = (resource) => {
    Vibration.vibrate(50);
    navigation.navigate('ResourceDetails', { resourceId: resource.id });
  };

  const handleTabSelect = (tabId) => {
    Vibration.vibrate(30);
    setSelectedTab(tabId);
  };

  const handleLikeResource = (resourceId) => {
    Vibration.vibrate(50);
    Alert.alert('Liked! ❤️', 'Resource added to your favorites');
  };

  const handleDownloadResource = (resource) => {
    Vibration.vibrate(100);
    if (resource.price === 'free') {
      Alert.alert('Download Started! 📥', 'Resource is being downloaded...');
    } else {
      Alert.alert('Premium Content 💎', 'This resource requires a premium subscription or payment.');
    }
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
            <Text style={styles.headerTitle}>Resource Sharing 🤝</Text>
            <Text style={styles.headerSubtitle}>
              Discover & share coaching resources
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="notifications"
              size={24}
              iconColor="#FFF"
              onPress={() => Alert.alert('Notifications', 'New shared resources available!')}
            />
            <Avatar.Image
              size={40}
              source={{ uri: coachProfile?.avatar || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard}>
            <Icon name="cloud-download" size={20} color={COLORS.primary} />
            <Text style={styles.statNumber}>1.2K</Text>
            <Text style={styles.statLabel}>Downloads</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Icon name="favorite" size={20} color="#FF6B6B" />
            <Text style={styles.statNumber}>89</Text>
            <Text style={styles.statLabel}>Liked</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Icon name="share" size={20} color="#4ECDC4" />
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Shared</Text>
          </Surface>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      <View style={styles.tabIndicatorContainer}>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [{ translateX: tabSlideAnim }],
              width: width / tabs.length,
            }
          ]}
        />
      </View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => handleTabSelect(tab.id)}
            activeOpacity={0.7}
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
            {tab.count > 0 && (
              <Badge style={styles.tabBadge}>{tab.count}</Badge>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search resources..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
        inputStyle={styles.searchInput}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.8}
          >
            <Chip
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.selectedCategoryChip,
                { backgroundColor: selectedCategory === category.id ? category.color + '20' : '#F5F5F5' }
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === category.id && { color: category.color }
              ]}
              icon={({ size }) => (
                <Icon
                  name={category.icon}
                  size={size}
                  color={selectedCategory === category.id ? category.color : '#666'}
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

  const renderFeaturedSection = () => {
    const featuredResources = filteredResources.filter(resource => resource.featured);
    
    if (featuredResources.length === 0) return null;
    
    return (
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🌟 Featured Resources</Text>
          <IconButton
            icon="arrow-forward"
            size={20}
            onPress={() => Alert.alert('View All', 'See all featured resources')}
          />
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
        >
          {featuredResources.map((resource) => renderFeaturedCard(resource))}
        </ScrollView>
      </View>
    );
  };

  const renderFeaturedCard = (resource) => (
    <TouchableOpacity
      key={resource.id}
      onPress={() => handleResourcePress(resource)}
      activeOpacity={0.9}
      style={styles.featuredCardWrapper}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.featuredCard}
      >
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>FEATURED</Text>
        </View>
        
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle}>{resource.title}</Text>
          <Text style={styles.featuredDescription} numberOfLines={2}>
            {resource.description}
          </Text>
          
          <View style={styles.featuredAuthor}>
            <Avatar.Image
              size={24}
              source={{ uri: resource.author.avatar }}
            />
            <Text style={styles.featuredAuthorName}>by {resource.author.name}</Text>
            {resource.author.verified && (
              <Icon name="verified" size={16} color="#FFD700" />
            )}
          </View>
          
          <View style={styles.featuredStats}>
            <View style={styles.featuredStat}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.featuredStatText}>{resource.rating}</Text>
            </View>
            <View style={styles.featuredStat}>
              <Icon name="download" size={14} color="#FFF" />
              <Text style={styles.featuredStatText}>{resource.downloads}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderResourceCard = ({ item: resource, index }) => (
    <Animated.View
      style={[
        styles.resourceCardWrapper,
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
        onPress={() => handleResourcePress(resource)}
        activeOpacity={0.9}
      >
        <Card style={styles.resourceCard}>
          <View style={styles.resourceHeader}>
            <View style={styles.resourceTypeContainer}>
              <Chip style={styles.resourceTypeChip} textStyle={styles.resourceTypeText}>
                {resource.type.replace('_', ' ').toUpperCase()}
              </Chip>
              {resource.price !== 'free' && (
                <Chip style={styles.premiumChip} textStyle={styles.premiumText}>
                  {resource.price === 'premium' ? '💎 PREMIUM' : '💰 PAID'}
                </Chip>
              )}
            </View>
            
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => {
                Alert.alert('Resource Options', 'What would you like to do?', [
                  { text: 'Preview', onPress: () => console.log('Preview') },
                  { text: 'Report', onPress: () => console.log('Report') },
                  { text: 'Share', onPress: () => console.log('Share') },
                  { text: 'Cancel', style: 'cancel' }
                ]);
              }}
            />
          </View>
          
          <View style={styles.resourceContent}>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
            <Text style={styles.resourceDescription} numberOfLines={2}>
              {resource.description}
            </Text>
            
            <View style={styles.resourceAuthor}>
              <Avatar.Image
                size={32}
                source={{ uri: resource.author.avatar }}
              />
              <View style={styles.authorInfo}>
                <View style={styles.authorNameContainer}>
                  <Text style={styles.authorName}>{resource.author.name}</Text>
                  {resource.author.verified && (
                    <Icon name="verified" size={16} color="#4CAF50" style={{ marginLeft: 4 }} />
                  )}
                </View>
                <View style={styles.authorRating}>
                  <Icon name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{resource.author.rating}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.resourceStats}>
              <View style={styles.statItem}>
                <Icon name="download" size={16} color="#666" />
                <Text style={styles.statText}>{resource.downloads}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="favorite" size={16} color="#FF6B6B" />
                <Text style={styles.statText}>{resource.likes}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.statText}>{resource.rating}</Text>
              </View>
            </View>
            
            <View style={styles.resourceTags}>
              {resource.tags.slice(0, 3).map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  style={styles.resourceTag}
                  textStyle={styles.resourceTagText}
                  compact
                >
                  {tag}
                </Chip>
              ))}
            </View>
            
            <View style={styles.resourceActions}>
              <Button
                mode="contained"
                onPress={() => handleDownloadResource(resource)}
                style={styles.downloadButton}
                icon="download"
                compact
              >
                {resource.price === 'free' ? 'Download' : 'Get'}
              </Button>
              <IconButton
                icon="favorite-border"
                size={24}
                onPress={() => handleLikeResource(resource.id)}
              />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="search-off" size={80} color="#DDD" />
      <Text style={styles.emptyTitle}>No resources found</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery 
          ? `No results for "${searchQuery}"`
          : selectedTab === 'my_shared' 
            ? 'Share your first resource with the community'
            : 'Try adjusting your filters'}
      </Text>
      <Button
        mode="contained"
        onPress={selectedTab === 'my_shared' ? handleShareResource : onRefresh}
        style={styles.emptyActionButton}
        icon={selectedTab === 'my_shared' ? 'share' : 'refresh'}
      >
        {selectedTab === 'my_shared' ? 'Share Resource' : 'Refresh'}
      </Button>
    </View>
  );

  const getTabContent = () => {
    switch (selectedTab) {
      case 'discover':
        return filteredResources;
      case 'my_shared':
        return mySharedResources;
      case 'favorites':
        return [];
      case 'downloads':
        return [];
      default:
        return filteredResources;
    }
  };

  const tabContent = getTabContent();

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabBar()}
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {renderSearchAndFilters()}
        
        {selectedTab === 'discover' && renderFeaturedSection()}
        
        <ScrollView
          style={styles.scrollView}
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
          <View style={styles.resourcesSection}>
            <Text style={styles.sectionTitle}>
              {selectedTab === 'discover' ? 'All Resources' : 
               selectedTab === 'my_shared' ? 'My Shared Resources' :
               selectedTab === 'favorites' ? 'Favorite Resources' : 'Downloaded Resources'} 
              ({tabContent.length})
            </Text>
            
            {tabContent.length > 0 ? (
              tabContent.map((resource, index) => renderResourceCard({ item: resource, index }))
            ) : (
              renderEmptyState()
            )}
          </View>
        </ScrollView>
      </Animated.View>
      
      <FAB
        style={styles.fab}
        icon="share"
        onPress={handleShareResource}
        color="#FFF"
        label="Share"
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#FFF',
    marginLeft: SPACING.small,
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
    ...TEXT_STYLES.h3,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#FFF',
    opacity: 0.8,
    marginTop: 2,
  },
  tabContainer: {
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabIndicatorContainer: {
    height: 3,
    backgroundColor: '#F0F0F0',
  },
  tabIndicator: {
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: SPACING.medium,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.small,
  },
  tabText: {
    ...TEXT_STYLES.caption,
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabBadge: {
    position: 'absolute',
    top: -5,
    right: 20,
    backgroundColor: '#FF6B6B',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 25,
    marginBottom: SPACING.medium,
  },
  searchInput: {
    fontSize: 16,
  },
  categoriesContainer: {
    marginTop: SPACING.small,
  },
  categoriesScroll: {
    paddingRight: SPACING.large,
  },
  categoryChip: {
    marginRight: SPACING.small,
    elevation: 2,
  },
  selectedCategoryChip: {
    elevation: 4,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  featuredSection: {
    marginBottom: SPACING.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: '600',
    color: '#333',
  },
  featuredScroll: {
    paddingLeft: SPACING.large,
  },
  featuredCardWrapper: {
    marginRight: SPACING.medium,
  },
  featuredCard: {
    width: width * 0.8,
    borderRadius: 16,
    padding: SPACING.large,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: SPACING.medium,
  },
  featuredBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    ...TEXT_STYLES.h3,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  featuredDescription: {
    ...TEXT_STYLES.body,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: SPACING.medium,
  },
  featuredAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  featuredAuthorName: {
    ...TEXT_STYLES.body,
    color: '#FFF',
    marginLeft: SPACING.small,
    flex: 1,
  },
  featuredStats: {
    flexDirection: 'row',
  },
  featuredStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.large,
  },
  featuredStatText: {
    color: '#FFF',
    marginLeft: 4,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  resourcesSection: {
    paddingHorizontal: SPACING.large,
  },
  resourceCardWrapper: {
    marginBottom: SPACING.medium,
  },
  resourceCard: {
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingTop: SPACING.small,
  },
  resourceTypeContainer: {
    flexDirection: 'row',
  },
  resourceTypeChip: {
    backgroundColor: COLORS.primary + '20',
    marginRight: SPACING.small,
  },
  resourceTypeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  premiumChip: {
    backgroundColor: '#FFD700' + '20',
  },
  premiumText: {
    color: '#FF8C00',
    fontSize: 10,
    fontWeight: '600',
  },
  resourceContent: {
    padding: SPACING.medium,
  },
  resourceTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: '600',
    marginBottom: SPACING.small,
    color: '#333',
  },
  resourceDescription: {
    ...TEXT_STYLES.body,
    color: '#666',
    marginBottom: SPACING.medium,
    lineHeight: 20,
  },
  resourceAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  authorInfo: {
    marginLeft: SPACING.small,
    flex: 1,
  },
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: '#333',
  },
  authorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    marginLeft: 4,
    color: '#666',
  },
  resourceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: 4,
    color: '#666',
  },
  resourceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.medium,
  },
  resourceTag: {
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
    backgroundColor: '#F5F5F5',
    elevation: 0,
  },
  resourceTagText: {
    fontSize: 10,
    color: '#666',
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadButton: {
    flex: 1,
    marginRight: SPACING.small,
    borderRadius: 20,
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
    lineHeight: 22,
  },
  emptyActionButton: {
    marginTop: SPACING.medium,
    borderRadius: 25,
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

export default ResourceSharing;