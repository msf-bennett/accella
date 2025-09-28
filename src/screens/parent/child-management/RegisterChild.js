import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from 'react-native-image-picker';
import { COLORS } from '../../../styles/colors';

const { width, height } = Dimensions.get('window');

const RegisterChild = ({ navigation, route }) => {
  const { isEditing, childData } = route.params || {};
  
  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: childData?.firstName || '',
    lastName: childData?.lastName || '',
    nickname: childData?.nickname || '',
    dateOfBirth: childData?.dateOfBirth || new Date(),
    gender: childData?.gender || '',
    profilePhoto: childData?.profilePhoto || null,
    
    // Contact & Emergency
    schoolName: childData?.schoolName || '',
    schoolGrade: childData?.schoolGrade || '',
    emergencyContact: childData?.emergencyContact || '',
    emergencyPhone: childData?.emergencyPhone || '',
    emergencyRelation: childData?.emergencyRelation || '',
    allergies: childData?.allergies || '',
    medicalConditions: childData?.medicalConditions || '',
    medications: childData?.medications || '',
    
    // Sports & Interests
    primarySport: childData?.primarySport || '',
    secondarySports: childData?.secondarySports || [],
    skillLevel: childData?.skillLevel || '',
    experience: childData?.experience || '',
    previousCoaches: childData?.previousCoaches || '',
    achievements: childData?.achievements || '',
    
    // Goals & Preferences
    goals: childData?.goals || [],
    preferredTrainingDays: childData?.preferredTrainingDays || [],
    preferredTrainingTime: childData?.preferredTrainingTime || '',
    trainingFrequency: childData?.trainingFrequency || '',
    budget: childData?.budget || '',
    specialRequests: childData?.specialRequests || '',
    
    // Physical Information
    height: childData?.height || '',
    weight: childData?.weight || '',
    dominantHand: childData?.dominantHand || '',
    fitnessLevel: childData?.fitnessLevel || '',
    injuries: childData?.injuries || '',
  });
  
  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Options data
  const genderOptions = ['Male', 'Female', 'Other'];
  const gradeOptions = ['Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  const sportsOptions = [
    'Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics', 'Volleyball',
    'Baseball', 'Soccer', 'Hockey', 'Gymnastics', 'Martial Arts', 'Boxing',
    'Cycling', 'Golf', 'Rugby', 'Cricket', 'Badminton', 'Table Tennis'
  ];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const experienceOptions = ['Less than 1 year', '1-2 years', '3-5 years', '5+ years'];
  const goalOptions = [
    'Learn Basic Skills', 'Improve Technique', 'Build Fitness', 'Competition Training',
    'Professional Development', 'Fun & Recreation', 'Social Skills', 'Discipline',
    'Confidence Building', 'Weight Management', 'Injury Recovery', 'Team Sport Skills'
  ];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['Morning (6AM-10AM)', 'Mid-Morning (10AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-8PM)'];
  const frequencyOptions = ['1 session/week', '2 sessions/week', '3 sessions/week', '4+ sessions/week'];
  const budgetRanges = ['Under KSh 5,000', 'KSh 5,000-10,000', 'KSh 10,000-20,000', 'KSh 20,000+'];
  const fitnessLevels = ['Poor', 'Fair', 'Good', 'Excellent'];
  const dominantHandOptions = ['Right', 'Left', 'Ambidextrous'];
  const emergencyRelations = ['Mother', 'Father', 'Guardian', 'Grandparent', 'Sibling', 'Other'];

  const scrollViewRef = useRef();

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const toggleArrayField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (calculateAge(formData.dateOfBirth) < 4 || calculateAge(formData.dateOfBirth) > 18) {
          newErrors.dateOfBirth = 'Age must be between 4 and 18 years';
        }
        break;
      case 2:
        if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
        if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required';
        if (!formData.emergencyRelation) newErrors.emergencyRelation = 'Emergency contact relation is required';
        break;
      case 3:
        if (!formData.primarySport) newErrors.primarySport = 'Primary sport is required';
        if (!formData.skillLevel) newErrors.skillLevel = 'Skill level is required';
        if (!formData.experience) newErrors.experience = 'Experience level is required';
        break;
      case 4:
        if (formData.goals.length === 0) newErrors.goals = 'Please select at least one goal';
        if (formData.preferredTrainingDays.length === 0) newErrors.preferredTrainingDays = 'Please select preferred training days';
        if (!formData.trainingFrequency) newErrors.trainingFrequency = 'Training frequency is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleImagePicker = () => {
    const options = {
      title: 'Select Profile Photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      updateFormData('profilePhoto', {
        uri: response.uri,
        type: response.type,
        name: response.fileName || 'profile.jpg',
      });
      setShowImagePicker(false);
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success!',
        `${formData.firstName} has been ${isEditing ? 'updated' : 'registered'} successfully.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5].map(step => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.stepCircleActive,
            currentStep === step && styles.stepCircleCurrent
          ]}>
            {currentStep > step ? (
              <Icon name="checkmark" size={16} color="#fff" />
            ) : (
              <Text style={[
                styles.stepNumber,
                currentStep >= step && styles.stepNumberActive
              ]}>
                {step}
              </Text>
            )}
          </View>
          {step < 5 && (
            <View style={[
              styles.stepLine,
              currentStep > step && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepDescription}>Let's start with the basic details</Text>

      {/* Profile Photo */}
      <View style={styles.photoSection}>
        <Text style={styles.fieldLabel}>Profile Photo</Text>
        <TouchableOpacity 
          style={styles.photoContainer}
          onPress={() => setShowImagePicker(true)}
        >
          {formData.profilePhoto ? (
            <Image source={{ uri: formData.profilePhoto.uri }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Icon name="camera" size={40} color="#ccc" />
              <Text style={styles.photoPlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Name Fields */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>First Name *</Text>
        <TextInput
          style={[styles.textInput, errors.firstName && styles.inputError]}
          value={formData.firstName}
          onChangeText={(text) => updateFormData('firstName', text)}
          placeholder="Enter first name"
          placeholderTextColor="#999"
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Last Name *</Text>
        <TextInput
          style={[styles.textInput, errors.lastName && styles.inputError]}
          value={formData.lastName}
          onChangeText={(text) => updateFormData('lastName', text)}
          placeholder="Enter last name"
          placeholderTextColor="#999"
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Nickname (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.nickname}
          onChangeText={(text) => updateFormData('nickname', text)}
          placeholder="What do friends call them?"
          placeholderTextColor="#999"
        />
      </View>

      {/* Date of Birth */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Date of Birth *</Text>
        <TouchableOpacity 
          style={[styles.dateButton, errors.dateOfBirth && styles.inputError]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {formData.dateOfBirth.toLocaleDateString()} (Age: {calculateAge(formData.dateOfBirth)})
          </Text>
          <Icon name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>
        {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
      </View>

      {/* Gender */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Gender *</Text>
        <View style={styles.optionsContainer}>
          {genderOptions.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                formData.gender === option && styles.optionButtonSelected
              ]}
              onPress={() => updateFormData('gender', option)}
            >
              <Text style={[
                styles.optionText,
                formData.gender === option && styles.optionTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
      </View>
    </View>
  );

  const renderContactInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Contact & Medical</Text>
      <Text style={styles.stepDescription}>Emergency contacts and health information</Text>

      {/* School Information */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>School Name</Text>
        <TextInput
          style={styles.textInput}
          value={formData.schoolName}
          onChangeText={(text) => updateFormData('schoolName', text)}
          placeholder="Enter school name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Grade/Class</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.optionsContainer}>
            {gradeOptions.map(grade => (
              <TouchableOpacity
                key={grade}
                style={[
                  styles.optionButton,
                  formData.schoolGrade === grade && styles.optionButtonSelected
                ]}
                onPress={() => updateFormData('schoolGrade', grade)}
              >
                <Text style={[
                  styles.optionText,
                  formData.schoolGrade === grade && styles.optionTextSelected
                ]}>
                  {grade}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Emergency Contact */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Emergency Contact Name *</Text>
        <TextInput
          style={[styles.textInput, errors.emergencyContact && styles.inputError]}
          value={formData.emergencyContact}
          onChangeText={(text) => updateFormData('emergencyContact', text)}
          placeholder="Full name of emergency contact"
          placeholderTextColor="#999"
        />
        {errors.emergencyContact && <Text style={styles.errorText}>{errors.emergencyContact}</Text>}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Emergency Phone *</Text>
        <TextInput
          style={[styles.textInput, errors.emergencyPhone && styles.inputError]}
          value={formData.emergencyPhone}
          onChangeText={(text) => updateFormData('emergencyPhone', text)}
          placeholder="+254 7XX XXX XXX"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />
        {errors.emergencyPhone && <Text style={styles.errorText}>{errors.emergencyPhone}</Text>}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Relationship *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.optionsContainer}>
            {emergencyRelations.map(relation => (
              <TouchableOpacity
                key={relation}
                style={[
                  styles.optionButton,
                  formData.emergencyRelation === relation && styles.optionButtonSelected
                ]}
                onPress={() => updateFormData('emergencyRelation', relation)}
              >
                <Text style={[
                  styles.optionText,
                  formData.emergencyRelation === relation && styles.optionTextSelected
                ]}>
                  {relation}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {errors.emergencyRelation && <Text style={styles.errorText}>{errors.emergencyRelation}</Text>}
      </View>

      {/* Medical Information */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Allergies</Text>
        <TextInput
          style={styles.textArea}
          value={formData.allergies}
          onChangeText={(text) => updateFormData('allergies', text)}
          placeholder="List any known allergies..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Medical Conditions</Text>
        <TextInput
          style={styles.textArea}
          value={formData.medicalConditions}
          onChangeText={(text) => updateFormData('medicalConditions', text)}
          placeholder="Any medical conditions we should know about..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Current Medications</Text>
        <TextInput
          style={styles.textArea}
          value={formData.medications}
          onChangeText={(text) => updateFormData('medications', text)}
          placeholder="List current medications..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderSportsInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Sports & Experience</Text>
      <Text style={styles.stepDescription}>Tell us about their sports background</Text>

      {/* Primary Sport */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Primary Sport *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.optionsContainer}>
            {sportsOptions.map(sport => (
              <TouchableOpacity
                key={sport}
                style={[
                  styles.optionButton,
                  formData.primarySport === sport && styles.optionButtonSelected
                ]}
                onPress={() => updateFormData('primarySport', sport)}
              >
                <Text style={[
                  styles.optionText,
                  formData.primarySport === sport && styles.optionTextSelected
                ]}>
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {errors.primarySport && <Text style={styles.errorText}>{errors.primarySport}</Text>}
      </View>

      {/* Secondary Sports */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Secondary Sports (Optional)</Text>
        <Text style={styles.fieldDescription}>Select any other sports they play</Text>
        <View style={styles.multiSelectContainer}>
          {sportsOptions.filter(sport => sport !== formData.primarySport).map(sport => (
            <TouchableOpacity
              key={sport}
              style={[
                styles.multiSelectOption,
                formData.secondarySports.includes(sport) && styles.multiSelectOptionSelected
              ]}
              onPress={() => toggleArrayField('secondarySports', sport)}
            >
              <Text style={[
                styles.multiSelectText,
                formData.secondarySports.includes(sport) && styles.multiSelectTextSelected
              ]}>
                {sport}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Skill Level */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Current Skill Level *</Text>
        <View style={styles.optionsContainer}>
          {skillLevels.map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                formData.skillLevel === level && styles.optionButtonSelected
              ]}
              onPress={() => updateFormData('skillLevel', level)}
            >
              <Text style={[
                styles.optionText,
                formData.skillLevel === level && styles.optionTextSelected
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.skillLevel && <Text style={styles.errorText}>{errors.skillLevel}</Text>}
      </View>

      {/* Experience */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Years of Experience *</Text>
        <View style={styles.optionsContainer}>
          {experienceOptions.map(exp => (
            <TouchableOpacity
              key={exp}
              style={[
                styles.optionButton,
                formData.experience === exp && styles.optionButtonSelected
              ]}
              onPress={() => updateFormData('experience', exp)}
            >
              <Text style={[
                styles.optionText,
                formData.experience === exp && styles.optionTextSelected
              ]}>
                {exp}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.experience && <Text style={styles.errorText}>{errors.experience}</Text>}
      </View>

      {/* Previous Coaches */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Previous Coaches/Clubs</Text>
        <TextInput
          style={styles.textArea}
          value={formData.previousCoaches}
          onChangeText={(text) => updateFormData('previousCoaches', text)}
          placeholder="List previous coaches or clubs they've trained with..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Achievements */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Achievements & Awards</Text>
        <TextInput
          style={styles.textArea}
          value={formData.achievements}
          onChangeText={(text) => updateFormData('achievements', text)}
          placeholder="Any awards, competitions won, or notable achievements..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderGoalsPreferences = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Goals & Preferences</Text>
      <Text style={styles.stepDescription}>What are you hoping to achieve?</Text>

      {/* Goals */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Training Goals *</Text>
        <Text style={styles.fieldDescription}>Select all that apply</Text>
        <View style={styles.multiSelectContainer}>
          {goalOptions.map(goal => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.multiSelectOption,
                formData.goals.includes(goal) && styles.multiSelectOptionSelected
              ]}
              onPress={() => toggleArrayField('goals', goal)}
            >
              <Text style={[
                styles.multiSelectText,
                formData.goals.includes(goal) && styles.multiSelectTextSelected
              ]}>
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.goals && <Text style={styles.errorText}>{errors.goals}</Text>}
      </View>

      {/* Preferred Training Days */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Preferred Training Days *</Text>
        <View style={styles.multiSelectContainer}>
          {daysOfWeek.map(day => (
            <TouchableOpacity
              key={day}
              style={[
                styles.multiSelectOption,
                formData.preferredTrainingDays.includes(day) && styles.multiSelectOptionSelected
              ]}
              onPress={() => toggleArrayField('preferredTrainingDays', day)}
            >
              <Text style={[
                styles.multiSelectText,
                formData.preferredTrainingDays.includes(day) && styles.multiSelectTextSelected
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.preferredTrainingDays && <Text style={styles.errorText}>{errors.preferredTrainingDays}</Text>}
      </View>

      {/* Preferred Training Time */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Preferred Training Time</Text>
        <View style={styles.optionsContainer}>
          {timeSlots.map(time => (
            <TouchableOpacity
              key={time}
              style={[
                styles.optionButton,
                formData.preferredTrainingTime === time && styles.optionButtonSelected
              ]}
              onPress={() => updateFormData('preferredTrainingTime', time)}
            >
              <Text style={[
                styles.optionText,
                formData.preferredTrainingTime === time && styles.optionTextSelected
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Training Frequency */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Desired Training Frequency *</Text>
        <View style={styles.optionsContainer}>
          {frequencyOptions.map(freq => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.optionButton,
                formData.trainingFrequency === freq && styles.optionButtonSelected
              ]}
              onPress={() => updateFormData('trainingFrequency', freq)}
            >
              <Text style={[
                styles.optionText,
                formData.trainingFrequency === freq && styles.optionTextSelected
              ]}>
                {freq}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.trainingFrequency && <Text style={styles.errorText}>{errors.trainingFrequency}</Text>}
      </View>

      {/* Budget */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Monthly Training Budget</Text>
        <View style={styles.optionsContainer}>
          {budgetRanges.map(budget => (
            <TouchableOpacity
              key={budget}
              style={[
                styles.optionButton,
                formData.budget === budget && styles.optionButtonSelected
              ]}
              onPress={() => updateFormData('budget', budget)}
            >
              <Text style={[
                styles.optionText,
                formData.budget === budget && styles.optionTextSelected
              ]}>
                {budget}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Special Requests */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Special Requests or Notes</Text>
        <TextInput
          style={styles.textArea}
          value={formData.specialRequests}
          onChangeText={(text) => updateFormData('specialRequests', text)}
          placeholder="Any specific requirements or preferences for training..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderPhysicalInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Physical Information</Text>
      <Text style={styles.stepDescription}>Help us create the best training plan</Text>

      {/* Height & Weight */}
      <View style={styles.rowContainer}>
        <View style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.fieldLabel}>Height (cm)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.height}
            onChangeText={(text) => updateFormData('height', text)}
            placeholder="160"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.fieldContainer, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.fieldLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.weight}
            onChangeText={(text) => updateFormData('weight', text)}
            placeholder="50"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Dominant Hand */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Dominant Hand</Text>
        <View style={styles.optionsContainer}>
          {dominantHandOptions.map(hand => (
            <TouchableOpacity
              key={hand}
              style={[
                styles.optionButton,
                formData.dominantHand === hand && styles.optionButtonSelected
              ]}
              onPress={() => updateFormData('dominantHand', hand)}
            >
              <Text style={[
                styles.optionText,
                formData.dominantHand === hand && styles.optionTextSelected
              ]}>
                {hand}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fitness Level */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Current Fitness Level</Text>
        <View style={styles.optionsContainer}>
          {fitnessLevels.map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                formData.fitnessLevel === level && styles.optionButtonSelected
              ]}
              onPress={() => updateFormData('fitnessLevel', level)}
            >
              <Text style={[
                styles.optionText,
                formData.fitnessLevel === level && styles.optionTextSelected
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Injuries */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Previous/Current Injuries</Text>
        <TextInput
          style={styles.textArea}
          value={formData.injuries}
          onChangeText={(text) => updateFormData('injuries', text)}
          placeholder="Describe any past or current injuries that might affect training..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Review Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Registration Summary</Text>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>Child:</Text>
          <Text style={styles.summaryValue}>
            {formData.firstName} {formData.lastName} ({calculateAge(formData.dateOfBirth)} years)
          </Text>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>Primary Sport:</Text>
          <Text style={styles.summaryValue}>{formData.primarySport}</Text>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>Skill Level:</Text>
          <Text style={styles.summaryValue}>{formData.skillLevel}</Text>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>Training Goals:</Text>
          <Text style={styles.summaryValue}>{formData.goals.join(', ')}</Text>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>Preferred Days:</Text>
          <Text style={styles.summaryValue}>{formData.preferredTrainingDays.join(', ')}</Text>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryLabel}>Training Frequency:</Text>
          <Text style={styles.summaryValue}>{formData.trainingFrequency}</Text>
        </View>
        
        {formData.budget && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Budget:</Text>
            <Text style={styles.summaryValue}>{formData.budget}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const ImagePickerModal = () => (
    <Modal
      visible={showImagePicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowImagePicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.imagePickerModal}>
          <Text style={styles.modalTitle}>Select Profile Photo</Text>
          
          <TouchableOpacity 
            style={styles.imagePickerOption}
            onPress={() => {
              // Camera option
              handleImagePicker();
            }}
          >
            <Icon name="camera" size={24} color={COLORS.primary} />
            <Text style={styles.imagePickerText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.imagePickerOption}
            onPress={() => {
              // Gallery option
              handleImagePicker();
            }}
          >
            <Icon name="image" size={24} color={COLORS.primary} />
            <Text style={styles.imagePickerText}>Choose from Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowImagePicker(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderContactInfo();
      case 3:
        return renderSportsInfo();
      case 4:
        return renderGoalsPreferences();
      case 5:
        return renderPhysicalInfo();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Child Profile' : 'Register Child'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <TouchableOpacity 
            style={styles.previousBtn}
            onPress={handlePrevious}
          >
            <Icon name="chevron-back" size={20} color={COLORS.primary} />
            <Text style={styles.previousBtnText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.stepInfo}>
          <Text style={styles.stepInfoText}>
            Step {currentStep} of 5
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.nextBtn,
            currentStep === 1 && !formData.firstName && styles.nextBtnDisabled
          ]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>
                {currentStep === 5 ? (isEditing ? 'Update' : 'Register') : 'Next'}
              </Text>
              {currentStep < 5 && <Icon name="chevron-forward" size={20} color="#fff" />}
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.dateOfBirth}
          mode="date"
          display="default"
          maximumDate={new Date()}
          minimumDate={new Date(new Date().getFullYear() - 18, 0, 1)}
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) {
              updateFormData('dateOfBirth', date);
            }
          }}
        />
      )}

      <ImagePickerModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepCircleCurrent: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e9ecef',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoContainer: {
    marginTop: 10,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  fieldDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 80,
  },
  inputError: {
    borderColor: '#ff4757',
  },
  errorText: {
    fontSize: 12,
    color: '#ff4757',
    marginTop: 5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  multiSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  multiSelectOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  multiSelectOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  multiSelectText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  multiSelectTextSelected: {
    color: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  summarySection: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  previousBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  previousBtnText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 5,
  },
  stepInfo: {
    flex: 1,
    alignItems: 'center',
  },
  stepInfoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextBtnDisabled: {
    backgroundColor: '#ccc',
  },
  nextBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  imagePickerModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 10,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default RegisterChild;