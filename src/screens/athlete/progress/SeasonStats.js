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
  ImageBackground,
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
  RadioButton,
  Divider,
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
  gold: '#FFD700',
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

const SeasonStart = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Season Setup Data
  const [seasonData, setSeasonData] = useState({
    seasonName: '',
    sport: '',
    startDate: '',
    endDate: '',
    primaryGoal: '',
    secondaryGoals: [],
    targetCompetitions: [],
    baselineFitness: 3,
    injuryHistory: false,
    injuryDetails: '',
    trainingDays: 4,
    preferredTime: 'morning',
    notifications: true,
    publicProfile: false,
  });

  const [goals, setGoals] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  const dispatch = useDispatch();
  const { user, seasons, isLoading } = useSelector(state => ({
    user: state.auth.user || {},
    seasons: state.seasons?.data || [],
    isLoading: state.seasons?.isLoading || false,
  }));

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

    loadSeasonData();
  }, []);

  const loadSeasonData = async () => {
    try {
      // Load previous seasons and user preferences
      console.log('Loading season data...');
    } catch (error) {
      console.error('Error loading season data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSeasonData();
    setRefreshing(false);
  }, []);

  const handleNextStep = () => {
    if (setupStep < 4) {
      setSetupStep(setupStep + 1);
      Vibration.vibrate(25);
      
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePreviousStep = () => {
    if (setupStep > 0) {
      setSetupStep(setupStep - 1);
      Vibration.vibrate(25);
    }
  };

  const handleCompleteSeason = async () => {
    try {
      Vibration.vibrate([100, 50, 100]);
      
      const newSeason = {
        ...seasonData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        goals,
        competitions,
        status: 'active',
      };

      console.log('Creating new season:', newSeason);
      
      Alert.alert(
        '🎉 Season Started!',
        `Welcome to your ${seasonData.seasonName}! Your journey begins now. Let's achieve those goals together! 💪`,
        [
          {
            text: 'View Training Plan',
            onPress: () => navigation.navigate('TrainingPlan'),
          },
          {
            text: 'Start First Session',
            onPress: () => navigation.navigate('WorkoutSession'),
            style: 'default',
          },
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to start season. Please try again.');
    }
  };

  const addGoal = (goalText) => {
    if (goalText.trim()) {
      const newGoal = {
        id: Date.now().toString(),
        text: goalText,
        type: 'custom',
        target: null,
        completed: false,
      };
      setGoals([...goals, newGoal]);
    }
  };

  const addCompetition = (competition) => {
    const newCompetition = {
      id: Date.now().toString(),
      ...competition,
      registered: false,
    };
    setCompetitions([...competitions, newCompetition]);
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    Vibration.vibrate(25);
  };

  const StepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[0, 1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor: step <= setupStep ? COLORS.primary : COLORS.surface,
                borderColor: step <= setupStep ? COLORS.primary : COLORS.textSecondary,
              }
            ]}
          >
            {step < setupStep ? (
              <Icon name="check" size={16} color="#fff" />
            ) : (
              <Text style={[
                styles.stepNumber,
                { color: step <= setupStep ? '#fff' : COLORS.textSecondary }
              ]}>
                {step + 1}
              </Text>
            )}
          </View>
          {step < 4 && (
            <View
              style={[
                styles.stepLine,
                { backgroundColor: step < setupStep ? COLORS.primary : COLORS.textSecondary }
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const GoalCard = ({ goal, onRemove }) => (
    <Surface style={styles.goalCard}>
      <View style={styles.goalContent}>
        <Icon name="flag" size={20} color={COLORS.gold} />
        <Text style={styles.goalText}>{goal.text}</Text>
        <IconButton
          icon="close"
          size={18}
          onPress={onRemove}
          iconColor={COLORS.textSecondary}
        />
      </View>
    </Surface>
  );

  const CompetitionCard = ({ competition, onRemove }) => (
    <Surface style={styles.competitionCard}>
      <View style={styles.competitionContent}>
        <Icon name="jump-rope" size={20} color={COLORS.gold} />
        <View style={styles.competitionInfo}>
          <Text style={styles.competitionName}>{competition.name}</Text>
          <Text style={styles.competitionDate}>{competition.date}</Text>
        </View>
        <IconButton
          icon="close"
          size={18}
          onPress={onRemove}
          iconColor={COLORS.textSecondary}
        />
      </View>
    </Surface>
  );

  const renderStepContent = () => {
    switch (setupStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>🏆 Season Overview</Text>
            <Text style={styles.stepDescription}>
              Let's set up your new season! First, tell us about your sport and timeline.
            </Text>
            
            <TextInput
              label="Season Name"
              value={seasonData.seasonName}
              onChangeText={(text) => setSeasonData({ ...seasonData, seasonName: text })}
              style={styles.input}
              left={<TextInput.Icon icon="sports" />}
              placeholder="e.g., 2024 Basketball Season"
            />

            <TextInput
              label="Sport"
              value={seasonData.sport}
              onChangeText={(text) => setSeasonData({ ...seasonData, sport: text })}
              style={styles.input}
              left={<TextInput.Icon icon="sports-basketball" />}
              placeholder="e.g., Basketball, Soccer, Tennis"
            />

            <View style={styles.dateInputs}>
              <TextInput
                label="Start Date"
                value={seasonData.startDate}
                onChangeText={(text) => setSeasonData({ ...seasonData, startDate: text })}
                style={[styles.input, { flex: 0.48 }]}
                left={<TextInput.Icon icon="calendar-today" />}
                placeholder="MM/DD/YYYY"
              />
              <TextInput
                label="End Date"
                value={seasonData.endDate}
                onChangeText={(text) => setSeasonData({ ...seasonData, endDate: text })}
                style={[styles.input, { flex: 0.48 }]}
                left={<TextInput.Icon icon="event" />}
                placeholder="MM/DD/YYYY"
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>🎯 Goals & Objectives</Text>
            <Text style={styles.stepDescription}>
              What do you want to achieve this season? Set clear, measurable goals.
            </Text>

            <TextInput
              label="Primary Goal"
              value={seasonData.primaryGoal}
              onChangeText={(text) => setSeasonData({ ...seasonData, primaryGoal: text })}
              style={styles.input}
              left={<TextInput.Icon icon="flag" />}
              placeholder="e.g., Improve 5K time by 2 minutes"
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Additional Goals</Text>
              <Button
                mode="outlined"
                onPress={() => openModal('addGoal')}
                icon="add"
                style={styles.addButton}
              >
                Add Goal
              </Button>
            </View>

            <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onRemove={() => setGoals(goals.filter(g => g.id !== goal.id))}
                />
              ))}
            </ScrollView>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>🏅 Competition Schedule</Text>
            <Text style={styles.stepDescription}>
              Add important competitions, tournaments, or events you're preparing for.
            </Text>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Target Competitions</Text>
              <Button
                mode="outlined"
                onPress={() => openModal('addCompetition')}
                icon="add"
                style={styles.addButton}
              >
                Add Event
              </Button>
            </View>

            <ScrollView style={styles.competitionsList} showsVerticalScrollIndicator={false}>
              {competitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  onRemove={() => setCompetitions(competitions.filter(c => c.id !== competition.id))}
                />
              ))}
              {competitions.length === 0 && (
                <Surface style={styles.emptyState}>
                  <Icon name="jump-rope" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.emptyText}>No competitions added yet</Text>
                  <Text style={styles.emptySubtext}>Add your target events to track progress</Text>
                </Surface>
              )}
            </ScrollView>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>💪 Fitness Assessment</Text>
            <Text style={styles.stepDescription}>
              Help us understand your current fitness level and training preferences.
            </Text>

            <View style={styles.assessmentSection}>
              <Text style={styles.assessmentLabel}>Current Fitness Level</Text>
              <View style={styles.fitnessScale}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.fitnessButton,
                      {
                        backgroundColor: seasonData.baselineFitness === level
                          ? COLORS.primary : COLORS.surface,
                        borderColor: COLORS.primary,
                      }
                    ]}
                    onPress={() => {
                      setSeasonData({ ...seasonData, baselineFitness: level });
                      Vibration.vibrate(25);
                    }}
                  >
                    <Text style={[
                      styles.fitnessText,
                      {
                        color: seasonData.baselineFitness === level
                          ? '#fff' : COLORS.primary
                      }
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.scaleLabel}>Beginner → Elite</Text>
            </View>

            <View style={styles.injurySection}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Recent Injury History</Text>
                <Switch
                  value={seasonData.injuryHistory}
                  onValueChange={(value) => setSeasonData({ ...seasonData, injuryHistory: value })}
                  color={COLORS.primary}
                />
              </View>
              
              {seasonData.injuryHistory && (
                <TextInput
                  label="Injury Details"
                  value={seasonData.injuryDetails}
                  onChangeText={(text) => setSeasonData({ ...seasonData, injuryDetails: text })}
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                  left={<TextInput.Icon icon="healing" />}
                  placeholder="Please describe any recent injuries or limitations"
                />
              )}
            </View>

            <View style={styles.trainingPrefs}>
              <Text style={styles.prefsLabel}>Training Days per Week</Text>
              <View style={styles.daysSelector}>
                {[3, 4, 5, 6, 7].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.daysButton,
                      {
                        backgroundColor: seasonData.trainingDays === days
                          ? COLORS.success : COLORS.surface,
                        borderColor: COLORS.success,
                      }
                    ]}
                    onPress={() => {
                      setSeasonData({ ...seasonData, trainingDays: days });
                      Vibration.vibrate(25);
                    }}
                  >
                    <Text style={[
                      styles.daysText,
                      {
                        color: seasonData.trainingDays === days
                          ? '#fff' : COLORS.success
                      }
                    ]}>
                      {days}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>⚙️ Final Settings</Text>
            <Text style={styles.stepDescription}>
              Last step! Configure your preferences and privacy settings.
            </Text>

            <View style={styles.preferencesSection}>
              <Text style={styles.prefsLabel}>Preferred Training Time</Text>
              <RadioButton.Group
                onValueChange={(value) => setSeasonData({ ...seasonData, preferredTime: value })}
                value={seasonData.preferredTime}
              >
                <View style={styles.radioOption}>
                  <RadioButton value="morning" color={COLORS.primary} />
                  <Text style={styles.radioLabel}>Morning (6-10 AM)</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="afternoon" color={COLORS.primary} />
                  <Text style={styles.radioLabel}>Afternoon (12-4 PM)</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="evening" color={COLORS.primary} />
                  <Text style={styles.radioLabel}>Evening (5-9 PM)</Text>
                </View>
              </RadioButton.Group>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingsSection}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Training Notifications</Text>
                  <Text style={styles.switchSubtext}>Get reminders for workouts and goals</Text>
                </View>
                <Switch
                  value={seasonData.notifications}
                  onValueChange={(value) => setSeasonData({ ...seasonData, notifications: value })}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Public Profile</Text>
                  <Text style={styles.switchSubtext}>Allow others to see your progress</Text>
                </View>
                <Switch
                  value={seasonData.publicProfile}
                  onValueChange={(value) => setSeasonData({ ...seasonData, publicProfile: value })}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <Surface style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>🎯 Season Summary</Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Season: </Text>{seasonData.seasonName || 'Not set'}
              </Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Sport: </Text>{seasonData.sport || 'Not set'}
              </Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Goals: </Text>{goals.length + (seasonData.primaryGoal ? 1 : 0)} total
              </Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Competitions: </Text>{competitions.length} events
              </Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Training: </Text>{seasonData.trainingDays} days/week
              </Text>
            </Surface>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>New Season Setup 🚀</Text>
            <Text style={styles.headerSubtitle}>Let's plan your journey to success</Text>
          </View>
          <IconButton
            icon="help-outline"
            size={28}
            iconColor="#fff"
            onPress={() => Alert.alert('💡 Help', 'Follow the steps to set up your new season. You can always edit these settings later in your profile.')}
          />
        </View>
        <StepIndicator />
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
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
            />
          }
        >
          {renderStepContent()}

          <View style={styles.navigationButtons}>
            {setupStep > 0 && (
              <Button
                mode="outlined"
                onPress={handlePreviousStep}
                icon="arrow-back"
                style={styles.navButton}
              >
                Previous
              </Button>
            )}
            
            {setupStep < 4 ? (
              <Button
                mode="contained"
                onPress={handleNextStep}
                icon="arrow-forward"
                style={[styles.navButton, { backgroundColor: COLORS.primary }]}
                disabled={
                  (setupStep === 0 && (!seasonData.seasonName || !seasonData.sport)) ||
                  (setupStep === 1 && !seasonData.primaryGoal)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleCompleteSeason}
                icon="rocket-launch"
                style={[styles.navButton, { backgroundColor: COLORS.success }]}
              >
                Start Season! 🎉
              </Button>
            )}
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>
      </Animated.View>

      {/* Add Goal Modal */}
      <Portal>
        <Modal
          visible={showModal && modalType === 'addGoal'}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <AddGoalModal
            onAdd={addGoal}
            onClose={() => setShowModal(false)}
          />
        </Modal>
      </Portal>

      {/* Add Competition Modal */}
      <Portal>
        <Modal
          visible={showModal && modalType === 'addCompetition'}
          onDismiss={() => setShowModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <AddCompetitionModal
            onAdd={addCompetition}
            onClose={() => setShowModal(false)}
          />
        </Modal>
      </Portal>
    </View>
  );
};

// Modal Components
const AddGoalModal = ({ onAdd, onClose }) => {
  const [goalText, setGoalText] = useState('');

  const handleAdd = () => {
    if (goalText.trim()) {
      onAdd(goalText);
      setGoalText('');
      onClose();
    }
  };

  return (
    <BlurView style={styles.modalContent} blurType="light" blurAmount={10}>
      <Text style={styles.modalTitle}>Add New Goal 🎯</Text>
      
      <TextInput
        label="Goal Description"
        value={goalText}
        onChangeText={setGoalText}
        style={styles.modalInput}
        placeholder="e.g., Run a sub-3:30 marathon"
        left={<TextInput.Icon icon="flag" />}
      />

      <View style={styles.modalActions}>
        <Button mode="outlined" onPress={onClose} style={styles.modalButton}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleAdd}
          style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
          disabled={!goalText.trim()}
        >
          Add Goal
        </Button>
      </View>
    </BlurView>
  );
};

const AddCompetitionModal = ({ onAdd, onClose }) => {
  const [competition, setCompetition] = useState({
    name: '',
    date: '',
    location: '',
    type: 'race',
  });

  const handleAdd = () => {
    if (competition.name.trim() && competition.date.trim()) {
      onAdd(competition);
      setCompetition({ name: '', date: '', location: '', type: 'race' });
      onClose();
    }
  };

  return (
    <BlurView style={styles.modalContent} blurType="light" blurAmount={10}>
      <Text style={styles.modalTitle}>Add Competition 🏅</Text>
      
      <TextInput
        label="Competition Name"
        value={competition.name}
        onChangeText={(text) => setCompetition({ ...competition, name: text })}
        style={styles.modalInput}
        placeholder="e.g., Boston Marathon"
        left={<TextInput.Icon icon="jump-rope" />}
      />

      <TextInput
        label="Date"
        value={competition.date}
        onChangeText={(text) => setCompetition({ ...competition, date: text })}
        style={styles.modalInput}
        placeholder="MM/DD/YYYY"
        left={<TextInput.Icon icon="calendar-today" />}
      />

      <TextInput
        label="Location (Optional)"
        value={competition.location}
        onChangeText={(text) => setCompetition({ ...competition, location: text })}
        style={styles.modalInput}
        placeholder="e.g., Boston, MA"
        left={<TextInput.Icon icon="location-on" />}
      />

      <View style={styles.modalActions}>
        <Button mode="outlined" onPress={onClose} style={styles.modalButton}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleAdd}
          style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
          disabled={!competition.name.trim() || !competition.date.trim()}
        >
          Add Event
        </Button>
      </View>
    </BlurView>
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
    marginBottom: SPACING.xl,
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.md,
  },
  stepContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  stepTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stepDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  input: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  addButton: {
    borderColor: COLORS.primary,
  },
  goalsList: {
    maxHeight: 200,
  },
  goalCard: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 1,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  goalText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    flex: 1,
    marginLeft: SPACING.md,
  },
  competitionsList: {
    maxHeight: 200,
  },
  competitionCard: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 1,
  },
  competitionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  competitionInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  competitionName: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  competitionDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontWeight: '600',
  },
  emptySubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  assessmentSection: {
    marginBottom: SPACING.xl,
  },
  assessmentLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  fitnessScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  fitnessButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fitnessText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  scaleLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  injurySection: {
    marginBottom: SPACING.xl,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  switchLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  switchSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  trainingPrefs: {
    marginBottom: SPACING.lg,
  },
  prefsLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  daysSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  daysButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  preferencesSection: {
    marginBottom: SPACING.xl,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  radioLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  divider: {
    marginVertical: SPACING.lg,
    backgroundColor: COLORS.textSecondary,
    opacity: 0.2,
  },
  settingsSection: {
    marginBottom: SPACING.xl,
  },
  summaryCard: {
    padding: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  summaryTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  summaryText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  navButton: {
    flex: 0.45,
  },
  modalContainer: {
    margin: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContent: {
    padding: SPACING.xl,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalInput: {
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 0.45,
  },
});

export default SeasonStats;