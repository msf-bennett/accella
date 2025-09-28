import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  TouchableOpacity,
  Modal,
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
  Badge,
  Switch,
  TextInput,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SupplementTracking = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState(null);
  const [todayIntake, setTodayIntake] = useState({});
  
  const dispatch = useDispatch();
  const { user, supplements } = useSelector(state => state.user);
  const { loading } = useSelector(state => state.app);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    // Entrance animation
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Mock supplement data - in real app this would come from Redux store
  const mySupplements = [
    {
      id: 1,
      name: 'Whey Protein',
      brand: 'Optimum Nutrition',
      category: 'protein',
      icon: '🥛',
      color: '#3498db',
      dosage: '30g',
      frequency: 'twice daily',
      timing: ['post-workout', 'morning'],
      price: 45.99,
      servingsLeft: 28,
      totalServings: 30,
      benefits: ['Muscle growth', 'Recovery', 'Protein synthesis'],
      instructions: 'Mix with 250ml water or milk',
      nextDose: '2:00 PM',
      streak: 7,
      effectiveness: 85,
    },
    {
      id: 2,
      name: 'Creatine Monohydrate',
      brand: 'Creapure',
      category: 'performance',
      icon: '⚡',
      color: '#e74c3c',
      dosage: '5g',
      frequency: 'daily',
      timing: ['anytime'],
      price: 29.99,
      servingsLeft: 45,
      totalServings: 60,
      benefits: ['Strength', 'Power', 'Muscle volume'],
      instructions: 'Mix with water, take anytime',
      nextDose: '6:00 PM',
      streak: 12,
      effectiveness: 92,
    },
    {
      id: 3,
      name: 'Multivitamin',
      brand: 'Nature\'s Way',
      category: 'vitamins',
      icon: '💊',
      color: '#f39c12',
      dosage: '2 tablets',
      frequency: 'daily',
      timing: ['morning'],
      price: 24.99,
      servingsLeft: 12,
      totalServings: 30,
      benefits: ['General health', 'Immunity', 'Energy'],
      instructions: 'Take with breakfast',
      nextDose: '8:00 AM',
      streak: 5,
      effectiveness: 78,
    },
    {
      id: 4,
      name: 'Omega-3',
      brand: 'Nordic Naturals',
      category: 'health',
      icon: '🐟',
      color: '#2ecc71',
      dosage: '1000mg',
      frequency: 'twice daily',
      timing: ['morning', 'evening'],
      price: 35.99,
      servingsLeft: 38,
      totalServings: 60,
      benefits: ['Heart health', 'Brain function', 'Inflammation'],
      instructions: 'Take with meals',
      nextDose: '7:30 PM',
      streak: 15,
      effectiveness: 88,
    },
    {
      id: 5,
      name: 'Pre-Workout',
      brand: 'C4 Original',
      category: 'pre-workout',
      icon: '🔥',
      color: '#9b59b6',
      dosage: '1 scoop',
      frequency: 'as needed',
      timing: ['pre-workout'],
      price: 32.99,
      servingsLeft: 18,
      totalServings: 30,
      benefits: ['Energy', 'Focus', 'Pump'],
      instructions: '30 minutes before workout',
      nextDose: 'Before workout',
      streak: 3,
      effectiveness: 90,
    },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: 'medication', count: mySupplements.length },
    { id: 'protein', label: 'Protein', icon: 'fitness-center', count: 1 },
    { id: 'performance', label: 'Performance', icon: 'flash-on', count: 2 },
    { id: 'vitamins', label: 'Vitamins', icon: 'healing', count: 1 },
    { id: 'health', label: 'Health', icon: 'favorite', count: 1 },
  ];

  const todaysSchedule = [
    { time: '8:00 AM', supplements: ['Multivitamin', 'Omega-3'], status: 'completed' },
    { time: '12:00 PM', supplements: ['Whey Protein'], status: 'pending' },
    { time: '5:30 PM', supplements: ['Pre-Workout'], status: 'upcoming' },
    { time: '6:30 PM', supplements: ['Creatine'], status: 'upcoming' },
    { time: '7:30 PM', supplements: ['Omega-3'], status: 'upcoming' },
    { time: '9:00 PM', supplements: ['Whey Protein'], status: 'upcoming' },
  ];

  const filteredSupplements = selectedCategory === 'all' 
    ? mySupplements 
    : mySupplements.filter(sup => sup.category === selectedCategory);

  const completedToday = Object.keys(todayIntake).length;
  const totalToday = todaysSchedule.reduce((acc, schedule) => acc + schedule.supplements.length, 0);
  const completionRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  const handleSupplementTaken = (supplementId, scheduleTime) => {
    const key = `${supplementId}-${scheduleTime}`;
    setTodayIntake(prev => ({
      ...prev,
      [key]: new Date().toISOString()
    }));
    
    Alert.alert(
      'Supplement Logged! 🎉', 
      'Great job staying consistent with your regimen!',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderCategoryTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.selectedCategoryChip
          ]}
        >
          <Icon 
            name={category.icon} 
            size={20} 
            color={selectedCategory === category.id ? '#fff' : COLORS.primary} 
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id && styles.selectedCategoryText
          ]}>
            {category.label}
          </Text>
          <Badge 
            size={18} 
            style={[
              styles.categoryBadge,
              selectedCategory === category.id && styles.selectedCategoryBadge
            ]}
          >
            {category.count}
          </Badge>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTodaysProgress = () => (
    <Card style={styles.progressCard}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>Today's Progress 📊</Text>
          <Text style={styles.progressSubtitle}>
            {completedToday} of {totalToday} supplements taken
          </Text>
        </View>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercentage}>{Math.round(completionRate)}%</Text>
        </View>
      </LinearGradient>
      
      <Card.Content style={styles.progressContent}>
        <ProgressBar 
          progress={completionRate / 100} 
          color={COLORS.success}
          style={styles.progressBar}
        />
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{completedToday}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="schedule" size={20} color={COLORS.warning} />
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={styles.statValue}>{totalToday - completedToday}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="trending-up" size={20} color={COLORS.primary} />
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>7 days</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTodaysSchedule = () => (
    <Card style={styles.scheduleCard}>
      <Card.Content>
        <View style={styles.cardTitleRow}>
          <Icon name="today" size={24} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Today's Schedule ⏰</Text>
        </View>
        
        {todaysSchedule.map((schedule, index) => (
          <Surface key={index} style={[
            styles.scheduleItem,
            schedule.status === 'completed' && styles.completedSchedule,
            schedule.status === 'pending' && styles.pendingSchedule
          ]}>
            <View style={styles.scheduleTime}>
              <Text style={[
                styles.timeText,
                schedule.status === 'completed' && styles.completedText
              ]}>
                {schedule.time}
              </Text>
              {schedule.status === 'completed' && (
                <Icon name="check-circle" size={16} color={COLORS.success} />
              )}
              {schedule.status === 'pending' && (
                <Icon name="notifications" size={16} color={COLORS.warning} />
              )}
            </View>
            
            <View style={styles.scheduleSupplements}>
              {schedule.supplements.map((supplement, supIndex) => (
                <View key={supIndex} style={styles.supplementPill}>
                  <Text style={styles.supplementPillText}>{supplement}</Text>
                  {schedule.status === 'pending' && (
                    <TouchableOpacity
                      onPress={() => handleSupplementTaken(supplement, schedule.time)}
                      style={styles.takeButton}
                    >
                      <Icon name="add" size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderSupplementCard = (supplement) => (
    <Card key={supplement.id} style={styles.supplementCard}>
      <TouchableOpacity
        onPress={() => setSelectedSupplement(supplement)}
        style={styles.supplementTouchable}
      >
        <Card.Content style={styles.supplementContent}>
          <View style={styles.supplementHeader}>
            <View style={[styles.supplementIcon, { backgroundColor: supplement.color + '20' }]}>
              <Text style={styles.supplementEmoji}>{supplement.icon}</Text>
            </View>
            
            <View style={styles.supplementInfo}>
              <Text style={styles.supplementName}>{supplement.name}</Text>
              <Text style={styles.supplementBrand}>{supplement.brand}</Text>
              <Text style={styles.supplementDosage}>{supplement.dosage} • {supplement.frequency}</Text>
            </View>
            
            <View style={styles.supplementStats}>
              <Surface style={styles.effectivenessChip}>
                <Text style={styles.effectivenessText}>{supplement.effectiveness}%</Text>
              </Surface>
              <Text style={styles.streakText}>{supplement.streak} day streak 🔥</Text>
            </View>
          </View>
          
          <View style={styles.supplementProgress}>
            <Text style={styles.progressLabel}>
              Supply: {supplement.servingsLeft}/{supplement.totalServings} servings
            </Text>
            <ProgressBar 
              progress={supplement.servingsLeft / supplement.totalServings}
              color={supplement.servingsLeft < 10 ? COLORS.error : COLORS.success}
              style={styles.supplyBar}
            />
          </View>
          
          <View style={styles.supplementFooter}>
            <View style={styles.nextDose}>
              <Icon name="schedule" size={16} color={COLORS.textLight} />
              <Text style={styles.nextDoseText}>Next: {supplement.nextDose}</Text>
            </View>
            
            <View style={styles.supplementActions}>
              <Button
                mode="outlined"
                compact
                onPress={() => handleSupplementTaken(supplement.id, 'manual')}
                style={styles.takeNowButton}
                labelStyle={styles.takeNowText}
              >
                Take Now
              </Button>
            </View>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const renderSupplementModal = () => (
    <Modal
      visible={!!selectedSupplement}
      animationType="slide"
      transparent
      onRequestClose={() => setSelectedSupplement(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedSupplement && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setSelectedSupplement(null)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              
              <LinearGradient colors={[selectedSupplement.color, selectedSupplement.color + '80']} style={styles.modalTop}>
                <Text style={styles.modalEmoji}>{selectedSupplement.icon}</Text>
                <Text style={styles.modalTitle}>{selectedSupplement.name}</Text>
                <Text style={styles.modalBrand}>{selectedSupplement.brand}</Text>
              </LinearGradient>
              
              <ScrollView style={styles.modalScroll}>
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Dosage & Timing</Text>
                  <Surface style={styles.dosageCard}>
                    <Text style={styles.dosageText}>{selectedSupplement.dosage}</Text>
                    <Text style={styles.frequencyText}>{selectedSupplement.frequency}</Text>
                    <Text style={styles.instructionsText}>{selectedSupplement.instructions}</Text>
                  </Surface>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Benefits</Text>
                  <View style={styles.benefitsList}>
                    {selectedSupplement.benefits.map((benefit, index) => (
                      <Surface key={index} style={styles.benefitChip}>
                        <Icon name="star" size={16} color={COLORS.primary} />
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </Surface>
                    ))}
                  </View>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Statistics</Text>
                  <View style={styles.statsGrid}>
                    <Surface style={styles.statCard}>
                      <Icon name="trending-up" size={20} color={COLORS.success} />
                      <Text style={styles.statCardLabel}>Effectiveness</Text>
                      <Text style={styles.statCardValue}>{selectedSupplement.effectiveness}%</Text>
                    </Surface>
                    
                    <Surface style={styles.statCard}>
                      <Icon name="local-fire-department" size={20} color={COLORS.warning} />
                      <Text style={styles.statCardLabel}>Current Streak</Text>
                      <Text style={styles.statCardValue}>{selectedSupplement.streak} days</Text>
                    </Surface>
                  </View>
                </View>
                
                <View style={styles.modalActions}>
                  <Button
                    mode="contained"
                    onPress={() => {
                      handleSupplementTaken(selectedSupplement.id, 'manual');
                      setSelectedSupplement(null);
                    }}
                    style={styles.modalButton}
                    buttonColor={selectedSupplement.color}
                  >
                    Mark as Taken
                  </Button>
                  
                  <Button
                    mode="outlined"
                    onPress={() => Alert.alert('Feature Coming Soon', 'Edit supplement functionality will be available soon!')}
                    style={styles.modalButton}
                  >
                    Edit Settings
                  </Button>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <Surface style={styles.quickStat}>
        <Icon name="medication" size={20} color={COLORS.primary} />
        <Text style={styles.quickStatLabel}>Active</Text>
        <Text style={styles.quickStatValue}>{mySupplements.length}</Text>
      </Surface>
      
      <Surface style={styles.quickStat}>
        <Icon name="attach-money" size={20} color={COLORS.success} />
        <Text style={styles.quickStatLabel}>Monthly Cost</Text>
        <Text style={styles.quickStatValue}>$168</Text>
      </Surface>
      
      <Surface style={styles.quickStat}>
        <Icon name="trending-up" size={20} color={COLORS.warning} />
        <Text style={styles.quickStatLabel}>Avg. Effectiveness</Text>
        <Text style={styles.quickStatValue}>87%</Text>
      </Surface>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Supplement Tracking 💊</Text>
        <Text style={styles.headerSubtitle}>Stay consistent with your supplement regimen</Text>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          },
        ]}
      >
        {/* Category Tabs */}
        <View style={styles.categoriesContainer}>
          {renderCategoryTabs()}
        </View>

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
          {/* Today's Progress */}
          {renderTodaysProgress()}

          {/* Quick Stats */}
          {renderQuickStats()}

          {/* Today's Schedule */}
          {renderTodaysSchedule()}

          {/* Search Bar */}
          <Searchbar
            placeholder="Search supplements..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />

          {/* My Supplements */}
          <View style={styles.supplementsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Supplements ({filteredSupplements.length})</Text>
              <Button
                mode="text"
                onPress={() => Alert.alert('Feature Coming Soon', 'Add supplement functionality will be available soon!')}
                labelStyle={styles.addButtonText}
              >
                Add New
              </Button>
            </View>
            
            {filteredSupplements.map((supplement) => renderSupplementCard(supplement))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Supplement Detail Modal */}
      {renderSupplementModal()}

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Feature Coming Soon', 'Quick add supplement functionality will be available soon!')}
        color="#fff"
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  categoriesContainer: {
    paddingVertical: SPACING.lg,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 25,
    elevation: 2,
    minWidth: 100,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    marginRight: SPACING.xs,
    fontWeight: 'bold',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + '20',
  },
  selectedCategoryBadge: {
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  progressCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  progressSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressContent: {
    padding: SPACING.lg,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
  },
  quickStat: {
    flex: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    alignItems: 'center',
  },
  quickStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  quickStatValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  scheduleCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginLeft: SPACING.md,
    fontWeight: 'bold',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: '#f8f9ff',
    elevation: 1,
  },
  completedSchedule: {
    backgroundColor: '#e8f5e8',
    opacity: 0.8,
  },
  pendingSchedule: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  scheduleTime: {
    width: 80,
    alignItems: 'center',
  },
  timeText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  scheduleSupplements: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  supplementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginVertical: SPACING.xs,
    borderRadius: 20,
    elevation: 1,
  },
  supplementPillText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    flex: 1,
  },
  takeButton: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  searchBar: {
    marginVertical: SPACING.md,
    backgroundColor: '#fff',
    elevation: 2,
  },
  supplementsSection: {
    marginVertical: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  addButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  supplementCard: {
    marginVertical: SPACING.sm,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  supplementTouchable: {
    borderRadius: 16,
  },
  supplementContent: {
    padding: SPACING.lg,
  },
  supplementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  supplementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  supplementEmoji: {
    fontSize: 24,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  supplementBrand: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  supplementDosage: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  supplementStats: {
    alignItems: 'flex-end',
  },
  effectivenessChip: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginBottom: SPACING.xs,
  },
  effectivenessText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  streakText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    fontWeight: 'bold',
  },
  supplementProgress: {
    marginBottom: SPACING.md,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  supplyBar: {
    height: 6,
    borderRadius: 3,
  },
  supplementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextDose: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nextDoseText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
  supplementActions: {
    flexDirection: 'row',
  },
  takeNowButton: {
    borderColor: COLORS.success,
    borderWidth: 1,
  },
  takeNowText: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '60%',
  },
  modalHeader: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
  closeButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modalTop: {
    padding: SPACING.xl,
    paddingTop: SPACING.xl + 20,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalBrand: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  modalScroll: {
    flex: 1,
  },
  modalSection: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dosageCard: {
    backgroundColor: '#f8f9ff',
    padding: SPACING.lg,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  dosageText: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  frequencyText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontWeight: 'bold',
  },
  instructionsText: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  benefitsList: {
    marginTop: SPACING.md,
  },
  benefitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginVertical: SPACING.xs,
  },
  benefitText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.lg,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    elevation: 1,
  },
  statCardLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  statCardValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  modalActions: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  modalButton: {
    marginVertical: SPACING.sm,
    borderRadius: 25,
    paddingVertical: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
    backgroundColor: COLORS.primary,
  },
};

export default SupplementTracking.js