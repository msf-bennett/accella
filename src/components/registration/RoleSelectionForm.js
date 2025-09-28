import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { TextInput, Text, RadioButton, HelperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { USER_TYPES } from '../../utils/constants';

const { width: screenWidth } = Dimensions.get('window');

const RoleSelectionForm = ({
  formData,
  onFieldChange,
  onNext,
  onBack,
  errors = {},
  validFields = {},
  theme = 'light'
}) => {
  
  const userTypeOptions = [
    { 
      value: USER_TYPES.PLAYER, 
      label: 'Player', 
      description: 'Follow training programs', 
      icon: 'sports' 
    },
    { 
      value: USER_TYPES.ATHLETE, 
      label: 'Athlete', 
      description: 'Professional or competitive athlete', 
      icon: 'sports' 
    },
    { 
      value: USER_TYPES.COACH, 
      label: 'Coach', 
      description: 'Create and manage training programs', 
      icon: 'sports-handball' 
    },
    { 
      value: USER_TYPES.TRAINER, 
      label: 'Personal Trainer', 
      description: 'Provide one-on-one training', 
      icon: 'fitness-center' 
    },
    { 
      value: USER_TYPES.TRAINEE, 
      label: 'Trainee', 
      description: 'Learning and following training programs', 
      icon: 'fitness-center' 
    },
    { 
      value: USER_TYPES.PARENT, 
      label: 'Parent', 
      description: 'Track and support child\'s progress', 
      icon: 'family-restroom' 
    },
    { 
      value: USER_TYPES.CHILD, 
      label: 'Child Profile', 
      description: 'Youth athlete profile', 
      icon: 'child-care' 
    },
    { 
      value: 'OTHER', 
      label: 'Other', 
      description: 'Specify your role below', 
      icon: 'more-horiz' 
    },
  ];

  const handleInputChange = (field, value) => {
    onFieldChange(field, value);
  };

  const getInputTheme = (field) => {
    const hasError = !!errors[field];
    const isValid = validFields[field];
    
    return {
      colors: {
        primary: isValid ? '#10B981' : hasError ? '#EF4444' : COLORS.primary,
        outline: isValid ? '#10B981' : hasError ? '#EF4444' : COLORS.border,
        onSurfaceVariant: COLORS.textSecondary,
        onSurface: COLORS.inputText 
      }
    };
  };

  const renderStepHeader = () => {
    const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
    
    return (
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Icon name="settings" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.stepTitle}>{fullName || "Account Setup"}</Text>
        <Text style={styles.stepSubtitle}>Choose your role</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderStepHeader()}
      
      <View style={styles.stepContainer}>
        <ScrollView 
          style={styles.stepScrollContainer} 
          contentContainerStyle={styles.stepScrollContentCompact}
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitleCompact}>I am a:</Text>
            <RadioButton.Group
              onValueChange={(value) => handleInputChange('userType', value)}
              value={formData.userType}>
              {userTypeOptions.map((option) => (
                <TouchableOpacity 
                  key={option.value} 
                  style={[
                    styles.userTypeOptionCompact,
                    formData.userType === option.value && styles.userTypeOptionSelected
                  ]}
                  onPress={() => handleInputChange('userType', option.value)}>
                  <View style={styles.userTypeIconContainerCompact}>
                    <Icon 
                      name={option.icon} 
                      size={18} 
                      color={formData.userType === option.value ? '#3B82F6' : '#64748B'} 
                    />
                  </View>
                  <View style={styles.userTypeTextContainer}>
                    <Text style={[
                      styles.userTypeLabelCompact,
                      formData.userType === option.value && styles.userTypeLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={styles.userTypeDescriptionCompact}>{option.description}</Text>
                  </View>
                  <RadioButton value={option.value} color="#3B82F6" />
                </TouchableOpacity>
              ))}
            </RadioButton.Group>

            {formData.userType === 'OTHER' && (
              <View style={styles.customRoleContainer}>
                <TextInput
                  label="Specify your role *"
                  value={formData.customRole}
                  onChangeText={(value) => handleInputChange('customRole', value)}
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g., Sports Academy Owner, Sports Enthusiast, Former Athlete"
                  right={validFields.customRole && (
                    <TextInput.Icon 
                      icon="check-circle" 
                      iconColor="#10B981"
                      size={20}
                    />
                  )}
                  error={!!errors.customRole}
                  theme={getInputTheme('customRole')}
                />
                {errors.customRole && <HelperText type="error" style={styles.errorText}>{errors.customRole}</HelperText>}
              </View>
            )}

            {/* Role Benefits Info */}
            {formData.userType && formData.userType !== 'OTHER' && (
              <View style={styles.roleBenefitsContainer}>
                <Text style={styles.roleBenefitsTitle}>What you'll get:</Text>
                {getRoleBenefits(formData.userType).map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Icon name="check-circle" size={16} color="#10B981" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const getRoleBenefits = (userType) => {
  switch (userType) {
    case USER_TYPES.PLAYER:
    case USER_TYPES.ATHLETE:
      return [
        'Access to personalized training programs',
        'Performance tracking and analytics',
        'Connect with coaches and trainers',
        'Join team challenges and competitions'
      ];
    case USER_TYPES.COACH:
      return [
        'Create and manage training programs',
        'Track multiple athlete progress',
        'Team management tools',
        'Performance analytics dashboard'
      ];
    case USER_TYPES.TRAINER:
      return [
        'Design custom workout plans',
        'One-on-one client management',
        'Progress tracking tools',
        'Exercise library access'
      ];
    case USER_TYPES.PARENT:
      return [
        'Monitor child\'s training progress',
        'Communicate with coaches',
        'Safety and wellness tracking',
        'Family fitness challenges'
      ];
    case USER_TYPES.CHILD:
      return [
        'Age-appropriate training programs',
        'Fun fitness challenges',
        'Safety-focused features',
        'Parent supervision tools'
      ];
    default:
      return [
        'Full access to all features',
        'Customizable experience',
        'Community access',
        'Progress tracking'
      ];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  stepHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  stepIconContainer: {
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  stepContainer: {
    flex: 1,
  },
  stepScrollContainer: {
    flex: 1,
  },
  stepScrollContentCompact: {
    padding: SPACING.lg,
  },
  formSection: {
    flex: 1,
  },
  sectionTitleCompact: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  userTypeOptionCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  userTypeOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#F0F7FF',
  },
  userTypeIconContainerCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  userTypeTextContainer: {
    flex: 1,
  },
  userTypeLabelCompact: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  userTypeLabelSelected: {
    color: '#3B82F6',
  },
  userTypeDescriptionCompact: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  customRoleContainer: {
    marginTop: SPACING.md,
  },
  input: {
    marginBottom: SPACING.sm,
  },
  errorText: {
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  roleBenefitsContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleBenefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
});

export default RoleSelectionForm;