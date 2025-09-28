import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';

const { width: screenWidth } = Dimensions.get('window');

const RegistrationProgress = ({
  currentStep,
  formData,
  theme = 'light'
}) => {
  
  // Calculate step completion
  const isStepCompleted = (step) => {
    switch (step) {
      case 0: // Auth method selection
        return formData.authMethod !== null;
      case 1: // Personal info
        return formData.firstName && formData.lastName && formData.email && formData.username && 
               isValidEmail(formData.email) && isValidUsername(formData.username) && 
               isValidName(formData.firstName) && isValidName(formData.lastName);
      case 2: // Role selection
        return formData.userType && (formData.userType !== 'OTHER' || formData.customRole?.trim());
      case 3: // Security questions
        return formData.securityQuestion && formData.securityAnswer?.trim().length >= 2;
      case 4: // Password
        return formData.password && formData.confirmPassword && 
               isValidPassword(formData.password) && 
               isValidConfirmPassword(formData.password, formData.confirmPassword);
      default:
        return false;
    }
  };

  // Validation helper functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidName = (name) => {
    return name?.trim().length >= 2;
  };

  const isValidUsername = (username) => {
    return username?.trim().length >= 3;
  };

  const isValidPassword = (password) => {
    return password?.length >= 6;
  };

  const isValidConfirmPassword = (password, confirmPassword) => {
    return confirmPassword && password === confirmPassword;
  };

  // Enhanced progress calculation with field-level tracking
  const getPersonalizedStepData = (stepIndex) => {
    const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
    const sport = formData.sport?.trim();
    const userType = formData.userType;

    // Calculate step 1 progress based on filled fields
    const calculateStep1Progress = () => {
      const requiredFields = ['firstName', 'lastName', 'email', 'username'];
      const validRequiredFields = requiredFields.filter(field => {
        const value = formData[field];
        switch (field) {
          case 'firstName':
          case 'lastName':
            return value && isValidName(value);
          case 'email':
            return value && isValidEmail(value);
          case 'username':
            return value && isValidUsername(value);
          default:
            return !!value;
        }
      }).length;

      // Optional fields (phone, sport) can add small bonus
      const optionalBonus = (formData.phone && formData.phone.length > 6 ? 0.02 : 0) + 
                           (formData.sport ? 0.02 : 0);

      if (validRequiredFields === 0) return 0;
      if (validRequiredFields === requiredFields.length) return 0.33; // Complete
      
      // Partial progress: start at 5% for any interaction, then scale up
      return Math.min(0.05 + (validRequiredFields / requiredFields.length) * 0.25 + optionalBonus, 0.32);
    };

    // Generate role-based description
    const getRoleDescription = () => {
      if (userType === 'OTHER') {
        return formData.customRole?.trim() || 'Other';
      }
      
      if (sport && (userType === 'PLAYER' || userType === 'COACH' || userType === 'TRAINER')) {
        switch (userType) {
          case 'PLAYER':
            return `${sport} Player`;
          case 'COACH':
            return `${sport} Coach`;
          case 'TRAINER':
            return `${sport} Trainer`;
          default:
            return `${sport} Athlete`;
        }
      } else {
        switch (userType) {
          case 'PLAYER':
            return 'Athlete';
          case 'COACH':
            return 'Coach';
          case 'TRAINER':
            return 'Personal Trainer';
          case 'PARENT':
            return 'Parent';
          default:
            return 'Other';
        }
      }
    };

    const steps = [
      {
        title: "Get Started",
        subtitle: "Choose how to create your account",
        icon: "login",
        progress: isStepCompleted(0) ? 0.20 : (currentStep > 0 ? 0.20 : 0),
        completed: isStepCompleted(0)
      },
      {
        title: "Personal Info",
        subtitle: "Tell us about yourself",
        icon: "person",
        progress: calculateStep1Progress(),
        completed: isStepCompleted(1),
        showUserImage: formData.firstName || formData.lastName
      },
      {
        title: fullName || "Account Setup",
        subtitle: "Choose your role",
        icon: "settings",
        progress: isStepCompleted(2) ? 0.60 : (currentStep > 2 ? 0.60 : 0.40),
        showUserImage: true,
        completed: isStepCompleted(2)
      },
      {
        title: fullName || "Security Setup",
        subtitle: getRoleDescription() + " • Account recovery",
        icon: "security",
        progress: isStepCompleted(3) ? 0.80 : 0.60,
        showUserImage: true,
        completed: isStepCompleted(3)
      },
      {
        title: fullName || "Password",
        subtitle: getRoleDescription() + " • Secure your account",
        icon: "lock",
        progress: isStepCompleted(4) ? 1.0 : 0.80,
        showUserImage: true,
        completed: isStepCompleted(4)
      }
    ];

    return steps[stepIndex];
  };

  const stepData = getPersonalizedStepData(currentStep);

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <Text style={[styles.progressText, theme === 'dark' && styles.darkText]}>
          Step {currentStep + 1} of 5
        </Text>
        <Text style={[styles.progressPercentage, theme === 'dark' && styles.darkText]}>
          {Math.round(stepData.progress * 100)}%
        </Text>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBackground, theme === 'dark' && styles.darkProgressBackground]}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${stepData.progress * 100}%` },
              theme === 'dark' && styles.darkProgressFill
            ]} 
          />
        </View>
      </View>

      {/* Step Indicators */}
      <View style={styles.stepIndicators}>
        {[0, 1, 2, 3, 4].map((stepNum) => (
          <View key={stepNum} style={styles.stepIndicatorContainer}>
            <View 
              style={[
                styles.stepIndicator,
                stepNum === currentStep && styles.stepIndicatorActive,
                stepNum < currentStep && styles.stepIndicatorCompleted,
                isStepCompleted(stepNum) && styles.stepIndicatorCompleted,
                theme === 'dark' && styles.darkStepIndicator,
                theme === 'dark' && stepNum === currentStep && styles.darkStepIndicatorActive,
                theme === 'dark' && stepNum < currentStep && styles.darkStepIndicatorCompleted
              ]}>
              {isStepCompleted(stepNum) ? (
                <Icon 
                  name="check" 
                  size={12} 
                  color={theme === 'dark' ? COLORS.surface : '#FFFFFF'} 
                />
              ) : (
                <Text style={[
                  styles.stepIndicatorText,
                  stepNum === currentStep && styles.stepIndicatorTextActive,
                  theme === 'dark' && styles.darkStepIndicatorText,
                  theme === 'dark' && stepNum === currentStep && styles.darkStepIndicatorTextActive
                ]}>
                  {stepNum + 1}
                </Text>
              )}
            </View>
            
            {/* Step Label */}
            <Text style={[
              styles.stepLabel,
              stepNum === currentStep && styles.stepLabelActive,
              theme === 'dark' && styles.darkText,
              theme === 'dark' && stepNum === currentStep && styles.darkStepLabelActive
            ]}>
              {getStepLabel(stepNum)}
            </Text>
          </View>
        ))}
      </View>

      {/* Current Step Info */}
      <View style={styles.currentStepInfo}>
        <View style={styles.currentStepIconContainer}>
          <Icon 
            name={stepData.icon} 
            size={20} 
            color={theme === 'dark' ? COLORS.primary : COLORS.primary} 
          />
        </View>
        <View style={styles.currentStepTextContainer}>
          <Text style={[styles.currentStepTitle, theme === 'dark' && styles.darkText]}>
            {stepData.title}
          </Text>
          <Text style={[styles.currentStepSubtitle, theme === 'dark' && styles.darkSecondaryText]}>
            {stepData.subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  darkContainer: {
    backgroundColor: '#121212',
    borderBottomColor: '#333333',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  stepInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  darkText: {
    color: '#FFFFFF',
  },
  progressText: {
    fontSize: 14,
    color: '#757575',
  },
  darkSecondaryText: {
    color: '#BDBDBD',
  },
  compactText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    marginRight: 12,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  darkProgressBar: {
    backgroundColor: '#333333',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  compactProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: '#1976D2',
    borderRadius: 2,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepIndicatorContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  darkStepIndicator: {
    backgroundColor: '#2C2C2C',
    borderColor: '#444444',
  },
  activeStep: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  darkActiveStep: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  completedStep: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  darkCompletedStep: {
    backgroundColor: '#66BB6A',
    borderColor: '#66BB6A',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  darkStepNumber: {
    color: '#BDBDBD',
  },
  activeStepNumber: {
    color: '#FFFFFF',
  },
  darkActiveStepNumber: {
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 11,
    color: '#9E9E9E',
    textAlign: 'center',
    maxWidth: 60,
  },
  darkStepTitle: {
    color: '#757575',
  },
  activeStepTitle: {
    color: '#1976D2',
    fontWeight: '600',
  },
  darkActiveStepTitle: {
    color: '#2196F3',
  },
  currentStepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  currentStepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentStepTextContainer: {
    flex: 1,
  },
  currentStepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  currentStepSubtitle: {
    fontSize: 12,
    color: '#757575',
    lineHeight: 16,
  },
  darkStepIndicatorText: {
    color: '#9CA3AF',
  },
  darkStepIndicatorTextActive: {
    color: '#FFFFFF',
  },
  darkStepLabelActive: {
    color: '#60A5FA',
  },
});

export default RegistrationProgress;