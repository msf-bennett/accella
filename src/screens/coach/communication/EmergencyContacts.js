import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Linking,
  Animated,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import { 
  Card,
  Button,
  Searchbar,
  Avatar,
  Chip,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
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
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const EmergencyContacts = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Mock data - replace with real data from Redux store
  const [playersWithContacts, setPlayersWithContacts] = useState([
    {
      id: '1',
      name: 'Alex Johnson',
      avatar: 'https://i.pravatar.cc/100?img=1',
      position: 'Forward',
      age: 16,
      emergencyContacts: [
        {
          id: 'c1',
          name: 'Sarah Johnson',
          relationship: 'Mother',
          phone: '+1234567890',
          email: 'sarah.johnson@email.com',
          isPrimary: true,
        },
        {
          id: 'c2',
          name: 'Mike Johnson',
          relationship: 'Father',
          phone: '+1234567891',
          email: 'mike.johnson@email.com',
          isPrimary: false,
        },
      ],
    },
    {
      id: '2',
      name: 'Emma Davis',
      avatar: 'https://i.pravatar.cc/100?img=2',
      position: 'Midfielder',
      age: 15,
      emergencyContacts: [
        {
          id: 'c3',
          name: 'Jennifer Davis',
          relationship: 'Mother',
          phone: '+1234567892',
          email: 'jen.davis@email.com',
          isPrimary: true,
        },
      ],
    },
  ]);

  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isPrimary: false,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleCall = useCallback((phoneNumber) => {
    Vibration.vibrate(10);
    Linking.openURL(`tel:${phoneNumber}`);
  }, []);

  const handleEmail = useCallback((email) => {
    Vibration.vibrate(10);
    Linking.openURL(`mailto:${email}`);
  }, []);

  const handleSMS = useCallback((phoneNumber) => {
    Vibration.vibrate(10);
    Linking.openURL(`sms:${phoneNumber}`);
  }, []);

  const handleAddContact = () => {
    if (!selectedPlayer) {
      Alert.alert('Select Player', 'Please select a player first');
      return;
    }
    setShowAddModal(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setNewContact({...contact});
    setShowEditModal(true);
  };

  const saveContact = () => {
    if (!newContact.name || !newContact.phone || !newContact.relationship) {
      Alert.alert('Required Fields', 'Please fill in all required fields');
      return;
    }

    // Update the player's contacts
    setPlayersWithContacts(prev => 
      prev.map(player => 
        player.id === selectedPlayer.id
          ? {
              ...player,
              emergencyContacts: editingContact
                ? player.emergencyContacts.map(c => 
                    c.id === editingContact.id ? {...newContact} : c
                  )
                : [...player.emergencyContacts, {...newContact, id: Date.now().toString()}]
            }
          : player
      )
    );

    // Reset form
    setNewContact({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      isPrimary: false,
    });
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingContact(null);

    Vibration.vibrate([10, 50, 10]);
  };

  const deleteContact = (contactId) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPlayersWithContacts(prev =>
              prev.map(player =>
                player.id === selectedPlayer?.id
                  ? {
                      ...player,
                      emergencyContacts: player.emergencyContacts.filter(c => c.id !== contactId)
                    }
                  : player
              )
            );
            Vibration.vibrate(10);
          },
        },
      ]
    );
  };

  const filteredPlayers = playersWithContacts.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPlayerCard = (player) => (
    <Card key={player.id} style={styles.playerCard}>
      <TouchableOpacity
        onPress={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}
      >
        <Card.Content>
          <View style={styles.playerHeader}>
            <Avatar.Image size={50} source={{ uri: player.avatar }} />
            <View style={styles.playerInfo}>
              <Text style={TEXT_STYLES.h3}>{player.name}</Text>
              <Text style={TEXT_STYLES.caption}>
                {player.position} • Age {player.age}
              </Text>
              <Text style={TEXT_STYLES.small}>
                {player.emergencyContacts.length} emergency contact{player.emergencyContacts.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Icon
              name={selectedPlayer?.id === player.id ? "expand-less" : "expand-more"}
              size={24}
              color={COLORS.textSecondary}
            />
          </View>
        </Card.Content>
      </TouchableOpacity>

      {selectedPlayer?.id === player.id && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Card.Content style={styles.contactsSection}>
            <View style={styles.sectionHeader}>
              <Text style={TEXT_STYLES.h3}>Emergency Contacts 🚨</Text>
              <IconButton
                icon="add"
                size={24}
                iconColor={COLORS.primary}
                onPress={handleAddContact}
              />
            </View>

            {player.emergencyContacts.map((contact) => (
              <Surface key={contact.id} style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactInfo}>
                    <View style={styles.contactTitleRow}>
                      <Text style={TEXT_STYLES.body}>{contact.name}</Text>
                      {contact.isPrimary && (
                        <Chip mode="outlined" compact textStyle={styles.primaryChip}>
                          Primary
                        </Chip>
                      )}
                    </View>
                    <Text style={TEXT_STYLES.caption}>{contact.relationship}</Text>
                  </View>
                  <IconButton
                    icon="edit"
                    size={20}
                    iconColor={COLORS.textSecondary}
                    onPress={() => handleEditContact(contact)}
                  />
                </View>

                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCall(contact.phone)}
                  >
                    <Icon name="call" size={20} color={COLORS.success} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                      Call
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSMS(contact.phone)}
                  >
                    <Icon name="message" size={20} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                      SMS
                    </Text>
                  </TouchableOpacity>

                  {contact.email && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEmail(contact.email)}
                    >
                      <Icon name="email" size={20} color={COLORS.secondary} />
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                        Email
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteContact(contact.id)}
                  >
                    <Icon name="delete" size={20} color={COLORS.error} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.error }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.contactDetails}>
                  <Text style={TEXT_STYLES.small}>📞 {contact.phone}</Text>
                  {contact.email && (
                    <Text style={TEXT_STYLES.small}>✉️ {contact.email}</Text>
                  )}
                </View>
              </Surface>
            ))}

            {player.emergencyContacts.length === 0 && (
              <Surface style={styles.emptyState}>
                <Icon name="contact-emergency" size={48} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
                  No emergency contacts added yet
                </Text>
                <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
                  Add contacts to ensure player safety
                </Text>
              </Surface>
            )}
          </Card.Content>
        </Animated.View>
      )}
    </Card>
  );

  const ContactModal = ({ visible, onDismiss, title }) => (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.lg }]}>
              {title}
            </Text>

            <TextInput
              label="Name *"
              value={newContact.name}
              onChangeText={(text) => setNewContact(prev => ({ ...prev, name: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Relationship *"
              value={newContact.relationship}
              onChangeText={(text) => setNewContact(prev => ({ ...prev, relationship: text }))}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Mother, Father, Guardian"
            />

            <TextInput
              label="Phone Number *"
              value={newContact.phone}
              onChangeText={(text) => setNewContact(prev => ({ ...prev, phone: text }))}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
            />

            <TextInput
              label="Email (Optional)"
              value={newContact.email}
              onChangeText={(text) => setNewContact(prev => ({ ...prev, email: text }))}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
            />

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setNewContact(prev => ({ ...prev, isPrimary: !prev.isPrimary }))}
            >
              <Icon
                name={newContact.isPrimary ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={COLORS.primary}
              />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                Set as primary contact
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={onDismiss} style={styles.modalButton}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={saveContact}
                style={styles.modalButton}
                buttonColor={COLORS.primary}
              >
                {editingContact ? 'Update' : 'Add'} Contact
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>Emergency Contacts 🚨</Text>
        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
          Manage player emergency contacts for safety
        </Text>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Searchbar
          placeholder="Search players..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />

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
          <View style={styles.statsRow}>
            <Surface style={styles.statCard}>
              <Text style={TEXT_STYLES.h2}>{playersWithContacts.length}</Text>
              <Text style={TEXT_STYLES.caption}>Players</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={TEXT_STYLES.h2}>
                {playersWithContacts.reduce((sum, player) => sum + player.emergencyContacts.length, 0)}
              </Text>
              <Text style={TEXT_STYLES.caption}>Total Contacts</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={TEXT_STYLES.h2}>
                {playersWithContacts.filter(player => 
                  player.emergencyContacts.some(contact => contact.isPrimary)
                ).length}
              </Text>
              <Text style={TEXT_STYLES.caption}>Have Primary</Text>
            </Surface>
          </View>

          {filteredPlayers.length === 0 && (
            <Surface style={styles.emptyState}>
              <Icon name="people" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginTop: SPACING.md }]}>
                No players found
              </Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
                {searchQuery ? 'Try adjusting your search' : 'Add players to manage their emergency contacts'}
              </Text>
            </Surface>
          )}

          {filteredPlayers.map(renderPlayerCard)}

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      <ContactModal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        title="Add Emergency Contact"
      />

      <ContactModal
        visible={showEditModal}
        onDismiss={() => {
          setShowEditModal(false);
          setEditingContact(null);
          setNewContact({
            name: '',
            relationship: '',
            phone: '',
            email: '',
            isPrimary: false,
          });
        }}
        title="Edit Emergency Contact"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  playerCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 16,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contactsSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  contactCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contactInfo: {
    flex: 1,
  },
  contactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  primaryChip: {
    fontSize: 10,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.md,
  },
  actionButton: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  contactDetails: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 12,
    elevation: 1,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    padding: SPACING.lg,
    borderRadius: 16,
    maxHeight: '80%',
  },
  input: {
    marginBottom: SPACING.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default EmergencyContacts;