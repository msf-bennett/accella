import React, { useState, useEffect, useCallback } from 'react';
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
  Switch,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your established design system
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  prevention: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  recovery: '#2196F3',
  success: '#4CAF50',
  error: '#F44336',
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheader: {
    fontSize: 20,
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

const InjuryPrevention = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, injuryData, isLoading } = useSelector(state => ({
    user: state.auth.user,
    injuryData: state.recovery?.injuryPrevention || {},
    isLoading: state.ui.isLoading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRiskAssessment, setShowRiskAssessment] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Risk assessment data
  const [riskFactors] = useState({
    overallRisk: 'moderate',
    riskScore: 6.2,
    lastAssessment: '2 days ago',
    factors: [
      { name: 'Training Load', level: 'high', score: 8, color: COLORS.warning },
      { name: 'Recovery Time', level: 'moderate', score: 6, color: COLORS.warning },
      { name: 'Sleep Quality', level: 'good', score: 4, color: COLORS.prevention },
      { name: 'Nutrition', level: 'excellent', score: 2, color: COLORS.prevention },
      { name: 'Stress Level', level: 'moderate', score: 5, color: COLORS.warning },
      { name: 'Previous Injuries', level: 'low', score: 3, color: COLORS.prevention },
    ]
  });

  // Prevention exercises and routines
  const [preventionExercises] = useState([
    {
      id: 1,
      title: 'Shoulder Stability Series',
      duration: '10-15 min',
      category: 'mobility',
      targetArea: 'shoulders',
      difficulty: 'beginner',
      riskReduction: 85,
      exercises: ['Band pull-aparts', 'Wall slides', 'Shoulder circles', 'External rotations'],
      description: 'Strengthen and mobilize shoulder complex',
      icon: 'accessibility',
      color: COLORS.prevention,
      completed: true,
    },
    {
      id: 2,
      title: 'Hip Flexor Release',
      duration: '8-12 min',
      category: 'flexibility',
      targetArea: 'hips',
      difficulty: 'beginner',
      riskReduction: 78,
      exercises: ['Couch stretch', 'Hip flexor lunge', 'Pigeon pose', 'Hip circles'],
      description: 'Release tight hip flexors from sitting',
      icon: 'self-improvement',
      color: COLORS.recovery,
      completed: false,
    },
    {
      id: 3,
      title: 'Core Activation Protocol',
      duration: '12-18 min',
      category: 'strengthening',
      targetArea: 'core',
      difficulty: 'intermediate',
      riskReduction: 92,
      exercises: ['Dead bug', 'Bird dog', 'Pallof press', 'Plank variations'],
      description: 'Activate and strengthen deep core muscles',
      icon: 'fitness-center',
      color: COLORS.primary,
      completed: false,
    },
    {
      id: 4,
      title: 'Ankle Mobility Routine',
      duration: '6-10 min',
      category: 'mobility',
      targetArea: 'ankles',
      difficulty: 'beginner',
      riskReduction: 71,
      exercises: ['Calf stretches', 'Ankle circles', 'Wall ankle stretch', 'Heel walks'],
      description: 'Improve ankle range of motion',
      icon: 'directions-walk',
      color: COLORS.warning,
      completed: true,
    },
    {
      id: 5,
      title: 'Glute Activation Series',
      duration: '8-15 min',
      category: 'strengthening',
      targetArea: 'glutes',
      difficulty: 'beginner',
      riskReduction: 88,
      exercises: ['Glute bridges', 'Clamshells', 'Monster walks', 'Single-leg deadlifts'],
      description: 'Activate dormant glute muscles',
      icon: 'trending-up',
      color: COLORS.success,
      completed: false,
    },
    {
      id: 6,
      title: 'Spinal Decompression',
      duration: '10-20 min',
      category: 'recovery',
      targetArea: 'spine',
      difficulty: 'beginner',
      riskReduction: 76,
      exercises: ['Cat-cow stretch', 'Child\'s pose', 'Knee to chest', 'Spinal twist'],
      description: 'Decompress and mobilize the spine',
      icon: 'spa',
      color: COLORS.secondary,
      completed: false,
    },
  ]);

  const categories = [
    { label: 'All', value: 'all', icon: 'apps' },
    { label: 'Mobility', value: 'mobility', icon: 'accessibility' },
    { label: 'Flexibility', value: 'flexibility', icon: 'self-improvement' },
    { label: 'Strengthening', value: 'strengthening', icon: 'fitness-center' },
    { label: 'Recovery', value: 'recovery', icon: 'spa' },
  ];

  // Weekly prevention stats
  const [weeklyStats] = useState({
    preventionSessions: 4,
    targetSessions: 6,
    riskReduction: 23,
    streakDays: 3,
    completedExercises: 12,
    injuryFreedays: 45,
  });

  // Body areas and their risk levels
  const [bodyAreas] = useState([
    { area: 'Shoulders', risk: 'low', lastIssue: 'None', color: COLORS.prevention },
    { area: 'Lower Back', risk: 'moderate', lastIssue: '3 weeks ago', color: COLORS.warning },
    { area: 'Knees', risk: 'low', lastIssue: 'None', color: COLORS.prevention },
    { area: 'Ankles', risk: 'high', lastIssue: '1 week ago', color: COLORS.danger },
    { area: 'Hips', risk: 'moderate', lastIssue: '2 months ago', color: COLORS.warning },
    { area: 'Wrists', risk: 'low', lastIssue: 'None', color: COLORS.prevention },
  ]);

  useEffect(() => {
    // Entrance animations
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

    loadInjuryPreventionData();
  }, []);

  const loadInjuryPreventionData = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(loadInjuryPreventionData());
    } catch (error) {
      console.error('Error loading injury prevention data:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInjuryPreventionData();
    setRefreshing(false);
  }, [loadInjuryPreventionData]);

  const filteredExercises = preventionExercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.targetArea.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return COLORS.prevention;
      case 'moderate': return COLORS.warning;
      case 'high': return COLORS.danger;
      default: return COLORS.textSecondary;
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'low': return 'check-circle';
      case 'moderate': return 'warning';
      case 'high': return 'error';
      default: return 'help';
    }
  };

  const handleStartExercise = (exercise) => {
    Alert.alert(
      '🏃‍♂️ Start Prevention Routine',
      `Ready to begin "${exercise.title}"?\n\nDuration: ${exercise.duration}\nTarget: ${exercise.targetArea}\nRisk Reduction: ${exercise.riskReduction}%`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Routine',
          onPress: () => {
            Alert.alert('🚀 Starting Routine', 'Exercise guidance and timer features coming in the next update!');
          },
        },
      ]
    );
  };

  const handleViewExercises = (exercise) => {
    Alert.alert(
      `${exercise.title} Exercises`,
      exercise.exercises.map((ex, index) => `${index + 1}. ${ex}`).join('\n\n'),
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const handleRiskAssessment = () => {
    Alert.alert(
      '📊 Injury Risk Assessment',
      'Complete a comprehensive assessment to identify your current injury risk factors and get personalized recommendations.',
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Start Assessment',
          onPress: () => {
            Alert.alert('🚧 Feature Coming Soon', 'Comprehensive injury risk assessment will be available in the next update!');
          },
        },
      ]
    );
  };

  const renderRiskOverviewCard = () => (
    <Card style={styles.riskOverviewCard}>
      <Card.Content>
        <View style={styles.riskOverviewHeader}>
          <Text style={[TEXT_STYLES.subheader, { color: COLORS.primary }]}>
            Injury Risk Overview 📊
          </Text>
          <Switch
            value={showRiskAssessment}
            onValueChange={setShowRiskAssessment}
            color={COLORS.primary}
          />
        </View>
        
        {showRiskAssessment && (
          <>
            <View style={styles.overallRiskDisplay}>
              <View style={styles.riskScoreContainer}>
                <Text style={styles.riskScore}>{riskFactors.riskScore}</Text>
                <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
                  Overall Risk Score
                </Text>
              </View>
              <View style={styles.riskStatusContainer}>
                <Text style={[
                  TEXT_STYLES.body,
                  { 
                    color: getRiskColor(riskFactors.overallRisk),
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }
                ]}>
                  {riskFactors.overallRisk} Risk
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  Last assessment: {riskFactors.lastAssessment}
                </Text>
              </View>
            </View>

            <View style={styles.riskFactorsList}>
              {riskFactors.factors.map((factor, index) => (
                <View key={index} style={styles.riskFactorItem}>
                  <Text style={[TEXT_STYLES.caption, { flex: 1 }]}>
                    {factor.name}
                  </Text>
                  <View style={styles.riskFactorIndicator}>
                    <ProgressBar
                      progress={factor.score / 10}
                      color={factor.color}
                      style={styles.riskProgressBar}
                    />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                      {factor.level}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Button
              mode="outlined"
              onPress={handleRiskAssessment}
              icon="assessment"
              style={styles.assessmentButton}
            >
              Retake Assessment
            </Button>
          </>
        )}
      </Card.Content>
    </Card>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Surface style={styles.statCard}>
        <Icon name="shield" size={24} color={COLORS.prevention} />
        <Text style={styles.statValue}>{weeklyStats.injuryFreedays}</Text>
        <Text style={styles.statLabel}>Injury-Free Days</Text>
      </Surface>
      <Surface style={styles.statCard}>
        <Icon name="trending-down" size={24} color={COLORS.success} />
        <Text style={styles.statValue}>{weeklyStats.riskReduction}%</Text>
        <Text style={styles.statLabel}>Risk Reduced</Text>
      </Surface>
      <Surface style={styles.statCard}>
        <Icon name="local-fire-department" size={24} color={COLORS.warning} />
        <Text style={styles.statValue}>{weeklyStats.streakDays}</Text>
        <Text style={styles.statLabel}>Prevention Streak</Text>
      </Surface>
    </View>
  );

  const renderProgressSection = () => (
    <Card style={styles.progressCard}>
      <Card.Content>
        <View style={styles.progressHeader}>
          <Text style={[TEXT_STYLES.subheader, { color: COLORS.prevention }]}>
            Weekly Progress 💪
          </Text>
          <Text style={TEXT_STYLES.caption}>
            {Math.round((weeklyStats.preventionSessions / weeklyStats.targetSessions) * 100)}% Complete
          </Text>
        </View>
        <ProgressBar
          progress={weeklyStats.preventionSessions / weeklyStats.targetSessions}
          color={COLORS.prevention}
          style={styles.progressBar}
        />
        <View style={styles.progressDetails}>
          <Text style={TEXT_STYLES.caption}>
            🎯 {weeklyStats.preventionSessions}/{weeklyStats.targetSessions} prevention sessions completed
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderBodyAreasCard = () => (
    <Card style={styles.bodyAreasCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.subheader, { color: COLORS.primary, marginBottom: SPACING.md }]}>
          Body Area Risk Status 🎯
        </Text>
        <View style={styles.bodyAreasGrid}>
          {bodyAreas.map((area, index) => (
            <TouchableOpacity key={index} style={styles.bodyAreaItem}>
              <View style={[styles.riskIndicator, { backgroundColor: area.color }]}>
                <Icon name={getRiskIcon(area.risk)} size={16} color="#fff" />
              </View>
              <View style={styles.bodyAreaInfo}>
                <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>
                  {area.area}
                </Text>
                <Text style={[TEXT_STYLES.caption, { fontSize: 12 }]}>
                  {area.lastIssue}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderCategoryFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesScroll}
      contentContainerStyle={styles.categoriesContainer}
    >
      {categories.map((category) => (
        <Chip
          key={category.value}
          mode={selectedCategory === category.value ? 'flat' : 'outlined'}
          selected={selectedCategory === category.value}
          onPress={() => setSelectedCategory(category.value)}
          icon={category.icon}
          style={[
            styles.categoryChip,
            selectedCategory === category.value && {
              backgroundColor: COLORS.prevention,
            }
          ]}
          textStyle={{
            color: selectedCategory === category.value ? '#fff' : COLORS.prevention,
          }}
        >
          {category.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderExerciseCard = (exercise) => (
    <Card key={exercise.id} style={styles.exerciseCard}>
      <Card.Content>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseTitleRow}>
            <LinearGradient
              colors={[exercise.color, exercise.color + '80']}
              style={styles.exerciseIcon}
            >
              <Icon name={exercise.icon} size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.exerciseTitleContainer}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                {exercise.title}
                {exercise.completed && ' ✅'}
              </Text>
              <Text style={TEXT_STYLES.caption}>
                {exercise.duration} • Target: {exercise.targetArea}
              </Text>
            </View>
          </View>
          <IconButton
            icon="list"
            size={20}
            iconColor={COLORS.textSecondary}
            onPress={() => handleViewExercises(exercise)}
          />
        </View>

        <View style={styles.exerciseMeta}>
          <Chip
            mode="outlined"
            compact
            textStyle={{ fontSize: 12 }}
            style={styles.difficultyChip}
          >
            {exercise.difficulty}
          </Chip>
          <View style={styles.riskReductionContainer}>
            <Text style={[TEXT_STYLES.caption, { marginRight: SPACING.xs }]}>
              Risk Reduction: {exercise.riskReduction}%
            </Text>
            <ProgressBar
              progress={exercise.riskReduction / 100}
              color={COLORS.prevention}
              style={styles.miniProgressBar}
            />
          </View>
        </View>

        <Text style={[TEXT_STYLES.caption, styles.exerciseDescription]}>
          {exercise.description}
        </Text>

        <View style={styles.exercisesList}>
          <Text style={[TEXT_STYLES.caption, { fontWeight: '600', marginBottom: SPACING.xs }]}>
            Key Exercises:
          </Text>
          {exercise.exercises.slice(0, 3).map((ex, index) => (
            <Text key={index} style={[TEXT_STYLES.caption, styles.exerciseItem]}>
              • {ex}
            </Text>
          ))}
          {exercise.exercises.length > 3 && (
            <Text style={[TEXT_STYLES.caption, { fontStyle: 'italic' }]}>
              +{exercise.exercises.length - 3} more exercises
            </Text>
          )}
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="outlined"
          onPress={() => handleViewExercises(exercise)}
          icon="list"
          style={styles.actionButton}
          compact
        >
          View All
        </Button>
        <Button
          mode={exercise.completed ? "outlined" : "contained"}
          onPress={() => exercise.completed ? null : handleStartExercise(exercise)}
          disabled={exercise.completed}
          icon={exercise.completed ? "check" : "play-arrow"}
          style={styles.actionButton}
          buttonColor={exercise.completed ? undefined : COLORS.prevention}
        >
          {exercise.completed ? "Completed" : "Start"}
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.prevention, '#388E3C']}
        style={styles.header}
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
          <Text style={[TEXT_STYLES.header, { color: '#fff' }]}>
            Injury Prevention 🛡️
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9 }]}>
            Stay healthy and train smart
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.prevention]}
            tintColor={COLORS.prevention}
          />
        }
      >
        {renderRiskOverviewCard()}
        {renderStatsCards()}
        {renderProgressSection()}
        {renderBodyAreasCard()}

        <Searchbar
          placeholder="Search prevention exercises..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.prevention}
        />

        {renderCategoryFilters()}

        <View style={styles.exercisesSection}>
          <Text style={[TEXT_STYLES.subheader, styles.sectionTitle]}>
            Prevention Routines 🏃‍♂️
          </Text>
          {filteredExercises.length > 0 ? (
            filteredExercises.map(renderExerciseCard)
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="search-off" size={48} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.md }]}>
                  No exercises found for "{searchQuery}"
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setSearchQuery('')}
                  style={{ marginTop: SPACING.md }}
                >
                  Clear Search
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => {
          Alert.alert('🚧 Feature Coming Soon', 'Custom injury prevention routines will be available in the next update!');
        }}
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
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  riskOverviewCard: {
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  riskOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  overallRiskDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  riskScoreContainer: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  riskScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  riskStatusContainer: {
    flex: 1,
  },
  riskFactorsList: {
    marginBottom: SPACING.lg,
  },
  riskFactorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  riskFactorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: SPACING.md,
  },
  riskProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  assessmentButton: {
    marginTop: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: 12,
    elevation: 2,
  },
  statValue: {
    ...TEXT_STYLES.subheader,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  progressCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  progressDetails: {
    alignItems: 'center',
  },
  bodyAreasCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  bodyAreasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bodyAreaItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  riskIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  bodyAreaInfo: {
    flex: 1,
  },
  searchbar: {
    marginBottom: SPACING.lg,
    elevation: 2,
    borderRadius: 12,
  },
  categoriesScroll: {
    marginBottom: SPACING.lg,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
    marginHorizontal: SPACING.xs,
  },
  exercisesSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  exerciseCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseTitleContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  exerciseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  difficultyChip: {
    height: 28,
  },
  riskReductionContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  miniProgressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
  },
  exerciseDescription: {
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  exercisesList: {
    marginBottom: SPACING.sm,
  },
  exerciseItem: {
    lineHeight: 18,
    marginBottom: 2,
  },
  actionButton: {
    marginRight: SPACING.sm,
  },
  emptyCard: {
    borderRadius: 12,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.prevention,
  },
});

export default InjuryPrevention;