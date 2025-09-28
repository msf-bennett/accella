import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  RefreshControl,
  Dimensions,
  StatusBar,
  Alert,
  Vibration,
  TouchableOpacity,
  Image,
  FlatList,
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
  Modal,
  TextInput,
  Searchbar,
  Menu,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PHOTO_SIZE = (SCREEN_WIDTH - SPACING.lg * 3) / 2;

const ProgressPhotos = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, progressPhotos, isLoading } = useSelector(state => state.photos);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const photoAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPhotos, setComparisonPhotos] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Photo categories
  const categories = [
    { id: 'all', name: 'All Photos', icon: 'photo-library', color: COLORS.primary },
    { id: 'front', name: 'Front View', icon: 'person', color: COLORS.success },
    { id: 'side', name: 'Side View', icon: 'accessibility', color: COLORS.warning },
    { id: 'back', name: 'Back View', icon: 'person-outline', color: COLORS.secondary },
    { id: 'progress', name: 'Progress Shots', icon: 'trending-up', color: COLORS.error },
  ];

  // Sample progress photos data
  const [photosData] = useState({
    totalPhotos: 24,
    thisWeekPhotos: 3,
    categories: {
      front: 8,
      side: 6,
      back: 5,
      progress: 5,
    },
    photos: [
      {
        id: '1',
        uri: 'https://via.placeholder.com/300x400/667eea/ffffff?text=Week+1',
        date: '2024-08-26',
        week: 1,
        category: 'front',
        notes: 'Starting my fitness journey! 💪',
        weight: '75kg',
        bodyFat: '18%',
        isRecent: true,
      },
      {
        id: '2',
        uri: 'https://via.placeholder.com/300x400/764ba2/ffffff?text=Week+4',
        date: '2024-08-05',
        week: 4,
        category: 'front',
        notes: 'Already seeing some definition!',
        weight: '73kg',
        bodyFat: '16%',
        isRecent: false,
      },
      {
        id: '3',
        uri: 'https://via.placeholder.com/300x400/f093fb/ffffff?text=Week+8',
        date: '2024-07-15',
        week: 8,
        category: 'front',
        notes: 'Major progress! Feeling strong 🔥',
        weight: '71kg',
        bodyFat: '14%',
        isRecent: false,
      },
      {
        id: '4',
        uri: 'https://via.placeholder.com/300x400/4facfe/ffffff?text=Side+Week+1',
        date: '2024-08-26',
        week: 1,
        category: 'side',
        notes: 'Side profile baseline',
        weight: '75kg',
        isRecent: true,
      },
      {
        id: '5',
        uri: 'https://via.placeholder.com/300x400/00d2ff/ffffff?text=Side+Week+8',
        date: '2024-07-15',
        week: 8,
        category: 'side',
        notes: 'Love the side gains!',
        weight: '71kg',
        isRecent: false,
      },
      {
        id: '6',
        uri: 'https://via.placeholder.com/300x400/ff9472/ffffff?text=Progress',
        date: '2024-08-20',
        week: 2,
        category: 'progress',
        notes: 'Comparison shot - amazing difference!',
        weight: '74kg',
        isRecent: true,
      },
    ],
    milestones: [
      { id: '1', title: 'First Progress Photo', date: '2024-06-01', completed: true },
      { id: '2', title: '4 Week Comparison', date: '2024-07-01', completed: true },
      { id: '3', title: '8 Week Transformation', date: '2024-08-01', completed: true },
      { id: '4', title: '12 Week Goal', date: '2024-09-01', completed: false },
    ],
  });

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
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Progress Photos', 'Photos refreshed! 📸');
    }, 1000);
  }, []);

  const handleAddPhoto = () => {
    Alert.alert(
      'Add Progress Photo',
      'Choose how you want to add your photo:',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openImageLibrary() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) return;
      if (response.error) {
        Alert.alert('Error', 'Failed to open camera');
        return;
      }
      
      // Animate photo addition
      Animated.spring(photoAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start(() => {
        photoAnim.setValue(0);
      });

      Vibration.vibrate([0, 100, 50, 100]);
      Alert.alert('📸 Photo Added!', 'Great job documenting your progress! Keep it up! 💪');
    });
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.error) {
        Alert.alert('Error', 'Failed to open photo library');
        return;
      }
      
      Alert.alert('📱 Photo Added!', 'Your progress photo has been added successfully!');
    });
  };

  const getFilteredPhotos = () => {
    let filtered = photosData.photos;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(photo => photo.category === selectedCategory);
    }

    // Sort photos
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'week':
        return filtered.sort((a, b) => b.week - a.week);
      default:
        return filtered;
    }
  };

  const handlePhotoPress = (photo) => {
    setSelectedPhoto(photo);
    setShowFullscreen(true);
    Vibration.vibrate(50);
  };

  const handleComparison = () => {
    if (comparisonPhotos.length < 2) {
      Alert.alert('Select Photos', 'Please select at least 2 photos to compare');
      return;
    }
    setShowComparison(true);
  };

  const togglePhotoSelection = (photo) => {
    const isSelected = comparisonPhotos.find(p => p.id === photo.id);
    if (isSelected) {
      setComparisonPhotos(comparisonPhotos.filter(p => p.id !== photo.id));
    } else if (comparisonPhotos.length < 4) {
      setComparisonPhotos([...comparisonPhotos, photo]);
    } else {
      Alert.alert('Limit Reached', 'You can compare up to 4 photos at once');
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <IconButton
          icon="arrow-back"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerCenter}>
          <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center' }]}>
            Progress Photos 📸
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', textAlign: 'center' }]}>
            {photosData.totalPhotos} photos • {photosData.thisWeekPhotos} this week
          </Text>
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              iconColor="white"
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={() => {}} title="Export Photos" leadingIcon="download" />
          <Menu.Item onPress={() => {}} title="Share Progress" leadingIcon="share" />
          <Divider />
          <Menu.Item onPress={() => {}} title="Settings" leadingIcon="settings" />
        </Menu>
      </View>
    </LinearGradient>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Surface style={styles.statCard} elevation={3}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.statGradient}
        >
          <Icon name="photo-camera" size={28} color="white" />
          <Text style={[TEXT_STYLES.h1, { color: 'white', marginTop: 8 }]}>
            {photosData.thisWeekPhotos}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
            Photos This Week 📸
          </Text>
        </LinearGradient>
      </Surface>
      
      <Surface style={styles.statCard} elevation={3}>
        <LinearGradient
          colors={['#4ECDC4', '#44A08D']}
          style={styles.statGradient}
        >
          <Icon name="photo-library" size={28} color="white" />
          <Text style={[TEXT_STYLES.h1, { color: 'white', marginTop: 8 }]}>
            {photosData.totalPhotos}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
            Total Photos
          </Text>
        </LinearGradient>
      </Surface>
      
      <Surface style={styles.statCard} elevation={3}>
        <LinearGradient
          colors={['#FFD93D', '#FF9A1F']}
          style={styles.statGradient}
        >
          <Icon name="trending-up" size={28} color="white" />
          <Text style={[TEXT_STYLES.h1, { color: 'white', marginTop: 8 }]}>
            {photosData.milestones.filter(m => m.completed).length}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
            Milestones
          </Text>
        </LinearGradient>
      </Surface>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((category) => (
          <Chip
            key={category.id}
            mode={selectedCategory === category.id ? 'flat' : 'outlined'}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={selectedCategory === category.id ? { color: 'white' } : { color: category.color }}
            icon={category.icon}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>
      
      <View style={styles.viewControls}>
        <View style={styles.viewToggle}>
          <IconButton
            icon="grid-on"
            iconColor={selectedView === 'grid' ? COLORS.primary : COLORS.textSecondary}
            size={20}
            onPress={() => setSelectedView('grid')}
            style={selectedView === 'grid' && styles.activeView}
          />
          <IconButton
            icon="view-list"
            iconColor={selectedView === 'list' ? COLORS.primary : COLORS.textSecondary}
            size={20}
            onPress={() => setSelectedView('list')}
            style={selectedView === 'list' && styles.activeView}
          />
          <IconButton
            icon="compare"
            iconColor={selectedView === 'compare' ? COLORS.primary : COLORS.textSecondary}
            size={20}
            onPress={() => setSelectedView('compare')}
            style={selectedView === 'compare' && styles.activeView}
          />
        </View>
        
        <Menu
          visible={false}
          anchor={
            <Button
              mode="outlined"
              compact
              onPress={() => {}}
              icon="sort"
            >
              {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'By Week'}
            </Button>
          }
        />
      </View>
    </View>
  );

  const renderPhotoGrid = () => (
    <FlatList
      data={getFilteredPhotos()}
      numColumns={2}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.photoGrid}
      renderItem={({ item, index }) => (
        <Animated.View
          style={[
            styles.photoContainer,
            {
              transform: [{
                scale: photoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                }),
              }],
            },
          ]}
        >
          <TouchableOpacity
            activeScale={0.95}
            onPress={() => selectedView === 'compare' ? togglePhotoSelection(item) : handlePhotoPress(item)}
            style={styles.photoTouchable}
          >
            <Surface style={styles.photoCard} elevation={3}>
              <Image source={{ uri: item.uri }} style={styles.photoImage} />
              
              {selectedView === 'compare' && (
                <View style={styles.selectionOverlay}>
                  {comparisonPhotos.find(p => p.id === item.id) && (
                    <Surface style={styles.selectionBadge} elevation={3}>
                      <Icon name="check" size={16} color="white" />
                    </Surface>
                  )}
                </View>
              )}
              
              {item.isRecent && (
                <Surface style={styles.recentBadge} elevation={2}>
                  <Text style={styles.recentText}>NEW</Text>
                </Surface>
              )}
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.photoOverlay}
              >
                <View style={styles.photoInfo}>
                  <Text style={[TEXT_STYLES.caption, { color: 'white', fontWeight: 'bold' }]}>
                    Week {item.week}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                  {item.weight && (
                    <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                      {item.weight}
                    </Text>
                  )}
                </View>
              </LinearGradient>
            </Surface>
          </TouchableOpacity>
        </Animated.View>
      )}
    />
  );

  const renderMilestones = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={TEXT_STYLES.h3}>Photo Milestones 🎯</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            {photosData.milestones.filter(m => m.completed).length}/{photosData.milestones.length} completed
          </Text>
        </View>
        
        {photosData.milestones.map((milestone) => (
          <Surface 
            key={milestone.id} 
            style={[styles.milestoneItem, !milestone.completed && styles.upcomingMilestone]} 
            elevation={1}
          >
            <Icon 
              name={milestone.completed ? "check-circle" : "radio-button-unchecked"} 
              size={24} 
              color={milestone.completed ? COLORS.success : COLORS.textSecondary} 
            />
            <View style={styles.milestoneInfo}>
              <Text style={[TEXT_STYLES.subtitle1, !milestone.completed && { color: COLORS.textSecondary }]}>
                {milestone.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {milestone.completed ? `Completed ${milestone.date}` : `Target: ${milestone.date}`}
              </Text>
            </View>
            <ProgressBar
              progress={milestone.completed ? 1 : 0.5}
              color={milestone.completed ? COLORS.success : COLORS.warning}
              style={styles.milestoneProgress}
            />
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderFullscreenModal = () => (
    <Portal>
      <Modal
        visible={showFullscreen}
        onDismiss={() => setShowFullscreen(false)}
        contentContainerStyle={styles.fullscreenModal}
      >
        <View style={styles.fullscreenHeader}>
          <IconButton
            icon="close"
            iconColor="white"
            size={24}
            onPress={() => setShowFullscreen(false)}
          />
          <Text style={[TEXT_STYLES.h3, { color: 'white', flex: 1, textAlign: 'center' }]}>
            Week {selectedPhoto?.week} - {selectedPhoto?.category}
          </Text>
          <IconButton
            icon="share"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('Share', 'Share this progress photo!')}
          />
        </View>
        
        {selectedPhoto && (
          <>
            <Image source={{ uri: selectedPhoto.uri }} style={styles.fullscreenImage} />
            
            <View style={styles.fullscreenInfo}>
              <Text style={[TEXT_STYLES.body, { color: 'white', textAlign: 'center', marginBottom: SPACING.md }]}>
                {new Date(selectedPhoto.date).toLocaleDateString()}
              </Text>
              
              {selectedPhoto.weight && (
                <View style={styles.metricRow}>
                  <Icon name="monitor-weight" size={20} color="white" />
                  <Text style={[TEXT_STYLES.body, { color: 'white', marginLeft: 8 }]}>
                    {selectedPhoto.weight}
                  </Text>
                  {selectedPhoto.bodyFat && (
                    <>
                      <Icon name="fitness-center" size={20} color="white" style={{ marginLeft: SPACING.md }} />
                      <Text style={[TEXT_STYLES.body, { color: 'white', marginLeft: 8 }]}>
                        {selectedPhoto.bodyFat} BF
                      </Text>
                    </>
                  )}
                </View>
              )}
              
              {selectedPhoto.notes && (
                <View style={styles.notesContainer}>
                  <Icon name="note" size={20} color="white" />
                  <Text style={[TEXT_STYLES.body, { color: 'white', marginLeft: 8, flex: 1 }]}>
                    {selectedPhoto.notes}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );

  const renderComparisonView = () => (
    <View style={styles.comparisonContainer}>
      <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginBottom: SPACING.md }]}>
        Select photos to compare ({comparisonPhotos.length}/4)
      </Text>
      
      {comparisonPhotos.length > 0 && (
        <View style={styles.selectedPhotos}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {comparisonPhotos.map((photo) => (
              <Surface key={photo.id} style={styles.comparisonThumb} elevation={2}>
                <Image source={{ uri: photo.uri }} style={styles.thumbImage} />
                <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: 4 }]}>
                  Week {photo.week}
                </Text>
                <IconButton
                  icon="close"
                  size={16}
                  iconColor={COLORS.error}
                  style={styles.removeButton}
                  onPress={() => togglePhotoSelection(photo)}
                />
              </Surface>
            ))}
          </ScrollView>
          
          {comparisonPhotos.length >= 2 && (
            <Button
              mode="contained"
              onPress={handleComparison}
              style={styles.compareButton}
              buttonColor={COLORS.primary}
              icon="compare"
            >
              Compare Photos 🔍
            </Button>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
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
          {renderHeader()}
          
          <View style={styles.content}>
            {renderStatsCards()}
            {renderFilters()}
            
            {selectedView === 'compare' ? renderComparisonView() : (
              <>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                  Your Progress Journey 📈
                </Text>
                {renderPhotoGrid()}
              </>
            )}
            
            {renderMilestones()}
            
            {/* Spacing for FAB */}
            <View style={{ height: 80 }} />
          </View>
        </ScrollView>
      </Animated.View>

      {renderFullscreenModal()}

      <FAB
        icon="camera"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={handleAddPhoto}
        label="Add Photo"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    marginHorizontal: SPACING.xs,
    overflow: 'hidden',
  },
  statGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  viewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 2,
  },
  activeView: {
    backgroundColor: COLORS.primary,
  },
  photoGrid: {
    paddingBottom: SPACING.lg,
  },
  photoContainer: {
    flex: 1,
    margin: SPACING.xs,
  },
  photoTouchable: {
    flex: 1,
  },
  photoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  photoImage: {
    width: '100%',
    height: PHOTO_SIZE,
    resizeMode: 'cover',
  },
  selectionOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  selectionBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recentText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
  },
  photoInfo: {
    padding: SPACING.sm,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  upcomingMilestone: {
    borderWidth: 2,
    borderColor: COLORS.warning,
    borderStyle: 'dashed',
  },
  milestoneInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  milestoneProgress: {
    width: 60,
    height: 4,
    borderRadius: 2,
  },
  comparisonContainer: {
    marginBottom: SPACING.lg,
  },
  selectedPhotos: {
    marginTop: SPACING.md,
  },
  comparisonThumb: {
    width: 80,
    height: 100,
    borderRadius: 8,
    marginRight: SPACING.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    margin: 0,
  },
  compareButton: {
    marginTop: SPACING.md,
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  fullscreenImage: {
    flex: 1,
    resizeMode: 'contain',
    marginHorizontal: SPACING.lg,
  },
  fullscreenInfo: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
  },
});

export default ProgressPhotos;