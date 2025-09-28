import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  StatusBar,
  Linking,
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
  List,
  Switch,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const EmergencyInfo = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, emergencyInfo, medicalInfo, loading } = useSelector(state => ({
    user: state.auth.user,
    emergencyInfo: state.safety.emergencyInfo || {},
    medicalInfo: state.safety.medicalInfo || {},
    loading: state.safety.loading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    medical: true,
    emergency: true,
    contacts: false,
  });
  const [medicalForm, setMedicalForm] = useState({
    bloodType: '',
    allergies: '',
    medications: '',
    conditions: '',
    physician: '',
    physicianPhone: '',
    insurance: '',
    insuranceId: '',
    lastPhysical: '',
    notes: '',
  });

  useEffect(() => {
    loadEmergencyInfo();
    if (medicalInfo) {
      setMedicalForm({ ...medicalInfo });
    }
  }, []);

  const loadEmergencyInfo = useCallback(() => {
    dispatch({ type: 'LOAD_EMERGENCY_INFO' });
    dispatch({ type: 'LOAD_MEDICAL_INFO' });
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEmergencyInfo();
    setRefreshing(false);
  }, [loadEmergencyInfo]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleEmergencyCall = (number) => {
    Vibration.vibrate([100, 50, 100]);
    Alert.alert(
      '🚨 Emergency Call',
      `Call ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'default',
          onPress: () => {
            const url = `tel:${number}`;
            Linking.canOpenURL(url).then(supported => {
              if (supported) {
                Linking.openURL(url);
              } else {
                Alert.alert('Error', 'Unable to make phone call');
              }
            });
          },
        },
      ]
    );
  };

  const handleSaveMedicalInfo = () => {
    dispatch({ 
      type: 'UPDATE_MEDICAL_INFO', 
      payload: { 
        ...medicalForm, 
        userId: user.id,
        childId: user.childId,
        lastUpdated: new Date().toISOString(),
      } 
    });
    setShowMedicalModal(false);
    Vibration.vibrate(50);
    Alert.alert('Success', 'Medical information updated successfully');
  };

  const emergencyNumbers = [
    { name: '🚨 Emergency Services', number: '911', description: 'Police, Fire, Medical' },
    { name: '🏥 Poison Control', number: '1-800-222-1222', description: 'Poison emergencies' },
    { name: '🧠 Mental Health Crisis', number: '988', description: '24/7 crisis support' },
    { name: '👶 Child Abuse Hotline', number: '1-800-4-A-CHILD', description: 'Report abuse' },
  ];

  const safetyProtocols = [
    {
      title: 'During Training',
      icon: 'sports',
      items: [
        'Always inform coach of any injuries or discomfort',
        'Stay hydrated - drink water regularly',
        'Follow equipment safety guidelines',
        'Never train alone without supervision',
        'Report unsafe conditions immediately',
      ],
    },
    {
      title: 'Injury Protocol',
      icon: 'healing',
      items: [
        'Stop activity immediately if injured',
        'Inform coach or supervisor right away',
        'Apply first aid if trained to do so',
        'Seek medical attention for serious injuries',
        'Document incident for insurance purposes',
      ],
    },
    {
      title: 'Weather Safety',
      icon: 'wb-sunny',
      items: [
        'Check weather conditions before outdoor activities',
        'Stay indoors during severe weather warnings',
        'Wear appropriate gear for weather conditions',
        'Stay hydrated in hot weather',
        'Watch for signs of heat exhaustion',
      ],
    },
    {
      title: 'Travel Safety',
      icon: 'directions-bus',
      items: [
        'Always travel with designated chaperones',
        'Keep emergency contact info accessible',
        'Stay with the group at all times',
        'Follow transportation safety rules',
        'Report any concerns to supervisors',
      ],
    },
  ];

  const renderEmergencyNumbers = () => (
    <Card style={styles.emergencyCard} elevation={3}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="emergency" size={24} color={COLORS.error} />
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Emergency Numbers 🆘
          </Text>
        </View>
        
        <Text variant="bodyMedium" style={styles.sectionSubtitle}>
          Important numbers for emergency situations
        </Text>
        
        {emergencyNumbers.map((emergency, index) => (
          <Surface key={index} style={styles.emergencyItem} elevation={1}>
            <View style={styles.emergencyContent}>
              <View style={styles.emergencyInfo}>
                <Text variant="titleMedium" style={styles.emergencyName}>
                  {emergency.name}
                </Text>
                <Text variant="bodyLarge" style={styles.emergencyNumber}>
                  {emergency.number}
                </Text>
                <Text variant="bodySmall" style={styles.emergencyDescription}>
                  {emergency.description}
                </Text>
              </View>
              <Button
                mode="contained"
                icon="phone"
                onPress={() => handleEmergencyCall(emergency.number)}
                style={styles.callButton}
                buttonColor={COLORS.error}
                compact
              >
                Call
              </Button>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderMedicalInfo = () => (
    <Card style={styles.medicalCard} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="medical-services" size={24} color={COLORS.primary} />
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Medical Information 🏥
          </Text>
          <IconButton
            icon="edit"
            mode="contained-tonal"
            iconColor={COLORS.primary}
            onPress={() => setShowMedicalModal(true)}
          />
        </View>

        <View style={styles.medicalGrid}>
          <View style={styles.medicalItem}>
            <Text variant="labelMedium" style={styles.medicalLabel}>Blood Type</Text>
            <Text variant="bodyLarge" style={styles.medicalValue}>
              {medicalForm.bloodType || 'Not specified'}
            </Text>
          </View>
          
          <View style={styles.medicalItem}>
            <Text variant="labelMedium" style={styles.medicalLabel}>Allergies</Text>
            <Text variant="bodyMedium" style={styles.medicalValue}>
              {medicalForm.allergies || 'None reported'}
            </Text>
          </View>
          
          <View style={styles.medicalItem}>
            <Text variant="labelMedium" style={styles.medicalLabel}>Current Medications</Text>
            <Text variant="bodyMedium" style={styles.medicalValue}>
              {medicalForm.medications || 'None reported'}
            </Text>
          </View>
          
          <View style={styles.medicalItem}>
            <Text variant="labelMedium" style={styles.medicalLabel}>Medical Conditions</Text>
            <Text variant="bodyMedium" style={styles.medicalValue}>
              {medicalForm.conditions || 'None reported'}
            </Text>
          </View>
        </View>

        {medicalForm.physician && (
          <Surface style={styles.physicianInfo} elevation={1}>
            <View style={styles.physicianHeader}>
              <Icon name="person" size={20} color={COLORS.primary} />
              <Text variant="titleMedium" style={styles.physicianTitle}>
                Primary Physician
              </Text>
            </View>
            <Text variant="bodyMedium">{medicalForm.physician}</Text>
            {medicalForm.physicianPhone && (
              <Text variant="bodySmall" style={styles.physicianPhone}>
                📱 {medicalForm.physicianPhone}
              </Text>
            )}
          </Surface>
        )}
      </Card.Content>
    </Card>
  );

  const renderSafetyProtocols = () => (
    <Card style={styles.protocolsCard} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="shield" size={24} color={COLORS.success} />
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Safety Protocols 🛡️
          </Text>
        </View>
        
        {safetyProtocols.map((protocol, index) => (
          <Surface key={index} style={styles.protocolSection} elevation={1}>
            <List.Accordion
              title={protocol.title}
              left={() => <Icon name={protocol.icon} size={24} color={COLORS.primary} />}
              style={styles.accordion}
            >
              {protocol.items.map((item, itemIndex) => (
                <List.Item
                  key={itemIndex}
                  title={item}
                  left={() => <Icon name="check-circle" size={16} color={COLORS.success} />}
                  titleStyle={styles.protocolItem}
                  style={styles.listItem}
                />
              ))}
            </List.Accordion>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderMedicalModal = () => (
    <Portal>
      <Modal
        visible={showMedicalModal}
        onDismiss={() => setShowMedicalModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface} elevation={4}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Medical Information
            </Text>
            <IconButton
              icon="close"
              onPress={() => setShowMedicalModal(false)}
            />
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <TextInput
              label="Blood Type"
              value={medicalForm.bloodType}
              onChangeText={(text) => setMedicalForm({ ...medicalForm, bloodType: text })}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="water" />}
              placeholder="e.g., A+, O-, AB+"
            />
            
            <TextInput
              label="Allergies"
              value={medicalForm.allergies}
              onChangeText={(text) => setMedicalForm({ ...medicalForm, allergies: text })}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              left={<TextInput.Icon icon="warning" />}
              placeholder="Food, environmental, medication allergies"
            />
            
            <TextInput
              label="Current Medications"
              value={medicalForm.medications}
              onChangeText={(text) => setMedicalForm({ ...medicalForm, medications: text })}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              left={<TextInput.Icon icon="medication" />}
              placeholder="List all current medications"
            />
            
            <TextInput
              label="Medical Conditions"
              value={medicalForm.conditions}
              onChangeText={(text) => setMedicalForm({ ...medicalForm, conditions: text })}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              left={<TextInput.Icon icon="healing" />}
              placeholder="Chronic conditions, previous injuries"
            />
            
            <Divider style={styles.divider} />
            
            <TextInput
              label="Primary Physician"
              value={medicalForm.physician}
              onChangeText={(text) => setMedicalForm({ ...medicalForm, physician: text })}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="person" />}
            />
            
            <TextInput
              label="Physician Phone"
              value={medicalForm.physicianPhone}
              onChangeText={(text) => setMedicalForm({ ...medicalForm, physicianPhone: text })}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
            />
            
            <TextInput
              label="Insurance Provider"
              value={medicalForm.insurance}
              onChangeText={(text) => setMedicalForm({ ...medicalForm, insurance: text })}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="shield" />}
            />
            
            <TextInput
              label="Insurance ID"
              value={medicalForm.insuranceId}
              onChangeText={(text) => setMedicalForm({ ...medicalForm, insuranceId: text })}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="badge" />}
            />
            
            <TextInput
              label="Additional Notes"
              value={medicalForm.notes}
              onChangeText={(text) => setMedicalForm({ ...medicalForm, notes: text })}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
              left={<TextInput.Icon icon="note" />}
              placeholder="Any other important medical information"
            />
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowMedicalModal(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveMedicalInfo}
              style={styles.saveButton}
              buttonColor={COLORS.primary}
            >
              Save Information
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
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
            🛡️ Emergency Information
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Important safety and medical information
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
        {/* Emergency Numbers */}
        {renderEmergencyNumbers()}

        {/* Medical Information */}
        {renderMedicalInfo()}

        {/* Safety Protocols */}
        {renderSafetyProtocols()}

        {/* Important Reminders Card */}
        <Card style={styles.remindersCard} elevation={2}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon name="lightbulb" size={24} color={COLORS.warning} />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Important Reminders 💡
              </Text>
            </View>
            
            <View style={styles.remindersList}>
              <Text variant="bodyMedium" style={styles.reminder}>
                • Always keep emergency contact information up to date
              </Text>
              <Text variant="bodyMedium" style={styles.reminder}>
                • Inform coaches about any medical conditions or injuries
              </Text>
              <Text variant="bodyMedium" style={styles.reminder}>
                • Carry medical alert information if you have serious conditions
              </Text>
              <Text variant="bodyMedium" style={styles.reminder}>
                • Know the location of first aid supplies at your training facility
              </Text>
              <Text variant="bodyMedium" style={styles.reminder}>
                • Practice emergency procedures with your team regularly
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Quick Emergency FAB */}
      <FAB
        icon="emergency"
        style={styles.fab}
        onPress={() => handleEmergencyCall('911')}
        label="Emergency"
        color="white"
        customSize={56}
      />

      {renderMedicalModal()}
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
  emergencyCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
    flex: 1,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  emergencyItem: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  emergencyNumber: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  emergencyDescription: {
    color: COLORS.textSecondary,
  },
  callButton: {
    marginLeft: SPACING.md,
  },
  medicalCard: {
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  medicalGrid: {
    marginTop: SPACING.md,
  },
  medicalItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  medicalLabel: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  medicalValue: {
    fontWeight: '500',
  },
  physicianInfo: {
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 8,
  },
  physicianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  physicianTitle: {
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
  },
  physicianPhone: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  protocolsCard: {
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  protocolSection: {
    marginBottom: SPACING.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  accordion: {
    backgroundColor: 'transparent',
  },
  listItem: {
    paddingLeft: SPACING.xl,
  },
  protocolItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  remindersCard: {
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  remindersList: {
    marginTop: SPACING.md,
  },
  reminder: {
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.error,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  modalSurface: {
    borderRadius: 12,
    maxHeight: '90%',
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
  modalContent: {
    paddingHorizontal: SPACING.lg,
    maxHeight: 500,
  },
  input: {
    marginBottom: SPACING.md,
  },
  divider: {
    marginVertical: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  cancelButton: {
    marginRight: SPACING.sm,
  },
  saveButton: {
    minWidth: 120,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default EmergencyInfo;