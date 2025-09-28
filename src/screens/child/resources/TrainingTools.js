import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  Vibration,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Text,
  ProgressBar,
  FAB,
  Modal,
  Portal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
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
  header: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subheader: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const TrainingTools = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTools, setActiveTools] = useState(new Set());
  const [toolModalVisible, setToolModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);

  // Tool categories
  const toolCategories = [
    { id: 'all', name: 'All Tools', icon: 'build', color: COLORS.primary },
    { id: 'timers', name: 'Timers', icon: 'timer', color: '#e74c3c' },
    { id: 'tracking', name: 'Tracking', icon: 'analytics', color: '#3498db' },
    { id: 'calculators', name: 'Calculators', icon: 'calculate', color: '#9b59b6' },
    { id: 'games', name: 'Training Games', icon: 'sports-esports', color: '#2ecc71' },
    { id: 'planning', name: 'Planning', icon: 'event', color: '#f39c12' },
  ];

  // Training tools data
  const trainingTools = [
    {
      id: '1',
      name: 'Workout Timer ⏱️',
      category: 'timers',
      type: 'Interactive Tool',
      icon: '⏱️',
      shortDesc: 'Customizable interval training timer',
      description: 'Perfect for HIIT workouts, skill drills, and timed exercises. Set work and rest intervals with visual and audio cues.',
      features: [
        'Custom work/rest intervals',
        'Visual countdown display',
        'Audio alerts and beeps',
        'Preset workout templates',
      ],
      difficulty: 'Beginner',
      ageGroup: '8-18 years',
      usageCount: 1247,
      rating: 4.8,
      color: '#e74c3c',
    },
    {
      id: '2',
      name: 'Progress Tracker 📈',
      category: 'tracking',
      type: 'Monitoring Tool',
      icon: '📈',
      shortDesc: 'Track your training progress over time',
      description: 'Log workouts, track improvements, and visualize your athletic development with charts and graphs.',
      features: [
        'Workout logging',
        'Progress charts',
        'Goal setting and tracking',
        'Achievement badges',
      ],
      difficulty: 'Intermediate',
      ageGroup: '10-18 years',
      usageCount: 892,
      rating: 4.6,
      color: '#3498db',
    },
    {
      id: '3',
      name: 'BMI Calculator 🏃',
      category: 'calculators',
      type: 'Health Tool',
      icon: '🏃',
      shortDesc: 'Calculate Body Mass Index for your age',
      description: 'Age-appropriate BMI calculator with healthy ranges for young athletes and growth considerations.',
      features: [
        'Age-adjusted BMI calculation',
        'Healthy range indicators',
        'Growth tracking over time',
        'Nutrition recommendations',
      ],
      difficulty: 'Beginner',
      ageGroup: '12-18 years',
      usageCount: 634,
      rating: 4.4,
      color: '#9b59b6',
    },
    {
      id: '4',
      name: 'Reaction Time Game ⚡',
      category: 'games',
      type: 'Training Game',
      icon: '⚡',
      shortDesc: 'Improve your reaction speed with fun games',
      description: 'Interactive games designed to improve reaction time, hand-eye coordination, and cognitive speed.',
      features: [
        'Multiple game modes',
        'Reaction time scoring',
        'Leaderboards',
        'Progress tracking',
      ],
      difficulty: 'Beginner',
      ageGroup: '6-18 years',
      usageCount: 2156,
      rating: 4.9,
      color: '#2ecc71',
    },
    {
      id: '5',
      name: 'Training Planner 📅',
      category: 'planning',
      type: 'Organization Tool',
      icon: '📅',
      shortDesc: 'Plan and organize your training schedule',
      description: 'Create weekly training schedules, set reminders, and balance different types of activities.',
      features: [
        'Weekly schedule builder',
        'Activity reminders',
        'Balance tracker',
        'Goal planning',
      ],
      difficulty: 'Intermediate',
      ageGroup: '10-18 years',
      usageCount: 756,
      rating: 4.5,
      color: '#f39c12',
    },
    {
      id: '6',
      name: 'Hydration Tracker 💧',
      category: 'tracking',
      type: 'Health Tool',
      icon: '💧',
      shortDesc: 'Track daily water intake and stay hydrated',
      description: 'Monitor your daily water consumption with reminders and visual progress indicators.',
      features: [
        'Daily intake logging',
        'Hydration reminders',
        'Visual progress bar',
        'Achievement rewards',
      ],
      difficulty: 'Beginner',
      ageGroup: '6-18 years',
      usageCount: 1089,
      rating: 4.7,
      color: '#17a2b8',
    },
    {
      id: '7',
      name: 'Heart Rate Calculator ❤️',
      category: 'calculators',
      type: 'Health Tool',
      icon: '❤️',
      shortDesc: 'Calculate target heart rate zones',
      description: 'Determine your optimal training heart rate zones based on age and fitness goals.',
      features: [
        'Age-based zone calculation',
        'Training intensity guides',
        'Zone explanations',
        'Workout recommendations',
      ],
      difficulty: 'Intermediate',
      ageGroup: '12-18 years',
      usageCount: 445,
      rating: 4.3,
      color: '#dc3545',
    },
    {
      id: '8',
      name: 'Skill Challenge Hub 🎯',
      category: 'games',
      type: 'Training Game',
      icon: '🎯',
      shortDesc: 'Sport-specific skill challenges and drills',
      description: 'Interactive challenges for different sports to improve specific skills and techniques.',
      features: [
        'Sport-specific challenges',
        'Skill progression levels',
        'Video demonstrations',
        'Score tracking',
      ],
      difficulty: 'Advanced',
      ageGroup: '10-18 years',
      usageCount: 823,
      rating: 4.6,
      color: '#fd7e14',
    },
  ];

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = useCallback(() => {
    // Animation entrance
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

    // Load active tools
    loadActiveTools();
  }, []);

  const loadActiveTools = useCallback(() => {
    try {
      // In a real app, this would load from AsyncStorage or Redux
      setActiveTools(new Set(['1', '4', '6']));
    } catch (error) {
      console.error('Error loading active tools:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadActiveTools();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadActiveTools]);

  const filteredTools = trainingTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToolPress = useCallback((tool) => {
    setSelectedTool(tool);
    setToolModalVisible(true);
    Vibration.vibrate(30);
  }, []);

  const handleLaunchTool = useCallback((tool) => {
    Vibration.vibrate(50);
    setToolModalVisible(false);
    
    // Add to active tools
    setActiveTools(prev => new Set([...prev, tool.id]));
    
    Alert.alert(
      `Launching ${tool.name}! 🚀`,
      'Tool is starting up. Get ready for an awesome training session!',
      [
        { text: 'Let\'s Go!', onPress: () => navigation.navigate('ToolInterface', { tool }) },
      ]
    );
  }, [navigation]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Training Tools 🛠️</Text>
        <Text style={styles.headerSubtitle}>
          Digital helpers for smarter training
        </Text>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activeTools.size}</Text>
            <Text style={styles.statLabel}>Active Tools</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{trainingTools.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.round(trainingTools.reduce((sum, tool) => sum + tool.rating, 0) / trainingTools.length * 10) / 10}
            </Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <Surface style={styles.searchContainer} elevation={2}>
      <Searchbar
        placeholder="Search training tools..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
    </Surface>
  );

  const renderCategoryChips = () => (
    <View style={styles.chipContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScrollContent}
      >
        {toolCategories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => {
              setSelectedCategory(category.id);
              Vibration.vibrate(30);
            }}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={selectedCategory === category.id ? styles.selectedChipText : styles.chipText}
            icon={category.icon}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickActions = () => (
    <Card style={styles.quickActionsCard}>
      <Card.Content>
        <Text style={styles.quickActionsTitle}>Quick Actions 🎯</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[styles.quickActionItem, { backgroundColor: '#e74c3c20' }]}
            onPress={() => {
              Vibration.vibrate(30);
              handleLaunchTool(trainingTools[0]);
            }}
          >
            <Icon name="timer" size={24} color="#e74c3c" />
            <Text style={styles.quickActionText}>Start Timer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionItem, { backgroundColor: '#2ecc7120' }]}
            onPress={() => {
              Vibration.vibrate(30);
              handleLaunchTool(trainingTools[3]);
            }}
          >
            <Icon name="sports-esports" size={24} color="#2ecc71" />
            <Text style={styles.quickActionText}>Play Game</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionItem, { backgroundColor: '#3498db20' }]}
            onPress={() => {
              Vibration.vibrate(30);
              handleLaunchTool(trainingTools[1]);
            }}
          >
            <Icon name="analytics" size={24} color="#3498db" />
            <Text style={styles.quickActionText}>Track Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionItem, { backgroundColor: '#f39c1220' }]}
            onPress={() => {
              Vibration.vibrate(30);
              handleLaunchTool(trainingTools[4]);
            }}
          >
            <Icon name="event" size={24} color="#f39c12" />
            <Text style={styles.quickActionText}>Plan Workout</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderToolItem = ({ item }) => {
    const isActive = activeTools.has(item.id);
    
    return (
      <Animated.View
        style={[
          styles.toolItemContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Card 
          style={[styles.toolCard, isActive && styles.activeToolCard]}
          onPress={() => handleToolPress(item)}
          elevation={3}
        >
          <Card.Content>
            <View style={styles.toolHeader}>
              <View style={styles.toolInfo}>
                <View style={[styles.toolIconContainer, { backgroundColor: item.color + '20' }]}>
                  <Text style={styles.toolEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.toolDetails}>
                  <Text style={styles.toolName}>{item.name}</Text>
                  <Text style={styles.toolType}>{item.type}</Text>
                  <Text style={styles.toolDesc}>{item.shortDesc}</Text>
                </View>
              </View>
              {isActive && (
                <View style={styles.activeIndicator}>
                  <Icon name="check-circle" size={20} color={COLORS.success} />
                </View>
              )}
            </View>
            
            <View style={styles.toolMeta}>
              <View style={styles.metaRow}>
                <Chip
                  compact
                  style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(item.difficulty) }]}
                  textStyle={styles.difficultyText}
                >
                  {item.difficulty}
                </Chip>
                <Text style={styles.ageGroup}>{item.ageGroup}</Text>
              </View>
              
              <View style={styles.metaRow}>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.rating}>{item.rating}</Text>
                </View>
                <Text style={styles.usageCount}>{item.usageCount} uses</Text>
              </View>
            </View>
            
            <View style={styles.featuresList}>
              <Text style={styles.featuresTitle}>Key Features:</Text>
              {item.features.slice(0, 2).map((feature, idx) => (
                <Text key={idx} style={styles.featureItem}>• {feature}</Text>
              ))}
              {item.features.length > 2 && (
                <Text style={styles.moreFeatures}>+{item.features.length - 2} more features</Text>
              )}
            </View>
          </Card.Content>
          
          <Card.Actions style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => handleToolPress(item)}
              style={styles.actionButton}
            >
              Learn More
            </Button>
            <Button
              mode="contained"
              onPress={() => handleLaunchTool(item)}
              style={styles.actionButton}
              buttonColor={item.color}
            >
              Launch Tool
            </Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  const renderToolModal = () => (
    <Portal>
      <Modal
        visible={toolModalVisible}
        onDismiss={() => setToolModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedTool && (
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedTool.name}</Text>
                <IconButton
                  icon="close"
                  onPress={() => setToolModalVisible(false)}
                />
              </View>
              
              <Text style={styles.modalDescription}>{selectedTool.description}</Text>
              
              <Text style={styles.featuresTitle}>All Features:</Text>
              {selectedTool.features.map((feature, idx) => (
                <Text key={idx} style={styles.featureItem}>✓ {feature}</Text>
              ))}
              
              <View style={styles.modalMeta}>
                <Text style={styles.metaItem}>Difficulty: {selectedTool.difficulty}</Text>
                <Text style={styles.metaItem}>Age Group: {selectedTool.ageGroup}</Text>
                <Text style={styles.metaItem}>Rating: {selectedTool.rating}/5.0</Text>
              </View>
            </Card.Content>
            
            <Card.Actions>
              <Button
                mode="outlined"
                onPress={() => setToolModalVisible(false)}
              >
                Close
              </Button>
              <Button
                mode="contained"
                onPress={() => handleLaunchTool(selectedTool)}
                buttonColor={selectedTool.color}
              >
                Launch Tool
              </Button>
            </Card.Actions>
          </Card>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <ScrollView
        style={styles.scrollView}
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
        {renderHeader()}
        {renderSearchBar()}
        {renderCategoryChips()}
        {renderQuickActions()}
        
        <View style={styles.toolsList}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Training Tools' : 
             toolCategories.find(c => c.id === selectedCategory)?.name} 
            ({filteredTools.length})
          </Text>
          
          {filteredTools.map((item) => (
            <View key={item.id}>
              {renderToolItem({ item })}
            </View>
          ))}
          
          {filteredTools.length === 0 && (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyState}>
                <Icon name="build" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyStateText}>No tools found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your search or category filter
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {renderToolModal()}

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            'Suggest a Tool! 💡',
            'Have an idea for a training tool that would help young athletes?',
            [
              { text: 'Maybe Later', style: 'cancel' },
              { text: 'Suggest Tool', onPress: () => navigation.navigate('SuggestTool') },
            ]
          );
        }}
      />
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
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.header,
    color: '#ffffff',
    fontSize: 28,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.header,
    color: '#ffffff',
    fontSize: 20,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
    opacity: 0.8,
    fontSize: 12,
  },
  searchContainer: {
    margin: SPACING.md,
    borderRadius: 12,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
  },
  chipContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  chipScrollContent: {
    paddingVertical: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  chipText: {
    color: COLORS.textSecondary,
  },
  selectedChipText: {
    color: '#ffffff',
  },
  quickActionsCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  quickActionsTitle: {
    ...TEXT_STYLES.subheader,
    marginBottom: SPACING.md,
    fontSize: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  quickActionItem: {
    width: (width - SPACING.md * 4) / 2,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
  toolsList: {
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheader,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  toolItemContainer: {
    marginBottom: SPACING.md,
  },
  toolCard: {
    backgroundColor: COLORS.surface,
  },
  activeToolCard: {
    backgroundColor: '#f0fff4',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  toolInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  toolIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  toolEmoji: {
    fontSize: 28,
  },
  toolDetails: {
    flex: 1,
  },
  toolName: {
    ...TEXT_STYLES.subheader,
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  toolType: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  toolDesc: {
    ...TEXT_STYLES.caption,
  },
  activeIndicator: {
    marginTop: SPACING.xs,
  },
  toolMeta: {
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  difficultyChip: {
    height: 24,
  },
  difficultyText: {
    color: '#ffffff',
    fontSize: 12,
  },
  ageGroup: {
    ...TEXT_STYLES.caption,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  usageCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  featuresList: {
    marginBottom: SPACING.sm,
  },
  featuresTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  featureItem: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    marginBottom: 2,
  },
  moreFeatures: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    marginTop: SPACING.xs,
  },
  cardActions: {
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  emptyStateCard: {
    marginTop: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    ...TEXT_STYLES.subheader,
    marginTop: SPACING.md,
  },
  emptyStateSubtext: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.subheader,
    flex: 1,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  modalMeta: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  metaItem: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
})

export default TrainingTools;