import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
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
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const RecoveryProtocols = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const recoveryData = useSelector(state => state.recovery);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeProtocol, setActiveProtocol] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sleepHours, setSleepHours] = useState(8);
  const [hydrationLevel, setHydrationLevel] = useState(75);
  const [stressLevel, setStressLevel] = useState(3);
  const [selectedRecoveryType, setSelectedRecoveryType] = useState(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Recovery categories
  const recoveryCategories = [
    { id: 'all', label: 'All', icon: 'view-grid', color: COLORS.primary },
    { id: 'sleep', label: 'Sleep', icon: 'bedtime', color: '#9c27b0' },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant', color: '#4caf50' },
    { id: 'hydration', label: 'Hydration', icon: 'local-drink', color: '#2196f3' },
    { id: 'mobility', label: 'Mobility', icon: 'accessibility', color: '#ff9800' },
    { id: 'mental', label: 'Mental', icon: 'psychology', color: '#e91e63' },
  ];
  
  // Sample recovery protocols data
  const recoveryProtocols = [
    {
      id: 1,
      title: 'Post-Workout Recovery',
      category: 'mobility',
      duration: '15 min',
      difficulty: 'Easy',
      description: 'Essential stretching and cool-down routine',
      steps: ['Light cardio (5 min)', 'Dynamic stretching', 'Foam rolling', 'Static stretches'],
      benefits: ['Reduces muscle soreness', 'Improves flexibility', 'Prevents injury'],
      completed: false,
      rating: 4.8,
      image: '🧘‍♀️',
    },
    {
      id: 2,
      title: 'Sleep Optimization Protocol',
      category: 'sleep',
      duration: '30 min',
      difficulty: 'Easy',
      description: 'Evening routine for better sleep quality',
      steps: ['No screens 1h before bed', 'Room temperature 65-68°F', 'Meditation', 'Deep breathing'],
      benefits: ['Better sleep quality', 'Faster recovery', 'Enhanced performance'],
      completed: true,
      rating: 4.9,
      image: '😴',
    },
    {
      id: 3,
      title: 'Hydration Protocol',
      category: 'hydration',
      duration: 'All day',
      difficulty: 'Easy',
      description: 'Optimal hydration strategy for athletes',
      steps: ['Morning: 16-20oz water', '2oz per lb body weight daily', 'Electrolytes post-workout', 'Monitor urine color'],
      benefits: ['Optimal performance', 'Better recovery', 'Reduced fatigue'],
      completed: false,
      rating: 4.7,
      image: '💧',
    },
    {
      id: 4,
      title: 'Stress Management',
      category: 'mental',
      duration: '20 min',
      difficulty: 'Medium',
      description: 'Mental recovery and stress reduction techniques',
      steps: ['Mindfulness meditation', 'Progressive muscle relaxation', 'Gratitude journaling', 'Visualization'],
      benefits: ['Reduced stress', 'Better focus', 'Improved mood'],
      completed: false,
      rating: 4.6,
      image: '🧠',
    },
    {
      id: 5,
      title: 'Recovery Nutrition',
      category: 'nutrition',
      duration: '2 hours',
      difficulty: 'Easy',
      description: 'Post-workout nutrition for optimal recovery',
      steps: ['Protein within 30 min', 'Carbs for glycogen', 'Anti-inflammatory foods', 'Adequate calories'],
      benefits: ['Muscle repair', 'Glycogen replenishment', 'Reduced inflammation'],
      completed: true,
      rating: 4.8,
      image: '🥗',
    },
  ];
  
  // Recovery metrics
  const recoveryMetrics = {
    sleepScore: 85,
    recoveryScore: 78,
    stressLevel: 3,
    hydrationLevel: 75,
    completedProtocols: 2,
    totalProtocols: 5,
    weeklyStreak: 4,
  };

  useEffect(() => {
    // Initialize animations
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleProtocolSelect = (protocol) => {
    setActiveProtocol(protocol);
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  const handleStartProtocol = () => {
    Alert.alert(
      'Start Recovery Protocol',
      `Starting "${activeProtocol?.title}". This feature is under development.`,
      [{ text: 'OK', style: 'default' }]
    );
    setModalVisible(false);
  };

  const handleCompleteProtocol = (protocolId) => {
    Alert.alert(
      'Protocol Completed! 🎉',
      'Great job on completing your recovery protocol. Keep up the excellent work!',
      [{ text: 'Awesome!', style: 'default' }]
    );
    Vibration.vibrate(100);
  };

  const filteredProtocols = recoveryProtocols.filter(protocol => {
    const matchesSearch = protocol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         protocol.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || protocol.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const RecoveryMetricsCard = () => (
    <Card style={styles.metricsCard}>
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.metricsGradient}
      >
        <View style={styles.metricsHeader}>
          <Text style={styles.metricsTitle}>Recovery Dashboard</Text>
          <Icon name="analytics" size={24} color="white" />
        </View>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{recoveryMetrics.recoveryScore}</Text>
            <Text style={styles.metricLabel}>Recovery Score</Text>
            <ProgressBar 
              progress={recoveryMetrics.recoveryScore / 100} 
              color="white"
              style={styles.progressBar}
            />
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{recoveryMetrics.sleepScore}</Text>
            <Text style={styles.metricLabel}>Sleep Quality</Text>
            <ProgressBar 
              progress={recoveryMetrics.sleepScore / 100} 
              color="#90caf9"
              style={styles.progressBar}
            />
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{recoveryMetrics.weeklyStreak}</Text>
            <Text style={styles.metricLabel}>Day Streak 🔥</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {recoveryMetrics.completedProtocols}/{recoveryMetrics.totalProtocols}
            </Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const CategoryChips = () => (
    <View style={styles.categoryContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {recoveryCategories.map(category => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === category.id && { color: 'white' }
            ]}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const ProtocolCard = ({ protocol }) => (
    <Card style={styles.protocolCard}>
      <TouchableOpacity onPress={() => handleProtocolSelect(protocol)}>
        <Card.Content>
          <View style={styles.protocolHeader}>
            <View style={styles.protocolIcon}>
              <Text style={styles.protocolEmoji}>{protocol.image}</Text>
            </View>
            <View style={styles.protocolInfo}>
              <Text style={styles.protocolTitle}>{protocol.title}</Text>
              <Text style={styles.protocolDescription}>{protocol.description}</Text>
              <View style={styles.protocolMeta}>
                <Chip 
                  compact 
                  style={styles.durationChip}
                  textStyle={styles.chipText}
                  icon="schedule"
                >
                  {protocol.duration}
                </Chip>
                <Chip 
                  compact 
                  style={styles.difficultyChip}
                  textStyle={styles.chipText}
                  icon="trending-up"
                >
                  {protocol.difficulty}
                </Chip>
                <View style={styles.rating}>
                  <Icon name="star" size={16} color="#ffc107" />
                  <Text style={styles.ratingText}>{protocol.rating}</Text>
                </View>
              </View>
            </View>
            {protocol.completed && (
              <Icon name="check-circle" size={24} color={COLORS.success} />
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Benefits:</Text>
            <View style={styles.benefitsList}>
              {protocol.benefits.slice(0, 2).map((benefit, index) => (
                <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
              ))}
            </View>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const ProtocolModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <BlurView intensity={20} style={styles.blurContainer}>
          {activeProtocol && (
            <View style={styles.modalInner}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{activeProtocol.title}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>
              
              <ScrollView style={styles.modalScroll}>
                <View style={styles.modalIconContainer}>
                  <Text style={styles.modalEmoji}>{activeProtocol.image}</Text>
                </View>
                
                <Text style={styles.modalDescription}>
                  {activeProtocol.description}
                </Text>
                
                <View style={styles.modalMeta}>
                  <Chip icon="schedule" style={styles.modalChip}>
                    {activeProtocol.duration}
                  </Chip>
                  <Chip icon="trending-up" style={styles.modalChip}>
                    {activeProtocol.difficulty}
                  </Chip>
                </View>
                
                <Text style={styles.stepsTitle}>Protocol Steps:</Text>
                {activeProtocol.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
                
                <Text style={styles.benefitsModalTitle}>Key Benefits:</Text>
                {activeProtocol.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitModalItem}>
                    <Icon name="check-circle" size={16} color={COLORS.success} />
                    <Text style={styles.benefitModalText}>{benefit}</Text>
                  </View>
                ))}
              </ScrollView>
              
              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={handleStartProtocol}
                  style={styles.startButton}
                  contentStyle={styles.buttonContent}
                  icon="play-arrow"
                >
                  Start Protocol
                </Button>
              </View>
            </View>
          )}
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Recovery Protocols</Text>
          <Text style={styles.headerSubtitle}>Optimize your recovery journey 🌟</Text>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
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
          <RecoveryMetricsCard />
          
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search recovery protocols..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              iconColor={COLORS.primary}
            />
          </View>
          
          <CategoryChips />
          
          <View style={styles.protocolsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Recovery Protocols ({filteredProtocols.length})
              </Text>
              <IconButton
                icon="filter-list"
                size={24}
                iconColor={COLORS.primary}
                onPress={() => Alert.alert('Filter', 'Advanced filtering coming soon!')}
              />
            </View>
            
            {filteredProtocols.length === 0 ? (
              <Surface style={styles.emptyState}>
                <Icon name="search-off" size={48} color={COLORS.text.secondary} />
                <Text style={styles.emptyStateText}>
                  No protocols found matching your search
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  Clear Search
                </Button>
              </Surface>
            ) : (
              filteredProtocols.map(protocol => (
                <ProtocolCard key={protocol.id} protocol={protocol} />
              ))
            )}
          </View>
        </ScrollView>
      </Animated.View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Custom Protocol', 'Create custom recovery protocol feature coming soon!')}
        color="white"
      />

      <ProtocolModal />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading1,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body2,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  metricsCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    elevation: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  metricsGradient: {
    padding: SPACING.lg,
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  metricsTitle: {
    ...TEXT_STYLES.heading2,
    color: 'white',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  metricValue: {
    ...TEXT_STYLES.heading1,
    color: 'white',
    fontSize: 28,
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body1,
  },
  categoryContainer: {
    marginTop: SPACING.lg,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  categoryChipText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  protocolsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.heading2,
    color: COLORS.text.primary,
  },
  protocolCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 16,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  protocolIcon: {
    marginRight: SPACING.md,
  },
  protocolEmoji: {
    fontSize: 32,
  },
  protocolInfo: {
    flex: 1,
  },
  protocolTitle: {
    ...TEXT_STYLES.heading3,
    marginBottom: SPACING.xs,
  },
  protocolDescription: {
    ...TEXT_STYLES.body2,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  protocolMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  durationChip: {
    backgroundColor: '#e3f2fd',
  },
  difficultyChip: {
    backgroundColor: '#f3e5f5',
  },
  chipText: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    marginLeft: 2,
    fontWeight: '600',
  },
  divider: {
    marginVertical: SPACING.md,
  },
  benefitsSection: {
    marginTop: SPACING.xs,
  },
  benefitsTitle: {
    ...TEXT_STYLES.body1,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  benefitsList: {
    gap: 2,
  },
  benefitItem: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
  },
  emptyStateText: {
    ...TEXT_STYLES.body1,
    color: COLORS.text.secondary,
    marginVertical: SPACING.md,
    textAlign: 'center',
  },
  clearButton: {
    borderColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  // Modal styles
  modalContent: {
    margin: SPACING.lg,
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: height * 0.8,
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  modalInner: {
    padding: SPACING.lg,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.heading2,
    flex: 1,
  },
  modalScroll: {
    flex: 1,
  },
  modalIconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalEmoji: {
    fontSize: 64,
  },
  modalDescription: {
    ...TEXT_STYLES.body1,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text.secondary,
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  modalChip: {
    backgroundColor: '#f5f5f5',
  },
  stepsTitle: {
    ...TEXT_STYLES.heading3,
    marginBottom: SPACING.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    ...TEXT_STYLES.body2,
    flex: 1,
    lineHeight: 20,
  },
  benefitsModalTitle: {
    ...TEXT_STYLES.heading3,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  benefitModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  benefitModalText: {
    ...TEXT_STYLES.body2,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  modalActions: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  buttonContent: {
    height: 48,
  },
};

export default RecoveryProtocols;