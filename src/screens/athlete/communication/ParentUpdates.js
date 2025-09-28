import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
  Animated,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Badge,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Portal, Modal } from 'react-native-paper';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e1e8ed',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const ParentUpdates = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = new Animated.Value(0);

  // Mock data for parent updates
  const [updates, setUpdates] = useState([
    {
      id: 1,
      type: 'performance',
      title: 'Great Progress in Speed Training! 🏃‍♂️',
      coach: 'Coach Mike Johnson',
      coachAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      childName: 'Alex',
      date: '2025-08-22',
      time: '14:30',
      content: 'Alex showed excellent improvement in the 40-yard dash today, dropping his time from 5.8s to 5.5s! His dedication to the conditioning drills is really paying off. Keep encouraging him to maintain this momentum.',
      category: 'Speed Training',
      importance: 'high',
      isRead: false,
      attachments: ['video_drill_demo.mp4'],
      metrics: {
        previousTime: '5.8s',
        newTime: '5.5s',
        improvement: '-0.3s',
      },
    },
    {
      id: 2,
      type: 'attendance',
      title: 'Perfect Attendance This Week! ⭐',
      coach: 'Coach Sarah Williams',
      coachAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      childName: 'Alex',
      date: '2025-08-21',
      time: '18:45',
      content: 'Alex has maintained perfect attendance this week and shows great enthusiasm during training sessions. His positive attitude is infectious and motivates other players too!',
      category: 'Attendance',
      importance: 'medium',
      isRead: true,
      streak: 14,
    },
    {
      id: 3,
      type: 'nutrition',
      title: 'Nutrition Reminder 🥗',
      coach: 'Nutritionist Emma Davis',
      coachAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      childName: 'Alex',
      date: '2025-08-21',
      time: '10:15',
      content: 'Remember to ensure Alex has his pre-workout snack 30 minutes before training. The banana and peanut butter combination we discussed works perfectly for sustained energy.',
      category: 'Nutrition',
      importance: 'medium',
      isRead: true,
      recommendations: ['Banana + Peanut Butter', 'Hydration 2hrs before', 'Post-workout protein'],
    },
    {
      id: 4,
      type: 'injury_prevention',
      title: 'Injury Prevention Update ⚠️',
      coach: 'Physiotherapist Dr. James',
      coachAvatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      childName: 'Alex',
      date: '2025-08-20',
      time: '16:20',
      content: 'Alex had minor muscle tightness after yesterdays session. We did some stretching and applied ice. Please ensure he does his mobility exercises at home as prescribed.',
      category: 'Injury Prevention',
      importance: 'high',
      isRead: false,
      exercises: ['Hip Flexor Stretch', 'Calf Stretch', 'Hamstring Stretch'],
    },
    {
      id: 5,
      type: 'achievement',
      title: 'New Personal Best! 🏆',
      coach: 'Coach Mike Johnson',
      coachAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      childName: 'Alex',
      date: '2025-08-19',
      time: '15:45',
      content: 'Alex achieved a new personal best in vertical jump today - 32 inches! This is a 4-inch improvement from last month. His dedication to plyometric training is showing excellent results.',
      category: 'Achievement',
      importance: 'high',
      isRead: true,
      achievement: 'Vertical Jump PB',
      previousRecord: '28 inches',
      newRecord: '32 inches',
    },
  ]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    // Simulate API call
    setTimeout(() => {
      Alert.alert(
        '🔄 Updates Refreshed',
        'Latest updates from coaches have been loaded!',
        [{ text: 'Great! 👍', style: 'default' }]
      );
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleUpdatePress = (update) => {
    Vibration.vibrate(30);
    setSelectedUpdate(update);
    setModalVisible(true);
    
    // Mark as read
    if (!update.isRead) {
      setUpdates(prev => 
        prev.map(u => u.id === update.id ? { ...u, isRead: true } : u)
      );
    }
  };

  const getUpdateIcon = (type) => {
    switch (type) {
      case 'performance': return 'trending-up';
      case 'attendance': return 'event-available';
      case 'nutrition': return 'restaurant';
      case 'injury_prevention': return 'health-and-safety';
      case 'achievement': return 'jump-rope';
      default: return 'info';
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  const filteredUpdates = updates.filter(update => {
    const matchesSearch = update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         update.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         update.coach.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'unread' && !update.isRead) ||
                         (selectedFilter === 'high' && update.importance === 'high') ||
                         update.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = updates.filter(u => !u.isRead).length;

  const renderUpdateCard = (update) => (
    <TouchableOpacity
      key={update.id}
      onPress={() => handleUpdatePress(update)}
      activeOpacity={0.7}
    >
      <Card style={[styles.updateCard, !update.isRead && styles.unreadCard]}>
        <Card.Content>
          <View style={styles.updateHeader}>
            <View style={styles.updateInfo}>
              <Avatar.Image 
                size={40} 
                source={{ uri: update.coachAvatar }}
                style={styles.coachAvatar}
              />
              <View style={styles.updateMeta}>
                <Text style={[TEXT_STYLES.body, styles.updateTitle]} numberOfLines={1}>
                  {update.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.coachName]}>
                  {update.coach} • {update.childName}
                </Text>
              </View>
            </View>
            <View style={styles.updateActions}>
              {!update.isRead && (
                <Badge size={8} style={[styles.unreadBadge, { backgroundColor: getImportanceColor(update.importance) }]} />
              )}
              <Icon 
                name={getUpdateIcon(update.type)} 
                size={24} 
                color={getImportanceColor(update.importance)} 
              />
            </View>
          </View>
          
          <Text style={[TEXT_STYLES.caption, styles.updateContent]} numberOfLines={2}>
            {update.content}
          </Text>
          
          <View style={styles.updateFooter}>
            <Chip 
              mode="outlined" 
              compact 
              style={styles.categoryChip}
              textStyle={styles.chipText}
            >
              {update.category}
            </Chip>
            <Text style={[TEXT_STYLES.caption, styles.updateTime]}>
              {update.date} • {update.time}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderUpdateModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedUpdate && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Icon 
                      name={getUpdateIcon(selectedUpdate.type)} 
                      size={28} 
                      color={getImportanceColor(selectedUpdate.importance)} 
                    />
                    <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
                      {selectedUpdate.title}
                    </Text>
                  </View>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  />
                </View>

                <Surface style={styles.coachInfoCard}>
                  <View style={styles.coachInfo}>
                    <Avatar.Image 
                      size={50} 
                      source={{ uri: selectedUpdate.coachAvatar }}
                    />
                    <View style={styles.coachDetails}>
                      <Text style={[TEXT_STYLES.body, styles.coachNameModal]}>
                        {selectedUpdate.coach}
                      </Text>
                      <Text style={[TEXT_STYLES.caption]}>
                        Update for {selectedUpdate.childName} • {selectedUpdate.date} at {selectedUpdate.time}
                      </Text>
                    </View>
                  </View>
                </Surface>

                <Surface style={styles.contentCard}>
                  <Text style={[TEXT_STYLES.body, styles.modalContentText]}>
                    {selectedUpdate.content}
                  </Text>
                </Surface>

                {selectedUpdate.metrics && (
                  <Surface style={styles.metricsCard}>
                    <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                      Performance Metrics 📊
                    </Text>
                    <View style={styles.metricsRow}>
                      <View style={styles.metricItem}>
                        <Text style={[TEXT_STYLES.caption]}>Previous</Text>
                        <Text style={[TEXT_STYLES.body, styles.metricValue]}>
                          {selectedUpdate.metrics.previousTime}
                        </Text>
                      </View>
                      <Icon name="arrow-forward" size={24} color={COLORS.success} />
                      <View style={styles.metricItem}>
                        <Text style={[TEXT_STYLES.caption]}>New Time</Text>
                        <Text style={[TEXT_STYLES.body, styles.metricValueNew]}>
                          {selectedUpdate.metrics.newTime}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.improvementBadge}>
                      <Text style={[TEXT_STYLES.caption, styles.improvementText]}>
                        Improvement: {selectedUpdate.metrics.improvement}
                      </Text>
                    </View>
                  </Surface>
                )}

                {selectedUpdate.streak && (
                  <Surface style={styles.streakCard}>
                    <View style={styles.streakInfo}>
                      <Icon name="local-fire-department" size={32} color={COLORS.warning} />
                      <View>
                        <Text style={[TEXT_STYLES.h3, styles.streakNumber]}>
                          {selectedUpdate.streak} Days
                        </Text>
                        <Text style={[TEXT_STYLES.caption]}>Perfect Attendance Streak!</Text>
                      </View>
                    </View>
                  </Surface>
                )}

                {selectedUpdate.recommendations && (
                  <Surface style={styles.recommendationsCard}>
                    <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                      Recommendations 💡
                    </Text>
                    {selectedUpdate.recommendations.map((rec, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <Icon name="check-circle" size={20} color={COLORS.success} />
                        <Text style={[TEXT_STYLES.body, styles.recommendationText]}>
                          {rec}
                        </Text>
                      </View>
                    ))}
                  </Surface>
                )}

                {selectedUpdate.exercises && (
                  <Surface style={styles.exercisesCard}>
                    <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                      Prescribed Exercises 🏋️‍♂️
                    </Text>
                    {selectedUpdate.exercises.map((exercise, index) => (
                      <View key={index} style={styles.exerciseItem}>
                        <Icon name="fitness-center" size={20} color={COLORS.primary} />
                        <Text style={[TEXT_STYLES.body, styles.exerciseText]}>
                          {exercise}
                        </Text>
                      </View>
                    ))}
                  </Surface>
                )}

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      Alert.alert('📞 Contact Coach', 'Feature coming soon!');
                      Vibration.vibrate(50);
                    }}
                    style={styles.actionButton}
                    icon="phone"
                  >
                    Contact Coach
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      Alert.alert('💬 Send Message', 'Feature coming soon!');
                      Vibration.vibrate(50);
                    }}
                    style={[styles.actionButton, styles.primaryButton]}
                    buttonColor={COLORS.primary}
                    icon="message"
                  >
                    Reply
                  </Button>
                </View>
              </>
            )}
          </ScrollView>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
          Parent Updates 👨‍👩‍👧‍👦
        </Text>
        <Text style={[TEXT_STYLES.caption, styles.headerSubtitle]}>
          Stay updated on your child's progress
        </Text>
        {unreadCount > 0 && (
          <View style={styles.unreadCountContainer}>
            <Badge style={styles.unreadCountBadge}>{unreadCount}</Badge>
            <Text style={[TEXT_STYLES.caption, styles.unreadCountText]}>
              New Updates
            </Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search updates, coaches, or topics..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />

        <ScrollView 
          horizontal 
          style={styles.filterContainer}
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => setSelectedFilter('all')}>
            <Chip 
              selected={selectedFilter === 'all'}
              onPress={() => setSelectedFilter('all')}
              style={[styles.filterChip, selectedFilter === 'all' && styles.selectedChip]}
              textStyle={selectedFilter === 'all' ? styles.selectedChipText : styles.chipText}
            >
              All Updates
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSelectedFilter('unread')}>
            <Chip 
              selected={selectedFilter === 'unread'}
              onPress={() => setSelectedFilter('unread')}
              style={[styles.filterChip, selectedFilter === 'unread' && styles.selectedChip]}
              textStyle={selectedFilter === 'unread' ? styles.selectedChipText : styles.chipText}
            >
              Unread ({unreadCount})
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSelectedFilter('high')}>
            <Chip 
              selected={selectedFilter === 'high'}
              onPress={() => setSelectedFilter('high')}
              style={[styles.filterChip, selectedFilter === 'high' && styles.selectedChip]}
              textStyle={selectedFilter === 'high' ? styles.selectedChipText : styles.chipText}
            >
              High Priority
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSelectedFilter('performance')}>
            <Chip 
              selected={selectedFilter === 'performance'}
              onPress={() => setSelectedFilter('performance')}
              style={[styles.filterChip, selectedFilter === 'performance' && styles.selectedChip]}
              textStyle={selectedFilter === 'performance' ? styles.selectedChipText : styles.chipText}
            >
              Performance
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSelectedFilter('achievement')}>
            <Chip 
              selected={selectedFilter === 'achievement'}
              onPress={() => setSelectedFilter('achievement')}
              style={[styles.filterChip, selectedFilter === 'achievement' && styles.selectedChip]}
              textStyle={selectedFilter === 'achievement' ? styles.selectedChipText : styles.chipText}
            >
              Achievements
            </Chip>
          </TouchableOpacity>
        </ScrollView>

        <Animated.View style={[styles.updatesContainer, { opacity: fadeAnim }]}>
          <ScrollView
            style={styles.updatesList}
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
            {filteredUpdates.length > 0 ? (
              filteredUpdates.map(renderUpdateCard)
            ) : (
              <Surface style={styles.emptyState}>
                <Icon name="inbox" size={64} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
                  No Updates Found
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.emptySubtitle]}>
                  {searchQuery || selectedFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Updates from coaches will appear here'
                  }
                </Text>
              </Surface>
            )}
          </ScrollView>
        </Animated.View>
      </View>

      {renderUpdateModal()}
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  unreadCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  unreadCountBadge: {
    backgroundColor: COLORS.warning,
    marginRight: SPACING.xs,
  },
  unreadCountText: {
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  searchbar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectedChipText: {
    fontSize: 12,
    color: 'white',
  },
  updatesContainer: {
    flex: 1,
  },
  updatesList: {
    flex: 1,
  },
  updateCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coachAvatar: {
    marginRight: SPACING.sm,
  },
  updateMeta: {
    flex: 1,
  },
  updateTitle: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  coachName: {
    fontSize: 12,
  },
  updateActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    marginRight: SPACING.sm,
  },
  updateContent: {
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  updateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    height: 28,
  },
  updateTime: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 1,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  // Modal styles
  modalContainer: {
    margin: SPACING.md,
    maxHeight: '90%',
  },
  blurView: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  modalTitle: {
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.text,
  },
  closeButton: {
    margin: 0,
  },
  coachInfoCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  coachNameModal: {
    fontWeight: '600',
    marginBottom: 4,
  },
  contentCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  modalContentText: {
    lineHeight: 24,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  metricsCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  metricValueNew: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.success,
  },
  improvementBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    alignSelf: 'center',
  },
  improvementText: {
    color: 'white',
    fontWeight: '600',
  },
  streakCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 1,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakNumber: {
    color: COLORS.warning,
    marginLeft: SPACING.sm,
  },
  recommendationsCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recommendationText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  exercisesCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  exerciseText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  primaryButton: {
    elevation: 0,
  },
});

export default ParentUpdates;