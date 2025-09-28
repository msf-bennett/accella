import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  Vibration,
  RefreshControl,
  Keyboard,
  KeyboardAvoidingView,
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
  HelperText,
  Badge,
} from 'react-native-paper';
//import { Searchbar,
import { LinearGradient } from '../../components/shared/LinearGradient';
import { BlurView } from '../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';

const CreateTrainingPlan = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isOffline } = useSelector(state => ({
    user: state.auth.user,
    isOffline: state.app.isOffline,
  }));

  const [form, setForm] = useState({
    title: '',
    description: '',
    durationWeeks: '',
    sport: '',
    difficulty: 'intermediate',
    targetAge: '',
    maxParticipants: '',
    tags: [],
    isPublic: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSportModal, setShowSportModal] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Popular sports data
  const popularSports = [
    { id: 'football', name: 'Football', icon: 'soccer', color: '#4CAF50' },
    { id: 'basketball', name: 'Basketball', icon: 'basketball', color: '#FF9800' },
    { id: 'tennis', name: 'Tennis', icon: 'tennis', color: '#2196F3' },
    { id: 'soccer', name: 'Soccer', icon: 'soccer', color: '#8BC34A' },
    { id: 'volleyball', name: 'Volleyball', icon: 'volleyball', color: '#E91E63' },
    { id: 'swimming', name: 'Swimming', icon: 'pool', color: '#00BCD4' },
    { id: 'running', name: 'Running', icon: 'run', color: '#9C27B0' },
    { id: 'gym', name: 'Gym Training', icon: 'jump-rope', color: '#607D8B' },
  ];

  const difficultyLevels = [
    { id: 'beginner', name: 'Beginner', icon: 'looks-one', color: '#4CAF50', description: 'New to the sport' },
    { id: 'intermediate', name: 'Intermediate', icon: 'looks-two', color: '#FF9800', description: 'Some experience' },
    { id: 'advanced', name: 'Advanced', icon: 'looks-3', color: '#F44336', description: 'Experienced athletes' },
    { id: 'professional', name: 'Professional', icon: 'jump-rope', color: '#9C27B0', description: 'Elite level' },
  ];

  // Initialize animations
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Add haptic feedback for better UX
    Vibration.vibrate(10);
  }, [errors]);

  const addTag = useCallback((tag) => {
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  }, [form.tags]);

  const removeTag = useCallback((tagToRemove) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
    Vibration.vibrate(10);
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    
    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (form.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!form.sport.trim()) {
      newErrors.sport = 'Sport selection is required';
    }

    if (!form.durationWeeks || isNaN(form.durationWeeks)) {
      newErrors.durationWeeks = 'Duration must be a valid number';
    } else if (parseInt(form.durationWeeks) < 1 || parseInt(form.durationWeeks) > 52) {
      newErrors.durationWeeks = 'Duration must be between 1 and 52 weeks';
    }

    if (form.targetAge && (isNaN(form.targetAge) || parseInt(form.targetAge) < 5 || parseInt(form.targetAge) > 100)) {
      newErrors.targetAge = 'Target age must be between 5 and 100';
    }

    if (form.maxParticipants && (isNaN(form.maxParticipants) || parseInt(form.maxParticipants) < 1)) {
      newErrors.maxParticipants = 'Max participants must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh data loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      Alert.alert(
        '⚠️ Validation Error',
        'Please fix the highlighted fields before continuing.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      // Simulate API call or local storage
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success haptic feedback
      Vibration.vibrate([0, 200, 100, 200]);

      // Show success with points earned (gamification)
      Alert.alert(
        '🎉 Success!',
        `Training plan "${form.title}" created successfully!\n\n+50 XP earned! 🌟`,
        [
          {
            text: 'View Plan',
            onPress: () => navigation.navigate('TrainingPlanDetails', { planId: 'new' }),
          },
          {
            text: 'Create Another',
            onPress: () => {
              setForm({
                title: '',
                description: '',
                durationWeeks: '',
                sport: '',
                difficulty: 'intermediate',
                targetAge: '',
                maxParticipants: '',
                tags: [],
                isPublic: true,
              });
              setStep(1);
            },
          },
        ]
      );

      // Navigate back or to plans list
      setTimeout(() => {
        navigation.navigate('TrainingPlansList');
      }, 100);

    } catch (error) {
      Alert.alert(
        '❌ Error',
        isOffline 
          ? 'Plan saved locally. Will sync when online.' 
          : 'Failed to create training plan. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  }, [form, validate, isOffline, navigation]);

  const nextStep = useCallback(() => {
    if (step < 3) {
      setStep(step + 1);
      Vibration.vibrate(10);
    }
  }, [step]);

  const prevStep = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
      Vibration.vibrate(10);
    }
  }, [step]);

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((stepNum) => (
        <View key={stepNum} style={styles.stepWrapper}>
          <View style={[
            styles.stepCircle,
            { backgroundColor: stepNum <= step ? COLORS.primary : COLORS.surface }
          ]}>
            <Text style={[
              styles.stepText,
              { color: stepNum <= step ? '#fff' : COLORS.text }
            ]}>
              {stepNum}
            </Text>
          </View>
          {stepNum < 3 && <View style={styles.stepLine} />}
        </View>
      ))}
    </View>
  );

  const renderSportSelection = () => (
    <Portal>
      <Modal
        visible={showSportModal}
        onDismiss={() => setShowSportModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sport</Text>
              <IconButton
                icon="close"
                onPress={() => setShowSportModal(false)}
              />
            </View>
            
            <Searchbar
              placeholder="Search sports..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
            />

            <ScrollView style={styles.sportsGrid}>
              {popularSports
                .filter(sport => 
                  sport.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((sport) => (
                <Card
                  key={sport.id}
                  style={[styles.sportCard, { borderColor: sport.color }]}
                  onPress={() => {
                    handleChange('sport', sport.name);
                    setShowSportModal(false);
                    Vibration.vibrate(50);
                  }}
                >
                  <Card.Content style={styles.sportCardContent}>
                    <Avatar.Icon
                      size={40}
                      icon={sport.icon}
                      style={{ backgroundColor: sport.color }}
                    />
                    <Text style={styles.sportName}>{sport.name}</Text>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderStep1 = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Text style={styles.stepTitle}>📋 Basic Information</Text>
      
      <TextInput
        label="Training Plan Title *"
        value={form.title}
        onChangeText={value => handleChange('title', value)}
        mode="outlined"
        style={styles.input}
        error={!!errors.title}
        left={<TextInput.Icon icon="pencil" />}
        maxLength={50}
      />
      {errors.title && <HelperText type="error" visible>{errors.title}</HelperText>}

      <TextInput
        label="Description"
        value={form.description}
        onChangeText={value => handleChange('description', value)}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
        left={<TextInput.Icon icon="text-box" />}
        maxLength={500}
      />

      <Surface style={styles.sportSelector}>
        <Text style={styles.inputLabel}>Sport *</Text>
        <Button
          mode={form.sport ? "contained" : "outlined"}
          onPress={() => setShowSportModal(true)}
          style={styles.sportButton}
          icon={form.sport ? "check" : "radiobox-marked"}
          contentStyle={{ height: 50 }}
        >
          {form.sport || "Select Sport"}
        </Button>
        {errors.sport && <HelperText type="error" visible>{errors.sport}</HelperText>}
      </Surface>

      <View style={styles.rowInputs}>
        <View style={styles.halfInput}>
          <TextInput
            label="Duration (Weeks) *"
            value={form.durationWeeks}
            onChangeText={value => handleChange('durationWeeks', value)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.durationWeeks}
            left={<TextInput.Icon icon="calendar" />}
          />
          {errors.durationWeeks && (
            <HelperText type="error" visible>{errors.durationWeeks}</HelperText>
          )}
        </View>
        
        <View style={styles.halfInput}>
          <TextInput
            label="Target Age"
            value={form.targetAge}
            onChangeText={value => handleChange('targetAge', value)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.targetAge}
            left={<TextInput.Icon icon="account-multiple" />}
            placeholder="Optional"
          />
          {errors.targetAge && (
            <HelperText type="error" visible>{errors.targetAge}</HelperText>
          )}
        </View>
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>⚙️ Advanced Settings</Text>
      
      <Surface style={styles.difficultySelector}>
        <Text style={styles.inputLabel}>Difficulty Level</Text>
        <View style={styles.difficultyGrid}>
          {difficultyLevels.map((level) => (
            <Chip
              key={level.id}
              selected={form.difficulty === level.id}
              onPress={() => handleChange('difficulty', level.id)}
              style={[
                styles.difficultyChip,
                { backgroundColor: form.difficulty === level.id ? level.color : COLORS.surface }
              ]}
              textStyle={{ 
                color: form.difficulty === level.id ? '#fff' : COLORS.text,
                fontWeight: 'bold'
              }}
              icon={level.icon}
            >
              {level.name}
            </Chip>
          ))}
        </View>
      </Surface>

      <TextInput
        label="Max Participants"
        value={form.maxParticipants}
        onChangeText={value => handleChange('maxParticipants', value)}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
        error={!!errors.maxParticipants}
        left={<TextInput.Icon icon="group" />}
        placeholder="Leave empty for unlimited"
      />
      {errors.maxParticipants && (
        <HelperText type="error" visible>{errors.maxParticipants}</HelperText>
      )}

      <Surface style={styles.tagSelector}>
        <Text style={styles.inputLabel}>Tags</Text>
        <View style={styles.tagsContainer}>
          {form.tags.map((tag, index) => (
            <Chip
              key={index}
              onClose={() => removeTag(tag)}
              style={styles.tag}
            >
              {tag}
            </Chip>
          ))}
        </View>
        <TextInput
          placeholder="Add tags (press enter)"
          mode="outlined"
          style={styles.tagInput}
          onSubmitEditing={(event) => {
            addTag(event.nativeEvent.text);
            event.target.clear();
          }}
        />
      </Surface>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>✅ Review & Publish</Text>
      
      <Card style={styles.reviewCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.reviewHeader}
        >
          <Text style={styles.reviewTitle}>{form.title || 'Untitled Plan'}</Text>
          <Text style={styles.reviewSubtitle}>{form.sport} • {form.durationWeeks} weeks</Text>
        </LinearGradient>
        
        <Card.Content style={styles.reviewContent}>
          <Text style={styles.reviewDescription}>
            {form.description || 'No description provided.'}
          </Text>
          
          <View style={styles.reviewStats}>
            <View style={styles.statItem}>
              <Icon name="protein" size={20} color={COLORS.primary} />
              <Text style={styles.statText}>{form.difficulty}</Text>
            </View>
            {form.targetAge && (
              <View style={styles.statItem}>
                <Icon name="account-multiple" size={20} color={COLORS.primary} />
                <Text style={styles.statText}>Age {form.targetAge}+</Text>
              </View>
            )}
            {form.maxParticipants && (
              <View style={styles.statItem}>
                <Icon name="group" size={20} color={COLORS.primary} />
                <Text style={styles.statText}>Max {form.maxParticipants}</Text>
              </View>
            )}
          </View>

          {form.tags.length > 0 && (
            <View style={styles.reviewTags}>
              {form.tags.map((tag, index) => (
                <Chip key={index} style={styles.reviewTag} compact>
                  {tag}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      <Surface style={styles.publishOptions}>
        <View style={styles.publishRow}>
          <Icon name={form.isPublic ? "public" : "lock"} size={24} color={COLORS.primary} />
          <View style={styles.publishText}>
            <Text style={styles.publishTitle}>
              {form.isPublic ? "Public Plan" : "Private Plan"}
            </Text>
            <Text style={styles.publishSubtext}>
              {form.isPublic 
                ? "Others can discover and use this plan" 
                : "Only you can access this plan"
              }
            </Text>
          </View>
          <Button
            mode={form.isPublic ? "contained" : "outlined"}
            onPress={() => handleChange('isPublic', !form.isPublic)}
            compact
          >
            {form.isPublic ? "Public" : "Private"}
          </Button>
        </View>
      </Surface>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor="#fff"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Create Training Plan</Text>
          {isOffline && <Badge style={styles.offlineBadge}>Offline</Badge>}
        </View>
        
        <ProgressBar
          progress={step / 3}
          color="#fff"
          style={styles.progressBar}
        />
      </LinearGradient>

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
        <Animated.View style={[styles.formContainer, { transform: [{ scale: scaleAnim }] }]}>
          {renderStepIndicator()}
          
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <View style={styles.navigationButtons}>
            {step > 1 && (
              <Button
                mode="outlined"
                onPress={prevStep}
                style={styles.prevButton}
                icon="arrow-back"
              >
                Previous
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                mode="contained"
                onPress={nextStep}
                style={styles.nextButton}
                icon="arrow-right"
                disabled={
                  (step === 1 && (!form.title || !form.sport || !form.durationWeeks)) ||
                  (step === 2 && Object.keys(errors).length > 0)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                icon="check"
              >
                Create Plan
              </Button>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {renderSportSelection()}

      <FAB
        icon="help"
        style={styles.helpFab}
        onPress={() => Alert.alert(
          '💡 Help',
          'Need assistance? Contact support or check our training plan guidelines.',
          [{ text: 'OK', style: 'default' }]
        )}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 40,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  offlineBadge: {
    backgroundColor: '#FF5722',
  },
  progressBar: {
    height: 4,
    marginTop: SPACING.sm,
    borderRadius: 2,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  stepText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  stepContainer: {
    minHeight: 400,
  },
  stepTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  input: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TEXT_STYLES.body2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  sportSelector: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  sportButton: {
    height: 50,
    justifyContent: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  difficultySelector: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  difficultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  difficultyChip: {
    marginBottom: SPACING.sm,
  },
  tagSelector: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  tag: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tagInput: {
    height: 40,
  },
  reviewCard: {
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  reviewHeader: {
    padding: SPACING.lg,
  },
  reviewTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    marginBottom: SPACING.sm,
  },
  reviewSubtitle: {
    ...TEXT_STYLES.body2,
    color: '#fff',
    opacity: 0.8,
  },
  reviewContent: {
    padding: SPACING.lg,
  },
  reviewDescription: {
    ...TEXT_STYLES.body1,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  reviewStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  statText: {
    ...TEXT_STYLES.body2,
    marginLeft: SPACING.sm,
    textTransform: 'capitalize',
  },
  reviewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reviewTag: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  publishOptions: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  publishRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  publishText: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.md,
  },
  publishTitle: {
    ...TEXT_STYLES.body1,
    fontWeight: '600',
    marginBottom: 2,
  },
  publishSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  prevButton: {
    flex: 0.4,
  },
  nextButton: {
    flex: 0.55,
    backgroundColor: COLORS.primary,
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
  },
  searchBar: {
    margin: SPACING.md,
  },
  sportsGrid: {
    padding: SPACING.md,
    maxHeight: 400,
  },
  sportCard: {
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sportCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportName: {
    ...TEXT_STYLES.body1,
    marginLeft: SPACING.md,
    fontWeight: '600',
  },
  helpFab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.secondary,
  },
});

export default CreateTrainingPlan;