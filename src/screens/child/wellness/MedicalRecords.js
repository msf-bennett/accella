import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  Checkbox,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9ff',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySmall: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const MedicalRecords = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, childProfile } = useSelector(state => ({
    user: state.auth.user,
    childProfile: state.child.profile,
  }));

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  // Initialize component
  useEffect(() => {
    loadMedicalData();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Load medical data
  const loadMedicalData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockMedicalRecords = [
        {
          id: '1',
          type: 'Physical Exam',
          date: '2024-08-15',
          provider: 'Dr. Sarah Johnson',
          clinic: 'Sports Medicine Center',
          status: 'Cleared for Activity',
          notes: 'Excellent physical condition for sports participation',
          expiryDate: '2025-08-15',
          category: 'physical',
        },
        {
          id: '2',
          type: 'Vision Test',
          date: '2024-07-20',
          provider: 'Dr. Michael Chen',
          clinic: 'Vision Care Clinic',
          status: 'Normal',
          notes: '20/20 vision, no corrective lenses needed',
          expiryDate: '2025-07-20',
          category: 'screening',
        },
      ];

      const mockEmergencyContacts = [
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          relation: 'Primary Care Physician',
          phone: '+1-555-0123',
          priority: 1,
        },
        {
          id: '2',
          name: 'Mom - Jane Smith',
          relation: 'Parent',
          phone: '+1-555-0456',
          priority: 2,
        },
      ];

      const mockAllergies = [
        { id: '1', allergen: 'Peanuts', severity: 'Severe', reaction: 'Anaphylaxis' },
        { id: '2', allergen: 'Bee Stings', severity: 'Moderate', reaction: 'Swelling' },
      ];

      const mockMedications = [
        {
          id: '1',
          name: 'EpiPen Auto-Injector',
          dosage: '0.3mg',
          frequency: 'As needed',
          purpose: 'Severe allergic reactions',
          prescriber: 'Dr. Sarah Johnson',
        },
      ];

      setMedicalRecords(mockMedicalRecords);
      setEmergencyContacts(mockEmergencyContacts);
      setAllergies(mockAllergies);
      setMedications(mockMedications);
    } catch (error) {
      console.error('Error loading medical data:', error);
      Alert.alert('Error', 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMedicalData();
    setRefreshing(false);
  }, [loadMedicalData]);

  // Add new record
  const handleAddRecord = (type) => {
    setModalType(type);
    setFormData({});
    setShowAddModal(true);
  };

  // Save record
  const handleSaveRecord = () => {
    Alert.alert(
      '🚧 Feature Development',
      'Medical record management is currently under development. This feature will be available in the next update!',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
    setShowAddModal(false);
  };

  // Render medical record card
  const renderMedicalRecord = (record) => (
    <Card key={record.id} style={styles.recordCard} elevation={2}>
      <Card.Content>
        <View style={styles.recordHeader}>
          <View style={styles.recordTitleContainer}>
            <MaterialIcons
              name={record.category === 'physical' ? 'fitness-center' : 'visibility'}
              size={24}
              color={COLORS.primary}
            />
            <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
              {record.type}
            </Text>
          </View>
          <Chip
            mode="outlined"
            textStyle={{ fontSize: 12 }}
            style={{
              backgroundColor: record.status === 'Cleared for Activity' ? '#e8f5e8' : '#fff3e0',
            }}
          >
            {record.status}
          </Chip>
        </View>
        
        <View style={styles.recordDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.bodySmall, { marginLeft: SPACING.xs }]}>
              {new Date(record.date).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="person" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.bodySmall, { marginLeft: SPACING.xs }]}>
              {record.provider}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.bodySmall, { marginLeft: SPACING.xs }]}>
              {record.clinic}
            </Text>
          </View>
        </View>

        <Text style={[TEXT_STYLES.bodySmall, styles.recordNotes]}>
          {record.notes}
        </Text>

        {record.expiryDate && (
          <View style={styles.expiryContainer}>
            <MaterialIcons name="schedule" size={16} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.caption, { color: COLORS.warning, marginLeft: SPACING.xs }]}>
              Expires: {new Date(record.expiryDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  // Render emergency contact
  const renderEmergencyContact = (contact) => (
    <Card key={contact.id} style={styles.contactCard} elevation={1}>
      <Card.Content style={styles.contactContent}>
        <Avatar.Icon
          size={40}
          icon="phone"
          style={{ backgroundColor: COLORS.error }}
        />
        <View style={styles.contactInfo}>
          <Text style={TEXT_STYLES.h3}>{contact.name}</Text>
          <Text style={TEXT_STYLES.bodySmall}>{contact.relation}</Text>
          <Text style={[TEXT_STYLES.body, { color: COLORS.primary }]}>
            {contact.phone}
          </Text>
        </View>
        <IconButton
          icon="phone"
          iconColor={COLORS.success}
          size={24}
          onPress={() => Alert.alert('Call', `Call ${contact.name}?`)}
        />
      </Card.Content>
    </Card>
  );

  // Render allergy chip
  const renderAllergy = (allergy) => (
    <Chip
      key={allergy.id}
      mode="outlined"
      icon="warning"
      style={[
        styles.allergyChip,
        {
          backgroundColor: allergy.severity === 'Severe' ? '#ffebee' : '#fff3e0',
          borderColor: allergy.severity === 'Severe' ? COLORS.error : COLORS.warning,
        },
      ]}
      textStyle={{
        color: allergy.severity === 'Severe' ? COLORS.error : COLORS.warning,
        fontSize: 12,
      }}
    >
      {allergy.allergen}
    </Chip>
  );

  // Render medication
  const renderMedication = (medication) => (
    <Card key={medication.id} style={styles.medicationCard} elevation={1}>
      <Card.Content>
        <View style={styles.medicationHeader}>
          <MaterialIcons name="medication" size={24} color={COLORS.success} />
          <View style={styles.medicationInfo}>
            <Text style={TEXT_STYLES.h3}>{medication.name}</Text>
            <Text style={TEXT_STYLES.bodySmall}>
              {medication.dosage} • {medication.frequency}
            </Text>
          </View>
        </View>
        <Text style={[TEXT_STYLES.bodySmall, { marginTop: SPACING.sm }]}>
          Purpose: {medication.purpose}
        </Text>
        <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
          Prescribed by: {medication.prescriber}
        </Text>
      </Card.Content>
    </Card>
  );

  // Render add modal
  const renderAddModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.lg }]}>
            Add {modalType}
          </Text>
          
          <TextInput
            label="Title"
            mode="outlined"
            style={styles.input}
            value={formData.title || ''}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
          
          <TextInput
            label="Notes"
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            value={formData.notes || ''}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
          />
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowAddModal(false)}
              style={{ flex: 1, marginRight: SPACING.sm }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveRecord}
              style={{ flex: 1 }}
              buttonColor={COLORS.primary}
            >
              Save
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[TEXT_STYLES.h1, { color: 'white', textAlign: 'center' }]}>
            🏥 Medical Records
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', textAlign: 'center' }]}>
            {childProfile?.name}'s Health Information
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Contacts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h2}>🚨 Emergency Contacts</Text>
            <IconButton
              icon="plus"
              iconColor={COLORS.primary}
              size={24}
              onPress={() => handleAddRecord('Emergency Contact')}
            />
          </View>
          {emergencyContacts.map(renderEmergencyContact)}
        </View>

        {/* Allergies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h2}>⚠️ Allergies & Reactions</Text>
            <IconButton
              icon="plus"
              iconColor={COLORS.primary}
              size={24}
              onPress={() => handleAddRecord('Allergy')}
            />
          </View>
          <View style={styles.allergyContainer}>
            {allergies.map(renderAllergy)}
          </View>
        </View>

        {/* Current Medications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h2}>💊 Current Medications</Text>
            <IconButton
              icon="plus"
              iconColor={COLORS.primary}
              size={24}
              onPress={() => handleAddRecord('Medication')}
            />
          </View>
          {medications.map(renderMedication)}
        </View>

        {/* Medical Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h2}>📋 Medical Records</Text>
            <IconButton
              icon="plus"
              iconColor={COLORS.primary}
              size={24}
              onPress={() => handleAddRecord('Medical Record')}
            />
          </View>
          {medicalRecords.map(renderMedicalRecord)}
        </View>

        {/* Health Insights */}
        <Card style={styles.insightsCard} elevation={2}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.insightsGradient}
          >
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                📊 Health Status Overview
              </Text>
              <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', marginVertical: SPACING.sm }]}>
                All medical clearances are up to date! ✅
              </Text>
              <ProgressBar
                progress={1.0}
                color="white"
                style={{ height: 6, borderRadius: 3 }}
              />
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginTop: SPACING.sm }]}>
                Medical compliance: 100% complete
              </Text>
            </Card.Content>
          </LinearGradient>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="upload"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => Alert.alert(
          '📱 Document Upload',
          'Document upload feature coming soon! You\'ll be able to scan and upload medical documents directly.',
          [{ text: 'Sounds great! 🎉', style: 'default' }]
        )}
      />

      {renderAddModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recordCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recordTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordDetails: {
    marginVertical: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  recordNotes: {
    marginVertical: SPACING.sm,
    fontStyle: 'italic',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
  },
  contactCard: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  allergyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  allergyChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  medicationCard: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  insightsCard: {
    marginVertical: SPACING.lg,
    overflow: 'hidden',
  },
  insightsGradient: {
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 80,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.9,
    padding: SPACING.xl,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  input: {
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
});

export default MedicalRecords;