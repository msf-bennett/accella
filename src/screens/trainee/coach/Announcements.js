import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const AnnouncementsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, userRole } = useSelector(state => state.auth);
  const { announcements, loading } = useSelector(state => state.announcements);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium',
    targetAudience: 'all',
    scheduledDate: null,
  });
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Mock data for development
  const mockAnnouncements = [
    {
      id: 1,
      title: '🏆 New Training Program Launch!',
      content: 'We\'re excited to announce our new 12-week strength and conditioning program designed specifically for football players. This comprehensive program includes personalized meal plans, recovery protocols, and performance tracking.',
      author: 'Coach Sarah Johnson',
      authorAvatar: 'https://example.com/avatar1.jpg',
      timestamp: '2 hours ago',
      priority: 'high',
      type: 'program',
      likes: 24,
      comments: 8,
      isLiked: false,
      tags: ['Training', 'Football', 'Strength'],
      targetAudience: 'all',
    },
    {
      id: 2,
      title: '⚠️ Schedule Update - Tomorrow\'s Session',
      content: 'Due to weather conditions, tomorrow\'s outdoor training session has been moved to the indoor facility. Please bring your indoor shoes and arrive 15 minutes early for equipment setup.',
      author: 'Coach Mike Thompson',
      authorAvatar: 'https://example.com/avatar2.jpg',
      timestamp: '4 hours ago',
      priority: 'urgent',
      type: 'schedule',
      likes: 12,
      comments: 3,
      isLiked: true,
      tags: ['Schedule', 'Weather', 'Important'],
      targetAudience: 'players',
    },
    {
      id: 3,
      title: '🎯 Weekly Challenge: Consistency Points',
      content: 'This week\'s challenge focuses on consistency! Earn double points for completing all scheduled sessions. Current leaderboard: Alex (180pts), Maria (165pts), Jake (150pts). Keep pushing! 💪',
      author: 'Coach Emma Wilson',
      authorAvatar: 'https://example.com/avatar3.jpg',
      timestamp: '1 day ago',
      priority: 'medium',
      type: 'challenge',
      likes: 36,
      comments: 15,
      isLiked: false,
      tags: ['Challenge', 'Points', 'Motivation'],
      targetAudience: 'all',
    },
    {
      id: 4,
      title: '📊 Monthly Performance Report Available',
      content: 'Your personalized monthly performance reports are now available in the dashboard. Review your progress, achievements, and areas for improvement. Great work everyone!',
      author: 'System',
      authorAvatar: null,
      timestamp: '2 days ago',
      priority: 'low',
      type: 'report',
      likes: 18,
      comments: 5,
      isLiked: false,
      tags: ['Report', 'Progress', 'Analytics'],
      targetAudience: 'all',
    },
  ];

  // Initialize component
  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent', true);
      StatusBar.setTranslucent(true);
    }

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Load announcements
    loadAnnouncements();
  }, []);

  // Filter announcements based on search and filters
  useEffect(() => {
    let filtered = mockAnnouncements;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(announcement => announcement.type === selectedFilter);
    }

    setFilteredAnnouncements(filtered);
  }, [searchQuery, selectedFilter]);

  const loadAnnouncements = useCallback(async () => {
    try {
      // Simulate API call
      // dispatch(fetchAnnouncements());
      setFilteredAnnouncements(mockAnnouncements);
    } catch (error) {
      console.error('Error loading announcements:', error);
      Alert.alert('Error', 'Failed to load announcements. Please try again.');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  }, [loadAnnouncements]);

  const handleLikePress = (announcementId) => {
    Vibration.vibrate(50);
    // dispatch(toggleAnnouncementLike(announcementId));
    Alert.alert('Feature Coming Soon', 'Like functionality will be available in the next update! 👍');
  };

  const handleCommentPress = (announcement) => {
    Alert.alert('Feature Coming Soon', 'Comment functionality will be available in the next update! 💬');
  };

  const handleSharePress = (announcement) => {
    Alert.alert('Feature Coming Soon', 'Share functionality will be available in the next update! 📤');
  };

  const handleCreateAnnouncement = () => {
    if (userRole !== 'coach' && userRole !== 'trainer') {
      Alert.alert('Access Denied', 'Only coaches and trainers can create announcements.');
      return;
    }

    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      Alert.alert('Validation Error', 'Please fill in both title and content fields.');
      return;
    }

    // dispatch(createAnnouncement(newAnnouncement));
    setShowCreateModal(false);
    setNewAnnouncement({
      title: '',
      content: '',
      priority: 'medium',
      targetAudience: 'all',
      scheduledDate: null,
    });
    
    Alert.alert('Success', 'Announcement created successfully! 🎉');
    Vibration.vibrate([100, 50, 100]);
  };

  const toggleCardExpansion = (cardId) => {
    const newExpandedCards = new Set(expandedCards);
    if (expandedCards.has(cardId)) {
      newExpandedCards.delete(cardId);
    } else {
      newExpandedCards.add(cardId);
    }
    setExpandedCards(newExpandedCards);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return COLORS.error;
      case 'high': return COLORS.warning;
      case 'medium': return COLORS.primary;
      case 'low': return COLORS.textSecondary;
      default: return COLORS.primary;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return 'priority-high';
      case 'high': return 'keyboard-arrow-up';
      case 'medium': return 'remove';
      case 'low': return 'keyboard-arrow-down';
      default: return 'remove';
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>📢 Announcements</Text>
            <Text style={styles.headerSubtitle}>
              {filteredAnnouncements.length} updates available
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="notifications"
              iconColor={COLORS.surface}
              size={24}
              onPress={() => Alert.alert('Feature Coming Soon', 'Notification settings will be available soon!')}
            />
            {(userRole === 'coach' || userRole === 'trainer') && (
              <IconButton
                icon="add"
                iconColor={COLORS.surface}
                size={24}
                onPress={() => setShowCreateModal(true)}
              />
            )}
          </View>
        </View>

        <Searchbar
          placeholder="Search announcements..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {[
            { key: 'all', label: 'All', icon: 'list' },
            { key: 'program', label: 'Programs', icon: 'fitness-center' },
            { key: 'schedule', label: 'Schedule', icon: 'schedule' },
            { key: 'challenge', label: 'Challenges', icon: 'jump-rope' },
            { key: 'report', label: 'Reports', icon: 'analytics' },
          ].map((filter) => (
            <Chip
              key={filter.key}
              selected={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.selectedFilterChip
              ]}
              textStyle={[
                styles.filterChipText,
                selectedFilter === filter.key && styles.selectedFilterChipText
              ]}
              icon={filter.icon}
            >
              {filter.label}
            </Chip>
          ))}
        </ScrollView>
      </View>
    </LinearGradient>
  );

  const renderAnnouncementCard = (announcement) => {
    const isExpanded = expandedCards.has(announcement.id);
    const contentPreview = announcement.content.length > 120 
      ? announcement.content.substring(0, 120) + '...' 
      : announcement.content;

    return (
      <Animated.View
        key={announcement.id}
        style={[
          styles.cardContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Card style={styles.announcementCard}>
          <Card.Content>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.authorInfo}>
                {announcement.authorAvatar ? (
                  <Avatar.Image size={40} source={{ uri: announcement.authorAvatar }} />
                ) : (
                  <Avatar.Icon size={40} icon="account" />
                )}
                <View style={styles.authorDetails}>
                  <Text style={styles.authorName}>{announcement.author}</Text>
                  <Text style={styles.timestamp}>{announcement.timestamp}</Text>
                </View>
              </View>
              
              <View style={styles.cardHeaderActions}>
                <Chip
                  icon={getPriorityIcon(announcement.priority)}
                  style={[
                    styles.priorityChip,
                    { backgroundColor: getPriorityColor(announcement.priority) }
                  ]}
                  textStyle={styles.priorityChipText}
                >
                  {announcement.priority.toUpperCase()}
                </Chip>
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => Alert.alert('Feature Coming Soon', 'More options will be available soon!')}
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.announcementTitle}>{announcement.title}</Text>

            {/* Content */}
            <Text style={styles.announcementContent}>
              {isExpanded ? announcement.content : contentPreview}
            </Text>
            
            {announcement.content.length > 120 && (
              <TouchableOpacity 
                onPress={() => toggleCardExpansion(announcement.id)}
                style={styles.readMoreButton}
              >
                <Text style={styles.readMoreText}>
                  {isExpanded ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {announcement.tags.map((tag, index) => (
                <Chip
                  key={index}
                  style={styles.tagChip}
                  textStyle={styles.tagText}
                  compact
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </Card.Content>

          {/* Actions */}
          <Card.Actions style={styles.cardActions}>
            <View style={styles.actionStats}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleLikePress(announcement.id)}
              >
                <Icon
                  name={announcement.isLiked ? "favorite" : "favorite-border"}
                  size={20}
                  color={announcement.isLiked ? COLORS.error : COLORS.textSecondary}
                />
                <Text style={styles.actionText}>{announcement.likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCommentPress(announcement)}
              >
                <Icon name="chat-bubble-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.actionText}>{announcement.comments}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => handleSharePress(announcement)}
            >
              <Icon name="share" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  const renderCreateModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Announcement</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowCreateModal(false)}
              />
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.titleInput}
                placeholder="Announcement title..."
                value={newAnnouncement.title}
                onChangeText={(text) => setNewAnnouncement({ ...newAnnouncement, title: text })}
                maxLength={100}
              />

              <TextInput
                style={styles.contentInput}
                placeholder="Write your announcement content here..."
                value={newAnnouncement.content}
                onChangeText={(text) => setNewAnnouncement({ ...newAnnouncement, content: text })}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
              />

              <View style={styles.modalOptions}>
                <Text style={styles.optionLabel}>Priority Level:</Text>
                <View style={styles.priorityOptions}>
                  {['low', 'medium', 'high', 'urgent'].map((priority) => (
                    <Chip
                      key={priority}
                      selected={newAnnouncement.priority === priority}
                      onPress={() => setNewAnnouncement({ ...newAnnouncement, priority })}
                      style={[
                        styles.optionChip,
                        newAnnouncement.priority === priority && styles.selectedOptionChip
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.modalOptions}>
                <Text style={styles.optionLabel}>Target Audience:</Text>
                <View style={styles.priorityOptions}>
                  {['all', 'players', 'parents'].map((audience) => (
                    <Chip
                      key={audience}
                      selected={newAnnouncement.targetAudience === audience}
                      onPress={() => setNewAnnouncement({ ...newAnnouncement, targetAudience: audience })}
                      style={[
                        styles.optionChip,
                        newAnnouncement.targetAudience === audience && styles.selectedOptionChip
                      ]}
                    >
                      {audience.charAt(0).toUpperCase() + audience.slice(1)}
                    </Chip>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowCreateModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateAnnouncement}
                style={styles.createButton}
                buttonColor={COLORS.primary}
              >
                Create
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="campaign" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No announcements found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery ? 'Try adjusting your search terms' : 'Check back later for updates'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ProgressBar indeterminate color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading announcements...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
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
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => renderAnnouncementCard(announcement))
          ) : (
            renderEmptyState()
          )}
          
          <View style={styles.contentPadding} />
        </ScrollView>
      )}

      {(userRole === 'coach' || userRole === 'trainer') && (
        <FAB
          style={styles.fab}
          icon="add"
          onPress={() => setShowCreateModal(true)}
          color={COLORS.surface}
        />
      )}

      {renderCreateModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 0,
    marginBottom: SPACING.md,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingBottom: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.surface,
  },
  filterChipText: {
    color: COLORS.surface,
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  cardContainer: {
    marginVertical: SPACING.sm,
  },
  announcementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  authorName: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.text,
  },
  timestamp: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  cardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityChip: {
    height: 28,
    marginRight: SPACING.xs,
  },
  priorityChipText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  announcementTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  announcementContent: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  readMoreText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  tagChip: {
    backgroundColor: COLORS.background,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 28,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  cardActions: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionStats: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  shareButton: {
    padding: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  loadingText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
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
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
  },
  modalBody: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    minHeight: 120,
  },
  modalOptions: {
    marginBottom: SPACING.lg,
  },
  optionLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  priorityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  selectedOptionChip: {
    backgroundColor: COLORS.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 0.4,
    borderColor: COLORS.textSecondary,
  },
  createButton: {
    flex: 0.4,
  },
  contentPadding: {
    height: 100, // Extra space for FAB
  },
});

export default AnnouncementsScreen;