import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Alert,
  Animated,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Share,
  Vibration,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  Searchbar,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const DigitalLibrary = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { library, loading } = useSelector(state => state.library);
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [viewType, setViewType] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, name

  // Library categories
  const categories = [
    { id: 'all', name: 'All', icon: 'apps', count: 156 },
    { id: 'drills', name: 'Drills', icon: 'sports-football', count: 45 },
    { id: 'videos', name: 'Videos', icon: 'play-circle', count: 32 },
    { id: 'tactics', name: 'Tactics', icon: 'strategy', count: 28 },
    { id: 'documents', name: 'Documents', icon: 'description', count: 24 },
    { id: 'images', name: 'Images', icon: 'image', count: 18 },
    { id: 'audio', name: 'Audio', icon: 'audiotrack', count: 9 },
  ];

  // Sample library content
  const libraryContent = [
    {
      id: 1,
      title: 'Advanced Dribbling Techniques',
      type: 'video',
      category: 'drills',
      duration: '12:45',
      difficulty: 'Advanced',
      sport: 'Football',
      thumbnail: 'https://via.placeholder.com/300x200',
      description: 'Master advanced dribbling moves including step-overs, cuts, and fake shots',
      rating: 4.8,
      views: 1205,
      downloads: 89,
      tags: ['dribbling', 'skills', 'individual'],
      createdAt: '2024-01-15',
      isFavorite: true,
    },
    {
      id: 2,
      title: 'Defensive Formation Guide',
      type: 'document',
      category: 'tactics',
      pages: 24,
      difficulty: 'Intermediate',
      sport: 'Football',
      thumbnail: 'https://via.placeholder.com/300x200',
      description: 'Complete guide to 4-4-2 and 4-3-3 defensive formations with player positioning',
      rating: 4.6,
      views: 892,
      downloads: 156,
      tags: ['defense', 'tactics', 'formation'],
      createdAt: '2024-01-12',
      isFavorite: false,
    },
    {
      id: 3,
      title: 'Shooting Accuracy Drill Set',
      type: 'drill',
      category: 'drills',
      exercises: 8,
      difficulty: 'Beginner',
      sport: 'Football',
      thumbnail: 'https://via.placeholder.com/300x200',
      description: 'Progressive shooting drills to improve accuracy and power from different angles',
      rating: 4.9,
      views: 1567,
      downloads: 234,
      tags: ['shooting', 'accuracy', 'finishing'],
      createdAt: '2024-01-10',
      isFavorite: true,
    },
    {
      id: 4,
      title: 'Mental Preparation Audio',
      type: 'audio',
      category: 'audio',
      duration: '15:30',
      difficulty: 'All Levels',
      sport: 'General',
      thumbnail: 'https://via.placeholder.com/300x200',
      description: 'Guided meditation and mental preparation techniques for peak performance',
      rating: 4.7,
      views: 678,
      downloads: 123,
      tags: ['mental', 'preparation', 'mindset'],
      createdAt: '2024-01-08',
      isFavorite: false,
    },
    {
      id: 5,
      title: 'Training Session Planner',
      type: 'document',
      category: 'documents',
      pages: 12,
      difficulty: 'All Levels',
      sport: 'General',
      thumbnail: 'https://via.placeholder.com/300x200',
      description: 'Template for planning effective training sessions with time allocation',
      rating: 4.5,
      views: 445,
      downloads: 78,
      tags: ['planning', 'template', 'organization'],
      createdAt: '2024-01-05',
      isFavorite: false,
    },
    {
      id: 6,
      title: 'Youth Development Program',
      type: 'video',
      category: 'videos',
      duration: '25:15',
      difficulty: 'Beginner',
      sport: 'Football',
      thumbnail: 'https://via.placeholder.com/300x200',
      description: 'Age-appropriate training methods for youth players (8-14 years)',
      rating: 4.8,
      views: 1123,
      downloads: 167,
      tags: ['youth', 'development', 'age-appropriate'],
      createdAt: '2024-01-03',
      isFavorite: true,
    },
  ];

  const filteredContent = libraryContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    // Entrance animations
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchLibraryContent());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh library content');
    }
    setRefreshing(false);
  }, []);

  const handleResourcePress = (resource) => {
    setSelectedResource(resource);
    setShowResourceModal(true);
    Vibration.vibrate(50);
  };

  const handleDownload = async (resource) => {
    try {
      Vibration.vibrate(100);
      Alert.alert(
        'Download Started 📥',
        `"${resource.title}" is being downloaded to your device.`,
        [
          { text: 'OK' },
          { 
            text: 'View Downloads', 
            onPress: () => navigation.navigate('Downloads') 
          }
        ]
      );
      // dispatch(downloadResource(resource.id));
    } catch (error) {
      Alert.alert('Error', 'Failed to download resource');
    }
  };

  const handleShare = async (resource) => {
    try {
      await Share.share({
        message: `Check out this training resource: ${resource.title}\n\n${resource.description}`,
        title: resource.title,
      });
    } catch (error) {
      console.log('Error sharing resource:', error);
    }
  };

  const toggleFavorite = (resourceId) => {
    Vibration.vibrate(50);
    // dispatch(toggleResourceFavorite(resourceId));
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return 'play-circle';
      case 'audio': return 'audiotrack';
      case 'document': return 'description';
      case 'drill': return 'sports-football';
      case 'image': return 'image';
      default: return 'folder';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const renderCategoryChip = (category) => (
    <Chip
      key={category.id}
      mode={selectedCategory === category.name ? 'flat' : 'outlined'}
      selected={selectedCategory === category.name}
      onPress={() => setSelectedCategory(category.name)}
      style={[
        styles.categoryChip,
        { backgroundColor: selectedCategory === category.name ? COLORS.primary : 'transparent' }
      ]}
      textStyle={{ 
        color: selectedCategory === category.name ? '#fff' : COLORS.text,
        fontSize: 12 
      }}
      avatar={
        <Icon 
          name={category.icon} 
          size={16} 
          color={selectedCategory === category.name ? '#fff' : COLORS.primary} 
        />
      }
    >
      {category.name} ({category.count})
    </Chip>
  );

  const renderResourceCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.resourceCard,
        viewType === 'list' ? styles.resourceCardList : styles.resourceCardGrid
      ]}
      onPress={() => handleResourcePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.resourceThumbnail}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnailImage} />
        <View style={styles.resourceOverlay}>
          <Icon 
            name={getResourceIcon(item.type)} 
            size={24} 
            color="#fff" 
          />
          {item.duration && (
            <Text style={styles.durationText}>{item.duration}</Text>
          )}
          {item.pages && (
            <Text style={styles.durationText}>{item.pages} pages</Text>
          )}
          {item.exercises && (
            <Text style={styles.durationText}>{item.exercises} drills</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Icon
            name={item.isFavorite ? 'favorite' : 'favorite-border'}
            size={20}
            color={item.isFavorite ? COLORS.error : '#fff'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.resourceInfo}>
        <Text style={styles.resourceTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.resourceDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.resourceMeta}>
          <Chip
            mode="outlined"
            compact
            style={[
              styles.difficultyChip,
              { borderColor: getDifficultyColor(item.difficulty) }
            ]}
            textStyle={{ 
              color: getDifficultyColor(item.difficulty),
              fontSize: 10 
            }}
          >
            {item.difficulty}
          </Chip>
          <Text style={styles.sportText}>{item.sport}</Text>
        </View>

        <View style={styles.resourceStats}>
          <View style={styles.statItem}>
            <Icon name="star" size={14} color={COLORS.warning} />
            <Text style={styles.statText}>{item.rating}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="visibility" size={14} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="download" size={14} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{item.downloads}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderResourceModal = () => {
    if (!selectedResource) return null;

    return (
      <Modal
        visible={showResourceModal}
        onDismiss={() => setShowResourceModal(false)}
        contentContainerStyle={styles.resourceModal}
      >
        <BlurView style={styles.blurOverlay} blurType="light" blurAmount={10}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Image 
                source={{ uri: selectedResource.thumbnail }} 
                style={styles.modalThumbnail} 
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.modalOverlay}
              >
                <View style={styles.modalHeaderContent}>
                  <TouchableOpacity
                    style={styles.favoriteModalButton}
                    onPress={() => toggleFavorite(selectedResource.id)}
                  >
                    <Icon
                      name={selectedResource.isFavorite ? 'favorite' : 'favorite-border'}
                      size={24}
                      color={selectedResource.isFavorite ? COLORS.error : '#fff'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeModalButton}
                    onPress={() => setShowResourceModal(false)}
                  >
                    <Icon name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>{selectedResource.title}</Text>
              
              <View style={styles.modalMetaRow}>
                <Chip
                  mode="flat"
                  compact
                  style={[
                    styles.modalDifficultyChip,
                    { backgroundColor: getDifficultyColor(selectedResource.difficulty) }
                  ]}
                  textStyle={{ color: '#fff', fontSize: 12 }}
                >
                  {selectedResource.difficulty}
                </Chip>
                <Text style={styles.modalSport}>{selectedResource.sport}</Text>
              </View>

              <View style={styles.modalStatsRow}>
                <View style={styles.modalStatItem}>
                  <Icon name="star" size={18} color={COLORS.warning} />
                  <Text style={styles.modalStatText}>{selectedResource.rating} rating</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Icon name="visibility" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.modalStatText}>{selectedResource.views} views</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Icon name="download" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.modalStatText}>{selectedResource.downloads} downloads</Text>
                </View>
              </View>

              <Text style={styles.modalDescription}>
                {selectedResource.description}
              </Text>

              <View style={styles.tagsContainer}>
                <Text style={styles.tagsLabel}>Tags:</Text>
                <View style={styles.tagsRow}>
                  {selectedResource.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      mode="outlined"
                      compact
                      style={styles.tagChip}
                    >
                      #{tag}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={() => handleDownload(selectedResource)}
                  style={styles.downloadButton}
                  icon="download"
                  contentStyle={styles.actionButtonContent}
                >
                  Download
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleShare(selectedResource)}
                  style={styles.shareButton}
                  icon="share"
                  contentStyle={styles.actionButtonContent}
                >
                  Share
                </Button>
              </View>

              {selectedResource.type === 'video' && (
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowResourceModal(false);
                    Alert.alert('Feature Coming Soon', 'Video player will be available soon!');
                  }}
                  style={styles.playButton}
                  icon="play-arrow"
                  contentStyle={styles.actionButtonContent}
                >
                  Play Video
                </Button>
              )}
            </View>
          </ScrollView>
        </BlurView>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Digital Library</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowFilterModal(true)}>
              <Icon name="tune" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
              style={{ marginLeft: SPACING.md }}
            >
              <Icon 
                name={viewType === 'grid' ? 'view-list' : 'view-module'} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <Searchbar
          placeholder="Search resources, drills, videos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.text }}
        />
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(renderCategoryChip)}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredContent.length} resources found
          </Text>
          <TouchableOpacity onPress={() => Alert.alert('Feature Coming Soon', 'Sort options will be available soon!')}>
            <View style={styles.sortButton}>
              <Icon name="sort" size={18} color={COLORS.textSecondary} />
              <Text style={styles.sortText}>Sort</Text>
            </View>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredContent}
          renderItem={renderResourceCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={viewType === 'grid' ? 2 : 1}
          key={viewType} // Force re-render when view type changes
          contentContainerStyle={styles.resourcesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      <Portal>
        {renderResourceModal()}
        
        <Modal
          visible={showFilterModal}
          onDismiss={() => setShowFilterModal(false)}
          contentContainerStyle={styles.filterModal}
        >
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Filter Resources 🎯</Text>
            
            <Text style={styles.filterSectionTitle}>Resource Type</Text>
            <View style={styles.filterRow}>
              {['All', 'Videos', 'Documents', 'Drills', 'Audio'].map((type) => (
                <Chip
                  key={type}
                  mode="outlined"
                  onPress={() => {}}
                  style={styles.filterChip}
                >
                  {type}
                </Chip>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Difficulty</Text>
            <View style={styles.filterRow}>
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <Chip
                  key={level}
                  mode="outlined"
                  onPress={() => {}}
                  style={styles.filterChip}
                >
                  {level}
                </Chip>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Sport</Text>
            <View style={styles.filterRow}>
              {['All', 'Football', 'Basketball', 'Tennis', 'General'].map((sport) => (
                <Chip
                  key={sport}
                  mode="outlined"
                  onPress={() => {}}
                  style={styles.filterChip}
                >
                  {sport}
                </Chip>
              ))}
            </View>

            <View style={styles.filterActions}>
              <Button
                mode="outlined"
                onPress={() => setShowFilterModal(false)}
                style={styles.filterCancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setShowFilterModal(false);
                  Alert.alert('Filters Applied', 'Resource filters have been updated');
                }}
                style={styles.filterApplyButton}
              >
                Apply Filters
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      <FAB
        style={styles.fab}
        icon="cloud-upload"
        onPress={() => Alert.alert('Feature Coming Soon', 'Upload your own resources will be available soon!')}
        label="Upload"
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    elevation: 0,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesContent: {
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultsCount: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  resourcesList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resourceCardGrid: {
    flex: 0.48,
    marginHorizontal: '1%',
  },
  resourceCardList: {
    flex: 1,
    flexDirection: 'row',
  },
  resourceThumbnail: {
    position: 'relative',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  resourceOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  durationText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: SPACING.xs,
  },
  resourceInfo: {
    padding: SPACING.md,
  },
  resourceTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  resourceDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  difficultyChip: {
    height: 24,
  },
  sportText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  resourceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  resourceModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    height: 200,
    position: 'relative',
  },
  modalThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  favoriteModalButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: SPACING.sm,
  },
  closeModalButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: SPACING.sm,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalDifficultyChip: {
    height: 28,
  },
  modalSport: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  modalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalStatText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  tagsContainer: {
    marginBottom: SPACING.lg,
  },
  tagsLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    height: 28,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  downloadButton: {
    flex: 0.48,
    backgroundColor: COLORS.primary,
  },
  shareButton: {
    flex: 0.48,
    borderColor: COLORS.primary,
  },
  playButton: {
    backgroundColor: COLORS.success,
    marginBottom: SPACING.md,
  },
  actionButtonContent: {
    paddingVertical: SPACING.sm,
  },
  filterModal: {
    backgroundColor: '#fff',
    margin: SPACING.lg,
    borderRadius: 16,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  filterContent: {
    flex: 1,
  },
  filterTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: '600',
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
    color: COLORS.text,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  filterCancelButton: {
    flex: 0.4,
    borderColor: COLORS.textSecondary,
  },
  filterApplyButton: {
    flex: 0.55,
    backgroundColor: COLORS.primary,
  },
};

export default DigitalLibrary;