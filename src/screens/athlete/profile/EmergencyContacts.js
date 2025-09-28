import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  TouchableOpacity,
  Linking,
  Vibration,
  StyleSheet,
} from 'react-native';
import { 
  Card,
  Button,
  IconButton,
  FAB,
  Surface,
  Avatar,
  Chip,
  Searchbar,
  Portal,
  Modal,
  TextInput,
  Menu,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const EmergencyContacts = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, emergencyContacts } = useSelector(state => state.profile);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [menuVisible, setMenuVisible] = useState(null);
  
  // Animation values - Fixed initialization
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Form state for adding/editing contacts
  const [contactForm, setContactForm] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    isPrimary: false,
  });

  const relationships = [
    'Parent', 'Guardian', 'Spouse', 'Sibling', 'Friend', 
    'Doctor', 'Coach', 'Emergency Service', 'Other'
  ];

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulate API call - replace with actual Redux action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual data loading
      const mockContacts = [
        {
          id: '1',
          name: 'John Smith',
          relationship: 'Parent',
          phone: '+1-555-0123',
          email: 'john.smith@email.com',
          address: '123 Main St, City',
          isPrimary: true,
          avatar: null,
        },
        {
          id: '2',
          name: 'Dr. Sarah Johnson',
          relationship: 'Doctor',
          phone: '+1-555-0456',
          email: 'dr.johnson@clinic.com',
          address: 'Medical Center, Downtown',
          isPrimary: false,
          avatar: null,
        },
      ];
      
      // dispatch(updateEmergencyContacts(mockContacts));
    } catch (error) {
      Alert.alert('Error', 'Failed to load emergency contacts');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEmergencyContacts();
    setRefreshing(false);
  }, [loadEmergencyContacts]);

  const handleAddContact = () => {
    setEditingContact(null);
    setContactForm({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      isPrimary: false,
    });
    setShowAddModal(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setContactForm(contact);
    setShowAddModal(true);
  };

  const handleSaveContact = async () => {
    try {
      if (!contactForm.name || !contactForm.phone || !contactForm.relationship) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      Vibration.vibrate(50);
      
      // TODO: Implement actual save logic with Redux
      Alert.alert(
        'Success',
        editingContact ? 'Contact updated successfully!' : 'Contact added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowAddModal(false);
              loadEmergencyContacts();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save contact');
    }
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
          onPress: async () => {
            try {
              Vibration.vibrate(100);
              // TODO: Implement actual delete logic
              Alert.alert('Success', 'Contact deleted successfully');
              loadEmergencyContacts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete contact');
            }
          }
        }
      ]
    );
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
    Vibration.vibrate(50);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
    Vibration.vibrate(50);
  };

  const filteredContacts = emergencyContacts?.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const renderContactCard = (contact) => (
    <Animated.View
      key={contact.id}
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
      }}
    >
      <Card style={styles.contactCard} elevation={2}>
        <Card.Content>
          <View style={styles.contactHeader}>
            <View style={styles.contactInfo}>
              <Avatar.Text
                size={50}
                label={contact.name.charAt(0)}
                style={{
                  backgroundColor: contact.isPrimary ? COLORS.primary : COLORS.secondary
                }}
              />
              <View style={styles.contactDetails}>
                <Text style={[TEXT_STYLES.h3, styles.contactName]}>
                  {contact.name}
                </Text>
                <View style={styles.relationshipChip}>
                  <Chip
                    mode="outlined"
                    compact
                    icon={contact.isPrimary ? "star" : "person"}
                    style={{
                      backgroundColor: contact.isPrimary ? COLORS.primary + '20' : 'transparent'
                    }}
                  >
                    {contact.relationship}{contact.isPrimary ? ' (Primary)' : ''}
                  </Chip>
                </View>
              </View>
            </View>
            <Menu
              visible={menuVisible === contact.id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(contact.id)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  setMenuVisible(null);
                  handleEditContact(contact);
                }}
                title="Edit"
                leadingIcon="edit"
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(null);
                  handleDeleteContact(contact.id);
                }}
                title="Delete"
                leadingIcon="delete"
              />
            </Menu>
          </View>

          <Divider style={{ marginVertical: SPACING.md }} />

          <View style={styles.contactActions}>
            <Surface style={styles.actionButton} elevation={1}>
              <TouchableOpacity
                style={styles.actionButtonContent}
                onPress={() => handleCall(contact.phone)}
              >
                <Icon name="phone" size={20} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                  Call
                </Text>
              </TouchableOpacity>
            </Surface>

            {contact.email && (
              <Surface style={styles.actionButton} elevation={1}>
                <TouchableOpacity
                  style={styles.actionButtonContent}
                  onPress={() => handleEmail(contact.email)}
                >
                  <Icon name="email" size={20} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                    Email
                  </Text>
                </TouchableOpacity>
              </Surface>
            )}

            <Surface style={styles.actionButton} elevation={1}>
              <TouchableOpacity style={styles.actionButtonContent}>
                <Icon name="message" size={20} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                  Message
                </Text>
              </TouchableOpacity>
            </Surface>
          </View>

          <View style={styles.contactMeta}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              📱 {contact.phone}
            </Text>
            {contact.email && (
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                📧 {contact.email}
              </Text>
            )}
            {contact.address && (
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                📍 {contact.address}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderAddContactModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
          <View style={styles.modalContent}>
            <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
              {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
            </Text>

            <TextInput
              label="Full Name *"
              value={contactForm.name}
              onChangeText={(text) => setContactForm({ ...contactForm, name: text })}
              style={styles.input}
              left={<TextInput.Icon icon="person" />}
            />

            <View style={styles.relationshipSelector}>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.xs }]}>
                Relationship *
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {relationships.map((rel) => (
                  <Chip
                    key={rel}
                    mode={contactForm.relationship === rel ? 'flat' : 'outlined'}
                    selected={contactForm.relationship === rel}
                    onPress={() => setContactForm({ ...contactForm, relationship: rel })}
                    style={{ marginRight: SPACING.xs }}
                  >
                    {rel}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <TextInput
              label="Phone Number *"
              value={contactForm.phone}
              onChangeText={(text) => setContactForm({ ...contactForm, phone: text })}
              style={styles.input}
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
            />

            <TextInput
              label="Email Address"
              value={contactForm.email}
              onChangeText={(text) => setContactForm({ ...contactForm, email: text })}
              style={styles.input}
              keyboardType="email-address"
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Address"
              value={contactForm.address}
              onChangeText={(text) => setContactForm({ ...contactForm, address: text })}
              style={styles.input}
              multiline
              left={<TextInput.Icon icon="location-on" />}
            />

            <View style={styles.primaryToggle}>
              <Text style={TEXT_STYLES.body}>Set as Primary Contact</Text>
              <IconButton
                icon={contactForm.isPrimary ? "star" : "star-border"}
                size={24}
                iconColor={contactForm.isPrimary ? COLORS.primary : COLORS.textSecondary}
                onPress={() => setContactForm({ ...contactForm, isPrimary: !contactForm.isPrimary })}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddModal(false)}
                style={{ marginRight: SPACING.md }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveContact}
                buttonColor={COLORS.primary}
              >
                {editingContact ? 'Update' : 'Add'} Contact
              </Button>
            </View>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="contact-emergency" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
        No Emergency Contacts Yet
      </Text>
      <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
        Add emergency contacts to ensure quick access during urgent situations 🚨
      </Text>
      <Button
        mode="contained"
        onPress={handleAddContact}
        style={styles.emptyButton}
        buttonColor={COLORS.primary}
        icon="add"
      >
        Add First Contact
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>
          Emergency Contacts
        </Text>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Keep your important contacts safe & accessible 🆘
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search contacts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          icon="search"
          clearIcon="close"
        />

        {filteredContacts.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollView
            style={styles.scrollView}
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
            <View style={styles.statsRow}>
              <Surface style={styles.statCard} elevation={1}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Total Contacts
                </Text>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                  {filteredContacts.length}
                </Text>
              </Surface>
              <Surface style={styles.statCard} elevation={1}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Primary Contact
                </Text>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
                  {filteredContacts.filter(c => c.isPrimary).length}
                </Text>
              </Surface>
            </View>

            {filteredContacts.map(renderContactCard)}

            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </View>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleAddContact}
        color={COLORS.background}
        rippleColor={COLORS.primary + '30'}
      />

      {renderAddContactModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: COLORS.background + 'CC',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  searchBar: {
    marginVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  scrollView: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  contactCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  contactName: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  relationshipChip: {
    alignSelf: 'flex-start',
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.md,
  },
  actionButton: {
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  actionButtonContent: {
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: 60,
  },
  contactMeta: {
    marginTop: SPACING.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.lg,
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyButton: {
    marginTop: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  relationshipSelector: {
    marginBottom: SPACING.md,
  },
  primaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
  },
});

export default EmergencyContacts;