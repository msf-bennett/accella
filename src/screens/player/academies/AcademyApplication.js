import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Modal,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { launchImageLibrary } from 'react-native-image-picker';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  border: '#e1e8ed',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textLight },
  small: { fontSize: 12, color: COLORS.textLight },
};

const AcademyApplication = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { academy } = route.params || {};
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: null,
    gender: '',
    address: '',
    city: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    previousExperience: '',
    goals: '',
    availability: [],
    skillLevel: '',
    profileImage: null,
  });

  const [errors, setErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [applicationStep, setApplicationStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
  const availabilityOptions = ['Morning', 'Afternoon', 'Evening', 'Weekends'];

  useEffect(() => {
    // Entrance animations
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
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const validateForm = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    } else if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
      if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required';
    } else if (step === 3) {
      if (!formData.skillLevel) newErrors.skillLevel = 'Skill level is required';
      if (formData.availability.length === 0) newErrors.availability = 'At least one availability option is required';
      if (!formData.goals.trim()) newErrors.goals = 'Goals are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm(applicationStep)) {
      if (applicationStep < 3) {
        setApplicationStep(applicationStep + 1);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handlePrevious = () => {
    if (applicationStep > 1) {
      setApplicationStep(applicationStep - 1);
    }
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setFormData(prev => ({
          ...prev,
          profileImage: response.assets[0]
        }));
      }
    });
  };

  const handleSubmit = async () => {
    if (!validateForm(3)) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        '🎉 Application Submitted!',
        'Your application has been sent to the academy. They will review and contact you soon!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = (option) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter(item => item !== option)
        : [...prev.availability, option]
    }));
  };

  const renderProgressIndicator = () => (
    <Surface style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
          Step {applicationStep} of 3
        </Text>
        <Text style={TEXT_STYLES.caption}>
          {applicationStep === 1 && 'Personal Information'}
          {applicationStep === 2 && 'Contact & Emergency Details'}
          {applicationStep === 3 && 'Sports Background & Goals'}
        </Text>
      </View>
      <ProgressBar 
        progress={applicationStep / 3} 
        color={COLORS.primary} 
        style={styles.progressBar}
      />
    </Surface>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[TEXT_STYLES.h2, styles.stepTitle]}>👤 Personal Information</Text>
      
      {/* Profile Image */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={handleImagePicker} style={styles.profileImagePicker}>
          {formData.profileImage ? (
            <Image source={{ uri: formData.profileImage.uri }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Icon name="add-a-photo" size={40} color={COLORS.textLight} />
              <Text style={TEXT_STYLES.caption}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={[styles.input, errors.firstName && styles.inputError]}
          value={formData.firstName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
          placeholder="Enter your first name"
          placeholderTextColor={COLORS.textLight}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={[styles.input, errors.lastName && styles.inputError]}
          value={formData.lastName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
          placeholder="Enter your last name"
          placeholderTextColor={COLORS.textLight}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.textLight}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          value={formData.phone}
          onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          placeholderTextColor={COLORS.textLight}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Date of Birth *</Text>
        <TouchableOpacity
          style={[styles.input, styles.dateInput, errors.dateOfBirth && styles.inputError]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={formData.dateOfBirth ? styles.dateText : styles.placeholderText}>
            {formData.dateOfBirth 
              ? formData.dateOfBirth.toLocaleDateString()
              : 'Select your date of birth'
            }
          </Text>
          <Icon name="calendar-today" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
        {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Gender *</Text>
        <TouchableOpacity
          style={[styles.input, styles.dateInput, errors.gender && styles.inputError]}
          onPress={() => setShowGenderModal(true)}
        >
          <Text style={formData.gender ? styles.dateText : styles.placeholderText}>
            {formData.gender || 'Select your gender'}
          </Text>
          <Icon name="arrow-drop-down" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
      </View>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(date) => {
          setFormData(prev => ({ ...prev, dateOfBirth: date }));
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        maximumDate={new Date()}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[TEXT_STYLES.h2, styles.stepTitle]}>📍 Contact & Emergency Details</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={[styles.input, errors.address && styles.inputError]}
          value={formData.address}
          onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
          placeholder="Enter your full address"
          multiline
          numberOfLines={2}
          placeholderTextColor={COLORS.textLight}
        />
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={[styles.input, errors.city && styles.inputError]}
          value={formData.city}
          onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
          placeholder="Enter your city"
          placeholderTextColor={COLORS.textLight}
        />
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Emergency Contact Name *</Text>
        <TextInput
          style={[styles.input, errors.emergencyContact && styles.inputError]}
          value={formData.emergencyContact}
          onChangeText={(text) => setFormData(prev => ({ ...prev, emergencyContact: text }))}
          placeholder="Enter emergency contact name"
          placeholderTextColor={COLORS.textLight}
        />
        {errors.emergencyContact && <Text style={styles.errorText}>{errors.emergencyContact}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Emergency Contact Phone *</Text>
        <TextInput
          style={[styles.input, errors.emergencyPhone && styles.inputError]}
          value={formData.emergencyPhone}
          onChangeText={(text) => setFormData(prev => ({ ...prev, emergencyPhone: text }))}
          placeholder="Enter emergency contact phone"
          keyboardType="phone-pad"
          placeholderTextColor={COLORS.textLight}
        />
        {errors.emergencyPhone && <Text style={styles.errorText}>{errors.emergencyPhone}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Medical Conditions</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.medicalConditions}
          onChangeText={(text) => setFormData(prev => ({ ...prev, medicalConditions: text }))}
          placeholder="Any medical conditions, allergies, or injuries we should know about? (Optional)"
          multiline
          numberOfLines={3}
          placeholderTextColor={COLORS.textLight}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[TEXT_STYLES.h2, styles.stepTitle]}>⚽ Sports Background & Goals</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Skill Level *</Text>
        <TouchableOpacity
          style={[styles.input, styles.dateInput, errors.skillLevel && styles.inputError]}
          onPress={() => setShowSkillModal(true)}
        >
          <Text style={formData.skillLevel ? styles.dateText : styles.placeholderText}>
            {formData.skillLevel || 'Select your skill level'}
          </Text>
          <Icon name="arrow-drop-down" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
        {errors.skillLevel && <Text style={styles.errorText}>{errors.skillLevel}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Availability *</Text>
        <TouchableOpacity
          style={[styles.input, styles.dateInput, errors.availability && styles.inputError]}
          onPress={() => setShowAvailabilityModal(true)}
        >
          <Text style={formData.availability.length > 0 ? styles.dateText : styles.placeholderText}>
            {formData.availability.length > 0 
              ? formData.availability.join(', ')
              : 'Select your availability'
            }
          </Text>
          <Icon name="arrow-drop-down" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
        {errors.availability && <Text style={styles.errorText}>{errors.availability}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Previous Experience</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.previousExperience}
          onChangeText={(text) => setFormData(prev => ({ ...prev, previousExperience: text }))}
          placeholder="Tell us about your previous sports experience, teams you've played for, achievements, etc. (Optional)"
          multiline
          numberOfLines={3}
          placeholderTextColor={COLORS.textLight}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Goals & Expectations *</Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.goals && styles.inputError]}
          value={formData.goals}
          onChangeText={(text) => setFormData(prev => ({ ...prev, goals: text }))}
          placeholder="What are your goals? What do you hope to achieve by joining this academy?"
          multiline
          numberOfLines={3}
          placeholderTextColor={COLORS.textLight}
        />
        {errors.goals && <Text style={styles.errorText}>{errors.goals}</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            size={24}
            iconColor="#ffffff"
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerText}>
            <Text style={[TEXT_STYLES.h2, { color: '#ffffff' }]}>
              Apply to Academy
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: '#ffffff', opacity: 0.9 }]}>
              {academy?.name || 'Sports Academy'}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
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
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {renderProgressIndicator()}
            
            {applicationStep === 1 && renderStep1()}
            {applicationStep === 2 && renderStep2()}
            {applicationStep === 3 && renderStep3()}
            
            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              {applicationStep > 1 && (
                <Button
                  mode="outlined"
                  onPress={handlePrevious}
                  style={[styles.button, styles.backButton]}
                  labelStyle={styles.buttonLabel}
                >
                  Previous
                </Button>
              )}
              
              {applicationStep < 3 ? (
                <Button
                  mode="contained"
                  onPress={handleNext}
                  style={[styles.button, styles.nextButton]}
                  labelStyle={styles.buttonLabel}
                >
                  Next
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={[styles.button, styles.submitButton]}
                  labelStyle={styles.buttonLabel}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application 🚀'}
                </Button>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <Portal>
        {/* Gender Modal */}
        <Modal
          visible={showGenderModal}
          onDismiss={() => setShowGenderModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>Select Gender</Text>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.modalOption,
                formData.gender === option && styles.selectedOption
              ]}
              onPress={() => {
                setFormData(prev => ({ ...prev, gender: option }));
                setShowGenderModal(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                formData.gender === option && styles.selectedOptionText
              ]}>
                {option}
              </Text>
              {formData.gender === option && (
                <Icon name="check" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Modal>

        {/* Skill Level Modal */}
        <Modal
          visible={showSkillModal}
          onDismiss={() => setShowSkillModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>Select Skill Level</Text>
          {skillLevels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.modalOption,
                formData.skillLevel === level && styles.selectedOption
              ]}
              onPress={() => {
                setFormData(prev => ({ ...prev, skillLevel: level }));
                setShowSkillModal(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                formData.skillLevel === level && styles.selectedOptionText
              ]}>
                {level}
              </Text>
              {formData.skillLevel === level && (
                <Icon name="check" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Modal>

        {/* Availability Modal */}
        <Modal
          visible={showAvailabilityModal}
          onDismiss={() => setShowAvailabilityModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>Select Availability</Text>
          <Text style={[TEXT_STYLES.caption, styles.modalSubtitle]}>
            Choose all times that work for you
          </Text>
          {availabilityOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.modalOption,
                formData.availability.includes(option) && styles.selectedOption
              ]}
              onPress={() => toggleAvailability(option)}
            >
              <Text style={[
                styles.modalOptionText,
                formData.availability.includes(option) && styles.selectedOptionText
              ]}>
                {option}
              </Text>
              {formData.availability.includes(option) && (
                <Icon name="check" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
          <Button
            mode="contained"
            onPress={() => setShowAvailabilityModal(false)}
            style={styles.modalButton}
          >
            Done
          </Button>
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
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: SPACING.md,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  progressContainer: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  profileImagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    elevation: 2,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    color: COLORS.text,
    fontSize: 16,
  },
  placeholderText: {
    color: COLORS.textLight,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  backButton: {
    borderColor: COLORS.primary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
  },
  submitButton: {
    backgroundColor: COLORS.success,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: SPACING.xs,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: 12,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalSubtitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  selectedOption: {
    backgroundColor: `${COLORS.primary}15`,
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
  },
});

export default AcademyApplication;