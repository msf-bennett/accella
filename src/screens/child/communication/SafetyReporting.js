import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Vibration,
  Linking,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  TextInput,
  RadioButton,
  Switch,
  Portal,
  Modal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const SafetyReporting = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, safetySettings } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [urgency, setUrgency] = useState('low');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleEmergencyCall = () => {
    Alert.alert(
      '🚨 Emergency Help',
      'This will call emergency services. Are you in immediate danger?',
      [
        { text: 'No, Cancel', style: 'cancel' },
        { 
          text: 'Yes, Call 911', 
          style: 'destructive',
          onPress: () => {
            Vibration.vibrate([100, 100, 100]);
            Linking.openURL('tel:911');
          }
        },
      ]
    );
  };

  const handleTrustedAdultCall = () => {
    Alert.alert(
      '📞 Call Trusted Adult',
      'Would you like to call a trusted adult?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Parent/Guardian', 
          onPress: () => Linking.openURL('tel:+1234567890') // Mock number
        },
        { 
          text: 'Call Coach', 
          onPress: () => Linking.openURL('tel:+1234567891') // Mock number
        },
      ]
    );
  };

  const handleSubmitReport = () => {
    if (!reportType || !reportDescription.trim()) {
      Alert.alert('📝 Report Incomplete', 'Please fill in all required fields before submitting.');
      return;
    }

    Vibration.vibrate(50);
    setShowConfirmModal(true);
  };

  const confirmSubmitReport = () => {
    setShowConfirmModal(false);
    
    // Simulate report submission
    Alert.alert(
      '✅ Report Submitted',
      `Thank you for keeping our community safe! Your report has been sent to our safety team. ${isAnonymous ? 'Your identity will remain private.' : 'Someone may contact you for more information.'}`,
      [
        { 
          text: 'OK', 
          onPress: () => {
            // Reset form
            setReportType('');
            setReportDescription('');
            setSelectedPerson('');
            setIsAnonymous(false);
            setUrgency('low');
          }
        }
      ]
    );
  };

  const reportTypes = [
    {
      id: 'bullying',
      title: 'Bullying or Mean Behavior 😢',
      description: 'Someone is being mean, calling names, or making you feel bad',
      icon: 'report',
      color: '#FF6B6B',
    },
    {
      id: 'inappropriate',
      title: 'Inappropriate Behavior 🚫',
      description: 'Someone did something that made you uncomfortable',
      icon: 'warning',
      color: '#FF8E53',
    },
    {
      id: 'safety',
      title: 'Safety Concern ⚠️',
      description: 'Something unsafe happened or you feel worried about safety',
      icon: 'security',
      color: '#4ECDC4',
    },
    {
      id: 'content',
      title: 'Bad Content 📱',
      description: 'You saw something inappropriate in the app or messages',
      icon: 'content-copy',
      color: '#A8E6CF',
    },
    {
      id: 'other',
      title: 'Something Else 🤔',
      description: 'Another problem or concern you want to report',
      icon: 'help',
      color: '#D4A5FF',
    },
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Not Urgent 🟢', description: 'Can wait for a response' },
    { value: 'medium', label: 'Somewhat Urgent 🟡', description: 'Would like help soon' },
    { value: 'high', label: 'Very Urgent 🔴', description: 'Need help right away' },
  ];

  const safetyTips = [
    {
      icon: '🛡️',
      title: 'Trust Your Feelings',
      description: 'If something doesn\'t feel right, it\'s okay to speak up.',
    },
    {
      icon: '🗣️',
      title: 'Talk to Trusted Adults',
      description: 'Always tell a parent, coach, or trusted adult about any problems.',
    },
    {
      icon: '🤝',
      title: 'Be Kind to Others',
      description: 'Treat your teammates the way you want to be treated.',
    },
    {
      icon: '📱',
      title: 'Use the App Safely',
      description: 'Only share appropriate content and be respectful online.',
    },
  ];

  const renderReportTypeCard = (type) => (
    <TouchableOpacity
      key={type.id}
      style={[
        styles.reportTypeCard,
        reportType === type.id && styles.selectedReportType,
        { borderColor: type.color }
      ]}
      onPress={() => {
        setReportType(type.id);
        Vibration.vibrate(30);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.reportTypeContent}>
        <View style={[styles.reportTypeIcon, { backgroundColor: type.color + '20' }]}>
          <MaterialIcons name={type.icon} size={24} color={type.color} />
        </View>
        <View style={styles.reportTypeInfo}>
          <Text style={[TEXT_STYLES.h4, styles.reportTypeTitle]}>
            {type.title}
          </Text>
          <Text style={[TEXT_STYLES.body, styles.reportTypeDescription]}>
            {type.description}
          </Text>
        </View>
        {reportType === type.id && (
          <MaterialIcons 
            name="check-circle" 
            size={24} 
            color={COLORS.success} 
            style={styles.selectedIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSafetyTip = (tip, index) => (
    <View key={index} style={styles.safetyTipCard}>
      <Text style={styles.safetyTipIcon}>{tip.icon}</Text>
      <View style={styles.safetyTipContent}>
        <Text style={[TEXT_STYLES.h4, styles.safetyTipTitle]}>
          {tip.title}
        </Text>
        <Text style={[TEXT_STYLES.body, styles.safetyTipDescription]}>
          {tip.description}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
            Safety & Support 🛡️
          </Text>
        </View>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          We're here to keep you safe and help with any problems
        </Text>
      </LinearGradient>

      {/* Emergency Actions */}
      <Surface style={styles.emergencySection}>
        <Text style={[TEXT_STYLES.h3, styles.emergencyTitle]}>
          Need Help Right Now? 🚨
        </Text>
        <View style={styles.emergencyButtons}>
          <Button
            mode="contained"
            onPress={handleEmergencyCall}
            style={styles.emergencyButton}
            labelStyle={styles.emergencyButtonText}
            icon="phone"
            buttonColor="#FF3030"
          >
            Emergency Call
          </Button>
          <Button
            mode="contained"
            onPress={handleTrustedAdultCall}
            style={styles.trustedAdultButton}
            labelStyle={styles.trustedAdultButtonText}
            icon="contacts"
            buttonColor={COLORS.primary}
          >
            Call Trusted Adult
          </Button>
        </View>
      </Surface>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Report Form Section */}
          <View style={styles.section}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              Report a Problem 📝
            </Text>
            <Text style={[TEXT_STYLES.body, styles.sectionDescription]}>
              If something happened that made you uncomfortable or worried, please tell us about it.
            </Text>

            <Text style={[TEXT_STYLES.h4, styles.fieldLabel]}>
              What kind of problem is it? *
            </Text>
            <View style={styles.reportTypesContainer}>
              {reportTypes.map(renderReportTypeCard)}
            </View>

            {reportType && (
              <>
                <Text style={[TEXT_STYLES.h4, styles.fieldLabel]}>
                  Tell us what happened: *
                </Text>
                <TextInput
                  mode="outlined"
                  placeholder="Describe what happened in your own words. Include when and where it happened if you can."
                  value={reportDescription}
                  onChangeText={setReportDescription}
                  multiline
                  numberOfLines={4}
                  style={styles.descriptionInput}
                  activeOutlineColor={COLORS.primary}
                />

                <Text style={[TEXT_STYLES.h4, styles.fieldLabel]}>
                  How urgent is this?
                </Text>
                <View style={styles.urgencyContainer}>
                  {urgencyLevels.map((level) => (
                    <TouchableOpacity
                      key={level.value}
                      style={[
                        styles.urgencyOption,
                        urgency === level.value && styles.selectedUrgency
                      ]}
                      onPress={() => setUrgency(level.value)}
                    >
                      <RadioButton
                        value={level.value}
                        status={urgency === level.value ? 'checked' : 'unchecked'}
                        onPress={() => setUrgency(level.value)}
                        color={COLORS.primary}
                      />
                      <View style={styles.urgencyInfo}>
                        <Text style={[TEXT_STYLES.body, styles.urgencyLabel]}>
                          {level.label}
                        </Text>
                        <Text style={[TEXT_STYLES.caption, styles.urgencyDescription]}>
                          {level.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.anonymousContainer}>
                  <View style={styles.anonymousInfo}>
                    <Text style={[TEXT_STYLES.body, styles.anonymousLabel]}>
                      Keep my name private 🤐
                    </Text>
                    <Text style={[TEXT_STYLES.caption, styles.anonymousDescription]}>
                      If you turn this on, no one will know who sent this report.
                    </Text>
                  </View>
                  <Switch
                    value={isAnonymous}
                    onValueChange={setIsAnonymous}
                    color={COLORS.primary}
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={handleSubmitReport}
                  style={styles.submitButton}
                  labelStyle={styles.submitButtonText}
                  icon="send"
                >
                  Submit Report 📨
                </Button>
              </>
            )}
          </View>

          {/* Safety Tips Section */}
          <View style={styles.section}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              Safety Tips 💡
            </Text>
            <Text style={[TEXT_STYLES.body, styles.sectionDescription]}>
              Remember these important safety tips while using our app and during training.
            </Text>
            <View style={styles.safetyTipsContainer}>
              {safetyTips.map(renderSafetyTip)}
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Card style={styles.contactCard}>
              <Card.Content style={styles.contactContent}>
                <Text style={[TEXT_STYLES.h3, styles.contactTitle]}>
                  Always Remember 🌟
                </Text>
                <Text style={[TEXT_STYLES.body, styles.contactDescription]}>
                  • You can always talk to your parents or guardians{'\n'}
                  • Your coach wants to help keep you safe{'\n'}
                  • It's never wrong to ask for help{'\n'}
                  • You are important and your feelings matter{'\n'}
                  • Speaking up helps keep everyone safe
                </Text>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>

      {/* Confirmation Modal */}
      <Portal>
        <Modal
          visible={showConfirmModal}
          onDismiss={() => setShowConfirmModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
            Confirm Report 📋
          </Text>
          <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
            Are you ready to submit your safety report? Our safety team will review it and may contact you for more information.
          </Text>
          
          <View style={styles.modalSummary}>
            <Text style={[TEXT_STYLES.body, styles.summaryLabel]}>Report Type:</Text>
            <Text style={[TEXT_STYLES.body, styles.summaryValue]}>
              {reportTypes.find(t => t.id === reportType)?.title}
            </Text>
            
            <Text style={[TEXT_STYLES.body, styles.summaryLabel]}>Urgency:</Text>
            <Text style={[TEXT_STYLES.body, styles.summaryValue]}>
              {urgencyLevels.find(u => u.value === urgency)?.label}
            </Text>
            
            <Text style={[TEXT_STYLES.body, styles.summaryLabel]}>Anonymous:</Text>
            <Text style={[TEXT_STYLES.body, styles.summaryValue]}>
              {isAnonymous ? 'Yes - Name will be kept private' : 'No - May be contacted for details'}
            </Text>
          </View>
          
          <View style={styles.modalActions}>
            <Button 
              mode="text" 
              onPress={() => setShowConfirmModal(false)}
              textColor={COLORS.textSecondary}
            >
              Go Back
            </Button>
            <Button 
              mode="contained" 
              onPress={confirmSubmitReport}
              style={styles.confirmButton}
              icon="check"
            >
              Submit Report
            </Button>
          </View>
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.white + 'CC',
    fontSize: 14,
  },
  emergencySection: {
    backgroundColor: COLORS.white,
    elevation: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  emergencyTitle: {
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  emergencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  emergencyButton: {
    flex: 1,
    backgroundColor: '#FF3030',
  },
  emergencyButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  trustedAdultButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  trustedAdultButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  sectionDescription: {
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  fieldLabel: {
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  reportTypesContainer: {
    marginBottom: SPACING.md,
  },
  reportTypeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.surface,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  selectedReportType: {
    borderWidth: 3,
    backgroundColor: COLORS.primary + '05',
  },
  reportTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  reportTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  reportTypeInfo: {
    flex: 1,
  },
  reportTypeTitle: {
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  reportTypeDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  selectedIcon: {
    marginLeft: SPACING.sm,
  },
  descriptionInput: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  urgencyContainer: {
    marginBottom: SPACING.md,
  },
  urgencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surface,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  selectedUrgency: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  urgencyInfo: {
    marginLeft: SPACING.sm,
  },
  urgencyLabel: {
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  urgencyDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  anonymousContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  anonymousInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  anonymousLabel: {
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  anonymousDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  safetyTipsContainer: {
    gap: SPACING.sm,
  },
  safetyTipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 2,
  },
  safetyTipIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
    marginTop: SPACING.xs,
  },
  safetyTipContent: {
    flex: 1,
  },
  safetyTipTitle: {
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  safetyTipDescription: {
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  contactCard: {
    backgroundColor: COLORS.success + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    elevation: 2,
  },
  contactContent: {
    paddingVertical: SPACING.md,
  },
  contactTitle: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  contactDescription: {
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  modalDescription: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  modalSummary: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default SafetyReporting;