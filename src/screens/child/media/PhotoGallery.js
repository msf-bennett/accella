import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  FlatList,
  Modal,
  Image,
  Vibration,
  PermissionsAndroid,
  Platform,
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
  Portal,
  Searchbar,
  Menu,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-blur/blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-picker';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e91e63',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width, height } = Dimensions.get('window');
const PHOTO_SIZE = (width - SPACING.md * 3) / 2;

const PhotoGallery = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showMenuVisible, setShowMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  // Mock photo data - replace with Redux selectors
  const [photos, setPhotos] = useState([
    {
      id: '1',
      uri: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Training+Day+1',
      title: 'First Training Session 🏃‍♂️',
      description: 'My first day at football academy!',
      date: '2024-01-15T10:30:00Z',
      category: 'training',
      tags: ['football', 'academy', 'first-day'],
      location: 'Sports Academy',
      coachApproved: true,
      likes: 12,
      comments: 3,
      shared: ['coach', 'parents'],
      achievement: 'First Training Complete',
    },
    {
      id: '2',
      uri: 'https://via.placeholder.com/400x300/4CAF50/ffffff?text=Goal+Scored!',
      title: 'My First Goal! ⚽',
      description: 'Scored my first goal during practice match',
      date: '2024-01-20T16:45:00Z',
      category: 'achievement',
      tags: ['goal', 'match', 'victory'],
      location: 'Training Field',
      coachApproved: true,
      likes: 25,
      comments: 8,
      shared: ['coach', 'parents', 'team'],
      achievement: 'First Goal Scored',
    },
    {
      id: '3',
      uri: 'https://via.placeholder.com/400x300/FF9800/ffffff?text=Team+Photo',
      title: 'Team Photo Day 📸',
      description: 'Official team photo with all my friends',
      date: '2024-01-18T14:00:00Z',
      category: 'team',
      tags: ['team', 'friends', 'official'],
      location: 'Sports Academy',
      coachApproved: false,
      likes: 18,
      comments: 5,
      shared: ['parents'],
      pending: true,
    },
    {
      id: '4',
      uri: 'https://via.placeholder.com/400x300/e91e63/ffffff?text=Equipment',
      title: 'New Gear Day! 👟',
      description: 'Got new football boots from coach',
      date: '2024-01-22T09:15:00Z',
      category: 'equipment',
      tags: ['boots', 'gear', 'new'],
      location: 'Home',
      coachApproved: true,
      likes: 15,
      comments: 4,
      shared: ['coach', 'parents'],
    },
    {
      id: '5',
      uri: 'https://via.placeholder.com/400x300/764ba2/ffffff?text=Progress+Shot',
      title: 'Skill Progress 📈',
      description: 'Practicing my dribbling technique',
      date: '2024-01-25T11:20:00Z',
      category: 'progress',
      tags: ['skills', 'dribbling', 'practice'],
      location: 'Training Field',
      coachApproved: false,
      likes: 8,
      comments: 2,
      shared: ['coach'],
      pending: true,
    },
    {
      id: '6',
      uri: 'https://via.placeholder.com/400x300/F44336/ffffff?text=Award+Day',
      title: 'Player of the Week! 🏆',
      description: 'Received my first award from coach',
      date: '2024-01-28T17:30:00Z',
      category: 'achievement',
      tags: ['award', 'recognition', 'achievement'],
      location: 'Sports Academy',
      coachApproved: true,
      likes: 32,
      comments: 12,
      shared: ['coach', 'parents', 'team'],
      achievement: 'Player of the Week',
    },
  ]);

  const categories = [
    { id: 'all', label: 'All Photos', icon: 'photo-library', count: photos.length },
    { id: 'training', label: 'Training', icon: 'fitness-center', count: photos.filter(p => p.category === 'training').length },
    { id: 'achievement', label: 'Achievements', icon: 'jump-rope', count: photos.filter(p => p.category === 'achievement').length },
    { id: 'team', label: 'Team', icon: 'group', count: photos.filter(p => p.category === 'team').length },
    { id: 'equipment', label: 'Equipment', icon: 'sports', count: photos.filter(p => p.category === 'equipment').length },
    { id: 'progress', label: 'Progress', icon: 'trending-up', count: photos.filter(p => p.category === 'progress').length },
  ];

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
      
      // Animate screen entrance
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      loadPhotos();
    }, [])
  );

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchUserPhotos(user.id));
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  }, []);

  const handlePhotoPress = (photo) => {
    if (isSelectionMode) {
      togglePhotoSelection(photo.id);
    } else {
      Vibration.vibrate(50);
      setSelectedImage(photo);
      setShowImageModal(true);
    }
  };

  const handlePhotoLongPress = (photo) => {
    Vibration.vibrate(100);
    setIsSelectionMode(true);
    setSelectedPhotos([photo.id]);
  };

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedPhotos([]);
  };

  const handleCameraCapture = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission needed', 'Camera permission is required');
          return;
        }
      }

      Alert.alert(
        '📸 Take Photo',
        'Photo capture feature is being developed! Soon you\'ll be able to take photos directly from the app.',
        [{ text: '✨ Awesome!', style: 'default' }]
      );
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const handlePhotoUpload = () => {
    Alert.alert(
      '📱 Upload Photos',
      'Photo upload from gallery is being developed! Soon you\'ll be able to upload photos from your device.',
      [{ text: '✨ Cool!', style: 'default' }]
    );
  };

  const handleSharePhotos = () => {
    if (selectedPhotos.length === 0) return;
    
    Alert.alert(
      '📤 Share Photos',
      `Share ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''} with coach and parents?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share', 
          onPress: () => {
            // Implement sharing logic
            exitSelectionMode();
            Alert.alert('✅ Success', 'Photos shared successfully!');
          }
        }
      ]
    );
  };

  const handleDeletePhotos = () => {
    if (selectedPhotos.length === 0) return;
    
    Alert.alert(
      '🗑️ Delete Photos',
      `Delete ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setPhotos(prev => prev.filter(photo => !selectedPhotos.includes(photo.id)));
            exitSelectionMode();
          }
        }
      ]
    );
  };

  const handleLikePhoto = (photoId) => {
    Vibration.vibrate(30);
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, likes: photo.likes + 1 }
        : photo
    ));
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        {isSelectionMode ? (
          <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={exitSelectionMode} style={styles.backButton}>
              <Icon name="close" size={24} color={COLORS.surface} />
            </TouchableOpacity>
            <Text style={styles.selectionTitle}>
              {selectedPhotos.length} selected
            </Text>
            <View style={styles.selectionActions}>
              <TouchableOpacity onPress={handleSharePhotos} style={styles.selectionAction}>
                <Icon name="share" size={24} color={COLORS.surface} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeletePhotos} style={styles.selectionAction}>
                <Icon name="delete" size={24} color={COLORS.surface} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerTitle}>Photo Gallery 📸</Text>
                <Text style={styles.headerSubtitle}>
                  {photos.length} photos • {photos.filter(p => p.coachApproved).length} approved
                </Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  style={styles.viewModeButton}
                >
                  <Icon 
                    name={viewMode === 'grid' ? 'view-list' : 'view-module'} 
                    size={24} 
                    color={COLORS.surface} 
                  />
                </TouchableOpacity>
                <Menu
                  visible={showMenuVisible}
                  onDismiss={() => setShowMenuVisible(false)}
                  anchor={
                    <TouchableOpacity 
                      onPress={() => setShowMenuVisible(true)}
                      style={styles.menuButton}
                    >
                      <Icon name="dots-vertical" size={24} color={COLORS.surface} />
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item onPress={() => {}} title="Sort by Date" leadingIcon="sort" />
                  <Menu.Item onPress={() => {}} title="Filter by Tags" leadingIcon="filter-list" />
                  <Menu.Item onPress={() => {}} title="Export Photos" leadingIcon="download" />
                </Menu>
              </View>
            </View>
            
            <View style={styles.searchContainer}>
              <Searchbar
                placeholder="Search photos, tags, or descriptions..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                iconColor={COLORS.primary}
              />
            </View>
          </>
        )}
      </View>
    </LinearGradient>
  );

  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={[
            styles.categoryTab,
            selectedCategory === category.id && styles.categoryTabActive
          ]}
        >
          <Icon 
            name={category.icon} 
            size={20} 
            color={selectedCategory === category.id ? COLORS.surface : COLORS.primary} 
          />
          <Text style={[
            styles.categoryTabText,
            selectedCategory === category.id && styles.categoryTabTextActive
          ]}>
            {category.label} ({category.count})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPhotoGrid = ({ item: photo, index }) => {
    const isSelected = selectedPhotos.includes(photo.id);
    
    return (
      <Animated.View
        style={[
          styles.photoGridItem,
          {
            transform: [{
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            }],
            opacity: animatedValue,
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => handlePhotoPress(photo)}
          onLongPress={() => handlePhotoLongPress(photo)}
          style={[styles.photoContainer, isSelected && styles.photoSelected]}
        >
          <Image source={{ uri: photo.uri }} style={styles.photoImage} />
          
          {/* Overlay indicators */}
          <View style={styles.photoOverlay}>
            {photo.achievement && (
              <View style={styles.achievementBadge}>
                <Icon name="jump-rope" size={16} color={COLORS.warning} />
              </View>
            )}
            
            {photo.pending && (
              <View style={styles.pendingBadge}>
                <Icon name="pending" size={16} color={COLORS.warning} />
              </View>
            )}
            
            {photo.coachApproved && (
              <View style={styles.approvedBadge}>
                <Icon name="verified" size={16} color={COLORS.success} />
              </View>
            )}
          </View>
          
          {/* Selection indicator */}
          {isSelectionMode && (
            <View style={styles.selectionIndicator}>
              <View style={[
                styles.selectionCircle,
                isSelected && styles.selectionCircleActive
              ]}>
                {isSelected && <Icon name="check" size={16} color={COLORS.surface} />}
              </View>
            </View>
          )}
          
          {/* Photo info */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.photoInfo}
          >
            <Text style={styles.photoTitle} numberOfLines={1}>
              {photo.title}
            </Text>
            <Text style={styles.photoDate}>
              {formatDate(photo.date)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPhotoList = ({ item: photo, index }) => {
    const isSelected = selectedPhotos.includes(photo.id);
    
    return (
      <Animated.View
        style={[
          styles.photoListItem,
          {
            transform: [{
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50 * (index + 1), 0],
              }),
            }],
            opacity: animatedValue,
          }
        ]}
      >
        <Card style={[styles.listCard, isSelected && styles.listCardSelected]}>
          <TouchableOpacity
            onPress={() => handlePhotoPress(photo)}
            onLongPress={() => handlePhotoLongPress(photo)}
          >
            <View style={styles.listContent}>
              <Image source={{ uri: photo.uri }} style={styles.listImage} />
              
              <View style={styles.listInfo}>
                <Text style={styles.listTitle}>{photo.title}</Text>
                <Text style={styles.listDescription} numberOfLines={2}>
                  {photo.description}
                </Text>
                
                <View style={styles.listMeta}>
                  <Text style={styles.listDate}>{formatDate(photo.date)}</Text>
                  <View style={styles.listTags}>
                    {photo.tags.slice(0, 2).map(tag => (
                      <Chip
                        key={tag}
                        mode="outlined"
                        compact
                        style={styles.tagChip}
                        textStyle={styles.tagText}
                      >
                        #{tag}
                      </Chip>
                    ))}
                  </View>
                </View>
                
                <View style={styles.listActions}>
                  <TouchableOpacity
                    style={styles.listActionButton}
                    onPress={() => handleLikePhoto(photo.id)}
                  >
                    <Icon name="favorite" size={18} color={COLORS.accent} />
                    <Text style={styles.listActionText}>{photo.likes}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.listActionButton}>
                    <Icon name="comment" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.listActionText}>{photo.comments}</Text>
                  </TouchableOpacity>
                  
                  {photo.coachApproved && (
                    <View style={styles.approvedIndicator}>
                      <Icon name="verified" size={18} color={COLORS.success} />
                      <Text style={styles.approvedText}>Approved</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {isSelectionMode && (
                <View style={styles.listSelectionIndicator}>
                  <View style={[
                    styles.selectionCircle,
                    isSelected && styles.selectionCircleActive
                  ]}>
                    {isSelected && <Icon name="check" size={16} color={COLORS.surface} />}
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="photo-camera" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No photos yet! 📸</Text>
      <Text style={styles.emptyText}>
        Start capturing your training journey by taking your first photo
      </Text>
      <View style={styles.emptyActions}>
        <Button
          mode="contained"
          onPress={handleCameraCapture}
          style={styles.emptyButton}
          contentStyle={styles.emptyButtonContent}
          icon="camera"
        >
          Take Photo
        </Button>
        <Button
          mode="outlined"
          onPress={handlePhotoUpload}
          style={[styles.emptyButton, styles.emptyButtonOutlined]}
          contentStyle={styles.emptyButtonContent}
          icon="upload"
        >
          Upload Photo
        </Button>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
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
            progressViewOffset={100}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {!isSelectionMode && renderCategoryTabs()}
        
        <View style={styles.photosContainer}>
          {filteredPhotos.length > 0 ? (
            <FlatList
              data={filteredPhotos}
              renderItem={viewMode === 'grid' ? renderPhotoGrid : renderPhotoList}
              keyExtractor={(item) => item.id}
              numColumns={viewMode === 'grid' ? 2 : 1}
              key={viewMode} // Force re-render when view mode changes
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.photosList}
              columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : null}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {!isSelectionMode && (
        <View style={styles.fabContainer}>
          <FAB
            icon="camera"
            style={[styles.fab, styles.cameraFab]}
            onPress={handleCameraCapture}
            color={COLORS.surface}
            customSize={48}
          />
          <FAB
            icon="upload"
            style={styles.fab}
            onPress={handlePhotoUpload}
            color={COLORS.surface}
            customSize={56}
          />
        </View>
      )}

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <BlurView style={styles.modalContainer} blurType="dark">
          <View style={styles.imageModalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowImageModal(false)}
            >
              <Icon name="close" size={32} color={COLORS.surface} />
            </TouchableOpacity>
            
            {selectedImage && (
              <ScrollView
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Image 
                  source={{ uri: selectedImage.uri }} 
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                
                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>{selectedImage.title}</Text>
                  <Text style={styles.modalDescription}>{selectedImage.description}</Text>
                  
                  <View style={styles.modalMeta}>
                    <Text style={styles.modalDate}>{formatDate(selectedImage.date)}</Text>
                    <Text style={styles.modalLocation}>📍 {selectedImage.location}</Text>
                  </View>
                  
                  <View style={styles.modalTags}>
                    {selectedImage.tags.map(tag => (
                      <Chip
                        key={tag}
                        mode="outlined"
                        compact
                        style={styles.modalTagChip}
                        textStyle={styles.modalTagText}
                      >
                        #{tag}
                      </Chip>
                    ))}
                  </View>
                  
                  <View style={styles.modalActions}>
                    <Button
                      mode="contained"
                      onPress={() => handleLikePhoto(selectedImage.id)}
                      style={styles.modalActionButton}
                      icon="favorite"
                    >
                      {selectedImage.likes} Likes
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={() => {}}
                      style={styles.modalActionButton}
                      icon="share"
                    >
                      Share
                    </Button>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.surface,
    flex: 1,
    textAlign: 'center',
  },
  selectionActions: {
    flexDirection: 'row',
  },
  selectionAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  searchContainer: {
    marginBottom: SPACING.sm,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
  },
  categoryTabText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: COLORS.surface,
  },
  photosContainer: {
    padding: SPACING.md,
  },
  photosList: {
    paddingBottom: SPACING.lg,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  // Grid View Styles
  photoGridItem: {
    width: PHOTO_SIZE,
    marginBottom: SPACING.md,
  },
  photoContainer: {
    position: 'relative',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  photoSelected: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  photoImage: {
    width: '100%',
    height: PHOTO_SIZE,
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
  },
  achievementBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  pendingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  approvedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.surface,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  photoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.sm,
  },
  photoTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.surface,
    fontWeight: '600',
    marginBottom: 2,
  },
  photoDate: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  // List View Styles
  photoListItem: {
    marginBottom: SPACING.md,
  },
  listCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  listCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  listContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
    marginRight: SPACING.md,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.xs,
  },
  listDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  listMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  listDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  listTags: {
    flexDirection: 'row',
  },
  tagChip: {
    height: 24,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  tagText: {
    color: COLORS.primary,
    fontSize: 10,
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  listActionText: {
    ...TEXT_STYLES.caption,
    marginLeft: 4,
  },
  approvedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  approvedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: '600',
  },
  listSelectionIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.title,
    marginVertical: SPACING.md,
    textAlign: 'center',
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    lineHeight: 24,
  },
  emptyActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    marginHorizontal: SPACING.sm,
  },
  emptyButtonOutlined: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
  },
  emptyButtonContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  // FAB Container
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    alignItems: 'flex-end',
  },
  fab: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    marginBottom: SPACING.sm,
  },
  cameraFab: {
    backgroundColor: COLORS.accent,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: width - SPACING.lg,
    maxHeight: height * 0.9,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalClose: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    paddingBottom: SPACING.lg,
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalInfo: {
    padding: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.title,
    marginBottom: SPACING.sm,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 24,
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modalLocation: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  modalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  modalTagChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modalTagText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalActionButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default PhotoGallery;