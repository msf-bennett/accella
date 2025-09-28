import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

const { width } = Dimensions.get('window');

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

const InjuryPrevention = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  // Sample data - replace with Redux state
  const [injuryData, setInjuryData] = useState({
    riskAssessment: {
      score: 75,
      level: 'Moderate',
      factors: ['Previous injury', 'Muscle imbalance', 'Poor flexibility']
    },
    preventionPlans: [
      {
        id: 1,
        title: 'Knee Injury Prevention',
        category: 'lower-body',
        exercises: 12,
        duration: '15 min',
        difficulty: 'Beginner',
        completion: 85,
        icon: 'accessibility',
        color: COLORS.success
      },
      {
        id: 2,
        title: 'Shoulder Stability Protocol',
        category: 'upper-body',
        exercises: 8,
        duration: '12 min',
        difficulty: 'Intermediate',
        completion: 60,
        icon: 'fitness-center',
        color: COLORS.primary
      },
      {
        id: 3,
        title: 'Core Strengthening Series',
        category: 'core',
        exercises: 10,
        duration: '18 min',
        difficulty: 'Advanced',
        completion: 40,
        icon: 'self-improvement',
        color: COLORS.warning
      }
    ],
    assessments: [
      {
        id: 1,
        name: 'Movement Screen',
        lastCompleted: '2024-08-15',
        score: 18,
        maxScore: 21,
        status: 'good'
      },
      {
        id: 2,
        name: 'Flexibility Test',
        lastCompleted: '2024-08-10',
        score: 14,
        maxScore: 20,
        status: 'needs-improvement'
      }
    ]
  });

  const categories = [
    { id: 'all', label: 'All', icon: 'grid-view' },
    { id: 'upper-body', label: 'Upper Body', icon: 'airline-seat-legroom-reduced' },
    { id: 'lower-body', label: 'Lower Body', icon: 'directions-walk' },
    { id: 'core', label: 'Core', icon: 'self-improvement' },
    { id: 'flexibility', label: 'Flexibility', icon: 'accessibility' }
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
      // dispatch(fetchInjuryPreventionData());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleStartAssessment = (assessmentId) => {
    Alert.alert(
      'Feature Development',
      'Assessment feature is coming soon! 🔧',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleStartPrevention = (planId) => {
    Alert.alert(
      'Feature Development',
      'Prevention plan feature is coming soon! 🏃‍♂️',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>Injury Prevention</Text>
        <Text style={styles.headerSubtitle}>Stay healthy, train smarter 💪</Text>
        
        <Surface style={styles.riskCard}>
          <View style={styles.riskHeader}>
            <Icon name="warning" size={24} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.h3, styles.riskTitle]}>Risk Assessment</Text>
          </View>
          <View style={styles.riskContent}>
            <Text style={styles.riskScore}>{injuryData.riskAssessment.score}%</Text>
            <Text style={styles.riskLevel}>{injuryData.riskAssessment.level} Risk</Text>
          </View>
          <ProgressBar 
            progress={injuryData.riskAssessment.score / 100} 
            color={COLORS.warning}
            style={styles.riskProgress}
          />
        </Surface>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchSection}>
      <Searchbar
        placeholder="Search prevention protocols..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.filterChip,
              selectedCategory === category.id && styles.filterChipSelected
            ]}
            textStyle={selectedCategory === category.id ? styles.filterChipTextSelected : styles.filterChipText}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderPreventionPlan = (plan) => (
    <Card key={plan.id} style={styles.planCard}>
      <Card.Content>
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
              <Icon name={plan.icon} size={24} color={plan.color} />
            </View>
            <View style={styles.planDetails}>
              <Text style={[TEXT_STYLES.h3, styles.planTitle]}>{plan.title}</Text>
              <Text style={styles.planMeta}>{plan.exercises} exercises • {plan.duration}</Text>
              <Chip 
                style={[styles.difficultyChip, { backgroundColor: plan.color + '20' }]}
                textStyle={{ color: plan.color }}
                compact
              >
                {plan.difficulty}
              </Chip>
            </View>
          </View>
          <IconButton
            icon="dots-vertical"
            onPress={() => Alert.alert('More Options', 'Feature coming soon!')}
          />
        </View>
        
        <View style={styles.planProgress}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Completion</Text>
            <Text style={styles.progressValue}>{plan.completion}%</Text>
          </View>
          <ProgressBar 
            progress={plan.completion / 100} 
            color={plan.color}
            style={styles.progressBar}
          />
        </View>
        
        <View style={styles.planActions}>
          <Button
            mode="contained"
            onPress={() => handleStartPrevention(plan.id)}
            style={[styles.actionButton, { backgroundColor: plan.color }]}
            labelStyle={styles.actionButtonText}
          >
            Continue
          </Button>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Details', 'Plan details coming soon!')}
            style={styles.actionButton}
          >
            Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAssessments = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>Assessments</Text>
        <IconButton
          icon="add"
          onPress={() => Alert.alert('New Assessment', 'Feature coming soon!')}
          style={styles.addButton}
        />
      </View>
      
      {injuryData.assessments.map((assessment) => (
        <Card key={assessment.id} style={styles.assessmentCard}>
          <Card.Content>
            <View style={styles.assessmentContent}>
              <View style={styles.assessmentInfo}>
                <Text style={[TEXT_STYLES.body, styles.assessmentName]}>{assessment.name}</Text>
                <Text style={styles.assessmentDate}>
                  Last: {new Date(assessment.lastCompleted).toLocaleDateString()}
                </Text>
                <View style={styles.assessmentScore}>
                  <Text style={styles.scoreText}>
                    {assessment.score}/{assessment.maxScore}
                  </Text>
                  <Chip 
                    style={[
                      styles.statusChip,
                      { backgroundColor: assessment.status === 'good' ? COLORS.success + '20' : COLORS.warning + '20' }
                    ]}
                    textStyle={{ 
                      color: assessment.status === 'good' ? COLORS.success : COLORS.warning 
                    }}
                    compact
                  >
                    {assessment.status === 'good' ? 'Good' : 'Needs Work'}
                  </Chip>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => handleStartAssessment(assessment.id)}
                style={styles.assessmentButton}
                compact
              >
                Start
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={[TEXT_STYLES.h3, styles.quickActionsTitle]}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Warm-up', 'Dynamic warm-up routines coming soon!')}
        >
          <Icon name="play-circle-fill" size={32} color={COLORS.success} />
          <Text style={styles.quickActionText}>Warm-up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Mobility', 'Mobility exercises coming soon!')}
        >
          <Icon name="accessibility" size={32} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Mobility</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Strength', 'Strengthening protocols coming soon!')}
        >
          <Icon name="fitness-center" size={32} color={COLORS.warning} />
          <Text style={styles.quickActionText}>Strength</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Recovery', 'Recovery protocols coming soon!')}
        >
          <Icon name="spa" size={32} color={COLORS.secondary} />
          <Text style={styles.quickActionText}>Recovery</Text>
        </TouchableOpacity>
      </View>
    </View>
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
              <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>Prevention Plans</Text>
              {injuryData.preventionPlans.map(renderPreventionPlan)}
            </View>
            
            {renderAssessments()}
            {renderQuickActions()}
          </View>
        </Animated.View>
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Create Plan', 'Custom prevention plan creation coming soon!')}
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
  riskCard: {
    width: width - SPACING.lg * 2,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  riskTitle: {
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  riskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  riskScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  riskLevel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  riskProgress: {
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
    backgroundColor: COLORS.primary,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary + '20',
  },
  planCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  planInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  planDetails: {
    flex: 1,
  },
  planTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  planMeta: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  difficultyChip: {
    alignSelf: 'flex-start',
  },
  planProgress: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    color: COLORS.textSecondary,
  },
  progressValue: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  planActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonText: {
    color: '#fff',
  },
  assessmentCard: {
    marginBottom: SPACING.md,
    elevation: 1,
    borderRadius: 8,
  },
  assessmentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentName: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  assessmentDate: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  assessmentScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  scoreText: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  assessmentButton: {
    backgroundColor: COLORS.primary,
  },
  quickActions: {
    marginBottom: SPACING.xl,
  },
  quickActionsTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: (width - SPACING.md * 3) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    height: 100,
  },
  quickActionText: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default InjuryPrevention;