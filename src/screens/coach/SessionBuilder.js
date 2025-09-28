import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  RefreshControl,
  Vibration,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  ProgressBar,
  Portal,
  Modal,
  ActivityIndicator,
  Snackbar,
  Menu,
  Divider,
  TextInput, 
  Text,
  HelperText,
  Switch,
  RadioButton,
} from 'react-native-paper';
import { BlurView } from '../../components/shared/BlurView';
import { LinearGradient } from '../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';

const FOCUS_OPTIONS = [
  { id: 'dribbling', name: 'Dribbling', icon: 'sports-soccer', color: '#FF6B6B' },
  { id: 'passing', name: 'Passing', icon: 'swap-horiz', color: '#4ECDC4' },
  { id: 'shooting', name: 'Shooting', icon: 'gps-fixed', color: '#45B7D1' },
  { id: 'endurance', name: 'Endurance', icon: 'directions-run', color: '#96CEB4' },
  { id: 'tactics', name: 'Tactics', icon: 'psychology', color: '#FECA57' },
  { id: 'strength', name: 'Strength', icon: 'fitness-center', color: '#FF9FF3' },
  { id: 'agility', name: 'Agility', icon: 'flash-on', color: '#54A0FF' },
  { id: 'defending', name: 'Defending', icon: 'security', color: '#5F27CD' },
];

const INTENSITY_LEVELS = [
  { value: 'low', label: 'Low Intensity', color: '#27AE60', description: 'Recovery & technique focus' },
  { value: 'medium', label: 'Medium Intensity', color: '#F39C12', description: 'Balanced training' },
  { value: 'high', label: 'High Intensity', color: '#E74C3C', description: 'Maximum effort required' },
];

const EQUIPMENT_OPTIONS = [
  'Cones', 'Balls', 'Goals', 'Bibs', 'Ladders', 'Hurdles', 'Poles', 'Markers',
];

const AGE_GROUPS = [
  'Under 8', 'Under 10', 'Under 12', 'Under 14', 'Under 16', 'Under 18', 'Senior',
];

const SessionBuilder = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, currentPlan } = useSelector(state => ({
    user: state.auth.user,
    currentPlan: state.training.currentPlan,
  }));

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [session, setSession] = useState({
    id: Date.now().toString(),
    title: '',
    focus: [],
    duration: '',
    intensity: 'medium',
    drills: [],
    notes: '',
    objectives: [],
    equipment: [],
    ageGroup: '',
    playersCount: '',
    warmUp: true,
    coolDown: true,
    videoUrls: [],
    tags: [],
    weatherConsiderations: '',
    safetyNotes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDrill, setNewDrill] = useState({ name: '', description: '', duration: '' });
  const [progress, setProgress] = useState(0);

  // Pre-built drill library
  const [drillLibrary] = useState([
    { id: '1', name: '5v2 Possession', description: 'Maintain possession in small space', duration: '10', focus: 'passing' },
    { id: '2', name: 'Cone Dribbling', description: 'Weave through cones with both feet', duration: '8', focus: 'dribbling' },
    { id: '3', name: 'Shooting Practice', description: '1v1 finishing in the box', duration: '15', focus: 'shooting' },
    { id: '4', name: 'Defensive Positioning', description: 'Maintain compact defensive shape', duration: '12', focus: 'defending' },
  ]);

  const [filteredDrills, setFilteredDrills] = useState(drillLibrary);

  useEffect(() => {
    // Entrance animations
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

    // Calculate progress based on filled fields
    calculateProgress();
  }, [session]);

  const calculateProgress = useCallback(() => {
    const requiredFields = ['title', 'focus', 'duration', 'ageGroup'];
    const filledFields = requiredFields.filter(field => {
      if (field === 'focus') return session.focus.length > 0;
      return session[field] && session[field].toString().trim();
    });
    setProgress(filledFields.length / requiredFields.length);
  }, [session]);

  const handleChange = useCallback((field, value) => {
    setSession(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    Vibration.vibrate(50);
  }, [errors]);

  const handleFocusToggle = useCallback((focusId) => {
    setSession(prev => ({
      ...prev,
      focus: prev.focus.includes(focusId)
        ? prev.focus.filter(id => id !== focusId)
        : [...prev.focus, focusId],
    }));
    Vibration.vibrate(50);
  }, []);

  const addDrill = useCallback(() => {
    if (newDrill.name.trim()) {
      setSession(prev => ({
        ...prev,
        drills: [...prev.drills, { ...newDrill, id: Date.now().toString() }],
      }));
      setNewDrill({ name: '', description: '', duration: '' });
      setShowDrillModal(false);
      Vibration.vibrate(100);
    }
  }, [newDrill]);

  const removeDrill = useCallback((drillId) => {
    setSession(prev => ({
      ...prev,
      drills: prev.drills.filter(drill => drill.id !== drillId),
    }));
    Vibration.vibrate(100);
  }, []);

  const addFromLibrary = useCallback((drill) => {
    const exists = session.drills.some(d => d.id === drill.id);
    if (!exists) {
      setSession(prev => ({
        ...prev,
        drills: [...prev.drills, drill],
      }));
      Vibration.vibrate(100);
    }
  }, [session.drills]);

  const validate = useCallback(() => {
    const newErrors = {};
    
    if (!session.title.trim()) {
      newErrors.title = 'Session title is required';
    }
    
    if (session.focus.length === 0) {
      newErrors.focus = 'At least one focus area is required';
    }
    
    if (!session.duration || isNaN(session.duration) || parseInt(session.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number';
    }
    
    if (!session.ageGroup) {
      newErrors.ageGroup = 'Age group is required';
    }
    
    if (session.playersCount && (isNaN(session.playersCount) || parseInt(session.playersCount) <= 0)) {
      newErrors.playersCount = 'Players count must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [session]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the highlighted fields.');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call or local storage
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dispatch to Redux store
      dispatch({
        type: 'ADD_SESSION',
        payload: {
          ...session,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          planId: currentPlan?.id,
        },
      });

      Vibration.vibrate([100, 50, 100]);
      Alert.alert(
        'Session Created! 🎉',
        `"${session.title}" has been added to your training plan.`,
        [
          {
            text: 'Create Another',
            onPress: () => {
              setSession({
                id: Date.now().toString(),
                title: '',
                focus: [],
                duration: '',
                intensity: 'medium',
                drills: [],
                notes: '',
                objectives: [],
                equipment: [],
                ageGroup: '',
                playersCount: '',
                warmUp: true,
                coolDown: true,
                videoUrls: [],
                tags: [],
                weatherConsiderations: '',
                safetyNotes: '',
              });
              setProgress(0);
            },
          },
          {
            text: 'View Plan',
            onPress: () => navigation.goBack(),
            style: 'default',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save session. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [session, validate, user, currentPlan, dispatch, navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh action
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const filterDrills = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = drillLibrary.filter(drill =>
        drill.name.toLowerCase().includes(query.toLowerCase()) ||
        drill.focus.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDrills(filtered);
    } else {
      setFilteredDrills(drillLibrary);
    }
  }, [drillLibrary]);

  const renderFocusChips = () => (
    <View style={styles.chipGroup}>
      {FOCUS_OPTIONS.map(option => (
        <Chip
          key={option.id}
          selected={session.focus.includes(option.id)}
          onPress={() => handleFocusToggle(option.id)}
          style={[
            styles.chip,
            session.focus.includes(option.id) && { backgroundColor: option.color + '20' }
          ]}
          icon={({ size, color }) => (
            <Icon name={option.icon} size={size} color={color} />
          )}
        >
          {option.name}
        </Chip>
      ))}
    </View>
  );

  const renderIntensitySelector = () => (
    <View style={styles.intensityContainer}>
      {INTENSITY_LEVELS.map(level => (
        <TouchableWithoutFeedback
          key={level.value}
          onPress={() => handleChange('intensity', level.value)}
        >
          <View style={[
            styles.intensityCard,
            session.intensity === level.value && {
              backgroundColor: level.color + '20',
              borderColor: level.color,
            }
          ]}>
            <View style={[styles.intensityIndicator, { backgroundColor: level.color }]} />
            <Text style={styles.intensityLabel}>{level.label}</Text>
            <Text style={styles.intensityDescription}>{level.description}</Text>
            <RadioButton
              value={level.value}
              status={session.intensity === level.value ? 'checked' : 'unchecked'}
              color={level.color}
            />
          </View>
        </TouchableWithoutFeedback>
      ))}
    </View>
  );

  const renderDrillsList = () => (
    <View style={styles.drillsContainer}>
      <View style={styles.drillsHeader}>
        <Text style={styles.sectionTitle}>Training Drills ({session.drills.length})</Text>
        <IconButton
          icon="add"
          size={24}
          iconColor={COLORS.primary}
          onPress={() => setShowDrillModal(true)}
        />
      </View>
      
      {session.drills.map((drill, index) => (
        <Card key={drill.id} style={styles.drillCard}>
          <Card.Content>
            <View style={styles.drillHeader}>
              <Text style={styles.drillName}>{drill.name}</Text>
              <IconButton
                icon="delete"
                size={20}
                iconColor={COLORS.error}
                onPress={() => removeDrill(drill.id)}
              />
            </View>
            {drill.description && (
              <Text style={styles.drillDescription}>{drill.description}</Text>
            )}
            <View style={styles.drillMeta}>
              {drill.duration && (
                <Chip icon="timer" compact style={styles.metaChip}>
                  {drill.duration} min
                </Chip>
              )}
              {drill.focus && (
                <Chip icon="target" compact style={styles.metaChip}>
                  {drill.focus}
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      ))}
      
      {session.drills.length === 0 && (
        <Surface style={styles.emptyState}>
          <Icon name="sports-soccer" size={48} color={COLORS.disabled} />
          <Text style={styles.emptyStateText}>No drills added yet</Text>
          <Text style={styles.emptyStateSubtext}>Tap + to add drills to your session</Text>
        </Surface>
      )}
    </View>
  );

  const renderDrillModal = () => (
    <Portal>
      <Modal
        visible={showDrillModal}
        onDismiss={() => setShowDrillModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Training Drill</Text>
            
            <View style={styles.tabContainer}>
              <Button
                mode="contained"
                onPress={() => {/* Switch to custom drill tab */}}
                style={styles.tabButton}
              >
                Custom Drill
              </Button>
              <Button
                mode="outlined"
                onPress={() => {/* Switch to library tab */}}
                style={styles.tabButton}
              >
                From Library
              </Button>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Custom Drill Form */}
              <TextInput
                label="Drill Name"
                value={newDrill.name}
                onChangeText={value => setNewDrill(prev => ({ ...prev, name: value }))}
                mode="outlined"
                style={styles.modalInput}
              />
              
              <TextInput
                label="Description"
                value={newDrill.description}
                onChangeText={value => setNewDrill(prev => ({ ...prev, description: value }))}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.modalInput}
              />
              
              <TextInput
                label="Duration (minutes)"
                value={newDrill.duration}
                onChangeText={value => setNewDrill(prev => ({ ...prev, duration: value }))}
                keyboardType="numeric"
                mode="outlined"
                style={styles.modalInput}
              />

              <Divider style={styles.modalDivider} />

              {/* Drill Library */}
              <Searchbar
                placeholder="Search drills..."
                onChangeText={filterDrills}
                value={searchQuery}
                style={styles.searchBar}
              />

              {filteredDrills.map(drill => (
                <Card key={drill.id} style={styles.libraryDrillCard}>
                  <Card.Content>
                    <View style={styles.libraryDrillHeader}>
                      <View style={styles.libraryDrillInfo}>
                        <Text style={styles.libraryDrillName}>{drill.name}</Text>
                        <Text style={styles.libraryDrillDescription}>{drill.description}</Text>
                      </View>
                      <IconButton
                        icon="add"
                        size={20}
                        iconColor={COLORS.primary}
                        onPress={() => addFromLibrary(drill)}
                      />
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowDrillModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={addDrill}
                style={styles.modalButton}
                disabled={!newDrill.name.trim()}
              >
                Add Drill
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Session Builder</Text>
            <Avatar.Text
              size={32}
              label={user?.name?.charAt(0) || 'C'}
              style={styles.headerAvatar}
            />
          </View>
          <ProgressBar
            progress={progress}
            color="white"
            style={styles.progressBar}
          />
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
            contentContainerStyle={styles.scrollContent}
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
            {/* Basic Information Card */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>📋 Basic Information</Text>
                
                <TextInput
                  label="Session Title *"
                  value={session.title}
                  onChangeText={value => handleChange('title', value)}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.title}
                  left={<TextInput.Icon icon="edit" />}
                />
                {errors.title && <HelperText type="error">{errors.title}</HelperText>}

                <View style={styles.row}>
                  <TextInput
                    label="Duration (min) *"
                    value={session.duration}
                    onChangeText={value => handleChange('duration', value)}
                    keyboardType="numeric"
                    mode="outlined"
                    style={[styles.input, styles.halfWidth]}
                    error={!!errors.duration}
                    left={<TextInput.Icon icon="timer" />}
                  />
                  <TextInput
                    label="Players Count"
                    value={session.playersCount}
                    onChangeText={value => handleChange('playersCount', value)}
                    keyboardType="numeric"
                    mode="outlined"
                    style={[styles.input, styles.halfWidth]}
                    error={!!errors.playersCount}
                    left={<TextInput.Icon icon="group" />}
                  />
                </View>
                {(errors.duration || errors.playersCount) && (
                  <HelperText type="error">
                    {errors.duration || errors.playersCount}
                  </HelperText>
                )}
              </Card.Content>
            </Card>

            {/* Focus Areas Card */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>🎯 Focus Areas *</Text>
                {renderFocusChips()}
                {errors.focus && <HelperText type="error">{errors.focus}</HelperText>}
              </Card.Content>
            </Card>

            {/* Session Configuration Card */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>⚙️ Session Configuration</Text>
                
                <Text style={styles.label}>Age Group *</Text>
                <View style={styles.chipGroup}>
                  {AGE_GROUPS.map(age => (
                    <Chip
                      key={age}
                      selected={session.ageGroup === age}
                      onPress={() => handleChange('ageGroup', age)}
                      style={styles.chip}
                    >
                      {age}
                    </Chip>
                  ))}
                </View>
                {errors.ageGroup && <HelperText type="error">{errors.ageGroup}</HelperText>}

                <Text style={styles.label}>Intensity Level</Text>
                {renderIntensitySelector()}

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Include Warm-up</Text>
                  <Switch
                    value={session.warmUp}
                    onValueChange={value => handleChange('warmUp', value)}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Include Cool-down</Text>
                  <Switch
                    value={session.coolDown}
                    onValueChange={value => handleChange('coolDown', value)}
                    color={COLORS.primary}
                  />
                </View>
              </Card.Content>
            </Card>

            {/* Equipment Card */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>🏋️ Required Equipment</Text>
                <View style={styles.chipGroup}>
                  {EQUIPMENT_OPTIONS.map(equipment => (
                    <Chip
                      key={equipment}
                      selected={session.equipment.includes(equipment)}
                      onPress={() => {
                        const newEquipment = session.equipment.includes(equipment)
                          ? session.equipment.filter(e => e !== equipment)
                          : [...session.equipment, equipment];
                        handleChange('equipment', newEquipment);
                      }}
                      style={styles.chip}
                    >
                      {equipment}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>

            {/* Drills Section */}
            <Card style={styles.card}>
              <Card.Content>
                {renderDrillsList()}
              </Card.Content>
            </Card>

            {/* Additional Notes Card */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>📝 Additional Information</Text>
                
                <TextInput
                  label="Session Objectives"
                  value={session.notes}
                  onChangeText={value => handleChange('notes', value)}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  placeholder="What should players achieve in this session?"
                />

                <TextInput
                  label="Weather Considerations"
                  value={session.weatherConsiderations}
                  onChangeText={value => handleChange('weatherConsiderations', value)}
                  mode="outlined"
                  style={styles.input}
                  placeholder="Indoor/outdoor adaptations, weather backup plans..."
                />

                <TextInput
                  label="Safety Notes"
                  value={session.safetyNotes}
                  onChangeText={value => handleChange('safetyNotes', value)}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  style={styles.input}
                  placeholder="Important safety considerations for this session"
                />
              </Card.Content>
            </Card>

            <View style={styles.actionContainer}>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
                labelStyle={styles.submitButtonLabel}
              >
                {loading ? 'Creating Session...' : 'Create Session 🚀'}
              </Button>
            </View>
          </ScrollView>
        </Animated.View>

        {renderDrillModal()}

        {!showDrillModal && (
          <FAB
            icon="auto-fix-high"
            label="AI Suggest"
            onPress={() => {
              Alert.alert(
                'AI Session Builder 🤖',
                'This feature will analyze your inputs and suggest optimized drills and structure. Coming soon!',
                [{ text: 'Got it!', style: 'default' }]
              );
            }}
            style={styles.fab}
            color="white"
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  card: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    fontWeight: 'bold',
  },
  label: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
    color: COLORS.text,
    fontWeight: '500',
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  chip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  intensityContainer: {
    marginBottom: SPACING.md,
  },
  intensityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  intensityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  intensityLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    flex: 1,
  },
  intensityDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    flex: 2,
    marginRight: SPACING.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  switchLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  drillsContainer: {
    marginTop: SPACING.sm,
  },
  drillsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: '600',
  },
  drillCard: {
    marginBottom: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  drillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drillName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  drillDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  drillMeta: {
    flexDirection: 'row',
  },
  metaChip: {
    marginRight: SPACING.xs,
    height: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.disabled,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.disabled,
    marginTop: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalInput: {
    marginBottom: SPACING.md,
    backgroundColor: 'transparent',
  },
  modalDivider: {
    marginVertical: SPACING.lg,
    backgroundColor: COLORS.border,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  libraryDrillCard: {
    marginBottom: SPACING.sm,
    borderRadius: 8,
  },
  libraryDrillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  libraryDrillInfo: {
    flex: 1,
  },
  libraryDrillName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  libraryDrillDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  actionContainer: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  submitButton: {
    borderRadius: 12,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonContent: {
    height: 56,
  },
  submitButtonLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
  },
});

export default SessionBuilder;