import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  IconButton,
  Surface,
  RadioButton,
  Switch,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const ExerciseForm = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { exercise = null, isEditing = false } = route.params || {};
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'strength',
    difficulty: 'beginner',
    equipment: 'Bodyweight',
    targetMuscles: [],
    instructions: [''],
    tips: [''],
    sets: '3',
    reps: '10-12',
    restTime: '60',
    duration: '',
    calories: '',
    isPublic: false,
    videoUrl: '',
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Constants
  const categories = [
    { value: 'strength', label: 'Strength Training', icon: 'fitness-center' },
    { value: 'cardio', label: 'Cardiovascular', icon: 'directions-run' },
    { value: 'flexibility', label: 'Flexibility & Mobility', icon: 'self-improvement' },
    { value: 'sports', label: 'Sports Specific', icon: 'sports-football' },
    { value: 'recovery', label: 'Recovery & Rehabilitation', icon: 'spa' },
    { value: 'functional', label: 'Functional Training', icon: 'accessibility' },
  ];

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner', color: COLORS.success, description: 'New to exercise' },
    { value: 'intermediate', label: 'Intermediate', color: '#FF9500', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', color: COLORS.error, description: 'Experienced athlete' },
  ];

  const equipmentOptions = [
    'Bodyweight', 'Dumbbells', 'Barbell', 'Kettlebells', 'Resistance Bands',
    'Medicine Ball', 'Cable Machine', 'Smith Machine', 'Bench', 'Pull-up Bar',
    'Yoga Mat', 'Foam Roller', 'Suspension Trainer', 'Battle Ropes', 'Plyometric Box',
    'Treadmill', 'Stationary Bike', 'Rowing Machine', 'Elliptical', 'Other'
  ];

  const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
    'Core', 'Abs', 'Obliques', 'Lower Back', 'Glutes', 'Quadriceps',
    'Hamstrings', 'Calves', 'Hip Flexors', 'Full Body', 'Cardiovascular'
  ];

  // Initialize form with existing exercise data
  useEffect(() => {
    if (isEditing && exercise) {
      setFormData({
        name: exercise.name || '',
        description: exercise.description || '',
        category: exercise.category || 'strength',
        difficulty: exercise.difficulty || 'beginner',
        equipment: exercise.equipment || 'Bodyweight',
        targetMuscles: exercise.muscleGroups || [],
        instructions: exercise.instructions || [''],
        tips: exercise.tips || [''],
        sets: exercise.sets || '3',
        reps: exercise.reps || '10-12',
        restTime: exercise.restTime || '60 seconds',
        duration: exercise.duration || '',
        calories: exercise.calories?.toString() || '',
        isPublic: exercise.isPublic || false,
        videoUrl: exercise.videoUrl || '',
        images: exercise.images || [],
      });
    }
  }, [exercise, isEditing]);

  // Animation setup
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
    ]).start();
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Exercise name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.targetMuscles.length === 0) {
      newErrors.targetMuscles = 'Select at least one target muscle';
    }

    if (formData.instructions.filter(inst => inst.trim()).length === 0) {
      newErrors.instructions = 'Add at least one instruction';
    }

    if (formData.calories && isNaN(parseInt(formData.calories))) {
      newErrors.calories = 'Calories must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      // Clean up form data
      const cleanedData = {
        ...formData,
        instructions: formData.instructions.filter(inst => inst.trim()),
        tips: formData.tips.filter(tip => tip.trim()),
        calories: formData.calories ? parseInt(formData.calories) : null,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isEditing) {
        // dispatch(updateExercise({ id: exercise.id, data: cleanedData }));
        Alert.alert('Success', 'Exercise updated successfully! 🎉');
      } else {
        // dispatch(createExercise(cleanedData));
        Alert.alert('Success', 'Exercise created successfully! 🎉');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save exercise. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle muscle group toggle
  const toggleMuscleGroup = (muscle) => {
    setFormData(prev => ({
      ...prev,
      targetMuscles: prev.targetMuscles.includes(muscle)
        ? prev.targetMuscles.filter(m => m !== muscle)
        : [...prev.targetMuscles, muscle]
    }));
  };

  // Handle instruction changes
  const updateInstruction = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addInstruction = () => {
    setFormData(prev => ({ 
      ...prev, 
      instructions: [...prev.instructions, ''] 
    }));
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, instructions: newInstructions }));
    }
  };

  // Handle tips changes
  const updateTip = (index, value) => {
    const newTips = [...formData.tips];
    newTips[index] = value;
    setFormData(prev => ({ ...prev, tips: newTips }));
  };

  const addTip = () => {
    setFormData(prev => ({ 
      ...prev, 
      tips: [...prev.tips, ''] 
    }));
  };

  const removeTip = (index) => {
    if (formData.tips.length > 1) {
      const newTips = formData.tips.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, tips: newTips }));
    }
  };

  // Handle image selection
  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add an image',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: () => {
            Alert.alert('Feature Coming Soon', 'Camera integration will be available soon! 📸');
          }
        },
        { 
          text: 'Gallery', 
          onPress: () => {
            Alert.alert('Feature Coming Soon', 'Gallery integration will be available soon! 🖼️');
          }
        },
      ]
    );
  };

  // Render section header
  const renderSectionHeader = (title, icon, required = false) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Icon name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
        {required && <Text style={styles.requiredAsterisk}>*</Text>}
      </View>
      <Divider style={styles.sectionDivider} />
    </View>
  );

  // Render form input
  const renderTextInput = (
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    keyboardType = 'default',
    required = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {required && <Text style={styles.requiredAsterisk}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textArea,
          errors[label.toLowerCase().replace(/\s/g, '')] && styles.inputError
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
      />
      {errors[label.toLowerCase().replace(/\s/g, '')] && (
        <Text style={styles.errorText}>{errors[label.toLowerCase().replace(/\s/g, '')]}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Exercise' : 'Create Exercise'} 💪
          </Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSubmit}
            disabled={isSaving}
          >
            <Icon name={isSaving ? "hourglass-empty" : "check"} size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Basic Information Section */}
          <Surface style={styles.section} elevation={2}>
            {renderSectionHeader('Basic Information', 'info', true)}
            
            {renderTextInput(
              'Exercise Name',
              formData.name,
              (text) => setFormData(prev => ({ ...prev, name: text })),
              'Enter exercise name...',
              false,
              'default',
              true
            )}

            {renderTextInput(
              'Description',
              formData.description,
              (text) => setFormData(prev => ({ ...prev, description: text })),
              'Brief description of the exercise...',
              true,
              'default',
              true
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Video URL (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.videoUrl}
                onChangeText={(text) => setFormData(prev => ({ ...prev, videoUrl: text }))}
                placeholder="https://example.com/video.mp4"
                placeholderTextColor="#999"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            {/* Image Upload Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Exercise Images</Text>
              <TouchableOpacity
                style={styles.imageUploadButton}
                onPress={handleImagePicker}
              >
                <Icon name="add-photo-alternate" size={24} color={COLORS.primary} />
                <Text style={styles.imageUploadText}>Add Images</Text>
              </TouchableOpacity>
              
              {formData.images.length > 0 && (
                <ScrollView horizontal style={styles.imagePreview}>
                  {formData.images.map((image, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri: image }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => {
                          const newImages = formData.images.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, images: newImages }));
                        }}
                      >
                        <Icon name="close" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </Surface>

          {/* Category & Difficulty Section */}
          <Surface style={styles.section} elevation={2}>
            {renderSectionHeader('Category & Difficulty', 'category')}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.categoryCard,
                      formData.category === category.value && styles.selectedCategoryCard
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: category.value }))}
                  >
                    <Icon 
                      name={category.icon} 
                      size={24} 
                      color={formData.category === category.value ? 'white' : COLORS.primary}
                    />
                    <Text style={[
                      styles.categoryText,
                      formData.category === category.value && styles.selectedCategoryText
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Difficulty Level</Text>
              {difficultyLevels.map(level => (
                <TouchableOpacity
                  key={level.value}
                  style={styles.difficultyOption}
                  onPress={() => setFormData(prev => ({ ...prev, difficulty: level.value }))}
                >
                  <RadioButton
                    value={level.value}
                    status={formData.difficulty === level.value ? 'checked' : 'unchecked'}
                    color={level.color}
                  />
                  <View style={styles.difficultyInfo}>
                    <Text style={[styles.difficultyLabel, { color: level.color }]}>
                      {level.label}
                    </Text>
                    <Text style={styles.difficultyDescription}>{level.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Surface>

          {/* Equipment & Target Muscles Section */}
          <Surface style={styles.section} elevation={2}>
            {renderSectionHeader('Equipment & Target Muscles', 'fitness-center', true)}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Equipment Required</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.equipmentRow}>
                  {equipmentOptions.map(equipment => (
                    <Chip
                      key={equipment}
                      selected={formData.equipment === equipment}
                      onPress={() => setFormData(prev => ({ ...prev, equipment }))}
                      style={[
                        styles.equipmentChip,
                        formData.equipment === equipment && styles.selectedEquipmentChip
                      ]}
                      textStyle={[
                        styles.equipmentChipText,
                        formData.equipment === equipment && styles.selectedEquipmentChipText
                      ]}
                    >
                      {equipment}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Target Muscle Groups
                <Text style={styles.requiredAsterisk}> *</Text>
              </Text>
              <View style={styles.muscleGrid}>
                {muscleGroups.map(muscle => (
                  <Chip
                    key={muscle}
                    selected={formData.targetMuscles.includes(muscle)}
                    onPress={() => toggleMuscleGroup(muscle)}
                    style={[
                      styles.muscleChip,
                      formData.targetMuscles.includes(muscle) && styles.selectedMuscleChip
                    ]}
                    textStyle={[
                      styles.muscleChipText,
                      formData.targetMuscles.includes(muscle) && styles.selectedMuscleChipText
                    ]}
                  >
                    {muscle}
                  </Chip>
                ))}
              </View>
              {errors.targetMuscles && (
                <Text style={styles.errorText}>{errors.targetMuscles}</Text>
              )}
            </View>
          </Surface>

          {/* Exercise Parameters Section */}
          <Surface style={styles.section} elevation={2}>
            {renderSectionHeader('Exercise Parameters', 'tune')}
            
            <View style={styles.parametersRow}>
              <View style={styles.parameterItem}>
                {renderTextInput(
                  'Sets',
                  formData.sets,
                  (text) => setFormData(prev => ({ ...prev, sets: text })),
                  '3',
                  false,
                  'numeric'
                )}
              </View>
              <View style={styles.parameterItem}>
                {renderTextInput(
                  'Reps',
                  formData.reps,
                  (text) => setFormData(prev => ({ ...prev, reps: text })),
                  '10-12',
                  false,
                  'default'
                )}
              </View>
            </View>

            <View style={styles.parametersRow}>
              <View style={styles.parameterItem}>
                {renderTextInput(
                  'Rest Time',
                  formData.restTime,
                  (text) => setFormData(prev => ({ ...prev, restTime: text })),
                  '60 seconds',
                  false,
                  'default'
                )}
              </View>
              <View style={styles.parameterItem}>
                {renderTextInput(
                  'Calories/Set',
                  formData.calories,
                  (text) => setFormData(prev => ({ ...prev, calories: text })),
                  '10',
                  false,
                  'numeric'
                )}
              </View>
            </View>

            {renderTextInput(
              'Duration (Optional)',
              formData.duration,
              (text) => setFormData(prev => ({ ...prev, duration: text })),
              'e.g., 30 seconds hold, 1 minute plank...',
              false,
              'default'
            )}
          </Surface>

          {/* Instructions Section */}
          <Surface style={styles.section} elevation={2}>
            {renderSectionHeader('Exercise Instructions', 'list', true)}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Step-by-step instructions
                <Text style={styles.requiredAsterisk}> *</Text>
              </Text>
              {formData.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionHeader}>
                    <Text style={styles.instructionNumber}>Step {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => removeInstruction(index)}
                      style={styles.removeButton}
                      disabled={formData.instructions.length === 1}
                    >
                      <Icon 
                        name="remove-circle" 
                        size={20} 
                        color={formData.instructions.length === 1 ? '#ccc' : COLORS.error} 
                      />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.textInput, styles.instructionInput]}
                    value={instruction}
                    onChangeText={(text) => updateInstruction(index, text)}
                    placeholder="Describe this step clearly..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={2}
                  />
                </View>
              ))}
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={addInstruction}
              >
                <Icon name="add-circle" size={20} color={COLORS.primary} />
                <Text style={styles.addButtonText}>Add Another Step</Text>
              </TouchableOpacity>
              
              {errors.instructions && (
                <Text style={styles.errorText}>{errors.instructions}</Text>
              )}
            </View>
          </Surface>

          {/* Tips & Notes Section */}
          <Surface style={styles.section} elevation={2}>
            {renderSectionHeader('Pro Tips & Safety Notes', 'lightbulb-outline')}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pro Tips (Optional)</Text>
              {formData.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={styles.tipHeader}>
                    <Text style={styles.tipNumber}>Tip {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => removeTip(index)}
                      style={styles.removeButton}
                      disabled={formData.tips.length === 1}
                    >
                      <Icon 
                        name="remove-circle" 
                        size={20} 
                        color={formData.tips.length === 1 ? '#ccc' : COLORS.error} 
                      />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.textInput, styles.tipInput]}
                    value={tip}
                    onChangeText={(text) => updateTip(index, text)}
                    placeholder="Share a helpful tip or safety note..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={2}
                  />
                </View>
              ))}
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={addTip}
              >
                <Icon name="add-circle" size={20} color={COLORS.primary} />
                <Text style={styles.addButtonText}>Add Another Tip</Text>
              </TouchableOpacity>
            </View>
          </Surface>

          {/* Privacy & Publishing Section */}
          <Surface style={styles.section} elevation={2}>
            {renderSectionHeader('Privacy & Sharing', 'privacy-tip')}
            
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Make this exercise public</Text>
                <Text style={styles.switchDescription}>
                  Other trainers can discover and use this exercise
                </Text>
              </View>
              <Switch
                value={formData.isPublic}
                onValueChange={(value) => setFormData(prev => ({ ...prev, isPublic: value }))}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={formData.isPublic ? 'white' : '#f4f3f4'}
              />
            </View>
          </Surface>

          {/* Save Button */}
          <View style={styles.saveSection}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={isSaving}
              style={styles.saveButtonLarge}
              labelStyle={styles.saveButtonLabel}
              icon={isSaving ? "hourglass-empty" : (isEditing ? "update" : "save")}
            >
              {isSaving 
                ? 'Saving...' 
                : isEditing 
                ? 'Update Exercise' 
                : 'Create Exercise'
              }
            </Button>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  saveButton: {
    padding: SPACING.sm,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    backgroundColor: 'white',
    padding: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: SPACING.sm,
  },
  requiredAsterisk: {
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
  sectionDivider: {
    backgroundColor: '#eee',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: '#333',
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: SPACING.lg,
    backgroundColor: '#f8f9fa',
  },
  imageUploadText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  imagePreview: {
    marginTop: SPACING.md,
  },
  imageContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - SPACING.lg * 4) / 2,
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: SPACING.sm,
    backgroundColor: '#f8f9fa',
  },
  selectedCategoryCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.caption,
    color: '#333',
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  difficultyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  difficultyInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  difficultyLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  difficultyDescription: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: SPACING.xs,
  },
  equipmentRow: {
    flexDirection: 'row',
    paddingRight: SPACING.lg,
  },
  equipmentChip: {
    marginRight: SPACING.sm,
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  selectedEquipmentChip: {
    backgroundColor: COLORS.primary,
  },
  equipmentChipText: {
    color: '#333',
    fontSize: 12,
  },
  selectedEquipmentChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  selectedMuscleChip: {
    backgroundColor: COLORS.primary,
  },
  muscleChipText: {
    color: '#333',
    fontSize: 12,
  },
  selectedMuscleChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  parametersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  parameterItem: {
    flex: 0.48,
  },
  instructionItem: {
    marginBottom: SPACING.md,
  },
  instructionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  instructionNumber: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  instructionInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginTop: SPACING.sm,
  },
  addButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  tipItem: {
    marginBottom: SPACING.md,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipNumber: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  tipInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  switchInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  switchLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: '#333',
  },
  switchDescription: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: SPACING.xs,
  },
  saveSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  saveButtonLarge: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
};

export default ExerciseForm;