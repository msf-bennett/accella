import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  StatusBar,
  Alert,
  RefreshControl,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Vibration,
  Animated,
} from 'react-native';
import {
  Card,
  Button,
  Avatar,
  IconButton,
  Surface,
  ProgressBar,
  Chip,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/Theme';

const PersonalInfo = ({ navigation }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Redux state
  const { user, loading, error } = useSelector(state => state.auth);
  const { profile, profileLoading } = useSelector(state => state.profile);

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    fitnessLevel: '',
    goals: [],
    medicalConditions: '',
    emergencyContact: '',
    emergencyPhone: '',
  });
  const [errors, setErrors] = useState({});

  // Initialize form data
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        height: profile.height || '',
        weight: profile.weight || '',
        fitnessLevel: profile.fitnessLevel || 'beginner',
        goals: profile.goals || [],
        medicalConditions: profile.medicalConditions || '',
        emergencyContact: profile.emergencyContact || '',
        emergencyPhone: profile.emergencyPhone || '',
      });
    }
  }, [profile]);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Screen options
  useEffect(() => {
    navigation.setOptions({
      title: 'Personal Information',
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        ...TEXT_STYLES.h2,
        color: '#fff',
      },
      headerRight: () => (
        <IconButton
          icon={isEditing ? 'check' : 'pencil'}
          iconColor="#fff"
          size={24}
          onPress={handleEditToggle}
        />
      ),
    });
  }, [navigation, isEditing]);

  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
      Vibration.vibrate(50);
    }
  }, [isEditing]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (formData.height && (isNaN(formData.height) || formData.height <= 0)) {
      newErrors.height = 'Height must be a valid number';
    }
    if (formData.weight && (isNaN(formData.weight) || formData.weight <= 0)) {
      newErrors.weight = 'Weight must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    try {
      if (!validateForm()) {
        Alert.alert('Validation Error', 'Please check your inputs and try again.');
        return;
      }

      // Dispatch update action
      dispatch({
        type: 'UPDATE_PROFILE_REQUEST',
        payload: formData,
      });

      setIsEditing(false);
      Vibration.vibrate([50, 100, 50]);

      Alert.alert(
        'Success! 🎉',
        'Your personal information has been updated successfully.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  }, [formData, validateForm, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      dispatch({ type: 'FETCH_PROFILE_REQUEST' });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleGoalToggle = useCallback((goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
  }, []);

  const fitnessLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const availableGoals = [
    'weight_loss',
    'muscle_gain',
    'endurance',
    'strength',
    'flexibility',
    'general_fitness',
    'sports_performance',
    'rehabilitation',
  ];

  const renderInputField = (label, field, options = {}) => {
    const {
      multiline = false,
      keyboardType = 'default',
      placeholder,
      maxLength,
      editable = isEditing,
    } = options;

    return (
      <Surface style={styles.inputContainer} elevation={1}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={[
            styles.textInput,
            multiline && styles.multilineInput,
            errors[field] && styles.inputError,
            !editable && styles.disabledInput,
          ]}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          multiline={multiline}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={editable}
          placeholderTextColor={COLORS.secondary}
        />
        {errors[field] && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </Surface>
    );
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
    >
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() => isEditing && setShowImagePicker(true)}
        disabled={!isEditing}
      >
        <Avatar.Image
          size={120}
          source={
            profile?.avatar
              ? { uri: profile.avatar }
              : require('../../../assets/images/default-avatar.png')
          }
          style={styles.avatar}
        />
        {isEditing && (
          <View style={styles.cameraIcon}>
            <Icon name="camera-alt" size={20} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.userName}>
        {formData.firstName} {formData.lastName}
      </Text>
      <Text style={styles.userRole}>Fitness Trainee 💪</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {profile?.completedWorkouts || 0}
          </Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {profile?.currentStreak || 0}
          </Text>
          <Text style={styles.statLabel}>Day Streak 🔥</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {profile?.totalPoints || 0}
          </Text>
          <Text style={styles.statLabel}>Points ⭐</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderFitnessLevel = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Fitness Level 📊</Text>
        <View style={styles.chipContainer}>
          {fitnessLevels.map((level) => (
            <Chip
              key={level}
              selected={formData.fitnessLevel === level}
              onPress={() => isEditing && handleInputChange('fitnessLevel', level)}
              style={[
                styles.chip,
                formData.fitnessLevel === level && styles.selectedChip,
              ]}
              textStyle={[
                styles.chipText,
                formData.fitnessLevel === level && styles.selectedChipText,
              ]}
              disabled={!isEditing}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderGoals = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Fitness Goals 🎯</Text>
        <View style={styles.chipContainer}>
          {availableGoals.map((goal) => (
            <Chip
              key={goal}
              selected={formData.goals.includes(goal)}
              onPress={() => isEditing && handleGoalToggle(goal)}
              style={[
                styles.chip,
                formData.goals.includes(goal) && styles.selectedChip,
              ]}
              textStyle={[
                styles.chipText,
                formData.goals.includes(goal) && styles.selectedChipText,
              ]}
              disabled={!isEditing}
            >
              {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderProgressSection = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Profile Completion 📈</Text>
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={0.85}
            color={COLORS.success}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>85% Complete</Text>
        </View>
        <Text style={styles.progressSubtext}>
          Complete your profile to unlock personalized training recommendations! 🚀
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading || profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.primary}
          translucent
        />
        <ProgressBar indeterminate color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />
      
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
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              progressBackgroundColor="#fff"
            />
          }
        >
          {renderProfileHeader()}
          
          {renderProgressSection()}
          
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Basic Information 👤</Text>
              {renderInputField('First Name', 'firstName', { placeholder: 'John' })}
              {renderInputField('Last Name', 'lastName', { placeholder: 'Doe' })}
              {renderInputField('Email', 'email', {
                keyboardType: 'email-address',
                placeholder: 'john.doe@example.com',
              })}
              {renderInputField('Phone', 'phone', {
                keyboardType: 'phone-pad',
                placeholder: '+1 (555) 123-4567',
              })}
              {renderInputField('Date of Birth', 'dateOfBirth', {
                placeholder: 'MM/DD/YYYY',
              })}
            </Card.Content>
          </Card>

          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Physical Information 📏</Text>
              {renderInputField('Height (cm)', 'height', {
                keyboardType: 'numeric',
                placeholder: '175',
              })}
              {renderInputField('Weight (kg)', 'weight', {
                keyboardType: 'numeric',
                placeholder: '70',
              })}
            </Card.Content>
          </Card>

          {renderFitnessLevel()}
          {renderGoals()}

          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Health Information 🏥</Text>
              {renderInputField('Medical Conditions', 'medicalConditions', {
                multiline: true,
                placeholder: 'List any medical conditions, injuries, or allergies...',
                maxLength: 500,
              })}
            </Card.Content>
          </Card>

          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Emergency Contact 🚨</Text>
              {renderInputField('Emergency Contact Name', 'emergencyContact', {
                placeholder: 'Jane Doe',
              })}
              {renderInputField('Emergency Contact Phone', 'emergencyPhone', {
                keyboardType: 'phone-pad',
                placeholder: '+1 (555) 987-6543',
              })}
            </Card.Content>
          </Card>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </Animated.View>

      {/* Image Picker Modal */}
      <Portal>
        <Modal
          visible={showImagePicker}
          onDismiss={() => setShowImagePicker(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          >
            <Text style={styles.modalTitle}>Change Profile Picture</Text>
            <View style={styles.modalButtonContainer}>
              <Button
                mode="contained"
                onPress={() => {
                  // Handle camera selection
                  setShowImagePicker(false);
                  Alert.alert('Feature Coming Soon', 'Camera functionality will be available in the next update! 📸');
                }}
                style={styles.modalButton}
                icon="camera"
              >
                Take Photo
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  // Handle gallery selection
                  setShowImagePicker(false);
                  Alert.alert('Feature Coming Soon', 'Gallery functionality will be available in the next update! 🖼️');
                }}
                style={styles.modalButton}
                icon="image"
              >
                Choose from Gallery
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowImagePicker(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
            </View>
          </BlurView>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    ...TEXT_STYLES.body1,
    marginTop: SPACING.md,
    textAlign: 'center',
    color: COLORS.secondary,
  },
  headerGradient: {
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    backgroundColor: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  userRole: {
    ...TEXT_STYLES.body1,
    color: '#fff',
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  sectionCard: {
    margin: SPACING.md,
    elevation: 3,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  inputLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  textInput: {
    ...TEXT_STYLES.body1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 0,
    color: COLORS.text,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderBottomColor: COLORS.error,
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: '#f5f5f5',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.secondary,
  },
  selectedChipText: {
    color: '#fff',
  },
  progressContainer: {
    marginVertical: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  progressText: {
    ...TEXT_STYLES.body2,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  progressSubtext: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    color: COLORS.secondary,
    fontStyle: 'italic',
  },
  modalContainer: {
    margin: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurView: {
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalButtonContainer: {
    width: '100%',
  },
  modalButton: {
    marginVertical: SPACING.xs,
  },
};

export default PersonalInfo;