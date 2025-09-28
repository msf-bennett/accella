import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Vibration,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Surface,
  IconButton,
  Divider,
  Portal,
  Modal,
  TextInput,
  Chip,
  FAB,
  Badge,
  Avatar,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const Portfolio = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { portfolio } = useSelector(state => state.profile);

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    category: 'transformation',
    clientName: '',
    duration: '',
    results: '',
    images: [],
    videos: [],
    tags: [],
  });

  const [portfolioItems, setPortfolioItems] = useState([
    {
      id: '1',
      title: 'Amazing 12-Week Transformation',
      description: 'Client lost 30lbs and gained incredible strength through our comprehensive program.',
      category: 'transformation',
      clientName: 'Sarah M.',
      duration: '12 weeks',
      results: '30lbs lost, 25% body fat reduction',
      images: [
        'https://via.placeholder.com/300x200?text=Before',
        'https://via.placeholder.com/300x200?text=After'
      ],
      videos: ['workout_demo.mp4'],
      tags: ['Weight Loss', 'Strength Training', 'Nutrition'],
      date: '2024-01-15',
      likes: 45,
      views: 156,
      featured: true,
    },
    {
      id: '2',
      title: 'Athletic Performance Enhancement',
      description: 'Improved soccer player agility and speed by 40% in 8 weeks.',
      category: 'athletic',
      clientName: 'Mike R.',
      duration: '8 weeks',
      results: '40% speed increase, improved agility',
      images: [
        'https://via.placeholder.com/300x200?text=Training+Session',
        'https://via.placeholder.com/300x200?text=Performance+Test'
      ],
      videos: ['speed_training.mp4'],
      tags: ['Athletic Performance', 'Speed Training', 'Agility'],
      date: '2024-02-10',
      likes: 32,
      views: 98,
      featured: false,
    },
    {
      id: '3',
      title: 'Post-Injury Recovery Success',
      description: 'Complete rehabilitation from knee injury with full return to activities.',
      category: 'rehabilitation',
      clientName: 'Emily K.',
      duration: '16 weeks',
      results: 'Full recovery, pain-free movement',
      images: [
        'https://via.placeholder.com/300x200?text=Rehab+Exercise',
        'https://via.placeholder.com/300x200?text=Recovery+Progress'
      ],
      videos: ['rehab_routine.mp4'],
      tags: ['Rehabilitation', 'Injury Recovery', 'Functional Movement'],
      date: '2024-03-05',
      likes: 28,
      views: 87,
      featured: false,
    },
    {
      id: '4',
      title: 'Custom Workout Program Design',
      description: 'Innovative HIIT program designed for busy professionals.',
      category: 'program',
      clientName: '',
      duration: '4-week program',
      results: 'Increased efficiency, better results',
      images: [
        'https://via.placeholder.com/300x200?text=HIIT+Workout',
        'https://via.placeholder.com/300x200?text=Program+Design'
      ],
      videos: ['hiit_demo.mp4'],
      tags: ['HIIT', 'Program Design', 'Efficiency'],
      date: '2024-02-20',
      likes: 67,
      views: 234,
      featured: true,
    },
  ]);

  const [portfolioStats, setPortfolioStats] = useState({
    totalItems: 4,
    totalViews: 575,
    totalLikes: 172,
    featuredItems: 2,
    categories: {
      transformation: 1,
      athletic: 1,
      rehabilitation: 1,
      program: 1,
    },
  });

  const categories = [
    { key: 'all', label: 'All', icon: 'grid-view' },
    { key: 'transformation', label: 'Transformations', icon: 'trending-up' },
    { key: 'athletic', label: 'Athletic', icon: 'sports' },
    { key: 'rehabilitation', label: 'Rehab', icon: 'healing' },
    { key: 'program', label: 'Programs', icon: 'fitness-center' },
  ];

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = useCallback(() => {
    // Initialize portfolio from Redux store
    if (portfolio) {
      setPortfolioItems(portfolio.items || []);
      calculateStats(portfolio.items || []);
    }
  }, [portfolio]);

  const calculateStats = (items) => {
    const stats = {
      totalItems: items.length,
      totalViews: items.reduce((sum, item) => sum + item.views, 0),
      totalLikes: items.reduce((sum, item) => sum + item.likes, 0),
      featuredItems: items.filter(item => item.featured).length,
      categories: {},
    };

    categories.forEach(cat => {
      if (cat.key !== 'all') {
        stats.categories[cat.key] = items.filter(item => item.category === cat.key).length;
      }
    });

    setPortfolioStats(stats);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call for refreshing portfolio data
      setTimeout(() => {
        setRefreshing(false);
      }, 1500);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh portfolio data');
    }
  }, []);

  const handleAddPortfolioItem = useCallback(async () => {
    if (!portfolioForm.title || !portfolioForm.description) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    Vibration.vibrate(50);
    setIsUploading(true);

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newItem = {
        id: Date.now().toString(),
        ...portfolioForm,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        views: 0,
        featured: false,
      };

      setPortfolioItems(prev => [newItem, ...prev]);
      calculateStats([newItem, ...portfolioItems]);
      
      setPortfolioForm({
        title: '',
        description: '',
        category: 'transformation',
        clientName: '',
        duration: '',
        results: '',
        images: [],
        videos: [],
        tags: [],
      });

      setIsUploading(false);
      setShowAddModal(false);
      
      Alert.alert(
        'Portfolio Item Added! ✨',
        'Your portfolio item has been added successfully and is now visible to clients.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Error', 'Failed to add portfolio item. Please try again.');
    }
  }, [portfolioForm, portfolioItems]);

  const handleViewItem = useCallback((item) => {
    // Increment view count
    const updatedItems = portfolioItems.map(portfolioItem =>
      portfolioItem.id === item.id
        ? { ...portfolioItem, views: portfolioItem.views + 1 }
        : portfolioItem
    );
    setPortfolioItems(updatedItems);
    calculateStats(updatedItems);

    setSelectedItem(item);
    setShowDetailModal(true);
  }, [portfolioItems]);

  const handleToggleFeatured = useCallback((itemId) => {
    const updatedItems = portfolioItems.map(item =>
      item.id === itemId
        ? { ...item, featured: !item.featured }
        : item
    );
    setPortfolioItems(updatedItems);
    calculateStats(updatedItems);
    
    Vibration.vibrate(50);
    Alert.alert('Updated!', 'Portfolio item featured status updated.');
  }, [portfolioItems]);

  const handleDeleteItem = useCallback((itemId) => {
    Alert.alert(
      'Delete Portfolio Item',
      'Are you sure you want to delete this portfolio item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedItems = portfolioItems.filter(item => item.id !== itemId);
            setPortfolioItems(updatedItems);
            calculateStats(updatedItems);
            Vibration.vibrate(50);
          }
        }
      ]
    );
  }, [portfolioItems]);

  const getFilteredItems = () => {
    let filtered = portfolioItems;

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

    return filtered;
  };

  const renderOverviewCard = () => (
    <Card style={styles.card}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.overviewHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.overviewContent}>
          <Icon name="collections" size={48} color={COLORS.white} />
          <View style={styles.overviewText}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
              My Portfolio
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
              Showcase your success stories and expertise
            </Text>
          </View>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
              {portfolioStats.totalItems}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
              {portfolioStats.totalViews}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Views</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
              {portfolioStats.totalLikes}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Likes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
              {portfolioStats.featuredItems}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Featured</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContainer}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.categoryChip,
            selectedCategory === category.key && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory(category.key)}
        >
          <Icon
            name={category.icon}
            size={20}
            color={selectedCategory === category.key ? COLORS.white : COLORS.primary}
          />
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.key && styles.categoryTextActive
            ]}
          >
            {category.label}
          </Text>
          {category.key !== 'all' && portfolioStats.categories[category.key] > 0 && (
            <Badge
              style={[
                styles.categoryBadge,
                selectedCategory === category.key && { backgroundColor: COLORS.white }
              ]}
            >
              {portfolioStats.categories[category.key]}
            </Badge>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPortfolioItem = ({ item }) => (
    <Card style={styles.portfolioCard}>
      <TouchableOpacity onPress={() => handleViewItem(item)}>
        <View style={styles.portfolioImageContainer}>
          <Image
            source={{ uri: item.images[0] }}
            style={styles.portfolioImage}
            resizeMode="cover"
          />
          {item.featured && (
            <Surface style={styles.featuredBadge}>
              <Icon name="star" size={16} color={COLORS.warning} />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.warning, marginLeft: 4 }]}>
                Featured
              </Text>
            </Surface>
          )}
          <Surface style={styles.mediaCount}>
            <Icon name="photo-library" size={16} color={COLORS.white} />
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white, marginLeft: 4 }]}>
              {item.images.length}
            </Text>
          </Surface>
        </View>
      </TouchableOpacity>

      <Card.Content style={styles.portfolioContent}>
        <View style={styles.portfolioHeader}>
          <Text style={TEXT_STYLES.subtitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.portfolioActions}>
            <IconButton
              icon={item.featured ? 'star' : 'star-border'}
              size={20}
              iconColor={item.featured ? COLORS.warning : COLORS.textSecondary}
              onPress={() => handleToggleFeatured(item.id)}
            />
            <IconButton
              icon="dots-vertical"
              size={20}
              iconColor={COLORS.textSecondary}
              onPress={() => {
                Alert.alert(
                  'Portfolio Options',
                  'Choose an action:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Edit', onPress: () => Alert.alert('Feature in Development', 'Edit portfolio item is being developed.') },
                    { text: 'Delete', style: 'destructive', onPress: () => handleDeleteItem(item.id) },
                  ]
                );
              }}
            />
          </View>
        </View>

        <Text style={TEXT_STYLES.body} numberOfLines={3}>
          {item.description}
        </Text>

        {item.clientName && (
          <View style={styles.clientInfo}>
            <Icon name="person" size={16} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
              Client: {item.clientName}
            </Text>
          </View>
        )}

        <View style={styles.portfolioMeta}>
          <View style={styles.metaLeft}>
            <Chip mode="outlined" compact style={styles.categoryTag}>
              {categories.find(cat => cat.key === item.category)?.label || item.category}
            </Chip>
            {item.duration && (
              <Chip mode="outlined" compact style={styles.durationTag}>
                {item.duration}
              </Chip>
            )}
          </View>
          <View style={styles.metaRight}>
            <View style={styles.metaItem}>
              <Icon name="visibility" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                {item.views}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="favorite" size={16} color={COLORS.error} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                {item.likes}
              </Text>
            </View>
          </View>
        </View>

        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Chip key={index} mode="outlined" compact style={styles.tag}>
                {tag}
              </Chip>
            ))}
            {item.tags.length > 3 && (
              <Text style={TEXT_STYLES.caption}>+{item.tags.length - 3} more</Text>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderAddModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => !isUploading && setShowAddModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView>
          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
            Add Portfolio Item
          </Text>
          
          {isUploading ? (
            <View style={styles.uploadingContent}>
              <Icon name="cloud-upload" size={48} color={COLORS.primary} />
              <Text style={TEXT_STYLES.body}>Uploading portfolio item...</Text>
              <Text style={TEXT_STYLES.caption}>This may take a few moments</Text>
            </View>
          ) : (
            <>
              <TextInput
                label="Title *"
                value={portfolioForm.title}
                onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, title: text }))}
                style={styles.input}
                left={<TextInput.Icon icon="title" />}
              />

              <TextInput
                label="Description *"
                value={portfolioForm.description}
                onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, description: text }))}
                style={styles.input}
                multiline
                numberOfLines={4}
                left={<TextInput.Icon icon="description" />}
              />

              <View style={styles.categorySelector}>
                <Text style={TEXT_STYLES.body}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.slice(1).map((category) => (
                    <TouchableOpacity
                      key={category.key}
                      style={[
                        styles.categorySelectorItem,
                        portfolioForm.category === category.key && styles.categorySelectorActive
                      ]}
                      onPress={() => setPortfolioForm(prev => ({ ...prev, category: category.key }))}
                    >
                      <Icon
                        name={category.icon}
                        size={20}
                        color={portfolioForm.category === category.key ? COLORS.white : COLORS.primary}
                      />
                      <Text
                        style={[
                          styles.categorySelectorText,
                          portfolioForm.category === category.key && { color: COLORS.white }
                        ]}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TextInput
                label="Client Name (Optional)"
                value={portfolioForm.clientName}
                onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, clientName: text }))}
                style={styles.input}
                left={<TextInput.Icon icon="person" />}
              />

              <TextInput
                label="Duration"
                value={portfolioForm.duration}
                onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, duration: text }))}
                style={styles.input}
                placeholder="e.g., 12 weeks"
                left={<TextInput.Icon icon="schedule" />}
              />

              <TextInput
                label="Results Achieved"
                value={portfolioForm.results}
                onChangeText={(text) => setPortfolioForm(prev => ({ ...prev, results: text }))}
                style={styles.input}
                multiline
                numberOfLines={2}
                left={<TextInput.Icon icon="trending-up" />}
              />

              <Button
                mode="outlined"
                onPress={() => Alert.alert('Feature in Development', 'Media upload is being developed.')}
                style={styles.uploadButton}
                icon="photo-camera"
              >
                Add Photos & Videos
              </Button>

              <Button
                mode="outlined"
                onPress={() => Alert.alert('Feature in Development', 'Tag selection is being developed.')}
                style={styles.uploadButton}
                icon="label"
              >
                Add Tags
              </Button>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAddModal(false)}
                  style={[styles.modalButton, { marginRight: SPACING.md }]}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddPortfolioItem}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                >
                  Add to Portfolio
                </Button>
              </View>
            </>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={showDetailModal}
        onDismiss={() => setShowDetailModal(false)}
        contentContainerStyle={styles.detailModalContainer}
      >
        {selectedItem && (
          <ScrollView>
            <View style={styles.detailHeader}>
              <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
                {selectedItem.title}
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowDetailModal(false)}
              />
            </View>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageGallery}
            >
              {selectedItem.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            <View style={styles.detailContent}>
              <Text style={TEXT_STYLES.body}>{selectedItem.description}</Text>

              {selectedItem.clientName && (
                <View style={styles.detailRow}>
                  <Text style={TEXT_STYLES.subtitle}>Client:</Text>
                  <Text style={TEXT_STYLES.body}>{selectedItem.clientName}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={TEXT_STYLES.subtitle}>Duration:</Text>
                <Text style={TEXT_STYLES.body}>{selectedItem.duration}</Text>
              </View>

              {selectedItem.results && (
                <View style={styles.detailRow}>
                  <Text style={TEXT_STYLES.subtitle}>Results:</Text>
                  <Text style={TEXT_STYLES.body}>{selectedItem.results}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={TEXT_STYLES.subtitle}>Category:</Text>
                <Chip mode="outlined" compact>
                  {categories.find(cat => cat.key === selectedItem.category)?.label}
                </Chip>
              </View>

              {selectedItem.tags.length > 0 && (
                <View style={styles.detailTags}>
                  <Text style={TEXT_STYLES.subtitle}>Tags:</Text>
                  <View style={styles.tagsGrid}>
                    {selectedItem.tags.map((tag, index) => (
                      <Chip key={index} mode="outlined" compact style={styles.detailTag}>
                        {tag}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.detailStats}>
                <View style={styles.detailStat}>
                  <Icon name="visibility" size={20} color={COLORS.primary} />
                  <Text style={TEXT_STYLES.body}>{selectedItem.views} views</Text>
                </View>
                <View style={styles.detailStat}>
                  <Icon name="favorite" size={20} color={COLORS.error} />
                  <Text style={TEXT_STYLES.body}>{selectedItem.likes} likes</Text>
                </View>
                <View style={styles.detailStat}>
                  <Icon name="date-range" size={20} color={COLORS.textSecondary} />
                  <Text style={TEXT_STYLES.body}>
                    {new Date(selectedItem.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.detailActions}>
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Feature in Development', 'Sharing feature is being developed.')}
                style={styles.detailButton}
                icon="share"
              >
                Share
              </Button>
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Feature in Development', 'Edit feature is being developed.')}
                style={styles.detailButton}
                icon="edit"
              >
                Edit
              </Button>
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  const filteredItems = getFilteredItems();

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderOverviewCard()}
        
        <Searchbar
          placeholder="Search portfolio..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />

        {renderCategoryFilter()}

        <View style={styles.portfolioGrid}>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
            {selectedCategory === 'all' ? 'All Items' : 
             categories.find(cat => cat.key === selectedCategory)?.label} ({filteredItems.length})
          </Text>
          
          {filteredItems.length === 0 ? (
            <Surface style={styles.emptyState}>
              <Icon name="collections" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.subtitle, { color: COLORS.textSecondary }]}>
                {searchQuery ? 'No items match your search' : 'No portfolio items yet'}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {searchQuery ? 'Try a different search term' : 'Add your first portfolio item to get started'}
              </Text>
            </Surface>
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderPortfolioItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        color={COLORS.white}
      />

      {renderAddModal()}
      {renderDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  card: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 12,
  },
  overviewHeader: {
    padding: SPACING.lg,
    borderRadius: 12,
  },
  overviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  overviewText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
 searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  categoryScroll: {
    marginBottom: SPACING.lg,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontSize: 14,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  categoryBadge: {
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.primary,
  },
  portfolioGrid: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  portfolioCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 12,
  },
  portfolioImageContainer: {
    position: 'relative',
    height: 200,
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    elevation: 2,
  },
  mediaCount: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  portfolioContent: {
    padding: SPACING.md,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  portfolioActions: {
    flexDirection: 'row',
    marginLeft: SPACING.sm,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  portfolioMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  metaLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  categoryTag: {
    marginRight: SPACING.sm,
  },
  durationTag: {
    marginRight: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  tag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  
  // Modal Styles
  modalContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: 12,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.textPrimary,
  },
  uploadingContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  categorySelector: {
    marginBottom: SPACING.md,
  },
  categorySelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categorySelectorActive: {
    backgroundColor: COLORS.primary,
  },
  categorySelectorText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontSize: 14,
  },
  uploadButton: {
    marginBottom: SPACING.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
  },
  
  // Detail Modal Styles
  detailModalContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.sm,
    borderRadius: 12,
    maxHeight: '95%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  imageGallery: {
    height: 250,
    marginBottom: SPACING.md,
  },
  galleryImage: {
    width: width - (SPACING.sm * 2),
    height: 250,
  },
  detailContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  detailTags: {
    marginVertical: SPACING.md,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  detailTag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  detailStat: {
    alignItems: 'center',
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.lg,
  },
  detailButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
});

export default Portfolio;