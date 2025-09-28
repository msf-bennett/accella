import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList
} from 'react-native';
import { TextInput, Text, HelperText, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';

const SecurityQuestionsForm = ({
  formData,
  onFieldChange,
  onNext,
  onBack,
  errors = {},
  validFields = {},
  theme = 'light'
}) => {
  const [showSecurityQuestionModal, setShowSecurityQuestionModal] = useState(false);
  const [securityQuestionFocused, setSecurityQuestionFocused] = useState(false);
  const [securityAnswerFocused, setSecurityAnswerFocused] = useState(false);
  
  const securityQuestionOptions = [
    "What city were you born in?",  
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What is your favorite sports team?",
    "What was the name of your elementary school?",
    "What is your father's middle name?",
    "What was your childhood nickname?",
    "What is the name of your favorite teacher?",
    "What street did you grow up on?",
    "What is your favorite movie?",
    "What was the model of your first car?",
    "What is your favorite food?",
  ];

  const handleInputChange = (field, value) => {
    onFieldChange(field, value);
  };

  const selectSecurityQuestion = (question) => {
    handleInputChange('securityQuestion', question);
    setShowSecurityQuestionModal(false);
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
          <Icon name="security" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.stepTitle}>{fullName || "Security Setup"}</Text>
        <Text style={styles.stepSubtitle}>{getRoleDescription()} • Account recovery</Text>
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
            <Text style={styles.sectionTitle}>Account Recovery</Text>
            <Text style={styles.sectionSubtitle}>
              Set up a security question to help recover your account if you forget your password.
            </Text>

            {/* Security Question Dropdown/Input */}
            <TextInput
              label="Security Question *"
              value={formData.securityQuestion}
              onChangeText={(value) => handleInputChange('securityQuestion', value)}
              mode="outlined"
              style={styles.input}
              placeholder="Select a question or write your own"
              right={
                <TextInput.Icon 
                  icon="chevron-down" 
                  onPress={() => setShowSecurityQuestionModal(true)}
                />
              }
              onFocus={() => setSecurityQuestionFocused(true)}
              onBlur={() => setSecurityQuestionFocused(false)}
              error={!!errors.securityQuestion}
              theme={getInputTheme('securityQuestion')}
            />
            {errors.securityQuestion && (
              <HelperText type="error" style={styles.errorText}>
                {errors.securityQuestion}
              </HelperText>
            )}

            {/* Quick Select Buttons */}
            <View style={styles.quickSelectContainer}>
              <Text style={styles.quickSelectTitle}>Popular Questions:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickSelectScroll}>
                {securityQuestionOptions.slice(0, 4).map((question, index) => (
                  <Chip
                    key={index}
                    mode={formData.securityQuestion === question ? "flat" : "outlined"}
                    onPress={() => handleInputChange('securityQuestion', question)}
                    style={[
                      styles.quickSelectChip,
                      formData.securityQuestion === question && styles.quickSelectChipSelected
                    ]}
                    textStyle={styles.quickSelectChipText}>
                    {question.replace('?', '').substring(0, 25)}...
                  </Chip>
                ))}
              </ScrollView>
            </View>

            {/* Security Answer */}
            <TextInput
              label="Your Answer *"
              value={formData.securityAnswer}
              onChangeText={(value) => handleInputChange('securityAnswer', value)}
              mode="outlined"
              autoCapitalize="words"
              style={styles.input}
              placeholder="Enter your answer (remember it well!)"
              right={validFields.securityAnswer && (
                <TextInput.Icon 
                  icon="check-circle" 
                  iconColor="#10B981"
                  size={20}
                />
              )}
              onFocus={() => setSecurityAnswerFocused(true)}
              onBlur={() => setSecurityAnswerFocused(false)}
              error={!!errors.securityAnswer}
              theme={getInputTheme('securityAnswer')}
            />
            {errors.securityAnswer && (
              <HelperText type="error" style={styles.errorText}>
                {errors.securityAnswer}
              </HelperText>
            )}

            {/* Security Tips */}
            <View style={styles.securityTipsContainer}>
              <View style={styles.securityTip}>
                <Icon name="info" size={16} color="#3B82F6" />
                <Text style={styles.securityTipText}>
                  Choose a question you'll remember the answer to years from now
                </Text>
              </View>
              <View style={styles.securityTip}>
                <Icon name="warning" size={16} color="#F59E0B" />
                <Text style={styles.securityTipText}>
                  Don't share your security answer with anyone
                </Text>
              </View>
              <View style={styles.securityTip}>
                <Icon name="lock" size={16} color="#10B981" />
                <Text style={styles.securityTipText}>
                  Your answer is case-sensitive, so remember exactly how you type it
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Security Question Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSecurityQuestionModal}
        onRequestClose={() => setShowSecurityQuestionModal(false)}>
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSecurityQuestionModal(false)}>
          
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select Security Question</Text>
            </View>
            
            <FlatList
              data={securityQuestionOptions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalQuestionOption,
                    formData.securityQuestion === item && styles.modalQuestionOptionSelected
                  ]}
                  onPress={() => selectSecurityQuestion(item)}>
                  <Text style={[
                    styles.modalQuestionText,
                    formData.securityQuestion === item && styles.modalQuestionTextSelected
                  ]}>
                    {item}
                  </Text>
                  {formData.securityQuestion === item && (
                    <Icon name="check-circle" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalList}
            />
            
            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowSecurityQuestionModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  input: {
    marginBottom: SPACING.md,
  },
  errorText: {
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickSelectContainer: {
    marginBottom: SPACING.lg,
  },
  quickSelectTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  quickSelectScroll: {
    flexDirection: 'row',
  },
  quickSelectChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  quickSelectChipSelected: {
    backgroundColor: '#E3F2FD',
  },
  quickSelectChipText: {
    fontSize: 12,
  },
  securityTipsContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  securityTipText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalList: {
    padding: SPACING.md,
  },
  modalQuestionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  modalQuestionOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  modalQuestionText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  modalQuestionTextSelected: {
    color: '#1976D2',
    fontWeight: '500',
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.md,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
  },
});

export default SecurityQuestionsForm;