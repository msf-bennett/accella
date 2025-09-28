import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const CheckInReminders = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, clients } = useSelector(state => state.auth);
  const { reminders, notifications } = useSelector(state => state.communication);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [autoReminders, setAutoReminders] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState('daily');

  // Mock data - replace with Redux state
  const [clientsData, setClientsData] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://via.placeholder.com/100',
      lastCheckIn: '2 days ago',
      responseRate: 85,
      status: 'overdue',
      streak: 12,
      remindersSent: 3,
      nextSession: 'Tomorrow 9:00 AM',
      program: 'Weight Loss Program',
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: 'https://via.placeholder.com/100',
      lastCheckIn: 'Today',
      responseRate: 95,
      status: 'active',
      streak: 28,
      remindersSent: 1,
      nextSession: 'Thursday 2:00 PM',
      program: 'Strength Training',
    },
    {
      id: '3',
      name: 'Emma Davis',
      avatar: 'https://via.placeholder.com/100',
      lastCheckIn: '1 day ago',
      responseRate: 70,
      status: 'pending',
      streak: 5,
      remindersSent: 2,
      nextSession: 'Friday 10:00 AM',
      program: 'Athletic Performance',
    },
  ]);

  const reminderTemplates = [
    "Hey! Just checking in on your progress today 💪",
    "How did your workout go? I'd love to hear about it! 🏋️‍♀️",
    "Don't forget to log your nutrition and hydration today! 💧",
    "Ready for tomorrow's session? Any questions beforehand? 🤔",
    "Great job on your consistency! How are you feeling? ⭐",
  ];

  useEffect(() => {
    // Load reminders and settings
    loadRemindersData();
  }, []);

  const loadRemindersData = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRemindersData();
    setRefreshing(false);
  }, [loadRemindersData]);

  const filteredClients = clientsData.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.program.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'overdue') return matchesSearch && client.status === 'overdue';
    if (selectedFilter === 'active') return matchesSearch && client.status === 'active';
    if (selectedFilter === 'pending') return matchesSearch && client.status === 'pending';
    
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue': return COLORS.error;
      case 'active': return COLORS.success;
      case 'pending': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'overdue': return 'warning';
      case 'active': return 'check-circle';
      case 'pending': return 'schedule';
      default: return 'help';
    }
  };

  const sendQuickReminder = (client) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Send Reminder',
      `Send a quick check-in reminder to ${client.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            // Simulate sending reminder
            Alert.alert('Success', 'Reminder sent successfully! 📱');
            // Update client reminder count
            setClientsData(prev => prev.map(c => 
              c.id === client.id 
                ? { ...c, remindersSent: c.remindersSent + 1 }
                : c
            ));
          }
        }
      ]
    );
  };

  const sendCustomReminder = () => {
    if (!selectedClient || !reminderMessage.trim()) {
      Alert.alert('Error', 'Please select a client and enter a message');
      return;
    }

    Vibration.vibrate(50);
    Alert.alert('Success', `Custom reminder sent to ${selectedClient.name}! 🎯`);
    
    // Update client data
    setClientsData(prev => prev.map(c => 
      c.id === selectedClient.id 
        ? { ...c, remindersSent: c.remindersSent + 1 }
        : c
    ));

    // Reset modal
    setShowReminderModal(false);
    setSelectedClient(null);
    setReminderMessage('');
  };

  const renderClientCard = (client) => (
    <Card key={client.id} style={styles.clientCard}>
      <Card.Content>
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <Avatar.Image 
              source={{ uri: client.avatar }} 
              size={50}
              style={styles.avatar}
            />
            <View style={styles.clientDetails}>
              <Text style={[TEXT_STYLES.h3, styles.clientName]}>{client.name}</Text>
              <Text style={[TEXT_STYLES.caption, styles.program]}>{client.program}</Text>
              <View style={styles.statusRow}>
                <Icon 
                  name={getStatusIcon(client.status)} 
                  size={16} 
                  color={getStatusColor(client.status)} 
                />
                <Text style={[styles.statusText, { color: getStatusColor(client.status) }]}>
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
          <IconButton
            icon="notifications"
            size={24}
            iconColor={COLORS.primary}
            onPress={() => sendQuickReminder(client)}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{client.responseRate}%</Text>
            <Text style={styles.statLabel}>Response Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{client.streak}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{client.remindersSent}</Text>
            <Text style={styles.statLabel}>Reminders Sent</Text>
          </View>
        </View>

        <View style={styles.lastCheckInContainer}>
          <Text style={styles.lastCheckInLabel}>Last Check-in:</Text>
          <Text style={styles.lastCheckInValue}>{client.lastCheckIn}</Text>
        </View>

        <View style={styles.nextSessionContainer}>
          <Icon name="schedule" size={16} color={COLORS.textSecondary} />
          <Text style={styles.nextSession}>Next: {client.nextSession}</Text>
        </View>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedClient(client);
              setShowReminderModal(true);
            }}
            style={styles.actionButton}
            labelStyle={styles.actionButtonText}
          >
            Custom Message
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ClientChat', { clientId: client.id })}
            style={styles.actionButton}
            labelStyle={styles.actionButtonText}
          >
            Open Chat
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {[
        { key: 'all', label: 'All Clients', count: clientsData.length },
        { key: 'overdue', label: 'Overdue', count: clientsData.filter(c => c.status === 'overdue').length },
        { key: 'active', label: 'Active', count: clientsData.filter(c => c.status === 'active').length },
        { key: 'pending', label: 'Pending', count: clientsData.filter(c => c.status === 'pending').length },
      ].map(filter => (
        <Chip
          key={filter.key}
          selected={selectedFilter === filter.key}
          onPress={() => setSelectedFilter(filter.key)}
          style={[
            styles.filterChip,
            selectedFilter === filter.key && styles.selectedFilterChip
          ]}
          textStyle={[
            styles.filterChipText,
            selectedFilter === filter.key && styles.selectedFilterChipText
          ]}
        >
          {filter.label} ({filter.count})
        </Chip>
      ))}
    </ScrollView>
  );

  const renderStatsOverview = () => (
    <Card style={styles.statsCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.statsGradient}
      >
        <Text style={styles.statsTitle}>Today's Overview 📊</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsGridItem}>
            <Text style={styles.statsNumber}>12</Text>
            <Text style={styles.statsSubtext}>Reminders Sent</Text>
          </View>
          <View style={styles.statsGridItem}>
            <Text style={styles.statsNumber}>8</Text>
            <Text style={styles.statsSubtext}>Responses</Text>
          </View>
          <View style={styles.statsGridItem}>
            <Text style={styles.statsNumber}>67%</Text>
            <Text style={styles.statsSubtext}>Response Rate</Text>
          </View>
          <View style={styles.statsGridItem}>
            <Text style={styles.statsNumber}>4</Text>
            <Text style={styles.statsSubtext}>Overdue</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderCustomReminderModal = () => (
    <Modal
      visible={showReminderModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowReminderModal(false)}
    >
      <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
        <View style={styles.modalContainer}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Custom Reminder</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowReminderModal(false)}
              />
            </View>

            {selectedClient && (
              <View style={styles.selectedClientInfo}>
                <Avatar.Image 
                  source={{ uri: selectedClient.avatar }} 
                  size={40}
                />
                <View style={styles.selectedClientDetails}>
                  <Text style={styles.selectedClientName}>{selectedClient.name}</Text>
                  <Text style={styles.selectedClientProgram}>{selectedClient.program}</Text>
                </View>
              </View>
            )}

            <Text style={styles.templatesLabel}>Quick Templates:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.templatesContainer}
            >
              {reminderTemplates.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.templateChip}
                  onPress={() => setReminderMessage(template)}
                >
                  <Text style={styles.templateText}>{template}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.messageInput}
              placeholder="Type your custom reminder message..."
              placeholderTextColor={COLORS.textSecondary}
              value={reminderMessage}
              onChangeText={setReminderMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowReminderModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={sendCustomReminder}
                style={styles.modalButton}
                disabled={!reminderMessage.trim()}
              >
                Send Reminder
              </Button>
            </View>
          </Surface>
        </View>
      </BlurView>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
        <View style={styles.modalContainer}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reminder Settings ⚙️</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowSettingsModal(false)}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto Reminders</Text>
                <Text style={styles.settingDescription}>
                  Automatically send check-in reminders to clients
                </Text>
              </View>
              <Switch
                value={autoReminders}
                onValueChange={setAutoReminders}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={autoReminders ? COLORS.primaryLight : COLORS.textSecondary}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Reminder Frequency</Text>
              <View style={styles.frequencyOptions}>
                {['daily', 'every 2 days', 'weekly'].map(frequency => (
                  <TouchableOpacity
                    key={frequency}
                    style={[
                      styles.frequencyOption,
                      reminderFrequency === frequency && styles.selectedFrequency
                    ]}
                    onPress={() => setReminderFrequency(frequency)}
                  >
                    <Text style={[
                      styles.frequencyText,
                      reminderFrequency === frequency && styles.selectedFrequencyText
                    ]}>
                      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Reminder Time</Text>
              <TouchableOpacity style={styles.timeSelector}>
                <Text style={styles.timeText}>9:00 AM</Text>
                <Icon name="schedule" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <Button
              mode="contained"
              onPress={() => {
                Alert.alert('Success', 'Settings saved successfully! ✅');
                setShowSettingsModal(false);
              }}
              style={styles.saveButton}
            >
              Save Settings
            </Button>
          </Surface>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Check-In Reminders 📞</Text>
        <Text style={styles.headerSubtitle}>Keep your clients engaged and motivated</Text>
        
        <View style={styles.headerActions}>
          <IconButton
            icon="settings"
            size={24}
            iconColor="white"
            onPress={() => setShowSettingsModal(true)}
          />
          <IconButton
            icon="analytics"
            size={24}
            iconColor="white"
            onPress={() => Alert.alert('Feature Coming Soon', 'Analytics dashboard under development! 📈')}
          />
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
        {renderStatsOverview()}

        <Searchbar
          placeholder="Search clients or programs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />

        {renderFilterChips()}

        <View style={styles.clientsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Client Check-ins 👥</Text>
            <Chip 
              mode="outlined" 
              style={styles.countChip}
              textStyle={styles.countChipText}
            >
              {filteredClients.length} clients
            </Chip>
          </View>

          {filteredClients.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="people-outline" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No clients found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery ? 'Try adjusting your search terms' : 'Add clients to start sending reminders'}
                </Text>
              </Card.Content>
            </Card>
          ) : (
            filteredClients.map(renderClientCard)
          )}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions ⚡</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Feature Coming Soon', 'Bulk reminders under development! 📱')}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.quickActionGradient}
              >
                <Icon name="send" size={24} color="white" />
                <Text style={styles.quickActionText}>Send Bulk Reminders</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Feature Coming Soon', 'Automated sequences coming soon! 🤖')}
            >
              <LinearGradient
                colors={[COLORS.success, COLORS.successDark]}
                style={styles.quickActionGradient}
              >
                <Icon name="auto-awesome" size={24} color="white" />
                <Text style={styles.quickActionText}>Setup Auto Sequence</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          setSelectedClient(null);
          setReminderMessage('');
          setShowReminderModal(true);
        }}
        color="white"
      />

      {renderCustomReminderModal()}
      {renderSettingsModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: StatusBar.currentHeight + SPACING.sm,
    right: SPACING.md,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  statsCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  statsGradient: {
    padding: SPACING.lg,
    borderRadius: 16,
  },
  statsTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsGridItem: {
    alignItems: 'center',
  },
  statsNumber: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  statsSubtext: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
    borderColor: COLORS.border,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  clientsSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  countChip: {
    backgroundColor: COLORS.primaryLight,
  },
  countChipText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  clientCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: 'white',
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  clientInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  program: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  lastCheckInContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  lastCheckInLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  lastCheckInValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  nextSessionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  nextSession: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  actionButtonText: {
    fontSize: 12,
  },
  quickActions: {
    marginBottom: SPACING.xl,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    elevation: 3,
  },
  quickActionGradient: {
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  quickActionText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyCard: {
    borderRadius: 16,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
  },
  modalContent: {
    borderRadius: 20,
    padding: SPACING.lg,
    backgroundColor: 'white',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  selectedClientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  selectedClientDetails: {
    marginLeft: SPACING.md,
  },
  selectedClientName: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  selectedClientProgram: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  templatesLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  templatesContainer: {
    marginBottom: SPACING.lg,
  },
  templateChip: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    maxWidth: 200,
  },
  templateText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    textAlign: 'center',
  },
  messageInput: {
    ...TEXT_STYLES.body,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.backgroundLight,
    color: COLORS.textPrimary,
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  settingDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  frequencyOptions: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  frequencyOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedFrequency: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  frequencyText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
  },
  selectedFrequencyText: {
    color: 'white',
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
  bottomPadding: {
    height: 100,
  },
};

export default CheckInReminders;