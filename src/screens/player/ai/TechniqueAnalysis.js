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
  List,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TechniqueAnalysis = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, techniqueData, analysisHistory } = useSelector(state => ({
    user: state.auth.user,
    techniqueData: state.technique.data,
    analysisHistory: state.technique.history,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('overall');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('current');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock analysis data - replace with actual Redux state
  const skillCategories = [
    { id: 'overall', name: 'Overall', icon: 'sports-soccer', score: 78, trend: 'up' },
    { id: 'passing', name: 'Passing', icon: 'compare-arrows', score: 85, trend: 'up' },
    { id: 'dribbling', name: 'Dribbling', icon: 'directions-run', score: 72, trend: 'stable' },
    { id: 'shooting', name: 'Shooting', icon: 'gps-fixed', score: 68, trend: 'down' },
    { id: 'defending', name: 'Defending', icon: 'security', score: 76, trend: 'up' },
    { id: 'heading', name: 'Heading', icon: 'height', score: 71, trend: 'stable' },
  ];

  const techniqueBreakdown = {
    passing: {
      accuracy: { score: 87, trend: '+3%', status: 'excellent' },
      technique: { score: 83, trend: '+1%', status: 'good' },
      decision: { score: 79, trend: '-2%', status: 'good' },
      weight: { score: 85, trend: '+4%', status: 'excellent' },
      timing: { score: 82, trend: '+2%', status: 'good' },
    },
    dribbling: {
      ballControl: { score: 75, trend: '+2%', status: 'good' },
      closeControl: { score: 78, trend: '+1%', status: 'good' },
      changeOfPace: { score: 68, trend: '-1%', status: 'average' },
      fakesMoves: { score: 70, trend: '+3%', status: 'good' },
      composure: { score: 73, trend: '+2%', status: 'good' },
    }
  };

  const recentAnalyses = [
    {
      id: 1,
      date: '2024-08-18',
      type: 'Match Analysis',
      skill: 'Overall Performance',
      score: 78,
      duration: '90 min',
      keyFindings: ['Improved passing accuracy', 'Better positioning', 'Needs work on finishing'],
      videoUrl: 'match_analysis_1.mp4',
      aiInsights: 'Strong midfield presence, 15% improvement in pass completion',
    },
    {
      id: 2,
      date: '2024-08-16',
      type: 'Training Session',
      skill: 'Shooting Technique',
      score: 68,
      duration: '45 min',
      keyFindings: ['Inconsistent follow-through', 'Good power generation', 'Work on placement'],
      videoUrl: 'shooting_analysis_1.mp4',
      aiInsights: 'Body positioning affects accuracy by 23%',
    },
    {
      id: 3,
      date: '2024-08-14',
      type: 'Drill Analysis',
      skill: 'First Touch',
      score: 82,
      duration: '30 min',
      keyFindings: ['Excellent under pressure', 'Good body shape', 'Quick release'],
      videoUrl: 'firsttouch_analysis_1.mp4',
      aiInsights: 'Consistent technique across different ball speeds',
    },
  ];

  const improvementSuggestions = [
    {
      id: 1,
      skill: 'Shooting',
      priority: 'high',
      issue: 'Inconsistent follow-through',
      suggestion: 'Focus on keeping head steady and following through towards target',
      drill: 'Stationary shooting with emphasis on technique',
      timeToImprove: '2-3 weeks',
      impactScore: 15,
    },
    {
      id: 2,
      skill: 'Dribbling',
      priority: 'medium',
      issue: 'Change of pace timing',
      suggestion: 'Practice explosive acceleration after receiving the ball',
      drill: 'Cone weaving with speed variations',
      timeToImprove: '3-4 weeks',
      impactScore: 12,
    },
    {
      id: 3,
      skill: 'Defending',
      priority: 'medium',
      issue: 'Positioning in 1v1 situations',
      suggestion: 'Stay lower, force opponent to weaker foot',
      drill: '1v1 defending in the box',
      timeToImprove: '2-3 weeks',
      impactScore: 10,
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
      await new Promise(resolve => setTimeout(resolve, 2500));
      Alert.alert('🎯 Analysis Complete!', 'Your technique has been re-analyzed with latest AI models');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh analysis');
    }
    setRefreshing(false);
  }, []);

  const handleSkillSelection = (skillId) => {
    Vibration.vibrate(50);
    setSelectedSkill(skillId);
  };

  const handleVideoAnalysis = (videoData) => {
    setSelectedVideo(videoData);
    setShowVideoModal(true);
    Vibration.vibrate(50);
  };

  const handleStartDrill = (drill) => {
    Alert.alert(
      '🏃 Start Training Drill',
      `Would you like to start the "${drill}" drill session?`,
      [
        { text: 'Later', style: 'cancel' },
        { 
          text: 'Start Now', 
          onPress: () => {
            Vibration.vibrate(100);
            // navigation.navigate('DrillSession', { drill });
            Alert.alert('Feature Coming Soon', 'Guided drill sessions will be available soon!');
          }
        }
      ]
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return COLORS.success;
    if (score >= 70) return '#FFA726';
    if (score >= 60) return '#FF7043';
    return COLORS.error;
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
      default: return '#FFA726';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return '#FFA726';
      default: return COLORS.success;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.headerTitle}>Technique Analysis 🎯</Text>
          <Text style={styles.headerSubtitle}>AI-Powered Skill Assessment</Text>
        </View>
        <View style={styles.overallScore}>
          <Text style={styles.scoreLabel}>Overall</Text>
          <Text style={styles.scoreValue}>78%</Text>
          <Icon name="trending-up" size={16} color="white" />
        </View>
      </View>
    </LinearGradient>
  );

  const renderSkillCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.sm }}
      >
        {skillCategories.map((skill) => (
          <TouchableOpacity
            key={skill.id}
            onPress={() => handleSkillSelection(skill.id)}
            style={[
              styles.skillCard,
              selectedSkill === skill.id && styles.skillCardSelected
            ]}
          >
            <Surface style={styles.skillCardSurface}>
              <Icon 
                name={skill.icon} 
                size={24} 
                color={selectedSkill === skill.id ? 'white' : COLORS.primary} 
              />
              <Text style={[
                styles.skillScore,
                selectedSkill === skill.id && { color: 'white' }
              ]}>
                {skill.score}%
              </Text>
              <Text style={[
                styles.skillName,
                selectedSkill === skill.id && { color: 'white' }
              ]}>
                {skill.name}
              </Text>
              <View style={styles.trendContainer}>
                <Icon 
                  name={getTrendIcon(skill.trend)} 
                  size={16} 
                  color={selectedSkill === skill.id ? 'white' : getTrendColor(skill.trend)} 
                />
              </View>
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDetailedAnalysis = () => {
    const currentSkill = skillCategories.find(s => s.id === selectedSkill);
    const breakdown = techniqueBreakdown[selectedSkill];
    
    if (!breakdown) {
      return (
        <Card style={styles.analysisCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>📊 Detailed Analysis</Text>
            <View style={styles.comingSoon}>
              <Icon name="analytics" size={48} color={COLORS.textSecondary} />
              <Text style={styles.comingSoonText}>
                Detailed analysis for {currentSkill?.name || 'this skill'} coming soon!
              </Text>
            </View>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.analysisCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📊 {currentSkill.name} Breakdown</Text>
          
          {Object.entries(breakdown).map(([key, data]) => (
            <View key={key} style={styles.metricRow}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricName}>
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </Text>
                <View style={styles.metricScores}>
                  <Text style={[styles.metricTrend, { color: data.trend.includes('+') ? COLORS.success : COLORS.error }]}>
                    {data.trend}
                  </Text>
                  <Text style={[styles.metricScore, { color: getScoreColor(data.score) }]}>
                    {data.score}%
                  </Text>
                </View>
              </View>
              <ProgressBar
                progress={data.score / 100}
                color={getScoreColor(data.score)}
                style={styles.metricProgress}
              />
              <Text style={styles.metricStatus}>{data.status}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const renderRecentAnalyses = () => (
    <Card style={styles.historyCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>📹 Recent Analyses</Text>
        
        {recentAnalyses.map((analysis) => (
          <TouchableOpacity
            key={analysis.id}
            onPress={() => handleVideoAnalysis(analysis)}
            style={styles.analysisItem}
          >
            <Surface style={styles.analysisItemSurface}>
              <View style={styles.analysisInfo}>
                <View style={styles.analysisHeader}>
                  <Text style={styles.analysisType}>{analysis.type}</Text>
                  <Text style={styles.analysisDate}>{analysis.date}</Text>
                </View>
                <Text style={styles.analysisSkill}>{analysis.skill}</Text>
                <Text style={styles.analysisInsight}>{analysis.aiInsights}</Text>
                <View style={styles.analysisFooter}>
                  <Text style={styles.analysisDuration}>{analysis.duration}</Text>
                  <Text style={[styles.analysisScore, { color: getScoreColor(analysis.score) }]}>
                    {analysis.score}%
                  </Text>
                </View>
              </View>
              <Icon name="play-circle-outline" size={24} color={COLORS.primary} />
            </Surface>
          </TouchableOpacity>
        ))}

        <Button
          mode="outlined"
          icon="upload"
          onPress={() => Alert.alert('Feature Coming Soon', 'Video upload will be available soon!')}
          style={styles.uploadButton}
        >
          Upload New Video
        </Button>
      </Card.Content>
    </Card>
  );

  const renderImprovementSuggestions = () => (
    <Card style={styles.suggestionsCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>💡 AI Improvement Suggestions</Text>
        
        {improvementSuggestions.map((suggestion) => (
          <Surface key={suggestion.id} style={styles.suggestionItem}>
            <View style={styles.suggestionHeader}>
              <View style={styles.suggestionInfo}>
                <Text style={styles.suggestionSkill}>{suggestion.skill}</Text>
                <Chip
                  mode="flat"
                  compact
                  style={[styles.priorityChip, { backgroundColor: getPriorityColor(suggestion.priority) }]}
                  textStyle={{ color: 'white', fontSize: 11 }}
                >
                  {suggestion.priority}
                </Chip>
              </View>
              <Text style={styles.impactScore}>+{suggestion.impactScore}%</Text>
            </View>
            
            <Text style={styles.suggestionIssue}>Issue: {suggestion.issue}</Text>
            <Text style={styles.suggestionText}>{suggestion.suggestion}</Text>
            
            <View style={styles.suggestionFooter}>
              <Text style={styles.timeToImprove}>⏱️ {suggestion.timeToImprove}</Text>
              <Button
                mode="contained"
                compact
                onPress={() => handleStartDrill(suggestion.drill)}
                style={styles.drillButton}
                contentStyle={{ paddingVertical: 2 }}
              >
                Start Drill
              </Button>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderVideoModal = () => (
    <Portal>
      <Modal
        visible={showVideoModal}
        onDismiss={() => setShowVideoModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Card style={styles.videoCard}>
          <Card.Content>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Video Analysis</Text>
              <IconButton
                icon="close"
                onPress={() => setShowVideoModal(false)}
              />
            </View>
            
            {selectedVideo && (
              <>
                <View style={styles.videoPlaceholder}>
                  <Icon name="play-circle-outline" size={64} color={COLORS.primary} />
                  <Text style={styles.videoTitle}>{selectedVideo.skill}</Text>
                  <Text style={styles.videoType}>{selectedVideo.type}</Text>
                </View>
                
                <Text style={styles.keyFindingsTitle}>Key Findings:</Text>
                {selectedVideo.keyFindings.map((finding, index) => (
                  <Text key={index} style={styles.keyFinding}>• {finding}</Text>
                ))}
                
                <Text style={styles.aiInsightsTitle}>AI Insights:</Text>
                <Text style={styles.aiInsightsText}>{selectedVideo.aiInsights}</Text>
              </>
            )}
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
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
              title="Analyzing technique..."
              titleColor={COLORS.primary}
            />
          }
        >
          {renderHeader()}
          {renderSkillCategories()}
          
          <View style={styles.contentContainer}>
            {renderDetailedAnalysis()}
            {renderRecentAnalyses()}
            {renderImprovementSuggestions()}
            
            {/* Bottom spacing */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
      </Animated.View>

      {renderVideoModal()}

      <FAB
        icon="video-plus"
        label="Record"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Video recording will be available soon!')}
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
  overallScore: {
    alignItems: 'center',
  },
  scoreLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scoreValue: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
    marginVertical: 2,
  },
  categoriesContainer: {
    paddingVertical: SPACING.md,
  },
  skillCard: {
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  skillCardSelected: {
    transform: [{ scale: 1.05 }],
  },
  skillCardSurface: {
    width: 90,
    height: 100,
    padding: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    backgroundColor: 'white',
  },
  skillScore: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
    color: COLORS.text,
  },
  skillName: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: 2,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  trendContainer: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  analysisCard: {
    marginBottom: SPACING.md,
    elevation: 4,
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  comingSoonText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  metricRow: {
    marginBottom: SPACING.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  metricName: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  metricScores: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricTrend: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
  },
  metricScore: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  metricProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  metricStatus: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  historyCard: {
    marginBottom: SPACING.md,
    elevation: 4,
  },
  analysisItem: {
    marginBottom: SPACING.sm,
  },
  analysisItemSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: 'white',
  },
  analysisInfo: {
    flex: 1,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  analysisType: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  analysisDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  analysisSkill: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  analysisInsight: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  analysisFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  analysisScore: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  uploadButton: {
    marginTop: SPACING.md,
    borderColor: COLORS.primary,
  },
  suggestionsCard: {
    marginBottom: SPACING.md,
    elevation: 4,
  },
  suggestionItem: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: 'white',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  suggestionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionSkill: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  priorityChip: {
    height: 24,
  },
  impactScore: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  suggestionIssue: {
    ...TEXT_STYLES.body,
    color: COLORS.error,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  suggestionText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  suggestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeToImprove: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  drillButton: {
    borderRadius: 6,
  },
  modalContent: {
    margin: SPACING.md,
    backgroundColor: 'transparent',
  },
  videoCard: {
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  videoPlaceholder: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  videoTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
    color: COLORS.text,
  },
  videoType: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  keyFindingsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  keyFinding: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  aiInsightsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  aiInsightsText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.sm,
    borderRadius: 6,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.error,
  },
});

export default TechniqueAnalysis;