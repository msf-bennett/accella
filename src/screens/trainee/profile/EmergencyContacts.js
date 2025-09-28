import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Vibration,
  Linking,
} from 'react-native';
import {
  Card,
  Button,
  IconButton,
  Avatar,
  Surface,
  Portal,
  Modal,
  TextInput,
  Chip,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';
import { Text } from '../components/StyledText';

const EmergencyContacts = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { emergencyContacts, loading } = useSelector(state => state.profile);

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    primaryPhone: '',
    secondaryPhone: '',
    email: '',
    address: '',
  });

  const relationships = [
    'Parent', 'Spouse', 'Sibling', 'Friend', 'Guardian', 
    'Doctor', 'Coach', 'Other'
  ];

  useEffect(() => {
    // Load emergency contacts on component mount
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = useCallback(async () => {
    try {
      // Dispatch action to load emergency contacts
      // dispatch(loadUserEmergencyContacts(user.id));
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  }, [user.id, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEmergencyContacts();
    setRefreshing(false);
  }, [loadEmergencyContacts]);

  const handleAddContact = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      relationship: '',
      primaryPhone: '',
      secondaryPhone: '',
      email: '',
      address: '',
    });
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setFormData(contact);
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  const handleSaveContact = async () => {
    if (!formData.name.trim() || !formData.primaryPhone.trim()) {
      Alert.alert('Required Fields', 'Please fill in name and primary phone number.');
      return;
    }

    try {
      if (editingContact) {
        // dispatch(updateEmergencyContact({ ...formData, id: editingContact.id }));
      } else {
        // dispatch(addEmergencyContact(formData));
      }
      setModalVisible(false);
      Vibration.vibrate([50, 50, 50]);
      
      // Temporary alert for development
      Alert.alert(
        '🚧 Feature in Development',
        'Emergency contacts management is being built. This will sync with your profile data.',
        [{ text: 'Got it!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save emergency contact. Please try again.');
    }
  };

  const handleDeleteContact = (contactId) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // dispatch(deleteEmergencyContact(contactId));
            Vibration.vibrate(100);
          },
        },
      ]
    );
  };

  const handleCallContact = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
        Vibration.vibrate(50);
      } else {
        Alert.alert('Error', 'Phone calling is not supported on this device.');
      }
    });
  };

  const renderEmergencyContact = (contact) => (
    <Card key={contact.id} style={styles.contactCard}>
      <Card.Content>
        <View style={styles.contactHeader}>
          <View style={styles.contactInfo}>
            <Avatar.Text
              size={48}
              label={contact.name.substring(0, 2).toUpperCase()}
              style={[styles.avatar, { backgroundColor: COLORS.primary }]}
            />
            <View style={styles.contactDetails}>
              <Text style={TEXT_STYLES.h3}>{contact.name}</Text>
              <View style={styles.relationshipContainer}>
                <Chip
                  icon="account-heart"
                  mode="outlined"
                  compact
                  style={styles.relationshipChip}
                >
                  {contact.relationship}
                </Chip>
              </View>
            </View>
          </View>
          <View style={styles.contactActions}>
            <IconButton
              icon="phone"
              mode="contained"
              iconColor={COLORS.success}
              size={20}
              onPress={() => handleCallContact(contact.primaryPhone)}
            />
            <IconButton
              icon="pencil"
              mode="outlined"
              size={18}
              onPress={() => handleEditContact(contact)}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.contactInfoSection}>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{contact.primaryPhone}</Text>
            <IconButton
              icon="phone"
              size={16}
              onPress={() => handleCallContact(contact.primaryPhone)}
            />
          </View>

          {contact.secondaryPhone && (
            <View style={styles.infoRow}>
              <MaterialIcons name="phone-android" size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>{contact.secondaryPhone}</Text>
              <IconButton
                icon="phone"
                size={16}
                onPress={() => handleCallContact(contact.secondaryPhone)}
              />
            </View>
          )}

          {contact.email && (
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>{contact.email}</Text>
            </View>
          )}

          {contact.address && (
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={18} color={COLORS.textSecondary} />
              <Text style={[styles.infoText, { flex: 1 }]}>{contact.address}</Text>
            </View>
          )}
        </View>
      </Card.Content>

      <Card.Actions>
        <Button
          mode="text"
          onPress={() => handleDeleteContact(contact.id)}
          textColor={COLORS.error}
          icon="delete"
        >
          Remove
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderContactForm = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.formContainer}>
          <View style={styles.modalHeader}>
            <Text style={TEXT_STYLES.h2}>
              {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
            </Text>
            <IconButton
              icon="close"
              onPress={() => setModalVisible(false)}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              label="Full Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

            <View style={styles.chipContainer}>
              <Text style={styles.chipLabel}>Relationship</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {relationships.map((rel) => (
                    <Chip
                      key={rel}
                      mode={formData.relationship === rel ? 'flat' : 'outlined'}
                      selected={formData.relationship === rel}
                      onPress={() => setFormData({ ...formData, relationship: rel })}
                      style={styles.relationshipOption}
                    >
                      {rel}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </View>

            <TextInput
              label="Primary Phone *"
              value={formData.primaryPhone}
              onChangeText={(text) => setFormData({ ...formData, primaryPhone: text })}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
            />

            <TextInput
              label="Secondary Phone"
              value={formData.secondaryPhone}
              onChangeText={(text) => setFormData({ ...formData, secondaryPhone: text })}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              left={<TextInput.Icon icon="phone-android" />}
            />

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              mode="outlined"
              keyboardType="email-address"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              left={<TextInput.Icon icon="map-marker" />}
            />

            <View style={styles.formActions}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveContact}
                style={styles.saveButton}
              >
                {editingContact ? 'Update' : 'Add'} Contact
              </Button>
            </View>
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  // Mock data for development
  const mockContacts = [
    {
      id: 1,
      name: 'John Smith',
      relationship: 'Parent',
      primaryPhone: '+1 (555) 123-4567',
      secondaryPhone: '+1 (555) 987-6543',
      email: 'john.smith@email.com',
      address: '123 Main St, Anytown, ST 12345'
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      relationship: 'Doctor',
      primaryPhone: '+1 (555) 246-8135',
      email: 'dr.johnson@hospital.com',
      address: 'City General Hospital, 456 Health Ave'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Emergency Contacts</Text>
          <Text style={styles.headerSubtitle}>
            Keep your emergency contacts updated for safety during training 🚨
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        <View style={styles.infoCard}>
          <Card style={styles.infoCardContent}>
            <Card.Content>
              <View style={styles.infoHeader}>
                <MaterialIcons name="info" size={24} color={COLORS.primary} />
                <Text style={TEXT_STYLES.h3}>Why Emergency Contacts?</Text>
              </View>
              <Text style={styles.infoText}>
                Emergency contacts help ensure your safety during training sessions. 
                Your coach and training facility can quickly reach your contacts if needed.
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.contactsSection}>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h2}>Your Emergency Contacts</Text>
            <Chip
              icon="account-multiple"
              mode="outlined"
              compact
            >
              {mockContacts.length} contacts
            </Chip>
          </View>

          {mockContacts.length > 0 ? (
            mockContacts.map(renderEmergencyContact)
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialIcons name="contact-emergency" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
                <Text style={styles.emptySubtitle}>
                  Add at least one emergency contact to ensure your safety during training
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      <Button
        mode="contained"
        icon="plus"
        onPress={handleAddContact}
        style={styles.fab}
        contentStyle={styles.fabContent}
      >
        Add Contact
      </Button>

      {renderContactForm()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  infoCard: {
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
  },
  infoCardContent: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  contactsSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  contactCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  contactInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.sm,
  },
  contactDetails: {
    flex: 1,
  },
  relationshipContainer: {
    marginTop: SPACING.xs,
  },
  relationshipChip: {
    alignSelf: 'flex-start',
  },
  contactActions: {
    flexDirection: 'row',
  },
  divider: {
    marginVertical: SPACING.sm,
  },
  contactInfoSection: {
    marginTop: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  emptyCard: {
    marginVertical: SPACING.lg,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.md,
    left: SPACING.md,
    elevation: 8,
  },
  fabContent: {
    paddingVertical: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  formContainer: {
    maxHeight: '90%',
    borderRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  input: {
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  chipContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  chipLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  chipRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
  },
  relationshipOption: {
    marginRight: SPACING.sm,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
};

export default EmergencyContacts;