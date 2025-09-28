import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  Animated,
  VibrationIOS,
  Vibration,
  Platform
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
  Searchbar,
  Switch,
  RadioButton,
  Divider
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { useSelector, useDispatch } from 'react-redux';

// Import your constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e1e5e9'
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary }
};

const { width, height } = Dimensions.get('window');

const PerformancePrediction = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1month');
  const [predictionType, setPredictionType] = useState('performance');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [predictionResults, setPredictionResults] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Mock data - replace with Redux selectors
  const [players] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      sport: 'Basketball',
      position: 'Point Guard',
      avatar: 'AJ',
      currentRating: 85,
      trend: 'up',
      nextGame: '2024-08-20',
      predictedPerformance: 88,
      confidence: 92,
      keyMetrics: {
        shooting: 78,
        defense: 82,
        stamina: 90,
        consistency: 85
      },
      riskFactors: ['fatigue_level', 'recent_injury'],
      trainingLoad: 'moderate'
    },
    {
      id: 2,
      name: 'Sarah Chen',
      sport: 'Tennis',
      position: 'Singles',
      avatar: 'SC',
      currentRating: 92,
      trend: 'stable',
      nextGame: '2024-08-22',
      predictedPerformance: 89,
      confidence: 87,
      keyMetrics: {
        serve: 94,
        groundstrokes: 88,
        movement: 91,
        mental: 89
      },
      riskFactors: ['weather_sensitivity'],
      trainingLoad: 'high'
    },
    {
      id: 3,
      name: 'Mike Torres',
      sport: 'Soccer',
      position: 'Midfielder',
      avatar: 'MT',
      currentRating: 79,
      trend: 'down',
      nextGame: '2024-08-19',
      predictedPerformance: 76,
      confidence: 78,
      keyMetrics: {
        passing: 85,
        dribbling: 72,
        stamina: 88,
        positioning: 74
      },
      riskFactors: ['overtraining', 'stress_levels'],
      trainingLoad: 'high'
    }
  ]);

  const [teamPredictions] = useState({
    winProbability: 72,
    expectedScore: '2-1',
    keyAdvantages: ['home_field', 'recent_form', 'injury_report'],
    concerns: ['weather_conditions', 'opponent_strength'],
    optimalLineup: ['Alex Johnson', 'Sarah Chen', 'Mike Torres'],
    benchStrength: 85
  });

  const [insights] = useState([
    {
      id: 1,
      type: 'opportunity',
      title: 'Peak Performance Window',
      player: 'Alex Johnson',
      description: 'Analytics suggest optimal performance in next 3 games',
      action: 'Consider increased playing time',
      confidence: 94,
      timeframe: '3 days'
    },
    {
      id: 2,
      type: 'risk',
      title: 'Fatigue Alert',
      player: 'Mike Torres',
      description: 'Training load indicates potential performance decline',
      action: 'Recommend rest day before next match',
      confidence: 89,
      timeframe: '1 day'
    },
    {
      id: 3,
      type: 'improvement',
      title: 'Skill Development',
      player: 'Sarah Chen',
      description: 'Net play improvement could boost win rate by 12%',
      action: 'Focus on volleys in training',
      confidence: 82,
      timeframe: '2 weeks'
    }
  ]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const generatePrediction = (player) => {
    setSelectedPlayer(player);
    setIsGenerating(true);
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      VibrationIOS.impactFeedback('medium');
    } else {
      Vibration.vibrate(50);
    }
    
    // Simulate AI prediction generation
    setTimeout(() => {
      const mockPrediction = {
        player: player,
        timeframe: selectedTimeframe,
        predictions: {
          nextGame: {
            expected: Math.floor(Math.random() * 20) + 75,
            range: [70, 95],
            confidence: Math.floor(Math.random() * 20) + 80
          },
          nextWeek: {
            average: Math.floor(Math.random() * 15) + 80,
            trend: ['up', 'stable', 'down'][Math.floor(Math.random() * 3)],
            confidence: Math.floor(Math.random() * 15) + 75
          },
          nextMonth: {
            potential: Math.floor(Math.random() * 25) + 70,
            growthRate: Math.floor(Math.random() * 10) + 2,
            confidence: Math.floor(Math.random() * 20) + 70
          }
        },
        factors: {
          positive: ['Recent training improvements', 'Good recovery metrics', 'Mental state positive'],
          negative: ['Minor fatigue indicators', 'Weather conditions', 'Opponent strength'],
          neutral: ['Standard preparation', 'Team dynamics stable']
        },
        recommendations: [
          'Focus on recovery protocols 48 hours before game',
          'Maintain current training intensity',
          'Monitor sleep quality closely',
          'Consider tactical adjustments for opponent matchup'
        ],
        scenarios: {
          best: { performance: 95, probability: 25 },
          likely: { performance: 85, probability: 50 },
          worst: { performance: 70, probability: 25 }
        }
      };
      
      setPredictionResults(mockPrediction);
      setIsGenerating(false);
      setShowPredictionModal(true);
    }, 3000);
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
      default: return COLORS.warning;
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'opportunity': return 'star';
      case 'risk': return 'warning';
      case 'improvement': return 'trending-up';
      default: return 'info';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'opportunity': return COLORS.success;
      case 'risk': return COLORS.error;
      case 'improvement': return COLORS.info;
      default: return COLORS.textSecondary;
    }
  };

  const getTrainingLoadColor = (load) => {
    switch (load) {
      case 'high': return COLORS.error;
      case 'moderate': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPlayerCard = (player) => (
    <Card key={player.id} style={styles.playerCard}>
      <TouchableOpacity onPress={() => generatePrediction(player)}>
        <View style={styles.playerHeader}>
          <View style={styles.playerInfo}>
            <Avatar.Text 
              size={50} 
              label={player.avatar} 
              style={{ backgroundColor: COLORS.primary }}
            />
            <View style={styles.playerDetails}>
              <Text style={TEXT_STYLES.body}>{player.name}</Text>
              <Text style={TEXT_STYLES.caption}>{player.sport} • {player.position}</Text>
              <View style={styles.nextGameInfo}>
                <Icon name="event" size={14} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  Next: {player.nextGame}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.playerMetrics}>
            <View style={styles.ratingContainer}>
              <Text style={TEXT_STYLES.caption}>Current Rating</Text>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                {player.currentRating}
              </Text>
            </View>
            <Icon 
              name={getTrendIcon(player.trend)} 
              size={24} 
              color={getTrendColor(player.trend)} 
            />
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.predictionPreview}>
          <View style={styles.predictionItem}>
            <Text style={TEXT_STYLES.caption}>Predicted Performance</Text>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.secondary }]}>
              {player.predictedPerformance}
            </Text>
            <ProgressBar 
              progress={player.predictedPerformance / 100} 
              color={COLORS.secondary}
              style={styles.progressBar}
            />
          </View>
          <View style={styles.confidenceContainer}>
            <Text style={TEXT_STYLES.caption}>Confidence</Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.info }]}>
              {player.confidence}%
            </Text>
          </View>
        </View>
        
        <View style={styles.keyMetrics}>
          {Object.entries(player.keyMetrics).map(([metric, value]) => (
            <View key={metric} style={styles.metricChip}>
              <Text style={styles.metricLabel}>{metric}</Text>
              <Text style={styles.metricValue}>{value}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.riskFactors}>
          <Text style={TEXT_STYLES.caption}>Risk Factors:</Text>
          <View style={styles.riskChips}>
            {player.riskFactors.map((risk, index) => (
              <Chip key={index} compact style={styles.riskChip}>
                {risk.replace('_', ' ')}
              </Chip>
            ))}
          </View>
        </View>
        
        <View style={styles.trainingLoad}>
          <Text style={TEXT_STYLES.caption}>Training Load: </Text>
          <Chip 
            compact 
            style={[styles.loadChip, { backgroundColor: getTrainingLoadColor(player.trainingLoad) + '20' }]}
            textStyle={{ color: getTrainingLoadColor(player.trainingLoad) }}
          >
            {player.trainingLoad}
          </Chip>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderInsightCard = (insight) => (
    <Card key={insight.id} style={styles.insightCard}>
      <Card.Content>
        <View style={styles.insightHeader}>
          <View style={styles.insightTitleRow}>
            <Icon 
              name={getInsightIcon(insight.type)} 
              size={20} 
              color={getInsightColor(insight.type)} 
            />
            <Text style={[TEXT_STYLES.body, { marginLeft: 8, flex: 1 }]}>
              {insight.title}
            </Text>
            <Chip 
              compact 
              style={{ backgroundColor: getInsightColor(insight.type) + '20' }}
              textStyle={{ color: getInsightColor(insight.type) }}
            >
              {insight.confidence}%
            </Chip>
          </View>
          <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
            {insight.player} • {insight.timeframe}
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.sm }]}>
          {insight.description}
        </Text>
        <View style={styles.insightAction}>
          <Icon name="lightbulb" size={16} color={COLORS.warning} />
          <Text style={[TEXT_STYLES.caption, { marginLeft: 4, fontWeight: '600' }]}>
            {insight.action}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTeamPrediction = () => (
    <Card style={styles.teamCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.teamCardGradient}
      >
        <View style={styles.teamHeader}>
          <Icon name="groups" size={24} color="white" />
          <Text style={styles.teamTitle}>Team Performance Prediction</Text>
        </View>
        
        <View style={styles.teamMetrics}>
          <View style={styles.teamMetric}>
            <Text style={styles.teamMetricLabel}>Win Probability</Text>
            <Text style={styles.teamMetricValue}>{teamPredictions.winProbability}%</Text>
          </View>
          <View style={styles.teamMetric}>
            <Text style={styles.teamMetricLabel}>Expected Score</Text>
            <Text style={styles.teamMetricValue}>{teamPredictions.expectedScore}</Text>
          </View>
          <View style={styles.teamMetric}>
            <Text style={styles.teamMetricLabel}>Bench Strength</Text>
            <Text style={styles.teamMetricValue}>{teamPredictions.benchStrength}%</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.teamDetailsButton}
          onPress={() => Alert.alert('Team Analysis', 'Detailed team analysis coming soon! 📊')}
        >
          <Text style={styles.teamDetailsText}>View Detailed Analysis</Text>
          <Icon name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </LinearGradient>
    </Card>
  );

  const renderPredictionModal = () => (
    <Portal>
      <Modal
        visible={showPredictionModal}
        animationType="slide"
        onRequestClose={() => setShowPredictionModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.modalHeader}
          >
            <IconButton
              icon="close"
              iconColor="white"
              onPress={() => setShowPredictionModal(false)}
            />
            <Text style={styles.modalTitle}>Performance Prediction</Text>
            <IconButton
              icon="settings"
              iconColor="white"
              onPress={() => setShowSettingsModal(true)}
            />
          </LinearGradient>
          
          <ScrollView style={styles.modalContent}>
            {predictionResults && (
              <View>
                <Card style={styles.playerSummaryCard}>
                  <Card.Content>
                    <View style={styles.playerSummaryHeader}>
                      <Avatar.Text 
                        size={60} 
                        label={predictionResults.player.avatar} 
                        style={{ backgroundColor: COLORS.primary }}
                      />
                      <View style={styles.playerSummaryInfo}>
                        <Text style={TEXT_STYLES.h2}>{predictionResults.player.name}</Text>
                        <Text style={TEXT_STYLES.caption}>
                          {predictionResults.player.sport} • {predictionResults.player.position}
                        </Text>
                        <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                          Prediction for: {predictionResults.timeframe}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
                
                <Card style={styles.predictionScenarios}>
                  <Card.Content>
                    <Text style={TEXT_STYLES.h3}>Performance Scenarios</Text>
                    {Object.entries(predictionResults.scenarios).map(([scenario, data]) => (
                      <View key={scenario} style={styles.scenarioRow}>
                        <View style={styles.scenarioInfo}>
                          <Text style={[TEXT_STYLES.body, { textTransform: 'capitalize' }]}>
                            {scenario} Case
                          </Text>
                          <Text style={TEXT_STYLES.caption}>
                            {data.probability}% probability
                          </Text>
                        </View>
                        <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                          {data.performance}
                        </Text>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
                
                <Card style={styles.factorsCard}>
                  <Card.Content>
                    <Text style={TEXT_STYLES.h3}>Influencing Factors</Text>
                    
                    <View style={styles.factorSection}>
                      <Text style={[TEXT_STYLES.body, { color: COLORS.success }]}>
                        Positive Factors
                      </Text>
                      {predictionResults.factors.positive.map((factor, index) => (
                        <View key={index} style={styles.factorItem}>
                          <Icon name="add-circle" size={16} color={COLORS.success} />
                          <Text style={[TEXT_STYLES.caption, { marginLeft: 8 }]}>
                            {factor}
                          </Text>
                        </View>
                      ))}
                    </View>
                    
                    <View style={styles.factorSection}>
                      <Text style={[TEXT_STYLES.body, { color: COLORS.error }]}>
                        Risk Factors
                      </Text>
                      {predictionResults.factors.negative.map((factor, index) => (
                        <View key={index} style={styles.factorItem}>
                          <Icon name="remove-circle" size={16} color={COLORS.error} />
                          <Text style={[TEXT_STYLES.caption, { marginLeft: 8 }]}>
                            {factor}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
                
                <Card style={styles.recommendationsCard}>
                  <Card.Content>
                    <Text style={TEXT_STYLES.h3}>AI Recommendations</Text>
                    {predictionResults.recommendations.map((rec, index) => (
                      <View key={index} style={styles.recommendation}>
                        <Icon name="psychology" size={16} color={COLORS.info} />
                        <Text style={[TEXT_STYLES.body, { flex: 1, marginLeft: 8 }]}>
                          {rec}
                        </Text>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );

  const renderSettingsModal = () => (
    <Portal>
      <Modal
        visible={showSettingsModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <BlurView style={styles.blurContainer} blurType="dark" blurAmount={10}>
          <Surface style={styles.settingsModal}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg }]}>
              Prediction Settings
            </Text>
            
            <View style={styles.settingRow}>
              <Text style={TEXT_STYLES.body}>Prediction Timeframe</Text>
              <RadioButton.Group
                onValueChange={setSelectedTimeframe}
                value={selectedTimeframe}
              >
                <View style={styles.radioRow}>
                  <RadioButton value="1week" />
                  <Text style={TEXT_STYLES.caption}>1 Week</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton value="1month" />
                  <Text style={TEXT_STYLES.caption}>1 Month</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton value="3months" />
                  <Text style={TEXT_STYLES.caption}>3 Months</Text>
                </View>
              </RadioButton.Group>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={TEXT_STYLES.body}>Enable Notifications</Text>
              <Switch
                value={enableNotifications}
                onValueChange={setEnableNotifications}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={TEXT_STYLES.body}>Auto-Update Predictions</Text>
              <Switch
                value={autoUpdate}
                onValueChange={setAutoUpdate}
              />
            </View>
            
            <Button
              mode="contained"
              onPress={() => setShowSettingsModal(false)}
              style={styles.settingsButton}
            >
              Save Settings
            </Button>
          </Surface>
        </BlurView>
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
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Performance Prediction</Text>
            <Text style={styles.headerSubtitle}>AI-Powered Performance Analytics 🎯</Text>
          </View>
          <IconButton
            icon="settings"
            iconColor="white"
            size={24}
            onPress={() => setShowSettingsModal(true)}
          />
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Team Prediction Card */}
          <View style={styles.section}>
            {renderTeamPrediction()}
          </View>

          {/* AI Insights */}
          <View style={styles.section}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>AI Insights</Text>
            {insights.map(renderInsightCard)}
          </View>

          {/* Search and Filters */}
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search players..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
          </View>

          {/* Player Predictions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Player Predictions</Text>
              <Chip compact>{filteredPlayers.length} players</Chip>
            </View>
            
            {isGenerating && (
              <Card style={styles.generatingCard}>
                <Card.Content style={styles.generatingContent}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.generatingText}>Analyzing performance data...</Text>
                  <Text style={TEXT_STYLES.caption}>
                    Processing {selectedPlayer?.name}'s metrics
                  </Text>
                </Card.Content>
              </Card>
            )}
            
            {filteredPlayers.map(renderPlayerCard)}
            
            {filteredPlayers.length === 0 && !isGenerating && (
              <Card style={styles.emptyStateCard}>
                <Card.Content style={styles.emptyStateContent}>
                  <Icon name="person-search" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.emptyStateText}>No players found</Text>
                  <Text style={TEXT_STYLES.caption}>
                    Try adjusting your search criteria
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      <FAB
        icon="psychology"
        style={styles.fab}
        onPress={() => Alert.alert('Bulk Analysis', 'Generate predictions for all players?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Generate', onPress: () => Alert.alert('Bulk prediction generation coming soon! 🚀') }
        ])}
        customSize={56}
      />

      {renderPredictionModal()}
      {renderSettingsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
    flex: 1
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold'
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  section: {
    marginBottom: SPACING.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md
  },
  searchSection: {
    padding: SPACING.md
  },
  searchBar: {
    marginBottom: SPACING.md
  },
  teamCard: {
    marginHorizontal: SPACING.md,
    overflow: 'hidden'
  },
  teamCardGradient: {
    padding: SPACING.lg
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  teamTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginLeft: SPACING.sm,
    fontWeight: 'bold'
  },
  teamMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg
  },
  teamMetric: {
    alignItems: 'center'
  },
  teamMetricLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center'
  },
  teamMetricValue: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.xs
  },
  teamDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.sm
  },
  teamDetailsText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600',
    marginRight: SPACING.xs
  },
  insightCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md
  },
  insightHeader: {
    marginBottom: SPACING.sm
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  playerCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  playerDetails: {
    marginLeft: SPACING.md,
    flex: 1
  },
  nextGameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs
  },
  playerMetrics: {
    alignItems: 'center',
    gap: SPACING.sm
  },
  ratingContainer: {
    alignItems: 'center'
  },
  divider: {
    marginHorizontal: SPACING.md
  },
  predictionPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md
  },
  predictionItem: {
    flex: 1
  },
  progressBar: {
    marginTop: SPACING.xs,
    height: 4
  },
  confidenceContainer: {
    alignItems: 'center',
    marginLeft: SPACING.md
  },
  keyMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm
  },
  metricChip: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 60
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    color: COLORS.primary,
    textTransform: 'uppercase'
  },
  metricValue: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 2
  },
  riskFactors: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm
  },
  riskChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs
  },
  riskChip: {
    backgroundColor: COLORS.error + '20'
  },
  trainingLoad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md
  },
  loadChip: {
    marginLeft: SPACING.xs
  },
  generatingCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md
  },
  generatingContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg
  },
  generatingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    fontWeight: '600'
  },
  emptyStateCard: {
    marginHorizontal: SPACING.md
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    fontWeight: '600'
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.sm
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold'
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md
  },
  playerSummaryCard: {
    marginBottom: SPACING.md
  },
  playerSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  playerSummaryInfo: {
    marginLeft: SPACING.md,
    flex: 1
  },
  predictionScenarios: {
    marginBottom: SPACING.md
  },
  scenarioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  scenarioInfo: {
    flex: 1
  },
  factorsCard: {
    marginBottom: SPACING.md
  },
  factorSection: {
    marginTop: SPACING.md
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingLeft: SPACING.sm
  },
  recommendationsCard: {
    marginBottom: SPACING.xl
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  settingsModal: {
    width: width * 0.9,
    maxWidth: 400,
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: COLORS.surface
  },
  settingRow: {
    marginBottom: SPACING.lg
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs
  },
  settingsButton: {
    marginTop: SPACING.md
  },
  });

  export default PerformancePrediction;