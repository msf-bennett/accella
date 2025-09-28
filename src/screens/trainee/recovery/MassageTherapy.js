import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  Dimensions,
  TouchableOpacity,
  Text as RNText,
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
  Portal,
  Modal,
  Text,
  Divider,
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const MessageTherapy = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const recoveryData = useSelector(state => state.recovery.data);
  
  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [dailyProgress, setDailyProgress] = useState(0.7);
  const [streakCount, setStreakCount] = useState(12);
  const [loading, setLoading] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Recovery message categories
  const categories = [
    { id: 'all', label: 'All Messages', icon: 'message' },
    { id: 'motivation', label: 'Motivation', icon: 'trending-up' },
    { id: 'mindfulness', label: 'Mindfulness', icon: 'self-improvement' },
    { id: 'recovery', label: 'Recovery Tips', icon: 'healing' },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
    { id: 'sleep', label: 'Sleep', icon: 'bedtime' },
  ];
  
  // Sample therapeutic messages
  const therapeuticMessages = [
    {
      id: 1,
      category: 'motivation',
      title: 'Your Recovery Journey',
      message: 'Every rest day is a step forward. Your muscles grow stronger during recovery, not just during training. Trust the process! 💪',
      author: 'AI Recovery Coach',
      timestamp: '2 hours ago',
      likes: 24,
      type: 'daily_motivation',
      mood: 'energetic',
      duration: '2 min read',
      tags: ['motivation', 'rest-day', 'muscle-growth'],
    },
    {
      id: 2,
      category: 'mindfulness',
      title: 'Breathing Exercise',
      message: 'Take 5 deep breaths with me. Inhale strength, exhale tension. Your mind and body are working together for optimal recovery. 🧘‍♂️',
      author: 'Mindfulness Guide',
      timestamp: '4 hours ago',
      likes: 18,
      type: 'guided_exercise',
      mood: 'calm',
      duration: '5 min practice',
      tags: ['breathing', 'mindfulness', 'stress-relief'],
    },
    {
      id: 3,
      category: 'recovery',
      title: 'Active Recovery Tips',
      message: 'Light movement today promotes blood flow and reduces stiffness. Try a gentle walk or some dynamic stretching. Your body will thank you! 🚶‍♀️',
      author: 'Recovery Specialist',
      timestamp: '6 hours ago',
      likes: 31,
      type: 'recovery_tip',
      mood: 'encouraging',
      duration: '3 min read',
      tags: ['active-recovery', 'movement', 'circulation'],
    },
    {
      id: 4,
      category: 'nutrition',
      title: 'Post-Workout Nutrition',
      message: 'Your 30-minute recovery window is crucial. Protein helps rebuild, carbs restore energy. Fuel your progress wisely! 🥗',
      author: 'Nutrition Expert',
      timestamp: '8 hours ago',
      likes: 27,
      type: 'nutrition_tip',
      mood: 'informative',
      duration: '4 min read',
      tags: ['nutrition', 'post-workout', 'recovery-window'],
    },
    {
      id: 5,
      category: 'sleep',
      title: 'Sleep Quality Matters',
      message: 'Quality sleep is your superpower. 7-9 hours of deep sleep accelerates muscle repair and mental recovery. Sweet dreams! 😴',
      author: 'Sleep Specialist',
      timestamp: '12 hours ago',
      likes: 42,
      type: 'sleep_tip',
      mood: 'peaceful',
      duration: '3 min read',
      tags: ['sleep', 'recovery', 'muscle-repair'],
    },
  ];
  
  // Filter messages based on category and search
  const filteredMessages = therapeuticMessages.filter(msg => {
    const matchesCategory = selectedCategory === 'all' || msg.category === selectedCategory;
    const matchesSearch = msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  
  // Animation effects
  useEffect(() => {
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
    
    // Pulse animation for streak counter
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, []);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call for fresh messages
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchRecoveryMessages());
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Connection Error', 'Unable to refresh messages. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);
  
  const handleMessagePress = useCallback((message) => {
    setSelectedMessage(message);
    setShowModal(true);
    Vibration.vibrate(30);
  }, []);
  
  const handleLikeMessage = useCallback((messageId) => {
    // dispatch(likeMessage(messageId));
    Vibration.vibrate(25);
  }, []);
  
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    Vibration.vibrate(20);
  }, []);
  
  const getMoodColor = (mood) => {
    switch (mood) {
      case 'energetic': return COLORS.primary;
      case 'calm': return '#4CAF50';
      case 'encouraging': return '#FF9800';
      case 'informative': return '#2196F3';
      case 'peaceful': return '#9C27B0';
      default: return COLORS.primary;
    }
  };
  
  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'energetic': return 'flash-on';
      case 'calm': return 'spa';
      case 'encouraging': return 'thumb-up';
      case 'informative': return 'info';
      case 'peaceful': return 'nights-stay';
      default: return 'favorite';
    }
  };
  
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Recovery Therapy</Text>
            <Text style={styles.headerSubtitle}>Heal • Grow • Thrive</Text>
          </View>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Surface style={styles.streakBadge}>
              <Icon name="local-fire-department" size={20} color={COLORS.error} />
              <Text style={styles.streakText}>{streakCount}</Text>
            </Surface>
          </Animated.View>
        </View>
        
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Today's Recovery Progress</Text>
          <ProgressBar
            progress={dailyProgress}
            color="#ffffff"
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>{Math.round(dailyProgress * 100)}% Complete</Text>
        </View>
      </View>
    </LinearGradient>
  );
  
  const renderCategoryChips = () => (
    <View style={styles.categoryContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            mode={selectedCategory === category.id ? 'flat' : 'outlined'}
            selected={selectedCategory === category.id}
            onPress={() => handleCategoryChange(category.id)}
            icon={category.icon}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategoryChip,
            ]}
            textStyle={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText,
            ]}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
  
  const renderMessageCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        onPress={() => handleMessagePress(item)}
        activeOpacity={0.8}
      >
        <Card style={styles.messageCard}>
          <Card.Content style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <View style={styles.messageInfo}>
                <Surface style={[styles.moodIndicator, { backgroundColor: getMoodColor(item.mood) }]}>
                  <Icon name={getMoodIcon(item.mood)} size={16} color="#ffffff" />
                </Surface>
                <View style={styles.messageDetails}>
                  <Text style={styles.messageTitle}>{item.title}</Text>
                  <Text style={styles.messageAuthor}>{item.author}</Text>
                </View>
              </View>
              <View style={styles.messageActions}>
                <Text style={styles.messageDuration}>{item.duration}</Text>
                <IconButton
                  icon="favorite"
                  size={20}
                  iconColor={COLORS.error}
                  onPress={() => handleLikeMessage(item.id)}
                />
              </View>
            </View>
            
            <Text style={styles.messageText} numberOfLines={3}>
              {item.message}
            </Text>
            
            <View style={styles.messageFooter}>
              <View style={styles.messageTags}>
                {item.tags.slice(0, 2).map((tag, idx) => (
                  <Chip
                    key={idx}
                    mode="outlined"
                    compact
                    style={styles.tagChip}
                    textStyle={styles.tagText}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
              <View style={styles.messageStats}>
                <Icon name="favorite" size={14} color={COLORS.error} />
                <Text style={styles.likesText}>{item.likes}</Text>
                <Text style={styles.timestampText}>{item.timestamp}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
  
  const renderMessageModal = () => (
    <Portal>
      <Modal
        visible={showModal}
        onDismiss={() => setShowModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurContainer} blurType="dark" blurAmount={10}>
          {selectedMessage && (
            <Surface style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitle}>
                  <Surface style={[styles.moodIndicator, { backgroundColor: getMoodColor(selectedMessage.mood) }]}>
                    <Icon name={getMoodIcon(selectedMessage.mood)} size={20} color="#ffffff" />
                  </Surface>
                  <View>
                    <Text style={styles.modalMessageTitle}>{selectedMessage.title}</Text>
                    <Text style={styles.modalMessageAuthor}>{selectedMessage.author}</Text>
                  </View>
                </View>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowModal(false)}
                />
              </View>
              
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalMessageText}>{selectedMessage.message}</Text>
                
                <View style={styles.modalTags}>
                  {selectedMessage.tags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      mode="flat"
                      style={styles.modalTagChip}
                      textStyle={styles.modalTagText}
                    >
                      #{tag}
                    </Chip>
                  ))}
                </View>
                
                <Divider style={styles.modalDivider} />
                
                <View style={styles.modalActions}>
                  <Button
                    mode="contained"
                    icon="bookmark"
                    onPress={() => {
                      // dispatch(saveMessage(selectedMessage.id));
                      Alert.alert('Saved!', 'Message saved to your favorites.');
                    }}
                    style={styles.modalActionButton}
                  >
                    Save Message
                  </Button>
                  <Button
                    mode="outlined"
                    icon="share"
                    onPress={() => {
                      Alert.alert('Feature Coming Soon', 'Message sharing will be available in the next update!');
                    }}
                    style={styles.modalActionButton}
                  >
                    Share
                  </Button>
                </View>
              </ScrollView>
            </Surface>
          )}
        </BlurView>
      </Modal>
    </Portal>
  );
  
  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Surface style={styles.quickActionsCard}>
        <Text style={styles.quickActionsTitle}>Quick Recovery Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => Alert.alert('Feature Coming Soon', 'Guided meditation will be available soon!')}
          >
            <Icon name="self-improvement" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Meditate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => Alert.alert('Feature Coming Soon', 'Stretch guide will be available soon!')}
          >
            <Icon name="accessibility" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Stretch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => Alert.alert('Feature Coming Soon', 'Hydration tracking will be available soon!')}
          >
            <Icon name="local-drink" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Hydrate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => Alert.alert('Feature Coming Soon', 'Sleep optimization will be available soon!')}
          >
            <Icon name="bedtime" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Sleep</Text>
          </TouchableOpacity>
        </View>
      </Surface>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor="#ffffff"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search recovery messages..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
        </View>
        
        {renderCategoryChips()}
        {renderQuickActions()}
        
        <View style={styles.messagesContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Messages' : categories.find(c => c.id === selectedCategory)?.label} 
            ({filteredMessages.length})
          </Text>
          
          {filteredMessages.length === 0 ? (
            <Surface style={styles.emptyState}>
              <Icon name="sentiment-very-satisfied" size={48} color={COLORS.primary} />
              <Text style={styles.emptyStateTitle}>No messages found</Text>
              <Text style={styles.emptyStateText}>Try adjusting your search or category filter</Text>
            </Surface>
          ) : (
            filteredMessages.map((message, index) => (
              <View key={message.id}>
                {renderMessageCard({ item: message, index })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      
      {renderMessageModal()}
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Feature Coming Soon', 'Create custom recovery plans coming soon!')}
        color="#ffffff"
      />
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
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
  headerContent: {
    marginTop: SPACING.small,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    elevation: 3,
  },
  streakText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  progressSection: {
    marginTop: SPACING.small,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoryContainer: {
    marginVertical: SPACING.small,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.medium,
  },
  categoryChip: {
    marginRight: SPACING.small,
    backgroundColor: '#ffffff',
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  quickActionsContainer: {
    paddingHorizontal: SPACING.medium,
    marginVertical: SPACING.small,
  },
  quickActionsCard: {
    padding: SPACING.medium,
    borderRadius: 12,
    elevation: 2,
  },
  quickActionsTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.medium,
    color: COLORS.text,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionItem: {
    alignItems: 'center',
    padding: SPACING.small,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    color: COLORS.text,
  },
  messagesContainer: {
    paddingHorizontal: SPACING.medium,
    marginTop: SPACING.medium,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    marginBottom: SPACING.medium,
    color: COLORS.text,
  },
  messageCard: {
    marginBottom: SPACING.medium,
    borderRadius: 12,
    elevation: 3,
  },
  messageContent: {
    padding: SPACING.medium,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.small,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moodIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.small,
  },
  messageDetails: {
    flex: 1,
  },
  messageTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  messageAuthor: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  messageActions: {
    alignItems: 'flex-end',
  },
  messageDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  messageText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 22,
    marginVertical: SPACING.small,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  messageTags: {
    flexDirection: 'row',
    flex: 1,
  },
  tagChip: {
    marginRight: SPACING.xs,
    height: 24,
  },
  tagText: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
  },
  messageStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    marginRight: SPACING.small,
  },
  timestampText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.medium,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalMessageTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginLeft: SPACING.small,
  },
  modalMessageAuthor: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.small,
    marginTop: SPACING.xs,
  },
  modalBody: {
    padding: SPACING.medium,
  },
  modalMessageText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.medium,
  },
  modalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.medium,
  },
  modalTagChip: {
    marginRight: SPACING.small,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primary,
  },
  modalTagText: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
  },
  modalDivider: {
    marginVertical: SPACING.medium,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalActionButton: {
    flex: 0.45,
  },
  emptyState: {
    padding: SPACING.large,
    alignItems: 'center',
    borderRadius: 12,
    elevation: 1,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginTop: SPACING.medium,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.small,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MessageTherapy;