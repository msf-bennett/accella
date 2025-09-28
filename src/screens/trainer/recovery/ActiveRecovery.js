import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Vibration,
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
  Searchbar,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import design constants
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';

const { width } = Dimensions.get('window');

const ActiveRecovery = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, recoveryData, isLoading } = useSelector(state => state.user);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [completedActivities, setCompletedActivities] = useState(new Set());
  const [streakCount, setStreakCount] = useState(recoveryData?.streak || 0);
  const [weeklyProgress, setWeeklyProgress] = useState(0.65);

  // Recovery activity categories
  const recoveryCategories = [
    { id: 'all', name: 'All', icon: 'fitness-center', color: COLORS.primary },
    { id: 'mobility', name: 'Mobility', icon: 'accessibility', color: '#4CAF50' },
    { id: 'stretching', name: 'Stretching', icon: 'self-improvement', color: '#FF9800' },
    { id: 'cardio', name: 'Light Cardio', icon: 'directions-walk', color: '#E91E63' },
    { id: 'meditation', name: 'Mindfulness', icon: 'psychology', color: '#9C27B0' },
  ];

  // Sample recovery activities
  const recoveryActivities = [
    {
      id: 1,
      title: 'Dynamic Warm-up Flow',
      category: 'mobility',
      duration: '15 min',
      difficulty: 'Beginner',
      points: 50,
      description: 'Full body mobility sequence to enhance range of motion',
      exercises: ['Arm circles', 'Leg swings', 'Hip circles', 'Ankle rolls'],
      benefits: ['Improved flexibility', 'Better circulation', 'Injury prevention'],
    },
    {
      id: 2,
      title: 'Post-Workout Stretch',
      category: 'stretching',
      duration: '20 min',
      difficulty: 'Beginner',
      points: 60,
      description: 'Complete stretching routine for muscle recovery',
      exercises: ['Hamstring stretch', 'Quad stretch', 'Calf stretch', 'Shoulder stretch'],
      benefits: ['Reduced soreness', 'Faster recovery', 'Better sleep'],
    },
    {
      id: 3,
      title: 'Recovery Walk',
      category: 'cardio',
      duration: '30 min',
      difficulty: 'Easy',
      points: 75,
      description: 'Light cardio to promote blood flow and recovery',
      exercises: ['Brisk walking', 'Deep breathing', 'Nature observation'],
      benefits: ['Enhanced circulation', 'Mental clarity', 'Stress relief'],
    },
    {
      id: 4,
      title: 'Mindful Recovery',
      category: 'meditation',
      duration: '10 min',
      difficulty: 'Beginner',
      points: 40,
      description: 'Guided meditation for mental and physical recovery',
      exercises: ['Breathing exercises', 'Body scan', 'Visualization'],
      benefits: ['Reduced stress', 'Better focus', 'Improved mood'],
    },
  ];

  // Filter activities based on search and category
  const filteredActivities = recoveryActivities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || activity.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Animation setup
  useEffect(() => {
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

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchRecoveryData());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh recovery data');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Handle activity completion
  const handleActivityComplete = useCallback((activityId) => {
    Vibration.vibrate([50, 100, 50]);
    setCompletedActivities(prev => new Set([...prev, activityId]));
    
    const activity = recoveryActivities.find(a => a.id === activityId);
    if (activity) {
      Alert.alert(
        '🎉 Activity Completed!',
        `Great job! You earned ${activity.points} points for completing ${activity.title}`,
        [{ text: 'Awesome!', style: 'default' }]
      );
      
      // Update streak and progress
      setStreakCount(prev => prev + 1);
      setWeeklyProgress(prev => Math.min(prev + 0.1, 1));
    }
  }, []);

  // Handle activity selection
  const handleActivityPress = useCallback((activity) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  }, []);

  // Get category color
  const getCategoryColor = (categoryId) => {
    const category = recoveryCategories.find(c => c.id === categoryId);
    return category ? category.color : COLORS.primary;
  };

  // Render category chips
  const renderCategoryChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesContainer}
      contentContainerStyle={{ paddingHorizontal: SPACING.medium }}
    >
      {recoveryCategories.map((category) => (
        <Chip
          key={category.id}
          mode={activeCategory === category.id ? 'flat' : 'outlined'}
          selected={activeCategory === category.id}
          onPress={() => setActiveCategory(category.id)}
          style={[
            styles.categoryChip,
            activeCategory === category.id && {
              backgroundColor: category.color,
            }
          ]}
          textStyle={[
            styles.chipText,
            activeCategory === category.id && styles.selectedChipText
          ]}
          icon={() => (
            <Icon 
              name={category.icon} 
              size={16} 
              color={activeCategory === category.id ? 'white' : category.color} 
            />
          )}
        >
          {category.name}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render stats card
  const renderStatsCard = () => (
    <Surface style={styles.statsCard} elevation={2}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.statsGradient}
      >
        <View style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{streakCount}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Math.round(weeklyProgress * 100)}%</Text>
            <Text style={styles.statLabel}>Weekly Goal</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedActivities.size}</Text>
            <Text style={styles.statLabel}>Completed Today</Text>
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Weekly Recovery Progress</Text>
          <ProgressBar 
            progress={weeklyProgress} 
            color="white" 
            style={styles.progressBar}
          />
        </View>
      </LinearGradient>
    </Surface>
  );

  // Render activity card
  const renderActivityCard = ({ item }) => {
    const isCompleted = completedActivities.has(item.id);
    const categoryColor = getCategoryColor(item.category);
    
    return (
      <TouchableOpacity 
        onPress={() => handleActivityPress(item)}
        activeOpacity={0.8}
      >
        <Card style={[styles.activityCard, isCompleted && styles.completedCard]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <View style={styles.activityMeta}>
                  <Chip 
                    mode="outlined" 
                    compact
                    style={[styles.categoryBadge, { borderColor: categoryColor }]}
                    textStyle={[styles.categoryBadgeText, { color: categoryColor }]}
                  >
                    {item.category}
                  </Chip>
                  <Text style={styles.duration}>{item.duration}</Text>
                  <Text style={styles.difficulty}>{item.difficulty}</Text>
                </View>
              </View>
              
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>{item.points}</Text>
                <Text style={styles.pointsLabel}>pts</Text>
              </View>
            </View>
            
            <Text style={styles.description}>{item.description}</Text>
            
            <View style={styles.cardFooter}>
              <View style={styles.benefits}>
                {item.benefits.slice(0, 2).map((benefit, index) => (
                  <Chip key={index} compact mode="outlined" style={styles.benefitChip}>
                    {benefit}
                  </Chip>
                ))}
              </View>
              
              <Button
                mode={isCompleted ? "outlined" : "contained"}
                onPress={() => isCompleted ? null : handleActivityComplete(item.id)}
                disabled={isCompleted}
                style={styles.actionButton}
                icon={isCompleted ? "check-circle" : "play-arrow"}
                buttonColor={isCompleted ? 'transparent' : categoryColor}
              >
                {isCompleted ? 'Completed' : 'Start'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  // Render activity detail modal
  const renderActivityModal = () => (
    <Portal>
      <Modal 
        visible={modalVisible} 
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={StyleSheet.absoluteFill} blurType="dark" blurAmount={10} />
        
        {selectedActivity && (
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedActivity.title}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>{selectedActivity.description}</Text>
              
              <View style={styles.modalMeta}>
                <View style={styles.metaItem}>
                  <Icon name="schedule" size={20} color={COLORS.primary} />
                  <Text style={styles.metaText}>{selectedActivity.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="fitness-center" size={20} color={COLORS.primary} />
                  <Text style={styles.metaText}>{selectedActivity.difficulty}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="star" size={20} color={COLORS.primary} />
                  <Text style={styles.metaText}>{selectedActivity.points} points</Text>
                </View>
              </View>
              
              <Text style={styles.sectionTitle}>Exercises</Text>
              {selectedActivity.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <Icon name="play-arrow" size={16} color={COLORS.primary} />
                  <Text style={styles.exerciseText}>{exercise}</Text>
                </View>
              ))}
              
              <Text style={styles.sectionTitle}>Benefits</Text>
              {selectedActivity.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                mode="contained"
                onPress={() => {
                  handleActivityComplete(selectedActivity.id);
                  setModalVisible(false);
                }}
                style={styles.startButton}
                icon="play-arrow"
                disabled={completedActivities.has(selectedActivity.id)}
              >
                {completedActivities.has(selectedActivity.id) ? 'Completed' : 'Start Activity'}
              </Button>
            </View>
          </Surface>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Active Recovery</Text>
        <Text style={styles.headerSubtitle}>Enhance your recovery journey 💪</Text>
      </LinearGradient>
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor="white"
          />
        }
        opacity={fadeAnim}
        transform={[{ translateY: slideAnim }]}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search recovery activities..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
          />
        </View>

        {/* Stats Card */}
        {renderStatsCard()}

        {/* Category Chips */}
        {renderCategoryChips()}

        {/* Activities Section */}
        <View style={styles.activitiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Recovery Activities</Text>
            <Badge style={styles.countBadge}>{filteredActivities.length}</Badge>
          </View>
          
          {filteredActivities.map(activity => renderActivityCard({ item: activity }))}
          
          {filteredActivities.length === 0 && (
            <Surface style={styles.emptyState}>
              <Icon name="search-off" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateTitle}>No activities found</Text>
              <Text style={styles.emptyStateText}>Try adjusting your search or category filter</Text>
            </Surface>
          )}
        </View>

        {/* AI Recommendations Section */}
        <Surface style={styles.recommendationsCard}>
          <View style={styles.recommendationsHeader}>
            <Icon name="auto-awesome" size={24} color={COLORS.primary} />
            <Text style={styles.recommendationsTitle}>AI Recommendations</Text>
          </View>
          <Text style={styles.recommendationsText}>
            Based on your recent training intensity, we recommend focusing on mobility work today. 
            Your muscles will benefit from gentle stretching and light movement.
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => Alert.alert('Coming Soon', 'Personalized AI recommendations will be available soon!')}
            style={styles.recommendationsButton}
          >
            View Personalized Plan
          </Button>
        </Surface>
      </Animated.ScrollView>

      {/* Activity Detail Modal */}
      {renderActivityModal()}

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Coming Soon', 'Custom recovery plan creation will be available soon!')}
        color="white"
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
    paddingTop: StatusBar.currentHeight + SPACING.large,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
  headerTitle: {
    ...TEXT_STYLES.heading1,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  statsCard: {
    marginHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.large,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.heading2,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xsmall,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressSection: {
    marginTop: SPACING.medium,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginBottom: SPACING.small,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  categoriesContainer: {
    marginVertical: SPACING.medium,
  },
  categoryChip: {
    marginRight: SPACING.small,
  },
  chipText: {
    ...TEXT_STYLES.caption,
  },
  selectedChipText: {
    color: 'white',
  },
  activitiesSection: {
    paddingHorizontal: SPACING.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  sectionHeaderText: {
    ...TEXT_STYLES.heading3,
    fontWeight: 'bold',
  },
  countBadge: {
    backgroundColor: COLORS.primary,
  },
  activityCard: {
    marginBottom: SPACING.medium,
    borderRadius: 12,
  },
  completedCard: {
    opacity: 0.7,
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.small,
  },
  activityInfo: {
    flex: 1,
    marginRight: SPACING.medium,
  },
  activityTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    marginRight: SPACING.small,
    marginBottom: SPACING.xsmall,
  },
  categoryBadgeText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  duration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginRight: SPACING.small,
  },
  difficulty: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  pointsBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xsmall,
    alignItems: 'center',
  },
  pointsText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
  },
  pointsLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  benefits: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitChip: {
    marginRight: SPACING.xsmall,
    marginBottom: SPACING.xsmall,
  },
  actionButton: {
    borderRadius: 20,
  },
  recommendationsCard: {
    marginHorizontal: SPACING.medium,
    marginTop: SPACING.large,
    padding: SPACING.large,
    borderRadius: 12,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  recommendationsTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginLeft: SPACING.small,
  },
  recommendationsText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
  },
  recommendationsButton: {
    borderColor: COLORS.primary,
  },
  emptyState: {
    padding: SPACING.xlarge,
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginTop: SPACING.medium,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.small,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.medium,
  },
  modalContent: {
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.heading3,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    margin: 0,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    margin: SPACING.large,
    marginTop: SPACING.medium,
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xsmall,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginHorizontal: SPACING.large,
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.xsmall,
  },
  exerciseText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.small,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.xsmall,
  },
  benefitText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.small,
  },
  modalActions: {
    padding: SPACING.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startButton: {
    borderRadius: 25,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.medium,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default ActiveRecovery;