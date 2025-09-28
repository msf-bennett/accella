import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  TouchableOpacity,
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
  Modal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4ade80',
  error: '#ef4444',
  warning: '#f59e0b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  accent: '#8b5cf6',
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

const { width } = Dimensions.get('window');

const SmartRecommendations = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const players = useSelector(state => state.players.list);
  const trainingSessions = useSelector(state => state.training.sessions);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock AI recommendations data
  const [recommendations, setRecommendations] = useState([
    {
      id: '1',
      type: 'player_performance',
      priority: 'high',
      title: 'Alex Thompson needs endurance focus',
      subtitle: 'Performance analytics suggest cardio improvement',
      description: 'Based on recent performance data, Alex shows declining stamina in the final 20 minutes of training. Recommend increasing cardio workouts by 30%.',
      confidence: 92,
      category: 'Performance',
      actionType: 'training_plan',
      playerIds: ['alex_thompson'],
      metrics: {
        improvement_potential: '23%',
        current_level: 'Intermediate',
        target_level: 'Advanced'
      },
      suggestions: [
        'Add 2 HIIT sessions per week',
        'Extend warm-up duration to 15 minutes',
        'Include interval running drills'
      ],
      icon: 'trending-up',
      color: COLORS.warning,
      estimated_impact: 'High',
      timeline: '4-6 weeks'
    },
    {
      id: '2',
      type: 'team_strategy',
      priority: 'medium',
      title: 'Team formation optimization',
      subtitle: 'AI suggests 4-3-3 formation for better results',
      description: 'Analysis of recent matches indicates that switching to 4-3-3 formation could improve team performance by 18% based on player strengths.',
      confidence: 87,
      category: 'Strategy',
      actionType: 'formation_change',
      metrics: {
        win_probability: '+18%',
        defensive_rating: '+12%',
        offensive_rating: '+15%'
      },
      suggestions: [
        'Move Sarah to central midfield',
        'Utilize Mike\'s pace on the wing',
        'Strengthen defensive line communication'
      ],
      icon: 'group-work',
      color: COLORS.primary,
      estimated_impact: 'Medium',
      timeline: '2-3 weeks'
    },
    {
      id: '3',
      type: 'injury_prevention',
      priority: 'high',
      title: 'Injury risk alert for 3 players',
      subtitle: 'Preventive measures recommended',
      description: 'Movement analysis indicates increased injury risk for players with high training load. Immediate attention required.',
      confidence: 95,
      category: 'Health',
      actionType: 'injury_prevention',
      playerIds: ['player_1', 'player_2', 'player_3'],
      metrics: {
        risk_level: 'High',
        affected_players: 3,
        prevention_success_rate: '89%'
      },
      suggestions: [
        'Reduce training intensity by 20%',
        'Add recovery sessions',
        'Schedule physiotherapy assessments'
      ],
      icon: 'health-and-safety',
      color: COLORS.error,
      estimated_impact: 'Critical',
      timeline: 'Immediate'
    },
    {
      id: '4',
      type: 'skill_development',
      priority: 'low',
      title: 'Technical skills enhancement',
      subtitle: 'Focus on passing accuracy for midfielders',
      description: 'Data shows midfield passing accuracy is 12% below optimal. Targeted drills could improve team ball retention significantly.',
      confidence: 84,
      category: 'Skills',
      actionType: 'skill_training',
      metrics: {
        current_accuracy: '78%',
        target_accuracy: '88%',
        improvement_needed: '12%'
      },
      suggestions: [
        'Short passing drills daily',
        'Pressure situation training',
        'Vision and awareness exercises'
      ],
      icon: 'sports-soccer',
      color: COLORS.success,
      estimated_impact: 'Medium',
      timeline: '6-8 weeks'
    }
  ]);

  const categories = [
    { key: 'all', label: 'All', icon: 'dashboard' },
    { key: 'Performance', label: 'Performance', icon: 'trending-up' },
    { key: 'Strategy', label: 'Strategy', icon: 'psychology' },
    { key: 'Health', label: 'Health', icon: 'favorite' },
    { key: 'Skills', label: 'Skills', icon: 'sports' }
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
      })
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh recommendations
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In real app, dispatch action to fetch new recommendations
      setRefreshing(false);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh recommendations');
    }
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleRecommendationPress = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setModalVisible(true);
  };

  const handleApplyRecommendation = async (recommendation) => {
    setIsLoading(true);
    try {
      // Simulate applying recommendation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success! 🎉',
        `Recommendation has been applied to your training plan. You'll see the changes in your next session.`,
        [{ text: 'Great!', style: 'default' }]
      );
      
      setModalVisible(false);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to apply recommendation. Please try again.');
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
    const matchesSearch = rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const renderRecommendationCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity onPress={() => handleRecommendationPress(item)}>
        <Card style={[styles.recommendationCard, { borderLeftColor: item.color }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Surface style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                  <Icon name={item.icon} size={24} color={item.color} />
                </Surface>
                <View style={styles.cardHeaderText}>
                  <Text style={TEXT_STYLES.subheading} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={TEXT_STYLES.caption} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <Chip
                mode="outlined"
                textStyle={{ fontSize: 12, color: getPriorityColor(item.priority) }}
                style={[styles.priorityChip, { borderColor: getPriorityColor(item.priority) }]}
              >
                {item.priority.toUpperCase()}
              </Chip>
            </View>

            <Text style={[TEXT_STYLES.body, styles.description]} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <Icon name="psychology" size={16} color={COLORS.primary} />
                <Text style={styles.metricText}>
                  {item.confidence}% confidence
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={styles.metricText}>
                  {item.timeline}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="trending-up" size={16} color={item.color} />
                <Text style={styles.metricText}>
                  {item.estimated_impact} impact
                </Text>
              </View>
            </View>

            <ProgressBar
              progress={item.confidence / 100}
              color={item.color}
              style={styles.confidenceBar}
            />
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCategoryChip = ({ item }) => (
    <Chip
      mode={selectedCategory === item.key ? 'flat' : 'outlined'}
      selected={selectedCategory === item.key}
      onPress={() => handleCategorySelect(item.key)}
      icon={item.icon}
      style={[
        styles.categoryChip,
        selectedCategory === item.key && { backgroundColor: COLORS.primary }
      ]}
      textStyle={selectedCategory === item.key ? { color: '#fff' } : { color: COLORS.primary }}
    >
      {item.label}
    </Chip>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Smart Recommendations 🧠</Text>
              <Text style={styles.headerSubtitle}>
                AI-powered insights for better coaching
              </Text>
            </View>
            <IconButton
              icon="refresh"
              iconColor="#fff"
              size={28}
              onPress={onRefresh}
              style={styles.refreshButton}
            />
          </View>
          
          <View style={styles.statsContainer}>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>{recommendations.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>
                {recommendations.filter(r => r.priority === 'high').length}
              </Text>
              <Text style={styles.statLabel}>Priority</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>89%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </Surface>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search recommendations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.text }}
        />

        <FlatList
          data={categories}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={styles.categoriesList}
        />

        <FlatList
          data={filteredRecommendations}
          renderItem={renderRecommendationCard}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.recommendationsList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedRecommendation && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Surface style={[styles.modalIconContainer, 
                  { backgroundColor: `${selectedRecommendation.color}15` }]}>
                  <Icon 
                    name={selectedRecommendation.icon} 
                    size={32} 
                    color={selectedRecommendation.color} 
                  />
                </Surface>
                <Text style={TEXT_STYLES.heading}>
                  {selectedRecommendation.title}
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                />
              </View>

              <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
                {selectedRecommendation.description}
              </Text>

              <Card style={styles.metricsCard}>
                <Card.Title title="Key Metrics" titleStyle={TEXT_STYLES.subheading} />
                <Card.Content>
                  {Object.entries(selectedRecommendation.metrics).map(([key, value]) => (
                    <View key={key} style={styles.metricRow}>
                      <Text style={styles.metricKey}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                      </Text>
                      <Text style={styles.metricValue}>{value}</Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>

              <Card style={styles.suggestionsCard}>
                <Card.Title 
                  title="Recommended Actions" 
                  titleStyle={TEXT_STYLES.subheading}
                  left={(props) => <Icon {...props} name="lightbulb" color={COLORS.warning} />}
                />
                <Card.Content>
                  {selectedRecommendation.suggestions.map((suggestion, index) => (
                    <View key={index} style={styles.suggestionItem}>
                      <Icon name="check-circle" size={20} color={COLORS.success} />
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                  labelStyle={{ color: COLORS.textSecondary }}
                >
                  Not Now
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleApplyRecommendation(selectedRecommendation)}
                  style={[styles.modalButton, { backgroundColor: selectedRecommendation.color }]}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Apply Recommendation
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="auto-fix-high"
        style={styles.fab}
        onPress={() => Alert.alert(
          'Generate New Recommendations',
          'This feature will analyze your latest training data to generate fresh recommendations.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Generate', onPress: () => console.log('Generating recommendations...') }
          ]
        )}
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
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  refreshButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchBar: {
    marginVertical: SPACING.md,
    elevation: 2,
    backgroundColor: COLORS.surface,
  },
  categoriesList: {
    marginBottom: SPACING.md,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    elevation: 1,
  },
  recommendationsList: {
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: SPACING.md,
  },
  recommendationCard: {
    elevation: 3,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    elevation: 1,
  },
  cardHeaderText: {
    flex: 1,
  },
  priorityChip: {
    height: 28,
  },
  description: {
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginBottom: SPACING.xs,
  },
  metricText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  confidenceBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  modalContainer: {
    margin: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    maxHeight: '85%',
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    elevation: 2,
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  modalDescription: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  metricsCard: {
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  metricKey: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  suggestionsCard: {
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  suggestionText: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.accent,
  },
});

export default SmartRecommendations;