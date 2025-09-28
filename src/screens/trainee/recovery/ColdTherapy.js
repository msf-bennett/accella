import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your established design system
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheader: {
    fontSize: 20,
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

const { width } = Dimensions.get('window');

const ActiveRecovery = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, recoveryData, isLoading } = useSelector(state => ({
    user: state.auth.user,
    recoveryData: state.recovery,
    isLoading: state.ui.isLoading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Sample recovery activities data
  const [recoveryActivities] = useState([
    {
      id: 1,
      title: 'Light Yoga Flow',
      duration: '15-20 min',
      category: 'flexibility',
      difficulty: 'beginner',
      benefits: ['Improves flexibility', 'Reduces muscle tension', 'Enhances mindfulness'],
      equipment: 'Yoga mat',
      calories: '50-80',
      completed: false,
      icon: 'self-improvement',
    },
    {
      id: 2,
      title: 'Walking Recovery',
      duration: '20-30 min',
      category: 'cardio',
      difficulty: 'beginner',
      benefits: ['Improves circulation', 'Low-impact cardio', 'Mental refresher'],
      equipment: 'None',
      calories: '100-150',
      completed: true,
      icon: 'directions-walk',
    },
    {
      id: 3,
      title: 'Foam Rolling Session',
      duration: '10-15 min',
      category: 'mobility',
      difficulty: 'intermediate',
      benefits: ['Releases muscle knots', 'Improves blood flow', 'Reduces soreness'],
      equipment: 'Foam roller',
      calories: '30-50',
      completed: false,
      icon: 'fitness-center',
    },
    {
      id: 4,
      title: 'Swimming Laps (Easy)',
      duration: '25-35 min',
      category: 'cardio',
      difficulty: 'intermediate',
      benefits: ['Full body recovery', 'Joint-friendly', 'Cardiovascular health'],
      equipment: 'Pool access',
      calories: '200-300',
      completed: false,
      icon: 'pool',
    },
    {
      id: 5,
      title: 'Meditation & Breathing',
      duration: '10-15 min',
      category: 'mental',
      difficulty: 'beginner',
      benefits: ['Stress relief', 'Mental clarity', 'Better sleep quality'],
      equipment: 'Quiet space',
      calories: '10-20',
      completed: false,
      icon: 'spa',
    },
    {
      id: 6,
      title: 'Dynamic Stretching',
      duration: '12-18 min',
      category: 'flexibility',
      difficulty: 'intermediate',
      benefits: ['Joint mobility', 'Injury prevention', 'Movement preparation'],
      equipment: 'None',
      calories: '40-60',
      completed: false,
      icon: 'accessible-forward',
    },
  ]);

  const categories = [
    { label: 'All', value: 'all', icon: 'apps' },
    { label: 'Flexibility', value: 'flexibility', icon: 'self-improvement' },
    { label: 'Cardio', value: 'cardio', icon: 'favorite' },
    { label: 'Mobility', value: 'mobility', icon: 'accessibility' },
    { label: 'Mental', value: 'mental', icon: 'psychology' },
  ];

  // Recovery metrics
  const [weeklyStats] = useState({
    completedSessions: 4,
    totalSessions: 6,
    streakDays: 3,
    totalMinutes: 95,
    caloriesBurned: 380,
  });

  useEffect(() => {
    // Entrance animations
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

    // Load recovery data
    loadRecoveryData();
  }, []);

  const loadRecoveryData = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(loadRecoveryActivities());
    } catch (error) {
      console.error('Error loading recovery data:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecoveryData();
    setRefreshing(false);
  }, [loadRecoveryData]);

  const filteredActivities = recoveryActivities.filter(activity => {
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartActivity = (activity) => {
    Alert.alert(
      '🏃‍♂️ Start Recovery Session',
      `Ready to begin "${activity.title}"?\n\nDuration: ${activity.duration}\nEquipment: ${activity.equipment}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Session',
          onPress: () => {
            Alert.alert('🚧 Feature Coming Soon', 'Recovery session tracking will be available in the next update!');
          },
        },
      ]
    );
  };

  const handleViewDetails = (activity) => {
    Alert.alert(
      `${activity.title} Details`,
      `Benefits:\n${activity.benefits.join('\n• ')}\n\nDifficulty: ${activity.difficulty}\nCalories: ${activity.calories}`,
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Surface style={styles.statCard}>
        <Icon name="check-circle" size={24} color={COLORS.success} />
        <Text style={styles.statValue}>{weeklyStats.completedSessions}/{weeklyStats.totalSessions}</Text>
        <Text style={styles.statLabel}>Sessions</Text>
      </Surface>
      <Surface style={styles.statCard}>
        <Icon name="local-fire-department" size={24} color={COLORS.warning} />
        <Text style={styles.statValue}>{weeklyStats.streakDays}</Text>
        <Text style={styles.statLabel}>Day Streak 🔥</Text>
      </Surface>
      <Surface style={styles.statCard}>
        <Icon name="schedule" size={24} color={COLORS.primary} />
        <Text style={styles.statValue}>{weeklyStats.totalMinutes}</Text>
        <Text style={styles.statLabel}>Minutes</Text>
      </Surface>
    </View>
  );

  const renderProgressSection = () => (
    <Card style={styles.progressCard}>
      <Card.Content>
        <View style={styles.progressHeader}>
          <Text style={[TEXT_STYLES.subheader, { color: COLORS.primary }]}>
            Weekly Progress 📈
          </Text>
          <Text style={TEXT_STYLES.caption}>
            {Math.round((weeklyStats.completedSessions / weeklyStats.totalSessions) * 100)}% Complete
          </Text>
        </View>
        <ProgressBar
          progress={weeklyStats.completedSessions / weeklyStats.totalSessions}
          color={COLORS.success}
          style={styles.progressBar}
        />
        <View style={styles.progressDetails}>
          <Text style={TEXT_STYLES.caption}>
            🎯 Keep up the great work! {weeklyStats.totalSessions - weeklyStats.completedSessions} sessions to go
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCategoryFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesScroll}
      contentContainerStyle={styles.categoriesContainer}
    >
      {categories.map((category) => (
        <Chip
          key={category.value}
          mode={selectedCategory === category.value ? 'flat' : 'outlined'}
          selected={selectedCategory === category.value}
          onPress={() => setSelectedCategory(category.value)}
          icon={category.icon}
          style={[
            styles.categoryChip,
            selectedCategory === category.value && {
              backgroundColor: COLORS.primary,
            }
          ]}
          textStyle={{
            color: selectedCategory === category.value ? '#fff' : COLORS.primary,
          }}
        >
          {category.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderActivityCard = (activity) => (
    <Card key={activity.id} style={styles.activityCard}>
      <Card.Content>
        <View style={styles.activityHeader}>
          <View style={styles.activityTitleRow}>
            <Avatar.Icon
              size={40}
              icon={activity.icon}
              style={{ backgroundColor: activity.completed ? COLORS.success : COLORS.primary }}
            />
            <View style={styles.activityTitleContainer}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                {activity.title}
                {activity.completed && ' ✅'}
              </Text>
              <Text style={TEXT_STYLES.caption}>
                {activity.duration} • {activity.calories} cal
              </Text>
            </View>
          </View>
          <IconButton
            icon="info-outline"
            size={20}
            iconColor={COLORS.textSecondary}
            onPress={() => handleViewDetails(activity)}
          />
        </View>

        <View style={styles.activityMeta}>
          <Chip
            mode="outlined"
            compact
            textStyle={{ fontSize: 12 }}
            style={styles.difficultyChip}
          >
            {activity.difficulty}
          </Chip>
          <Text style={[TEXT_STYLES.caption, { flex: 1, textAlign: 'right' }]}>
            Equipment: {activity.equipment}
          </Text>
        </View>

        <View style={styles.benefitsList}>
          {activity.benefits.slice(0, 2).map((benefit, index) => (
            <Text key={index} style={[TEXT_STYLES.caption, styles.benefitItem]}>
              • {benefit}
            </Text>
          ))}
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          mode={activity.completed ? "outlined" : "contained"}
          onPress={() => activity.completed ? null : handleStartActivity(activity)}
          disabled={activity.completed}
          icon={activity.completed ? "check" : "play-arrow"}
          style={styles.actionButton}
        >
          {activity.completed ? "Completed" : "Start Session"}
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[TEXT_STYLES.header, { color: '#fff' }]}>
            Active Recovery 🧘‍♀️
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9 }]}>
            Gentle activities to enhance your recovery
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        {renderStatsCards()}
        {renderProgressSection()}

        <Searchbar
          placeholder="Search recovery activities..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />

        {renderCategoryFilters()}

        <View style={styles.activitiesSection}>
          <Text style={[TEXT_STYLES.subheader, styles.sectionTitle]}>
            Recommended Activities 💪
          </Text>
          {filteredActivities.length > 0 ? (
            filteredActivities.map(renderActivityCard)
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="search-off" size={48} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.md }]}>
                  No activities found for "{searchQuery}"
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setSearchQuery('')}
                  style={{ marginTop: SPACING.md }}
                >
                  Clear Search
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => {
          Alert.alert('🚧 Feature Coming Soon', 'Custom recovery plan creation will be available in the next update!');
        }}
        color="#fff"
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: 12,
    elevation: 2,
  },
  statValue: {
    ...TEXT_STYLES.subheader,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  progressCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  progressDetails: {
    alignItems: 'center',
  },
  searchbar: {
    marginBottom: SPACING.lg,
    elevation: 2,
    borderRadius: 12,
  },
  categoriesScroll: {
    marginBottom: SPACING.lg,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
    marginHorizontal: SPACING.xs,
  },
  activitiesSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  activityCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityTitleContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  difficultyChip: {
    height: 28,
  },
  benefitsList: {
    marginBottom: SPACING.md,
  },
  benefitItem: {
    lineHeight: 18,
    marginBottom: 2,
  },
  actionButton: {
    marginRight: SPACING.md,
  },
  emptyCard: {
    borderRadius: 12,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default ActiveRecovery;
