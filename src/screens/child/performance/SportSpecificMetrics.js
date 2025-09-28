import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
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
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SportSpecificMetrics = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, metrics, loading, error } = useSelector(state => state.performance);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('football');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [currentMetric, setCurrentMetric] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // cards, chart, table
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  // Sports configuration
  const sportsConfig = {
    football: {
      name: 'Football',
      icon: '⚽',
      color: '#e74c3c',
      metrics: [
        { id: 'goals', name: 'Goals Scored', value: 12, target: 15, unit: 'goals', trend: '+2', icon: '⚽' },
        { id: 'assists', name: 'Assists', value: 8, target: 10, unit: 'assists', trend: '+1', icon: '🎯' },
        { id: 'passes', name: 'Pass Accuracy', value: 85, target: 90, unit: '%', trend: '+3%', icon: '📈' },
        { id: 'tackles', name: 'Successful Tackles', value: 23, target: 30, unit: 'tackles', trend: '+5', icon: '🛡️' },
        { id: 'shots', name: 'Shots on Target', value: 67, target: 75, unit: '%', trend: '+4%', icon: '🎯' },
        { id: 'dribbles', name: 'Dribble Success', value: 72, target: 80, unit: '%', trend: '+6%', icon: '⚡' },
        { id: 'distance', name: 'Distance Covered', value: 8.5, target: 10, unit: 'km', trend: '+0.5km', icon: '🏃‍♂️' },
        { id: 'sprints', name: 'Sprint Count', value: 45, target: 50, unit: 'sprints', trend: '+8', icon: '💨' },
      ]
    },
    basketball: {
      name: 'Basketball',
      icon: '🏀',
      color: '#f39c12',
      metrics: [
        { id: 'points', name: 'Points Per Game', value: 18.5, target: 20, unit: 'pts', trend: '+2.1', icon: '🏀' },
        { id: 'rebounds', name: 'Rebounds', value: 7.2, target: 8, unit: 'reb', trend: '+0.8', icon: '⬆️' },
        { id: 'assists_bball', name: 'Assists', value: 5.8, target: 6.5, unit: 'ast', trend: '+1.2', icon: '🎯' },
        { id: 'steals', name: 'Steals', value: 2.3, target: 3, unit: 'stl', trend: '+0.5', icon: '👐' },
        { id: 'blocks', name: 'Blocks', value: 1.8, target: 2.5, unit: 'blk', trend: '+0.3', icon: '🚫' },
        { id: 'fg_percentage', name: 'Field Goal %', value: 48, target: 55, unit: '%', trend: '+3%', icon: '📈' },
        { id: 'ft_percentage', name: 'Free Throw %', value: 78, target: 85, unit: '%', trend: '+5%', icon: '🎯' },
        { id: 'three_point', name: '3-Point %', value: 35, target: 40, unit: '%', trend: '+2%', icon: '🎯' },
      ]
    },
    tennis: {
      name: 'Tennis',
      icon: '🎾',
      color: '#9b59b6',
      metrics: [
        { id: 'serve_speed', name: 'Serve Speed', value: 105, target: 115, unit: 'mph', trend: '+8mph', icon: '⚡' },
        { id: 'first_serve', name: 'First Serve %', value: 68, target: 75, unit: '%', trend: '+5%', icon: '🎯' },
        { id: 'ace_count', name: 'Aces Per Match', value: 6.5, target: 8, unit: 'aces', trend: '+1.2', icon: '⚡' },
        { id: 'winners', name: 'Winners', value: 22, target: 25, unit: 'winners', trend: '+3', icon: '🏆' },
        { id: 'unforced_errors', name: 'Unforced Errors', value: 18, target: 15, unit: 'errors', trend: '-2', icon: '❌' },
        { id: 'break_points', name: 'Break Point %', value: 45, target: 55, unit: '%', trend: '+7%', icon: '💪' },
        { id: 'rally_length', name: 'Avg Rally Length', value: 5.8, target: 6.5, unit: 'shots', trend: '+0.4', icon: '🔄' },
        { id: 'court_coverage', name: 'Court Coverage', value: 85, target: 90, unit: '%', trend: '+3%', icon: '🏃‍♂️' },
      ]
    }
  };

  const timeframes = [
    { id: 'week', name: 'This Week', icon: 'today' },
    { id: 'month', name: 'This Month', icon: 'date-range' },
    { id: 'season', name: 'Season', icon: 'event' },
    { id: 'all', name: 'All Time', icon: 'history' },
  ];

  const sports = Object.keys(sportsConfig);
  const currentSportData = sportsConfig[selectedSport];
  const metrics = currentSportData?.metrics || [];

  // Animation effects
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Chart animation
  useEffect(() => {
    chartAnim.setValue(0);
    Animated.timing(chartAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [selectedSport, selectedTimeframe]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh metrics');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Get metric progress color
  const getMetricProgressColor = (value, target) => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return '#27ae60';
    if (percentage >= 70) return '#f39c12';
    return '#e74c3c';
  };

  // Get trend color
  const getTrendColor = (trend) => {
    if (trend.includes('+')) return '#27ae60';
    if (trend.includes('-')) return '#e74c3c';
    return COLORS.textSecondary;
  };

  // Handle metric tap
  const handleMetricTap = (metric) => {
    Vibration.vibrate(50);
    setCurrentMetric(metric);
    setShowMetricModal(true);
  };

  // Calculate overall performance score
  const calculateOverallScore = () => {
    if (!metrics.length) return 0;
    const totalScore = metrics.reduce((acc, metric) => {
      return acc + (metric.value / metric.target) * 100;
    }, 0);
    return Math.round(totalScore / metrics.length);
  };

  // Render sport selector
  const renderSportSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: SPACING.md }}
    >
      {sports.map(sportKey => {
        const sport = sportsConfig[sportKey];
        return (
          <TouchableOpacity
            key={sportKey}
            onPress={() => {
              setSelectedSport(sportKey);
              Vibration.vibrate(30);
            }}
            style={{
              marginRight: SPACING.sm,
              alignItems: 'center',
            }}
          >
            <Surface style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: selectedSport === sportKey ? 8 : 2,
              backgroundColor: selectedSport === sportKey ? sport.color : 'white',
            }}>
              <Text style={{ 
                fontSize: 28,
                opacity: selectedSport === sportKey ? 1 : 0.6 
              }}>
                {sport.icon}
              </Text>
            </Surface>
            <Text style={[
              TEXT_STYLES.caption,
              {
                marginTop: 4,
                fontWeight: selectedSport === sportKey ? '600' : '400',
                color: selectedSport === sportKey ? sport.color : COLORS.textSecondary,
              }
            ]}>
              {sport.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // Render timeframe selector
  const renderTimeframeSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: SPACING.md }}
    >
      {timeframes.map(timeframe => (
        <Chip
          key={timeframe.id}
          mode={selectedTimeframe === timeframe.id ? 'flat' : 'outlined'}
          selected={selectedTimeframe === timeframe.id}
          onPress={() => {
            setSelectedTimeframe(timeframe.id);
            Vibration.vibrate(30);
          }}
          icon={timeframe.icon}
          style={{
            marginRight: SPACING.sm,
            backgroundColor: selectedTimeframe === timeframe.id 
              ? currentSportData.color 
              : 'transparent',
          }}
          textStyle={{
            color: selectedTimeframe === timeframe.id 
              ? 'white' 
              : currentSportData.color,
            fontSize: 12,
            fontWeight: '600',
          }}
        >
          {timeframe.name}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render metric card
  const renderMetricCard = (metric, index) => {
    const progress = Math.min((metric.value / metric.target) * 100, 100);
    const progressColor = getMetricProgressColor(metric.value, metric.target);
    const trendColor = getTrendColor(metric.trend);
    
    return (
      <Animated.View
        key={metric.id}
        style={{
          transform: [
            { 
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50 * (index + 1) * 0.1],
              })
            },
            { scale: scaleAnim }
          ],
          opacity: fadeAnim,
          marginBottom: SPACING.md,
          marginHorizontal: SPACING.md,
        }}
      >
        <TouchableOpacity
          onPress={() => handleMetricTap(metric)}
          activeOpacity={0.8}
        >
          <Card style={{
            elevation: 4,
            borderRadius: 16,
            borderLeftWidth: 4,
            borderLeftColor: progressColor,
          }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 20, marginRight: 8 }}>{metric.icon}</Text>
                    <Text style={[TEXT_STYLES.body1, { fontWeight: '600', flex: 1 }]}>
                      {metric.name}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.sm }}>
                    <Text style={[TEXT_STYLES.h2, { color: progressColor, marginRight: 4 }]}>
                      {metric.value}
                    </Text>
                    <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary }]}>
                      {metric.unit}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 8 }]}>
                      / {metric.target} {metric.unit}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      Progress: {Math.round(progress)}%
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon 
                        name={metric.trend.includes('+') ? 'trending-up' : 'trending-down'} 
                        size={16} 
                        color={trendColor} 
                      />
                      <Text style={[TEXT_STYLES.caption, { color: trendColor, marginLeft: 4 }]}>
                        {metric.trend}
                      </Text>
                    </View>
                  </View>

                  <Animated.View style={{
                    width: chartAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }}>
                    <ProgressBar
                      progress={progress / 100}
                      color={progressColor}
                      style={{ height: 6, borderRadius: 3 }}
                    />
                  </Animated.View>
                </View>

                <Surface style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: progressColor + '20',
                  marginLeft: SPACING.sm,
                }}>
                  <Text style={{ fontSize: 16, color: progressColor }}>
                    {Math.round(progress)}%
                  </Text>
                </Surface>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render performance summary
  const renderPerformanceSummary = () => {
    const overallScore = calculateOverallScore();
    const scoreColor = overallScore >= 80 ? '#27ae60' : overallScore >= 60 ? '#f39c12' : '#e74c3c';
    
    return (
      <Surface style={{
        margin: SPACING.md,
        borderRadius: 16,
        elevation: 4,
      }}>
        <LinearGradient
          colors={[currentSportData.color, currentSportData.color + 'CC']}
          style={{
            padding: SPACING.lg,
            borderRadius: 16,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h1, { color: 'white', fontSize: 48 }]}>
              {overallScore}
            </Text>
            <Text style={[TEXT_STYLES.body1, { color: 'rgba(255,255,255,0.9)', fontWeight: '600' }]}>
              Overall Performance Score
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4 }]}>
              Based on {metrics.length} key metrics for {currentSportData.name.toLowerCase()}
            </Text>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: SPACING.lg,
            paddingTop: SPACING.md,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.3)',
          }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="trending-up" size={24} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4 }]}>
                Improving
              </Text>
              <Text style={[TEXT_STYLES.body2, { color: 'white', fontWeight: '600' }]}>
                {metrics.filter(m => m.trend.includes('+')).length}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Icon name="track-changes" size={24} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4 }]}>
                On Target
              </Text>
              <Text style={[TEXT_STYLES.body2, { color: 'white', fontWeight: '600' }]}>
                {metrics.filter(m => (m.value / m.target) >= 0.9).length}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Icon name="priority-high" size={24} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4 }]}>
                Focus Areas
              </Text>
              <Text style={[TEXT_STYLES.body2, { color: 'white', fontWeight: '600' }]}>
                {metrics.filter(m => (m.value / m.target) < 0.7).length}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Surface>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: 4 }]}>
              Sport Metrics 📊
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Track your performance across different sports
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon="bar-chart"
              iconColor="white"
              size={24}
              onPress={() => {
                setViewMode(viewMode === 'cards' ? 'chart' : 'cards');
                Vibration.vibrate(30);
              }}
            />
            <Avatar.Text
              size={45}
              label={user?.name?.charAt(0) || 'P'}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
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
        {/* Sport and Timeframe Selectors */}
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.body1, { fontWeight: '600', marginBottom: SPACING.sm }]}>
            Select Sport
          </Text>
          {renderSportSelector()}
          
          <Text style={[TEXT_STYLES.body1, { fontWeight: '600', marginBottom: SPACING.sm }]}>
            Timeframe
          </Text>
          {renderTimeframeSelector()}
        </View>

        {/* Performance Summary */}
        {renderPerformanceSummary()}

        {/* Metrics List */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {metrics.map((metric, index) => renderMetricCard(metric, index))}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add-chart"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: currentSportData?.color || COLORS.primary,
        }}
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            "Add Custom Metric",
            "Track additional performance metrics coming soon! 📈",
            [{ text: "Great!", style: "default" }]
          );
        }}
      />

      {/* Metric Detail Modal */}
      <Portal>
        {showMetricModal && currentMetric && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
            <BlurView
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
              }}
              blurType="dark"
              blurAmount={10}
            />
            <Surface style={{
              width: width * 0.9,
              borderRadius: 20,
              padding: SPACING.lg,
              maxHeight: height * 0.8,
            }}>
              <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
                <Text style={{ fontSize: 50, marginBottom: SPACING.sm }}>
                  {currentMetric.icon}
                </Text>
                <Text style={[TEXT_STYLES.h2, { textAlign: 'center' }]}>
                  {currentMetric.name}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.h1, { color: currentSportData.color }]}>
                    {currentMetric.value}
                  </Text>
                  <Text style={[TEXT_STYLES.body1, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                    {currentMetric.unit}
                  </Text>
                </View>
              </View>

              <View style={{ marginBottom: SPACING.lg }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary }]}>Target</Text>
                  <Text style={[TEXT_STYLES.body1, { fontWeight: '600' }]}>
                    {currentMetric.target} {currentMetric.unit}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary }]}>Progress</Text>
                  <Text style={[TEXT_STYLES.body1, { fontWeight: '600' }]}>
                    {Math.round((currentMetric.value / currentMetric.target) * 100)}%
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
                  <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary }]}>Trend</Text>
                  <Text style={[
                    TEXT_STYLES.body1, 
                    { 
                      fontWeight: '600',
                      color: getTrendColor(currentMetric.trend)
                    }
                  ]}>
                    {currentMetric.trend}
                  </Text>
                </View>

                <ProgressBar
                  progress={Math.min((currentMetric.value / currentMetric.target), 1)}
                  color={currentSportData.color}
                  style={{ height: 8, borderRadius: 4 }}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  mode="outlined"
                  onPress={() => setShowMetricModal(false)}
                  style={{ flex: 1, marginRight: SPACING.sm, borderRadius: 25 }}
                >
                  Close
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowMetricModal(false);
                    Alert.alert(
                      "Detailed Analytics",
                      "Advanced metric analysis coming soon! 📊",
                      [{ text: "Awesome!", style: "default" }]
                    );
                  }}
                  style={{ flex: 1, marginLeft: SPACING.sm, borderRadius: 25 }}
                  buttonColor={currentSportData.color}
                >
                  View Details
                </Button>
              </View>
            </Surface>
          </View>
        )}
      </Portal>
    </View>
  );
};

export default SportSpecificMetrics;