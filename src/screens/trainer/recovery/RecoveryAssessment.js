import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
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
  Divider,
  RadioButton,
  Slider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

const { width, height } = Dimensions.get('window');

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  recovery: '#6c5ce7',
  excellent: '#00b894',
  good: '#00cec9',
  fair: '#fdcb6e',
  poor: '#e17055',
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
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const RecoveryAssessment = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentResponses, setAssessmentResponses] = useState({});
  const [animatedValue] = useState(new Animated.Value(0));

  // Sample data - replace with Redux state
  const [recoveryData, setRecoveryData] = useState({
    overallScore: {
      current: 78,
      trend: '+5',
      status: 'Good',
      color: COLORS.good
    },
    clients: [
      {
        id: 1,
        name: 'John Smith',
        avatar: 'JS',
        lastAssessment: '2024-08-20',
        score: 85,
        status: 'Excellent',
        color: COLORS.excellent,
        trend: 'up',
        metrics: {
          sleep: 8.2,
          soreness: 3,
          energy: 8,
          mood: 9,
          stress: 4
        }
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        avatar: 'SJ',
        lastAssessment: '2024-08-19',
        score: 72,
        status: 'Good',
        color: COLORS.good,
        trend: 'stable',
        metrics: {
          sleep: 7.5,
          soreness: 5,
          energy: 7,
          mood: 7,
          stress: 6
        }
      },
      {
        id: 3,
        name: 'Mike Wilson',
        avatar: 'MW',
        lastAssessment: '2024-08-18',
        score: 58,
        status: 'Fair',
        color: COLORS.fair,
        trend: 'down',
        metrics: {
          sleep: 6.0,
          soreness: 7,
          energy: 5,
          mood: 6,
          stress: 8
        }
      }
    ],
    assessmentTypes: [
      {
        id: 1,
        title: 'Daily Recovery Check',
        description: 'Quick daily assessment of recovery status',
        duration: '2-3 minutes',
        questions: 8,
        frequency: 'Daily',
        color: COLORS.recovery,
        icon: 'today',
        lastCompleted: '2024-08-21'
      },
      {
        id: 2,
        title: 'Weekly Deep Dive',
        description: 'Comprehensive weekly recovery analysis',
        duration: '8-10 minutes',
        questions: 25,
        frequency: 'Weekly',
        color: COLORS.primary,
        icon: 'analytics',
        lastCompleted: '2024-08-15'
      },
      {
        id: 3,
        title: 'Sleep Quality Assessment',
        description: 'Detailed sleep pattern and quality evaluation',
        duration: '5-6 minutes',
        questions: 15,
        frequency: 'Bi-weekly',
        color: COLORS.secondary,
        icon: 'bedtime',
        lastCompleted: '2024-08-10'
      },
      {
        id: 4,
        title: 'Stress & Mood Analysis',
        description: 'Mental and emotional recovery assessment',
        duration: '6-8 minutes',
        questions: 18,
        frequency: 'Weekly',
        color: COLORS.warning,
        icon: 'psychology',
        lastCompleted: '2024-08-12'
      }
    ],
    sampleQuestions: [
      {
        id: 1,
        type: 'scale',
        question: 'How would you rate your overall energy level today?',
        scale: { min: 1, max: 10, labels: ['Very Low', 'Very High'] }
      },
      {
        id: 2,
        type: 'scale',
        question: 'Rate your muscle soreness level',
        scale: { min: 1, max: 10, labels: ['No Soreness', 'Extreme Soreness'] }
      },
      {
        id: 3,
        type: 'choice',
        question: 'How many hours did you sleep last night?',
        options: ['Less than 5', '5-6 hours', '6-7 hours', '7-8 hours', '8+ hours']
      },
      {
        id: 4,
        type: 'scale',
        question: 'How would you rate your mood today?',
        scale: { min: 1, max: 10, labels: ['Very Poor', 'Excellent'] }
      }
    ],
    trends: {
      week: [65, 70, 68, 75, 78, 82, 78],
      month: [72, 75, 73, 78, 80, 77, 82, 85, 83, 78, 80, 82, 85, 87, 84, 82, 78, 80, 83, 85, 88, 86, 82, 78, 75, 78, 82, 85, 83, 78]
    }
  });

  const clientFilters = [
    { id: 'all', label: 'All Clients', count: recoveryData.clients.length },
    { id: 'excellent', label: 'Excellent', count: recoveryData.clients.filter(c => c.status === 'Excellent').length },
    { id: 'good', label: 'Good', count: recoveryData.clients.filter(c => c.status === 'Good').length },
    { id: 'fair', label: 'Fair', count: recoveryData.clients.filter(c => c.status === 'Fair').length },
    { id: 'poor', label: 'Poor', count: recoveryData.clients.filter(c => c.status === 'Poor').length }
  ];

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchRecoveryAssessments());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'excellent': return COLORS.excellent;
      case 'good': return COLORS.good;
      case 'fair': return COLORS.fair;
      case 'poor': return COLORS.poor;
      default: return COLORS.textSecondary;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'trending-flat';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return COLORS.success;
      case 'down': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const handleStartAssessment = (assessment) => {
    setActiveAssessment(assessment);
    setCurrentQuestion(0);
    setAssessmentResponses({});
    setShowAssessmentModal(true);
  };

  const handleAnswerQuestion = (answer) => {
    const newResponses = {
      ...assessmentResponses,
      [currentQuestion]: answer
    };
    setAssessmentResponses(newResponses);

    if (currentQuestion < recoveryData.sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleCompleteAssessment(newResponses);
    }
  };

  const handleCompleteAssessment = (responses) => {
    setShowAssessmentModal(false);
    setActiveAssessment(null);
    setCurrentQuestion(0);
    setAssessmentResponses({});
    
    Alert.alert(
      'Assessment Complete!',
      `${activeAssessment?.title} has been completed. Results will be available in your dashboard. 📊`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.recovery, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>Recovery Assessment</Text>
        <Text style={styles.headerSubtitle}>Track and optimize recovery 📈</Text>
        
        <Surface style={styles.overallScoreCard}>
          <View style={styles.scoreHeader}>
            <Icon name="assessment" size={24} color={COLORS.recovery} />
            <Text style={[TEXT_STYLES.h3, styles.scoreTitle]}>Overall Recovery</Text>
            <View style={styles.trendBadge}>
              <Icon name="trending-up" size={16} color={COLORS.success} />
              <Text style={[styles.trendText, { color: COLORS.success }]}>
                {recoveryData.overallScore.trend}
              </Text>
            </View>
          </View>
          <View style={styles.scoreContent}>
            <Text style={[styles.scoreValue, { color: recoveryData.overallScore.color }]}>
              {recoveryData.overallScore.current}
            </Text>
            <Text style={styles.scoreStatus}>{recoveryData.overallScore.status}</Text>
          </View>
          <ProgressBar 
            progress={recoveryData.overallScore.current / 100} 
            color={recoveryData.overallScore.color}
            style={styles.scoreProgress}
          />
        </Surface>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchSection}>
      <Searchbar
        placeholder="Search clients..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.recovery}
      />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {clientFilters.map((filter) => (
          <Chip
            key={filter.id}
            selected={selectedClient === filter.id}
            onPress={() => setSelectedClient(filter.id)}
            style={[
              styles.filterChip,
              selectedClient === filter.id && styles.filterChipSelected
            ]}
            textStyle={selectedClient === filter.id ? styles.filterChipTextSelected : styles.filterChipText}
          >
            {filter.label} ({filter.count})
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderClientCard = (client) => (
    <Card key={client.id} style={styles.clientCard}>
      <Card.Content>
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <Avatar.Text 
              size={48} 
              label={client.avatar}
              style={[styles.clientAvatar, { backgroundColor: client.color + '20' }]}
              labelStyle={{ color: client.color }}
            />
            <View style={styles.clientDetails}>
              <Text style={[TEXT_STYLES.body, styles.clientName]}>{client.name}</Text>
              <Text style={styles.clientLastAssessment}>
                Last: {new Date(client.lastAssessment).toLocaleDateString()}
              </Text>
              <View style={styles.clientStatus}>
                <Text style={[styles.statusText, { color: client.color }]}>
                  {client.status}
                </Text>
                <Icon 
                  name={getTrendIcon(client.trend)} 
                  size={16} 
                  color={getTrendColor(client.trend)}
                />
              </View>
            </View>
          </View>
          <View style={styles.clientScore}>
            <Text style={[styles.scoreNumber, { color: client.color }]}>
              {client.score}
            </Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.metricsSection}>
          <Text style={styles.metricsTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metric}>
              <Icon name="bedtime" size={20} color={COLORS.textSecondary} />
              <Text style={styles.metricLabel}>Sleep</Text>
              <Text style={styles.metricValue}>{client.metrics.sleep}h</Text>
            </View>
            <View style={styles.metric}>
              <Icon name="fitness-center" size={20} color={COLORS.textSecondary} />
              <Text style={styles.metricLabel}>Soreness</Text>
              <Text style={styles.metricValue}>{client.metrics.soreness}/10</Text>
            </View>
            <View style={styles.metric}>
              <Icon name="battery-charging-full" size={20} color={COLORS.textSecondary} />
              <Text style={styles.metricLabel}>Energy</Text>
              <Text style={styles.metricValue}>{client.metrics.energy}/10</Text>
            </View>
            <View style={styles.metric}>
              <Icon name="mood" size={20} color={COLORS.textSecondary} />
              <Text style={styles.metricLabel}>Mood</Text>
              <Text style={styles.metricValue}>{client.metrics.mood}/10</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.clientActions}>
          <Button
            mode="contained"
            onPress={() => Alert.alert('View Details', `${client.name} detailed assessment coming soon!`)}
            style={[styles.clientButton, { backgroundColor: client.color }]}
            labelStyle={styles.clientButtonText}
            compact
          >
            View Details
          </Button>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('New Assessment', `Start new assessment for ${client.name}?`)}
            textColor={client.color}
            compact
          >
            Assess
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAssessmentTypes = () => (
    <View style={styles.section}>
      <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>Assessment Types</Text>
      {recoveryData.assessmentTypes.map((assessment) => (
        <Card key={assessment.id} style={styles.assessmentCard}>
          <Card.Content>
            <View style={styles.assessmentHeader}>
              <View style={[styles.assessmentIcon, { backgroundColor: assessment.color + '20' }]}>
                <Icon name={assessment.icon} size={28} color={assessment.color} />
              </View>
              <View style={styles.assessmentInfo}>
                <Text style={[TEXT_STYLES.h3, styles.assessmentTitle]}>
                  {assessment.title}
                </Text>
                <Text style={styles.assessmentDescription}>
                  {assessment.description}
                </Text>
                <View style={styles.assessmentMeta}>
                  <View style={styles.metaItem}>
                    <Icon name="timer" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>{assessment.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="help" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>{assessment.questions} questions</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>{assessment.frequency}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.assessmentFooter}>
              <Text style={styles.lastCompleted}>
                Last: {new Date(assessment.lastCompleted).toLocaleDateString()}
              </Text>
              <Button
                mode="contained"
                onPress={() => handleStartAssessment(assessment)}
                style={[styles.assessmentButton, { backgroundColor: assessment.color }]}
                labelStyle={styles.assessmentButtonText}
                compact
              >
                Start Assessment
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderAssessmentModal = () => {
    if (!activeAssessment || !recoveryData.sampleQuestions[currentQuestion]) return null;
    
    const question = recoveryData.sampleQuestions[currentQuestion];
    const progress = (currentQuestion + 1) / recoveryData.sampleQuestions.length;

    return (
      <Portal>
        <Modal 
          visible={showAssessmentModal} 
          onDismiss={() => setShowAssessmentModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
              {activeAssessment.title}
            </Text>
            <IconButton
              icon="close"
              onPress={() => setShowAssessmentModal(false)}
            />
          </View>
          
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progress} 
              color={activeAssessment.color}
              style={styles.assessmentProgress}
            />
            <Text style={styles.progressText}>
              Question {currentQuestion + 1} of {recoveryData.sampleQuestions.length}
            </Text>
          </View>
          
          <Divider />
          
          <ScrollView style={styles.modalBody}>
            <Text style={[TEXT_STYLES.body, styles.questionText]}>
              {question.question}
            </Text>
            
            {question.type === 'scale' && (
              <View style={styles.scaleContainer}>
                <View style={styles.scaleLabels}>
                  <Text style={styles.scaleLabel}>{question.scale.labels[0]}</Text>
                  <Text style={styles.scaleLabel}>{question.scale.labels[1]}</Text>
                </View>
                <View style={styles.scaleNumbers}>
                  {Array.from({ length: question.scale.max }, (_, i) => (
                    <TouchableOpacity
                      key={i + 1}
                      style={styles.scaleNumber}
                      onPress={() => handleAnswerQuestion(i + 1)}
                    >
                      <Text style={styles.scaleNumberText}>{i + 1}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {question.type === 'choice' && (
              <View style={styles.choiceContainer}>
                {question.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.choiceOption}
                    onPress={() => handleAnswerQuestion(option)}
                  >
                    <Text style={styles.choiceText}>{option}</Text>
                    <Icon name="arrow-forward-ios" size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </Modal>
      </Portal>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={[TEXT_STYLES.h3, styles.quickActionsTitle]}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Analytics', 'Recovery analytics dashboard coming soon!')}
        >
          <Icon name="analytics" size={32} color={COLORS.recovery} />
          <Text style={styles.quickActionText}>Analytics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Reports', 'Recovery reports coming soon!')}
        >
          <Icon name="assignment" size={32} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Reports</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Trends', 'Recovery trends analysis coming soon!')}
        >
          <Icon name="trending-up" size={32} color={COLORS.success} />
          <Text style={styles.quickActionText}>Trends</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Export', 'Data export coming soon!')}
        >
          <Icon name="file-download" size={32} color={COLORS.warning} />
          <Text style={styles.quickActionText}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredClients = recoveryData.clients.filter(client => {
    const matchesFilter = selectedClient === 'all' || 
                         client.status.toLowerCase() === selectedClient;
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            colors={[COLORS.recovery]}
            tintColor={COLORS.recovery}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
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
          {renderHeader()}
          {renderSearchAndFilters()}
          
          <View style={styles.mainContent}>
            <View style={styles.section}>
              <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>Client Recovery Status</Text>
              {filteredClients.map(renderClientCard)}
            </View>
            
            {renderAssessmentTypes()}
            {renderQuickActions()}
          </View>
        </Animated.View>
      </ScrollView>
      
      {renderAssessmentModal()}
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Quick Assessment', 'Quick recovery check coming soon!')}
        color="#fff"
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
  content: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  overallScoreCard: {
    width: width - SPACING.lg * 2,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreTitle: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  trendText: {
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
    fontSize: 12,
  },
  scoreContent: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreStatus: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  scoreProgress: {
    height: 8,
    borderRadius: 4,
  },
  searchSection: {
    padding: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  filterChipSelected: {
    backgroundColor: COLORS.recovery,
  },
  filterChipText: {
    color: COLORS.textSecondary,
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  mainContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  clientCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  clientInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  clientAvatar: {
    marginRight: SPACING.md,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  clientLastAssessment: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  clientStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
  },
  clientScore: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  divider: {
    marginBottom: SPACING.md,
  },
  metricsSection: {
    marginBottom: SPACING.md,
  },
  metricsTitle: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
metricValue: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  clientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  clientButton: {
    flex: 1,
    borderRadius: 8,
  },
  clientButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  assessmentCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 16,
  },
  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  assessmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  assessmentDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  assessmentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  assessmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastCompleted: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  assessmentButton: {
    borderRadius: 8,
  },
  assessmentButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: 16,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  modalTitle: {
    color: COLORS.text,
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  assessmentProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  modalBody: {
    padding: SPACING.md,
    flex: 1,
  },
  questionText: {
    color: COLORS.text,
    marginBottom: SPACING.lg,
    fontSize: 18,
    lineHeight: 24,
  },
  scaleContainer: {
    alignItems: 'center',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.md,
  },
  scaleLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  scaleNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.sm,
  },
  scaleNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.recovery + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.recovery + '40',
  },
  scaleNumberText: {
    color: COLORS.recovery,
    fontWeight: 'bold',
    fontSize: 16,
  },
  choiceContainer: {
    gap: SPACING.sm,
  },
  choiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  choiceText: {
    color: COLORS.text,
    fontSize: 16,
    flex: 1,
  },
  quickActions: {
    marginTop: SPACING.md,
  },
  quickActionsTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  quickActionCard: {
    width: (width - SPACING.md * 3) / 2,
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    color: COLORS.text,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.recovery,
  },
});

export default RecoveryAssessment;