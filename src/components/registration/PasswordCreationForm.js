import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { TextInput, Text, HelperText, Checkbox } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';

const PasswordCreationForm = ({
  formData,
  onFieldChange,
  onNext,
  onBack,
  errors = {},
  validFields = {},
  theme = 'light'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const handleInputChange = (field, value) => {
    onFieldChange(field, value);
  };

  const getPasswordStrengthIcon = () => {
    const password = formData.password;
    if (!password) return "help-outline";
    
    if (password.length < 6) return "error-outline";
    if (password.length >= 6 && password.length < 8) return "warning";
    if (password.length >= 8) {
      // Check for strong password (has numbers, letters, special chars)
      const hasNumbers = /\d/.test(password);
      const hasLetters = /[a-zA-Z]/.test(password);
      const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (hasNumbers && hasLetters && hasSpecialChars) return "verified";
      if (hasNumbers && hasLetters) return "check-circle";
      return "info";
    }
    
    return "help-outline";
  };

  const getPasswordStrengthColor = () => {
    const password = formData.password;
    if (!password) return COLORS.textSecondary;
    
    if (password.length < 6) return "#EF4444"; // Red
    if (password.length >= 6 && password.length < 8) return "#F59E0B"; // Orange
    if (password.length >= 8) {
      const hasNumbers = /\d/.test(password);
      const hasLetters = /[a-zA-Z]/.test(password);
      const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (hasNumbers && hasLetters && hasSpecialChars) return "#10B981"; // Green - Very Strong
      if (hasNumbers && hasLetters) return "#059669"; // Dark Green - Strong
      return "#3B82F6"; // Blue - Good
    }
    
    return COLORS.textSecondary;
  };

  const getPasswordMatchIcon = () => {
    if (!formData.confirmPassword) return "help-outline";
    if (!formData.password) return "help-outline";
    
    if (formData.password === formData.confirmPassword) {
      return "check-circle";
    } else {
      return "cancel";
    }
  };

  const getPasswordMatchColor = () => {
    if (!formData.confirmPassword || !formData.password) return COLORS.textSecondary;
    
    if (formData.password === formData.confirmPassword) {
      return "#10B981"; // Green
    } else {
      return "#EF4444"; // Red
    }
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
    const getRoleDescription = () => {
      if (formData.userType === 'OTHER') {
        return formData.customRole?.trim() || 'Other';
      }
      
      const sport = formData.sport?.trim();
      if (sport && (formData.userType === 'PLAYER' || formData.userType === 'COACH' || formData.userType === 'TRAINER')) {
        switch (formData.userType) {
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
        switch (formData.userType) {
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
    
    return (
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Icon name="lock" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.stepTitle}>{fullName || "Password"}</Text>
        <Text style={styles.stepSubtitle}>{getRoleDescription()} • Secure your account</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderStepHeader()}
      
      <View style={styles.stepContainer}>
        <ScrollView 
          style={styles.stepScrollContainer} 
          contentContainerStyle={styles.stepScrollContent}
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.formSection}>
            <TextInput
              label="Password *"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoComplete="password-new"
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  iconColor={COLORS.primary}
                />
              }
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              error={!!errors.password}
              theme={getInputTheme('password')}
            />
            {errors.password && <HelperText type="error" style={styles.errorText}>{errors.password}</HelperText>}

            <TextInput
              label="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              left={
                // Only show icon if confirm password field is not focused AND has content
                formData.confirmPassword && !confirmPasswordFocused ? (
                  <TextInput.Icon 
                    icon={getPasswordMatchIcon()} 
                    iconColor={getPasswordMatchColor()}
                  />
                ) : undefined
              }
              right={
                <TextInput.Icon 
                  icon={showConfirmPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  iconColor={COLORS.primary}
                />
              }
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => setConfirmPasswordFocused(false)}
              error={!!errors.confirmPassword}
              theme={getInputTheme('confirmPassword')}
            />
            {errors.confirmPassword && <HelperText type="error" style={styles.errorText}>{errors.confirmPassword}</HelperText>}

            <View style={styles.passwordStrength}>
              <Text style={styles.passwordStrengthTitle}>Password Requirements:</Text>
              <View style={styles.passwordRequirement}>
                <Icon 
                  name={formData.password && formData.password.length >= 6 ? "check-circle" : "radio-button-unchecked"} 
                  size={16} 
                  color={formData.password && formData.password.length >= 6 ? COLORS.success : COLORS.textSecondary} 
                />
                <Text style={styles.passwordRequirementText}>At least 6 characters</Text>
              </View>
              <View style={styles.passwordRequirement}>
                <Icon 
                  name={formData.password && /\d/.test(formData.password) && /[a-zA-Z]/.test(formData.password) ? "check-circle" : "radio-button-unchecked"} 
                  size={16} 
                  color={formData.password && /\d/.test(formData.password) && /[a-zA-Z]/.test(formData.password) ? COLORS.success : COLORS.textSecondary} 
                />
                <Text style={styles.passwordRequirementText}>Contains letters and numbers</Text>
              </View>
              <View style={styles.passwordRequirement}>
                <Icon 
                  name={formData.password === formData.confirmPassword && formData.password ? "check-circle" : "radio-button-unchecked"} 
                  size={16} 
                  color={formData.password === formData.confirmPassword && formData.password ? COLORS.success : COLORS.textSecondary} 
                />
                <Text style={styles.passwordRequirementText}>Passwords match</Text>
              </View>
            </View>

            {/* Email Opt-in Checkbox */}
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={formData.emailOptIn ? 'checked' : 'unchecked'}
                onPress={() => handleInputChange('emailOptIn', !formData.emailOptIn)}
                color={COLORS.primary}
              />
              <Text style={styles.checkboxText}>
                (Optional) It's ok to send me emails with Acceilla updates, tips, special offers. You can opt out any time.
              </Text>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <View style={styles.childProtectionNotice}>
                <Icon name="info" size={16} color="#F59E0B" />
                <Text style={styles.childProtectionText}>
                  Children under the age of 18 should use the children's version and account creation should be done with parent supervision to ensure child protection.
                </Text>
              </View>
              
              <Text style={styles.termsText}>
                By clicking Create Account, you agree to Acceilla's{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and have read the{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.signInLink}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
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
  stepScrollContent: {
    padding: SPACING.lg,
  },
  formSection: {
    flex: 1,
  },
  input: {
    marginBottom: SPACING.md,
  },
  errorText: {
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  passwordStrength: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordStrengthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  passwordRequirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  passwordRequirementText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  termsContainer: {
    marginBottom: SPACING.lg,
  },
  childProtectionNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  childProtectionText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    marginLeft: SPACING.sm,
    lineHeight: 18,
  },
  termsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  termsLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  signInLink: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  signInText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default PasswordCreationForm;