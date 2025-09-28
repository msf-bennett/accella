import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Share,
  Linking,
  Clipboard,
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
  Searchbar,
  Divider,
  Switch,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import established design constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width } = Dimensions.get('window');

const ClientInvitation = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMethod, setInviteMethod] = useState('email');
  const [bulkInvite, setBulkInvite] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    phone: '',
    name: '',
    message: '',
    trainingPackage: 'basic',
    startDate: '',
    expiryDays: '7',
  });

  // Mock data - replace with Redux selectors
  const [invitations, setInvitations] = useState([
    {
      id: '1',
      recipientName: 'John Smith',
      recipientEmail: 'john.smith@email.com',
      recipientPhone: '+1234567890',
      status: 'pending',
      sentDate: '2024-11-15T10:30:00Z',
      expiryDate: '2024-11-22T23:59:59Z',
      trainingPackage: 'premium',
      personalMessage: 'Welcome to your fitness journey! Let\'s achieve your goals together 💪',
      inviteCode: 'FT-ABC123',
      remindersSent: 1,
      lastActivity: '2024-11-18T14:20:00Z',
    },
    {
      id: '2',
      recipientName: 'Sarah Johnson',
      recipientEmail: 'sarah.j@email.com',
      recipientPhone: '+1987654321',
      status: 'accepted',
      sentDate: '2024-11-10T09:15:00Z',
      acceptedDate: '2024-11-12T16:45:00Z',
      trainingPackage: 'basic',
      personalMessage: 'Ready to transform your health? I\'m here to support you! 🌟',
      inviteCode: 'FT-XYZ789',
      remindersSent: 0,
      lastActivity: '2024-11-12T16:45:00Z',
    },
    {
      id: '3',
      recipientName: 'Mike Wilson',
      recipientEmail: 'mike.wilson@email.com',
      recipientPhone: '+1122334455',
      status: 'expired',
      sentDate: '2024-11-01T14:20:00Z',
      expiryDate: '2024-11-08T23:59:59Z',
      trainingPackage: 'basic',
      personalMessage: 'Let\'s build strength and confidence together!',
      inviteCode: 'FT-DEF456',
      remindersSent: 2,
      lastActivity: '2024-11-06T11:30:00Z',
    },
    {
      id: '4',
      recipientName: 'Emily Davis',
      recipientEmail: 'emily.davis@email.com',
      recipientPhone: '+1555666777',
      status: 'declined',
      sentDate: '2024-11-12T11:00:00Z',
      declinedDate: '2024-11-14T09:30:00Z',
      trainingPackage: 'premium',
      personalMessage: 'Excited to help you reach your fitness goals!',
      inviteCode: 'FT-GHI789',
      remindersSent: 0,
      lastActivity: '2024-11-14T09:30:00Z',
    },
  ]);

  const [inviteStats, setInviteStats] = useState({
    totalSent: 24,
    accepted: 18,
    pending: 4,
    expired: 2,
    acceptanceRate: 75,
    avgResponseTime: '2.3 days',
  });

  const trainingPackages = [
    { key: 'basic', label: 'Basic Training', price: '$99/month', color: COLORS.success },
    { key: 'premium', label: 'Premium Training', price: '$149/month', color: COLORS.primary },
    { key: 'elite', label: 'Elite Coaching', price: '$199/month', color: COLORS.warning },
  ];

  const inviteFilters = [
    { key: 'all', label: 'All Invites', icon: 'mail', color: COLORS.primary },
    { key: 'pending', label: 'Pending', icon: 'schedule', color: COLORS.warning },
    { key: 'accepted', label: 'Accepted', icon: 'check-circle', color: COLORS.success },
    { key: 'expired', label: 'Expired', icon: 'schedule', color: COLORS.error },
    { key: 'declined', label: 'Declined', icon: 'cancel', color: COLORS.textSecondary },
  ];

  const statusColors = {
    pending: COLORS.warning,
    accepted: COLORS.success,
    expired: COLORS.error,
    declined: COLORS.textSecondary,
  };

  const statusIcons = {
    pending: 'schedule',
    accepted: 'check-circle',
    expired: 'schedule',
    declined: 'cancel',
  };

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Invitations refreshed! 📬');
    }, 1500);
  }, []);

  // Filter invitations
  const getFilteredInvitations = useCallback(() => {
    let filtered = [...invitations];

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(invite => invite.status === selectedFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(invite => 
        invite.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invite.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invite.inviteCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));
  }, [invitations, selectedFilter, searchQuery]);

  // Handle send invitation
  const handleSendInvitation = async () => {
    if (inviteMethod === 'email' && !newInvitation.email.trim()) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    if (inviteMethod === 'sms' && !newInvitation.phone.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      // Simulate API call
      Alert.alert(
        'Invitation Sent! 🎉',
        `Your invitation has been sent via ${inviteMethod} successfully.`,
        [{ text: 'OK', style: 'default' }]
      );
      
      setShowInviteModal(false);
      resetInvitationForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    }
  };

  // Reset invitation form
  const resetInvitationForm = () => {
    setNewInvitation({
      email: '',
      phone: '',
      name: '',
      message: '',
      trainingPackage: 'basic',
      startDate: '',
      expiryDays: '7',
    });
  };

  // Handle share invitation link
  const handleShareInvite = async (invitation) => {
    try {
      const inviteLink = `https://fitnessapp.com/invite/${invitation.inviteCode}`;
      const message = `Join me for personal training! Use code: ${invitation.inviteCode}\n${inviteLink}`;
      
      await Share.share({
        message: message,
        url: inviteLink,
        title: 'Fitness Training Invitation',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share invitation');
    }
  };

  // Handle copy invite code
  const handleCopyCode = async (inviteCode) => {
    try {
      await Clipboard.setString(inviteCode);
      Alert.alert('Copied! 📋', 'Invite code copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy invite code');
    }
  };

  // Handle resend invitation
  const handleResendInvitation = (invitationId) => {
    Alert.alert(
      'Resend Invitation',
      'Are you sure you want to resend this invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resend',
          style: 'default',
          onPress: () => {
            Alert.alert('Success', 'Invitation resent successfully! 📨');
          },
        },
      ]
    );
  };

  // Handle cancel invitation
  const handleCancelInvitation = (invitationId) => {
    Alert.alert(
      'Cancel Invitation',
      'Are you sure you want to cancel this invitation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cancel Invitation',
          style: 'destructive',
          onPress: () => {
            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
            Alert.alert('Success', 'Invitation cancelled');
          },
        },
      ]
    );
  };

  // Render invitation card
  const renderInvitationCard = ({ item: invitation }) => (
    <Animated.View
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        { marginBottom: SPACING.md }
      ]}
    >
      <Card style={styles.invitationCard} elevation={3}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Avatar.Text
              size={50}
              label={invitation.recipientName.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: statusColors[invitation.status] }}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.recipientName}>{invitation.recipientName}</Text>
              <Text style={styles.recipientContact}>
                {invitation.recipientEmail}
              </Text>
              <Text style={styles.inviteCode}>Code: {invitation.inviteCode}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Chip
                style={[styles.statusChip, { backgroundColor: statusColors[invitation.status] }]}
                textStyle={{ color: COLORS.white, fontSize: 12, fontWeight: 'bold' }}
                icon={statusIcons[invitation.status]}
              >
                {invitation.status.toUpperCase()}
              </Chip>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.invitationDetails}>
            <View style={styles.detailRow}>
              <Icon name="card-membership" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>
                {trainingPackages.find(p => p.key === invitation.trainingPackage)?.label}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>
                Sent: {new Date(invitation.sentDate).toLocaleDateString()}
              </Text>
            </View>

            {invitation.status === 'pending' && (
              <View style={styles.detailRow}>
                <Icon name="alarm" size={16} color={COLORS.warning} />
                <Text style={[styles.detailText, { color: COLORS.warning }]}>
                  Expires: {new Date(invitation.expiryDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            {invitation.status === 'accepted' && (
              <View style={styles.detailRow}>
                <Icon name="event-available" size={16} color={COLORS.success} />
                <Text style={[styles.detailText, { color: COLORS.success }]}>
                  Accepted: {new Date(invitation.acceptedDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            {invitation.remindersSent > 0 && (
              <View style={styles.detailRow}>
                <Icon name="notification-important" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>
                  {invitation.remindersSent} reminder{invitation.remindersSent > 1 ? 's' : ''} sent
                </Text>
              </View>
            )}
          </View>

          {invitation.personalMessage && (
            <Surface style={styles.messageContainer} elevation={1}>
              <Text style={styles.messageLabel}>Personal Message:</Text>
              <Text style={styles.messageText}>{invitation.personalMessage}</Text>
            </Surface>
          )}
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          {invitation.status === 'pending' && (
            <>
              <Button
                mode="outlined"
                onPress={() => handleResendInvitation(invitation.id)}
                icon="refresh"
                style={styles.actionButton}
              >
                Resend
              </Button>
              <Button
                mode="contained"
                onPress={() => handleShareInvite(invitation)}
                icon="share"
                buttonColor={COLORS.primary}
                style={styles.actionButton}
              >
                Share
              </Button>
            </>
          )}

          {invitation.status === 'expired' && (
            <Button
              mode="contained"
              onPress={() => handleResendInvitation(invitation.id)}
              icon="refresh"
              buttonColor={COLORS.warning}
              style={styles.actionButton}
            >
              Resend
            </Button>
          )}

          <IconButton
            icon="content-copy"
            onPress={() => handleCopyCode(invitation.inviteCode)}
            iconColor={COLORS.textSecondary}
          />

          {(invitation.status === 'pending' || invitation.status === 'expired') && (
            <IconButton
              icon="delete"
              onPress={() => handleCancelInvitation(invitation.id)}
              iconColor={COLORS.error}
            />
          )}
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  // Render stats overview
  const renderStatsOverview = () => (
    <Surface style={styles.statsContainer} elevation={2}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.statsGradient}
      >
        <Text style={styles.statsTitle}>Invitation Stats 📊</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{inviteStats.totalSent}</Text>
            <Text style={styles.statLabel}>Total Sent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{inviteStats.accepted}</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{inviteStats.acceptanceRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{inviteStats.avgResponseTime}</Text>
            <Text style={styles.statLabel}>Avg Response</Text>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  // Render filter chips
  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {inviteFilters.map((filter) => (
        <Chip
          key={filter.key}
          selected={selectedFilter === filter.key}
          onPress={() => setSelectedFilter(filter.key)}
          style={[
            styles.filterChip,
            selectedFilter === filter.key && { backgroundColor: filter.color }
          ]}
          textStyle={[
            styles.filterChipText,
            selectedFilter === filter.key && { color: COLORS.white }
          ]}
          icon={filter.icon}
        >
          {filter.label}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render invite modal
  const renderInviteModal = () => (
    <Portal>
      <Modal
        visible={showInviteModal}
        onDismiss={() => setShowInviteModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent} elevation={8}>
            <LinearGradient
              colors={[COLORS.gradientStart, COLORS.gradientEnd]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Send Invitation 📧</Text>
              <IconButton
                icon="close"
                iconColor={COLORS.white}
                onPress={() => setShowInviteModal(false)}
              />
            </LinearGradient>

            <ScrollView style={styles.modalForm}>
              {/* Invite Method Selection */}
              <View style={styles.methodSelection}>
                <Text style={styles.sectionLabel}>Invitation Method</Text>
                <View style={styles.methodButtons}>
                  <Button
                    mode={inviteMethod === 'email' ? 'contained' : 'outlined'}
                    onPress={() => setInviteMethod('email')}
                    icon="email"
                    style={styles.methodButton}
                    buttonColor={inviteMethod === 'email' ? COLORS.primary : 'transparent'}
                  >
                    Email
                  </Button>
                  <Button
                    mode={inviteMethod === 'sms' ? 'contained' : 'outlined'}
                    onPress={() => setInviteMethod('sms')}
                    icon="message"
                    style={styles.methodButton}
                    buttonColor={inviteMethod === 'sms' ? COLORS.primary : 'transparent'}
                  >
                    SMS
                  </Button>
                </View>
              </View>

              {/* Contact Information */}
              <TextInput
                label="Client Name"
                value={newInvitation.name}
                onChangeText={(text) => setNewInvitation(prev => ({ ...prev, name: text }))}
                mode="outlined"
                style={styles.formInput}
                left={<TextInput.Icon icon="person" />}
              />

              {inviteMethod === 'email' ? (
                <TextInput
                  label="Email Address *"
                  value={newInvitation.email}
                  onChangeText={(text) => setNewInvitation(prev => ({ ...prev, email: text }))}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.formInput}
                  left={<TextInput.Icon icon="email" />}
                />
              ) : (
                <TextInput
                  label="Phone Number *"
                  value={newInvitation.phone}
                  onChangeText={(text) => setNewInvitation(prev => ({ ...prev, phone: text }))}
                  mode="outlined"
                  keyboardType="phone-pad"
                  style={styles.formInput}
                  left={<TextInput.Icon icon="phone" />}
                />
              )}

              {/* Training Package Selection */}
              <View style={styles.packageSelection}>
                <Text style={styles.sectionLabel}>Training Package</Text>
                {trainingPackages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.key}
                    style={[
                      styles.packageOption,
                      newInvitation.trainingPackage === pkg.key && styles.packageSelected
                    ]}
                    onPress={() => setNewInvitation(prev => ({ ...prev, trainingPackage: pkg.key }))}
                  >
                    <View style={styles.packageInfo}>
                      <Text style={[
                        styles.packageLabel,
                        newInvitation.trainingPackage === pkg.key && { color: COLORS.white }
                      ]}>
                        {pkg.label}
                      </Text>
                      <Text style={[
                        styles.packagePrice,
                        newInvitation.trainingPackage === pkg.key && { color: COLORS.white }
                      ]}>
                        {pkg.price}
                      </Text>
                    </View>
                    {newInvitation.trainingPackage === pkg.key && (
                      <Icon name="check-circle" size={24} color={COLORS.white} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Personal Message */}
              <TextInput
                label="Personal Message (Optional)"
                value={newInvitation.message}
                onChangeText={(text) => setNewInvitation(prev => ({ ...prev, message: text }))}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.formInput}
                placeholder="Add a personal touch to your invitation..."
                left={<TextInput.Icon icon="message-text" />}
              />

              {/* Expiry Settings */}
              <View style={styles.expirySection}>
                <Text style={styles.sectionLabel}>Invitation Settings</Text>
                <TextInput
                  label="Expires in (days)"
                  value={newInvitation.expiryDays}
                  onChangeText={(text) => setNewInvitation(prev => ({ ...prev, expiryDays: text }))}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.formInput}
                  left={<TextInput.Icon icon="schedule" />}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowInviteModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSendInvitation}
                style={styles.modalButton}
                buttonColor={COLORS.primary}
                icon="send"
              >
                Send Invitation
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const filteredInvitations = getFilteredInvitations();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Client Invitations</Text>
          <IconButton
            icon="help-outline"
            iconColor={COLORS.white}
            onPress={() => Alert.alert('Help', 'Send invitations to potential clients and track their responses! 💡')}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search invitations..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
          />
        </View>

        {renderFilterChips()}

        <View style={styles.invitationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'All Invitations' : inviteFilters.find(f => f.key === selectedFilter)?.label} 
              ({filteredInvitations.length})
            </Text>
          </View>

          <FlatList
            data={filteredInvitations}
            renderItem={renderInvitationCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <Surface style={styles.emptyState} elevation={1}>
                <Icon name="mail-outline" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No Invitations Found</Text>
                <Text style={styles.emptyMessage}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'Start by sending invitations to potential clients'}
                </Text>
                {!searchQuery && (
                  <Button
                    mode="contained"
                    onPress={() => setShowInviteModal(true)}
                    icon="add"
                    buttonColor={COLORS.primary}
                    style={styles.emptyButton}
                  >
                    Send First Invitation
                  </Button>
                )}
              </Surface>
            )}
          />
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="person-add"
        onPress={() => setShowInviteModal(true)}
        label="Invite Client"
        color={COLORS.white}
        customSize={56}
      />

      {renderInviteModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
    marginRight: SPACING.xl,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    margin: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchBar: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterContainer: {
    paddingLeft: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingRight: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  filterChipText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  invitationsSection: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  invitationCard: {
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  recipientName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  recipientContact: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  inviteCode: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 28,
  },
  divider: {
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.border,
  },
  invitationDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
  },
  messageContainer: {
    backgroundColor: `${COLORS.primary}10`,
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  messageLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  messageText: {
    ...TEXT_STYLES.caption,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  cardActions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    justifyContent: 'flex-start',
  },
  actionButton: {
    marginRight: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    margin: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  emptyTitle: {
    ...TEXT_STYLES.subtitle,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  emptyButton: {
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: width - SPACING.xl,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.white,
    flex: 1,
  },
  modalForm: {
    padding: SPACING.md,
    maxHeight: 500,
  },
  methodSelection: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  methodButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  methodButton: {
    flex: 1,
  },
  formInput: {
    marginBottom: SPACING.md,
  },
  packageSelection: {
    marginBottom: SPACING.lg,
  },
  packageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  packageSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  packageInfo: {
    flex: 1,
  },
  packageLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  packagePrice: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  expirySection: {
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
});

export default ClientInvitation;