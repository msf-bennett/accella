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

const RecoveryTracking = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [soreness, setSoreness] = useState(3);
  const [notes, setNotes] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  const dispatch = useDispatch();
  const { user, recoveryData, isLoading } = useSelector(state => ({
    user: state.auth.user || {},
    recoveryData: state.recovery?.data || {},
    isLoading: state.recovery?.isLoading || false,
  }));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    loadRecoveryData();
  }, []);

  const loadRecoveryData = async () => {
    try {
      // Simulate API call for recovery data
      console.log('Loading recovery data...');
    } catch (error) {
      console.error('Error loading recovery data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecoveryData();
    setRefreshing(false);
  }, []);

  const handleSaveRecovery = async () => {
    try {
      Vibration.vibrate(50);
      
      const recoveryEntry = {
        date: selectedDate,
        sleepHours: parseFloat(sleepHours),
        sleepQuality,
        stressLevel,
        energyLevel,
        soreness,
        notes,
        timestamp: new Date().toISOString(),
      };

      console.log('Saving recovery entry:', recoveryEntry);
      
      // Simulate saving to Redux/API
      Alert.alert(
        '✅ Recovery Logged!',
        'Your recovery data has been saved successfully. Keep tracking for better insights! 💪',
        [{ text: 'Awesome!', onPress: () => setShowModal(false) }]
      );

      // Reset form
      setSleepHours('');
      setSleepQuality(3);
      setStressLevel(3);
      setEnergyLevel(3);
      setSoreness(3);
      setNotes('');
      
    } catch (error) {
      Alert.alert('Error', 'Failed to save recovery data. Please try again.');
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    Vibration.vibrate(25);
  };

  const getRecoveryScore = () => {
    // Simple recovery score calculation (0-100)
    const sleepScore = sleepQuality * 20;
    const energyScore = energyLevel * 20;
    const stressScore = (5 - stressLevel) * 20;
    const sorenessScore = (5 - soreness) * 20;
    
    return Math.round((sleepScore + energyScore + stressScore + sorenessScore) / 4);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const getRatingEmoji = (rating) => {
    const emojis = ['😴', '😕', '😐', '🙂', '😄'];
    return emojis[rating - 1] || '😐';
  };

  const RecoveryCard = ({ title, value, subtitle, color, onPress, icon }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Surface style={[styles.recoveryCard, { borderLeftColor: color }]}>
        <View style={styles.cardHeader}>
          <Icon name={icon} size={24} color={color} />
          <Text style={[styles.cardTitle, { color }]}>{title}</Text>
        </View>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </Surface>
    </TouchableOpacity>
  );

  const RatingSelector = ({ title, value, onChange, color }) => (
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingTitle}>{title}</Text>
      <View style={styles.ratingButtons}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              { backgroundColor: value === rating ? color : COLORS.surface },
              { borderColor: color }
            ]}
            onPress={() => {
              onChange(rating);
              Vibration.vibrate(25);
            }}
          >
            <Text style={[
              styles.ratingText,
              { color: value === rating ? '#fff' : color }
            ]}>
              {getRatingEmoji(rating)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const weeklyData = [
    { day: 'Mon', score: 85 },
    { day: 'Tue', score: 72 },
    { day: 'Wed', score: 90 },
    { day: 'Thu', score: 68 },
    { day: 'Fri', score: 95 },
    { day: 'Sat', score: 82 },
    { day: 'Sun', score: 88 },
  ];

  const currentScore = getRecoveryScore();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Recovery Tracking 🔋</Text>
            <Text style={styles.headerSubtitle}>Monitor your wellness journey</Text>
          </View>
          <IconButton
            icon="insights"
            size={28}
            iconColor="#fff"
            onPress={() => Alert.alert('📊 Coming Soon!', 'Advanced analytics dashboard is in development')}
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
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Today's Recovery Score */}
          <Surface style={styles.scoreCard}>
            <LinearGradient
              colors={[getScoreColor(currentScore), `${getScoreColor(currentScore)}90`]}
              style={styles.scoreGradient}
            >
              <Text style={styles.scoreLabel}>Today's Recovery Score</Text>
              <Text style={styles.scoreValue}>{currentScore}</Text>
              <ProgressBar
                progress={currentScore / 100}
                color="#fff"
                style={styles.scoreProgress}
              />
            </LinearGradient>
          </Surface>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <RecoveryCard
              title="Sleep"
              value="8.2h"
              subtitle="Great quality 😴"
              color={COLORS.primary}
              icon="bedtime"
              onPress={() => openModal('sleep')}
            />
            <RecoveryCard
              title="Energy"
              value="High"
              subtitle="Feeling strong 💪"
              color={COLORS.success}
              icon="battery-charging-full"
              onPress={() => openModal('energy')}
            />
          </View>

          <View style={styles.quickActions}>
            <RecoveryCard
              title="Stress"
              value="Low"
              subtitle="Relaxed state 😌"
              color={COLORS.warning}
              icon="psychology"
              onPress={() => openModal('stress')}
            />
            <RecoveryCard
              title="Soreness"
              value="Mild"
              subtitle="Post-workout 🏃"
              color={COLORS.accent}
              icon="fitness-center"
              onPress={() => openModal('soreness')}
            />
          </View>

          {/* Weekly Trend */}
          <Card style={styles.trendCard}>
            <Card.Content>
              <View style={styles.trendHeader}>
                <Text style={styles.sectionTitle}>Weekly Trend 📈</Text>
                <Chip mode="outlined" textStyle={styles.chipText}>
                  Improving ↗️
                </Chip>
              </View>
              
              <View style={styles.weeklyChart}>
                {weeklyData.map((item, index) => (
                  <View key={index} style={styles.chartItem}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: (item.score / 100) * 60,
                          backgroundColor: getScoreColor(item.score),
                        }
                      ]}
                    />
                    <Text style={styles.chartDay}>{item.day}</Text>
                    <Text style={styles.chartScore}>{item.score}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Recovery Tips */}
          <Card style={styles.tipsCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>💡 Recovery Tips</Text>
              <View style={styles.tipItem}>
                <Icon name="local-drink" size={20} color={COLORS.primary} />
                <Text style={styles.tipText}>
                  Stay hydrated - aim for 8-10 glasses of water daily
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="bedtime" size={20} color={COLORS.primary} />
                <Text style={styles.tipText}>
                  Get 7-9 hours of quality sleep for optimal recovery
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Icon name="spa" size={20} color={COLORS.primary} />
                <Text style={styles.tipText}>
                  Include stretching or yoga in your routine
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
        onPress={() => openModal('complete')}
        color="#fff"
      />

      {/* Recovery Entry Modal */}
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
              <Text style={styles.modalTitle}>Log Recovery Data 📝</Text>
              
              {/* Sleep Hours Input */}
              <TextInput
                label="Sleep Hours"
                value={sleepHours}
                onChangeText={setSleepHours}
                keyboardType="decimal-pad"
                style={styles.input}
                left={<TextInput.Icon icon="bedtime" />}
              />

              {/* Rating Selectors */}
              <RatingSelector
                title="Sleep Quality"
                value={sleepQuality}
                onChange={setSleepQuality}
                color={COLORS.primary}
              />

              <RatingSelector
                title="Energy Level"
                value={energyLevel}
                onChange={setEnergyLevel}
                color={COLORS.success}
              />

              <RatingSelector
                title="Stress Level"
                value={stressLevel}
                onChange={setStressLevel}
                color={COLORS.warning}
              />

              <RatingSelector
                title="Muscle Soreness"
                value={soreness}
                onChange={setSoreness}
                color={COLORS.accent}
              />

              {/* Notes Input */}
              <TextInput
                label="Additional Notes"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={styles.input}
                left={<TextInput.Icon icon="note" />}
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
                  onPress={handleSaveRecovery}
                  style={styles.saveButton}
                  buttonColor={COLORS.primary}
                >
                  Save Entry ✅
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
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  recoveryCard: {
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
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  chipText: {
    fontSize: 12,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 24,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  chartDay: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  chartScore: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.text,
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
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    margin: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurContainer: {
    padding: SPACING.xl,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  input: {
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  ratingContainer: {
    marginBottom: SPACING.xl,
  },
  ratingTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  ratingText: {
    fontSize: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 0.4,
  },
  saveButton: {
    flex: 0.55,
  },
});

export default RecoveryTracking;