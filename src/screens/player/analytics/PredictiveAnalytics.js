import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Dimensions,
  Alert,
  Vibration,
  Animated,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Portal,
  Modal,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, BarChart, RadarChart } from 'react-native-chart-kit';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196F3',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#e91e63',
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
  h3: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const screenWidth = Dimensions.get('window').width;
const chartConfig = {
  backgroundGradientFrom: COLORS.surface,
  backgroundGradientTo: COLORS.surface,
  color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  decimalPlaces: 1,
};

const PredictiveAnalytics = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const predictiveData = useSelector(state => state.player.predictive);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('3months');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));

  // Mock predictive data
  const [analyticsData, setAnalyticsData] = useState({
    performancePrediction: {
      currentLevel: 82,
      predictedLevel: 89,
      confidence: 78,
      timeframe: '3 months',
      factors: ['Consistent Training', 'Improved Recovery', 'Better Nutrition'],
    },
    injuryRisk: {
      overall: 15, // Low risk
      categories: {
        muscular: 12,
        joint: 18,
        cardiovascular: 8,
      },
      recommendations: [
        { type: 'warning', message: 'Increase rest days between intense sessions' },
        { type: 'info', message: 'Focus on flexibility and mobility work' },
        { type: 'success', message: 'Excellent cardiovascular health indicators' },
      ],
    },
    optimalTraining: {
      intensity: 75,
      frequency: 4, // sessions per week
      duration: 90, // minutes
      focusAreas: ['Strength', 'Agility', 'Technical Skills'],
      restDays: 2,
    },
    performanceForecast: [
      { week: 'W1', predicted: 82, actual: 81, confidence: 85 },
      { week: 'W2', predicted: 83, actual: null, confidence: 82 },
      { week: 'W3', predicted: 84, actual: null, confidence: 79 },
      { week: 'W4', predicted: 85, actual: null, confidence: 76 },
      { week: 'W5', predicted: 86, actual: null, confidence: 73 },
      { week: 'W6', predicted: 87, actual: null, confidence: 70 },
    ],
    aiInsights: [
      {
        id: 1,
        type: 'performance',
        priority: 'high',
        title: '🚀 Peak Performance Window',
        description: 'Based on your training patterns, next Tuesday 2-4 PM shows optimal performance conditions.',
        confidence: 87,
        actionable: true,
      },
      {
        id: 2,
        type: 'recovery',
        priority: 'medium',
        title: '💤 Recovery Optimization',
        description: 'Your sleep quality correlation with performance suggests 8.5 hours is your sweet spot.',
        confidence: 79,
        actionable: true,
      },
      {
        id: 3,
        type: 'nutrition',
        priority: 'high',
        title: '🥗 Nutrition Impact',
        description: 'Protein intake 2 hours pre-training correlates with 12% better performance.',
        confidence: 92,
        actionable: true,
      },
      {
        id: 4,
        type: 'technique',
        priority: 'low',
        title: '🎯 Skill Development',
        description: 'Focus on agility training could improve overall performance by 8% in 6 weeks.',
        confidence: 68,
        actionable: false,
      },
    ],
    competitionReadiness: {
      overall: 78,
      physical: 85,
      mental: 72,
      technical: 80,
      tactical: 75,
      nextCompetition: '2024-09-15',
      daysUntil: 28,
    },
  });

  useEffect(() => {
    loadPredictiveData();
    startAnimations();
  }, [selectedTimeframe]);

  const startAnimations = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const loadPredictiveData = useCallback(async () => {
    try {
      // Simulate AI prediction API call
      // dispatch(fetchPredictiveAnalytics({ userId: user.id, timeframe: selectedTimeframe }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load predictive analytics');
    }
  }, [selectedTimeframe, user.id, dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPredictiveData().finally(() => setRefreshing(false));
  }, [loadPredictiveData]);

  const handleInsightPress = (insight) => {
    Vibration.vibrate(50);
    setSelectedInsight(insight);
    setShowInsightModal(true);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        padding: SPACING.lg,
        paddingTop: StatusBar.currentHeight + SPACING.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
        <View style={{ flex: 1 }}>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
            🤖 AI Predictive Analytics
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            Powered by machine learning insights
          </Text>
        </View>
        <Badge
          size={20}
          style={{ backgroundColor: COLORS.accent }}
        >
          AI
        </Badge>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {['1month', '3months', '6months', '1year'].map(timeframe => (
          <Chip
            key={timeframe}
            selected={selectedTimeframe === timeframe}
            onPress={() => setSelectedTimeframe(timeframe)}
            selectedColor="white"
            style={{
              backgroundColor: selectedTimeframe === timeframe ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}
            textStyle={{ color: 'white', fontSize: 11 }}
          >
            {timeframe === '1month' ? '1M' : timeframe === '3months' ? '3M' : 
             timeframe === '6months' ? '6M' : '1Y'}
          </Chip>
        ))}
      </View>
    </LinearGradient>
  );

  const renderPerformancePrediction = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>
            📈 Performance Forecast
          </Text>
          <Chip
            compact
            mode="outlined"
            textStyle={{ fontSize: 10 }}
          >
            {analyticsData.performancePrediction.confidence}% Confidence
          </Chip>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <View style={{ flex: 1 }}>
            <Text style={TEXT_STYLES.caption}>Current Level</Text>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.info }]}>
              {analyticsData.performancePrediction.currentLevel}%
            </Text>
          </View>
          <Icon name="trending-up" size={32} color={COLORS.success} />
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={TEXT_STYLES.caption}>Predicted in {analyticsData.performancePrediction.timeframe}</Text>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
              {analyticsData.performancePrediction.predictedLevel}%
            </Text>
          </View>
        </View>

        <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
          Key Growth Factors:
        </Text>
        {analyticsData.performancePrediction.factors.map((factor, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
            <Icon name="check-circle" size={16} color={COLORS.success} />
            <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
              {factor}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderInjuryRisk = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          🏥 Injury Risk Assessment
        </Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.h1, { 
              color: analyticsData.injuryRisk.overall < 20 ? COLORS.success : 
                     analyticsData.injuryRisk.overall < 40 ? COLORS.warning : COLORS.error 
            }]}>
              {analyticsData.injuryRisk.overall}%
            </Text>
            <Text style={TEXT_STYLES.caption}>Overall Risk Level</Text>
            <Text style={[TEXT_STYLES.body, { 
              color: analyticsData.injuryRisk.overall < 20 ? COLORS.success : 
                     analyticsData.injuryRisk.overall < 40 ? COLORS.warning : COLORS.error,
              fontWeight: '600' 
            }]}>
              {analyticsData.injuryRisk.overall < 20 ? 'Low Risk' : 
               analyticsData.injuryRisk.overall < 40 ? 'Moderate Risk' : 'High Risk'}
            </Text>
          </View>
          
          <View style={{ flex: 1 }}>
            {Object.entries(analyticsData.injuryRisk.categories).map(([category, risk]) => (
              <View key={category} style={{ marginBottom: SPACING.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={TEXT_STYLES.caption}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                  <Text style={TEXT_STYLES.caption}>{risk}%</Text>
                </View>
                <ProgressBar
                  progress={risk / 100}
                  color={risk < 20 ? COLORS.success : risk < 40 ? COLORS.warning : COLORS.error}
                  style={{ height: 4, borderRadius: 2 }}
                />
              </View>
            ))}
          </View>
        </View>

        <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
          AI Recommendations:
        </Text>
        {analyticsData.injuryRisk.recommendations.map((rec, index) => (
          <View key={index} style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-start', 
            marginBottom: SPACING.sm,
            padding: SPACING.sm,
            backgroundColor: rec.type === 'warning' ? 'rgba(255, 152, 0, 0.1)' :
                           rec.type === 'info' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(76, 175, 80, 0.1)',
            borderRadius: 8,
          }}>
            <Icon 
              name={rec.type === 'warning' ? 'warning' : rec.type === 'info' ? 'info' : 'check-circle'}
              size={16} 
              color={rec.type === 'warning' ? COLORS.warning : rec.type === 'info' ? COLORS.info : COLORS.success}
              style={{ marginTop: 2, marginRight: SPACING.sm }}
            />
            <Text style={[TEXT_STYLES.body, { flex: 1 }]}>
              {rec.message}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderOptimalTraining = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          ⚡ Optimal Training Protocol
        </Text>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Surface style={{ 
            padding: SPACING.md, 
            borderRadius: 12, 
            width: '48%', 
            marginBottom: SPACING.sm,
            elevation: 2,
          }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
              {analyticsData.optimalTraining.intensity}%
            </Text>
            <Text style={TEXT_STYLES.caption}>Intensity</Text>
          </Surface>
          
          <Surface style={{ 
            padding: SPACING.md, 
            borderRadius: 12, 
            width: '48%', 
            marginBottom: SPACING.sm,
            elevation: 2,
          }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
              {analyticsData.optimalTraining.frequency}x
            </Text>
            <Text style={TEXT_STYLES.caption}>Sessions/Week</Text>
          </Surface>
          
          <Surface style={{ 
            padding: SPACING.md, 
            borderRadius: 12, 
            width: '48%', 
            marginBottom: SPACING.sm,
            elevation: 2,
          }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>
              {analyticsData.optimalTraining.duration}m
            </Text>
            <Text style={TEXT_STYLES.caption}>Duration</Text>
          </Surface>
          
          <Surface style={{ 
            padding: SPACING.md, 
            borderRadius: 12, 
            width: '48%', 
            marginBottom: SPACING.sm,
            elevation: 2,
          }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.accent }]}>
              {analyticsData.optimalTraining.restDays}
            </Text>
            <Text style={TEXT_STYLES.caption}>Rest Days</Text>
          </Surface>
        </View>

        <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginTop: SPACING.sm, marginBottom: SPACING.sm }]}>
          Focus Areas:
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {analyticsData.optimalTraining.focusAreas.map((area, index) => (
            <Chip
              key={index}
              compact
              style={{ margin: SPACING.xs }}
              textStyle={{ fontSize: 12 }}
            >
              {area}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderPerformanceForecast = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          📊 6-Week Performance Forecast
        </Text>
        
        <BarChart
          data={{
            labels: analyticsData.performanceForecast.map(item => item.week),
            datasets: [
              {
                data: analyticsData.performanceForecast.map(item => item.predicted),
              },
            ],
          }}
          width={screenWidth - SPACING.lg * 2 - SPACING.md}
          height={200}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
          }}
          style={{ borderRadius: 8 }}
          showValuesOnTopOfBars
        />
        
        <View style={{ marginTop: SPACING.md }}>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
            Confidence decreases over time. Actual results will refine future predictions.
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAIInsights = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          🧠 AI-Powered Insights
        </Text>
        
        {analyticsData.aiInsights.map((insight) => (
          <Surface
            key={insight.id}
            style={{
              padding: SPACING.md,
              marginBottom: SPACING.sm,
              borderRadius: 12,
              elevation: 1,
              borderLeftWidth: 4,
              borderLeftColor: insight.priority === 'high' ? COLORS.error :
                              insight.priority === 'medium' ? COLORS.warning : COLORS.info,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.xs }]}>
                  {insight.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.sm }]}>
                  {insight.description}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Chip
                    compact
                    mode="outlined"
                    textStyle={{ fontSize: 10 }}
                    style={{ marginRight: SPACING.sm }}
                  >
                    {insight.confidence}% Confidence
                  </Chip>
                  {insight.actionable && (
                    <Chip
                      compact
                      style={{ backgroundColor: COLORS.success }}
                      textStyle={{ color: 'white', fontSize: 10 }}
                    >
                      Actionable
                    </Chip>
                  )}
                </View>
              </View>
              <IconButton
                icon="chevron-right"
                size={20}
                onPress={() => handleInsightPress(insight)}
              />
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderCompetitionReadiness = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          🏆 Competition Readiness
        </Text>
        
        <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.primary }]}>
            {analyticsData.competitionReadiness.overall}%
          </Text>
          <Text style={TEXT_STYLES.caption}>Overall Readiness</Text>
          <Text style={[TEXT_STYLES.body, { marginTop: SPACING.xs }]}>
            {analyticsData.competitionReadiness.daysUntil} days until next competition
          </Text>
        </View>

        <RadarChart
          data={{
            labels: ['Physical', 'Mental', 'Technical', 'Tactical'],
            datasets: [
              {
                data: [
                  analyticsData.competitionReadiness.physical,
                  analyticsData.competitionReadiness.mental,
                  analyticsData.competitionReadiness.technical,
                  analyticsData.competitionReadiness.tactical,
                ],
                color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={screenWidth - SPACING.lg * 2 - SPACING.md}
          height={200}
          chartConfig={chartConfig}
          style={{ borderRadius: 8 }}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
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
        {renderPerformancePrediction()}
        {renderInjuryRisk()}
        {renderOptimalTraining()}
        {renderPerformanceForecast()}
        {renderAIInsights()}
        {renderCompetitionReadiness()}
        
        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Insight Detail Modal */}
      <Portal>
        <Modal
          visible={showInsightModal}
          onDismiss={() => setShowInsightModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            padding: SPACING.lg,
            borderRadius: 12,
          }}
        >
          {selectedInsight && (
            <>
              <Text style={[TEXT_STYLES.h2, { marginBottom: SPACING.md }]}>
                {selectedInsight.title}
              </Text>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg, lineHeight: 20 }]}>
                {selectedInsight.description}
              </Text>
              <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.lg }]}>
                This insight is based on analysis of your training data, performance metrics, and machine learning patterns. 
                Confidence level: {selectedInsight.confidence}%
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  mode="outlined"
                  onPress={() => setShowInsightModal(false)}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                >
                  Close
                </Button>
                {selectedInsight.actionable && (
                  <Button
                    mode="contained"
                    onPress={() => {
                      setShowInsightModal(false);
                      Alert.alert('Action', 'This feature will help you implement this insight!');
                    }}
                    style={{ flex: 1, marginLeft: SPACING.sm }}
                  >
                    Take Action
                  </Button>
                )}
              </View>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

export default PredictiveAnalytics;