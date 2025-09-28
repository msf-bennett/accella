import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
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
  Portal,
  Modal,
  TextInput,
  Divider,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const AIFitnessTrainer = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { aiRecommendations, isLoading } = useSelector(state => state.ai);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('workouts');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [planGenerationModal, setPlanGenerationModal] = useState(false);
  const [planDetails, setPlanDetails] = useState({
    fitnessGoal: '',
    duration: '',
    workoutType: '',
    level: '',
    equipment: '',
  });

  // Mock data for AI fitness features
  const [aiInsights, setAiInsights] = useState([
    {
      id: 1,
      type: 'recovery',
      title: 'Client Recovery Alert',
      description: 'Sarah Johnson needs additional recovery time',
      priority: 'high',
      icon: 'healing',
      action: 'Adjust intensity',
    },
    {
      id: 2,
      type: 'nutrition',
      title: 'Nutrition Optimization',
      description: 'Pre-workout meal suggestions for better performance',
      priority: 'medium',
      icon: 'restaurant-menu',
      action: 'View meal plan',
    },
    {
      id: 3,
      type: 'progress',
      title: 'Goal Achievement',
      description: 'Mike Davis exceeded weekly strength goals',
      priority: 'low',
      icon: 'trending-up',
      action: 'Update program',
    },
  ]);

  const [generatedWorkouts, setGeneratedWorkouts] = useState([
    {
      id: 1,
      title: 'AI-Generated HIIT Workout',
      duration: '45 minutes',
      goal: 'Fat Loss',
      level: 'Intermediate',
      exercises: 12,
      aiConfidence: 96,
      tags: ['HIIT', 'Cardio', 'Bodyweight'],
    },
    {
      id: 2,
      title: 'Strength Building Program',
      duration: '60 minutes',
      goal: 'Muscle Building',
      level: 'Advanced',
      exercises: 8,
      aiConfidence: 91,
      tags: ['Strength', 'Compound', 'Progressive'],
    },
  ]);

  // Initialize animations
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
    // Simulate AI data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Generate AI fitness plan
  const generateAIPlan = () => {
    if (!planDetails.fitnessGoal || !planDetails.duration || !planDetails.workoutType) {
      Alert.alert('Missing Information', 'Please fill in all required fields to generate an AI workout plan.');
      return;
    }

    Alert.alert(
      'AI Workout Generation',
      'AI is generating your personalized fitness plan. This feature is in development.',
      [{ text: 'OK', onPress: () => setPlanGenerationModal(false) }]
    );
  };

  // Handle AI insight action
  const handleInsightAction = (insight) => {
    Alert.alert(
      'AI Fitness Insight',
      `${insight.title}\n\n${insight.description}`,
      [
        { text: 'Dismiss', style: 'cancel' },
        { text: insight.action, onPress: () => console.log('Action:', insight.action) },
      ]
    );
  };

  // Render AI insight card
  const renderInsightCard = (insight) => (
    <TouchableOpacity
      key={insight.id}
      onPress={() => handleInsightAction(insight)}
      style={styles.insightCard}
    >
      <Surface style={[styles.insightSurface, { 
        borderLeftColor: insight.priority === 'high' ? COLORS.error : 
                         insight.priority === 'medium' ? COLORS.warning : COLORS.success 
      }]}>
        <View style={styles.insightHeader}>
          <View style={styles.insightIconContainer}>
            <Icon 
              name={insight.icon} 
              size={24} 
              color={insight.priority === 'high' ? COLORS.error : COLORS.primary} 
            />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
          </View>
          <Badge 
            style={[styles.priorityBadge, { 
              backgroundColor: insight.priority === 'high' ? COLORS.error : 
                              insight.priority === 'medium' ? COLORS.warning : COLORS.success 
            }]}
          >
            {insight.priority.toUpperCase()}
          </Badge>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  // Render generated workout card
  const renderWorkoutCard = (workout) => (
    <Card key={workout.id} style={styles.planCard}>
      <Card.Content>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>{workout.title}</Text>
          <Chip mode="flat" compact style={styles.aiChip}>
            AI {workout.aiConfidence}%
          </Chip>
        </View>
        <View style={styles.planDetails}>
          <View style={styles.planDetailRow}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} />
            <Text style={styles.planDetailText}>{workout.duration}</Text>
          </View>
          <View style={styles.planDetailRow}>
            <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
            <Text style={styles.planDetailText}>{workout.goal}</Text>
          </View>
          <View style={styles.planDetailRow}>
            <Icon name="bar-chart" size={16} color={COLORS.textSecondary} />
            <Text style={styles.planDetailText}>{workout.level}</Text>
          </View>
          <View style={styles.planDetailRow}>
            <Icon name="list" size={16} color={COLORS.textSecondary} />
            <Text style={styles.planDetailText}>{workout.exercises} exercises</Text>
          </View>
        </View>
        <View style={styles.planTags}>
          {workout.tags.map((tag, index) => (
            <Chip key={index} mode="outlined" compact style={styles.tagChip}>
              {tag}
            </Chip>
          ))}
        </View>
        <ProgressBar 
          progress={workout.aiConfidence / 100} 
          color={COLORS.primary} 
          style={styles.confidenceBar} 
        />
        <Text style={styles.confidenceText}>AI Confidence: {workout.aiConfidence}%</Text>
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="outlined" 
          onPress={() => Alert.alert('Preview Workout', 'Workout preview feature coming soon!')}
        >
          Preview
        </Button>
        <Button 
          mode="contained" 
          onPress={() => Alert.alert('Start Workout', 'Workout implementation feature coming soon!')}
        >
          Start Workout
        </Button>
      </Card.Actions>
    </Card>
  );

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'workouts':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>💪 AI-Generated Workouts</Text>
            {generatedWorkouts.map(renderWorkoutCard)}
          </View>
        );
      case 'insights':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>🧠 AI Fitness Insights</Text>
            {aiInsights.map(renderInsightCard)}
          </View>
        );
      case 'progress':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>📈 Client Progress Analytics</Text>
            <Card style={styles.analysisCard}>
              <Card.Content>
                <Text style={styles.cardTitle}>Client Fitness Metrics</Text>
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Avg. Workout Completion:</Text>
                  <ProgressBar progress={0.89} color={COLORS.success} style={styles.analysisBar} />
                  <Text style={styles.analysisValue}>89%</Text>
                </View>
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Client Retention Rate:</Text>
                  <ProgressBar progress={0.94} color={COLORS.primary} style={styles.analysisBar} />
                  <Text style={styles.analysisValue}>94%</Text>
                </View>
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Goal Achievement:</Text>
                  <ProgressBar progress={0.76} color={COLORS.secondary} style={styles.analysisBar} />
                  <Text style={styles.analysisValue}>76%</Text>
                </View>
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Nutrition Adherence:</Text>
                  <ProgressBar progress={0.82} color={COLORS.warning} style={styles.analysisBar} />
                  <Text style={styles.analysisValue}>82%</Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#ff6b6b', '#ee5a24']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
          <Text style={styles.headerTitle}>🤖 AI Fitness Trainer</Text>
          <Text style={styles.headerSubtitle}>Personalized fitness programs powered by AI</Text>
        </Animated.View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search workouts, nutrition plans, clients..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'workouts' && styles.activeTab]}
          onPress={() => setActiveTab('workouts')}
        >
          <Icon name="fitness-center" size={20} color={activeTab === 'workouts' ? COLORS.white : COLORS.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'workouts' && styles.activeTabText]}>Workouts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}
        >
          <Icon name="psychology" size={20} color={activeTab === 'insights' ? COLORS.white : COLORS.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
          onPress={() => setActiveTab('progress')}
        >
          <Icon name="trending-up" size={20} color={activeTab === 'progress' ? COLORS.white : COLORS.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
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
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderTabContent()}
        </Animated.View>
      </ScrollView>

      {/* Generate Workout Modal */}
      <Portal>
        <Modal
          visible={planGenerationModal}
          onDismiss={() => setPlanGenerationModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <Card style={styles.modalCard}>
              <Card.Title title="🎯 Generate AI Workout Plan" titleStyle={styles.modalTitle} />
              <Card.Content>
                <TextInput
                  label="Fitness Goal *"
                  value={planDetails.fitnessGoal}
                  onChangeText={(text) => setPlanDetails({...planDetails, fitnessGoal: text})}
                  style={styles.input}
                  mode="outlined"
                  placeholder="e.g., Weight Loss, Muscle Building, Endurance"
                />
                <TextInput
                  label="Duration (weeks) *"
                  value={planDetails.duration}
                  onChangeText={(text) => setPlanDetails({...planDetails, duration: text})}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
                <TextInput
                  label="Workout Type *"
                  value={planDetails.workoutType}
                  onChangeText={(text) => setPlanDetails({...planDetails, workoutType: text})}
                  style={styles.input}
                  mode="outlined"
                  placeholder="e.g., HIIT, Strength Training, Yoga"
                />
                <TextInput
                  label="Fitness Level"
                  value={planDetails.level}
                  onChangeText={(text) => setPlanDetails({...planDetails, level: text})}
                  style={styles.input}
                  mode="outlined"
                  placeholder="Beginner, Intermediate, Advanced"
                />
                <TextInput
                  label="Available Equipment"
                  value={planDetails.equipment}
                  onChangeText={(text) => setPlanDetails({...planDetails, equipment: text})}
                  style={styles.input}
                  mode="outlined"
                  multiline
                  placeholder="e.g., Dumbbells, Resistance Bands, Gym Access"
                />
              </Card.Content>
              <Card.Actions style={styles.modalActions}>
                <Button onPress={() => setPlanGenerationModal(false)}>Cancel</Button>
                <Button mode="contained" onPress={generateAIPlan}>Generate Workout</Button>
              </Card.Actions>
            </Card>
          </BlurView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="add"
        label="Create Workout"
        onPress={() => setPlanGenerationModal(true)}
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
    paddingTop: StatusBar.currentHeight + SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.lightGray,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    fontWeight: 'bold',
  },
  insightCard: {
    marginBottom: SPACING.md,
  },
  insightSurface: {
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIconContainer: {
    marginRight: SPACING.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  insightDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
  },
  planCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  planTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    flex: 1,
    marginRight: SPACING.md,
  },
  aiChip: {
    backgroundColor: COLORS.primary,
  },
  planDetails: {
    marginBottom: SPACING.md,
  },
  planDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  planDetailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
  },
  planTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tagChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  confidenceBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  confidenceText: {
    ...TEXT_STYLES.caption,
    textAlign: 'right',
    color: COLORS.textSecondary,
  },
  analysisCard: {
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  analysisLabel: {
    ...TEXT_STYLES.body,
    width: 140,
    color: COLORS.textPrimary,
  },
  analysisBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: SPACING.md,
  },
  analysisValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    width: 40,
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalCard: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 16,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  modalActions: {
    justifyContent: 'flex-end',
    paddingTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default AIFitnessTrainer;