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
  warning: '#f59e0b',
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

const SmartProgression = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, clients } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock progression data
  const [progressionData, setProgressionData] = useState([
    {
      id: 1,
      clientName: 'Sarah Johnson',
      clientAvatar: 'SJ',
      age: 28,
      goals: ['Weight Loss', 'Strength'],
      overallProgress: 0.85,
      progressTrend: 'improving',
      weeklyImprovement: 12,
      totalSessions: 24,
      completionRate: 0.92,
      lastSession: '2 days ago',
      keyMetrics: {
        strength: { current: 85, previous: 78, change: 9, unit: 'kg' },
        endurance: { current: 22, previous: 18, change: 22, unit: 'min' },
        bodyFat: { current: 18.5, previous: 21.2, change: -2.7, unit: '%' },
        weight: { current: 68.2, previous: 72.1, change: -3.9, unit: 'kg' },
      },
      aiInsights: [
        'Strength gains accelerating - increase progressive overload',
        'Excellent adherence to program - maintain current frequency',
        'Consider adding plyometric exercises for power development'
      ],
      riskFactors: [],
      nextMilestone: 'Deadlift bodyweight (68kg)',
      estimatedCompletion: '2 weeks',
    },
    {
      id: 2,
      clientName: 'Mike Thompson',
      clientAvatar: 'MT',
      age: 35,
      goals: ['Muscle Gain', 'Athletic Performance'],
      overallProgress: 0.72,
      progressTrend: 'stable',
      weeklyImprovement: 5,
      totalSessions: 32,
      completionRate: 0.88,
      lastSession: '1 day ago',
      keyMetrics: {
        strength: { current: 120, previous: 115, change: 4.3, unit: 'kg' },
        muscle: { current: 78.5, previous: 76.8, change: 1.7, unit: 'kg' },
        bodyFat: { current: 12.1, previous: 13.5, change: -1.4, unit: '%' },
        vo2max: { current: 52, previous: 48, change: 8.3, unit: 'ml/kg/min' },
      },
      aiInsights: [
        'Progress plateau detected - recommend deload week',
        'Sleep quality affecting recovery - address lifestyle factors',
        'Excellent form consistency - ready for advanced techniques'
      ],
      riskFactors: ['Overtraining risk', 'Sleep deficiency'],
      nextMilestone: 'Bench press 1.5x bodyweight',
      estimatedCompletion: '4 weeks',
    },
    {
      id: 3,
      clientName: 'Emma Davis',
      clientAvatar: 'ED',
      age: 42,
      goals: ['General Fitness', 'Injury Recovery'],
      overallProgress: 0.63,
      progressTrend: 'improving',
      weeklyImprovement: 8,
      totalSessions: 16,
      completionRate: 0.95,
      lastSession: '3 days ago',
      keyMetrics: {
        mobility: { current: 85, previous: 68, change: 25, unit: '°' },
        strength: { current: 45, previous: 38, change: 18, unit: 'kg' },
        pain: { current: 2, previous: 6, change: -67, unit: '/10' },
        balance: { current: 28, previous: 18, change: 56, unit: 'sec' },
      },
      aiInsights: [
        'Outstanding injury recovery progress',
        'Mobility improvements exceeding expectations',
        'Ready to progress to intermediate exercises'
      ],
      riskFactors: ['Previous knee injury'],
      nextMilestone: 'Full squat range of motion',
      estimatedCompletion: '3 weeks',
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
    setTimeout(() => {
      Alert.alert('🔄 Data Synced', 'Progression data updated with latest metrics!');
      setRefreshing(false);
    }, 2000);
  }, []);

  const generateAIAnalysis = (client) => {
    setSelectedClient(client);
    setLoadingAnalysis(true);
    setAnalysisModalVisible(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setLoadingAnalysis(false);
    }, 3000);
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return COLORS.success;
      case 'stable': return COLORS.warning;
      case 'declining': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return 'trending-up';
      case 'stable': return 'trending-flat';
      case 'declining': return 'trending-down';
      default: return 'remove';
    }
  };

  const formatMetricChange = (change, unit) => {
    const sign = change >= 0 ? '+' : '';
    const color = change >= 0 ? COLORS.success : COLORS.error;
    return { text: `${sign}${change}${unit}`, color };
  };

  const filteredClients = progressionData.filter(client =>
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.goals.some(goal => goal.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderProgressionCard = (client) => (
    <TouchableOpacity
      key={client.id}
      onPress={() => {
        setSelectedClient(client);
        setModalVisible(true);
      }}
      activeOpacity={0.8}
    >
      <Card style={styles.clientCard}>
        <Card.Content>
          <View style={styles.clientHeader}>
            <View style={styles.clientInfo}>
              <Avatar.Text 
                size={50} 
                label={client.clientAvatar}
                style={{ backgroundColor: COLORS.primary }}
              />
              <View style={styles.clientDetails}>
                <Text style={TEXT_STYLES.h3}>{client.clientName}</Text>
                <Text style={TEXT_STYLES.caption}>{client.age} years • {client.totalSessions} sessions</Text>
                <Text style={TEXT_STYLES.caption}>Last active: {client.lastSession}</Text>
              </View>
            </View>
            <View style={styles.trendIndicator}>
              <Icon 
                name={getTrendIcon(client.progressTrend)} 
                size={24} 
                color={getTrendColor(client.progressTrend)} 
              />
              <Text style={[TEXT_STYLES.caption, { color: getTrendColor(client.progressTrend) }]}>
                {client.weeklyImprovement}%
              </Text>
            </View>
          </View>

          <View style={styles.goalsContainer}>
            {client.goals.map((goal, index) => (
              <Chip key={index} compact style={styles.goalChip}>
                {goal}
              </Chip>
            ))}
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={TEXT_STYLES.body}>Overall Progress</Text>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                {Math.round(client.overallProgress * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={client.overallProgress}
              color={COLORS.primary}
              style={styles.progressBar}
            />
            <Text style={[TEXT_STYLES.caption, styles.completionRate]}>
              Completion Rate: {Math.round(client.completionRate * 100)}%
            </Text>
          </View>

          <View style={styles.metricsPreview}>
            {Object.entries(client.keyMetrics).slice(0, 2).map(([key, metric]) => {
              const change = formatMetricChange(metric.change, '%');
              return (
                <View key={key} style={styles.metricPreview}>
                  <Text style={TEXT_STYLES.caption}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <Text style={TEXT_STYLES.body}>{metric.current}{metric.unit}</Text>
                  <Text style={[TEXT_STYLES.caption, { color: change.color }]}>
                    {change.text}
                  </Text>
                </View>
              );
            })}
          </View>

          {client.riskFactors.length > 0 && (
            <View style={styles.riskAlert}>
              <Icon name="warning" size={16} color={COLORS.warning} />
              <Text style={[TEXT_STYLES.caption, styles.riskText]}>
                {client.riskFactors.length} risk factor{client.riskFactors.length > 1 ? 's' : ''} detected
              </Text>
            </View>
          )}

          <View style={styles.nextMilestone}>
            <Icon name="flag" size={16} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.caption, styles.milestoneText]}>
              Next: {client.nextMilestone} (~{client.estimatedCompletion})
            </Text>
          </View>
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
        {selectedClient && (
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalClientInfo}>
                <Avatar.Text 
                  size={40} 
                  label={selectedClient.clientAvatar}
                  style={{ backgroundColor: COLORS.primary }}
                />
                <View style={styles.modalClientDetails}>
                  <Text style={TEXT_STYLES.h2}>{selectedClient.clientName}</Text>
                  <Text style={TEXT_STYLES.caption}>Detailed Progression Analysis</Text>
                </View>
              </View>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.metricsGrid}>
                {Object.entries(selectedClient.keyMetrics).map(([key, metric]) => {
                  const change = formatMetricChange(metric.change, '%');
                  return (
                    <View key={key} style={styles.detailMetric}>
                      <Text style={TEXT_STYLES.caption}>{key.toUpperCase()}</Text>
                      <Text style={TEXT_STYLES.h2}>{metric.current}{metric.unit}</Text>
                      <View style={styles.metricChange}>
                        <Text style={TEXT_STYLES.caption}>from {metric.previous}{metric.unit}</Text>
                        <Text style={[TEXT_STYLES.caption, { color: change.color, fontWeight: 'bold' }]}>
                          {change.text}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <Divider style={styles.divider} />

              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>🧠 AI Insights</Text>
              {selectedClient.aiInsights.map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <Icon name="lightbulb-outline" size={20} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.body, styles.insightText]}>{insight}</Text>
                </View>
              ))}

              {selectedClient.riskFactors.length > 0 && (
                <>
                  <Text style={[TEXT_STYLES.h3, styles.sectionTitle, { color: COLORS.warning }]}>
                    ⚠️ Risk Factors
                  </Text>
                  {selectedClient.riskFactors.map((risk, index) => (
                    <View key={index} style={styles.riskItem}>
                      <Icon name="warning" size={20} color={COLORS.warning} />
                      <Text style={[TEXT_STYLES.body, styles.riskItemText]}>{risk}</Text>
                    </View>
                  ))}
                </>
              )}

              <View style={styles.milestoneSection}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>🎯 Next Milestone</Text>
                <Surface style={styles.milestoneCard}>
                  <Text style={TEXT_STYLES.h3}>{selectedClient.nextMilestone}</Text>
                  <Text style={TEXT_STYLES.caption}>Estimated completion: {selectedClient.estimatedCompletion}</Text>
                  <ProgressBar
                    progress={selectedClient.overallProgress}
                    color={COLORS.primary}
                    style={styles.milestoneProgress}
                  />
                </Surface>
              </View>

              <View style={styles.modalButtons}>
                <Button
                  mode="contained"
                  onPress={() => generateAIAnalysis(selectedClient)}
                  style={styles.primaryButton}
                  labelStyle={{ color: 'white' }}
                  icon="psychology"
                >
                  Generate AI Report
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('ClientDetails', { clientId: selectedClient.id });
                  }}
                  style={styles.secondaryButton}
                >
                  View Full Profile
                </Button>
              </View>
            </ScrollView>
          </Surface>
        )}
      </Modal>
    </Portal>
  );

  const renderAnalysisModal = () => (
    <Portal>
      <Modal
        visible={analysisModalVisible}
        onDismiss={() => setAnalysisModalVisible(false)}
        contentContainerStyle={styles.analysisModalContainer}
      >
        <Surface style={styles.analysisModalContent}>
          <View style={styles.analysisHeader}>
            <Text style={TEXT_STYLES.h2}>🤖 AI Analysis Report</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setAnalysisModalVisible(false)}
            />
          </View>

          {loadingAnalysis ? (
            <View style={styles.loadingContainer}>
              <Icon name="psychology" size={64} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.h3, styles.loadingTitle]}>Analyzing Data...</Text>
              <Text style={[TEXT_STYLES.body, styles.loadingText]}>
                AI is processing performance metrics, identifying patterns, and generating insights
              </Text>
              <ProgressBar 
                indeterminate 
                color={COLORS.primary}
                style={styles.loadingProgress}
              />
            </View>
          ) : selectedClient && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[TEXT_STYLES.body, styles.analysisIntro]}>
                Comprehensive AI analysis for {selectedClient.clientName}
              </Text>

              <View style={styles.analysisSection}>
                <Text style={[TEXT_STYLES.h3, styles.analysisSectionTitle]}>📊 Performance Summary</Text>
                <Text style={TEXT_STYLES.body}>
                  {selectedClient.clientName} shows {selectedClient.progressTrend} progress with a {Math.round(selectedClient.overallProgress * 100)}% completion rate. 
                  Weekly improvements average {selectedClient.weeklyImprovement}% across all metrics.
                </Text>
              </View>

              <View style={styles.analysisSection}>
                <Text style={[TEXT_STYLES.h3, styles.analysisSectionTitle]}>🎯 Optimization Recommendations</Text>
                <Text style={TEXT_STYLES.body}>
                  • Increase progressive overload by 5-10% next week{'\n'}
                  • Focus on compound movements for efficiency{'\n'}
                  • Add 2 rest days for optimal recovery{'\n'}
                  • Consider nutritional consultation for body composition goals
                </Text>
              </View>

              <View style={styles.analysisSection}>
                <Text style={[TEXT_STYLES.h3, styles.analysisSectionTitle]}>⚡ Predicted Outcomes</Text>
                <Text style={TEXT_STYLES.body}>
                  Based on current trajectory, {selectedClient.clientName} will achieve their primary goal 
                  {selectedClient.progressTrend === 'improving' ? '2 weeks ahead' : 'on schedule'}. 
                  Consistency remains the key factor for continued success.
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={() => {
                  setAnalysisModalVisible(false);
                  Alert.alert('📧 Report Sent', 'AI analysis report has been saved and sent to client!');
                }}
                style={styles.primaryButton}
                labelStyle={{ color: 'white' }}
              >
                Save & Share Report
              </Button>
            </ScrollView>
          )}
        </Surface>
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
          <Text style={styles.headerTitle}>📈 Smart Progression</Text>
          <Text style={styles.headerSubtitle}>AI-powered client progress tracking & analytics</Text>
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
            placeholder="Search clients by name or goals..."
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
          {['week', 'month', 'quarter', 'year'].map((timeframe) => (
            <Chip
              key={timeframe}
              selected={selectedTimeframe === timeframe}
              onPress={() => setSelectedTimeframe(timeframe)}
              style={[
                styles.filterChip,
                selectedTimeframe === timeframe && styles.selectedChip
              ]}
              textStyle={selectedTimeframe === timeframe ? styles.selectedChipText : styles.chipText}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </Chip>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.clientsList}
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
          <View style={styles.summaryStats}>
            <Surface style={styles.statCard}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                {Math.round(progressionData.reduce((acc, client) => acc + client.overallProgress, 0) / progressionData.length * 100)}%
              </Text>
              <Text style={TEXT_STYLES.caption}>Avg Progress</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
                {progressionData.filter(c => c.progressTrend === 'improving').length}
              </Text>
              <Text style={TEXT_STYLES.caption}>Improving</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>
                {progressionData.filter(c => c.riskFactors.length > 0).length}
              </Text>
              <Text style={TEXT_STYLES.caption}>At Risk</Text>
            </Surface>
          </View>

          {filteredClients.length > 0 ? (
            filteredClients.map(renderProgressionCard)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="trending-up" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>No Clients Found</Text>
              <Text style={[TEXT_STYLES.body, styles.emptyDescription]}>
                Try adjusting your search criteria
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      <FAB
        icon="analytics"
        label="AI Insights"
        onPress={() => Alert.alert('🤖 AI Insights', 'Generating comprehensive analytics report for all clients...')}
        style={styles.fab}
        color="white"
      />

      {renderDetailModal()}
      {renderAnalysisModal()}
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
  summaryStats: {
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
  clientsList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  clientCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 3,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  clientInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  clientDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  trendIndicator: {
    alignItems: 'center',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  goalChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
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
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  completionRate: {
    textAlign: 'right',
  },
  metricsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  metricPreview: {
    alignItems: 'center',
  },
  riskAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.warning + '20',
    borderRadius: 8,
  },
  riskText: {
    marginLeft: SPACING.sm,
    color: COLORS.warning,
    fontWeight: '500',
  },
  nextMilestone: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneText: {
    marginLeft: SPACING.sm,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    maxHeight: '85%',
    borderRadius: 16,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalClientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalClientDetails: {
    marginLeft: SPACING.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  detailMetric: {
    width: '48%',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  metricChange: {
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  divider: {
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
  },
  insightText: {
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 22,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.warning + '10',
    borderRadius: 8,
  },
  riskItemText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  milestoneSection: {
    marginTop: SPACING.lg,
  },
  milestoneCard: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  milestoneProgress: {
    marginTop: SPACING.sm,
    height: 6,
    borderRadius: 3,
  },
  modalButtons: {
    marginTop: SPACING.lg,
  },
  primaryButton: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    borderColor: COLORS.primary,
  },
  analysisModalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  analysisModalContent: {
    maxHeight: '80%',
    borderRadius: 16,
    padding: SPACING.lg,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  loadingTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  loadingText: {
    textAlign: 'center',
    marginBottom: SPACING.xl,
    opacity: 0.8,
    paddingHorizontal: SPACING.lg,
  },
  loadingProgress: {
    width: '100%',
    height: 4,
  },
  analysisIntro: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    lineHeight: 22,
  },
  analysisSection: {
    marginBottom: SPACING.lg,
  },
  analysisSectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.primary,
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

export default SmartProgression;