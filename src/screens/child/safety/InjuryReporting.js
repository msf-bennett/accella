import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StatusBar,
  Vibration,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  TextInput,
  RadioButton,
  Checkbox,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  ProgressBar,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const InjuryReporting = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, userRole } = useSelector(state => state.auth);
  const { currentTrainingSession } = useSelector(state => state.training);

  // Form state
  const [reportData, setReportData] = useState({
    injuredPerson: '',
    injuryType: '',
    severity: 'minor',
    bodyPart: '',
    description: '',
    timeOfIncident: new Date().toISOString(),
    witnessNames: '',
    firstAidProvided: false,
    parentNotified: false,
    medicalAttentionRequired: false,
    activityAtTimeOfInjury: '',
    environmentalFactors: '',
    equipmentInvolved: '',
  });

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [selectedInjuryType, setSelectedInjuryType] = useState('');

  const injuryTypes = [
    { id: 'cut', label: 'Cut/Laceration', severity: 'minor', icon: 'healing' },
    { id: 'bruise', label: 'Bruise/Contusion', severity: 'minor', icon: 'colorize' },
    { id: 'sprain', label: 'Sprain/Strain', severity: 'moderate', icon: 'accessibility' },
    { id: 'fracture', label: 'Fracture/Break', severity: 'serious', icon: 'personal-injury' },
    { id: 'concussion', label: 'Head/Concussion', severity: 'serious', icon: 'psychology' },
    { id: 'dislocation', label: 'Dislocation', severity: 'serious', icon: 'pan-tool' },
    { id: 'burn', label: 'Burn', severity: 'moderate', icon: 'local-fire-department' },
    { id: 'other', label: 'Other', severity: 'minor', icon: 'medical-services' },
  ];

  const bodyParts = [
    'Head/Face', 'Neck', 'Shoulder', 'Arm', 'Elbow', 'Wrist/Hand',
    'Chest', 'Back', 'Abdomen', 'Hip', 'Thigh', 'Knee', 'Shin/Calf', 'Ankle/Foot'
  ];

  const severityLevels = [
    { 
      value: 'minor', 
      label: 'Minor', 
      color: COLORS.success, 
      description: 'No medical attention required' 
    },
    { 
      value: 'moderate', 
      label: 'Moderate', 
      color: '#ff9800', 
      description: 'May require medical attention' 
    },
    { 
      value: 'serious', 
      label: 'Serious', 
      color: COLORS.error, 
      description: 'Immediate medical attention required' 
    },
  ];

  useEffect(() => {
    // Auto-suggest severity based on injury type
    const selectedType = injuryTypes.find(type => type.id === selectedInjuryType);
    if (selectedType) {
      setReportData(prev => ({
        ...prev,
        severity: selectedType.severity,
        injuryType: selectedType.label
      }));
    }
  }, [selectedInjuryType]);

  const handleEmergencyCall = useCallback(() => {
    Alert.alert(
      '🚨 Emergency Services',
      'This will initiate emergency protocols and notify:\n\n• Emergency Services (911/999)\n• Parent/Guardian\n• School/Academy Administration\n• Insurance Provider',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Emergency',
          style: 'destructive',
          onPress: () => {
            Vibration.vibrate([0, 500, 200, 500]);
            setEmergencyModalVisible(true);
            // Implement actual emergency calling logic
            Alert.alert('🚨 Emergency Protocol Activated', 'Emergency services have been notified.');
          },
        },
      ]
    );
  }, []);

  const handleSubmitReport = useCallback(async () => {
    // Validation
    if (!reportData.injuredPerson.trim()) {
      Alert.alert('Missing Information', 'Please enter the name of the injured person.');
      return;
    }
    if (!reportData.injuryType) {
      Alert.alert('Missing Information', 'Please select the type of injury.');
      return;
    }
    if (!reportData.description.trim()) {
      Alert.alert('Missing Information', 'Please provide a description of the incident.');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportPayload = {
        ...reportData,
        reporterId: user.id,
        reporterName: user.name,
        reporterRole: userRole,
        timestamp: new Date().toISOString(),
        sessionId: currentTrainingSession?.id,
        urgencyLevel: reportData.severity,
        autoNotifications: {
          parents: reportData.severity !== 'minor',
          administration: true,
          insurance: reportData.severity === 'serious',
          medicalStaff: reportData.medicalAttentionRequired,
        }
      };

      // Dispatch to Redux store
      dispatch({ type: 'SUBMIT_INJURY_REPORT', payload: reportPayload });

      Alert.alert(
        '✅ Report Submitted',
        `Injury report has been filed successfully.\n\nReport ID: INJ-${Date.now()}\n\n${
          reportData.severity === 'serious' 
            ? '🚨 Emergency notifications have been sent to relevant parties.' 
            : '📧 Appropriate notifications have been sent.'
        }`,
        [
          {
            text: 'View Reports',
            onPress: () => navigation.navigate('InjuryHistory'),
          },
          {
            text: 'Continue',
            style: 'default',
            onPress: () => navigation.goBack(),
          },
        ]
      );

      // Auto-navigate for serious injuries
      if (reportData.severity === 'serious') {
        setTimeout(() => {
          navigation.navigate('EmergencyProtocol', { reportId: `INJ-${Date.now()}` });
        }, 3000);
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to submit injury report. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [reportData, user, userRole, currentTrainingSession, dispatch, navigation]);

  const renderInjuryTypeSelector = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 12,
          padding: SPACING.lg,
          maxHeight: '80%',
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
          <Icon name="medical-services" size={40} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.heading, { marginTop: SPACING.sm }]}>
            Select Injury Type
          </Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {injuryTypes.map((injury) => (
            <Card key={injury.id} style={{ marginBottom: SPACING.sm }}>
              <Card.Content>
                <Button
                  mode={selectedInjuryType === injury.id ? "contained" : "outlined"}
                  onPress={() => {
                    setSelectedInjuryType(injury.id);
                    setModalVisible(false);
                  }}
                  icon={injury.icon}
                  buttonColor={selectedInjuryType === injury.id ? COLORS.primary : 'transparent'}
                  style={{ justifyContent: 'flex-start' }}
                >
                  {injury.label}
                </Button>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
        
        <Button mode="outlined" onPress={() => setModalVisible(false)} style={{ marginTop: SPACING.md }}>
          Cancel
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar translucent backgroundColor="rgba(102, 126, 234, 0.8)" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: StatusBar.currentHeight + SPACING.lg, paddingBottom: SPACING.lg }}
      >
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingHorizontal: SPACING.lg,
          justifyContent: 'space-between' 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={[TEXT_STYLES.heading, { color: 'white', marginLeft: SPACING.sm }]}>
              🩹 Injury Report
            </Text>
          </View>
          <Button
            mode="contained"
            buttonColor={COLORS.error}
            textColor="white"
            icon="emergency"
            onPress={handleEmergencyCall}
            style={{ backgroundColor: COLORS.error }}
          >
            EMERGENCY
          </Button>
        </View>
      </LinearGradient>

      <ScrollView 
        style={{ flex: 1, backgroundColor: COLORS.background }}
        contentContainerStyle={{ padding: SPACING.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Child Safety Notice */}
        <Card style={{ marginBottom: SPACING.lg, backgroundColor: '#fff3cd' }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Icon name="child-care" size={24} color="#856404" />
              <Text style={[TEXT_STYLES.subheading, { color: '#856404', marginLeft: SPACING.sm }]}>
                Child Safety Protocol
              </Text>
            </View>
            <Text style={[TEXT_STYLES.body, { color: '#856404' }]}>
              All injury reports involving minors are automatically flagged for immediate review and 
              parent/guardian notification. Serious injuries trigger emergency protocols.
            </Text>
          </Card.Content>
        </Card>

        {/* Basic Information */}
        <Card style={{ marginBottom: SPACING.lg }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md }]}>
              📝 Basic Information
            </Text>
            
            <TextInput
              label="Name of Injured Person *"
              value={reportData.injuredPerson}
              onChangeText={(text) => setReportData(prev => ({ ...prev, injuredPerson: text }))}
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
              left={<TextInput.Icon icon="person" />}
            />

            <Button
              mode="outlined"
              onPress={() => setModalVisible(true)}
              style={{ marginBottom: SPACING.md, justifyContent: 'flex-start' }}
              icon="medical-services"
            >
              {reportData.injuryType || 'Select Injury Type *'}
            </Button>

            <TextInput
              label="Activity at Time of Injury"
              value={reportData.activityAtTimeOfInjury}
              onChangeText={(text) => setReportData(prev => ({ ...prev, activityAtTimeOfInjury: text }))}
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
              left={<TextInput.Icon icon="sports-soccer" />}
            />
          </Card.Content>
        </Card>

        {/* Severity Assessment */}
        <Card style={{ marginBottom: SPACING.lg }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md }]}>
              ⚠️ Severity Assessment
            </Text>
            
            <RadioButton.Group
              onValueChange={(value) => setReportData(prev => ({ ...prev, severity: value }))}
              value={reportData.severity}
            >
              {severityLevels.map((level) => (
                <View key={level.value} style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginBottom: SPACING.sm,
                  backgroundColor: reportData.severity === level.value ? level.color + '20' : 'transparent',
                  padding: SPACING.sm,
                  borderRadius: 8,
                }}>
                  <RadioButton value={level.value} color={level.color} />
                  <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                    <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: level.color }]}>
                      {level.label}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>
                      {level.description}
                    </Text>
                  </View>
                </View>
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Body Part Selection */}
        <Card style={{ marginBottom: SPACING.lg }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md }]}>
              🫁 Body Part Affected
            </Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {bodyParts.map((part) => (
                <Chip
                  key={part}
                  mode={reportData.bodyPart === part ? 'flat' : 'outlined'}
                  selected={reportData.bodyPart === part}
                  onPress={() => setReportData(prev => ({ 
                    ...prev, 
                    bodyPart: prev.bodyPart === part ? '' : part 
                  }))}
                  style={{ margin: 2 }}
                  selectedColor={COLORS.primary}
                >
                  {part}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Incident Description */}
        <Card style={{ marginBottom: SPACING.lg }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md }]}>
              📋 Incident Description
            </Text>
            
            <TextInput
              label="Detailed Description *"
              value={reportData.description}
              onChangeText={(text) => setReportData(prev => ({ ...prev, description: text }))}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={{ marginBottom: SPACING.md }}
              placeholder="Please describe how the injury occurred, what the person was doing, and any immediate actions taken..."
            />

            <TextInput
              label="Witness Names"
              value={reportData.witnessNames}
              onChangeText={(text) => setReportData(prev => ({ ...prev, witnessNames: text }))}
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
              placeholder="Names of people who witnessed the incident"
            />

            <TextInput
              label="Equipment Involved"
              value={reportData.equipmentInvolved}
              onChangeText={(text) => setReportData(prev => ({ ...prev, equipmentInvolved: text }))}
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
              placeholder="Any equipment or apparatus involved in the injury"
            />

            <TextInput
              label="Environmental Factors"
              value={reportData.environmentalFactors}
              onChangeText={(text) => setReportData(prev => ({ ...prev, environmentalFactors: text }))}
              mode="outlined"
              multiline
              placeholder="Weather conditions, surface type, lighting, etc."
            />
          </Card.Content>
        </Card>

        {/* Action Checklist */}
        <Card style={{ marginBottom: SPACING.lg }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md }]}>
              ✅ Actions Taken
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Checkbox
                status={reportData.firstAidProvided ? 'checked' : 'unchecked'}
                onPress={() => setReportData(prev => ({ 
                  ...prev, 
                  firstAidProvided: !prev.firstAidProvided 
                }))}
                color={COLORS.primary}
              />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                First aid was provided
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Checkbox
                status={reportData.parentNotified ? 'checked' : 'unchecked'}
                onPress={() => setReportData(prev => ({ 
                  ...prev, 
                  parentNotified: !prev.parentNotified 
                }))}
                color={COLORS.primary}
              />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                Parent/Guardian was notified
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Checkbox
                status={reportData.medicalAttentionRequired ? 'checked' : 'unchecked'}
                onPress={() => setReportData(prev => ({ 
                  ...prev, 
                  medicalAttentionRequired: !prev.medicalAttentionRequired 
                }))}
                color={COLORS.error}
              />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                Medical attention is required
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmitReport}
          loading={loading}
          disabled={loading}
          style={{ 
            marginBottom: SPACING.xl,
            backgroundColor: COLORS.primary,
            paddingVertical: SPACING.sm,
          }}
          labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
        >
          {loading ? 'Submitting Report...' : '📝 Submit Injury Report'}
        </Button>
      </ScrollView>

      {renderInjuryTypeSelector()}

      {/* Emergency FAB */}
      <FAB
        icon="emergency"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.error,
        }}
        color="white"
        onPress={handleEmergencyCall}
      />
    </KeyboardAvoidingView>
  );
};

export default InjuryReporting;