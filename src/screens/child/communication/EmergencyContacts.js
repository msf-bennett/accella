import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
  Animated,
  Linking,
  Vibration,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  Card,
  Button,
  Avatar,
  Surface,
  IconButton,
  FAB,
  Badge,
  Searchbar,
  Portal,
  Modal,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  emergency: '#d32f2f',
  emergencyLight: '#ffebee',
  safety: '#388e3c',
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Redux state
  const { user, isLoading } = useSelector(state => state.auth);
  const { emergencyContacts, userLocation } = useSelector(state => state.safety);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [lastEmergencyCall, setLastEmergencyCall] = useState(null);

  // Emergency pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (isEmergencyMode) {
      pulse.start();
    } else {
      pulse.stop();
      pulseAnim.setValue(1);
    }
    
    return () => pulse.stop();
  }, [isEmergencyMode, pulseAnim]);

  // Mock emergency contacts data
  const mockEmergencyContacts = [
    {
      id: 'parent_1',
      name: 'Mom - Sarah Johnson',
      phone: '+1-555-123-4567',
      email: 'sarah.johnson@email.com',
      relationship: 'Parent',
      priority: 1,
      avatar: 'https://i.pravatar.cc/150?img=1',
      isPrimary: true,
      isAvailable: true,
      location: 'Home',
      notes: 'Primary guardian, available 24/7',
      lastContact: '2 hours ago',
    },
    {
      id: 'parent_2',
      name: 'Dad - Michael Johnson',
      phone: '+1-555-987-6543',
      email: 'michael.johnson@email.com',
      relationship: 'Parent',
      priority: 2,
      avatar: 'https://i.pravatar.cc/150?img=2',
      isPrimary: true,
      isAvailable: true,
      location: 'Work',
      notes: 'Secondary guardian',
      lastContact: '5 hours ago',
    },
    {
      id: 'emergency_1',
      name: 'Emergency Services',
      phone: '911',
      email: null,
      relationship: 'Emergency',
      priority: 0,
      avatar: null,
      isPrimary: false,
      isAvailable: true,
      location: 'Local Emergency',
      notes: 'For immediate emergencies only',
      lastContact: 'Never',
      isEmergencyService: true,
    },
    {
      id: 'coach_1',
      name: 'Coach Sarah Wilson',
      phone: '+1-555-456-7890',
      email: 'sarah.wilson@academy.com',
      relationship: 'Coach',
      priority: 3,
      avatar: 'https://i.pravatar.cc/150?img=3',
      isPrimary: false,
      isAvailable: true,
      location: 'Sports Academy',
      notes: 'Football coach, available during training hours',
      lastContact: 'Yesterday',
    },
    {
      id: 'guardian_1',
      name: 'Grandma - Mary Johnson',
      phone: '+1-555-321-0987',
      email: 'mary.johnson@email.com',
      relationship: 'Guardian',
      priority: 4,
      avatar: 'https://i.pravatar.cc/150?img=4',
      isPrimary: false,
      isAvailable: true,
      location: 'Home',
      notes: 'Backup guardian, lives nearby',
      lastContact: '3 days ago',
    },
    {
      id: 'medical_1',
      name: 'Dr. Emily Chen - Pediatrician',
      phone: '+1-555-654-3210',
      email: 'emily.chen@medical.com',
      relationship: 'Medical',
      priority: 5,
      avatar: 'https://i.pravatar.cc/150?img=5',
      isPrimary: false,
      isAvailable: false,
      location: 'Medical Center',
      notes: 'Family doctor, office hours 9AM-5PM',
      lastContact: '2 weeks ago',
    },
  ];

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Filter contacts based on search
    filterContacts();
  }, [fadeAnim, slideAnim, searchQuery]);

  const filterContacts = useCallback(() => {
    const filtered = mockEmergencyContacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.relationship.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.phone && contact.phone.includes(searchQuery))
    );
    
    // Sort by priority (lower number = higher priority)
    filtered.sort((a, b) => a.priority - b.priority);
    setFilteredContacts(filtered);
  }, [searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh emergency contacts
      await new Promise(resolve => setTimeout(resolve, 1000));
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh emergency contacts');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const makeCall = async (contact) => {
    try {
      Vibration.vibrate(100);
      
      if (contact.isEmergencyService) {
        Alert.alert(
          '🚨 Emergency Call',
          'You are about to call Emergency Services. This should only be used in real emergencies.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Call 911', 
              style: 'destructive',
              onPress: async () => {
                setLastEmergencyCall(new Date().toISOString());
                await Linking.openURL(`tel:${contact.phone}`);
              }
            }
          ]
        );
        return;
      }

      // For regular contacts
      Alert.alert(
        `Call ${contact.name}? 📞`,
        `Are you sure you want to call ${contact.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Call Now', 
            onPress: async () => {
              await Linking.openURL(`tel:${contact.phone}`);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Could not make the call. Please try again.');
    }
  };

  const sendMessage = (contact) => {
    if (contact.isEmergencyService) {
      Alert.alert('Info', 'Emergency services should be called, not texted.');
      return;
    }

    Vibration.vibrate(50);
    Alert.alert(
      `Message ${contact.name}? 💬`,
      'This will open your messaging app.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Message', 
          onPress: () => {
            Linking.openURL(`sms:${contact.phone}`);
          }
        }
      ]
    );
  };

  const viewContactDetails = (contact) => {
    Vibration.vibrate(50);
    setSelectedContact(contact);
    setShowContactModal(true);
  };

  const activateEmergencyMode = () => {
    Alert.alert(
      '🚨 Emergency Mode',
      'This will make it easier to quickly contact emergency services and your parents. Only use in real emergencies!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Activate', 
          style: 'destructive',
          onPress: () => {
            setIsEmergencyMode(true);
            Vibration.vibrate([100, 50, 100, 50, 100]);
            
            // Auto-deactivate after 5 minutes for safety
            setTimeout(() => {
              setIsEmergencyMode(false);
            }, 300000);
          }
        }
      ]
    );
  };

  const getContactIcon = (relationship) => {
    switch (relationship.toLowerCase()) {
      case 'parent': return 'family-restroom';
      case 'coach': return 'sports';
      case 'medical': return 'local-hospital';
      case 'guardian': return 'shield';
      case 'emergency': return 'emergency';
      default: return 'contact-phone';
    }
  };

  const getRelationshipColor = (relationship, isEmergencyService = false) => {
    if (isEmergencyService) return COLORS.emergency;
    
    switch (relationship.toLowerCase()) {
      case 'parent': return COLORS.primary;
      case 'coach': return COLORS.success;
      case 'medical': return COLORS.warning;
      case 'guardian': return COLORS.secondary;
      default: return COLORS.textSecondary;
    }
  };

  const renderContactItem = ({ item }) => (
    <Animated.View
      style={[
        styles.contactCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        isEmergencyMode && item.isEmergencyService && {
          transform: [{ scale: pulseAnim }],
          borderWidth: 2,
          borderColor: COLORS.emergency,
        }
      ]}
    >
      <Card 
        style={[
          styles.contactCardInner,
          item.isEmergencyService && isEmergencyMode && { backgroundColor: COLORS.emergencyLight }
        ]} 
        elevation={item.isEmergencyService ? 4 : 2}
      >
        <TouchableOpacity 
          onPress={() => viewContactDetails(item)}
          style={styles.contactTouchable}
        >
          <View style={styles.contactContent}>
            <View style={styles.avatarSection}>
              {item.avatar ? (
                <Avatar.Image 
                  size={60} 
                  source={{ uri: item.avatar }} 
                />
              ) : (
                <Avatar.Icon
                  size={60}
                  icon={getContactIcon(item.relationship)}
                  style={{ 
                    backgroundColor: getRelationshipColor(item.relationship, item.isEmergencyService) 
                  }}
                />
              )}
              
              {item.isPrimary && (
                <Badge 
                  style={[styles.primaryBadge, { backgroundColor: COLORS.primary }]}
                  size={16}
                />
              )}
              
              {item.isAvailable && (
                <View style={styles.availableIndicator} />
              )}
            </View>
            
            <View style={styles.contactInfo}>
              <View style={styles.contactHeader}>
                <Text style={[
                  styles.contactName,
                  item.isEmergencyService && { color: COLORS.emergency, fontWeight: 'bold' }
                ]}>
                  {item.name}
                </Text>
                {item.isEmergencyService && (
                  <Chip 
                    mode="flat" 
                    style={{ backgroundColor: COLORS.emergency }}
                    textStyle={{ color: COLORS.surface, fontSize: 10 }}
                  >
                    EMERGENCY
                  </Chip>
                )}
              </View>
              
              <View style={styles.contactMeta}>
                <Icon 
                  name={getContactIcon(item.relationship)} 
                  size={16} 
                  color={getRelationshipColor(item.relationship, item.isEmergencyService)} 
                />
                <Text style={styles.relationship}>{item.relationship}</Text>
                {item.location && (
                  <>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.location}>{item.location}</Text>
                  </>
                )}
              </View>
              
              <Text style={styles.phoneNumber}>{item.phone}</Text>
              
              {item.notes && (
                <Text style={styles.notes} numberOfLines={2}>
                  {item.notes}
                </Text>
              )}
              
              <Text style={styles.lastContact}>
                Last contact: {item.lastContact}
              </Text>
            </View>
            
            <View style={styles.actionButtons}>
              <IconButton
                icon="phone"
                size={28}
                iconColor={item.isEmergencyService ? COLORS.emergency : COLORS.success}
                style={[
                  styles.actionButton,
                  item.isEmergencyService && { backgroundColor: COLORS.emergencyLight }
                ]}
                onPress={() => makeCall(item)}
              />
              
              {!item.isEmergencyService && (
                <IconButton
                  icon="message"
                  size={24}
                  iconColor={COLORS.primary}
                  style={styles.actionButton}
                  onPress={() => sendMessage(item)}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const ContactDetailsModal = () => (
    <Portal>
      <Modal
        visible={showContactModal}
        onDismiss={() => setShowContactModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
        >
          <Surface style={styles.modalContent} elevation={4}>
            <View style={styles.modalHeader}>
              <View style={styles.modalAvatarSection}>
                {selectedContact?.avatar ? (
                  <Avatar.Image 
                    size={80} 
                    source={{ uri: selectedContact.avatar }} 
                  />
                ) : (
                  <Avatar.Icon
                    size={80}
                    icon={getContactIcon(selectedContact?.relationship)}
                    style={{ 
                      backgroundColor: getRelationshipColor(
                        selectedContact?.relationship, 
                        selectedContact?.isEmergencyService
                      ) 
                    }}
                  />
                )}
                
                {selectedContact?.isPrimary && (
                  <Badge 
                    style={[styles.modalPrimaryBadge, { backgroundColor: COLORS.primary }]}
                    size={20}
                  />
                )}
              </View>
              
              <Text style={styles.modalContactName}>
                {selectedContact?.name}
              </Text>
              
              <View style={styles.modalContactMeta}>
                <Chip 
                  mode="outlined"
                  style={{ backgroundColor: getRelationshipColor(selectedContact?.relationship) }}
                  textStyle={{ color: COLORS.surface }}
                >
                  {selectedContact?.relationship}
                </Chip>
                
                {selectedContact?.isAvailable ? (
                  <Chip 
                    mode="outlined"
                    style={{ backgroundColor: COLORS.success, marginLeft: SPACING.sm }}
                    textStyle={{ color: COLORS.surface }}
                  >
                    Available
                  </Chip>
                ) : (
                  <Chip 
                    mode="outlined"
                    style={{ backgroundColor: COLORS.textSecondary, marginLeft: SPACING.sm }}
                    textStyle={{ color: COLORS.surface }}
                  >
                    Unavailable
                  </Chip>
                )}
              </View>
              
              <IconButton
                icon="close"
                onPress={() => setShowContactModal(false)}
                style={styles.modalCloseButton}
              />
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Contact Information</Text>
                
                <View style={styles.modalInfoRow}>
                  <Icon name="phone" size={20} color={COLORS.primary} />
                  <Text style={styles.modalInfoText}>{selectedContact?.phone}</Text>
                </View>
                
                {selectedContact?.email && (
                  <View style={styles.modalInfoRow}>
                    <Icon name="email" size={20} color={COLORS.primary} />
                    <Text style={styles.modalInfoText}>{selectedContact.email}</Text>
                  </View>
                )}
                
                {selectedContact?.location && (
                  <View style={styles.modalInfoRow}>
                    <Icon name="location-on" size={20} color={COLORS.primary} />
                    <Text style={styles.modalInfoText}>{selectedContact.location}</Text>
                  </View>
                )}
              </View>
              
              {selectedContact?.notes && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Notes</Text>
                  <Text style={styles.modalNotes}>{selectedContact.notes}</Text>
                </View>
              )}
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Last Contact</Text>
                <Text style={styles.modalLastContact}>{selectedContact?.lastContact}</Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                mode="contained"
                onPress={() => {
                  setShowContactModal(false);
                  setTimeout(() => makeCall(selectedContact), 200);
                }}
                style={[
                  styles.modalActionButton,
                  { backgroundColor: selectedContact?.isEmergencyService ? COLORS.emergency : COLORS.success }
                ]}
                icon="phone"
              >
                Call Now
              </Button>
              
              {!selectedContact?.isEmergencyService && (
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowContactModal(false);
                    setTimeout(() => sendMessage(selectedContact), 200);
                  }}
                  style={styles.modalActionButton}
                  textColor={COLORS.primary}
                  icon="message"
                >
                  Message
                </Button>
              )}
            </View>
          </Surface>
        </BlurView>
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
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Emergency Contacts 🆘</Text>
          <Text style={styles.headerSubtitle}>
            Stay safe and connected
          </Text>
          
          {isEmergencyMode && (
            <Animated.View 
              style={[
                styles.emergencyModeIndicator,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <Text style={styles.emergencyModeText}>
                🚨 EMERGENCY MODE ACTIVE
              </Text>
            </Animated.View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {!isEmergencyMode && (
          <Searchbar
            placeholder="Search emergency contacts..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
        )}

        {isEmergencyMode && (
          <Surface style={styles.emergencyPanel} elevation={4}>
            <Text style={styles.emergencyPanelTitle}>
              🚨 Quick Emergency Actions
            </Text>
            <View style={styles.emergencyActions}>
              <Button
                mode="contained"
                onPress={() => makeCall(mockEmergencyContacts.find(c => c.isEmergencyService))}
                style={[styles.emergencyButton, { backgroundColor: COLORS.emergency }]}
                icon="local-hospital"
              >
                Call 911
              </Button>
              <Button
                mode="contained"
                onPress={() => makeCall(mockEmergencyContacts.find(c => c.priority === 1))}
                style={[styles.emergencyButton, { backgroundColor: COLORS.primary }]}
                icon="family-restroom"
              >
                Call Parents
              </Button>
            </View>
            <Button
              mode="text"
              onPress={() => setIsEmergencyMode(false)}
              textColor={COLORS.textSecondary}
            >
              Exit Emergency Mode
            </Button>
          </Surface>
        )}

        <Animated.View
          style={[
            styles.listContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContactItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon 
                  name="contact-phone" 
                  size={80} 
                  color={COLORS.textSecondary} 
                />
                <Text style={styles.emptyTitle}>No contacts found</Text>
                <Text style={styles.emptySubtitle}>
                  Ask your parents to add emergency contacts
                </Text>
              </View>
            }
          />
        </Animated.View>
      </View>

      <ContactDetailsModal />

      {!isEmergencyMode && (
        <FAB
          icon="warning"
          style={[styles.fab, { backgroundColor: COLORS.emergency }]}
          color={COLORS.surface}
          onPress={activateEmergencyMode}
          label="Emergency"
        />
      )}
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.surface,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  emergencyModeIndicator: {
    backgroundColor: COLORS.emergency,
    borderRadius: 20,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  emergencyModeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchBar: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  emergencyPanel: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  emergencyPanelTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.emergency,
    marginBottom: SPACING.md,
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  emergencyButton: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  contactCard: {
    marginBottom: SPACING.md,
  },
  contactCardInner: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  contactTouchable: {
    borderRadius: 12,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
  },
  avatarSection: {
    position: 'relative',
  },
  primaryBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  availableIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  contactInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  contactName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    flex: 1,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  relationship: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  separator: {
    ...TEXT_STYLES.small,
    marginHorizontal: SPACING.xs,
    color: COLORS.textSecondary,
  },
  location: {
    ...TEXT_STYLES.small,
  },
  phoneNumber: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  notes: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  lastContact: {
    ...TEXT_STYLES.small,
  },
  actionButtons: {
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  actionButton: {
    margin: 0,
    marginBottom: SPACING.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    margin: 0,
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    position: 'relative',
  },
  modalAvatarSection: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  modalPrimaryBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  modalContactName: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalContactMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  modalBody: {
    flex: 1,
    padding: SPACING.md,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalInfoText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.md,
    flex: 1,
  },
  modalNotes: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  modalLastContact: {
    ...TEXT_STYLES.caption,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  modalActionButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
});

export default EmergencyContacts;