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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const EmergencyContacts = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, emergencyContacts, loading } = useSelector(state => ({
    user: state.auth.user,
    emergencyContacts: state.safety.emergencyContacts || [],
    loading: state.safety.loading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isPrimary: false,
  });

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = useCallback(() => {
    // Dispatch action to load emergency contacts
    dispatch({ type: 'LOAD_EMERGENCY_CONTACTS' });
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEmergencyContacts();
    setRefreshing(false);
  }, [loadEmergencyContacts]);

  const handleCall = (phoneNumber) => {
    Vibration.vibrate(50);
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to make phone call');
      }
    });
  };

  const handleAddContact = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      isPrimary: false,
    });
    setEditingContact(null);
    setShowAddModal(true);
  };

  const handleEditContact = (contact) => {
    setFormData(contact);
    setEditingContact(contact);
    setShowAddModal(true);
  };

  const handleSaveContact = () => {
    if (!formData.name || !formData.phone) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }

    const contactData = {
      ...formData,
      id: editingContact?.id || Date.now().toString(),
      userId: user.id,
      childId: user.childId,
    };

    if (editingContact) {
      dispatch({ type: 'UPDATE_EMERGENCY_CONTACT', payload: contactData });
    } else {
      dispatch({ type: 'ADD_EMERGENCY_CONTACT', payload: contactData });
    }

    setShowAddModal(false);
    Vibration.vibrate([50, 100, 50]);
  };

  const handleDeleteContact = (contactId) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'DELETE_EMERGENCY_CONTACT', payload: contactId });
            Vibration.vibrate(100);
          },
        },
      ]
    );
  };

  const getRelationshipIcon = (relationship) => {
    switch (relationship.toLowerCase()) {
      case 'parent':
      case 'mother':
      case 'father':
        return 'family-restroom';
      case 'guardian':
        return 'shield';
      case 'doctor':
        return 'medical-services';
      case 'school':
        return 'school';
      default:
        return 'person';
    }
  };

  const renderEmergencyContact = (contact) => (
    <Card key={contact.id} style={styles.contactCard} elevation={2}>
      <Card.Content style={styles.contactContent}>
        <View style={styles.contactHeader}>
          <View style={styles.avatarContainer}>
            <Avatar.Icon 
              size={50} 
              icon={getRelationshipIcon(contact.relationship)}
              style={[
                styles.avatar,
                contact.isPrimary && styles.primaryAvatar
              ]}
            />
            {contact.isPrimary && (
              <Chip 
                mode="flat" 
                style={styles.primaryChip}
                textStyle={styles.primaryChipText}
              >
                Primary
              </Chip>
            )}
          </View>
          <View style={styles.contactInfo}>
            <Text variant="titleMedium" style={styles.contactName}>
              {contact.name}
            </Text>
            <Text variant="bodyMedium" style={styles.relationship}>
              {contact.relationship}
            </Text>
            <Text variant="bodySmall" style={styles.phone}>
              📱 {contact.phone}
            </Text>
            {contact.email && (
              <Text variant="bodySmall" style={styles.email}>
                ✉️ {contact.email}
              </Text>
            )}
          </View>
          <View style={styles.contactActions}>
            <IconButton
              icon="phone"
              mode="contained"
              iconColor={COLORS.success}
              containerColor={COLORS.success + '20'}
              size={24}
              onPress={() => handleCall(contact.phone)}
            />
            <IconButton
              icon="edit"
              mode="outlined"
              iconColor={COLORS.primary}
              size={20}
              onPress={() => handleEditContact(contact)}
            />
            <IconButton
              icon="delete"
              mode="outlined"
              iconColor={COLORS.error}
              size={20}
              onPress={() => handleDeleteContact(contact.id)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAddModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface} elevation={4}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
            </Text>
            <IconButton
              icon="close"
              onPress={() => setShowAddModal(false)}
            />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              label="Full Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
            />
            
            <TextInput
              label="Relationship *"
              value={formData.relationship}
              onChangeText={(text) => setFormData({ ...formData, relationship: text })}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="family-restroom" />}
              placeholder="e.g., Parent, Guardian, Doctor"
            />
            
            <TextInput
              label="Phone Number *"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
            />
            
            <TextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email" />}
            />
            
            <View style={styles.switchContainer}>
              <Text variant="bodyLarge">Set as Primary Contact</Text>
              <IconButton
                icon={formData.isPrimary ? "toggle-switch" : "toggle-switch-off"}
                iconColor={formData.isPrimary ? COLORS.primary : COLORS.secondary}
                onPress={() => setFormData({ ...formData, isPrimary: !formData.isPrimary })}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowAddModal(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveContact}
              style={styles.saveButton}
              buttonColor={COLORS.primary}
            >
              {editingContact ? 'Update' : 'Add Contact'}
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="contact-emergency" size={80} color={COLORS.secondary} />
      <Text variant="titleMedium" style={styles.emptyTitle}>
        No Emergency Contacts Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Add trusted contacts who can be reached in case of emergencies during training sessions.
      </Text>
      <Button
        mode="contained"
        onPress={handleAddContact}
        style={styles.emptyButton}
        buttonColor={COLORS.primary}
        icon="plus"
      >
        Add First Contact
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
            🆘 Emergency Contacts
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Important contacts for safety during activities
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
        {/* Safety Info Card */}
        <Card style={styles.safetyInfoCard} elevation={2}>
          <Card.Content>
            <View style={styles.safetyHeader}>
              <Icon name="security" size={24} color={COLORS.primary} />
              <Text variant="titleMedium" style={styles.safetyTitle}>
                Safety First! 🛡️
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.safetyText}>
              These contacts will be notified in case of emergencies during training sessions. Make sure all information is current and accurate.
            </Text>
          </Card.Content>
        </Card>

        {/* Emergency Contacts List */}
        <View style={styles.contactsList}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Your Emergency Contacts ({emergencyContacts.length})
          </Text>
          
          {emergencyContacts.length === 0 ? (
            renderEmptyState()
          ) : (
            emergencyContacts.map(renderEmergencyContact)
          )}
        </View>

        {/* Quick Actions */}
        {emergencyContacts.length > 0 && (
          <Card style={styles.quickActionsCard} elevation={2}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.quickActionsTitle}>
                Quick Actions 🚀
              </Text>
              <View style={styles.quickActionsGrid}>
                <Button
                  mode="contained-tonal"
                  icon="phone"
                  onPress={() => {
                    const primaryContact = emergencyContacts.find(c => c.isPrimary) || emergencyContacts[0];
                    if (primaryContact) handleCall(primaryContact.phone);
                  }}
                  style={styles.quickActionButton}
                  buttonColor={COLORS.success + '30'}
                  textColor={COLORS.success}
                >
                  Call Primary
                </Button>
                <Button
                  mode="contained-tonal"
                  icon="medical-services"
                  onPress={() => handleCall('911')}
                  style={styles.quickActionButton}
                  buttonColor={COLORS.error + '30'}
                  textColor={COLORS.error}
                >
                  Emergency 911
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Contact FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddContact}
        label="Add Contact"
        color="white"
        customSize={56}
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
  safetyInfoCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  safetyTitle: {
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },
  safetyText: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  contactsList: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  contactCard: {
    marginBottom: SPACING.md,
  },
  contactContent: {
    padding: SPACING.sm,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  primaryAvatar: {
    backgroundColor: COLORS.success,
  },
  primaryChip: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.success + '20',
  },
  primaryChipText: {
    fontSize: 10,
    color: COLORS.success,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  relationship: {
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  phone: {
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  email: {
    color: COLORS.textSecondary,
  },
  contactActions: {
    alignItems: 'center',
  },
  quickActionsCard: {
    marginBottom: SPACING.xl,
  },
  quickActionsTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 0.48,
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
    maxHeight: 400,
  },
  input: {
    marginBottom: SPACING.md,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
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
    minWidth: 100,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default EmergencyContacts;