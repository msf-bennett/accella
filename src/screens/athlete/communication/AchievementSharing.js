import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
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
  Searchbar,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const AchievementSharing = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { achievements, recentAchievements, sharedAchievements } = useSelector(state => state.achievements);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Achievement categories
  const categories = [
    { id: 'all', label: 'All', icon: 'star', color: COLORS.primary },
    { id: 'performance', label: 'Performance', icon: 'trending-up', color: COLORS.success },
    { id: 'milestones', label: 'Milestones', icon: 'flag', color: COLORS.secondary },
    { id: 'skills', label: 'Skills', icon: 'psychology', color: '#FF6B6B' },
    { id: 'consistency', label: 'Consistency', icon: 'calendar-today', color: '#4ECDC4' },
    { id: 'social', label: 'Social', icon: 'people', color: '#45B7D1' },
  ];

  // Mock achievement data
  const mockAchievements = [
    {
      id: 1,
      title: 'First Marathon Completed! 🏃‍♂️',
      description: 'Just finished my first marathon in 4:15:32! The training paid off!',
      category: 'milestones',
      icon: 'jump-rope',
      color: '#FFD700',
      date: '2024-08-20',
      points: 500,
      image: null,
      stats: { distance: '42.2km', time: '4:15:32', pace: '6:05/km' },
      isShared: false,
      likes: 0,
      comments: 0,
    },
    {
      id: 2,
      title: '30-Day Training Streak! 🔥',
      description: 'Completed 30 consecutive days of training. Consistency is key!',
      category: 'consistency',
      icon: 'local-fire-department',
      color: '#FF4444',
      date: '2024-08-18',
      points: 300,
      image: null,
      isShared: true,
      likes: 24,
      comments: 8,
    },
    {
      id: 3,
      title: 'New Personal Best! ⚡',
      description: 'Beat my 5K time by 45 seconds - new PB of 22:15!',
      category: 'performance',
      icon: 'flash-on',
      color: '#FFC107',
      date: '2024-08-15',
      points: 250,
      image: null,
      stats: { distance: '5km', time: '22:15', improvement: '45s faster' },
      isShared: true,
      likes: 18,
      comments: 5,
    },
  ];

  // Load achievements
  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, dispatch action to load achievements
      console.log('Loading achievements...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAchievements().finally(() => setRefreshing(false));
  }, [loadAchievements]);

  // Filter achievements
  const filteredAchievements = mockAchievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesSearch = achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle achievement sharing
  const handleShareAchievement = (achievement) => {
    setSelectedAchievement(achievement);
    setShareMessage(achievement.description);
    setShareModalVisible(true);
    Vibration.vibrate(50);
  };

  const confirmShare = async () => {
    if (!selectedAchievement) return;

    try {
      setLoading(true);
      
      // Simulate sharing to social platforms
      const shareContent = {
        message: shareMessage,
        title: selectedAchievement.title,
        url: 'https://smartcoach.app/achievement/' + selectedAchievement.id,
      };

      await Share.share(shareContent);
      
      // Update achievement as shared
      // In real app, dispatch action to update achievement
      Alert.alert('Success! 🎉', 'Achievement shared successfully!');
      setShareModalVisible(false);
      Vibration.vibrate([100, 50, 100]);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to share achievement');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryContainer}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={styles.categoryButton}
        >
          <Surface
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === category.id 
                  ? category.color 
                  : COLORS.background,
                elevation: selectedCategory === category.id ? 4 : 1,
              }
            ]}
          >
            <Icon
              name={category.icon}
              size={20}
              color={selectedCategory === category.id ? '#fff' : category.color}
            />
            <Text
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === category.id ? '#fff' : category.color,
                  fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                }
              ]}
            >
              {category.label}
            </Text>
          </Surface>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderAchievementCard = (achievement) => {
    const category = categories.find(cat => cat.id === achievement.category);
    
    return (
      <Card key={achievement.id} style={styles.achievementCard}>
        <Card.Content>
          <View style={styles.achievementHeader}>
            <Surface style={[styles.iconContainer, { backgroundColor: achievement.color + '20' }]}>
              <Icon name={achievement.icon} size={24} color={achievement.color} />
            </Surface>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <View style={styles.achievementMeta}>
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.categoryTag, { borderColor: category?.color }]}
                  textStyle={{ color: category?.color, fontSize: 10 }}
                >
                  {category?.label}
                </Chip>
                <Text style={styles.achievementDate}>{achievement.date}</Text>
                <View style={styles.pointsContainer}>
                  <Icon name="star" size={14} color={COLORS.primary} />
                  <Text style={styles.pointsText}>{achievement.points}</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.achievementDescription}>
            {achievement.description}
          </Text>

          {achievement.stats && (
            <View style={styles.statsContainer}>
              {Object.entries(achievement.stats).map(([key, value]) => (
                <Surface key={key} style={styles.statItem}>
                  <Text style={styles.statLabel}>{key}</Text>
                  <Text style={styles.statValue}>{value}</Text>
                </Surface>
              ))}
            </View>
          )}

          <View style={styles.actionContainer}>
            <View style={styles.socialStats}>
              {achievement.isShared && (
                <>
                  <View style={styles.statGroup}>
                    <Icon name="favorite" size={16} color="#FF4444" />
                    <Text style={styles.socialStatText}>{achievement.likes}</Text>
                  </View>
                  <View style={styles.statGroup}>
                    <Icon name="comment" size={16} color={COLORS.primary} />
                    <Text style={styles.socialStatText}>{achievement.comments}</Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.actionButtons}>
              {!achievement.isShared ? (
                <Button
                  mode="contained"
                  onPress={() => handleShareAchievement(achievement)}
                  style={styles.shareButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.shareButtonText}
                >
                  <Icon name="share" size={16} color="#fff" />
                  Share
                </Button>
              ) : (
                <View style={styles.sharedIndicator}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.sharedText}>Shared</Text>
                </View>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderShareModal = () => (
    <Portal>
      <Modal
        visible={shareModalVisible}
        onDismiss={() => setShareModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurContainer} blurType="dark" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Achievement 🎉</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShareModalVisible(false)}
              />
            </View>

            {selectedAchievement && (
              <>
                <View style={styles.previewContainer}>
                  <Surface style={[styles.iconContainer, { backgroundColor: selectedAchievement.color + '20' }]}>
                    <Icon name={selectedAchievement.icon} size={20} color={selectedAchievement.color} />
                  </Surface>
                  <Text style={styles.previewTitle}>{selectedAchievement.title}</Text>
                </View>

                <TextInput
                  mode="outlined"
                  label="Share Message"
                  value={shareMessage}
                  onChangeText={setShareMessage}
                  multiline
                  numberOfLines={4}
                  style={styles.messageInput}
                  outlineColor={COLORS.primary}
                  activeOutlineColor={COLORS.primary}
                />

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShareModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={confirmShare}
                    loading={loading}
                    style={styles.confirmButton}
                  >
                    Share Now
                  </Button>
                </View>
              </>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-back"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Achievements</Text>
          <IconButton
            icon="trophy"
            iconColor="#fff"
            size={24}
            onPress={() => Alert.alert('Coming Soon!', 'Achievement gallery feature in development')}
          />
        </View>

        <View style={styles.statsRow}>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Total</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Shared</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>1,250</Text>
            <Text style={styles.statLabel}>Points</Text>
          </Surface>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <View style={styles.content}>
        <Searchbar
          placeholder="Search achievements..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />

        {renderCategoryFilter()}

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
          {filteredAchievements.length > 0 ? (
            <View style={styles.achievementsList}>
              {filteredAchievements.map(renderAchievementCard)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="jump-rope" size={64} color={COLORS.text + '40'} />
              <Text style={styles.emptyTitle}>No achievements yet</Text>
              <Text style={styles.emptyMessage}>
                Keep training and achieving your goals to unlock achievements!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Coming Soon!', 'Manual achievement creation feature in development')}
      />

      {renderShareModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  searchBar: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  categoryButton: {
    marginRight: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  categoryText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  achievementsList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  achievementCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 12,
  },
  achievementHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    elevation: 2,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  achievementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryTag: {
    height: 24,
    marginRight: SPACING.sm,
  },
  achievementDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.text + '80',
    marginRight: SPACING.sm,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 2,
  },
  achievementDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text + '90',
    marginBottom: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  statItem: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    elevation: 1,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text + '60',
    fontSize: 10,
    textTransform: 'capitalize',
  },
  statValue: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  socialStats: {
    flexDirection: 'row',
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  socialStatText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.text + '80',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  shareButton: {
    backgroundColor: COLORS.primary,
  },
  buttonContent: {
    paddingHorizontal: SPACING.sm,
  },
  shareButtonText: {
    fontSize: 12,
    marginLeft: SPACING.xs,
  },
  sharedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.success + '20',
    borderRadius: 16,
  },
  sharedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.lg,
    color: COLORS.text + '80',
  },
  emptyMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.text + '60',
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
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
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    width: width - SPACING.xl * 2,
    padding: SPACING.lg,
    borderRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  previewTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginLeft: SPACING.md,
    flex: 1,
  },
  messageInput: {
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    borderColor: COLORS.text + '40',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
});

export default AchievementSharing;