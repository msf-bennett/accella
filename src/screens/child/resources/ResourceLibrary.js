import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  Card,
  Title,
  Subtitle,
  Button,
  Chip,
  Surface,
  Avatar,
  IconButton,
  FAB,
  Searchbar,
  ProgressBar,
  Text,
  Portal,
  Modal,
  Badge,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const ResourceLibraryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, progress } = useSelector(state => ({
    user: state.auth.user,
    progress: state.learning.progress || {}
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const fadeAnim = new Animated.Value(0);

  // Mock resource data for demonstration
  const mockResources = [
    {
      id: 1,
      title: 'Basic Soccer Skills',
      category: 'Football',
      type: 'Video',
      duration: '5 min',
      difficulty: 'Beginner',
      description: 'Learn fundamental soccer skills like dribbling, passing, and shooting',
      thumbnail: 'play-circle',
      author: 'Coach Sarah',
      rating: 4.8,
      views: 1250,
      points: 50,
      isNew: true,
      isCompleted: false,
      tags: ['Skills', 'Basics', 'Youth'],
      completionRate: 0
    },
    {
      id: 2,
      title: 'Basketball Fundamentals Guide',
      category: 'Basketball',
      type: 'Article',
      duration: '3 min read',
      difficulty: 'Beginner',
      description: 'Complete guide to basketball basics for young players',
      thumbnail: 'article',
      author: 'Coach Mike',
      rating: 4.6,
      views: 890,
      points: 30,
      isNew: false,
      isCompleted: true,
      tags: ['Guide', 'Fundamentals'],
      completionRate: 100
    },
    {
      id: 3,
      title: 'Swimming Technique Drills',
      category: 'Swimming',
      type: 'Video Series',
      duration: '15 min',
      difficulty: 'Intermediate',
      description: 'Improve your swimming technique with these step-by-step drills',
      thumbnail: 'video-library',
      author: 'Coach Emma',
      rating: 4.9,
      views: 2100,
      points: 75,
      isNew: false,
      isCompleted: false,
      tags: ['Technique', 'Drills', 'Water'],
      completionRate: 60
    },
    {
      id: 4,
      title: 'Tennis Forehand Masterclass',
      category: 'Tennis',
      type: 'Interactive',
      duration: '8 min',
      difficulty: 'Intermediate',
      description: 'Master the perfect tennis forehand with interactive lessons',
      thumbnail: 'touch-app',
      author: 'Pro Coach Alex',
      rating: 4.7,
      views: 1560,
      points: 60,
      isNew: true,
      isCompleted: false,
      tags: ['Technique', 'Forehand', 'Pro Tips'],
      completionRate: 20
    },
    {
      id: 5,
      title: 'Nutrition for Young Athletes',
      category: 'Health',
      type: 'Guide',
      duration: '6 min read',
      difficulty: 'Beginner',
      description: 'Essential nutrition tips for growing athletes',
      thumbnail: 'restaurant',
      author: 'Dr. Lisa',
      rating: 4.5,
      views: 980,
      points: 40,
      isNew: false,
      isCompleted: false,
      tags: ['Nutrition', 'Health', 'Tips'],
      completionRate: 0
    },
    {
      id: 6,
      title: 'Mental Toughness Training',
      category: 'Mental Health',
      type: 'Audio',
      duration: '10 min',
      difficulty: 'All Levels',
      description: 'Build confidence and mental strength for sports performance',
      thumbnail: 'headphones',
      author: 'Coach David',
      rating: 4.8,
      views: 1780,
      points: 55,
      isNew: false,
      isCompleted: true,
      tags: ['Mental', 'Confidence', 'Performance'],
      completionRate: 100
    }
  ];

  const categories = ['All', 'Football', 'Basketball', 'Swimming', 'Tennis', 'Health', 'Mental Health'];
  const types = ['All', 'Video', 'Article', 'Video Series', 'Interactive', 'Guide', 'Audio'];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return '#FFA726';
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video': return 'play-circle';
      case 'Article': return 'article';
      case 'Video Series': return 'video-library';
      case 'Interactive': return 'touch-app';
      case 'Guide': return 'menu-book';
      case 'Audio': return 'headphones';
      default: return 'description';
    }
  };

  const filteredResources = mockResources.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesType = selectedType === 'All' || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const completedCount = mockResources.filter(item => item.isCompleted).length;
  const totalPoints = mockResources.filter(item => item.isCompleted).reduce((sum, item) => sum + item.points, 0);
  const newResourcesCount = mockResources.filter(item => item.isNew).length;

  const handleResourcePress = (item) => {
    setSelectedResource(item);
  };

  const handleStartResource = (resource) => {
    Alert.alert(
      '🚀 Start Learning',
      `Ready to start "${resource.title}"? You'll earn ${resource.points} points when you complete it!`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        { 
          text: 'Let\'s Go! 🎯', 
          style: 'default',
          onPress: () => {
            setSelectedResource(null);
            Alert.alert('📚 Learning Mode', 'Feature under development! Soon you\'ll access interactive learning content.');
          }
        }
      ]
    );
  };

  const toggleBookmark = (resourceId) => {
    const newBookmarks = new Set(bookmarkedItems);
    if (newBookmarks.has(resourceId)) {
      newBookmarks.delete(resourceId);
    } else {
      newBookmarks.add(resourceId);
    }
    setBookmarkedItems(newBookmarks);
  };

  const renderResourceCard = ({ item }) => (
    <Card 
      style={[styles.resourceCard, { marginHorizontal: SPACING.md }]} 
      onPress={() => handleResourcePress(item)}
    >
      <View style={styles.cardHeader}>
        <LinearGradient
          colors={item.isCompleted ? ['#4CAF50', '#8BC34A'] : ['#667eea', '#764ba2']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeaderContent}>
            <Avatar.Icon
              size={50}
              icon={getTypeIcon(item.type)}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
            <View style={styles.cardHeaderText}>
              <View style={styles.titleRow}>
                <Title style={styles.cardTitle}>{item.title}</Title>
                {item.isNew && (
                  <Badge style={styles.newBadge}>NEW</Badge>
                )}
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.cardMeta}>{item.duration} • {item.author}</Text>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>
            </View>
            <IconButton
              icon={bookmarkedItems.has(item.id) ? 'bookmark' : 'bookmark-border'}
              iconColor="white"
              size={20}
              onPress={() => toggleBookmark(item.id)}
            />
          </View>
          
          {item.completionRate > 0 && !item.isCompleted && (
            <ProgressBar
              progress={item.completionRate / 100}
              color="rgba(255,255,255,0.8)"
              style={styles.progressBar}
            />
          )}
        </LinearGradient>
      </View>

      <Card.Content style={styles.cardContent}>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.tagsRow}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <Chip
              key={index}
              compact
              style={styles.tagChip}
              textStyle={styles.tagText}
            >
              {tag}
            </Chip>
          ))}
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Chip
              compact
              style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(item.difficulty) }]}
              textStyle={styles.difficultyText}
            >
              {item.difficulty}
            </Chip>
            <View style={styles.pointsContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.pointsText}>{item.points} pts</Text>
            </View>
          </View>
          
          <View style={styles.footerRight}>
            <View style={styles.viewsContainer}>
              <Icon name="visibility" size={14} color={COLORS.textSecondary} />
              <Text style={styles.viewsText}>{item.views}</Text>
            </View>
            {item.isCompleted && (
              <Icon name="check-circle" size={20} color={COLORS.success} />
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFeaturedSection = () => {
    const featuredResource = mockResources.find(item => item.rating >= 4.8);
    if (!featuredResource) return null;

    return (
      <View style={styles.featuredSection}>
        <Title style={styles.sectionTitle}>⭐ Featured This Week</Title>
        <Card style={[styles.featuredCard, { marginHorizontal: SPACING.md }]}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.featuredGradient}
          >
            <View style={styles.featuredContent}>
              <Avatar.Icon
                size={60}
                icon={getTypeIcon(featuredResource.type)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
              <View style={styles.featuredText}>
                <Title style={styles.featuredTitle}>{featuredResource.title}</Title>
                <Text style={styles.featuredDescription} numberOfLines={2}>
                  {featuredResource.description}
                </Text>
                <View style={styles.featuredMeta}>
                  <Text style={styles.featuredMetaText}>
                    ⭐ {featuredResource.rating} • 🕒 {featuredResource.duration} • ⚡ {featuredResource.points} pts
                  </Text>
                </View>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={() => handleStartResource(featuredResource)}
              style={styles.featuredButton}
              buttonColor="rgba(255,255,255,0.2)"
              textColor="white"
              icon="play-arrow"
            >
              Start Now
            </Button>
          </LinearGradient>
        </Card>
      </View>
    );
  };

  const renderStatsCards = () => (
    <View style={styles.statsSection}>
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.statGradient}>
            <Icon name="school" size={28} color="white" />
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </LinearGradient>
        </Card>
        
        <Card style={styles.statCard}>
          <LinearGradient colors={['#43e97b', '#38f9d7']} style={styles.statGradient}>
            <Icon name="star" size={28} color="white" />
            <Text style={styles.statNumber}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </LinearGradient>
        </Card>
        
        <Card style={styles.statCard}>
          <LinearGradient colors={['#fa709a', '#fee140']} style={styles.statGradient}>
            <Icon name="new-releases" size={28} color="white" />
            <Text style={styles.statNumber}>{newResourcesCount}</Text>
            <Text style={styles.statLabel}>New Content</Text>
          </LinearGradient>
        </Card>
        
        <Card style={styles.statCard}>
          <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.statGradient}>
            <Icon name="bookmark" size={28} color="white" />
            <Text style={styles.statNumber}>{bookmarkedItems.size}</Text>
            <Text style={styles.statLabel}>Bookmarked</Text>
          </LinearGradient>
        </Card>
      </View>
    </View>
  );

  const renderQuickAccess = () => (
    <View style={styles.quickAccessSection}>
      <Title style={styles.sectionTitle}>🚀 Quick Access</Title>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAccessScroll}>
        <TouchableOpacity
          style={styles.quickAccessItem}
          onPress={() => Alert.alert('📱 My Downloads', 'Feature coming soon! Access your offline content.')}
        >
          <Surface style={[styles.quickAccessSurface, { backgroundColor: '#E3F2FD' }]}>
            <Icon name="download" size={32} color="#1976D2" />
            <Text style={styles.quickAccessText}>Downloads</Text>
          </Surface>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickAccessItem}
          onPress={() => Alert.alert('📚 Continue Learning', 'Feature coming soon! Resume where you left off.')}
        >
          <Surface style={[styles.quickAccessSurface, { backgroundColor: '#F3E5F5' }]}>
            <Icon name="play-arrow" size={32} color="#7B1FA2" />
            <Text style={styles.quickAccessText}>Continue</Text>
          </Surface>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickAccessItem}
          onPress={() => Alert.alert('🎯 Challenges', 'Feature coming soon! Take on learning challenges.')}
        >
          <Surface style={[styles.quickAccessSurface, { backgroundColor: '#FFF3E0' }]}>
            <Icon name="jump-rope" size={32} color="#F57C00" />
            <Text style={styles.quickAccessText}>Challenges</Text>
          </Surface>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickAccessItem}
          onPress={() => Alert.alert('📊 My Progress', 'Feature coming soon! View detailed learning analytics.')}
        >
          <Surface style={[styles.quickAccessSurface, { backgroundColor: '#E8F5E8' }]}>
            <Icon name="trending-up" size={32} color="#388E3C" />
            <Text style={styles.quickAccessText}>Progress</Text>
          </Surface>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Title style={styles.headerTitle}>Resource Library 📚</Title>
            <View style={styles.headerActions}>
              {bookmarkedItems.size > 0 && (
                <Badge style={styles.bookmarkBadge}>{bookmarkedItems.size}</Badge>
              )}
              <IconButton
                icon="bookmark"
                iconColor="white"
                size={24}
                onPress={() => Alert.alert('📖 Bookmarks', 'Feature coming soon! View your saved content.')}
              />
            </View>
          </View>
          
          <Text style={styles.welcomeText}>
            Discover amazing content to boost your skills! 🌟
          </Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
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
          {/* Search and Filters */}
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search resources..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              iconColor={COLORS.primary}
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.filterChip,
                    selectedCategory === category && styles.selectedFilterChip
                  ]}
                  textStyle={[
                    styles.filterChipText,
                    selectedCategory === category && styles.selectedFilterChipText
                  ]}
                >
                  {category}
                </Chip>
              ))}
            </ScrollView>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilterRow}>
              {types.map((type) => (
                <Chip
                  key={type}
                  mode="outlined"
                  selected={selectedType === type}
                  onPress={() => setSelectedType(type)}
                  style={[
                    styles.typeChip,
                    selectedType === type && styles.selectedTypeChip
                  ]}
                  textStyle={[
                    styles.typeChipText,
                    selectedType === type && styles.selectedTypeChipText
                  ]}
                >
                  {type}
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* Stats Overview */}
          {renderStatsCards()}

          {/* Featured Content */}
          {renderFeaturedSection()}

          {/* Quick Access */}
          {renderQuickAccess()}

          {/* Resource List */}
          <View style={styles.resourceSection}>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>📖 All Resources</Title>
              <Text style={styles.resourceCount}>
                {filteredResources.length} items
              </Text>
            </View>

            {filteredResources.length === 0 ? (
              <Card style={[styles.emptyCard, { marginHorizontal: SPACING.md }]}>
                <Card.Content style={styles.emptyContent}>
                  <Icon name="search-off" size={64} color={COLORS.textSecondary} />
                  <Title style={styles.emptyTitle}>No Resources Found</Title>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Try a different search term or filter' : 'No resources available for this category'}
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedType('All');
                    }}
                    style={styles.emptyButton}
                    icon="refresh"
                  >
                    Clear Filters
                  </Button>
                </Card.Content>
              </Card>
            ) : (
              <FlatList
                data={filteredResources}
                renderItem={renderResourceCard}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
                contentContainerStyle={{ paddingBottom: SPACING.xl }}
              />
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Resource Detail Modal */}
      <Portal>
        <Modal
          visible={!!selectedResource}
          onDismiss={() => setSelectedResource(null)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedResource && (
            <BlurView intensity={20} style={styles.modalBlur}>
              <Card style={styles.detailModal}>
                <LinearGradient
                  colors={selectedResource.isCompleted ? ['#4CAF50', '#8BC34A'] : ['#667eea', '#764ba2']}
                  style={styles.modalHeader}
                >
                  <View style={styles.modalHeaderContent}>
                    <Avatar.Icon
                      size={70}
                      icon={getTypeIcon(selectedResource.type)}
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    />
                    <Title style={styles.modalTitle}>{selectedResource.title}</Title>
                    <IconButton
                      icon="close"
                      iconColor="white"
                      size={24}
                      style={styles.modalCloseButton}
                      onPress={() => setSelectedResource(null)}
                    />
                  </View>
                  
                  {selectedResource.isCompleted && (
                    <View style={styles.completedBanner}>
                      <Icon name="check-circle" size={20} color="white" />
                      <Text style={styles.completedText}>Completed! Great job! 🎉</Text>
                    </View>
                  )}
                </LinearGradient>
                
                <ScrollView style={styles.modalScrollContent}>
                  <Card.Content style={styles.modalContent}>
                    <Text style={styles.modalDescription}>
                      {selectedResource.description}
                    </Text>
                    
                    <View style={styles.modalDetailsGrid}>
                      <View style={styles.modalDetailItem}>
                        <Icon name="schedule" size={20} color={COLORS.primary} />
                        <Text style={styles.modalDetailText}>{selectedResource.duration}</Text>
                      </View>
                      <View style={styles.modalDetailItem}>
                        <Icon name="person" size={20} color={COLORS.primary} />
                        <Text style={styles.modalDetailText}>{selectedResource.author}</Text>
                      </View>
                      <View style={styles.modalDetailItem}>
                        <Icon name="trending-up" size={20} color={COLORS.primary} />
                        <Text style={styles.modalDetailText}>{selectedResource.difficulty}</Text>
                      </View>
                      <View style={styles.modalDetailItem}>
                        <Icon name="star" size={20} color="#FFD700" />
                        <Text style={styles.modalDetailText}>{selectedResource.points} points</Text>
                      </View>
                    </View>

                    <View style={styles.modalTagsSection}>
                      <Text style={styles.modalTagsLabel}>Topics:</Text>
                      <View style={styles.modalTagsContainer}>
                        {selectedResource.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            compact
                            style={styles.modalTag}
                            textStyle={styles.modalTagText}
                          >
                            {tag}
                          </Chip>
                        ))}
                      </View>
                    </View>

                    <View style={styles.modalActions}>
                      <Button
                        mode="outlined"
                        onPress={() => toggleBookmark(selectedResource.id)}
                        style={styles.modalActionButton}
                        icon={bookmarkedItems.has(selectedResource.id) ? 'bookmark' : 'bookmark-border'}
                      >
                        {bookmarkedItems.has(selectedResource.id) ? 'Saved' : 'Save'}
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => handleStartResource(selectedResource)}
                        style={styles.modalActionButton}
                        buttonColor={selectedResource.isCompleted ? COLORS.success : COLORS.primary}
                        icon={selectedResource.isCompleted ? 'replay' : 'play-arrow'}
                      >
                        {selectedResource.isCompleted ? 'Review' : 'Start'}
                      </Button>
                    </View>
                  </Card.Content>
                </ScrollView>
              </Card>
            </BlurView>
          )}
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="download"
        style={[styles.fab, { backgroundColor: COLORS.success }]}
        onPress={() => Alert.alert('📱 Download Manager', 'Feature coming soon! Download content for offline learning.')}
        label="Downloads"
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: '#FF6B6B',
  },
  welcomeText: {
    color: 'white',
    fontSize: 14,
    marginTop: SPACING.xs,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: SPACING.md,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
    marginBottom: SPACING.md,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  typeFilterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: SPACING.xs,
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  typeChip: {
    marginRight: SPACING.xs,
    backgroundColor: 'white',
    borderColor: COLORS.primary,
  },
  selectedTypeChip: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  typeChipText: {
    fontSize: 10,
  },
  selectedTypeChipText: {
    color: 'white',
  },
  statsSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  statGradient: {
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 11,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  featuredSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  featuredCard: {
    elevation: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredGradient: {
    padding: SPACING.lg,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featuredText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  featuredTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuredDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  featuredMeta: {
    marginTop: SPACING.xs,
  },
  featuredMetaText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  featuredButton: {
    alignSelf: 'flex-start',
  },
  quickAccessSection: {
    paddingLeft: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quickAccessScroll: {
    paddingRight: SPACING.md,
  },
  quickAccessItem: {
    marginRight: SPACING.md,
    width: 80,
  },
  quickAccessSurface: {
    padding: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    minHeight: 80,
    justifyContent: 'center',
  },
  quickAccessText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  resourceSection: {
    flex: 1,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  resourceCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  resourceCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#FF6B6B',
    color: 'white',
    fontSize: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  cardMeta: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    marginLeft: SPACING.xs / 2,
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    marginTop: SPACING.sm,
  },
  cardContent: {
    padding: SPACING.md,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  tagChip: {
    height: 24,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: '#f5f5f5',
  },
  tagText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyChip: {
    height: 20,
    marginRight: SPACING.sm,
  },
  difficultyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs / 2,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  viewsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs / 2,
  },
  emptyCard: {
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
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
    padding: SPACING.lg,
  },
  detailModal: {
    width: width * 0.9,
    maxHeight: '85%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  modalHeaderContent: {
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 0,
    top: -15,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  completedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  modalScrollContent: {
    maxHeight: 400,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalDescription: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  modalDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.sm,
  },
  modalDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  modalTagsSection: {
    marginBottom: SPACING.lg,
  },
  modalTagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  modalTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalTag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: '#f0f0f0',
    height: 28,
  },
  modalTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  modalActionButton: {
    flex: 1,
  },
};

export default ResourceLibraryScreen;