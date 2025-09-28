import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert,
  Vibration,
  Animated,
  StatusBar,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Constants (would be imported from your design system)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
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
  h2: { fontSize: 22, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

const SkillAssessment = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [assessmentData, setAssessmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const assessments = useSelector(state => state.performance.assessments);

  // Skill categories and data
  const skillCategories = [
    { id: 'all', label: 'All Skills', icon: 'fitness-center' },
    { id: 'strength', label: 'Strength', icon: 'fitness-center' },
    { id: 'cardio', label: 'Cardio', icon: 'favorite' },
    { id: 'flexibility', label: 'Flexibility', icon: 'accessibility' },
    { id: 'balance', label: 'Balance', icon: 'self-improvement' },
    { id: 'agility', label: 'Agility', icon: 'directions-run' },
    { id: 'sport-specific', label: 'Sport Specific', icon: 'sports-soccer' },
  ];

  const skillsData = [
    {
      id: 1,
      name: 'Push-ups',
      category: 'strength',
      currentLevel: 75,
      lastScore: 45,
      bestScore: 50,
      unit: 'reps',
      trend: 'up',
      assessmentType: 'count',
      description: 'Upper body strength endurance test',
      icon: '💪',
    },
    {
      id: 2,
      name: '5K Run Time',
      category: 'cardio',
      currentLevel: 60,
      lastScore: '24:30',
      bestScore: '23:15',
      unit: 'minutes',
      trend: 'up',
      assessmentType: 'time',
      description: 'Cardiovascular endurance assessment',
      icon: '🏃‍♂️',
    },
    {
      id: 3,
      name: 'Sit and Reach',
      category: 'flexibility',
      currentLevel: 80,
      lastScore: 12,
      bestScore: 15,
      unit: 'cm',
      trend: 'stable',
      assessmentType: 'measurement',
      description: 'Lower back and hamstring flexibility',
      icon: '🤸‍♀️',
    },
    {
      id: 4,
      name: 'Single Leg Stand',
      category: 'balance',
      currentLevel: 70,
      lastScore: 45,
      bestScore: 60,
      unit: 'seconds',
      trend: 'down',
      assessmentType: 'time',
      description: 'Static balance and stability test',
      icon: '⚖️',
    },
    {
      id: 5,
      name: 'Agility Ladder',
      category: 'agility',
      currentLevel: 85,
      lastScore: '15.2',
      bestScore: '14.8',
      unit: 'seconds',
      trend: 'up',
      assessmentType: 'time',
      description: 'Speed and coordination assessment',
      icon: '🪜',
    },
    {
      id: 6,
      name: 'Free Throws',
      category: 'sport-specific',
      currentLevel: 65,
      lastScore: 13,
      bestScore: 16,
      unit: 'out of 20',
      trend: 'up',
      assessmentType: 'accuracy',
      description: 'Basketball shooting accuracy',
      icon: '🏀',
    },
  ];

  // Initialize component
  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = useCallback(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Load assessment data
    loadAssessmentData();
  }, []);

  const loadAssessmentData = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setAssessmentData(skillsData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading assessment data:', error);
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    loadAssessmentData().finally(() => setRefreshing(false));
  }, [loadAssessmentData]);

  // Filter skills based on category and search
  const filteredSkills = assessmentData.filter(skill => {
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSkillPress = (skill) => {
    setSelectedSkill(skill);
    setShowModal(true);
    Vibration.vibrate(30);
  };

  const startAssessment = (skill) => {
    Alert.alert(
      'Start Assessment',
      `Ready to assess your ${skill.name} performance?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start',
          onPress: () => {
            setShowModal(false);
            // Navigate to assessment screen or start timer
            Alert.alert('Feature Coming Soon', 'Assessment interface will be available in the next update! 🚀');
          },
        },
      ]
    );
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
      default: return COLORS.textLight;
    }
  };

  const renderSkillCard = (skill, index) => (
    <Animated.View
      key={skill.id}
      style={[
        styles.skillCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card
        style={styles.card}
        elevation={3}
        onPress={() => handleSkillPress(skill)}
      >
        <Surface style={styles.cardHeader}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.gradientHeader}
          >
            <View style={styles.skillInfo}>
              <Text style={styles.skillEmoji}>{skill.icon}</Text>
              <View style={styles.skillDetails}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillDescription}>{skill.description}</Text>
              </View>
              <Icon
                name={getTrendIcon(skill.trend)}
                size={24}
                color={getTrendColor(skill.trend)}
                style={styles.trendIcon}
              />
            </View>
          </LinearGradient>
        </Surface>

        <Card.Content style={styles.cardContent}>
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Current Level</Text>
              <Text style={styles.progressValue}>{skill.currentLevel}%</Text>
            </View>
            <ProgressBar
              progress={skill.currentLevel / 100}
              color={COLORS.primary}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Last Score</Text>
              <Text style={styles.statValue}>
                {skill.lastScore} {skill.unit}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Best Score</Text>
              <Text style={styles.statValue}>
                {skill.bestScore} {skill.unit}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => handleSkillPress(skill)}
              style={styles.assessButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Assess Now
            </Button>
            <IconButton
              icon="history"
              size={24}
              onPress={() => Alert.alert('Feature Coming Soon', 'Assessment history will be available soon! 📊')}
              style={styles.historyButton}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderCategoryChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContainer}
    >
      {skillCategories.map((category) => (
        <Chip
          key={category.id}
          icon={category.icon}
          mode={selectedCategory === category.id ? 'flat' : 'outlined'}
          selected={selectedCategory === category.id}
          onPress={() => {
            setSelectedCategory(category.id);
            Vibration.vibrate(30);
          }}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.selectedChip
          ]}
          textStyle={[
            styles.chipText,
            selectedCategory === category.id && styles.selectedChipText
          ]}
        >
          {category.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderAssessmentModal = () => (
    <Portal>
      <Modal
        visible={showModal}
        onDismiss={() => setShowModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurOverlay} blurType="dark" blurAmount={10}>
          <Card style={styles.modalCard}>
            <Card.Content>
              {selectedSkill && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {selectedSkill.icon} {selectedSkill.name}
                    </Text>
                    <IconButton
                      icon="close"
                      size={24}
                      onPress={() => setShowModal(false)}
                      style={styles.closeButton}
                    />
                  </View>

                  <Text style={styles.modalDescription}>
                    {selectedSkill.description}
                  </Text>

                  <View style={styles.modalStats}>
                    <Surface style={styles.modalStatCard}>
                      <Text style={styles.modalStatLabel}>Current Level</Text>
                      <Text style={styles.modalStatValue}>{selectedSkill.currentLevel}%</Text>
                    </Surface>
                    <Surface style={styles.modalStatCard}>
                      <Text style={styles.modalStatLabel}>Best Score</Text>
                      <Text style={styles.modalStatValue}>
                        {selectedSkill.bestScore} {selectedSkill.unit}
                      </Text>
                    </Surface>
                  </View>

                  <Button
                    mode="contained"
                    onPress={() => startAssessment(selectedSkill)}
                    style={styles.modalButton}
                    contentStyle={styles.modalButtonContent}
                    labelStyle={styles.modalButtonLabel}
                  >
                    Start Assessment
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Skill Assessment 📊</Text>
          <Text style={styles.headerSubtitle}>
            Track your progress and improve your performance
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search skills..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />

        {renderCategoryChips()}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading assessments... 🔄</Text>
            </View>
          ) : filteredSkills.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>
                Available Assessments ({filteredSkills.length})
              </Text>
              {filteredSkills.map(renderSkillCard)}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="search-off" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No Skills Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or category filter
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {renderAssessmentModal()}

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert(
          'Custom Assessment',
          'Create your own skill assessment! This feature will be available soon. 🎯'
        )}
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
    paddingTop: SPACING.xl + 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  searchBar: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.md,
    paddingRight: SPACING.lg,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  selectedChipText: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  skillCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    borderRadius: 0,
  },
  gradientHeader: {
    padding: SPACING.md,
  },
  skillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  skillDetails: {
    flex: 1,
  },
  skillName: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  skillDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    opacity: 0.9,
  },
  trendIcon: {
    marginLeft: SPACING.sm,
  },
  cardContent: {
    padding: SPACING.md,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  progressValue: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  statValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assessButton: {
    flex: 1,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
  buttonLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: COLORS.border,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    flex: 1,
  },
  closeButton: {
    margin: 0,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  modalStats: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  modalStatCard: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginRight: SPACING.sm,
    alignItems: 'center',
  },
  modalStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  modalStatValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonContent: {
    paddingVertical: SPACING.sm,
  },
  modalButtonLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
});

export default SkillAssessment;