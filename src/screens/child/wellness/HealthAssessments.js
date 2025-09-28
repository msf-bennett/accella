import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  Portal,
  Modal,
  Searchbar,
  ProgressBar,
  FAB,
  IconButton,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9ff',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  excellent: '#4CAF50',
  good: '#8BC34A',
  average: '#FFC107',
  needsWork: '#FF9800',
  concern: '#F44336',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
  caption: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const HealthAssessments = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('overview');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [assessmentData, setAssessmentData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

    // Load existing assessment data
    loadAssessmentData();
  }, []);

  const loadAssessmentData = () => {
    // Simulate loading assessment data
    setAssessmentData({
      lastAssessment: '2025-08-15',
      overallScore: 82,
      totalAssessments: 12,
      improvements: 3,
      concernAreas: 1,
    });
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadAssessmentData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const categories = [
    { id: 'overview', label: 'Overview', icon: 'dashboard', color: COLORS.primary },
    { id: 'physical', label: 'Physical', icon: 'fitness-center', color: COLORS.success },
    { id: 'growth', label: 'Growth', icon: 'trending-up', color: COLORS.warning },
    { id: 'wellness', label: 'Wellness', icon: 'favorite', color: '#E91E63' },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant', color: '#FF5722' },
    { id: 'mental', label: 'Mental', icon: 'psychology', color: '#9C27B0' },
    { id: 'history', label: 'History', icon: 'history', color: '#607D8B' },
  ];

  const assessmentTypes = [
    {
      id: 'fitness-battery',
      title: '🏃‍♀️ Youth Fitness Battery',
      category: 'physical',
      description: 'Comprehensive age-appropriate fitness assessment',
      duration: '45 min',
      lastCompleted: '2025-08-15',
      score: 85,
      status: 'excellent',
      components: [
        { name: 'Flexibility', score: 88, status: 'excellent' },
        { name: 'Cardiovascular Endurance', score: 82, status: 'good' },
        { name: 'Muscular Strength', score: 85, status: 'excellent' },
        { name: 'Balance & Coordination', score: 90, status: 'excellent' },
      ],
      nextDue: '2025-11-15',
    },
    {
      id: 'growth-tracking',
      title: '📏 Growth & Development',
      category: 'growth',
      description: 'Height, weight, and developmental milestone tracking',
      duration: '15 min',
      lastCompleted: '2025-08-20',
      score: 78,
      status: 'good',
      components: [
        { name: 'Height Percentile', score: 75, status: 'good' },
        { name: 'Weight-for-Height', score: 80, status: 'good' },
        { name: 'Motor Development', score: 85, status: 'excellent' },
        { name: 'Cognitive Readiness', score: 72, status: 'average' },
      ],
      nextDue: '2025-11-20',
    },
    {
      id: 'wellness-check',
      title: '💝 Wellness Assessment',
      category: 'wellness',
      description: 'Mental health, sleep, and overall wellbeing evaluation',
      duration: '30 min',
      lastCompleted: '2025-08-10',
      score: 88,
      status: 'excellent',
      components: [
        { name: 'Sleep Quality', score: 85, status: 'good' },
        { name: 'Energy Levels', score: 90, status: 'excellent' },
        { name: 'Mood & Attitude', score: 88, status: 'excellent' },
        { name: 'Social Interaction', score: 92, status: 'excellent' },
      ],
      nextDue: '2025-11-10',
    },
    {
      id: 'nutrition-eval',
      title: '🥗 Nutrition Evaluation',
      category: 'nutrition',
      description: 'Dietary habits and nutritional knowledge assessment',
      duration: '25 min',
      lastCompleted: '2025-08-05',
      score: 72,
      status: 'average',
      components: [
        { name: 'Balanced Diet Knowledge', score: 75, status: 'good' },
        { name: 'Hydration Habits', score: 85, status: 'excellent' },
        { name: 'Pre-Activity Nutrition', score: 68, status: 'average' },
        { name: 'Recovery Nutrition', score: 60, status: 'needsWork' },
      ],
      nextDue: '2025-11-05',
    },
    {
      id: 'mental-readiness',
      title: '🧠 Mental Readiness',
      category: 'mental',
      description: 'Confidence, focus, and mental preparation assessment',
      duration: '20 min',
      lastCompleted: '2025-08-12',
      score: 91,
      status: 'excellent',
      components: [
        { name: 'Confidence Level', score: 88, status: 'excellent' },
        { name: 'Focus & Attention', score: 95, status: 'excellent' },
        { name: 'Goal Setting Skills', score: 90, status: 'excellent' },
        { name: 'Stress Management', score: 92, status: 'excellent' },
      ],
      nextDue: '2025-11-12',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return COLORS.excellent;
      case 'good': return COLORS.good;
      case 'average': return COLORS.average;
      case 'needsWork': return COLORS.needsWork;
      case 'concern': return COLORS.concern;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'average': return 'Average';
      case 'needsWork': return 'Needs Work';
      case 'concern': return 'Concern';
      default: return 'Unknown';
    }
  };

  const renderOverviewStats = () => (
    <Card style={styles.statsCard} elevation={3}>
      <Card.Content>
        <Text style={styles.sectionTitle}>📊 Assessment Overview</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{assessmentData.overallScore}%</Text>
            <Text style={styles.statLabel}>Overall Score</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{assessmentData.totalAssessments}</Text>
            <Text style={styles.statLabel}>Total Assessments</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {assessmentData.improvements}
            </Text>
            <Text style={styles.statLabel}>Improvements</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>
              {assessmentData.concernAreas}
            </Text>
            <Text style={styles.statLabel}>Focus Areas</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <ProgressBar
            progress={assessmentData.overallScore / 100}
            color={COLORS.primary}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {assessmentData.overallScore}% - Keep up the great work! 🌟
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCategoryChips = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
      {categories.map((category) => (
        <Chip
          key={category.id}
          mode={selectedCategory === category.id ? 'flat' : 'outlined'}
          selected={selectedCategory === category.id}
          onPress={() => setSelectedCategory(category.id)}
          icon={category.icon}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && { backgroundColor: category.color + '20' }
          ]}
          textStyle={[
            styles.categoryChipText,
            selectedCategory === category.id && { color: category.color }
          ]}
        >
          {category.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderAssessmentCard = (assessment) => (
    <Card key={assessment.id} style={styles.assessmentCard} elevation={2}>
      <TouchableOpacity onPress={() => openAssessmentModal(assessment)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{assessment.title}</Text>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(assessment.status) + '20' }
              ]}
              textStyle={{ color: getStatusColor(assessment.status) }}
            >
              {getStatusText(assessment.status)}
            </Chip>
          </View>
          
          <Text style={styles.cardDescription}>{assessment.description}</Text>
          
          <View style={styles.assessmentMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{assessment.duration}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <MaterialIcons name="calendar-today" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>
                Last: {new Date(assessment.lastCompleted).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.scoreSection}>
            <Text style={styles.scoreLabel}>Current Score</Text>
            <View style={styles.scoreDisplay}>
              <Text style={[styles.scoreValue, { color: getStatusColor(assessment.status) }]}>
                {assessment.score}%
              </Text>
              <ProgressBar
                progress={assessment.score / 100}
                color={getStatusColor(assessment.status)}
                style={styles.scoreBar}
              />
            </View>
          </View>

          <View style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => viewAssessmentHistory(assessment)}
              style={styles.actionButton}
            >
              View History
            </Button>
            
            <Button
              mode="contained"
              onPress={() => startNewAssessment(assessment)}
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            >
              New Assessment
            </Button>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const renderUpcomingAssessments = () => {
    const upcoming = assessmentTypes.filter(assessment => {
      const nextDue = new Date(assessment.nextDue);
      const now = new Date();
      const daysUntilDue = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 30;
    });

    if (upcoming.length === 0) return null;

    return (
      <Card style={styles.upcomingCard} elevation={2}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📅 Upcoming Assessments</Text>
          {upcoming.map((assessment) => {
            const nextDue = new Date(assessment.nextDue);
            const now = new Date();
            const daysUntilDue = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
            
            return (
              <View key={assessment.id} style={styles.upcomingItem}>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingTitle}>{assessment.title}</Text>
                  <Text style={styles.upcomingDays}>
                    {daysUntilDue <= 7 ? '🔔 ' : ''}
                    {daysUntilDue} days remaining
                  </Text>
                </View>
                <IconButton
                  icon="arrow-right"
                  onPress={() => startNewAssessment(assessment)}
                />
              </View>
            );
          })}
        </Card.Content>
      </Card>
    );
  };

  const filteredAssessments = assessmentTypes.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'overview' || assessment.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openAssessmentModal = (assessment) => {
    setSelectedAssessment(assessment);
    setModalVisible(true);
  };

  const viewAssessmentHistory = (assessment) => {
    Alert.alert('Feature Coming Soon', 'Assessment history feature is under development.');
  };

  const startNewAssessment = (assessment) => {
    Alert.alert(
      'Start New Assessment',
      `Are you ready to begin the ${assessment.title}? This will take approximately ${assessment.duration}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => Alert.alert('Feature Coming Soon', 'Assessment implementation is under development.')
        }
      ]
    );
  };

  const renderAssessmentModal = () => {
    if (!selectedAssessment) return null;

    return (
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={50} style={styles.modalBlur}>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedAssessment.title}</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <Surface style={styles.modalContent}>
                <Text style={styles.modalDescription}>
                  {selectedAssessment.description}
                </Text>

                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Overall Score</Text>
                    <Text style={[
                      styles.modalStatValue,
                      { color: getStatusColor(selectedAssessment.status) }
                    ]}>
                      {selectedAssessment.score}%
                    </Text>
                  </View>
                  
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatLabel}>Status</Text>
                    <Text style={[
                      styles.modalStatValue,
                      { color: getStatusColor(selectedAssessment.status) }
                    ]}>
                      {getStatusText(selectedAssessment.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.componentTitle}>Assessment Components:</Text>
                {selectedAssessment.components.map((component, index) => (
                  <View key={index} style={styles.componentItem}>
                    <View style={styles.componentHeader}>
                      <Text style={styles.componentName}>{component.name}</Text>
                      <Text style={[
                        styles.componentScore,
                        { color: getStatusColor(component.status) }
                      ]}>
                        {component.score}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={component.score / 100}
                      color={getStatusColor(component.status)}
                      style={styles.componentProgress}
                    />
                  </View>
                ))}

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setModalVisible(false);
                      viewAssessmentHistory(selectedAssessment);
                    }}
                    style={styles.modalActionButton}
                  >
                    View History
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={() => {
                      setModalVisible(false);
                      startNewAssessment(selectedAssessment);
                    }}
                    style={[styles.modalActionButton, { backgroundColor: COLORS.primary }]}
                  >
                    New Assessment
                  </Button>
                </View>
              </Surface>
            </ScrollView>
          </BlurView>
        </Modal>
      </Portal>
    );
  };

  const renderContent = () => {
    if (selectedCategory === 'overview') {
      return (
        <View>
          {renderOverviewStats()}
          {renderUpcomingAssessments()}
          <Text style={styles.sectionTitle}>🏆 Recent Assessments</Text>
          {assessmentTypes.slice(0, 3).map(renderAssessmentCard)}
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>
          {categories.find(cat => cat.id === selectedCategory)?.label} Assessments
        </Text>
        {filteredAssessments.map(renderAssessmentCard)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Health Assessments</Text>
              <Text style={styles.headerSubtitle}>Track growth & wellness 📈</Text>
            </View>
            <Avatar.Icon
              size={50}
              icon="health"
              style={styles.headerAvatar}
            />
          </View>
        </Animated.View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
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
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search assessments..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              icon="search"
              clearIcon="close"
            />
          </View>

          {renderCategoryChips()}
          {renderContent()}

          <Card style={styles.safetyCard} elevation={2}>
            <Card.Content>
              <Text style={styles.sectionTitle}>⚡ Safety First</Text>
              <Text style={styles.safetyText}>
                All assessments are age-appropriate and designed with child safety in mind. 
                If any discomfort occurs, stop immediately and consult a healthcare professional.
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Feature Coming Soon', 'Custom assessment creation is under development.')}
      />

      {renderAssessmentModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
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
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  headerAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
  },
  searchContainer: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  categoryContainer: {
    marginBottom: SPACING.lg,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  categoryChipText: {
    fontSize: 12,
  },
  statsCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.small,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  progressSection: {
    marginTop: SPACING.lg,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  upcomingCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  upcomingDays: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.lg,
  },
  assessmentCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusChip: {
    backgroundColor: 'transparent',
  },
  cardDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  assessmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  scoreSection: {
    marginBottom: SPACING.md,
  },
  scoreLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreValue: {
    ...TEXT_STYLES.h3,
    minWidth: 60,
    marginRight: SPACING.md,
  },
  scoreBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 0.48,
  },
  safetyCard: {
    marginBottom: SPACING.lg,
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  safetyText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    maxHeight: '90%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    flex: 1,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: SPACING.sm,
  },
  modalContent: {
    padding: SPACING.lg,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.lg,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 10,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  modalStatValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  componentTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  componentItem: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  componentName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    flex: 1,
  },
  componentScore: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  componentProgress: {
    height: 6,
    borderRadius: 3,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
  },
  modalActionButton: {
    flex: 0.48,
  },
  bottomSpacing: {
    height: SPACING.xxl * 2,
  },
});

export default HealthAssessments;