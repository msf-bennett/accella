import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Text,
  Dimensions,
  Alert,
  Animated,
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
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#FF6B6B',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 18,
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

const { width: screenWidth } = Dimensions.get('window');

const LearningPath = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, learningPaths, currentPath, achievements } = useSelector(
    (state) => ({
      user: state.auth.user,
      learningPaths: state.education.learningPaths || [],
      currentPath: state.education.currentPath,
      achievements: state.education.achievements || [],
    })
  );

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPathModal, setShowPathModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));

  // Mock data for demonstration
  const mockLearningPaths = [
    {
      id: 1,
      title: 'Football Fundamentals 🏈',
      category: 'Football',
      level: 'Beginner',
      totalLessons: 12,
      completedLessons: 3,
      estimatedTime: '4 weeks',
      points: 120,
      difficulty: 'Easy',
      description: 'Learn the basics of football including passing, catching, and basic rules',
      color: '#4CAF50',
      icon: 'sports-football',
      badge: '⚡',
      isActive: true,
    },
    {
      id: 2,
      title: 'Basketball Skills 🏀',
      category: 'Basketball',
      level: 'Intermediate',
      totalLessons: 15,
      completedLessons: 0,
      estimatedTime: '6 weeks',
      points: 180,
      difficulty: 'Medium',
      description: 'Master dribbling, shooting, and team strategies',
      color: '#FF9800',
      icon: 'sports-basketball',
      badge: '🔥',
      isActive: false,
    },
    {
      id: 3,
      title: 'Soccer Techniques ⚽',
      category: 'Soccer',
      level: 'Beginner',
      totalLessons: 10,
      completedLessons: 8,
      estimatedTime: '3 weeks',
      points: 150,
      difficulty: 'Easy',
      description: 'Learn ball control, passing, and basic tactics',
      color: '#2196F3',
      icon: 'sports-soccer',
      badge: '⭐',
      isActive: true,
    },
    {
      id: 4,
      title: 'Tennis Basics 🎾',
      category: 'Tennis',
      level: 'Beginner',
      totalLessons: 8,
      completedLessons: 0,
      estimatedTime: '2 weeks',
      points: 100,
      difficulty: 'Easy',
      description: 'Master the fundamentals of tennis strokes and court movement',
      color: '#9C27B0',
      icon: 'sports-tennis',
      badge: '🎯',
      isActive: false,
    },
  ];

  const categories = ['All', 'Football', 'Basketball', 'Soccer', 'Tennis'];

  const filteredPaths = mockLearningPaths.filter((path) => {
    const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || path.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePathPress = (path) => {
    setSelectedPath(path);
    setShowPathModal(true);
  };

  const handleStartPath = (path) => {
    Alert.alert(
      '🚀 Start Learning Path',
      `Ready to begin "${path.title}"? This will become your active learning path!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Path',
          onPress: () => {
            setShowPathModal(false);
            Alert.alert(
              '✨ Path Started!',
              `"${path.title}" is now your active learning path. Let's begin learning!`,
              [{ text: 'Continue', onPress: () => navigation.navigate('LessonDetail', { pathId: path.id }) }]
            );
          },
        },
      ]
    );
  };

  const handleContinuePath = (path) => {
    navigation.navigate('LessonDetail', { pathId: path.id });
  };

  const renderPathCard = ({ item: path }) => {
    const progress = path.completedLessons / path.totalLessons;
    
    return (
      <Animated.View
        style={[
          styles.pathCard,
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={() => handlePathPress(path)}>
          <Card style={[styles.card, { borderLeftColor: path.color, borderLeftWidth: 4 }]}>
            <LinearGradient
              colors={[path.color + '20', COLORS.white]}
              style={styles.cardGradient}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.pathInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.pathTitle}>{path.title}</Text>
                      <Text style={styles.pathBadge}>{path.badge}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Chip
                        mode="flat"
                        style={[styles.levelChip, { backgroundColor: path.color + '30' }]}
                        textStyle={{ color: path.color, fontWeight: 'bold' }}
                        compact
                      >
                        {path.level}
                      </Chip>
                      <Text style={styles.estimatedTime}>{path.estimatedTime}</Text>
                    </View>
                  </View>
                  <Avatar.Icon
                    size={50}
                    icon={path.icon}
                    style={{ backgroundColor: path.color + '30' }}
                    color={path.color}
                  />
                </View>

                <Text style={styles.pathDescription}>{path.description}</Text>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>
                      Progress: {path.completedLessons}/{path.totalLessons} lessons
                    </Text>
                    <Text style={styles.pointsText}>+{path.points} pts 🏆</Text>
                  </View>
                  <ProgressBar
                    progress={progress}
                    color={path.color}
                    style={styles.progressBar}
                  />
                  <Text style={styles.progressPercentage}>
                    {Math.round(progress * 100)}% Complete
                  </Text>
                </View>

                <View style={styles.actionSection}>
                  {path.isActive && path.completedLessons > 0 ? (
                    <Button
                      mode="contained"
                      onPress={() => handleContinuePath(path)}
                      style={[styles.actionButton, { backgroundColor: path.color }]}
                      labelStyle={styles.buttonLabel}
                      icon="play-arrow"
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      mode={path.completedLessons > 0 ? 'contained' : 'outlined'}
                      onPress={() => handlePathPress(path)}
                      style={[
                        styles.actionButton,
                        path.completedLessons > 0 && { backgroundColor: path.color },
                      ]}
                      labelStyle={styles.buttonLabel}
                      icon={path.completedLessons > 0 ? 'play-arrow' : 'rocket-launch'}
                    >
                      {path.completedLessons > 0 ? 'Continue' : 'Start Path'}
                    </Button>
                  )}
                </View>
              </Card.Content>
            </LinearGradient>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategoryChip = (category) => (
    <Chip
      key={category}
      mode={selectedCategory === category ? 'flat' : 'outlined'}
      selected={selectedCategory === category}
      onPress={() => setSelectedCategory(category)}
      style={[
        styles.categoryChip,
        selectedCategory === category && { backgroundColor: COLORS.primary + '20' },
      ]}
      textStyle={[
        styles.categoryChipText,
        selectedCategory === category && { color: COLORS.primary, fontWeight: 'bold' },
      ]}
    >
      {category}
    </Chip>
  );

  const renderProgressOverview = () => {
    const totalPaths = mockLearningPaths.length;
    const activePaths = mockLearningPaths.filter(p => p.isActive).length;
    const completedLessons = mockLearningPaths.reduce((sum, path) => sum + path.completedLessons, 0);
    const totalPoints = mockLearningPaths.reduce((sum, path) => sum + (path.completedLessons * 10), 0);

    return (
      <Card style={styles.overviewCard}>
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.overviewGradient}>
          <Card.Content style={styles.overviewContent}>
            <Text style={styles.overviewTitle}>🌟 Your Learning Journey</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{activePaths}</Text>
                <Text style={styles.statLabel}>Active Paths</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{completedLessons}</Text>
                <Text style={styles.statLabel}>Lessons Done</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalPoints}</Text>
                <Text style={styles.statLabel}>Points Earned</Text>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>🎯 Learning Paths</Text>
            <IconButton
              icon="account-circle"
              size={32}
              iconColor={COLORS.white}
              onPress={() => navigation.navigate('Profile')}
            />
          </View>
          <Text style={styles.headerSubtitle}>
            Choose your sports adventure! 🚀
          </Text>
        </View>
      </LinearGradient>

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
        {renderProgressOverview()}

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search learning paths..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
          />
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(renderCategoryChip)}
          </ScrollView>
        </View>

        <View style={styles.pathsSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'All Paths' : selectedCategory} ({filteredPaths.length})
          </Text>
          <FlatList
            data={filteredPaths}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPathCard}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          />
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={showPathModal}
          onDismiss={() => setShowPathModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedPath && (
            <Card style={styles.modalCard}>
              <LinearGradient
                colors={[selectedPath.color + '20', COLORS.white]}
                style={styles.modalGradient}
              >
                <Card.Content style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleRow}>
                      <Text style={styles.modalTitle}>{selectedPath.title}</Text>
                      <IconButton
                        icon="close"
                        size={24}
                        onPress={() => setShowPathModal(false)}
                      />
                    </View>
                    <Text style={styles.modalDescription}>{selectedPath.description}</Text>
                  </View>

                  <View style={styles.modalDetails}>
                    <View style={styles.detailRow}>
                      <Icon name="school" size={20} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>{selectedPath.totalLessons} lessons</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="schedule" size={20} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>{selectedPath.estimatedTime}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="star" size={20} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>{selectedPath.points} points</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="trending-up" size={20} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>{selectedPath.difficulty} difficulty</Text>
                    </View>
                  </View>

                  <View style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => setShowPathModal(false)}
                      style={styles.modalButton}
                    >
                      Maybe Later
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => handleStartPath(selectedPath)}
                      style={[styles.modalButton, { backgroundColor: selectedPath.color }]}
                      icon="rocket-launch"
                    >
                      Start Learning!
                    </Button>
                  </View>
                </Card.Content>
              </LinearGradient>
            </Card>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.accent }]}
        onPress={() =>
          Alert.alert(
            '✨ Custom Path',
            'Want to create a custom learning path? This feature is coming soon!',
            [{ text: 'Got it!' }]
          )
        }
        label="Custom Path"
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
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white + 'CC',
    marginTop: SPACING.xs,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  overviewCard: {
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  overviewGradient: {
    borderRadius: 12,
  },
  overviewContent: {
    padding: SPACING.lg,
  },
  overviewTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
    fontSize: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    color: COLORS.white + 'CC',
    marginTop: SPACING.xs,
  },
  searchSection: {
    marginBottom: SPACING.lg,
  },
  searchbar: {
    elevation: 2,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categorySection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.md,
    fontSize: 18,
  },
  categoryScroll: {
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  categoryChipText: {
    fontSize: 14,
  },
  pathsSection: {
    flex: 1,
    paddingBottom: 100,
  },
  pathCard: {
    marginBottom: SPACING.md,
  },
  card: {
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    borderRadius: 12,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  pathInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pathTitle: {
    ...TEXT_STYLES.subheading,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  pathBadge: {
    fontSize: 24,
    marginLeft: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  levelChip: {
    height: 28,
  },
  estimatedTime: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  pathDescription: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  progressSection: {
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.xs,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    textAlign: 'right',
  },
  actionSection: {
    alignItems: 'center',
  },
  actionButton: {
    minWidth: 160,
    borderRadius: 25,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    margin: SPACING.lg,
    justifyContent: 'center',
  },
  modalCard: {
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalGradient: {
    borderRadius: 12,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalHeader: {
    marginBottom: SPACING.lg,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 22,
    flex: 1,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  modalDetails: {
    backgroundColor: COLORS.background + '80',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.lg,
    elevation: 8,
  },
});

export default LearningPath;