import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  ImageBackground,
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
  Searchbar,
  Divider,
  Portal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const ProgressPhotos = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedView, setSelectedView] = useState('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Redux state
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  // Mock data - replace with actual Redux state
  const progressPhotosData = {
    totalPhotos: 45,
    streakDays: 28,
    categories: ['all', 'front', 'side', 'back', 'pose', 'measurements'],
    photos: [
      {
        id: 1,
        uri: 'https://via.placeholder.com/300x400/667eea/white?text=Front+View',
        category: 'front',
        date: '2024-08-20',
        weight: '185 lbs',
        bodyFat: '12%',
        notes: 'Morning shot after cardio session. Feeling strong! 💪',
        measurements: {
          chest: '42 in',
          waist: '32 in',
          arms: '15.5 in',
        },
        isRecent: true,
      },
      {
        id: 2,
        uri: 'https://via.placeholder.com/300x400/764ba2/white?text=Side+Profile',
        category: 'side',
        date: '2024-08-20',
        weight: '185 lbs',
        bodyFat: '12%',
        notes: 'Side profile showing posture improvements',
        measurements: {
          chest: '42 in',
          waist: '32 in',
          arms: '15.5 in',
        },
        isRecent: true,
      },
      {
        id: 3,
        uri: 'https://via.placeholder.com/300x400/4CAF50/white?text=Back+View',
        category: 'back',
        date: '2024-08-15',
        weight: '184 lbs',
        bodyFat: '12.5%',
        notes: 'Back development looking good',
        measurements: {
          chest: '41.5 in',
          waist: '32.5 in',
          arms: '15 in',
        },
        isRecent: false,
      },
      {
        id: 4,
        uri: 'https://via.placeholder.com/300x400/FF9800/white?text=Pose',
        category: 'pose',
        date: '2024-08-10',
        weight: '183 lbs',
        bodyFat: '13%',
        notes: 'Competition pose practice',
        measurements: {
          chest: '41 in',
          waist: '33 in',
          arms: '14.5 in',
        },
        isRecent: false,
      },
      {
        id: 5,
        uri: 'https://via.placeholder.com/300x400/2196F3/white?text=Front+Old',
        category: 'front',
        date: '2024-07-01',
        weight: '190 lbs',
        bodyFat: '15%',
        notes: 'Starting transformation journey',
        measurements: {
          chest: '40 in',
          waist: '35 in',
          arms: '14 in',
        },
        isRecent: false,
      },
      {
        id: 6,
        uri: 'https://via.placeholder.com/300x400/9C27B0/white?text=Progress',
        category: 'measurements',
        date: '2024-06-15',
        weight: '195 lbs',
        bodyFat: '18%',
        notes: 'Before starting the program',
        measurements: {
          chest: '39 in',
          waist: '36 in',
          arms: '13.5 in',
        },
        isRecent: false,
      },
    ],
    milestones: [
      { id: 1, title: 'First Progress Photo', date: '2024-06-15', achieved: true },
      { id: 2, title: '1 Month Consistency', date: '2024-07-15', achieved: true },
      { id: 3, title: '10 lbs Transformation', date: '2024-08-01', achieved: true },
      { id: 4, title: '3 Month Journey', date: '2024-09-15', achieved: false },
    ],
    stats: {
      weightChange: '-10 lbs',
      bodyFatChange: '-6%',
      averagePhotosPerWeek: 3.2,
      longestStreak: 35,
    }
  };

  const categories = [
    { key: 'all', label: 'All Photos', icon: 'photo-library' },
    { key: 'front', label: 'Front', icon: 'person' },
    { key: 'side', label: 'Side', icon: 'person-outline' },
    { key: 'back', label: 'Back', icon: 'accessibility' },
    { key: 'pose', label: 'Poses', icon: 'fitness-center' },
    { key: 'measurements', label: 'Measurements', icon: 'straighten' },
  ];

  const viewModes = [
    { key: 'gallery', label: 'Gallery', icon: 'view-module' },
    { key: 'timeline', label: 'Timeline', icon: 'timeline' },
    { key: 'compare', label: 'Compare', icon: 'compare' },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('📸 Photos Synced!', 'Your progress photos have been updated.', [
        { text: 'Great! 🎉' }
      ]);
    }, 1500);
  }, []);

  const filteredPhotos = progressPhotosData.photos.filter(photo => {
    const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory;
    const matchesSearch = photo.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.date.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleTakePhoto = () => {
    Alert.alert(
      '📸 Add Progress Photo',
      'How would you like to add your photo?',
      [
        { text: 'Take Photo', onPress: () => launchCamera() },
        { text: 'Choose from Gallery', onPress: () => launchGallery() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const launchCamera = () => {
    Alert.alert('📱 Feature Coming Soon', 'Camera integration will be available in the next update!', [
      { text: 'Got it!' }
    ]);
  };

  const launchGallery = () => {
    Alert.alert('🖼️ Feature Coming Soon', 'Gallery picker will be available in the next update!', [
      { text: 'Got it!' }
    ]);
  };

  const handlePhotoPress = (photo) => {
    setSelectedPhoto(photo);
    setShowFullscreen(true);
  };

  const handleSelectPhoto = (photo) => {
    if (selectedView === 'compare') {
      setSelectedPhotos(prev => {
        if (prev.find(p => p.id === photo.id)) {
          return prev.filter(p => p.id !== photo.id);
        }
        if (prev.length >= 2) {
          return [prev[1], photo];
        }
        return [...prev, photo];
      });
    }
  };

  const handleCompare = () => {
    if (selectedPhotos.length === 2) {
      setShowComparison(true);
    } else {
      Alert.alert('📊 Select Photos', 'Please select exactly 2 photos to compare.', [
        { text: 'OK' }
      ]);
    }
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Progress Photos 📸</Text>
              <Text style={styles.headerSubtitle}>Visual transformation tracking</Text>
            </View>
          </View>
          <IconButton
            icon="dots-vertical"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('⚙️ Feature Coming Soon', 'Photo settings coming soon!')}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderStatsOverview = () => (
    <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
      <View style={styles.statsRow}>
        <Surface style={styles.statCard} elevation={2}>
          <Icon name="photo-library" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{progressPhotosData.totalPhotos}</Text>
          <Text style={styles.statLabel}>Total Photos</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Icon name="local-fire-department" size={24} color="#FF6B35" />
          <Text style={[styles.statNumber, { color: '#FF6B35' }]}>
            {progressPhotosData.streakDays}
          </Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={2}>
          <Icon name="trending-down" size={24} color={COLORS.success} />
          <Text style={[styles.statNumber, { color: COLORS.success }]}>
            {progressPhotosData.stats.weightChange}
          </Text>
          <Text style={styles.statLabel}>Weight Change</Text>
        </Surface>
      </View>
    </Animated.View>
  );

  const renderMilestones = () => (
    <Card style={styles.milestonesCard} elevation={3}>
      <Card.Content>
        <View style={styles.milestonesHeader}>
          <Text style={styles.sectionTitle}>Photo Milestones 🏆</Text>
          <IconButton
            icon="flag"
            size={20}
            iconColor={COLORS.primary}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.milestonesScroll}
        >
          {progressPhotosData.milestones.map((milestone) => (
            <Surface key={milestone.id} style={styles.milestoneCard} elevation={2}>
              <View style={[
                styles.milestoneIcon,
                { backgroundColor: milestone.achieved ? COLORS.success + '20' : COLORS.background }
              ]}>
                <Icon
                  name={milestone.achieved ? 'check-circle' : 'radio-button-unchecked'}
                  size={24}
                  color={milestone.achieved ? COLORS.success : COLORS.textSecondary}
                />
              </View>
              <Text style={styles.milestoneTitle}>{milestone.title}</Text>
              <Text style={styles.milestoneDate}>
                {new Date(milestone.date).toLocaleDateString()}
              </Text>
            </Surface>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderViewModeSelector = () => (
    <View style={styles.viewModeContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.viewModeScroll}
      >
        {viewModes.map((mode) => (
          <Chip
            key={mode.key}
            mode={selectedView === mode.key ? 'flat' : 'outlined'}
            selected={selectedView === mode.key}
            onPress={() => setSelectedView(mode.key)}
            style={[
              styles.viewModeChip,
              selectedView === mode.key && { backgroundColor: COLORS.primary + '20' }
            ]}
            icon={mode.icon}
          >
            {mode.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Searchbar
        placeholder="Search photos, dates, notes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilters}
      >
        {categories.map((category) => (
          <Chip
            key={category.key}
            mode={selectedCategory === category.key ? 'flat' : 'outlined'}
            selected={selectedCategory === category.key}
            onPress={() => setSelectedCategory(category.key)}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && { backgroundColor: COLORS.primary + '20' }
            ]}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderPhotoGrid = () => (
    <FlatList
      data={filteredPhotos}
      numColumns={2}
      keyExtractor={(item) => item.id.toString()}
      scrollEnabled={false}
      contentContainerStyle={styles.photoGrid}
      renderItem={({ item, index }) => (
        <Animated.View
          style={[
            styles.photoCard,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                })
              }]
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => selectedView === 'compare' ? handleSelectPhoto(item) : handlePhotoPress(item)}
            onLongPress={() => handleSelectPhoto(item)}
          >
            <Surface style={styles.photoSurface} elevation={3}>
              <ImageBackground
                source={{ uri: item.uri }}
                style={styles.photoImage}
                imageStyle={styles.photoImageStyle}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.photoOverlay}
                >
                  <View style={styles.photoHeader}>
                    {item.isRecent && (
                      <Chip
                        mode="flat"
                        style={styles.recentBadge}
                        textStyle={styles.recentBadgeText}
                      >
                        NEW 🔥
                      </Chip>
                    )}
                    {selectedView === 'compare' && selectedPhotos.find(p => p.id === item.id) && (
                      <View style={styles.selectedIndicator}>
                        <Icon name="check-circle" size={24} color={COLORS.success} />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.photoInfo}>
                    <Text style={styles.photoDate}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                    <View style={styles.photoStats}>
                      <Text style={styles.photoStat}>{item.weight}</Text>
                      <Text style={styles.photoStat}>{item.bodyFat}</Text>
                    </View>
                    <Text style={styles.photoCategory}>
                      {item.category.toUpperCase()}
                    </Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </Surface>
          </TouchableOpacity>
        </Animated.View>
      )}
    />
  );

  const renderTimelineView = () => (
    <View style={styles.timelineContainer}>
      {filteredPhotos.map((photo, index) => (
        <View key={photo.id} style={styles.timelineItem}>
          <View style={styles.timelineLine}>
            <View style={styles.timelineDot} />
            {index < filteredPhotos.length - 1 && <View style={styles.timelineConnector} />}
          </View>
          <Card style={styles.timelineCard} elevation={2}>
            <Card.Content style={styles.timelineCardContent}>
              <TouchableOpacity onPress={() => handlePhotoPress(photo)}>
                <Image source={{ uri: photo.uri }} style={styles.timelineImage} />
              </TouchableOpacity>
              <View style={styles.timelineInfo}>
                <Text style={styles.timelineDate}>
                  {new Date(photo.date).toLocaleDateString()}
                </Text>
                <Text style={styles.timelineStats}>
                  {photo.weight} • {photo.bodyFat}
                </Text>
                <Text style={styles.timelineNotes} numberOfLines={2}>
                  {photo.notes}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      ))}
    </View>
  );

  const renderComparisonModal = () => (
    <Modal
      visible={showComparison}
      animationType="slide"
      onRequestClose={() => setShowComparison(false)}
    >
      <View style={styles.comparisonContainer}>
        <View style={styles.comparisonHeader}>
          <IconButton
            icon="close"
            size={24}
            onPress={() => setShowComparison(false)}
          />
          <Text style={styles.comparisonTitle}>Photo Comparison</Text>
          <IconButton
            icon="share"
            size={24}
            onPress={() => Alert.alert('📤 Feature Coming Soon', 'Share comparison coming soon!')}
          />
        </View>
        
        {selectedPhotos.length === 2 && (
          <ScrollView style={styles.comparisonContent}>
            <View style={styles.comparisonImages}>
              <View style={styles.comparisonImageContainer}>
                <Image source={{ uri: selectedPhotos[0].uri }} style={styles.comparisonImage} />
                <Text style={styles.comparisonImageDate}>
                  {new Date(selectedPhotos[0].date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.comparisonImageContainer}>
                <Image source={{ uri: selectedPhotos[1].uri }} style={styles.comparisonImage} />
                <Text style={styles.comparisonImageDate}>
                  {new Date(selectedPhotos[1].date).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <Card style={styles.comparisonStats} elevation={2}>
              <Card.Content>
                <Text style={styles.comparisonStatsTitle}>Changes Over Time</Text>
                <View style={styles.comparisonStatsRow}>
                  <Text style={styles.comparisonStatLabel}>Weight:</Text>
                  <Text style={styles.comparisonStatValue}>
                    {selectedPhotos[0].weight} → {selectedPhotos[1].weight}
                  </Text>
                </View>
                <View style={styles.comparisonStatsRow}>
                  <Text style={styles.comparisonStatLabel}>Body Fat:</Text>
                  <Text style={styles.comparisonStatValue}>
                    {selectedPhotos[0].bodyFat} → {selectedPhotos[1].bodyFat}
                  </Text>
                </View>
                <View style={styles.comparisonStatsRow}>
                  <Text style={styles.comparisonStatLabel}>Time Span:</Text>
                  <Text style={styles.comparisonStatValue}>
                    {Math.floor((new Date(selectedPhotos[1].date) - new Date(selectedPhotos[0].date)) / (1000 * 60 * 60 * 24))} days
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const renderFullscreenModal = () => (
    <Modal
      visible={showFullscreen}
      animationType="fade"
      onRequestClose={() => setShowFullscreen(false)}
    >
      <View style={styles.fullscreenContainer}>
        <StatusBar hidden />
        <TouchableOpacity
          style={styles.fullscreenClose}
          onPress={() => setShowFullscreen(false)}
        >
          <Icon name="close" size={32} color="white" />
        </TouchableOpacity>
        
        {selectedPhoto && (
          <>
            <Image source={{ uri: selectedPhoto.uri }} style={styles.fullscreenImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.fullscreenOverlay}
            >
              <View style={styles.fullscreenInfo}>
                <Text style={styles.fullscreenDate}>
                  {new Date(selectedPhoto.date).toLocaleDateString()}
                </Text>
                <View style={styles.fullscreenStats}>
                  <Text style={styles.fullscreenStat}>{selectedPhoto.weight}</Text>
                  <Text style={styles.fullscreenStat}>{selectedPhoto.bodyFat}</Text>
                </View>
                <Text style={styles.fullscreenNotes}>{selectedPhoto.notes}</Text>
              </View>
            </LinearGradient>
          </>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
        {renderStatsOverview()}
        {renderMilestones()}
        {renderViewModeSelector()}
        {renderFilters()}
        
        {selectedView === 'compare' && selectedPhotos.length > 0 && (
          <View style={styles.compareActions}>
            <Text style={styles.compareText}>
              {selectedPhotos.length}/2 photos selected
            </Text>
            <Button
              mode="contained"
              onPress={handleCompare}
              disabled={selectedPhotos.length !== 2}
              style={styles.compareButton}
              icon="compare"
            >
              Compare Photos
            </Button>
          </View>
        )}
        
        <View style={styles.photosContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Photos' : categories.find(c => c.key === selectedCategory)?.label} 
            ({filteredPhotos.length})
          </Text>
          
          {selectedView === 'timeline' ? renderTimelineView() : renderPhotoGrid()}
        </View>
      </ScrollView>

      <FAB
        icon="camera"
        style={styles.fab}
        onPress={handleTakePhoto}
        label="Add Photo"
      />
      
      {renderComparisonModal()}
      {renderFullscreenModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h6,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  statsContainer: {
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  statNumber: {
    ...TEXT_STYLES.h6,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginVertical: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  milestonesCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
  },
  milestonesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  milestonesScroll: {
    paddingRight: SPACING.md,
  },
  milestoneCard: {
    width: 120,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  milestoneTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  milestoneDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  viewModeContainer: {
    marginBottom: SPACING.lg,
  },
  viewModeScroll: {
    paddingRight: SPACING.md,
  },
  viewModeChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
  },
  categoryFilters: {
    paddingRight: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  compareActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  compareText: {
    ...TEXT_STYLES.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  compareButton: {
    backgroundColor: COLORS.primary,
  },
  photosContainer: {
    marginBottom: SPACING.lg,
  },
  photoGrid: {
    paddingTop: SPACING.md,
  },
  photoCard: {
    flex: 1,
    margin: SPACING.xs,
    maxWidth: (width - SPACING.lg * 2 - SPACING.xs * 2) / 2,
  },
  photoSurface: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  photoImage: {
    width: '100%',
    height: 200,
    justifyContent: 'space-between',
  },
  photoImageStyle: {
    borderRadius: 12,
  },
  photoOverlay: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'space-between',
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recentBadge: {
    backgroundColor: '#FFD700',
    height: 24,
  },
  recentBadgeText: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedIndicator: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 2,
  },
  photoInfo: {
    alignItems: 'flex-start',
  },
  photoDate: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  photoStats: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  photoStat: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    marginRight: SPACING.sm,
  },
  photoCategory: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  // Timeline View Styles
  timelineContainer: {
    paddingTop: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  timelineLine: {
    width: 40,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.primary + '30',
  },
  timelineCard: {
    flex: 1,
    borderRadius: 12,
  },
  timelineCardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  timelineImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
    marginRight: SPACING.md,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineDate: {
    ...TEXT_STYLES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  timelineStats: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  timelineNotes: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  // Comparison Modal Styles
  comparisonContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: 'white',
    elevation: 2,
  },
  comparisonTitle: {
    ...TEXT_STYLES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  comparisonContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  comparisonImages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  comparisonImageContainer: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
  },
  comparisonImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  comparisonImageDate: {
    ...TEXT_STYLES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  comparisonStats: {
    borderRadius: 12,
  },
  comparisonStatsTitle: {
    ...TEXT_STYLES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  comparisonStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  comparisonStatLabel: {
    ...TEXT_STYLES.body2,
    color: COLORS.textSecondary,
  },
  comparisonStatValue: {
    ...TEXT_STYLES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  // Fullscreen Modal Styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  fullscreenClose: {
    position: 'absolute',
    top: StatusBar.currentHeight + SPACING.md,
    right: SPACING.lg,
    zIndex: 1000,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: width,
    height: height,
    resizeMode: 'contain',
  },
  fullscreenOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  fullscreenInfo: {
    alignItems: 'center',
  },
  fullscreenDate: {
    ...TEXT_STYLES.h6,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  fullscreenStats: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  fullscreenStat: {
    ...TEXT_STYLES.body1,
    color: 'rgba(255,255,255,0.9)',
    marginHorizontal: SPACING.md,
    fontWeight: '600',
  },
  fullscreenNotes: {
    ...TEXT_STYLES.body2,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  // FAB Styles
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default ProgressPhotos;