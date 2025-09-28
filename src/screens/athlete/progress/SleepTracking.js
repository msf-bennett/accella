import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Animated,
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
  TextInput,
  Switch,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  sleep: '#4A90E2',
  deep: '#2C5282',
  light: '#63B3ED',
  rem: '#9F7AEA',
  awake: '#ED8936',
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
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
};

const { width, height } = Dimensions.get('window');

const SleepTracking = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  // Sleep tracking data
  const [sleepData, setSleepData] = useState({
    bedtime: '',
    wakeTime: '',
    sleepDuration: 0,
    sleepQuality: 3,
    deepSleep: 0,
    lightSleep: 0,
    remSleep: 0,
    awakeDuration: 0,
    fallAsleepTime: 15,
    notes: '',
  });

  const [sleepGoal, setSleepGoal] = useState(8);
  const [smartAlarm, setSmartAlarm] = useState(false);
  const [sleepReminder, setSleepReminder] = useState(true);

  const dispatch = useDispatch();
  const { user, sleep, isLoading } = useSelector(state => ({
    user: state.auth.user || {},
    sleep: state.sleep?.data || {},
    isLoading: state.sleep?.isLoading || false,
  }));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation for sleep score
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    loadSleepData();
    return () => pulseAnimation.stop();
  }, []);

  const loadSleepData = async () => {
    try {
      // Simulate API call for sleep data
      console.log('Loading sleep data...');
    } catch (error) {
      console.error('Error loading sleep data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSleepData();
    setRefreshing(false);
  }, []);

  const handleSaveSleepData = async () => {
    try {
      Vibration.vibrate(50);
      
      const sleepEntry = {
        date: selectedDate,
        ...sleepData,
        timestamp: new Date().toISOString(),
      };

      console.log('Saving sleep entry:', sleepEntry);
      
      Alert.alert(
        '😴 Sleep Logged!',
        'Your sleep data has been recorded. Sweet dreams for better performance! 🌙',
        [{ text: 'Perfect!', onPress: () => setShowModal(false) }]
      );

      // Reset form
      setSleepData({
        bedtime: '',
        wakeTime: '',
        sleepDuration: 0,
        sleepQuality: 3,
        deepSleep: 0,
        lightSleep: 0,
        remSleep: 0,
        awakeDuration: 0,
        fallAsleepTime: 15,
        notes: '',
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to save sleep data. Please try again.');
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    Vibration.vibrate(25);
  };

  const getSleepScore = () => {
    // Calculate sleep score based on duration, quality, and efficiency
    const durationScore = Math.min((sleepData.sleepDuration / sleepGoal) * 40, 40);
    const qualityScore = sleepData.sleepQuality * 12;
    const efficiencyScore = sleepData.sleepDuration > 0 ? 
      ((sleepData.sleepDuration / (sleepData.sleepDuration + sleepData.awakeDuration)) * 20) : 0;
    const fallAsleepScore = sleepData.fallAsleepTime <= 20 ? 20 : Math.max(0, 20 - (sleepData.fallAsleepTime - 20));
    
    return Math.min(Math.round(durationScore + qualityScore + efficiencyScore + fallAsleepScore), 100);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const getSleepPhasePercentage = (phase) => {
    const total = sleepData.deepSleep + sleepData.lightSleep + sleepData.remSleep;
    if (total === 0) return 0;
    return (sleepData[phase] / total) * 100;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const SleepMetricCard = ({ title, value, subtitle, color, icon, onPress, progress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Surface style={[styles.metricCard, { borderLeftColor: color }]}>
        <View style={styles.cardHeader}>
          <Icon name={icon} size={24} color={color} />
          <Text style={[styles.cardTitle, { color }]}>{title}</Text>
        </View>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
        {progress !== undefined && (
          <ProgressBar
            progress={progress / 100}
            color={color}
            style={styles.cardProgress}
          />
        )}
      </Surface>
    </TouchableOpacity>
  );

  const SleepPhaseChart = () => {
    const phases = [
      { name: 'Deep', value: getSleepPhasePercentage('deepSleep'), color: COLORS.deep },
      { name: 'Light', value: getSleepPhasePercentage('lightSleep'), color: COLORS.light },
      { name: 'REM', value: getSleepPhasePercentage('remSleep'), color: COLORS.rem },
    ];

    return (
      <View style={styles.phaseChart}>
        <Text style={styles.chartTitle}>Sleep Phases</Text>
        <View style={styles.phaseBar}>
          {phases.map((phase, index) => (
            <View
              key={index}
              style={[
                styles.phaseSegment,
                {
                  width: `${phase.value}%`,
                  backgroundColor: phase.color,
                }
              ]}
            />
          ))}
        </View>
        <View style={styles.phaseLegend}>
          {phases.map((phase, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: phase.color }]} />
              <Text style={styles.legendText}>{phase.name}</Text>
              <Text style={styles.legendValue}>{phase.value.toFixed(0)}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const QualitySelector = ({ value, onChange }) => (
    <View style={styles.qualityContainer}>
      <Text style={styles.qualityTitle}>Sleep Quality</Text>
      <View style={styles.qualityButtons}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.qualityButton,
              {
                backgroundColor: value === rating ? COLORS.sleep : COLORS.surface,
                borderColor: COLORS.sleep,
              }
            ]}
            onPress={() => {
              onChange(rating);
              Vibration.vibrate(25);
            }}
          >
            <Text style={[
              styles.qualityEmoji,
              { opacity: value === rating ? 1 : 0.5 }
            ]}>
              {rating === 1 ? '😴' : rating === 2 ? '😕' : rating === 3 ? '😐' : rating === 4 ? '🙂' : '😄'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.qualityLabels}>
        <Text style={styles.qualityLabel}>Poor</Text>
        <Text style={styles.qualityLabel}>Excellent</Text>
      </View>
    </View>
  );

  const weeklyData = [
    { day: 'Mon', sleep: 7.5, quality: 4 },
    { day: 'Tue', sleep: 8.2, quality: 5 },
    { day: 'Wed', sleep: 6.8, quality: 3 },
    { day: 'Thu', sleep: 7.9, quality: 4 },
    { day: 'Fri', sleep: 8.1, quality: 5 },
    { day: 'Sat', sleep: 9.2, quality: 5 },
    { day: 'Sun', sleep: 8.5, quality: 4 },
  ];

  const currentScore = getSleepScore();
  const averageSleep = weeklyData.reduce((acc, day) => acc + day.sleep, 0) / weeklyData.length;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.sleep} barStyle="light-content" translucent />
      
      <LinearGradient
        colors={[COLORS.sleep, COLORS.deep]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Sleep Tracking 😴</Text>
            <Text style={styles.headerSubtitle}>Monitor your recovery through rest</Text>
          </View>
          <IconButton
            icon="bedtime"
            size={28}
            iconColor="#fff"
            onPress={() => Alert.alert('💤 Sleep Tips', 'Quality sleep is crucial for athletic performance. Aim for 7-9 hours per night!')}
          />
        </View>
      </LinearGradient>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.sleep]}
              tintColor={COLORS.sleep}
            />
          }
        >
          {/* Sleep Score */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Surface style={styles.scoreCard}>
              <LinearGradient
                colors={[getScoreColor(currentScore), `${getScoreColor(currentScore)}90`]}
                style={styles.scoreGradient}
              >
                <Icon name="bedtime" size={32} color="#fff" style={styles.scoreIcon} />
                <Text style={styles.scoreLabel}>Sleep Score</Text>
                <Text style={styles.scoreValue}>{currentScore}</Text>
                <ProgressBar
                  progress={currentScore / 100}
                  color="#fff"
                  style={styles.scoreProgress}
                />
                <Text style={styles.scoreSubtext}>
                  {currentScore >= 80 ? 'Excellent rest! 🌟' : 
                   currentScore >= 60 ? 'Good sleep 👍' : 'Needs improvement 💪'}
                </Text>
              </LinearGradient>
            </Surface>
          </Animated.View>

          {/* Last Night Summary */}
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryHeader}>
                <Text style={styles.sectionTitle}>Last Night 🌙</Text>
                <Chip
                  mode="outlined"
                  textStyle={styles.chipText}
                  style={{ borderColor: COLORS.sleep }}
                >
                  {averageSleep.toFixed(1)}h avg
                </Chip>
              </View>
              
              <View style={styles.summaryMetrics}>
                <View style={styles.summaryItem}>
                  <Icon name="bedtime" size={20} color={COLORS.sleep} />
                  <Text style={styles.summaryLabel}>Bedtime</Text>
                  <Text style={styles.summaryValue}>10:30 PM</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Icon name="alarm" size={20} color={COLORS.sleep} />
                  <Text style={styles.summaryLabel}>Wake Up</Text>
                  <Text style={styles.summaryValue}>6:45 AM</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Icon name="hourglass-empty" size={20} color={COLORS.sleep} />
                  <Text style={styles.summaryLabel}>Duration</Text>
                  <Text style={styles.summaryValue}>8h 15m</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Icon name="sentiment-satisfied" size={20} color={COLORS.sleep} />
                  <Text style={styles.summaryLabel}>Quality</Text>
                  <Text style={styles.summaryValue}>Good 😊</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Sleep Metrics */}
          <View style={styles.metricsGrid}>
            <SleepMetricCard
              title="Duration"
              value="8h 15m"
              subtitle="Goal: 8h"
              color={COLORS.success}
              icon="schedule"
              progress={85}
              onPress={() => openModal('duration')}
            />
            <SleepMetricCard
              title="Efficiency"
              value="92%"
              subtitle="Time asleep"
              color={COLORS.primary}
              icon="trending-up"
              progress={92}
              onPress={() => openModal('efficiency')}
            />
          </View>

          <View style={styles.metricsGrid}>
            <SleepMetricCard
              title="Fall Asleep"
              value="12 min"
              subtitle="Time to sleep"
              color={COLORS.warning}
              icon="timer"
              onPress={() => openModal('fallAsleep')}
            />
            <SleepMetricCard
              title="Interruptions"
              value="2 times"
              subtitle="Woke up"
              color={COLORS.accent}
              icon="notification-important"
              onPress={() => openModal('interruptions')}
            />
          </View>

          {/* Sleep Phases */}
          <Card style={styles.phasesCard}>
            <Card.Content>
              <SleepPhaseChart />
              
              <View style={styles.phaseDetails}>
                <View style={styles.phaseDetailItem}>
                  <Text style={styles.phaseDetailLabel}>Deep Sleep</Text>
                  <Text style={styles.phaseDetailValue}>1h 45m</Text>
                  <Text style={styles.phaseDetailPercent}>21%</Text>
                </View>
                <View style={styles.phaseDetailItem}>
                  <Text style={styles.phaseDetailLabel}>Light Sleep</Text>
                  <Text style={styles.phaseDetailValue}>4h 30m</Text>
                  <Text style={styles.phaseDetailPercent}>55%</Text>
                </View>
                <View style={styles.phaseDetailItem}>
                  <Text style={styles.phaseDetailLabel}>REM Sleep</Text>
                  <Text style={styles.phaseDetailValue}>2h 0m</Text>
                  <Text style={styles.phaseDetailPercent}>24%</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Weekly Trend */}
          <Card style={styles.trendCard}>
            <Card.Content>
              <View style={styles.trendHeader}>
                <Text style={styles.sectionTitle}>Weekly Pattern 📊</Text>
                <Chip mode="outlined" textStyle={styles.chipText}>
                  Consistent ✅
                </Chip>
              </View>
              
              <View style={styles.weeklyChart}>
                {weeklyData.map((item, index) => (
                  <View key={index} style={styles.chartItem}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: (item.sleep / 10) * 80,
                          backgroundColor: item.quality >= 4 ? COLORS.success : 
                                         item.quality >= 3 ? COLORS.warning : COLORS.error,
                        }
                      ]}
                    />
                    <Text style={styles.chartDay}>{item.day}</Text>
                    <Text style={styles.chartHours}>{item.sleep}h</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Sleep Environment */}
          <Card style={styles.environmentCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Sleep Environment 🏠</Text>
              
              <View style={styles.environmentGrid}>
                <View style={styles.envItem}>
                  <Icon name="thermostat" size={24} color={COLORS.primary} />
                  <Text style={styles.envLabel}>Temperature</Text>
                  <Text style={styles.envValue}>68°F</Text>
                  <Text style={styles.envStatus}>Optimal</Text>
                </View>
                <View style={styles.envItem}>
                  <Icon name="lightbulb" size={24} color={COLORS.warning} />
                  <Text style={styles.envLabel}>Light Level</Text>
                  <Text style={styles.envValue}>Dark</Text>
                  <Text style={styles.envStatus}>Perfect</Text>
                </View>
                <View style={styles.envItem}>
                  <Icon name="volume-off" size={24} color={COLORS.success} />
                  <Text style={styles.envLabel}>Noise Level</Text>
                  <Text style={styles.envValue}>Quiet</Text>
                  <Text style={styles.envStatus}>Good</Text>
                </View>
                <View style={styles.envItem}>
                  <Icon name="opacity" size={24} color={COLORS.sleep} />
                  <Text style={styles.envLabel}>Humidity</Text>
                  <Text style={styles.envValue}>45%</Text>
                  <Text style={styles.envStatus}>Ideal</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Sleep Tips */}
          <Card style={styles.tipsCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>💡 Sleep Optimization</Text>
              
              <View style={styles.tipItem}>
                <Icon name="schedule" size={20} color={COLORS.primary} />
                <Text style={styles.tipText}>
                  Maintain consistent bedtime and wake time, even on weekends
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="smartphone" size={20} color={COLORS.primary} />
                <Text style={styles.tipText}>
                  Avoid screens 1 hour before bed to improve sleep quality
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="restaurant" size={20} color={COLORS.primary} />
                <Text style={styles.tipText}>
                  No large meals or caffeine 3 hours before bedtime
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="fitness-center" size={20} color={COLORS.primary} />
                <Text style={styles.tipText}>
                  Regular exercise improves sleep, but not close to bedtime
                </Text>
              </View>
            </Card.Content>
          </Card>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => openModal('logSleep')}
        color="#fff"
      />

      {/* Sleep Logging Modal */}
      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurContainer}
            blurType="light"
            blurAmount={10}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Log Sleep Data 📊</Text>
              
              {/* Time Inputs */}
              <View style={styles.timeInputs}>
                <TextInput
                  label="Bedtime"
                  value={sleepData.bedtime}
                  onChangeText={(text) => setSleepData({ ...sleepData, bedtime: text })}
                  style={[styles.input, { flex: 0.48 }]}
                  left={<TextInput.Icon icon="bedtime" />}
                  placeholder="10:30 PM"
                />
                <TextInput
                  label="Wake Time"
                  value={sleepData.wakeTime}
                  onChangeText={(text) => setSleepData({ ...sleepData, wakeTime: text })}
                  style={[styles.input, { flex: 0.48 }]}
                  left={<TextInput.Icon icon="alarm" />}
                  placeholder="6:45 AM"
                />
              </View>

              {/* Sleep Duration */}
              <TextInput
                label="Sleep Duration (hours)"
                value={sleepData.sleepDuration.toString()}
                onChangeText={(text) => setSleepData({ ...sleepData, sleepDuration: parseFloat(text) || 0 })}
                keyboardType="decimal-pad"
                style={styles.input}
                left={<TextInput.Icon icon="schedule" />}
              />

              {/* Sleep Quality Selector */}
              <QualitySelector
                value={sleepData.sleepQuality}
                onChange={(quality) => setSleepData({ ...sleepData, sleepQuality: quality })}
              />

              {/* Fall Asleep Time */}
              <TextInput
                label="Time to Fall Asleep (minutes)"
                value={sleepData.fallAsleepTime.toString()}
                onChangeText={(text) => setSleepData({ ...sleepData, fallAsleepTime: parseInt(text) || 0 })}
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Icon icon="timer" />}
              />

              {/* Notes */}
              <TextInput
                label="Sleep Notes"
                value={sleepData.notes}
                onChangeText={(text) => setSleepData({ ...sleepData, notes: text })}
                multiline
                numberOfLines={3}
                style={styles.input}
                left={<TextInput.Icon icon="note" />}
                placeholder="How did you sleep? Any factors that affected your rest?"
              />

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveSleepData}
                  style={styles.saveButton}
                  buttonColor={COLORS.sleep}
                >
                  Save Sleep Data 💤
                </Button>
              </View>
            </ScrollView>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
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
    color: '#fff',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.md,
  },
  scoreCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  scoreGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  scoreIcon: {
    marginBottom: SPACING.sm,
  },
  scoreLabel: {
    ...TEXT_STYLES.body,
    color: '#fff',
    marginBottom: SPACING.sm,
  },
  scoreValue: {
    ...TEXT_STYLES.h1,
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  scoreProgress: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  scoreSubtext: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.9,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  chipText: {
    fontSize: 12,
  },
  summaryMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  summaryValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 0.48,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  cardValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  cardProgress: {
    height: 4,
    borderRadius: 2,
  },
  phasesCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 2,
  },
  phaseChart: {
    marginBottom: SPACING.lg,
  },
  chartTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  phaseBar: {
    height: 20,
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  phaseSegment: {
    height: '100%',
  },
  phaseLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
    flex: 1,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  legendText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontSize: 12,
  },
  legendValue: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  phaseDetails: {
    marginTop: SPACING.md,
  },
  phaseDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  phaseDetailLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    flex: 1,
  },
  phaseDetailValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  phaseDetailPercent: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  trendCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 2,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingBottom: SPACING.md,
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: SPACING.sm,
    minHeight: 20,
  },
  chartDay: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  chartHours: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  environmentCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 2,
  },
  environmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  envItem: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  envLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  envValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  envStatus: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontSize: 11,
    marginTop: SPACING.xs,
  },
  tipsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tipText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.sleep,
  },
  modalContainer: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  timeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  qualityContainer: {
    marginBottom: SPACING.lg,
  },
  qualityTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  qualityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  qualityButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qualityEmoji: {
    fontSize: 24,
  },
  qualityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  qualityLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
  },
  cancelButton: {
    flex: 0.45,
    borderColor: COLORS.textSecondary,
  },
  saveButton: {
    flex: 0.45,
  },
});

export default SleepTracking;