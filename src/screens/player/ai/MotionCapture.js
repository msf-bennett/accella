import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Modal,
  Image,
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
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const MotionCaptureScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players } = useSelector(state => state.players);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRecording, setIsRecording] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [recordingProgress] = useState(new Animated.Value(0));

  // Mock data for motion capture
  const [motionData, setMotionData] = useState({
    recentAnalyses: [
      {
        id: '1',
        playerName: 'Marcus Johnson',
        avatar: 'MJ',
        movement: 'Sprint Technique',
        date: '2 hours ago',
        duration: '0:45',
        aiScore: 92,
        keyPoints: ['Excellent arm swing', 'Good knee drive', 'Minor heel strike'],
        improvements: ['Reduce over-striding', 'Increase cadence'],
        biomechanics: {
          efficiency: 88,
          symmetry: 94,
          power: 85,
        },
        thumbnail: 'sprint_analysis_1',
      },
      {
        id: '2',
        playerName: 'Sarah Williams',
        avatar: 'SW',
        movement: 'Jump Landing',
        date: '1 day ago',
        duration: '0:30',
        aiScore: 76,
        keyPoints: ['Good takeoff angle', 'Stable landing', 'Knee valgus detected'],
        improvements: ['Strengthen glutes', 'Work on knee tracking'],
        biomechanics: {
          efficiency: 72,
          symmetry: 68,
          power: 89,
        },
        thumbnail: 'jump_analysis_2',
      },
      {
        id: '3',
        playerName: 'David Chen',
        avatar: 'DC',
        movement: 'Shooting Form',
        date: '2 days ago',
        duration: '1:15',
        aiScore: 89,
        keyPoints: ['Consistent release point', 'Good follow-through', 'Balanced stance'],
        improvements: ['Optimize arc trajectory', 'Improve shot preparation'],
        biomechanics: {
          efficiency: 91,
          symmetry: 87,
          power: 79,
        },
        thumbnail: 'shoot_analysis_3',
      },
    ],
    captureStats: {
      totalSessions: 156,
      avgScore: 84,
      improvementRate: 23,
      activeAnalyses: 12,
    },
    movementCategories: [
      {
        id: '1',
        name: 'Running',
        icon: 'directions-run',
        count: 45,
        color: '#4CAF50',
      },
      {
        id: '2',
        name: 'Jumping',
        icon: 'trending-up',
        count: 32,
        color: '#2196F3',
      },
      {
        id: '3',
        name: 'Throwing',
        icon: 'sports-baseball',
        count: 28,
        color: '#FF9800',
      },
      {
        id: '4',
        name: 'Kicking',
        icon: 'sports-soccer',
        count: 21,
        color: '#9C27B0',
      },
      {
        id: '5',
        name: 'Agility',
        icon: 'shuffle',
        count: 18,
        color: '#F44336',
      },
    ],
    aiFeatures: [
      {
        id: '1',
        title: 'Real-time Analysis',
        description: 'Live motion tracking with instant feedback',
        icon: 'visibility',
        status: 'active',
      },
      {
        id: '2',
        title: 'Biomechanical Scoring',
        description: 'Advanced AI scoring of movement efficiency',
        icon: 'analytics',
        status: 'active',
      },
      {
        id: '3',
        title: 'Injury Risk Detection',
        description: 'Identify movement patterns that may lead to injury',
        icon: 'warning',
        status: 'active',
      },
      {
        id: '4',
        title: 'Comparative Analysis',
        description: 'Compare with elite athlete movement patterns',
        icon: 'compare',
        status: 'beta',
      },
    ],
  });

  useEffect(() => {
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
  }, [fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    recordingProgress.setValue(0);
    
    Animated.timing(recordingProgress, {
      toValue: 1,
      duration: 5000, // 5 second demo recording
      useNativeDriver: false,
    }).start(() => {
      setIsRecording(false);
      Alert.alert(
        'Recording Complete',
        'Motion capture complete! AI analysis will be available in the full app.',
        [{ text: 'OK' }]
      );
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    recordingProgress.stopAnimation();
    recordingProgress.setValue(0);
  };

  const handleAnalysisPress = (analysis) => {
    setSelectedAnalysis(analysis);
    setShowAnalysisModal(true);
  };

  const handleNewCapture = () => {
    Alert.alert(
      'Motion Capture Setup',
      'Choose capture method:',
      [
        { text: 'Camera Capture', onPress: startRecording },
        { text: 'Upload Video', onPress: () => Alert.alert('Feature Coming Soon', 'Video upload will be available in the full app.') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getScoreColor = (score) => {
    if (score >= 90) return COLORS.success;
    if (score >= 75) return '#ff9800';
    return COLORS.error;
  };

  const filteredAnalyses = motionData.recentAnalyses.filter(analysis => {
    const matchesSearch = analysis.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          analysis.movement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           analysis.movement.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>
          🎯 AI Motion Capture
        </Text>
        <Text style={[TEXT_STYLES.caption, styles.headerSubtitle]}>
          Advanced biomechanical analysis
        </Text>
      </View>
      
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording...</Text>
          <Animated.View
            style={[
              styles.progressOverlay,
              {
                width: recordingProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      )}
    </LinearGradient>
  );

  const renderStatsOverview = () => (
    <Animated.View
      style={[
        styles.statsContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="videocam" size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.h2, styles.statNumber]}>
                {motionData.captureStats.totalSessions}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.statLabel]}>
                Total Sessions
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="grade" size={24} color={COLORS.success} />
              <Text style={[TEXT_STYLES.h2, styles.statNumber]}>
                {motionData.captureStats.avgScore}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.statLabel]}>
                Avg Score
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="trending-up" size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.h2, styles.statNumber]}>
                +{motionData.captureStats.improvementRate}%
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.statLabel]}>
                Improvement
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderMovementCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name="category" size={24} color={COLORS.primary} />
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
          Movement Categories
        </Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => setSelectedCategory('all')}
          style={[
            styles.categoryCard,
            selectedCategory === 'all' && styles.selectedCategoryCard,
          ]}
        >
          <Icon
            name="select-all"
            size={32}
            color={selectedCategory === 'all' ? 'white' : COLORS.primary}
          />
          <Text style={[
            TEXT_STYLES.body,
            styles.categoryName,
            selectedCategory === 'all' && styles.selectedCategoryText,
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {motionData.movementCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.name)}
            style={[
              styles.categoryCard,
              { backgroundColor: selectedCategory === category.name ? category.color : 'white' },
            ]}
          >
            <Icon
              name={category.icon}
              size={32}
              color={selectedCategory === category.name ? 'white' : category.color}
            />
            <Text style={[
              TEXT_STYLES.body,
              styles.categoryName,
              selectedCategory === category.name && styles.selectedCategoryText,
            ]}>
              {category.name}
            </Text>
            <Text style={[
              TEXT_STYLES.caption,
              styles.categoryCount,
              selectedCategory === category.name && styles.selectedCategoryText,
            ]}>
              {category.count} analyses
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAIFeatures = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name="auto-awesome" size={24} color={COLORS.primary} />
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
          AI Features
        </Text>
      </View>
      
      <View style={styles.featuresGrid}>
        {motionData.aiFeatures.map((feature) => (
          <Card key={feature.id} style={styles.featureCard}>
            <Card.Content>
              <View style={styles.featureHeader}>
                <Icon name={feature.icon} size={24} color={COLORS.primary} />
                <Chip
                  compact
                  style={[
                    styles.statusChip,
                    { backgroundColor: feature.status === 'active' ? COLORS.success : '#ff9800' },
                  ]}
                  textStyle={styles.statusText}
                >
                  {feature.status.toUpperCase()}
                </Chip>
              </View>
              <Text style={[TEXT_STYLES.h4, styles.featureTitle]}>
                {feature.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.featureDescription]}>
                {feature.description}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search analyses..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
        inputStyle={TEXT_STYLES.body}
      />
    </View>
  );

  const renderAnalysisCard = (analysis) => (
    <TouchableOpacity
      key={analysis.id}
      onPress={() => handleAnalysisPress(analysis)}
      activeOpacity={0.7}
    >
      <Card style={styles.analysisCard}>
        <Card.Content>
          <View style={styles.analysisHeader}>
            <Avatar.Text
              size={48}
              label={analysis.avatar}
              style={styles.avatar}
            />
            
            <View style={styles.analysisInfo}>
              <Text style={[TEXT_STYLES.h4, styles.playerName]}>
                {analysis.playerName}
              </Text>
              <Text style={[TEXT_STYLES.body, styles.movementType]}>
                {analysis.movement}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.analysisDate]}>
                {analysis.date} • {analysis.duration}
              </Text>
            </View>
            
            <View style={styles.scoreContainer}>
              <Text style={[
                TEXT_STYLES.h2,
                styles.aiScore,
                { color: getScoreColor(analysis.aiScore) },
              ]}>
                {analysis.aiScore}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.scoreLabel]}>
                AI Score
              </Text>
            </View>
          </View>
          
          <View style={styles.biomechanicsContainer}>
            <Text style={[TEXT_STYLES.caption, styles.biomechanicsTitle]}>
              Biomechanical Analysis
            </Text>
            <View style={styles.biomechanicsRow}>
              <View style={styles.biomechanicItem}>
                <Text style={[TEXT_STYLES.caption, styles.biomechanicLabel]}>
                  Efficiency
                </Text>
                <ProgressBar
                  progress={analysis.biomechanics.efficiency / 100}
                  color={COLORS.primary}
                  style={styles.biomechanicBar}
                />
                <Text style={[TEXT_STYLES.caption, styles.biomechanicValue]}>
                  {analysis.biomechanics.efficiency}%
                </Text>
              </View>
              
              <View style={styles.biomechanicItem}>
                <Text style={[TEXT_STYLES.caption, styles.biomechanicLabel]}>
                  Symmetry
                </Text>
                <ProgressBar
                  progress={analysis.biomechanics.symmetry / 100}
                  color={COLORS.success}
                  style={styles.biomechanicBar}
                />
                <Text style={[TEXT_STYLES.caption, styles.biomechanicValue]}>
                  {analysis.biomechanics.symmetry}%
                </Text>
              </View>
              
              <View style={styles.biomechanicItem}>
                <Text style={[TEXT_STYLES.caption, styles.biomechanicLabel]}>
                  Power
                </Text>
                <ProgressBar
                  progress={analysis.biomechanics.power / 100}
                  color='#ff9800'
                  style={styles.biomechanicBar}
                />
                <Text style={[TEXT_STYLES.caption, styles.biomechanicValue]}>
                  {analysis.biomechanics.power}%
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.keyPointsContainer}>
            <View style={styles.keyPointsRow}>
              <Icon name="check-circle" size={16} color={COLORS.success} />
              <Text style={[TEXT_STYLES.caption, styles.keyPointsCount]}>
                {analysis.keyPoints.length} Key Points
              </Text>
            </View>
            <View style={styles.keyPointsRow}>
              <Icon name="lightbulb-outline" size={16} color='#ff9800' />
              <Text style={[TEXT_STYLES.caption, styles.keyPointsCount]}>
                {analysis.improvements.length} Improvements
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderAnalysisModal = () => (
    <Portal>
      <Modal
        visible={showAnalysisModal}
        onRequestClose={() => setShowAnalysisModal(false)}
        animationType="slide"
      >
        <BlurView style={styles.modalOverlay} blurType="dark">
          <View style={styles.modalContainer}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <View style={styles.modalHeader}>
                  <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
                    Analysis Details
                  </Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowAnalysisModal(false)}
                  />
                </View>
                
                {selectedAnalysis && (
                  <ScrollView style={styles.modalContent}>
                    <View style={styles.modalPlayerInfo}>
                      <Avatar.Text
                        size={60}
                        label={selectedAnalysis.avatar}
                        style={styles.modalAvatar}
                      />
                      <View style={styles.modalPlayerDetails}>
                        <Text style={[TEXT_STYLES.h3, styles.modalPlayerName]}>
                          {selectedAnalysis.playerName}
                        </Text>
                        <Text style={[TEXT_STYLES.body, styles.modalMovement]}>
                          {selectedAnalysis.movement}
                        </Text>
                        <Text style={[TEXT_STYLES.caption, styles.modalDate]}>
                          {selectedAnalysis.date}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.modalSection}>
                      <Text style={[TEXT_STYLES.h4, styles.modalSectionTitle]}>
                        Key Observations
                      </Text>
                      {selectedAnalysis.keyPoints.map((point, index) => (
                        <View key={index} style={styles.modalListItem}>
                          <Icon name="check-circle" size={16} color={COLORS.success} />
                          <Text style={[TEXT_STYLES.body, styles.modalListText]}>
                            {point}
                          </Text>
                        </View>
                      ))}
                    </View>
                    
                    <View style={styles.modalSection}>
                      <Text style={[TEXT_STYLES.h4, styles.modalSectionTitle]}>
                        Improvement Areas
                      </Text>
                      {selectedAnalysis.improvements.map((improvement, index) => (
                        <View key={index} style={styles.modalListItem}>
                          <Icon name="lightbulb-outline" size={16} color='#ff9800' />
                          <Text style={[TEXT_STYLES.body, styles.modalListText]}>
                            {improvement}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </Card.Content>
            </Card>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" translucent />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
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
        {renderStatsOverview()}
        {renderMovementCategories()}
        {renderAIFeatures()}
        {renderSearchBar()}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="analytics" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              Recent Analyses
            </Text>
          </View>
          
          {filteredAnalyses.map(renderAnalysisCard)}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {renderAnalysisModal()}
      
      <FAB
        style={[
          styles.fab,
          isRecording && styles.recordingFab,
        ]}
        icon={isRecording ? "stop" : "videocam"}
        onPress={isRecording ? stopRecording : handleNewCapture}
        color="white"
        customSize={56}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: SPACING.sm,
  },
  recordingText: {
    ...TEXT_STYLES.body,
    color: 'white',
    flex: 1,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    margin: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statsCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    marginTop: SPACING.xs,
    color: COLORS.primary,
  },
  statLabel: {
    marginTop: SPACING.xs,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginLeft: SPACING.sm,
    color: COLORS.primary,
  },
  categoryCard: {
    backgroundColor: 'white',
    marginRight: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
    elevation: 2,
  },
  selectedCategoryCard: {
    backgroundColor: COLORS.primary,
  },
  categoryName: {
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  categoryCount: {
    marginTop: SPACING.xs,
    opacity: 0.7,
  },
  selectedCategoryText: {
    color: 'white',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  featureCard: {
    width: (width - SPACING.md * 3) / 2,
    elevation: 2,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
  },
  featureTitle: {
    marginBottom: SPACING.xs,
    color: COLORS.primary,
  },
  featureDescription: {
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchbar: {
    elevation: 2,
  },
  analysisCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  analysisInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  playerName: {
    marginBottom: SPACING.xs,
  },
  movementType: {
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  analysisDate: {
    opacity: 0.7,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  aiScore: {
    marginBottom: SPACING.xs,
  },
  scoreLabel: {
    opacity: 0.7,
  },
  biomechanicsContainer: {
    marginBottom: SPACING.md,
  },
  biomechanicsTitle: {
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  biomechanicsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  biomechanicItem: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  biomechanicLabel: {
    marginBottom: SPACING.xs,
    textAlign: 'center',
    fontSize: 11,
  },
  biomechanicBar: {
    height: 4,
    marginBottom: SPACING.xs,
  },
  biomechanicValue: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
  },
  keyPointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyPointsCount: {
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  recordingFab: {
    backgroundColor: COLORS.error,
  },
  bottomPadding: {
    height: 100,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalCard: {
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.primary,
  },
  modalContent: {
    maxHeight: height * 0.6,
  },
  modalPlayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalAvatar: {
    backgroundColor: COLORS.primary,
  },
  modalPlayerDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  modalPlayerName: {
    marginBottom: SPACING.xs,
  },
  modalMovement: {
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  modalDate: {
    opacity: 0.7,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  modalSectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  modalListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  modalListText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
};

export default MotionCaptureScreen;