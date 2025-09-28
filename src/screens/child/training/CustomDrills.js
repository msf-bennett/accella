import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
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
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
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
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: COLORS.textLight },
};

const { width } = Dimensions.get('window');

const CustomDrills = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, drills, loading } = useSelector(state => ({
    user: state.auth.user,
    drills: state.training.customDrills || [],
    loading: state.training.loading,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [completedDrills, setCompletedDrills] = useState(new Set());
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // Mock data for development
  const mockDrills = [
    {
      id: 1,
      title: 'Ball Control Magic ⚽',
      category: 'technical',
      difficulty: 'beginner',
      duration: 15,
      description: 'Master basic ball touches and control with fun exercises!',
      points: 50,
      icon: 'sports-soccer',
      coach: 'Coach Sarah',
      videoUrl: null,
      instructions: [
        'Keep the ball close to your feet',
        'Use both feet equally',
        'Look up while dribbling',
        'Practice for 15 minutes'
      ],
      equipment: ['Football', 'Cones (optional)'],
      completed: false,
      assignedDate: '2024-08-29',
      streak: 0,
    },
    {
      id: 2,
      title: 'Speed & Agility Fun 🏃‍♂️',
      category: 'fitness',
      difficulty: 'intermediate',
      duration: 20,
      description: 'Improve your speed with exciting sprint drills and ladder work!',
      points: 75,
      icon: 'directions-run',
      coach: 'Coach Mike',
      videoUrl: null,
      instructions: [
        'Warm up for 5 minutes',
        'Sprint through cones quickly',
        'Rest 30 seconds between sets',
        'Complete 3 rounds'
      ],
      equipment: ['Cones', 'Agility Ladder', 'Stopwatch'],
      completed: false,
      assignedDate: '2024-08-28',
      streak: 2,
    },
    {
      id: 3,
      title: 'Shooting Stars ⭐',
      category: 'technical',
      difficulty: 'intermediate',
      duration: 25,
      description: 'Score amazing goals with proper shooting technique!',
      points: 100,
      icon: 'gps-fixed',
      coach: 'Coach Sarah',
      videoUrl: null,
      instructions: [
        'Aim for corners of the goal',
        'Use both feet to shoot',
        'Follow through with your shot',
        'Celebrate every goal!'
      ],
      equipment: ['Football', 'Goal', 'Cones'],
      completed: true,
      assignedDate: '2024-08-27',
      streak: 1,
    },
    {
      id: 4,
      title: 'Teamwork Champions 🤝',
      category: 'tactical',
      difficulty: 'beginner',
      duration: 30,
      description: 'Learn to pass and communicate with your teammates!',
      points: 80,
      icon: 'group',
      coach: 'Coach Alex',
      videoUrl: null,
      instructions: [
        'Communicate with teammates',
        'Make short, accurate passes',
        'Move after passing',
        'Support your teammates'
      ],
      equipment: ['Football', 'Teammates'],
      completed: false,
      assignedDate: '2024-08-26',
      streak: 0,
    }
  ];

  const categories = [
    { key: 'all', label: 'All Drills', icon: 'view-grid' },
    { key: 'technical', label: 'Technical', icon: 'sports-soccer' },
    { key: 'fitness', label: 'Fitness', icon: 'fitness-center' },
    { key: 'tactical', label: 'Tactical', icon: 'psychology' },
  ];

  const difficultyColors = {
    beginner: COLORS.success,
    intermediate: COLORS.warning,
    advanced: COLORS.error,
  };

  // Animation effects
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

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch action to fetch latest drills
      // dispatch(fetchCustomDrills());
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Error refreshing drills:', error);
    }
    setRefreshing(false);
  }, [dispatch]);

  // Filter drills based on search and category
  const filteredDrills = mockDrills.filter(drill => {
    const matchesSearch = drill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || drill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle drill completion
  const handleCompleteDrill = (drillId) => {
    Vibration.vibrate(50);
    setCompletedDrills(prev => new Set([...prev, drillId]));
    Alert.alert(
      '🎉 Awesome Job!',
      'You completed the drill! Keep up the great work!',
      [{ text: '🌟 Amazing!', style: 'default' }]
    );
  };

  // Handle drill selection
  const handleDrillPress = (drill) => {
    setSelectedDrill(drill);
    setShowModal(true);
  };

  // Get user stats
  const userStats = {
    totalPoints: mockDrills.reduce((sum, drill) => drill.completed ? sum + drill.points : sum, 0),
    completedToday: mockDrills.filter(drill => drill.completed && drill.assignedDate === '2024-08-29').length,
    currentStreak: Math.max(...mockDrills.map(drill => drill.streak)),
    level: Math.floor(mockDrills.reduce((sum, drill) => drill.completed ? sum + drill.points : sum, 0) / 100) + 1,
  };

  // Render drill card
  const renderDrillCard = ({ item }) => (
    <Card style={[styles.drillCard, item.completed && styles.completedCard]}>
      <TouchableOpacity onPress={() => handleDrillPress(item)} activeOpacity={0.8}>
        <Card.Content>
          <View style={styles.drillHeader}>
            <View style={styles.drillTitleRow}>
              <Icon name={item.icon} size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.h3, styles.drillTitle]}>{item.title}</Text>
            </View>
            <View style={styles.drillBadges}>
              <Chip
                mode="outlined"
                compact
                textStyle={{ fontSize: 10 }}
                style={[styles.difficultyChip, { borderColor: difficultyColors[item.difficulty] }]}
              >
                {item.difficulty}
              </Chip>
              {item.streak > 0 && (
                <Chip
                  mode="contained"
                  compact
                  icon="local-fire-department"
                  textStyle={{ fontSize: 10, color: COLORS.white }}
                  style={[styles.streakChip]}
                >
                  {item.streak} 🔥
                </Chip>
              )}
            </View>
          </View>

          <Text style={[TEXT_STYLES.caption, styles.drillDescription]}>
            {item.description}
          </Text>

          <View style={styles.drillMeta}>
            <View style={styles.metaItem}>
              <Icon name="schedule" size={16} color={COLORS.textLight} />
              <Text style={styles.metaText}>{item.duration} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="stars" size={16} color={COLORS.warning} />
              <Text style={styles.metaText}>{item.points} pts</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="person" size={16} color={COLORS.textLight} />
              <Text style={styles.metaText}>{item.coach}</Text>
            </View>
          </View>

          <View style={styles.drillActions}>
            {item.completed || completedDrills.has(item.id) ? (
              <Button
                mode="contained"
                icon="check-circle"
                style={[styles.actionButton, styles.completedButton]}
                labelStyle={{ color: COLORS.white }}
                disabled
              >
                Completed! 🎉
              </Button>
            ) : (
              <Button
                mode="contained"
                icon="play-arrow"
                style={styles.actionButton}
                onPress={() => handleCompleteDrill(item.id)}
                buttonColor={COLORS.primary}
              >
                Start Drill
              </Button>
            )}
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  // Render stats card
  const StatsCard = () => (
    <Card style={styles.statsCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.statsGradient}
      >
        <View style={styles.statsContent}>
          <View style={styles.statsHeader}>
            <Avatar.Icon
              size={50}
              icon="jump-rope"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
            <View style={styles.statsInfo}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
                Level {userStats.level} 🌟
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                {userStats.totalPoints} total points
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.completedToday}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Streak 🔥</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{mockDrills.filter(d => d.completed).length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          <ProgressBar
            progress={userStats.level % 1 || 0.3}
            color="rgba(255,255,255,0.8)"
            style={styles.levelProgress}
          />
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.7)', textAlign: 'center' }]}>
            {Math.floor((1 - (userStats.level % 1 || 0.3)) * 100)} points to next level!
          </Text>
        </View>
      </LinearGradient>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>
            My Custom Drills 🏆
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            Let's train and have fun!
          </Text>
        </View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
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
          {/* Stats Card */}
          <StatsCard />

          {/* Search and Filters */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search drills... 🔍"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={{ fontSize: 14 }}
            />
            
            <TouchableOpacity
              onPress={() => setFilterModalVisible(true)}
              style={styles.filterButton}
            >
              <Icon name="filter-list" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Category Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((category) => (
              <Chip
                key={category.key}
                mode={selectedCategory === category.key ? 'contained' : 'outlined'}
                onPress={() => setSelectedCategory(category.key)}
                icon={category.icon}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.key && { backgroundColor: COLORS.primary }
                ]}
                textStyle={{
                  color: selectedCategory === category.key ? COLORS.white : COLORS.primary
                }}
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>

          {/* Drills List */}
          <FlatList
            data={filteredDrills}
            renderItem={renderDrillCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Icon name="search-off" size={64} color={COLORS.textLight} />
                <Text style={[TEXT_STYLES.h3, { color: COLORS.textLight, marginTop: SPACING.md }]}>
                  No drills found
                </Text>
                <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
                  Try adjusting your search or filters
                </Text>
              </View>
            )}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Drill Detail Modal */}
      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={20} style={styles.modalBlur}>
            {selectedDrill && (
              <Card style={styles.modalCard}>
                <Card.Content>
                  <View style={styles.modalHeader}>
                    <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                      {selectedDrill.title}
                    </Text>
                    <IconButton
                      icon="close"
                      size={24}
                      onPress={() => setShowModal(false)}
                      iconColor={COLORS.textLight}
                    />
                  </View>

                  <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
                    {selectedDrill.description}
                  </Text>

                  <View style={styles.modalSection}>
                    <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                      Instructions 📝
                    </Text>
                    {selectedDrill.instructions.map((instruction, index) => (
                      <Text key={index} style={[TEXT_STYLES.body, { marginBottom: SPACING.xs }]}>
                        {index + 1}. {instruction}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                      Equipment Needed 🛠️
                    </Text>
                    {selectedDrill.equipment.map((item, index) => (
                      <Text key={index} style={[TEXT_STYLES.body, { marginBottom: SPACING.xs }]}>
                        • {item}
                      </Text>
                    ))}
                  </View>

                  <Button
                    mode="contained"
                    onPress={() => {
                      setShowModal(false);
                      handleCompleteDrill(selectedDrill.id);
                    }}
                    style={[styles.actionButton, { marginTop: SPACING.lg }]}
                    buttonColor={COLORS.primary}
                    disabled={selectedDrill.completed || completedDrills.has(selectedDrill.id)}
                  >
                    {selectedDrill.completed || completedDrills.has(selectedDrill.id) 
                      ? 'Already Completed! 🎉' 
                      : 'Mark as Complete'}
                  </Button>
                </Card.Content>
              </Card>
            )}
          </BlurView>
        </Modal>
      </Portal>

      {/* FAB */}
      <FAB
        icon="video-library"
        style={styles.fab}
        onPress={() => Alert.alert('🎬 Video Library', 'Feature coming soon! Watch drill videos here.')}
        color={COLORS.white}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.lg,
  },
  statsCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsContent: {
    alignItems: 'center',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statsInfo: {
    marginLeft: SPACING.md,
    alignItems: 'flex-start',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  levelProgress: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchBar: {
    flex: 1,
    marginRight: SPACING.sm,
    elevation: 2,
  },
  filterButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    elevation: 2,
  },
  categoryContainer: {
    paddingBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  drillCard: {
    elevation: 3,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  completedCard: {
    opacity: 0.8,
    backgroundColor: '#f0f8f0',
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  drillTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  drillTitle: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  drillBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyChip: {
    marginRight: SPACING.xs,
  },
  streakChip: {
    backgroundColor: COLORS.error,
  },
  drillDescription: {
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  drillMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: COLORS.textLight,
  },
  drillActions: {
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 8,
    minWidth: 120,
  },
  completedButton: {
    backgroundColor: COLORS.success,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default CustomDrills;