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
  Image,
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
  Menu,
  Divider,
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

const VideoLibrary = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, coachProfile } = useSelector(state => state.auth);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const uploadProgress = useRef(new Animated.Value(0)).current;
  
  // Mock video data
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: 'Perfect Free Kick Technique',
      description: 'Step-by-step guide to mastering free kicks with proper form and power',
      thumbnail: 'https://via.placeholder.com/300x200/667eea/ffffff?text=Free+Kick',
      duration: '08:45',
      category: 'skills',
      tags: ['free-kick', 'technique', 'shooting'],
      uploadDate: '2024-08-15',
      views: 1247,
      likes: 89,
      comments: 23,
      size: '156 MB',
      quality: '1080p',
      isPrivate: false,
      usedInPlans: 12,
      avgRating: 4.8,
      playbackStats: { completed: 245, partial: 67 }
    },
    {
      id: 2,
      title: 'Defensive Positioning Drills',
      description: 'Advanced defensive positioning exercises for better team coordination',
      thumbnail: 'https://via.placeholder.com/300x200/4ECDC4/ffffff?text=Defense',
      duration: '12:30',
      category: 'tactics',
      tags: ['defense', 'positioning', 'teamwork'],
      uploadDate: '2024-08-14',
      views: 892,
      likes: 67,
      comments: 15,
      size: '234 MB',
      quality: '4K',
      isPrivate: true,
      usedInPlans: 8,
      avgRating: 4.6,
      playbackStats: { completed: 178, partial: 34 }
    },
    {
      id: 3,
      title: 'Agility Ladder Workout',
      description: 'High-intensity footwork drills using agility ladders',
      thumbnail: 'https://via.placeholder.com/300x200/96CEB4/ffffff?text=Agility',
      duration: '06:15',
      category: 'fitness',
      tags: ['agility', 'footwork', 'conditioning'],
      uploadDate: '2024-08-12',
      views: 2134,
      likes: 156,
      comments: 42,
      size: '98 MB',
      quality: '720p',
      isPrivate: false,
      usedInPlans: 18,
      avgRating: 4.9,
      playbackStats: { completed: 567, partial: 89 }
    },
    {
      id: 4,
      title: 'Goalkeeper Training Session',
      description: 'Comprehensive goalkeeper training covering all essential skills',
      thumbnail: 'https://via.placeholder.com/300x200/FF6B6B/ffffff?text=Keeper',
      duration: '15:22',
      category: 'position-specific',
      tags: ['goalkeeper', 'saves', 'positioning'],
      uploadDate: '2024-08-11',
      views: 743,
      likes: 52,
      comments: 18,
      size: '287 MB',
      quality: '1080p',
      isPrivate: false,
      usedInPlans: 6,
      avgRating: 4.7,
      playbackStats: { completed: 123, partial: 28 }
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Videos', icon: 'video-library', color: COLORS.primary, count: videos.length },
    { id: 'skills', name: 'Skills', icon: 'sports-soccer', color: '#4ECDC4', count: 1 },
    { id: 'tactics', name: 'Tactics', icon: 'psychology', color: '#45B7D1', count: 1 },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-center', color: '#96CEB4', count: 1 },
    { id: 'position-specific', name: 'Position', icon: 'person', color: '#FF6B6B', count: 1 },
    { id: 'drills', name: 'Drills', icon: 'track-changes', color: '#FECA57', count: 0 },
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest First', icon: 'access-time' },
    { id: 'oldest', name: 'Oldest First', icon: 'history' },
    { id: 'most-viewed', name: 'Most Viewed', icon: 'visibility' },
    { id: 'highest-rated', name: 'Highest Rated', icon: 'star' },
    { id: 'alphabetical', name: 'A-Z', icon: 'sort-by-alpha' },
    { id: 'duration-long', name: 'Longest First', icon: 'schedule' },
    { id: 'duration-short', name: 'Shortest First', icon: 'timer' },
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
  }, []);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Video Library Updated! 🎬', 'Your video collection has been refreshed');
    }, 1500);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    Vibration.vibrate(30);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    Vibration.vibrate(30);
  };

  const handleSortSelect = (sortId) => {
    setSelectedSort(sortId);
    Vibration.vibrate(30);
  };

  const handleVideoPress = (video) => {
    if (selectionMode) {
      toggleVideoSelection(video.id);
    } else {
      Vibration.vibrate(50);
      navigation.navigate('VideoPlayer', { videoId: video.id });
    }
  };

  const handleVideoLongPress = (video) => {
    Vibration.vibrate(100);
    setSelectionMode(true);
    setSelectedVideos([video.id]);
  };

  const toggleVideoSelection = (videoId) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedVideos([]);
  };

  const handleUploadVideo = () => {
    Vibration.vibrate(50);
    setShowUploadModal(true);
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Delete Videos',
      `Are you sure you want to delete ${selectedVideos.length} video(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setVideos(prev => prev.filter(video => !selectedVideos.includes(video.id)));
            exitSelectionMode();
            Vibration.vibrate(100);
            Alert.alert('Success! 🗑️', 'Selected videos have been deleted');
          }
        }
      ]
    );
  };

  const handleShareSelected = () => {
    Vibration.vibrate(50);
    Alert.alert('Share Videos 📤', `Share ${selectedVideos.length} video(s) with players or teams`);
    exitSelectionMode();
  };

  const handleAddToPlaylist = () => {
    Vibration.vibrate(50);
    Alert.alert('Add to Training Plan 📋', `Add ${selectedVideos.length} video(s) to a training plan`);
    exitSelectionMode();
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (selectedSort) {
      case 'newest':
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      case 'oldest':
        return new Date(a.uploadDate) - new Date(b.uploadDate);
      case 'most-viewed':
        return b.views - a.views;
      case 'highest-rated':
        return b.avgRating - a.avgRating;
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'duration-long':
        return b.duration.localeCompare(a.duration);
      case 'duration-short':
        return a.duration.localeCompare(b.duration);
      default:
        return 0;
    }
  });

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
            <Text style={styles.headerTitle}>Video Library 🎬</Text>
            <Text style={styles.headerSubtitle}>
              {filteredVideos.length} videos • {Math.round(videos.reduce((sum, v) => sum + parseFloat(v.size), 0) / 1000 * 100) / 100} GB
            </Text>
          </View>
          <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            <Avatar.Icon
              size={45}
              icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
              style={styles.viewModeButton}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{videos.reduce((sum, v) => sum + v.likes, 0)}</Text>
            <Text style={styles.statLabel}>Total Likes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{videos.reduce((sum, v) => sum + v.usedInPlans, 0)}</Text>
            <Text style={styles.statLabel}>Used in Plans</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search videos, tags, descriptions..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
        inputStyle={styles.searchInput}
      />
      
      <View style={styles.filtersRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategorySelect(category.id)}
            >
              <Chip
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && { backgroundColor: category.color + '20' }
                ]}
                textStyle={[
                  styles.chipText,
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
                {category.name} ({category.count})
              </Chip>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <IconButton
          icon="tune"
          size={24}
          onPress={() => setShowFilterModal(true)}
          style={styles.filterButton}
          iconColor={COLORS.primary}
        />
      </View>
    </View>
  );

  const renderSelectionToolbar = () => (
    selectionMode && (
      <Surface style={styles.selectionToolbar} elevation={4}>
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionCount}>{selectedVideos.length} selected</Text>
          <TouchableOpacity onPress={exitSelectionMode}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.selectionActions}>
          <IconButton
            icon="playlist-add"
            size={24}
            onPress={handleAddToPlaylist}
            iconColor={COLORS.primary}
          />
          <IconButton
            icon="share"
            size={24}
            onPress={handleShareSelected}
            iconColor="#4CAF50"
          />
          <IconButton
            icon="delete"
            size={24}
            onPress={handleDeleteSelected}
            iconColor="#F44336"
          />
        </View>
      </Surface>
    )
  );

  const renderVideoGridItem = ({ item }) => (
    <TouchableOpacity
      style={styles.videoGridItem}
      onPress={() => handleVideoPress(item)}
      onLongPress={() => handleVideoLongPress(item)}
      activeOpacity={0.9}
    >
      <Card style={[
        styles.videoCard,
        selectedVideos.includes(item.id) && styles.selectedVideoCard
      ]}>
        <View style={styles.videoThumbnailContainer}>
          <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
          <View style={styles.videoDuration}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
          <View style={styles.videoQuality}>
            <Text style={styles.qualityText}>{item.quality}</Text>
          </View>
          {item.isPrivate && (
            <View style={styles.privateIndicator}>
              <Icon name="lock" size={16} color="#FFF" />
            </View>
          )}
          {selectionMode && (
            <View style={styles.selectionIndicator}>
              <Icon
                name={selectedVideos.includes(item.id) ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={selectedVideos.includes(item.id) ? COLORS.primary : '#FFF'}
              />
            </View>
          )}
        </View>
        
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.videoDescription} numberOfLines={1}>{item.description}</Text>
          
          <View style={styles.videoMetrics}>
            <View style={styles.metricItem}>
              <Icon name="visibility" size={14} color="#666" />
              <Text style={styles.metricText}>{item.views.toLocaleString()}</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="thumb-up" size={14} color="#666" />
              <Text style={styles.metricText}>{item.likes}</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.metricText}>{item.avgRating}</Text>
            </View>
          </View>
          
          <View style={styles.videoTags}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                {tag}
              </Chip>
            ))}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderVideoListItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleVideoPress(item)}
      onLongPress={() => handleVideoLongPress(item)}
      activeOpacity={0.9}
    >
      <Card style={[
        styles.videoListCard,
        selectedVideos.includes(item.id) && styles.selectedVideoCard
      ]}>
        <View style={styles.videoListContent}>
          <View style={styles.videoListThumbnail}>
            <Image source={{ uri: item.thumbnail }} style={styles.listThumbnailImage} />
            <Text style={styles.listDurationText}>{item.duration}</Text>
          </View>
          
          <View style={styles.videoListInfo}>
            <Text style={styles.videoTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.videoDescription} numberOfLines={2}>{item.description}</Text>
            
            <View style={styles.videoListMetrics}>
              <Text style={styles.listMetricText}>{item.views.toLocaleString()} views</Text>
              <Text style={styles.listMetricText}>•</Text>
              <Text style={styles.listMetricText}>{item.likes} likes</Text>
              <Text style={styles.listMetricText}>•</Text>
              <Text style={styles.listMetricText}>⭐ {item.avgRating}</Text>
              {item.isPrivate && (
                <>
                  <Text style={styles.listMetricText}>•</Text>
                  <Icon name="lock" size={14} color="#666" />
                </>
              )}
            </View>
          </View>
          
          <View style={styles.videoListActions}>
            {selectionMode && (
              <Icon
                name={selectedVideos.includes(item.id) ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={selectedVideos.includes(item.id) ? COLORS.primary : '#666'}
              />
            )}
            {!selectionMode && (
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => Alert.alert('Video Actions', 'Edit, Share, or Delete this video')}
              />
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="video-library" size={100} color="#DDD" />
      <Text style={styles.emptyTitle}>No Videos Found</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery || selectedCategory !== 'all' 
          ? 'Try adjusting your search or filters'
          : 'Upload your first training video to get started'
        }
      </Text>
      {(!searchQuery && selectedCategory === 'all') && (
        <Button
          mode="contained"
          onPress={handleUploadVideo}
          style={styles.uploadButton}
          icon="cloud-upload"
        >
          Upload First Video
        </Button>
      )}
    </View>
  );

  const renderUploadModal = () => (
    <Portal>
      <Modal
        visible={showUploadModal}
        onDismiss={() => setShowUploadModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <View style={styles.uploadModalContent}>
            <Text style={styles.modalTitle}>Upload Training Video 🎬</Text>
            
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => {
                  setShowUploadModal(false);
                  Alert.alert('Camera Upload 📹', 'Record a new training video');
                }}
              >
                <Icon name="videocam" size={40} color={COLORS.primary} />
                <Text style={styles.uploadOptionText}>Record Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => {
                  setShowUploadModal(false);
                  Alert.alert('Gallery Upload 📱', 'Choose from your device gallery');
                }}
              >
                <Icon name="video-library" size={40} color="#4CAF50" />
                <Text style={styles.uploadOptionText}>From Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => {
                  setShowUploadModal(false);
                  Alert.alert('Cloud Import ☁️', 'Import from cloud storage');
                }}
              >
                <Icon name="cloud-upload" size={40} color="#FF9800" />
                <Text style={styles.uploadOptionText}>From Cloud</Text>
              </TouchableOpacity>
            </View>
            
            <Button
              mode="outlined"
              onPress={() => setShowUploadModal(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={styles.filterModalContainer}
      >
        <View style={styles.filterModalContent}>
          <Text style={styles.modalTitle}>Sort & Filter Videos</Text>
          
          <Text style={styles.filterSectionTitle}>Sort By</Text>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.sortOption}
              onPress={() => {
                handleSortSelect(option.id);
                setShowFilterModal(false);
              }}
            >
              <Icon name={option.icon} size={24} color={selectedSort === option.id ? COLORS.primary : '#666'} />
              <Text style={[
                styles.sortOptionText,
                selectedSort === option.id && { color: COLORS.primary, fontWeight: '600' }
              ]}>
                {option.name}
              </Text>
              {selectedSort === option.id && (
                <Icon name="check" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
          
          <Button
            mode="outlined"
            onPress={() => setShowFilterModal(false)}
            style={styles.filterCloseButton}
          >
            Done
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchAndFilters()}
      {renderSelectionToolbar()}
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {filteredVideos.length > 0 ? (
          <FlatList
            data={filteredVideos}
            key={viewMode} // Force re-render when view mode changes
            numColumns={viewMode === 'grid' ? 2 : 1}
            renderItem={viewMode === 'grid' ? renderVideoGridItem : renderVideoListItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.videosList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : null}
          />
        ) : (
          renderEmptyState()
        )}
      </Animated.View>

      {renderUploadModal()}
      {renderFilterModal()}

      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleUploadVideo}
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
  viewModeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: SPACING.medium,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  searchContainer: {
    padding: SPACING.medium,
    backgroundColor: '#FFF',
  },
  searchbar: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    elevation: 0,
    marginBottom: SPACING.medium,
  },
  searchInput: {
    fontSize: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingRight: SPACING.medium,
  },
  categoryChip: {
    marginRight: SPACING.small,
    backgroundColor: '#F5F5F5',
  },
  chipText: {
    fontSize: 12,
  },
  filterButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  selectionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: SPACING.medium,
  },
  selectionActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  videosList: {
    padding: SPACING.medium,
    paddingBottom: 100, // Space for FAB
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  videoGridItem: {
    width: (width - SPACING.large * 3) / 2,
    marginBottom: SPACING.medium,
  },
  videoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedVideoCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  videoThumbnailContainer: {
    position: 'relative',
    height: 120,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  videoQuality: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qualityText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  privateIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
    borderRadius: 12,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  videoInfo: {
    padding: SPACING.medium,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: SPACING.small,
  },
  videoMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
    gap: SPACING.small,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  videoTags: {
    flexDirection: 'row',
    gap: 4,
  },
  tagChip: {
    height: 20,
    backgroundColor: '#F0F0F0',
  },
  tagText: {
    fontSize: 10,
    color: '#666',
  },
  videoListCard: {
    marginBottom: SPACING.medium,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  videoListContent: {
    flexDirection: 'row',
    padding: SPACING.medium,
  },
  videoListThumbnail: {
    position: 'relative',
    marginRight: SPACING.medium,
  },
  listThumbnailImage: {
    width: 120,
    height: 68,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  listDurationText: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: '#FFF',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  videoListInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoListMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  listMetricText: {
    fontSize: 12,
    color: '#666',
  },
  videoListActions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: SPACING.small,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large * 2,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#999',
    marginTop: SPACING.large,
    marginBottom: SPACING.medium,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: SPACING.large * 2,
    lineHeight: 24,
  },
  uploadButton: {
    borderRadius: 25,
    paddingHorizontal: SPACING.large,
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
  uploadModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: SPACING.large * 2,
    margin: SPACING.large,
    alignItems: 'center',
    minWidth: width * 0.8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: SPACING.large * 2,
    textAlign: 'center',
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.large * 2,
  },
  uploadOption: {
    alignItems: 'center',
    padding: SPACING.large,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    minWidth: 80,
  },
  uploadOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: SPACING.small,
    textAlign: 'center',
  },
  cancelButton: {
    width: '100%',
    borderRadius: 10,
  },
  filterModalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  filterModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.large,
    maxHeight: height * 0.7,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: SPACING.medium,
    marginTop: SPACING.medium,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.small,
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: SPACING.medium,
    flex: 1,
  },
  filterCloseButton: {
    marginTop: SPACING.large,
    borderRadius: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
};

export default VideoLibrary;