import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  RefreshControl,
  FlatList,
  Vibration,
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
  Portal,
  Modal,
  Searchbar,
  TextInput,
  RadioButton,
  Checkbox,
  Slider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const PredictivePlans = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const { user, theme } = useSelector(state => state.auth);
  const { clients, analytics } = useSelector(state => state.training);

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('predictions');
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showPredictionDetails, setShowPredictionDetails] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [predictionSettings, setPredictionSettings] = useState({
    timeframe: '4weeks',
    focusArea: 'performance',
    difficulty: 'adaptive',
    includeRecovery: true,
    includeNutrition: true,
    riskAssessment: true,
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Mock data for AI predictions
  const predictivePlans = [
    {
      id: 1,
      clientId: 'client_001',
      clientName: 'Sarah Johnson',
      clientAvatar: 'https://i.pravatar.cc/150?img=1',
      planType: 'Performance Enhancement',
      confidence: 94,
      predictedOutcome: 'Strength +15%, Endurance +12%',
      timeframe: '8 weeks',
      riskLevel: 'Low',
      aiInsights: [
        'Current plateau can be broken with progressive overload',
        'Recovery patterns suggest 5-day training optimal',
        'Compound movements will yield best results'
      ],
      predictedMilestones: [
        { week: 2, goal: 'Form improvement', probability: 98 },
        { week: 4, goal: 'Strength increase 8%', probability: 89 },
        { week: 6, goal: 'Endurance boost 10%', probability: 85 },
        { week: 8, goal: 'Target achievement', probability: 94 }
      ],
      adaptiveFactors: {
        stress: 'moderate',
        sleep: 'good',
        nutrition: 'excellent',
        motivation: 'high'
      },
      generatedAt: '2024-08-19T10:30:00Z',
      status: 'active'
    },
    {
      id: 2,
      clientId: 'client_002',
      clientName: 'Mike Chen',
      clientAvatar: 'https://i.pravatar.cc/150?img=2',
      planType: 'Weight Loss + Muscle Gain',
      confidence: 87,
      predictedOutcome: 'Fat Loss -8%, Muscle +5%',
      timeframe: '12 weeks',
      riskLevel: 'Medium',
      aiInsights: [
        'Metabolic adaptation requires periodic refeeds',
        'HIIT combined with strength training optimal',
        'Sleep quality critical for success'
      ],
      predictedMilestones: [
        { week: 3, goal: 'Initial fat loss 3%', probability: 92 },
        { week: 6, goal: 'Muscle gain visible', probability: 78 },
        { week: 9, goal: 'Fat loss 6%', probability: 81 },
        { week: 12, goal: 'Target composition', probability: 87 }
      ],
      adaptiveFactors: {
        stress: 'high',
        sleep: 'poor',
        nutrition: 'good',
        motivation: 'moderate'
      },
      generatedAt: '2024-08-18T15:45:00Z',
      status: 'needs_adjustment'
    },
    {
      id: 3,
      clientId: 'client_003',
      clientName: 'Emma Rodriguez',
      clientAvatar: 'https://i.pravatar.cc/150?img=3',
      planType: 'Sport Performance',
      confidence: 91,
      predictedOutcome: 'Speed +10%, Agility +15%',
      timeframe: '6 weeks',
      riskLevel: 'Low',
      aiInsights: [
        'Plyometric training will maximize gains',
        'Sport-specific drills show high correlation',
        'Recovery optimization needed for peak performance'
      ],
      predictedMilestones: [
        { week: 1, goal: 'Movement pattern', probability: 95 },
        { week: 3, goal: 'Speed increase 5%', probability: 88 },
        { week: 4, goal: 'Agility boost 8%', probability: 87 },
        { week: 6, goal: 'Competition ready', probability: 91 }
      ],
      adaptiveFactors: {
        stress: 'low',
        sleep: 'excellent',
        nutrition: 'good',
        motivation: 'very_high'
      },
      generatedAt: '2024-08-17T09:15:00Z',
      status: 'optimizing'
    }
  ];

  const aiMetrics = {
    totalPredictions: 247,
    avgConfidence: 89.3,
    successRate: 92.1,
    activeClients: 34,
    predictionsThisWeek: 12,
    accuracyTrend: '+3.2%'
  };

  const riskFactors = [
    {
      factor: 'Overtraining Risk',
      level: 'Low',
      percentage: 15,
      clients: ['client_002'],
      recommendations: 'Monitor recovery metrics closely'
    },
    {
      factor: 'Injury Probability',
      level: 'Medium',
      percentage: 23,
      clients: ['client_004', 'client_007'],
      recommendations: 'Implement additional mobility work'
    },
    {
      factor: 'Plateau Risk',
      level: 'High',
      percentage: 67,
      clients: ['client_001', 'client_003', 'client_008'],
      recommendations: 'Plan variation and progressive overload'
    }
  ];

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for AI processing indicators
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate AI model refresh
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const generatePredictivePlan = (client) => {
    setAiProcessing(true);
    setProcessingProgress(0);
    setSelectedClient(client);
    
    // Simulate AI processing with realistic steps
    const steps = [
      'Analyzing historical data...',
      'Processing biometrics...',
      'Calculating risk factors...',
      'Optimizing plan structure...',
      'Generating predictions...',
      'Validating outcomes...',
      'Finalizing recommendations...'
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = prev + (100 / steps.length);
        if (newProgress >= 100) {
          clearInterval(interval);
          setAiProcessing(false);
          Vibration.vibrate([100, 200, 100]);
          Alert.alert(
            '🧠 AI Analysis Complete',
            'Predictive training plan generated with 94% confidence!',
            [
              { text: 'View Plan', onPress: () => setActiveTab('predictions') },
              { text: 'Later', style: 'cancel' }
            ]
          );
          return 100;
        }
        return newProgress;
      });
      currentStep++;
    }, 800);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return COLORS.success;
    if (confidence >= 75) return COLORS.warning;
    return COLORS.error;
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low': return COLORS.success;
      case 'medium': return COLORS.warning;
      case 'high': return COLORS.error;
      default: return COLORS.text;
    }
  };

  const renderPredictionCard = (plan) => (
    <TouchableOpacity
      key={plan.id}
      style={styles.predictionCard}
      onPress={() => {
        setSelectedPrediction(plan);
        setShowPredictionDetails(true);
        Vibration.vibrate(30);
      }}
    >
      <Card style={styles.card} elevation={3}>
        {/* Client Header */}
        <View style={styles.clientHeader}>
          <Avatar.Image
            source={{ uri: plan.clientAvatar }}
            size={48}
          />
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{plan.clientName}</Text>
            <Text style={styles.planType}>{plan.planType}</Text>
          </View>
          
          <View style={styles.confidenceContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Surface style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(plan.confidence) + '20' }]}>
                <Text style={[styles.confidenceText, { color: getConfidenceColor(plan.confidence) }]}>
                  {plan.confidence}%
                </Text>
              </Surface>
            </Animated.View>
          </View>
        </View>

        {/* Prediction Summary */}
        <View style={styles.predictionSummary}>
          <View style={styles.outcomeContainer}>
            <Icon name="trending-up" size={20} color={COLORS.success} />
            <Text style={styles.outcomeText}>{plan.predictedOutcome}</Text>
          </View>
          
          <View style={styles.metaInfo}>
            <Chip
              mode="outlined"
              compact
              icon="schedule"
              style={styles.timeChip}
            >
              {plan.timeframe}
            </Chip>
            <Chip
              mode="outlined"
              compact
              style={[styles.riskChip, { borderColor: getRiskColor(plan.riskLevel) }]}
              textStyle={{ color: getRiskColor(plan.riskLevel) }}
            >
              {plan.riskLevel} Risk
            </Chip>
          </View>
        </View>

        {/* AI Insights Preview */}
        <View style={styles.insightsPreview}>
          <Text style={styles.insightsTitle}>🧠 Key AI Insights</Text>
          <Text style={styles.insightText} numberOfLines={2}>
            {plan.aiInsights[0]}
          </Text>
        </View>

        {/* Progress Indicators */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Predicted Milestones</Text>
          <View style={styles.milestonesContainer}>
            {plan.predictedMilestones.slice(0, 3).map((milestone, index) => (
              <View key={index} style={styles.milestoneItem}>
                <Text style={styles.milestoneWeek}>W{milestone.week}</Text>
                <View style={[
                  styles.milestoneIndicator,
                  { backgroundColor: milestone.probability > 85 ? COLORS.success : COLORS.warning }
                ]} />
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            compact
            onPress={() => {
              setSelectedPrediction(plan);
              setShowPredictionDetails(true);
            }}
            style={styles.detailsButton}
          >
            View Details
          </Button>
          
          <Button
            mode="contained"
            compact
            onPress={() => {
              Alert.alert('Implement Plan', `Activate predictive plan for ${plan.clientName}?`);
            }}
            style={styles.implementButton}
            icon="play-arrow"
          >
            Implement
          </Button>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderMetricsOverview = () => (
    <Card style={styles.metricsCard} elevation={2}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.metricsGradient}
      >
        <Text style={styles.metricsTitle}>🧠 AI Performance Metrics</Text>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{aiMetrics.totalPredictions}</Text>
            <Text style={styles.metricLabel}>Total Predictions</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{aiMetrics.avgConfidence}%</Text>
            <Text style={styles.metricLabel}>Avg Confidence</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{aiMetrics.successRate}%</Text>
            <Text style={styles.metricLabel}>Success Rate</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{aiMetrics.accuracyTrend}</Text>
            <Text style={styles.metricLabel}>This Month</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderRiskAnalysis = () => (
    <View style={styles.riskSection}>
      <Text style={styles.sectionTitle}>⚠️ Risk Analysis</Text>
      {riskFactors.map((risk, index) => (
        <Card key={index} style={styles.riskCard}>
          <View style={styles.riskHeader}>
            <Text style={styles.riskFactor}>{risk.factor}</Text>
            <Chip
              mode="flat"
              style={[styles.riskLevelChip, { backgroundColor: getRiskColor(risk.level) + '20' }]}
              textStyle={{ color: getRiskColor(risk.level) }}
            >
              {risk.level}
            </Chip>
          </View>
          
          <View style={styles.riskDetails}>
            <ProgressBar
              progress={risk.percentage / 100}
              color={getRiskColor(risk.level)}
              style={styles.riskProgress}
            />
            <Text style={styles.riskPercentage}>{risk.percentage}% of clients</Text>
          </View>
          
          <Text style={styles.riskRecommendation}>{risk.recommendations}</Text>
        </Card>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'predictions':
        return (
          <View style={styles.tabContent}>
            {renderMetricsOverview()}
            <Text style={styles.sectionTitle}>🔮 Active Predictions</Text>
            {predictivePlans.map(renderPredictionCard)}
          </View>
        );
      
      case 'analytics':
        return (
          <View style={styles.tabContent}>
            {renderMetricsOverview()}
            {renderRiskAnalysis()}
          </View>
        );
      
      case 'settings':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>⚙️ AI Settings</Text>
            <Card style={styles.settingsCard}>
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Prediction Timeframe</Text>
                <RadioButton.Group
                  onValueChange={value => setPredictionSettings({...predictionSettings, timeframe: value})}
                  value={predictionSettings.timeframe}
                >
                  {[
                    { value: '2weeks', label: '2 Weeks' },
                    { value: '4weeks', label: '4 Weeks' },
                    { value: '8weeks', label: '8 Weeks' },
                    { value: '12weeks', label: '12 Weeks' }
                  ].map(option => (
                    <View key={option.value} style={styles.radioRow}>
                      <RadioButton value={option.value} />
                      <Text style={styles.radioText}>{option.label}</Text>
                    </View>
                  ))}
                </RadioButton.Group>
              </View>

              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Focus Areas</Text>
                <View style={styles.checkboxGroup}>
                  {[
                    { key: 'includeRecovery', label: 'Recovery Analysis' },
                    { key: 'includeNutrition', label: 'Nutrition Factors' },
                    { key: 'riskAssessment', label: 'Risk Assessment' }
                  ].map(option => (
                    <View key={option.key} style={styles.checkboxRow}>
                      <Checkbox
                        status={predictionSettings[option.key] ? 'checked' : 'unchecked'}
                        onPress={() => setPredictionSettings({
                          ...predictionSettings,
                          [option.key]: !predictionSettings[option.key]
                        })}
                      />
                      <Text style={styles.checkboxText}>{option.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          </View>
        );
      
      default:
        return null;
    }
  };

  const renderPredictionDetails = () => (
    <Portal>
      <Modal
        visible={showPredictionDetails}
        onDismiss={() => setShowPredictionDetails(false)}
        contentContainerStyle={styles.detailsModal}
      >
        {selectedPrediction && (
          <>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleSection}>
                <Avatar.Image
                  source={{ uri: selectedPrediction.clientAvatar }}
                  size={40}
                />
                <View style={styles.modalClientInfo}>
                  <Text style={styles.modalTitle}>{selectedPrediction.clientName}</Text>
                  <Text style={styles.modalSubtitle}>{selectedPrediction.planType}</Text>
                </View>
              </View>
              <IconButton
                icon="close"
                onPress={() => setShowPredictionDetails(false)}
                iconColor={COLORS.primary}
              />
            </View>

            <ScrollView style={styles.detailsContent}>
              {/* Confidence & Outcome */}
              <Card style={styles.detailCard}>
                <LinearGradient
                  colors={[getConfidenceColor(selectedPrediction.confidence) + '20', getConfidenceColor(selectedPrediction.confidence) + '10']}
                  style={styles.outcomeCard}
                >
                  <Text style={styles.detailCardTitle}>🎯 Predicted Outcome</Text>
                  <Text style={styles.outcomeDetail}>{selectedPrediction.predictedOutcome}</Text>
                  <View style={styles.confidenceDetail}>
                    <Text style={styles.confidenceLabel}>AI Confidence: </Text>
                    <Text style={[styles.confidenceValue, { color: getConfidenceColor(selectedPrediction.confidence) }]}>
                      {selectedPrediction.confidence}%
                    </Text>
                  </View>
                </LinearGradient>
              </Card>

              {/* AI Insights */}
              <Card style={styles.detailCard}>
                <Text style={styles.detailCardTitle}>🧠 AI Insights</Text>
                {selectedPrediction.aiInsights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <View style={styles.insightBullet} />
                    <Text style={styles.insightDetailText}>{insight}</Text>
                  </View>
                ))}
              </Card>

              {/* Milestone Timeline */}
              <Card style={styles.detailCard}>
                <Text style={styles.detailCardTitle}>📈 Predicted Milestones</Text>
                {selectedPrediction.predictedMilestones.map((milestone, index) => (
                  <View key={index} style={styles.milestoneDetail}>
                    <View style={styles.milestoneLeft}>
                      <View style={[
                        styles.milestoneCircle,
                        { backgroundColor: milestone.probability > 85 ? COLORS.success : COLORS.warning }
                      ]}>
                        <Text style={styles.milestoneWeekText}>W{milestone.week}</Text>
                      </View>
                    </View>
                    <View style={styles.milestoneRight}>
                      <Text style={styles.milestoneGoal}>{milestone.goal}</Text>
                      <Text style={styles.milestoneProbability}>
                        {milestone.probability}% probability
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>

              {/* Adaptive Factors */}
              <Card style={styles.detailCard}>
                <Text style={styles.detailCardTitle}>🔄 Current Factors</Text>
                <View style={styles.factorsGrid}>
                  {Object.entries(selectedPrediction.adaptiveFactors).map(([factor, level]) => (
                    <View key={factor} style={styles.factorItem}>
                      <Text style={styles.factorName}>{factor.charAt(0).toUpperCase() + factor.slice(1)}</Text>
                      <Chip
                        mode="outlined"
                        compact
                        style={styles.factorLevel}
                      >
                        {level.replace('_', ' ')}
                      </Chip>
                    </View>
                  ))}
                </View>
              </Card>
            </ScrollView>

            <View style={styles.detailsActions}>
              <Button
                mode="outlined"
                onPress={() => setShowPredictionDetails(false)}
                style={styles.cancelButton}
              >
                Close
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setShowPredictionDetails(false);
                  Alert.alert('Plan Activated', 'Predictive plan has been implemented!');
                }}
                style={styles.implementDetailButton}
                icon="rocket-launch"
              >
                Implement Plan
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );

  const renderAiProcessingModal = () => (
    <Portal>
      <Modal
        visible={aiProcessing}
        contentContainerStyle={styles.processingModal}
      >
        <View style={styles.processingContent}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Icon name="psychology" size={64} color={COLORS.primary} />
          </Animated.View>
          
          <Text style={styles.processingTitle}>🧠 AI Analysis in Progress</Text>
          <Text style={styles.processingSubtitle}>
            Analyzing {selectedClient?.name}'s data patterns...
          </Text>
          
          <ProgressBar
            progress={processingProgress / 100}
            color={COLORS.primary}
            style={styles.processingProgressBar}
          />
          
          <Text style={styles.processingPercentage}>{Math.round(processingProgress)}%</Text>
          
          <Text style={styles.processingSteps}>
            {processingProgress < 15 ? '📊 Analyzing historical data...' :
             processingProgress < 30 ? '💪 Processing biometrics...' :
             processingProgress < 45 ? '⚠️ Calculating risk factors...' :
             processingProgress < 60 ? '🏗️ Optimizing plan structure...' :
             processingProgress < 75 ? '🔮 Generating predictions...' :
             processingProgress < 90 ? '✅ Validating outcomes...' :
             '🎯 Finalizing recommendations...'}
          </Text>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>🔮 Predictive Plans</Text>
        <Text style={styles.headerSubtitle}>
          AI-powered insights for optimal training outcomes
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'predictions', label: 'Predictions', icon: 'psychology' },
          { key: 'analytics', label: 'Analytics', icon: 'analytics' },
          { key: 'settings', label: 'Settings', icon: 'tune' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => {
              setActiveTab(tab.key);
              Vibration.vibrate(30);
            }}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? COLORS.primary : COLORS.text + '60'}
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search predictions, clients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              title="Updating AI models..."
              titleColor={COLORS.primary}
            />
          }
        >
          {renderTabContent()}
        </ScrollView>
      </Animated.View>

      {/* Modals */}
      {renderPredictionDetails()}
      {renderAiProcessingModal()}

      {/* Floating Action Button */}
      <FAB
        icon="auto-awesome"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Generate Prediction',
            'Select a client to generate AI predictions for:',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Select Client', onPress: () => setShowClientSelector(true) }
            ]
          );
        }}
        label="Generate"
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabLabel: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.text + '60',
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: 'white',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  metricsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  metricsGradient: {
    padding: SPACING.lg,
  },
  metricsTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metricItem: {
    alignItems: 'center',
    width: '23%',
  },
  metricValue: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  predictionCard: {
    marginBottom: SPACING.md,
  },
  card: {
    padding: SPACING.md,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  clientInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  clientName: {
    ...TEXT_STYLES.h4,
    marginBottom: SPACING.xs,
  },
  planType: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  confidenceText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  predictionSummary: {
    marginBottom: SPACING.md,
  },
  outcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  outcomeText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.primary + '20',
  },
  riskChip: {
    backgroundColor: 'transparent',
  },
  insightsPreview: {
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  insightsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  insightText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text + '80',
    lineHeight: 18,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.sm,
    color: COLORS.text + '80',
  },
  milestonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestoneItem: {
    alignItems: 'center',
  },
  milestoneWeek: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  milestoneIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  detailsButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  implementButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  riskSection: {
    marginTop: SPACING.lg,
  },
  riskCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  riskFactor: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    flex: 1,
  },
  riskLevelChip: {
    borderWidth: 0,
  },
  riskDetails: {
    marginBottom: SPACING.sm,
  },
  riskProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  riskPercentage: {
    ...TEXT_STYLES.caption,
    color: COLORS.text + '80',
  },
  riskRecommendation: {
    ...TEXT_STYLES.caption,
    color: COLORS.text + '80',
    fontStyle: 'italic',
  },
  settingsCard: {
    padding: SPACING.lg,
  },
  settingSection: {
    marginBottom: SPACING.lg,
  },
  settingLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  radioText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
  },
  checkboxGroup: {
    marginTop: SPACING.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  checkboxText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
  },
  detailsModal: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: 12,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalClientInfo: {
    marginLeft: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h4,
  },
  modalSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  detailsContent: {
    flex: 1,
    padding: SPACING.md,
  },
  detailCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailCardTitle: {
    ...TEXT_STYLES.h4,
    marginBottom: SPACING.md,
  },
  outcomeCard: {
    padding: SPACING.lg,
    borderRadius: 8,
  },
  outcomeDetail: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  confidenceDetail: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confidenceLabel: {
    ...TEXT_STYLES.body,
  },
  confidenceValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  insightBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    marginRight: SPACING.sm,
  },
  insightDetailText: {
    ...TEXT_STYLES.body,
    flex: 1,
    lineHeight: 22,
  },
  milestoneDetail: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  milestoneLeft: {
    width: 60,
    alignItems: 'center',
  },
  milestoneCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneWeekText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
  },
  milestoneRight: {
    flex: 1,
    paddingLeft: SPACING.md,
  },
  milestoneGoal: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  milestoneProbability: {
    ...TEXT_STYLES.caption,
    color: COLORS.text + '80',
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  factorItem: {
    width: '48%',
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  factorName: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  factorLevel: {
    backgroundColor: COLORS.background,
  },
  detailsActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  implementDetailButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  processingModal: {
    backgroundColor: 'white',
    margin: SPACING.xl,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  processingContent: {
    alignItems: 'center',
    width: '100%',
  },
  processingTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  processingSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text + '80',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  processingProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  processingPercentage: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  processingSteps: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.text + '80',
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
});

export default PredictivePlans;