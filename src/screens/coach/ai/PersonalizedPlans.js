import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Vibration,
  TouchableOpacity,
  Modal,
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
  Searchbar,
  Portal,
  ActivityIndicator,
  TextInput,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectPersonalizedPlans, 
  selectPlansLoading,
  selectPlansByCategory 
} from '../../../store/selectors/plansSelector';

// Constants
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
  border: '#e0e0e0',
  accent: '#9C27B0',
  info: '#2196F3',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};

const { width, height } = Dimensions.get('window');

const PersonalizedPlans = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const players = useSelector(state => state.players.players);
  const plans = useSelector(state => state.plans.personalizedPlans);
  const plansLoading = useSelector(state => state.plans.loading);
  const plansError = useSelector(state => state.plans.error);
  
  // Local state
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [personalizedPlans, setPersonalizedPlans] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    playerId: '',
    goals: [],
    sport: '',
    level: '',
    duration: '',
    preferences: '',
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Plan categories
  const categories = [
    { id: 'all', label: 'All Plans', icon: 'grid-view', color: COLORS.primary },
    { id: 'strength', label: 'Strength', icon: 'fitness-center', color: COLORS.error },
    { id: 'cardio', label: 'Cardio', icon: 'favorite', color: COLORS.success },
    { id: 'skill', label: 'Technical', icon: 'sports-soccer', color: COLORS.warning },
    { id: 'recovery', label: 'Recovery', icon: 'spa', color: COLORS.info },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant', color: COLORS.accent },
  ];

  // Goal options
  const goalOptions = [
    { id: 'strength', label: 'Build Strength', icon: 'fitness-center' },
    { id: 'endurance', label: 'Improve Endurance', icon: 'favorite' },
    { id: 'speed', label: 'Increase Speed', icon: 'flash-on' },
    { id: 'flexibility', label: 'Enhance Flexibility', icon: 'accessibility' },
    { id: 'weight', label: 'Weight Management', icon: 'monitor-weight' },
    { id: 'skill', label: 'Technical Skills', icon: 'sports-soccer' },
    { id: 'recovery', label: 'Recovery & Rest', icon: 'spa' },
    { id: 'nutrition', label: 'Nutrition Plan', icon: 'restaurant' },
  ];

  // Mock data for demonstration
  const mockPlans = [
    {
      id: 1,
      title: '🔥 Elite Performance Program',
      playerName: 'John Smith',
      playerId: 'player_1',
      sport: 'Football',
      level: 'Advanced',
      duration: '12 weeks',
      category: 'strength',
      goals: ['Build Strength', 'Increase Speed'],
      progress: 68,
      completedSessions: 34,
      totalSessions: 50,
      nextSession: 'Upper Body Power',
      difficulty: 'Hard',
      aiScore: 94,
      adaptations: 3,
      lastUpdated: '2 days ago',
      status: 'active',
      description: 'Comprehensive strength and conditioning program designed for elite football players.',
      weeklySchedule: ['Mon: Strength', 'Tue: Speed', 'Wed: Recovery', 'Thu: Power', 'Fri: Agility', 'Sat: Game', 'Sun: Rest'],
      nutritionPlan: true,
      recoveryPlan: true,
      estimatedResults: 'Expect 15% strength gain and 8% speed improvement',
    },
    {
      id: 2,
      title: '💨 Speed Development Track',
      playerName: 'Emma Johnson',
      playerId: 'player_2',
      sport: 'Track & Field',
      level: 'Intermediate',
      duration: '8 weeks',
      category: 'cardio',
      goals: ['Increase Speed', 'Improve Endurance'],
      progress: 45,
      completedSessions: 18,
      totalSessions: 40,
      nextSession: 'Sprint Intervals',
      difficulty: 'Medium',
      aiScore: 88,
      adaptations: 1,
      lastUpdated: '1 day ago',
      status: 'active',
      description: 'Specialized speed development program focusing on sprint technique and power.',
      weeklySchedule: ['Mon: Speed Work', 'Tue: Endurance', 'Wed: Technique', 'Thu: Power', 'Fri: Speed', 'Sat: Competition', 'Sun: Recovery'],
      nutritionPlan: false,
      recoveryPlan: true,
      estimatedResults: 'Projected 12% improvement in 100m time',
    },
    {
      id: 3,
      title: '🧘 Recovery & Wellness',
      playerName: 'Michael Davis',
      playerId: 'player_3',
      sport: 'Basketball',
      level: 'Professional',
      duration: '4 weeks',
      category: 'recovery',
      goals: ['Recovery & Rest', 'Enhance Flexibility'],
      progress: 25,
      completedSessions: 5,
      totalSessions: 20,
      nextSession: 'Mobility Flow',
      difficulty: 'Easy',
      aiScore: 91,
      adaptations: 0,
      lastUpdated: '3 hours ago',
      status: 'active',
      description: 'Injury prevention and recovery-focused program for professional athletes.',
      weeklySchedule: ['Daily: 30min mobility', 'Every other day: Recovery session'],
      nutritionPlan: true,
      recoveryPlan: true,
      estimatedResults: 'Reduced injury risk by 40% and improved flexibility',
    },
  ];

  const mockRecommendations = [
    {
      id: 1,
      type: 'plan_suggestion',
      title: '🎯 Recommended: Power Development Program',
      description: 'Based on recent performance data, a power-focused plan could improve explosive strength by 18%',
      confidence: 89,
      estimatedDuration: '10 weeks',
      targetPlayers: ['John Smith', 'Emma Johnson'],
    },
    {
      id: 2,
      type: 'adaptation',
      title: '🔄 Plan Adaptation Available',
      description: 'Current strength plan can be optimized based on recovery metrics',
      confidence: 94,
      estimatedDuration: 'Immediate',
      targetPlayers: ['Michael Davis'],
    },
    {
      id: 3,
      type: 'nutrition',
      title: '🥗 Nutrition Enhancement',
      description: 'Adding personalized nutrition plans could boost performance results by 15%',
      confidence: 76,
      estimatedDuration: '2 weeks setup',
      targetPlayers: ['All active players'],
    },
  ];

  // Initialize component
  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    filterPlans();
  }, [searchQuery, selectedCategory]);

  const initializeScreen = useCallback(async () => {
    try {
      setLoading(true);
      
      // Animate screen entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Load initial data
      await loadPersonalizedPlans();
      setPersonalizedPlans(mockPlans);
      setAiRecommendations(mockRecommendations);
      
    } catch (error) {
      console.error('Error initializing screen:', error);
      Alert.alert('Error', 'Failed to load personalized plans');
    } finally {
      setLoading(false);
    }
  }, [fadeAnim, slideAnim, scaleAnim]);

  const loadPersonalizedPlans = async () => {
    // Simulate API call
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const filterPlans = useCallback(() => {
    let filtered = mockPlans;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(plan => plan.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(plan => 
        plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.sport.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setPersonalizedPlans(filtered);
  }, [searchQuery, selectedCategory]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadPersonalizedPlans();
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate refresh delay
      Vibration.vibrate(50);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    Vibration.vibrate(30);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowDetailModal(true);
    Vibration.vibrate(50);
  };

  const handleCreatePlan = () => {
    setShowCreateModal(true);
    setNewPlanForm({
      playerId: '',
      goals: [],
      sport: '',
      level: '',
      duration: '',
      preferences: '',
    });
    Vibration.vibrate(50);
  };

  const handleGenerateAIPlan = async () => {
    if (!newPlanForm.playerId || newPlanForm.goals.length === 0) {
      Alert.alert('Missing Information', 'Please select a player and at least one goal.');
      return;
    }

    try {
      setGeneratingPlan(true);
      
      // Simulate AI plan generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      Alert.alert(
        'Plan Generated! 🎉',
        'Your personalized training plan has been created successfully.',
        [
          {
            text: 'View Plan',
            onPress: () => {
              setShowCreateModal(false);
              // Navigate to generated plan
            },
          },
          { text: 'Create Another', style: 'cancel' },
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to generate plan. Please try again.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleGoalToggle = (goalId) => {
    const currentGoals = newPlanForm.goals;
    const updatedGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(g => g !== goalId)
      : [...currentGoals, goalId];
    
    setNewPlanForm(prev => ({ ...prev, goals: updatedGoals }));
    Vibration.vibrate(20);
  };

  const handleAdaptPlan = (planId) => {
    Alert.alert(
      'Adapt Plan',
      'AI will analyze current performance and adapt this plan for optimal results.',
      [
        {
          text: 'Adapt Now',
          onPress: () => {
            // Implement plan adaptation logic
            Alert.alert('Success', 'Plan has been adapted based on latest performance data! 🔄');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>🤖 Personalized Plans</Text>
        <Text style={styles.headerSubtitle}>AI-crafted training programs</Text>
      </View>
      <IconButton
        icon="auto-awesome"
        iconColor={COLORS.surface}
        size={24}
        onPress={handleCreatePlan}
        style={styles.headerAction}
      />
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <Surface style={styles.searchContainer} elevation={2}>
      <Searchbar
        placeholder="Search plans, players, sports..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
        inputStyle={{ color: COLORS.text }}
      />
    </Surface>
  );

  const renderCategorySelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>📂 Plan Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
        {categories.map((category) => (
          <Chip
            key={category.id}
            mode={selectedCategory === category.id ? 'flat' : 'outlined'}
            selected={selectedCategory === category.id}
            onPress={() => handleCategorySelect(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={[
              styles.chipText,
              selectedCategory === category.id && { color: COLORS.surface }
            ]}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderAIRecommendations = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>💡 AI Recommendations</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {aiRecommendations.map((rec) => (
          <Card key={rec.id} style={styles.recommendationCard} elevation={3}>
            <Card.Content style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
              <Text style={styles.recommendationDescription} numberOfLines={3}>
                {rec.description}
              </Text>
              <View style={styles.recommendationFooter}>
                <View style={styles.confidenceContainer}>
                  <Icon name="psychology" size={16} color={COLORS.primary} />
                  <Text style={styles.confidenceText}>{rec.confidence}% confident</Text>
                </View>
                <Button
                  mode="contained"
                  compact
                  style={styles.recommendationButton}
                  labelStyle={styles.recommendationButtonText}
                  onPress={() => Alert.alert('AI Recommendation', 'Feature coming soon! 🤖')}
                >
                  Apply
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderPlanCard = ({ item: plan }) => (
    <TouchableOpacity onPress={() => handlePlanSelect(plan)}>
      <Card style={styles.planCard} elevation={4}>
        <Card.Content>
          <View style={styles.planHeader}>
            <View style={styles.planTitleContainer}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <View style={styles.planMetadata}>
                <Chip
                  mode="flat"
                  compact
                  style={[styles.statusChip, { backgroundColor: COLORS.success }]}
                  textStyle={{ color: COLORS.surface, fontSize: 10 }}
                >
                  {plan.status.toUpperCase()}
                </Chip>
                <Text style={styles.planDuration}>{plan.duration}</Text>
              </View>
            </View>
            <View style={styles.aiScoreContainer}>
              <Icon name="psychology" size={20} color={COLORS.primary} />
              <Text style={styles.aiScore}>{plan.aiScore}</Text>
            </View>
          </View>

          <View style={styles.playerSection}>
            <Avatar.Text
              size={32}
              label={plan.playerName.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: COLORS.primary }}
            />
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{plan.playerName}</Text>
              <Text style={styles.sportLevel}>{plan.sport} • {plan.level}</Text>
            </View>
          </View>

          <View style={styles.goalsSection}>
            <Text style={styles.goalsLabel}>🎯 Goals:</Text>
            <View style={styles.goalsContainer}>
              {plan.goals.slice(0, 2).map((goal, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={styles.goalChip}
                  textStyle={styles.goalChipText}
                >
                  {goal}
                </Chip>
              ))}
              {plan.goals.length > 2 && (
                <Chip
                  mode="outlined"
                  compact
                  style={styles.goalChip}
                  textStyle={styles.goalChipText}
                >
                  +{plan.goals.length - 2} more
                </Chip>
              )}
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressText}>
                {plan.completedSessions}/{plan.totalSessions} sessions
              </Text>
            </View>
            <ProgressBar
              progress={plan.progress / 100}
              color={COLORS.success}
              style={styles.progressBar}
            />
            <Text style={styles.progressPercentage}>{plan.progress}% complete</Text>
          </View>

          <View style={styles.nextSessionSection}>
            <Text style={styles.nextSessionLabel}>⏱️ Next: {plan.nextSession}</Text>
            <View style={styles.planFeatures}>
              {plan.nutritionPlan && (
                <Icon name="restaurant" size={16} color={COLORS.accent} />
              )}
              {plan.recoveryPlan && (
                <Icon name="spa" size={16} color={COLORS.info} />
              )}
              {plan.adaptations > 0 && (
                <View style={styles.adaptationBadge}>
                  <Icon name="auto-awesome" size={12} color={COLORS.surface} />
                  <Text style={styles.adaptationText}>{plan.adaptations}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.cardActions}>
            <Button
              mode="outlined"
              compact
              icon="play-arrow"
              style={styles.actionButton}
              onPress={() => Alert.alert('Start Session', 'Session starting feature coming soon! 🏃‍♂️')}
            >
              Start Session
            </Button>
            <Button
              mode="text"
              compact
              icon="auto-awesome"
              style={styles.adaptButton}
              onPress={() => handleAdaptPlan(plan.id)}
            >
              Adapt
            </Button>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderCreatePlanModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor={COLORS.background}
        >
          <Surface style={styles.createModalContent} elevation={8}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🤖 Create AI Plan</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowCreateModal(false)}
              />
            </View>

            <ScrollView style={styles.createModalBody}>
              <Text style={styles.formSectionTitle}>👤 Select Player</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playerSelector}>
                {players.map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    onPress={() => setNewPlanForm(prev => ({ ...prev, playerId: player.id }))}
                    style={[
                      styles.playerOption,
                      newPlanForm.playerId === player.id && styles.selectedPlayerOption
                    ]}
                  >
                    <Avatar.Text
                      size={40}
                      label={player.name.split(' ').map(n => n[0]).join('')}
                      style={{ backgroundColor: COLORS.primary }}
                    />
                    <Text style={styles.playerOptionName}>{player.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.formSectionTitle}>🎯 Select Goals</Text>
              <View style={styles.goalsGrid}>
                {goalOptions.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={() => handleGoalToggle(goal.id)}
                    style={[
                      styles.goalOption,
                      newPlanForm.goals.includes(goal.id) && styles.selectedGoalOption
                    ]}
                  >
                    <Icon
                      name={goal.icon}
                      size={24}
                      color={newPlanForm.goals.includes(goal.id) ? COLORS.surface : COLORS.primary}
                    />
                    <Text style={[
                      styles.goalOptionText,
                      newPlanForm.goals.includes(goal.id) && styles.selectedGoalOptionText
                    ]}>
                      {goal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formSectionTitle}>⚙️ Plan Details</Text>
              <TextInput
                label="Sport"
                value={newPlanForm.sport}
                onChangeText={(text) => setNewPlanForm(prev => ({ ...prev, sport: text }))}
                style={styles.formInput}
                mode="outlined"
              />
              <TextInput
                label="Experience Level"
                value={newPlanForm.level}
                onChangeText={(text) => setNewPlanForm(prev => ({ ...prev, level: text }))}
                style={styles.formInput}
                mode="outlined"
                placeholder="Beginner, Intermediate, Advanced, Professional"
              />
              <TextInput
                label="Duration"
                value={newPlanForm.duration}
                onChangeText={(text) => setNewPlanForm(prev => ({ ...prev, duration: text }))}
                style={styles.formInput}
                mode="outlined"
                placeholder="e.g., 8 weeks, 3 months"
              />
              <TextInput
                label="Additional Preferences"
                value={newPlanForm.preferences}
                onChangeText={(text) => setNewPlanForm(prev => ({ ...prev, preferences: text }))}
                style={styles.formInput}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Equipment limitations, time constraints, injury history..."
              />
            </ScrollView>

            <View style={styles.createModalActions}>
              <Button
                mode="contained"
                onPress={handleGenerateAIPlan}
                loading={generatingPlan}
                disabled={generatingPlan || !newPlanForm.playerId || newPlanForm.goals.length === 0}
                style={styles.generateButton}
                icon="auto-awesome"
              >
                {generatingPlan ? 'Generating...' : 'Generate AI Plan'}
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={showDetailModal}
        onDismiss={() => setShowDetailModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor={COLORS.background}
        >
          <Surface style={styles.modalContent} elevation={8}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Plan Details</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowDetailModal(false)}
              />
            </View>

            {selectedPlan && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.detailDescription}>{selectedPlan.description}</Text>
                
                <Text style={styles.detailSection}>📅 Weekly Schedule</Text>
                {selectedPlan.weeklySchedule.map((day, index) => (
                  <Text key={index} style={styles.scheduleItem}>• {day}</Text>
                ))}

                <Text style={styles.detailSection}>📈 Expected Results</Text>
                <Text style={styles.resultsText}>{selectedPlan.estimatedResults}</Text>

                <Text style={styles.detailSection}>🔧 Last Updated</Text>
                <Text style={styles.updateText}>{selectedPlan.lastUpdated}</Text>

                <View style={styles.detailActions}>
                  <Button
                    mode="contained"
                    icon="edit"
                    style={styles.detailButton}
                    onPress={() => Alert.alert('Edit Plan', 'Plan editing coming soon! ✏️')}
                  >
                    Edit Plan
                  </Button>
                  <Button
                    mode="outlined"
                    icon="share"
                    style={styles.detailButton}
                    onPress={() => Alert.alert('Share Plan', 'Plan sharing coming soon! 📤')}
                  >
                    Share
                  </Button>
                </View>
              </ScrollView>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderFAB = () => (
    <FAB
      icon="auto-awesome"
      label="AI Plan"
      style={styles.fab}
      onPress={handleCreatePlan}
      color={COLORS.surface}
      customSize={56}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading personalized plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {renderSearchBar()}
          {renderCategorySelector()}
          {renderAIRecommendations()}
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>📋 Your Plans ({personalizedPlans.length})</Text>
            <FlatList
              data={personalizedPlans}
              renderItem={renderPlanCard}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
              ListEmptyComponent={() => (
                <Card style={styles.emptyCard}>
                  <Card.Content style={styles.emptyContent}>
                    <Icon name="psychology" size={64} color={COLORS.textSecondary} />
                    <Text style={styles.emptyTitle}>No Plans Found</Text>
                    <Text style={styles.emptySubtitle}>
                      {searchQuery || selectedCategory !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Create your first AI-powered personalized plan!'
                      }
                    </Text>
                    <Button
                      mode="contained"
                      icon="auto-awesome"
                      style={styles.emptyButton}
                      onPress={handleCreatePlan}
                    >
                      Create AI Plan
                    </Button>
                  </Card.Content>
                </Card>
              )}
            />
          </View>
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>
      
      {renderCreatePlanModal()}
      {renderDetailModal()}
      {renderFAB()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerAction: {
    margin: 0,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    elevation: 0,
  },
  sectionContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    marginRight: SPACING.sm,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 12,
  },
  recommendationCard: {
    width: width * 0.75,
    marginRight: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  recommendationContent: {
    padding: SPACING.md,
  },
  recommendationTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  recommendationDescription: {
    ...TEXT_STYLES.body,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  recommendationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.primary,
  },
  recommendationButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  recommendationButtonText: {
    fontSize: 12,
    color: COLORS.surface,
  },
  planCard: {
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  planTitleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  planTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  planMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    height: 20,
    marginRight: SPACING.sm,
  },
  planDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  aiScoreContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  aiScore: {
    ...TEXT_STYLES.subtitle,
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 2,
  },
  playerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  playerInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  playerName: {
    ...TEXT_STYLES.subtitle,
    fontSize: 14,
  },
  sportLevel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  goalsSection: {
    marginBottom: SPACING.md,
  },
  goalsLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  goalChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    borderColor: COLORS.border,
  },
  goalChipText: {
    fontSize: 10,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  progressText: {
    ...TEXT_STYLES.caption,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    textAlign: 'right',
    color: COLORS.success,
  },
  nextSessionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  nextSessionLabel: {
    ...TEXT_STYLES.body,
    flex: 1,
    fontWeight: '500',
  },
  planFeatures: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adaptationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: SPACING.sm,
  },
  adaptationText: {
    ...TEXT_STYLES.caption,
    color: COLORS.surface,
    marginLeft: 2,
    fontSize: 10,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginRight: SPACING.sm,
    borderColor: COLORS.primary,
  },
  adaptButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  emptyCard: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.subtitle,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: width - 32,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  createModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: width - 32,
    maxHeight: height * 0.9,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.title,
    fontSize: 20,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  createModalBody: {
    padding: SPACING.lg,
    maxHeight: height * 0.6,
  },
  formSectionTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  playerSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  playerOption: {
    alignItems: 'center',
    marginRight: SPACING.md,
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  selectedPlayerOption: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  playerOptionName: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  goalOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  selectedGoalOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  goalOptionText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
    fontSize: 12,
  },
  selectedGoalOptionText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  formInput: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  createModalActions: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
  },
  detailDescription: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  detailSection: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  scheduleItem: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  resultsText: {
    ...TEXT_STYLES.body,
    fontStyle: 'italic',
    color: COLORS.success,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  updateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
  },
  detailButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 120,
  },
});

export default PersonalizedPlans;