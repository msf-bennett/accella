// src/components/settings/SessionSetupModal.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Animated
} from 'react-native';
import { Button, Surface, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../../styles/themes';

const INPUT_STEPS = {
  PLAN_NAME: 0,
  ENTITY_NAME: 1,
  TRAINING_TIME: 2
};

const SessionSetupModal = ({ 
  visible, 
  onDismiss, 
  onComplete,
  totalWeeks = 12,
  documentName = ''
}) => {
  const [currentInputStep, setCurrentInputStep] = useState(INPUT_STEPS.PLAN_NAME);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [coachingPlanName, setCoachingPlanName] = useState('');
  const [entityName, setEntityName] = useState('');
  const [trainingTime, setTrainingTime] = useState('');
  
  const inputRef = useRef(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [currentInputStep, visible]);

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const getCurrentValue = () => {
    switch (currentInputStep) {
      case INPUT_STEPS.PLAN_NAME:
        return coachingPlanName;
      case INPUT_STEPS.ENTITY_NAME:
        return entityName;
      case INPUT_STEPS.TRAINING_TIME:
        return trainingTime;
      default:
        return '';
    }
  };

  const setCurrentValue = (value) => {
    switch (currentInputStep) {
      case INPUT_STEPS.PLAN_NAME:
        setCoachingPlanName(value);
        break;
      case INPUT_STEPS.ENTITY_NAME:
        setEntityName(value);
        break;
      case INPUT_STEPS.TRAINING_TIME:
        setTrainingTime(value);
        break;
    }
  };

  const getInputConfig = () => {
    switch (currentInputStep) {
      case INPUT_STEPS.PLAN_NAME:
        return {
          label: 'Coaching Plan Name',
          placeholder: 'e.g., Intermediate 7-9 years',
          helper: 'Give your coaching plan a custom name'
        };
      case INPUT_STEPS.ENTITY_NAME:
        return {
          label: 'Academy / Team / Individual Name',
          placeholder: 'e.g., Nextgen Multisport Academy',
          helper: 'Who is this training for?'
        };
      case INPUT_STEPS.TRAINING_TIME:
        return {
          label: 'Training Time',
          placeholder: 'e.g., 9:00am - 11:00am',
          helper: 'When will training sessions occur?'
        };
      default:
        return { label: '', placeholder: '', helper: '' };
    }
  };

  const validateCurrentInput = () => {
    return getCurrentValue().trim().length > 0;
  };

  const handleInputNext = () => {
    if (!validateCurrentInput()) {
      shakeInput();
      inputRef.current?.focus();
      return;
    }
    if (currentInputStep < INPUT_STEPS.TRAINING_TIME) {
      setCurrentInputStep(currentInputStep + 1);
    }
  };

  const handleInputBack = () => {
    if (currentInputStep > INPUT_STEPS.PLAN_NAME) {
      setCurrentInputStep(currentInputStep - 1);
    }
  };

  const handleComplete = () => {
    // Validate all required fields
    if (!coachingPlanName.trim()) {
      setCurrentInputStep(INPUT_STEPS.PLAN_NAME);
      shakeInput();
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }
    if (!entityName.trim()) {
      setCurrentInputStep(INPUT_STEPS.ENTITY_NAME);
      shakeInput();
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }
    if (!trainingTime.trim()) {
      setCurrentInputStep(INPUT_STEPS.TRAINING_TIME);
      shakeInput();
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    onComplete({
      startingWeek: selectedWeek,
      startDate: startDate.toISOString().split('T')[0],
      coachingPlanName: coachingPlanName,
      entityName: entityName,
      trainingTime: trainingTime
    });
  };

  const adjustDate = (days) => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + days);
    setStartDate(newDate);
  };

  const config = getInputConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Surface style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Icon name="event" size={24} color={COLORS.primary} />
              <Text style={styles.headerTitle}>Setup Training Schedule</Text>
            </View>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
            />
          </View>

          <ScrollView style={styles.content}>
            {/* Document Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Document</Text>
              <Text style={styles.documentName}>{documentName}</Text>
              <Text style={styles.documentInfo}>
                {totalWeeks} weeks • Auto-scheduling enabled
              </Text>
            </View>

            {/* Training Details - Single Input with Navigation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Training Details</Text>
              <Text style={styles.sectionDescription}>
                Step {currentInputStep + 1} of 3
              </Text>
              
              <Animated.View style={[styles.inputContainer, { transform: [{ translateX: shakeAnim }] }]}>
                <Text style={styles.inputLabel}>{config.label}</Text>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder={config.placeholder}
                  placeholderTextColor={COLORS.textSecondary}
                  value={getCurrentValue()}
                  onChangeText={setCurrentValue}
                  onSubmitEditing={handleInputNext}
                  returnKeyType={currentInputStep === INPUT_STEPS.TRAINING_TIME ? "done" : "next"}
                />
                <Text style={styles.helperText}>{config.helper}</Text>
              </Animated.View>

              {/* Input Navigation */}
              <View style={styles.inputNavigation}>
                <TouchableOpacity
                  style={[
                    styles.navCard,
                    currentInputStep === INPUT_STEPS.PLAN_NAME && styles.navCardDisabled
                  ]}
                  onPress={handleInputBack}
                  disabled={currentInputStep === INPUT_STEPS.PLAN_NAME}
                >
                  <Icon 
                    name="arrow-back" 
                    size={20} 
                    color={currentInputStep === INPUT_STEPS.PLAN_NAME ? COLORS.textSecondary : COLORS.primary} 
                  />
                  <Text style={[
                    styles.navCardText,
                    currentInputStep === INPUT_STEPS.PLAN_NAME && styles.navCardTextDisabled
                  ]}>
                    Back
                  </Text>
                </TouchableOpacity>

                <View style={styles.progressDots}>
                  {[0, 1, 2].map((step) => (
                    <View
                      key={step}
                      style={[
                        styles.progressDot,
                        step === currentInputStep && styles.progressDotActive,
                        step < currentInputStep && styles.progressDotCompleted
                      ]}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.navCard,
                    currentInputStep === INPUT_STEPS.TRAINING_TIME && styles.navCardDisabled
                  ]}
                  onPress={handleInputNext}
                  disabled={currentInputStep === INPUT_STEPS.TRAINING_TIME}
                >
                  <Text style={[
                    styles.navCardText,
                    currentInputStep === INPUT_STEPS.TRAINING_TIME && styles.navCardTextDisabled
                  ]}>
                    Next
                  </Text>
                  <Icon 
                    name="arrow-forward" 
                    size={20} 
                    color={currentInputStep === INPUT_STEPS.TRAINING_TIME ? COLORS.textSecondary : COLORS.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Starting Week Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Starting Week</Text>
              <Text style={styles.sectionDescription}>
                Choose which week to start from
              </Text>
              
              <View style={styles.weekSelector}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.weekList}
                >
                  {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(week => (
                    <TouchableOpacity
                      key={week}
                      onPress={() => setSelectedWeek(week)}
                      style={[
                        styles.weekOption,
                        selectedWeek === week && styles.weekOptionSelected
                      ]}
                    >
                      <Text style={[
                        styles.weekOptionText,
                        selectedWeek === week && styles.weekOptionTextSelected
                      ]}>
                        Week {week}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Start Date Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Start Date</Text>
              <Text style={styles.sectionDescription}>
                When do you want to begin training?
              </Text>
              
              <View style={styles.dateSelector}>
                <IconButton
                  icon="chevron-left"
                  size={24}
                  onPress={() => adjustDate(-1)}
                />
                <View style={styles.dateDisplay}>
                  <Text style={styles.dateText}>
                    {startDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <IconButton
                  icon="chevron-right"
                  size={24}
                  onPress={() => adjustDate(1)}
                />
              </View>

              <View style={styles.quickDateOptions}>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => setStartDate(new Date())}
                >
                  <Text style={styles.quickDateText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setStartDate(tomorrow);
                  }}
                >
                  <Text style={styles.quickDateText}>Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => {
                    const nextMonday = new Date();
                    const day = nextMonday.getDay();
                    const daysUntilMonday = (8 - day) % 7 || 7;
                    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
                    setStartDate(nextMonday);
                  }}
                >
                  <Text style={styles.quickDateText}>Next Monday</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Summary */}
            <Surface style={styles.summary}>
              <Text style={styles.summaryTitle}>Setup Summary</Text>
              
              {coachingPlanName && (
                <View style={styles.summaryItem}>
                  <Icon name="description" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.summaryText}>
                    {coachingPlanName}
                  </Text>
                </View>
              )}
              
              {entityName && (
                <View style={styles.summaryItem}>
                  <Icon name="groups" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.summaryText}>
                    For: {entityName}
                  </Text>
                </View>
              )}
              
              {trainingTime && (
                <View style={styles.summaryItem}>
                  <Icon name="schedule" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.summaryText}>
                    Training at {trainingTime}
                  </Text>
                </View>
              )}
              
              <View style={styles.summaryItem}>
                <Icon name="play-circle-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.summaryText}>
                  Starting from Week {selectedWeek} of {totalWeeks}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Icon name="calendar-today" size={20} color={COLORS.textSecondary} />
                <Text style={styles.summaryText}>
                  Beginning on {startDate.toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Icon name="auto-awesome" size={20} color={COLORS.textSecondary} />
                <Text style={styles.summaryText}>
                  Sessions will auto-advance daily
                </Text>
              </View>
            </Surface>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleComplete}
              style={styles.actionButton}
              buttonColor={COLORS.primary}
            >
              Start Training
            </Button>
          </View>
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg
  },
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  headerTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.sm
  },
  content: {
    padding: SPACING.lg
  },
  section: {
    marginBottom: SPACING.xl
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle1,
    fontWeight: 'bold',
    marginBottom: SPACING.xs
  },
  sectionDescription: {
    ...TEXT_STYLES.body2,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },
  documentName: {
    ...TEXT_STYLES.body1,
    fontWeight: '600',
    marginBottom: SPACING.xs
  },
  documentInfo: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary
  },
  inputContainer: {
    marginBottom: SPACING.md
  },
  inputLabel: {
    ...TEXT_STYLES.body2,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary
  },
  input: {
    ...TEXT_STYLES.body1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary
  },
  helperText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs
  },
  inputNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  navCardDisabled: {
    opacity: 0.4
  },
  navCardText: {
    ...TEXT_STYLES.body2,
    color: COLORS.primary,
    fontWeight: '600',
    marginHorizontal: SPACING.xs
  },
  navCardTextDisabled: {
    color: COLORS.textSecondary
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border
  },
  progressDotActive: {
    width: 24,
    backgroundColor: COLORS.primary
  },
  progressDotCompleted: {
    backgroundColor: COLORS.success || COLORS.primary
  },
  weekSelector: {
    marginTop: SPACING.sm
  },
  weekList: {
    paddingVertical: SPACING.sm
  },
  weekOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  weekOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  weekOptionText: {
    ...TEXT_STYLES.body2,
    color: COLORS.textPrimary
  },
  weekOptionTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold'
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginHorizontal: SPACING.sm
  },
  dateText: {
    ...TEXT_STYLES.body1,
    fontWeight: '600'
  },
  quickDateOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md
  },
  quickDateButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.background
  },
  quickDateText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600'
  },
  summary: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginTop: SPACING.md
  },
  summaryTitle: {
    ...TEXT_STYLES.subtitle2,
    fontWeight: 'bold',
    marginBottom: SPACING.sm
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  summaryText: {
    ...TEXT_STYLES.body2,
    marginLeft: SPACING.sm,
    flex: 1
  },
  actions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs
  }
});

export default SessionSetupModal;