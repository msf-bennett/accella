import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Alert,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established design system
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4ade80',
  error: '#ef4444',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const SmartRecommendations = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, clients } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock AI recommendations data
  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      type: 'client_optimization',
      title: '🚀 Optimize Sarah\'s Training',
      description: 'AI detected plateau in strength gains. Suggest periodization change.',
      priority: 'high',
      client: 'Sarah Johnson',
      confidence: 0.92,
      impact: 'High performance boost expected',
      actions: ['Increase progressive overload', 'Add explosive movements', 'Review nutrition'],
      category: 'Performance',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      type: 'program_suggestion',
      title: '💪 New HIIT Program Available',
      description: 'Based on client preferences, this program matches 85% of your training style.',
      priority: 'medium',
      confidence: 0.85,
      impact: 'Suitable for 12 current clients',
      actions: ['Review program details', 'Customize for clients', 'Schedule implementation'],
      category: 'Programs',
      timestamp: '4 hours ago',
    },
    {
      id: 3,
      type: 'injury_prevention',
      title: '⚠️ Injury Risk Alert',
      description: 'Mike Thompson showing fatigue patterns. Recommend recovery focus.',
      priority: 'high',
      client: 'Mike Thompson',
      confidence: 0.88,
      impact: 'Prevent potential injury',
      actions: ['Schedule assessment', 'Modify intensity', 'Add mobility work'],
      category: 'Health',
      timestamp: '6 hours ago',
    },
    {
      id: 4,
      type: 'business_insight',
      title: '📈 Revenue Optimization',
      description: 'AI suggests optimal pricing for your specialized programs.',
      priority: 'medium',
      confidence: 0.78,
      impact: '15% potential revenue increase',
      actions: ['Review pricing analysis', 'A/B test new rates', 'Update packages'],
      category: 'Business',
      timestamp: '1 day ago',
    },
    {
      id: 5,
      type: 'client_acquisition',
      title: '🎯 Target New Demographics',
      description: 'Youth athletes in your area show high demand for specialized training.',
      priority: 'low',
      confidence: 0.71,
      impact: 'Expand client base by 20%',
      actions: ['Create youth programs', 'Market to parents', 'Partner with schools'],
      category: 'Growth',
      timestamp: '2 days ago',
    },
  ]);

  useEffect(() => {
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate AI recommendation refresh
    setTimeout(() => {
      Alert.alert('🤖 AI Analysis', 'Smart recommendations refreshed with latest data!');
      setRefreshing(false);
    }, 2000);
  }, []);

  const generateNewRecommendations = () => {
    setLoadingRecommendations(true);
    // Simulate AI processing
    setTimeout(() => {
      Alert.alert('🧠 AI Processing', 'Analyzing client data and generating new recommendations...');
      setLoadingRecommendations(false);
    }, 3000);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return '#f59e0b';
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Performance': return 'fitness-center';
      case 'Programs': return 'assignment';
      case 'Health': return 'health-and-safety';
      case 'Business': return 'trending-up';
      case 'Growth': return 'group-add';
      default: return 'lightbulb';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || rec.category.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const renderRecommendationCard = (recommendation) => (
    <TouchableOpacity
      key={recommendation.id}
      onPress={() => {
        setSelectedRecommendation(recommendation);
        setModalVisible(true);
      }}
      activeOpacity={0.8}
    >
      <Card style={[styles.recommendationCard, { borderLeftColor: getPriorityColor(recommendation.priority) }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Icon 
                name={getCategoryIcon(recommendation.category)} 
                size={24} 
                color={COLORS.primary} 
                style={styles.categoryIcon}
              />
              <View style={styles.titleContainer}>
                <Text style={TEXT_STYLES.h3}>{recommendation.title}</Text>
                <Text style={TEXT_STYLES.caption}>{recommendation.timestamp}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(recommendation.priority) + '20' }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(recommendation.priority) }]}>
                  {recommendation.priority.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[TEXT_STYLES.body, styles.description]}>{recommendation.description}</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={TEXT_STYLES.caption}>Confidence</Text>
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={recommendation.confidence} 
                  color={COLORS.primary}
                  style={styles.progressBar}
                />
                <Text style={styles.percentageText}>{Math.round(recommendation.confidence * 100)}%</Text>
              </View>
            </View>
          </View>

          <Text style={[TEXT_STYLES.caption, styles.impact]}>💡 {recommendation.impact}</Text>

          {recommendation.client && (
            <View style={styles.clientInfo}>
              <Avatar.Text size={24} label={recommendation.client.split(' ').map(n => n[0]).join('')} />
              <Text style={[TEXT_STYLES.caption, styles.clientName]}>{recommendation.client}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedRecommendation && (
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.h2}>{selectedRecommendation.title}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
                {selectedRecommendation.description}
              </Text>

              <View style={styles.modalMetrics}>
                <View style={styles.modalMetric}>
                  <Text style={TEXT_STYLES.caption}>AI Confidence</Text>
                  <Text style={TEXT_STYLES.h3}>{Math.round(selectedRecommendation.confidence * 100)}%</Text>
                </View>
                <View style={styles.modalMetric}>
                  <Text style={TEXT_STYLES.caption}>Priority</Text>
                  <Text style={[TEXT_STYLES.h3, { color: getPriorityColor(selectedRecommendation.priority) }]}>
                    {selectedRecommendation.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[TEXT_STYLES.h3, styles.actionsTitle]}>🎯 Recommended Actions</Text>
              {selectedRecommendation.actions.map((action, index) => (
                <View key={index} style={styles.actionItem}>
                  <Icon name="check-circle-outline" size={20} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.body, styles.actionText]}>{action}</Text>
                </View>
              ))}

              <View style={styles.modalButtons}>
                <Button
                  mode="contained"
                  onPress={() => {
                    setModalVisible(false);
                    Alert.alert('✅ Action Taken', 'Recommendation marked as implemented!');
                  }}
                  style={styles.primaryButton}
                  labelStyle={{ color: 'white' }}
                >
                  Implement Now
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setModalVisible(false);
                    Alert.alert('📋 Saved', 'Recommendation saved for later review!');
                  }}
                  style={styles.secondaryButton}
                >
                  Save for Later
                </Button>
              </View>
            </ScrollView>
          </Surface>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>🤖 Smart Recommendations</Text>
          <Text style={styles.headerSubtitle}>AI-powered insights for your training business</Text>
        </Animated.View>
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
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search recommendations..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {['all', 'performance', 'programs', 'health', 'business', 'growth'].map((filter) => (
            <Chip
              key={filter}
              selected={selectedFilter === filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.selectedChip
              ]}
              textStyle={selectedFilter === filter ? styles.selectedChipText : styles.chipText}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Chip>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.recommendationsList}
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
          <View style={styles.statsContainer}>
            <Surface style={styles.statCard}>
              <Text style={TEXT_STYLES.h2}>{recommendations.length}</Text>
              <Text style={TEXT_STYLES.caption}>Active Insights</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={TEXT_STYLES.h2}>92%</Text>
              <Text style={TEXT_STYLES.caption}>Avg Confidence</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={TEXT_STYLES.h2}>3</Text>
              <Text style={TEXT_STYLES.caption}>High Priority</Text>
            </Surface>
          </View>

          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map(renderRecommendationCard)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="psychology" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>No Recommendations Found</Text>
              <Text style={[TEXT_STYLES.body, styles.emptyDescription]}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      <FAB
        icon="auto-awesome"
        label="Generate New"
        onPress={generateNewRecommendations}
        loading={loadingRecommendations}
        style={styles.fab}
        color="white"
      />

      {renderDetailModal()}
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
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingTop: SPACING.lg,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchbar: {
    elevation: 2,
    backgroundColor: COLORS.surface,
  },
  filterContainer: {
    marginBottom: SPACING.lg,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
  },
  selectedChipText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  recommendationsList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  recommendationCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardHeader: {
    marginBottom: SPACING.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIcon: {
    marginRight: SPACING.sm,
    marginTop: SPACING.xs,
  },
  titleContainer: {
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  metricsRow: {
    marginBottom: SPACING.sm,
  },
  metric: {
    marginBottom: SPACING.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  percentageText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },
  impact: {
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  clientName: {
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    maxHeight: '80%',
    borderRadius: 16,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalDescription: {
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  modalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  modalMetric: {
    alignItems: 'center',
  },
  actionsTitle: {
    marginBottom: SPACING.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  modalButtons: {
    marginTop: SPACING.xl,
  },
  primaryButton: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    borderColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default SmartRecommendations;