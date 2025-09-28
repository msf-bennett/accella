import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Dimensions,
  Vibration,
  Animated,
} from 'react-native';
import {
  Card,
  Button,
  TextInput,
  Chip,
  ProgressBar,
  Surface,
  Portal,
  Modal,
  IconButton,
  FAB,
  Avatar,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Design system imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  cardio: '#e91e63',
  endurance: '#2196f3',
  recovery: '#4caf50',
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
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: 'bold' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

const CardioProgress = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, cardioData } = useSelector(state => ({
    user: state.auth.user,
    cardioData: state.performance.cardio || {},
  }));

  // State for cardio metrics
  const [currentSession, setCurrentSession] = useState({
    type: 'running',
    duration: '',
    distance: '',
    restingHR: '',
    maxHR: '',
    avgHR: '',
    calories: '',
    pace: '',
    elevation: '',
    vo2Max: '',
    recoveryHR: '',
    notes: '',
  });

  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [cardioHistory, setCardioHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [animatedValue] = useState(new Animated.Value(0));

  // Exercise types with icons
  const exerciseTypes = [
    { key: 'running', label: 'Running', icon: '🏃‍♂️', color: COLORS.cardio },
    { key: 'cycling', label: 'Cycling', icon: '🚴‍♂️', color: COLORS.endurance },
    { key: 'swimming', label: 'Swimming', icon: '🏊‍♂️', color: COLORS.success },
    { key: 'rowing', label: 'Rowing', icon: '🚣‍♂️', color: COLORS.primary },
    { key: 'elliptical', label: 'Elliptical', icon: '🏃‍♀️', color: COLORS.secondary },
    { key: 'walking', label: 'Walking', icon: '🚶‍♂️', color: COLORS.recovery },
    { key: 'hiit', label: 'HIIT', icon: '💥', color: COLORS.warning },
    { key: 'other', label: 'Other', icon: '💪', color: COLORS.textSecondary },
  ];

  useEffect(() => {
    loadCardioHistory();
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const loadCardioHistory = useCallback(() => {
    // Load from Redux store or local storage
    const history = cardioData.history || [];
    setCardioHistory(history);
  }, [cardioData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCardioHistory();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadCardioHistory]);

  // Calculations
  const calculateMaxHR = (age = user?.age || 25) => {
    return 220 - age;
  };

  const calculateTargetHRZones = (maxHR) => {
    return {
      recovery: { min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6) },
      aerobic: { min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7) },
      anaerobic: { min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8) },
      vo2max: { min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.9) },
      neuromuscular: { min: Math.round(maxHR * 0.9), max: maxHR },
    };
  };

  const calculateVO2Max = (distance, time) => {
    // Cooper 12-minute test approximation
    if (!distance || !time) return null;
    const distanceMeters = parseFloat(distance) * 1000; // assuming km
    const timeMinutes = parseFloat(time);
    
    if (timeMinutes >= 12) {
      return Math.round((distanceMeters - 504.9) / 44.73);
    }
    return null;
  };

  const calculateCaloriesBurned = (duration, avgHR, weight = user?.weight || 70) => {
    if (!duration || !avgHR) return null;
    const minutes = parseFloat(duration);
    const hr = parseFloat(avgHR);
    const w = parseFloat(weight);
    
    // Simplified calorie calculation
    return Math.round(((hr * 0.6309) + (w * 0.1988) + (user?.age * 0.2017) - 55.0969) * minutes / 4.184);
  };

  const calculatePace = (distance, time) => {
    if (!distance || !time) return null;
    const d = parseFloat(distance);
    const t = parseFloat(time);
    
    const paceMinutes = t / d;
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.round((paceMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCardioLevel = () => {
    if (cardioHistory.length === 0) return { level: 'Beginner', color: COLORS.warning, progress: 0 };
    
    const totalSessions = cardioHistory.length;
    const avgDuration = cardioHistory.reduce((sum, session) => sum + (parseFloat(session.duration) || 0), 0) / totalSessions;
    
    if (totalSessions >= 50 && avgDuration >= 45) {
      return { level: 'Elite Athlete', color: COLORS.success, progress: 1 };
    } else if (totalSessions >= 30 && avgDuration >= 35) {
      return { level: 'Advanced', color: COLORS.primary, progress: 0.8 };
    } else if (totalSessions >= 15 && avgDuration >= 25) {
      return { level: 'Intermediate', color: COLORS.endurance, progress: 0.6 };
    } else if (totalSessions >= 5) {
      return { level: 'Beginner+', color: COLORS.warning, progress: 0.4 };
    }
    return { level: 'Beginner', color: COLORS.warning, progress: 0.2 };
  };

  const saveCardioSession = () => {
    const calculatedPace = calculatePace(currentSession.distance, currentSession.duration);
    const calculatedCalories = calculateCaloriesBurned(currentSession.duration, currentSession.avgHR);
    const calculatedVO2 = calculateVO2Max(currentSession.distance, currentSession.duration);
    
    const newSession = {
      ...currentSession,
      pace: calculatedPace || currentSession.pace,
      calories: calculatedCalories || currentSession.calories,
      vo2Max: calculatedVO2 || currentSession.vo2Max,
      date: new Date().toISOString(),
      id: Date.now().toString(),
    };
    
    const updatedHistory = [...cardioHistory, newSession];
    setCardioHistory(updatedHistory);
    
    // Dispatch to Redux
    dispatch({
      type: 'UPDATE_CARDIO_DATA',
      payload: {
        current: newSession,
        history: updatedHistory,
      },
    });
    
    setCurrentSession({
      type: 'running',
      duration: '',
      distance: '',
      restingHR: '',
      maxHR: '',
      avgHR: '',
      calories: '',
      pace: '',
      elevation: '',
      vo2Max: '',
      recoveryHR: '',
      notes: '',
    });
    
    setShowAddModal(false);
    Vibration.vibrate(50);
    Alert.alert('Success! 🎉', 'Your cardio session has been logged.');
  };

  const getFilteredHistory = () => {
    let filtered = cardioHistory;
    
    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    const now = new Date();
    const timeframes = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    };
    
    if (timeframes[selectedTimeframe]) {
      const daysAgo = timeframes[selectedTimeframe];
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(session => new Date(session.date) >= cutoffDate);
    }
    
    return filtered.reverse();
  };

  const renderStatsOverview = () => {
    const filteredHistory = getFilteredHistory();
    const cardioLevel = getCardioLevel();
    
    const totalSessions = filteredHistory.length;
    const totalDuration = filteredHistory.reduce((sum, session) => sum + (parseFloat(session.duration) || 0), 0);
    const totalDistance = filteredHistory.reduce((sum, session) => sum + (parseFloat(session.distance) || 0), 0);
    const avgHR = filteredHistory.length > 0 ? 
      filteredHistory.reduce((sum, session) => sum + (parseFloat(session.avgHR) || 0), 0) / filteredHistory.length : 0;

    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, marginBottom: SPACING.md }]}>
            💓 Cardio Overview
          </Text>
          
          <View style={styles.levelContainer}>
            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>Fitness Level</Text>
            <View style={styles.levelRow}>
              <Text style={[TEXT_STYLES.h3, { color: cardioLevel.color }]}>
                {cardioLevel.level}
              </Text>
              <ProgressBar
                progress={cardioLevel.progress}
                color={cardioLevel.color}
                style={styles.levelProgress}
              />
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <Animated.View style={[styles.statItem, { opacity: animatedValue }]}>
              <Surface style={[styles.statSurface, { borderLeftColor: COLORS.cardio }]}>
                <Text style={styles.statNumber}>{totalSessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </Surface>
            </Animated.View>
            
            <Animated.View style={[styles.statItem, { opacity: animatedValue }]}>
              <Surface style={[styles.statSurface, { borderLeftColor: COLORS.endurance }]}>
                <Text style={styles.statNumber}>{totalDuration.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </Surface>
            </Animated.View>
            
            <Animated.View style={[styles.statItem, { opacity: animatedValue }]}>
              <Surface style={[styles.statSurface, { borderLeftColor: COLORS.success }]}>
                <Text style={styles.statNumber}>{totalDistance.toFixed(1)}</Text>
                <Text style={styles.statLabel}>KM</Text>
              </Surface>
            </Animated.View>
            
            <Animated.View style={[styles.statItem, { opacity: animatedValue }]}>
              <Surface style={[styles.statSurface, { borderLeftColor: COLORS.primary }]}>
                <Text style={styles.statNumber}>{avgHR.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Avg HR</Text>
              </Surface>
            </Animated.View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderHRZonesCard = () => {
    const maxHR = calculateMaxHR(user?.age);
    const zones = calculateTargetHRZones(maxHR);
    
    return (
      <Card style={styles.zonesCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, marginBottom: SPACING.md }]}>
            🎯 Heart Rate Zones
          </Text>
          
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.md }]}>
            Based on max HR of {maxHR} bpm (Age: {user?.age || 25})
          </Text>
          
          {Object.entries(zones).map(([zoneName, range], index) => {
            const colors = [COLORS.recovery, COLORS.success, COLORS.warning, COLORS.cardio, COLORS.error];
            const zoneColor = colors[index];
            
            return (
              <Surface key={zoneName} style={styles.zoneItem}>
                <View style={[styles.zoneColor, { backgroundColor: zoneColor }]} />
                <View style={styles.zoneInfo}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', textTransform: 'capitalize' }]}>
                    {zoneName.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    {range.min} - {range.max} bpm
                  </Text>
                </View>
                <Text style={[TEXT_STYLES.body, { color: zoneColor, fontWeight: 'bold' }]}>
                  {Math.round((range.min / maxHR) * 100)}%-{Math.round((range.max / maxHR) * 100)}%
                </Text>
              </Surface>
            );
          })}
        </Card.Content>
      </Card>
    );
  };

  const renderProgressChart = () => {
    const filteredHistory = getFilteredHistory().slice(-10);
    if (filteredHistory.length < 2) return null;
    
    const data = filteredHistory.map(session => ({
      date: new Date(session.date).getDate(),
      duration: parseFloat(session.duration) || 0,
      avgHR: parseFloat(session.avgHR) || 0,
      distance: parseFloat(session.distance) || 0,
    }));
    
    const chartData = {
      labels: data.map(d => d.date.toString()),
      datasets: [
        {
          data: selectedMetric === 'heartRate' ? data.map(d => d.avgHR) : 
                selectedMetric === 'duration' ? data.map(d => d.duration) :
                data.map(d => d.distance),
          color: () => COLORS.primary,
          strokeWidth: 3,
        },
      ],
    };
    
    const yAxisSuffix = selectedMetric === 'heartRate' ? ' bpm' : 
                      selectedMetric === 'duration' ? ' min' : ' km';
    
    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              📈 Progress Tracking
            </Text>
            
            <View style={styles.metricSelector}>
              <Chip
                selected={selectedMetric === 'heartRate'}
                onPress={() => setSelectedMetric('heartRate')}
                style={[styles.metricChip, selectedMetric === 'heartRate' && { backgroundColor: COLORS.cardio }]}
                textStyle={selectedMetric === 'heartRate' && { color: 'white' }}
              >
                HR
              </Chip>
              <Chip
                selected={selectedMetric === 'duration'}
                onPress={() => setSelectedMetric('duration')}
                style={[styles.metricChip, selectedMetric === 'duration' && { backgroundColor: COLORS.endurance }]}
                textStyle={selectedMetric === 'duration' && { color: 'white' }}
              >
                Time
              </Chip>
              <Chip
                selected={selectedMetric === 'distance'}
                onPress={() => setSelectedMetric('distance')}
                style={[styles.metricChip, selectedMetric === 'distance' && { backgroundColor: COLORS.success }]}
                textStyle={selectedMetric === 'distance' && { color: 'white' }}
              >
                Distance
              </Chip>
            </View>
          </View>
          
          <LineChart
            data={chartData}
            width={width - 60}
            height={200}
            yAxisSuffix={yAxisSuffix}
            chartConfig={{
              backgroundColor: COLORS.background,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
              labelColor: () => COLORS.textSecondary,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: COLORS.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderExerciseTypeChart = () => {
    const filteredHistory = getFilteredHistory();
    if (filteredHistory.length === 0) return null;
    
    const typeCounts = filteredHistory.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {});
    
    const pieData = Object.entries(typeCounts).map(([type, count], index) => {
      const exerciseType = exerciseTypes.find(et => et.key === type);
      return {
        name: exerciseType?.label || type,
        population: count,
        color: exerciseType?.color || COLORS.textSecondary,
        legendFontColor: COLORS.text,
        legendFontSize: 12,
      };
    });
    
    return (
      <Card style={styles.pieChartCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, marginBottom: SPACING.md }]}>
            🏃‍♂️ Exercise Distribution
          </Text>
          
          <PieChart
            data={pieData}
            width={width - 60}
            height={200}
            chartConfig={{
              color: () => COLORS.primary,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </Card.Content>
      </Card>
    );
  };

  const renderInput = (label, key, placeholder, multiline = false, keyboardType = 'default') => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        mode="outlined"
        value={currentSession[key]}
        onChangeText={(value) => setCurrentSession(prev => ({ ...prev, [key]: value }))}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        style={styles.input}
        theme={{ colors: { primary: COLORS.primary } }}
      />
    </View>
  );

  const renderSessionHistory = () => {
    const filteredHistory = getFilteredHistory().slice(0, 5);
    
    return (
      <Card style={styles.historyCard}>
        <Card.Content>
          <View style={styles.historyHeader}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              📚 Recent Sessions
            </Text>
            
            <View style={styles.timeframeSelector}>
              {['week', 'month', 'quarter'].map(timeframe => (
                <Chip
                  key={timeframe}
                  selected={selectedTimeframe === timeframe}
                  onPress={() => setSelectedTimeframe(timeframe)}
                  style={[styles.timeframeChip, selectedTimeframe === timeframe && { backgroundColor: COLORS.primary }]}
                  textStyle={selectedTimeframe === timeframe && { color: 'white' }}
                >
                  {timeframe}
                </Chip>
              ))}
            </View>
          </View>
          
          <Searchbar
            placeholder="Search sessions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={{ fontSize: 14 }}
          />
          
          {filteredHistory.map((session) => {
            const exerciseType = exerciseTypes.find(et => et.key === session.type);
            
            return (
              <Surface key={session.id} style={styles.sessionItem}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionTypeContainer}>
                    <Text style={styles.sessionIcon}>{exerciseType?.icon || '💪'}</Text>
                    <View>
                      <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                        {exerciseType?.label || session.type}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                        {new Date(session.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.sessionStats}>
                    {session.duration && (
                      <Text style={styles.sessionStat}>⏱️ {session.duration}min</Text>
                    )}
                    {session.distance && (
                      <Text style={styles.sessionStat}>📏 {session.distance}km</Text>
                    )}
                    {session.avgHR && (
                      <Text style={styles.sessionStat}>💓 {session.avgHR}bpm</Text>
                    )}
                  </View>
                </View>
                
                {session.notes && (
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: SPACING.xs }]}>
                    {session.notes}
                  </Text>
                )}
              </Surface>
            );
          })}
          
          {filteredHistory.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                No cardio sessions found 🏃‍♂️{'\n'}
                Start tracking your workouts!
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.cardio, COLORS.primary]}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
          💓 Cardio Progress
        </Text>
        <Text style={[TEXT_STYLES.body, { color: 'white', opacity: 0.9 }]}>
          Track your cardiovascular fitness journey
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.cardio]}
            tintColor={COLORS.cardio}
          />
        }
      >
        {renderStatsOverview()}
        {renderHRZonesCard()}
        {renderProgressChart()}
        {renderExerciseTypeChart()}
        {renderSessionHistory()}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Session Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.lg }]}>
              💓 Log Cardio Session
            </Text>
            
            {/* Exercise Type Selection */}
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Exercise Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {exerciseTypes.map((type) => (
                <Surface
                  key={type.key}
                  style={[
                    styles.typeOption,
                    currentSession.type === type.key && { backgroundColor: type.color }
                  ]}
                >
                  <Button
                    mode="text"
                    onPress={() => setCurrentSession(prev => ({ ...prev, type: type.key }))}
                    labelStyle={[
                      styles.typeLabel,
                      currentSession.type === type.key && { color: 'white' }
                    ]}
                  >
                    {type.icon} {type.label}
                  </Button>
                </Surface>
              ))}
            </ScrollView>
            
            {/* Basic Metrics */}
            <Text style={[TEXT_STYLES.h3, { marginVertical: SPACING.md }]}>Session Details</Text>
            {renderInput('Duration (minutes)', 'duration', '30', false, 'numeric')}
            {renderInput('Distance (km)', 'distance', '5.0', false, 'numeric')}
            {renderInput('Elevation Gain (m)', 'elevation', '100', false, 'numeric')}
            
            {/* Heart Rate Data */}
            <Text style={[TEXT_STYLES.h3, { marginVertical: SPACING.md }]}>Heart Rate Data</Text>
            {renderInput('Resting HR (bpm)', 'restingHR', '60', false, 'numeric')}
            {renderInput('Average HR (bpm)', 'avgHR', '150', false, 'numeric')}
            {renderInput('Max HR (bpm)', 'maxHR', '180', false, 'numeric')}
            {renderInput('Recovery HR (bpm)', 'recoveryHR', '120', false, 'numeric')}
            
            {/* Additional Metrics */}
            <Text style={[TEXT_STYLES.h3, { marginVertical: SPACING.md }]}>Additional Info</Text>
            {renderInput('VO2 Max', 'vo2Max', '45', false, 'numeric')}
            {renderInput('Calories Burned', 'calories', '300', false, 'numeric')}
            {renderInput('Notes', 'notes', 'How did you feel? Any observations...', true)}
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={saveCardioSession}
                style={styles.saveButton}
                buttonColor={COLORS.cardio}
              >
                Save Session
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* FAB */}
      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.cardio }]}
        onPress={() => setShowAddModal(true)}
        color="white"
        customSize={56}
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  statsCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  levelContainer: {
    marginBottom: SPACING.lg,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  levelProgress: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
  },
  statSurface: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  zonesCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderRadius: 8,
    elevation: 1,
  },
  zoneColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  zoneInfo: {
    flex: 1,
  },
  chartCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  metricSelector: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  metricChip: {
    marginHorizontal: SPACING.xs / 2,
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: 16,
  },
  pieChartCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  historyCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  timeframeSelector: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  timeframeChip: {
    marginHorizontal: SPACING.xs / 2,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  sessionItem: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  sessionStats: {
    alignItems: 'flex-end',
  },
  sessionStat: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    maxHeight: '90%',
  },
  typeSelector: {
    marginBottom: SPACING.lg,
  },
  typeOption: {
    marginRight: SPACING.sm,
    borderRadius: 20,
    elevation: 2,
  },
  typeLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
  },
  bottomSpacer: {
    height: 80,
  },
});

export default CardioProgress;