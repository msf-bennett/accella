import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  StatusBar,
  Image,
  Platform,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Text,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Chip,
  Portal,
  Modal,
  TextInput,
  Divider,
  RadioButton,
  Checkbox,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const IncidentReporting = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, incidents, loading } = useSelector(state => ({
    user: state.auth.user,
    incidents: state.safety.incidents || [],
    loading: state.safety.loading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [reportForm, setReportForm] = useState({
    // Basic Information
    incidentType: '',
    severity: '',
    dateTime: new Date().toISOString(),
    location: '',
    activity: '',
    
    // Incident Details
    description: '',
    injuredPerson: '',
    witnessName: '',
    witnessContact: '',
    
    // Medical Response
    firstAidGiven: false,
    medicalAttentionSought: false,
    medicalProvider: '',
    treatmentDescription: '',
    
    // Follow-up
    parentNotified: false,
    coachNotified: false,
    followUpRequired: false,
    followUpNotes: '',
    
    // Media
    photos: [],
    
    // Reporter Info
    reportedBy: '',
    reporterRole: '',
    reporterContact: '',
  });

  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadIncidents();
    initializeReportForm();
  }, []);

  const loadIncidents = useCallback(() => {
    dispatch({ type: 'LOAD_INCIDENTS', payload: { userId: user.id } });
  }, [dispatch, user.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadIncidents();
    setRefreshing(false);
  }, [loadIncidents]);

  const initializeReportForm = () => {
    setReportForm(prev => ({
      ...prev,
      reportedBy: user.name || '',
      reporterRole: user.role || 'player',
      reporterContact: user.phone || user.email || '',
      injuredPerson: user.role === 'player' ? user.name : '',
    }));
  };

  const incidentTypes = [
    { value: 'injury', label: 'Injury', icon: 'healing', color: COLORS.error },
    { value: 'unsafe_condition', label: 'Unsafe Condition', icon: 'warning', color: COLORS.warning },
    { value: 'equipment_failure', label: 'Equipment Failure', icon: 'build', color: COLORS.secondary },
    { value: 'behavioral', label: 'Behavioral Issue', icon: 'person', color: COLORS.primary },
    { value: 'environmental', label: 'Environmental Hazard', icon: 'nature', color: COLORS.success },
    { value: 'other', label: 'Other', icon: 'help', color: COLORS.textSecondary },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low Risk', color: COLORS.success, description: 'Minor concern, no immediate risk' },
    { value: 'medium', label: 'Medium Risk', color: COLORS.warning, description: 'Moderate concern, needs attention' },
    { value: 'high', label: 'High Risk', color: COLORS.error, description: 'Serious concern, immediate action needed' },
    { value: 'critical', label: 'Critical', color: '#D32F2F', description: 'Emergency situation' },
  ];

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!reportForm.incidentType || !reportForm.severity) {
          Alert.alert('Required Fields', 'Please select incident type and severity level');
          return false;
        }
        break;
      case 2:
        if (!reportForm.description.trim()) {
          Alert.alert('Required Fields', 'Please provide a description of the incident');
          return false;
        }
        break;
      case 3:
        // Medical response validation is optional
        break;
      case 4:
        if (!reportForm.reportedBy.trim()) {
          Alert.alert('Required Fields', 'Please provide reporter information');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmitReport = () => {
    if (!validateCurrentStep()) return;

    const incidentData = {
      ...reportForm,
      id: Date.now().toString(),
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      userId: user.id,
      childId: user.childId,
    };

    dispatch({ type: 'SUBMIT_INCIDENT_REPORT', payload: incidentData });
    setShowReportModal(false);
    setCurrentStep(1);
    setReportForm({
      incidentType: '',
      severity: '',
      dateTime: new Date().toISOString(),
      location: '',
      activity: '',
      description: '',
      injuredPerson: '',
      witnessName: '',
      witnessContact: '',
      firstAidGiven: false,
      medicalAttentionSought: false,
      medicalProvider: '',
      treatmentDescription: '',
      parentNotified: false,
      coachNotified: false,
      followUpRequired: false,
      followUpNotes: '',
      photos: [],
      reportedBy: user.name || '',
      reporterRole: user.role || 'player',
      reporterContact: user.phone || user.email || '',
    });

    Vibration.vibrate([100, 50, 100]);
    Alert.alert(
      'Report Submitted',
      'Your incident report has been submitted successfully. Relevant parties will be notified.',
      [{ text: 'OK', onPress: () => {} }]
    );
  };

  const getIncidentIcon = (type) => {
    const incidentType = incidentTypes.find(t => t.value === type);
    return incidentType ? incidentType.icon : 'report';
  };

  const getIncidentColor = (type) => {
    const incidentType = incidentTypes.find(t => t.value === type);
    return incidentType ? incidentType.color : COLORS.textSecondary;
  };

  const getSeverityColor = (severity) => {
    const level = severityLevels.find(s => s.value === severity);
    return level ? level.color : COLORS.textSecondary;
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filterType === 'all') return true;
    return incident.incidentType === filterType;
  });

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <ProgressBar 
        progress={currentStep / 4} 
        color={COLORS.primary}
        style={styles.progressBar}
      />
      <Text variant="bodySmall" style={styles.stepText}>
        Step {currentStep} of 4
      </Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text variant="titleMedium" style={styles.stepTitle}>
        Incident Type & Severity
      </Text>
      
      <Text variant="bodyMedium" style={styles.fieldLabel}>
        What type of incident occurred? *
      </Text>
      <View style={styles.typeGrid}>
        {incidentTypes.map((type) => (
          <Surface
            key={type.value}
            style={[
              styles.typeItem,
              reportForm.incidentType === type.value && styles.selectedTypeItem
            ]}
            elevation={reportForm.incidentType === type.value ? 3 : 1}
          >
            <Button
              mode={reportForm.incidentType === type.value ? 'contained' : 'outlined'}
              icon={type.icon}
              onPress={() => setReportForm({ ...reportForm, incidentType: type.value })}
              style={styles.typeButton}
              buttonColor={reportForm.incidentType === type.value ? type.color : 'transparent'}
              textColor={reportForm.incidentType === type.value ? 'white' : type.color}
              compact
            >
              {type.label}
            </Button>
          </Surface>
        ))}
      </View>

      <Text variant="bodyMedium" style={[styles.fieldLabel, { marginTop: SPACING.lg }]}>
        Severity Level *
      </Text>
      {severityLevels.map((level) => (
        <Surface key={level.value} style={styles.severityItem} elevation={1}>
          <RadioButton.Item
            label={level.label}
            value={level.value}
            status={reportForm.severity === level.value ? 'checked' : 'unchecked'}
            onPress={() => setReportForm({ ...reportForm, severity: level.value })}
            labelStyle={{ color: level.color }}
          />
          <Text variant="bodySmall" style={styles.severityDescription}>
            {level.description}
          </Text>
        </Surface>
      ))}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text variant="titleMedium" style={styles.stepTitle}>
        Incident Details
      </Text>
      
      <TextInput
        label="Location *"
        value={reportForm.location}
        onChangeText={(text) => setReportForm({ ...reportForm, location: text })}
        style={styles.input}
        mode="outlined"
        left={<TextInput.Icon icon="location-on" />}
        placeholder="Where did the incident occur?"
      />

      <TextInput
        label="Activity"
        value={reportForm.activity}
        onChangeText={(text) => setReportForm({ ...reportForm, activity: text })}
        style={styles.input}
        mode="outlined"
        left={<TextInput.Icon icon="sports" />}
        placeholder="What activity was being performed?"
      />

      <TextInput
        label="Detailed Description *"
        value={reportForm.description}
        onChangeText={(text) => setReportForm({ ...reportForm, description: text })}
        style={styles.input}
        mode="outlined"
        multiline
        numberOfLines={4}
        left={<TextInput.Icon icon="description" />}
        placeholder="Describe exactly what happened..."
      />

      <TextInput
        label="Person Involved"
        value={reportForm.injuredPerson}
        onChangeText={(text) => setReportForm({ ...reportForm, injuredPerson: text })}
        style={styles.input}
        mode="outlined"
        left={<TextInput.Icon icon="person" />}
        placeholder="Name of person involved"
      />

      <View style={styles.witnessSection}>
        <Text variant="bodyMedium" style={styles.fieldLabel}>
          Witness Information
        </Text>
        <TextInput
          label="Witness Name"
          value={reportForm.witnessName}
          onChangeText={(text) => setReportForm({ ...reportForm, witnessName: text })}
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="visibility" />}
        />
        <TextInput
          label="Witness Contact"
          value={reportForm.witnessContact}
          onChangeText={(text) => setReportForm({ ...reportForm, witnessContact: text })}
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="contact-phone" />}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text variant="titleMedium" style={styles.stepTitle}>
        Medical Response & Follow-up
      </Text>
      
      <View style={styles.checkboxSection}>
        <Checkbox.Item
          label="First aid was provided"
          status={reportForm.firstAidGiven ? 'checked' : 'unchecked'}
          onPress={() => setReportForm({ ...reportForm, firstAidGiven: !reportForm.firstAidGiven })}
        />
        
        <Checkbox.Item
          label="Medical attention was sought"
          status={reportForm.medicalAttentionSought ? 'checked' : 'unchecked'}
          onPress={() => setReportForm({ ...reportForm, medicalAttentionSought: !reportForm.medicalAttentionSought })}
        />
        
        <Checkbox.Item
          label="Parent/Guardian was notified"
          status={reportForm.parentNotified ? 'checked' : 'unchecked'}
          onPress={() => setReportForm({ ...reportForm, parentNotified: !reportForm.parentNotified })}
        />
        
        <Checkbox.Item
          label="Coach/Supervisor was notified"
          status={reportForm.coachNotified ? 'checked' : 'unchecked'}
          onPress={() => setReportForm({ ...reportForm, coachNotified: !reportForm.coachNotified })}
        />
        
        <Checkbox.Item
          label="Follow-up required"
          status={reportForm.followUpRequired ? 'checked' : 'unchecked'}
          onPress={() => setReportForm({ ...reportForm, followUpRequired: !reportForm.followUpRequired })}
        />
      </div>

      {reportForm.medicalAttentionSought && (
        <>
          <TextInput
            label="Medical Provider"
            value={reportForm.medicalProvider}
            onChangeText={(text) => setReportForm({ ...reportForm, medicalProvider: text })}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="local-hospital" />}
            placeholder="Hospital, clinic, or doctor name"
          />
          
          <TextInput
            label="Treatment Description"
            value={reportForm.treatmentDescription}
            onChangeText={(text) => setReportForm({ ...reportForm, treatmentDescription: text })}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="healing" />}
            placeholder="What treatment was provided?"
          />
        </>
      )}

      {reportForm.followUpRequired && (
        <TextInput
          label="Follow-up Notes"
          value={reportForm.followUpNotes}
          onChangeText={(text) => setReportForm({ ...reportForm, followUpNotes: text })}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={3}
          left={<TextInput.Icon icon="event-note" />}
          placeholder="What follow-up actions are needed?"
        />
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text variant="titleMedium" style={styles.stepTitle}>
        Reporter Information
      </Text>
      
      <TextInput
        label="Your Name *"
        value={reportForm.reportedBy}
        onChangeText={(text) => setReportForm({ ...reportForm, reportedBy: text })}
        style={styles.input}
        mode="outlined"
        left={<TextInput.Icon icon="person" />}
      />

      <TextInput
        label="Your Role *"
        value={reportForm.reporterRole}
        onChangeText={(text) => setReportForm({ ...reportForm, reporterRole: text })}
        style={styles.input}
        mode="outlined"
        left={<TextInput.Icon icon="work" />}
        placeholder="Player, Coach, Parent, etc."
      />

      <TextInput
        label="Your Contact Information *"
        value={reportForm.reporterContact}
        onChangeText={(text) => setReportForm({ ...reportForm, reporterContact: text })}
        style={styles.input}
        mode="outlined"
        left={<TextInput.Icon icon="contact-phone" />}
        placeholder="Phone number or email"
      />

      <Surface style={styles.summaryCard} elevation={2}>
        <Text variant="titleSmall" style={styles.summaryTitle}>
          Report Summary
        </Text>
        <Text variant="bodyMedium" style={styles.summaryText}>
          <Text style={styles.summaryLabel}>Type:</Text> {reportForm.incidentType.replace('_', ' ')}
        </Text>
        <Text variant="bodyMedium" style={styles.summaryText}>
          <Text style={styles.summaryLabel}>Severity:</Text> {reportForm.severity}
        </Text>
        <Text variant="bodyMedium" style={styles.summaryText}>
          <Text style={styles.summaryLabel}>Location:</Text> {reportForm.location}
        </Text>
        {reportForm.injuredPerson && (
          <Text variant="bodyMedium" style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Person Involved:</Text> {reportForm.injuredPerson}
          </Text>
        )}
      </Surface>
    </View>
  );

  const renderReportModal = () => (
    <Portal>
      <Modal
        visible={showReportModal}
        onDismiss={() => setShowReportModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface} elevation={4}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Report Incident
            </Text>
            <IconButton
              icon="close"
              onPress={() => setShowReportModal(false)}
            />
          </View>
          
          {renderStepIndicator()}
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </ScrollView>
          
          <View style={styles.modalActions}>
            {currentStep > 1 && (
              <Button
                mode="outlined"
                onPress={handlePreviousStep}
                style={styles.backButton}
                icon="arrow-back"
              >
                Back
              </Button>
            )}
            
            {currentStep < 4 ? (
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={styles.nextButton}
                buttonColor={COLORS.primary}
                icon="arrow-forward"
              >
                Next
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleSubmitReport}
                style={styles.submitButton}
                buttonColor={COLORS.primary}
                icon="send"
              >
                Submit Report
              </Button>
            )}
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  const renderIncidentCard = (incident) => (
    <Card key={incident.id} style={styles.incidentCard} elevation={2}>
      <Card.Content style={styles.incidentContent}>
        <View style={styles.incidentHeader}>
          <View style={styles.incidentInfo}>
            <View style={styles.incidentTitleRow}>
              <Icon 
                name={getIncidentIcon(incident.incidentType)} 
                size={20} 
                color={getIncidentColor(incident.incidentType)} 
              />
              <Text variant="titleMedium" style={styles.incidentTitle}>
                {incident.incidentType.replace('_', ' ').toUpperCase()}
              </Text>
              <Chip 
                mode="flat" 
                style={[styles.severityChip, { backgroundColor: getSeverityColor(incident.severity) + '20' }]}
                textStyle={[styles.severityChipText, { color: getSeverityColor(incident.severity) }]}
              >
                {incident.severity.toUpperCase()}
              </Chip>
            </View>
            <Text variant="bodySmall" style={styles.incidentDate}>
              {new Date(incident.submittedAt).toLocaleDateString()} at {incident.location}
            </Text>
            <Text variant="bodyMedium" style={styles.incidentDescription} numberOfLines={2}>
              {incident.description}
            </Text>
            {incident.injuredPerson && (
              <Text variant="bodySmall" style={styles.incidentPerson}>
                Person involved: {incident.injuredPerson}
              </Text>
            )}
          </View>
          <View style={styles.incidentStatus}>
            <Chip 
              mode="flat"
              style={styles.statusChip}
              textStyle={styles.statusChipText}
            >
              {incident.status || 'Submitted'}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          mode={filterType === 'all' ? 'flat' : 'outlined'}
          selected={filterType === 'all'}
          onPress={() => setFilterType('all')}
          style={styles.filterChip}
        >
          All ({incidents.length})
        </Chip>
        {incidentTypes.map((type) => {
          const count = incidents.filter(i => i.incidentType === type.value).length;
          return (
            <Chip
              key={type.value}
              mode={filterType === type.value ? 'flat' : 'outlined'}
              selected={filterType === type.value}
              onPress={() => setFilterType(type.value)}
              style={styles.filterChip}
              icon={type.icon}
            >
              {type.label} ({count})
            </Chip>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="assignment" size={80} color={COLORS.secondary} />
      <Text variant="titleMedium" style={styles.emptyTitle}>
        No Incidents Reported
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Safety first! Report any incidents, injuries, or safety concerns to help maintain a safe training environment.
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowReportModal(true)}
        style={styles.emptyButton}
        buttonColor={COLORS.primary}
        icon="add-circle"
      >
        Report First Incident
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            📋 Incident Reporting
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Report safety concerns and track incidents
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        {/* Safety Notice */}
        <Card style={styles.noticeCard} elevation={2}>
          <Card.Content>
            <View style={styles.noticeHeader}>
              <Icon name="security" size={24} color={COLORS.warning} />
              <Text variant="titleMedium" style={styles.noticeTitle}>
                Safety Notice 🚨
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.noticeText}>
              Report all incidents immediately. For medical emergencies, call 911 first, then complete this report.
            </Text>
          </Card.Content>
        </Card>

        {/* Filter Chips */}
        {incidents.length > 0 && renderFilterChips()}

        {/* Incidents List */}
        <View style={styles.incidentsList}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Recent Incidents ({filteredIncidents.length})
          </Text>
          
          {filteredIncidents.length === 0 ? (
            renderEmptyState()
          ) : (
            filteredIncidents.map(renderIncidentCard)
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Report Incident FAB */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowReportModal(true)}
        label="Report Incident"
        color="white"
        customSize={56}
      />

      {renderReportModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  noticeCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  noticeTitle: {
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },
  noticeText: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  filterContainer: {
    marginBottom: SPACING.lg,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  incidentsList: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  incidentCard: {
    marginBottom: SPACING.md,
  },
  incidentContent: {
    padding: SPACING.sm,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  incidentInfo: {
    flex: 1,
  },
  incidentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  incidentTitle: {
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  severityChip: {
    marginLeft: SPACING.sm,
  },
  severityChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  incidentDate: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  incidentDescription: {
    marginBottom: SPACING.xs,
  },
  incidentPerson: {
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  incidentStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    backgroundColor: COLORS.success + '20',
  },
  statusChipText: {
    color: COLORS.success,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  emptyButton: {
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  modalSurface: {
    borderRadius: 12,
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  stepIndicator: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  stepText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  modalContent: {
    paddingHorizontal: SPACING.lg,
    maxHeight: 500,
  },
  stepContent: {
    paddingVertical: SPACING.md,
  },
  stepTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    color: COLORS.primary,
  },
  fieldLabel: {
    fontWeight: '500',
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  typeItem: {
    flex: 0.48,
    marginBottom: SPACING.sm,
    borderRadius: 8,
  },
  selectedTypeItem: {
    backgroundColor: COLORS.primary + '10',
  },
  typeButton: {
    width: '100%',
  },
  severityItem: {
    marginBottom: SPACING.sm,
    borderRadius: 8,
    paddingVertical: SPACING.xs,
  },
  severityDescription: {
    color: COLORS.textSecondary,
    marginLeft: 56,
    marginTop: -8,
    marginBottom: SPACING.xs,
  },
  input: {
    marginBottom: SPACING.md,
  },
  witnessSection: {
    marginTop: SPACING.md,
  },
  checkboxSection: {
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '10',
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  summaryText: {
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  backButton: {
    flex: 0.4,
  },
  nextButton: {
    flex: 0.4,
  },
  submitButton: {
    flex: 0.6,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default IncidentReporting;