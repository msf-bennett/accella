import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Dimensions,
  Alert,
  Animated,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import { 
  Card,
  Button,
  Text,
  Surface,
  ProgressBar,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Portal,
  Modal,
  Searchbar,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SmartRecommendation = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, recommendations, trainingData } = useSelector(state => ({
    user: state.auth.user,
    recommendations: state.recommendations.data,
    trainingData: state.training.data,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [aiInsights, setAiInsights] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const categories = [
    { id: 'all', name: 'All', icon: 'apps', color: COLORS.primary },
    { id: 'training', name: 'Training', icon: 'fitness-center', color: COLORS.success },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant', color: '#FF7043' },
    { id: 'recovery', name: 'Recovery', icon: 'spa', color: '#42A5F5' },
    { id: 'mindset', name: 'Mental', icon: 'psychology', color: '#AB47BC' },
  ];

  const smartRecommendations = [
    {
      id: 1,
      category: 'training',
      priority: 'high',
      type: 'skill_focus',
      title: '⚡ Focus on Ball Control Today',
      subtitle: 'AI Analysis: 23% improvement needed',
      description: 'Your recent match data shows ball control as your biggest opportunity. Spending 20 minutes on first touch drills could boost your performance by 15%.',
      confidence: 92,
      impact: 'High',
      timeRequired: '20 min',
      difficulty: 'Medium',
      points: 75,
      actionText: 'Start Drill Session',
      tags: ['Technical', 'Ball Control', 'Individual'],
      aiReasoning: 'Based on 5 recent matches and training sessions',
      progress: 0,
      dueDate: 'Today',
    },
    {
      id: 2,
      category: 'recovery',
      priority: 'high',
      type: 'rest_day',
      title: '🛌 Recovery Day Recommended',
      subtitle: 'Training load: 87% above normal',
      description: 'Your body needs recovery. HRV is 15% below baseline and training load is elevated. A complete rest day will optimize next week\'s performance.',
      confidence: 88,
      impact: 'High',
      timeRequired: 'Full day',
      difficulty: 'Easy',
      points: 100,
      actionText: 'Plan Rest Day',
      tags: ['Recovery', 'HRV', 'Load Management'],
      aiReasoning: 'HRV trend and accumulated fatigue analysis',
      progress: 0,
      dueDate: 'Tomorrow',
    },
    {
      id: 3,
      category: 'nutrition',
      priority: 'medium',
      type: 'meal_timing',
      title: '🍎 Pre-Training Fuel Strategy',
      subtitle: 'Energy optimization opportunity',
      description: 'Adjust your pre-training meal timing. Eating 2-3 hours before training instead of 1 hour could improve your energy levels by 20%.',
      confidence: 76,
      impact: 'Medium',
      timeRequired: '5 min planning',
      difficulty: 'Easy',
      points: 40,
      actionText: 'View Meal Plan',
      tags: ['Nutrition', 'Energy', 'Timing'],
      aiReasoning: 'Energy level patterns during training',
      progress: 0,
      dueDate: 'This week',
    },
    {
      id: 4,
      category: 'mindset',
      priority: 'medium',
      type: 'mental_training',
      title: '🧠 Visualization Practice',
      subtitle: 'Mental game enhancement',
      description: 'Your performance anxiety scores suggest visualization training. 10 minutes daily of match scenario visualization can improve composure by 25%.',
      confidence: 81,
      impact: 'Medium',
      timeRequired: '10 min/day',
      difficulty: 'Medium',
      points: 50,
      actionText: 'Start Session',
      tags: ['Mental', 'Visualization', 'Anxiety'],
      aiReasoning: 'Performance anxiety trends and match analysis',
      progress: 0,
      dueDate: 'This week',
    },
    {
      id: 5,
      category: 'training',
      priority: 'low',
      type: 'strength',
      title: '💪 Lower Body Power Development',
      subtitle: 'Long-term improvement goal',
      description: 'Jump test results show room for improvement in explosive power. Adding plyometric exercises twice weekly could increase vertical jump by 8%.',
      confidence: 72,
      impact: 'Medium',
      timeRequired: '30 min, 2x/week',
      difficulty: 'Hard',
      points: 60,
      actionText: 'View Program',
      tags: ['Strength', 'Plyometrics', 'Power'],
      aiReasoning: 'Physical testing results and biomechanical analysis',
      progress: 25,
      dueDate: 'Next month',
    },
  ];

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      Vibration.vibrate(50);
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      // dispatch(fetchSmartRecommendations());
      Alert.alert('✨ Updated!', 'AI has analyzed your latest data and updated recommendations');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh recommendations');
    }
    setRefreshing(false);
  }, []);

  const handleRecommendationAction = (recommendation) => {
    Vibration.vibrate(50);
    
    switch (recommendation.type) {
      case 'skill_focus':
        Alert.alert(
          '⚡ Skill Training',
          'Starting personalized ball control session...',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Start Now', onPress: () => navigation.navigate('TrainingSession', { type: 'skill', focus: 'ball_control' }) }
          ]
        );
        break;
      case 'rest_day':
        Alert.alert(
          '🛌 Recovery Day',
          'Would you like to schedule a complete rest day?',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Schedule', onPress: () => {} }
          ]
        );
        break;
      case 'meal_timing':
        Alert.alert('Feature Coming Soon', 'Personalized meal planning will be available soon!');
        break;
      case 'mental_training':
        Alert.alert('Feature Coming Soon', 'Guided visualization sessions coming soon!');
        break;
      case 'strength':
        Alert.alert('Feature Coming Soon', 'Strength training programs coming soon!');
        break;
    }
  };

  const handleDismissRecommendation = (id) => {
    Alert.alert(
      'Dismiss Recommendation',
      'Are you sure you want to dismiss this recommendation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Dismiss', 
          onPress: () => {
            Vibration.vibrate(50);
            // dispatch(dismissRecommendation(id));
          }
        }
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return '#FFA726';
      default: return COLORS.success;
    }
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'High': return 'trending-up';
      case 'Medium': return 'trending-neutral';
      default: return 'trending-down';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return COLORS.success;
      case 'Medium': return '#FFA726';
      default: return COLORS.error;
    }
  };

  const filteredRecommendations = smartRecommendations.filter(rec => {
    const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.headerTitle}>Smart Recommendations 🤖</Text>
          <Text style={styles.headerSubtitle}>AI-Powered Personal Coach</Text>
        </View>
        <View style={styles.aiIndicator}>
          <Icon name="auto-awesome" size={24} color="white" />
          <Text style={styles.aiText}>AI Active</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search recommendations..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
        inputStyle={{ fontSize: 16 }}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={{ paddingHorizontal: SPACING.sm }}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            mode={selectedCategory === category.id ? 'flat' : 'outlined'}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            icon={category.icon}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={{
              color: selectedCategory === category.id ? 'white' : category.color,
              fontWeight: selectedCategory === category.id ? 'bold' : 'normal'
            }}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderRecommendationCard = (recommendation, index) => (
    <Animated.View
      key={recommendation.id}
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Card style={styles.recommendationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.priorityContainer}>
            <Badge
              size={8}
              style={[styles.priorityBadge, { backgroundColor: getPriorityColor(recommendation.priority) }]}
            />
            <Text style={[styles.priorityText, { color: getPriorityColor(recommendation.priority) }]}>
              {recommendation.priority.toUpperCase()}
            </Text>
          </View>
          <IconButton
            icon="close"
            size={20}
            iconColor={COLORS.textSecondary}
            onPress={() => handleDismissRecommendation(recommendation.id)}
          />
        </View>

        <Card.Content style={styles.cardContent}>
          <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
          <Text style={styles.recommendationSubtitle}>{recommendation.subtitle}</Text>
          <Text style={styles.recommendationDescription}>{recommendation.description}</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Icon name="psychology" size={16} color={COLORS.primary} />
              <Text style={styles.metricText}>AI: {recommendation.confidence}%</Text>
            </View>
            <View style={styles.metric}>
              <Icon name={getImpactIcon(recommendation.impact)} size={16} color={COLORS.success} />
              <Text style={styles.metricText}>{recommendation.impact} Impact</Text>
            </View>
            <View style={styles.metric}>
              <Icon name="schedule" size={16} color="#FFA726" />
              <Text style={styles.metricText}>{recommendation.timeRequired}</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {recommendation.tags.map((tag, tagIndex) => (
              <Chip
                key={tagIndex}
                mode="outlined"
                compact
                style={styles.tag}
                textStyle={styles.tagText}
              >
                {tag}
              </Chip>
            ))}
          </View>

          {recommendation.progress > 0 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Progress: {recommendation.progress}%</Text>
              <ProgressBar
                progress={recommendation.progress / 100}
                color={COLORS.primary}
                style={styles.progressBar}
              />
            </View>
          )}

          <View style={styles.aiReasoningContainer}>
            <Icon name="lightbulb" size={16} color="#FFA726" />
            <Text style={styles.aiReasoningText}>{recommendation.aiReasoning}</Text>
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <View style={styles.actionLeft}>
            <Text style={styles.dueDateText}>Due: {recommendation.dueDate}</Text>
            <Text style={styles.pointsText}>+{recommendation.points} pts</Text>
          </View>
          <Button
            mode="contained"
            onPress={() => handleRecommendationAction(recommendation)}
            style={[styles.actionButton, { backgroundColor: getPriorityColor(recommendation.priority) }]}
            labelStyle={{ color: 'white' }}
          >
            {recommendation.actionText}
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="auto-awesome" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Recommendations Found</Text>
      <Text style={styles.emptyDescription}>
        Try adjusting your filters or complete more training sessions for personalized AI recommendations.
      </Text>
      <Button
        mode="outlined"
        onPress={() => setSelectedCategory('all')}
        style={styles.resetButton}
      >
        Reset Filters
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Analyzing your data..."
            titleColor={COLORS.primary}
          />
        }
      >
        {renderHeader()}
        {renderSearchAndFilters()}
        
        <View style={styles.recommendationsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              📊 Personalized for You ({filteredRecommendations.length})
            </Text>
            <Chip
              mode="flat"
              compact
              icon="auto-awesome"
              style={styles.aiChip}
              textStyle={{ color: 'white', fontSize: 12 }}
            >
              AI Generated
            </Chip>
          </View>

          {filteredRecommendations.length > 0 
            ? filteredRecommendations.map((rec, index) => renderRecommendationCard(rec, index))
            : renderEmptyState()
          }
          
          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <FAB
        icon="refresh"
        label="Refresh AI"
        style={styles.fab}
        onPress={onRefresh}
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
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  aiIndicator: {
    alignItems: 'center',
  },
  aiText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 4,
    marginBottom: SPACING.md,
  },
  categoriesContainer: {
    marginBottom: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  recommendationsContainer: {
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  aiChip: {
    backgroundColor: COLORS.primary,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  recommendationCard: {
    elevation: 4,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    marginRight: SPACING.xs,
  },
  priorityText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardContent: {
    paddingTop: 0,
  },
  recommendationTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  recommendationSubtitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  recommendationDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 28,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.primary,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  aiReasoningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  aiReasoningText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    flex: 1,
    color: '#E65100',
    fontStyle: 'italic',
  },
  cardActions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    justifyContent: 'space-between',
  },
  actionLeft: {
    flex: 1,
  },
  dueDateText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionButton: {
    borderRadius: 8,
    marginLeft: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.md,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  resetButton: {
    borderColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default SmartRecommendation;