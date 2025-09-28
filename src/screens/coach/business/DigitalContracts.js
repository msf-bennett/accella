import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  Vibration,
  Animated,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
  Divider,
  TextInput,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4ade80',
  error: '#ef4444',
  warning: '#f59e0b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading1: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
  heading2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  heading3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const DigitalContracts = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const { contracts, loading, error } = useSelector(state => state.contracts || {});
  const { user } = useSelector(state => state.auth || {});

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [sortBy, setSortBy] = useState('date');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Create contract form state
  const [newContract, setNewContract] = useState({
    clientName: '',
    contractType: 'training',
    duration: '3',
    amount: '',
    description: '',
  });

  // Mock data for demonstration
  const [contractsData, setContractsData] = useState([
    {
      id: '1',
      clientName: 'John Smith',
      clientAvatar: 'https://api.dicebear.com/7.x/avatars/png?seed=john',
      contractType: 'training',
      status: 'active',
      signedDate: '2024-08-01',
      startDate: '2024-08-15',
      endDate: '2024-11-15',
      duration: '3 months',
      amount: 360,
      currency: 'USD',
      description: 'Comprehensive football training program including technical skills, fitness, and tactical awareness.',
      paymentSchedule: 'Monthly',
      parentSignature: true,
      coachSignature: true,
      lastPayment: '2024-08-15',
      nextPayment: '2024-09-15',
      autoRenew: true,
      completionPercentage: 25,
      attachments: ['liability_waiver.pdf', 'medical_form.pdf'],
    },
    {
      id: '2',
      clientName: 'Emma Johnson',
      clientAvatar: 'https://api.dicebear.com/7.x/avatars/png?seed=emma',
      contractType: 'camp',
      status: 'pending',
      signedDate: null,
      startDate: '2024-09-01',
      endDate: '2024-09-15',
      duration: '2 weeks',
      amount: 450,
      currency: 'USD',
      description: 'Intensive tennis summer camp focusing on serve technique and match play strategies.',
      paymentSchedule: 'One-time',
      parentSignature: false,
      coachSignature: true,
      lastPayment: null,
      nextPayment: '2024-08-20',
      autoRenew: false,
      completionPercentage: 0,
      attachments: ['camp_schedule.pdf'],
    },
    {
      id: '3',
      clientName: 'David Wilson',
      clientAvatar: 'https://api.dicebear.com/7.x/avatars/png?seed=david',
      contractType: 'personal',
      status: 'expired',
      signedDate: '2024-05-01',
      startDate: '2024-05-15',
      endDate: '2024-08-15',
      duration: '3 months',
      amount: 600,
      currency: 'USD',
      description: 'One-on-one basketball coaching with focus on shooting mechanics and court awareness.',
      paymentSchedule: 'Monthly',
      parentSignature: true,
      coachSignature: true,
      lastPayment: '2024-07-15',
      nextPayment: null,
      autoRenew: false,
      completionPercentage: 100,
      attachments: ['training_plan.pdf', 'progress_report.pdf'],
    },
    {
      id: '4',
      clientName: 'Sarah Martinez',
      clientAvatar: 'https://api.dicebear.com/7.x/avatars/png?seed=sarah',
      contractType: 'group',
      status: 'draft',
      signedDate: null,
      startDate: '2024-09-01',
      endDate: '2024-12-01',
      duration: '3 months',
      amount: 240,
      currency: 'USD',
      description: 'Small group soccer training sessions (max 6 players) focusing on teamwork and skill development.',
      paymentSchedule: 'Monthly',
      parentSignature: false,
      coachSignature: false,
      lastPayment: null,
      nextPayment: null,
      autoRenew: true,
      completionPercentage: 0,
      attachments: [],
    },
  ]);

  useEffect(() => {
    // Entrance animations
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

    // Load contracts data
    loadContractsData();
  }, []);

  const loadContractsData = async () => {
    try {
      // Simulate API call
      // dispatch(fetchContracts());
      console.log('Loading contracts data...');
    } catch (error) {
      console.error('Error loading contracts:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    try {
      await loadContractsData();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filterContracts = () => {
    let filtered = contractsData;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(contract =>
        contract.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.contractType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === selectedFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.signedDate || b.startDate) - new Date(a.signedDate || a.startDate);
        case 'client':
          return a.clientName.localeCompare(b.clientName);
        case 'amount':
          return b.amount - a.amount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'expired': return COLORS.error;
      case 'draft': return COLORS.textSecondary;
      case 'terminated': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getContractTypeIcon = (type) => {
    switch (type) {
      case 'training': return 'sports';
      case 'camp': return 'groups';
      case 'personal': return 'person';
      case 'group': return 'group-work';
      default: return 'description';
    }
  };

  const handleContractPress = (contract) => {
    setSelectedContract(contract);
    setShowContractModal(true);
    Vibration.vibrate(30);
  };

  const handleCreateContract = () => {
    setShowCreateModal(true);
    Vibration.vibrate(30);
  };

  const handleSaveContract = () => {
    if (!newContract.clientName || !newContract.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Create Contract',
      'Contract created successfully! The client will receive a notification to review and sign.',
      [{ text: 'OK', onPress: () => {
        setShowCreateModal(false);
        setNewContract({
          clientName: '',
          contractType: 'training',
          duration: '3',
          amount: '',
          description: '',
        });
      }}]
    );
  };

  const handleSendReminder = (contract) => {
    Alert.alert(
      'Send Reminder',
      `Send signing reminder to ${contract.clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => {
          Vibration.vibrate(50);
          Alert.alert('Success', 'Reminder sent successfully!');
        }},
      ]
    );
  };

  const handleTerminateContract = (contract) => {
    Alert.alert(
      'Terminate Contract',
      `Are you sure you want to terminate the contract with ${contract.clientName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Terminate', style: 'destructive', onPress: () => {
          Vibration.vibrate(100);
          Alert.alert('Contract Terminated', 'The contract has been terminated and both parties have been notified.');
        }},
      ]
    );
  };

  const renderContractCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.contractCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleContractPress(item)}
        activeOpacity={0.7}
      >
        <Card style={styles.card} elevation={2}>
          <Card.Content style={styles.cardContent}>
            {/* Header */}
            <View style={styles.contractHeader}>
              <View style={styles.contractInfo}>
                <Avatar.Image
                  size={45}
                  source={{ uri: item.clientAvatar }}
                  style={styles.avatar}
                />
                <View style={styles.contractDetails}>
                  <Text style={TEXT_STYLES.heading3}>{item.clientName}</Text>
                  <View style={styles.typeRow}>
                    <Icon name={getContractTypeIcon(item.contractType)} size={16} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                      {item.contractType.charAt(0).toUpperCase() + item.contractType.slice(1)} Contract
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.contractStatus}>
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
                  textStyle={[styles.statusText, { color: getStatusColor(item.status) }]}
                >
                  {item.status.toUpperCase()}
                </Chip>
              </View>
            </View>

            {/* Contract Details */}
            <View style={styles.contractBody}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Icon name="monetization-on" size={16} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.xs, fontWeight: '600' }]}>
                    ${item.amount} {item.currency}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="schedule" size={16} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                    {item.duration}
                  </Text>
                </View>
              </View>

              <View style={styles.dateRow}>
                <Text style={TEXT_STYLES.small}>
                  Start: {new Date(item.startDate).toLocaleDateString()}
                </Text>
                <Text style={TEXT_STYLES.small}>
                  End: {new Date(item.endDate).toLocaleDateString()}
                </Text>
              </View>

              <Text style={[TEXT_STYLES.caption, styles.description]} numberOfLines={2}>
                {item.description}
              </Text>
            </View>

            {/* Progress Section (for active contracts) */}
            {item.status === 'active' && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={TEXT_STYLES.caption}>Contract Progress</Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                    {item.completionPercentage}%
                  </Text>
                </View>
                <ProgressBar
                  progress={item.completionPercentage / 100}
                  color={COLORS.primary}
                  style={styles.progressBar}
                />
              </View>
            )}

            {/* Signature Status */}
            <View style={styles.signatureSection}>
              <View style={styles.signatureItem}>
                <Icon
                  name={item.parentSignature ? "check-circle" : "radio-button-unchecked"}
                  size={16}
                  color={item.parentSignature ? COLORS.success : COLORS.textSecondary}
                />
                <Text style={[TEXT_STYLES.small, { marginLeft: SPACING.xs }]}>
                  Parent/Client Signed
                </Text>
              </View>
              <View style={styles.signatureItem}>
                <Icon
                  name={item.coachSignature ? "check-circle" : "radio-button-unchecked"}
                  size={16}
                  color={item.coachSignature ? COLORS.success : COLORS.textSecondary}
                />
                <Text style={[TEXT_STYLES.small, { marginLeft: SPACING.xs }]}>
                  Coach Signed
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              {item.status === 'pending' && (
                <Button
                  mode="outlined"
                  compact
                  icon="notification-important"
                  onPress={() => handleSendReminder(item)}
                  style={styles.actionButton}
                  labelStyle={styles.actionButtonText}
                >
                  Remind
                </Button>
              )}
              <Button
                mode="outlined"
                compact
                icon="visibility"
                onPress={() => handleContractPress(item)}
                style={styles.actionButton}
                labelStyle={styles.actionButtonText}
              >
                View
              </Button>
              <Button
                mode="outlined"
                compact
                icon="share"
                onPress={() => Alert.alert('Share Contract', 'Feature coming soon!')}
                style={styles.actionButton}
                labelStyle={styles.actionButtonText}
              >
                Share
              </Button>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <Text style={TEXT_STYLES.heading2}>Filter & Sort</Text>
            <Divider style={styles.divider} />

            <Text style={TEXT_STYLES.heading3}>Status Filter</Text>
            <View style={styles.filterChips}>
              {['all', 'active', 'pending', 'expired', 'draft'].map((filter) => (
                <Chip
                  key={filter}
                  selected={selectedFilter === filter}
                  onPress={() => setSelectedFilter(filter)}
                  style={styles.filterChip}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Chip>
              ))}
            </View>

            <Text style={TEXT_STYLES.heading3}>Sort By</Text>
            <View style={styles.filterChips}>
              {[
                { key: 'date', label: 'Date' },
                { key: 'client', label: 'Client Name' },
                { key: 'amount', label: 'Amount' },
                { key: 'status', label: 'Status' },
              ].map((sort) => (
                <Chip
                  key={sort.key}
                  selected={sortBy === sort.key}
                  onPress={() => setSortBy(sort.key)}
                  style={styles.filterChip}
                >
                  {sort.label}
                </Chip>
              ))}
            </View>

            <Button
              mode="contained"
              onPress={() => setShowFilterModal(false)}
              style={styles.applyButton}
            >
              Apply Filters
            </Button>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderContractDetailModal = () => (
    <Portal>
      <Modal
        visible={showContractModal}
        onDismiss={() => setShowContractModal(false)}
        contentContainerStyle={styles.contractModalContainer}
      >
        <BlurView style={styles.contractBlurView} blurType="light" blurAmount={10}>
          {selectedContract && (
            <Surface style={styles.contractModalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Avatar.Image
                    size={60}
                    source={{ uri: selectedContract.clientAvatar }}
                  />
                  <View style={styles.modalHeaderText}>
                    <Text style={TEXT_STYLES.heading2}>{selectedContract.clientName}</Text>
                    <Text style={TEXT_STYLES.body}>
                      {selectedContract.contractType.charAt(0).toUpperCase() + selectedContract.contractType.slice(1)} Contract
                    </Text>
                    <Chip
                      compact
                      style={[styles.modalStatusChip, { backgroundColor: getStatusColor(selectedContract.status) + '20' }]}
                      textStyle={{ color: getStatusColor(selectedContract.status) }}
                    >
                      {selectedContract.status.toUpperCase()}
                    </Chip>
                  </View>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowContractModal(false)}
                  />
                </View>

                <Divider style={styles.modalDivider} />

                {/* Contract Details */}
                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.heading3}>📋 Contract Details</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailGridItem}>
                      <Text style={TEXT_STYLES.small}>Amount</Text>
                      <Text style={TEXT_STYLES.body}>${selectedContract.amount}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={TEXT_STYLES.small}>Duration</Text>
                      <Text style={TEXT_STYLES.body}>{selectedContract.duration}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={TEXT_STYLES.small}>Payment</Text>
                      <Text style={TEXT_STYLES.body}>{selectedContract.paymentSchedule}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={TEXT_STYLES.small}>Auto Renew</Text>
                      <Text style={TEXT_STYLES.body}>{selectedContract.autoRenew ? 'Yes' : 'No'}</Text>
                    </View>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.heading3}>📝 Description</Text>
                  <Text style={TEXT_STYLES.body}>{selectedContract.description}</Text>
                </View>

                {/* Payment Information */}
                {selectedContract.status === 'active' && (
                  <View style={styles.modalSection}>
                    <Text style={TEXT_STYLES.heading3}>💳 Payment Information</Text>
                    <View style={styles.paymentInfo}>
                      <Text style={TEXT_STYLES.caption}>
                        Last Payment: {selectedContract.lastPayment ? new Date(selectedContract.lastPayment).toLocaleDateString() : 'N/A'}
                      </Text>
                      <Text style={TEXT_STYLES.caption}>
                        Next Payment: {selectedContract.nextPayment ? new Date(selectedContract.nextPayment).toLocaleDateString() : 'N/A'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Attachments */}
                {selectedContract.attachments && selectedContract.attachments.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={TEXT_STYLES.heading3}>📎 Attachments</Text>
                    {selectedContract.attachments.map((attachment, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.attachmentItem}
                        onPress={() => Alert.alert('View Document', 'Feature coming soon!')}
                      >
                        <Icon name="description" size={20} color={COLORS.primary} />
                        <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, color: COLORS.primary }]}>
                          {attachment}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  {selectedContract.status === 'active' && (
                    <Button
                      mode="contained"
                      icon="edit"
                      onPress={() => Alert.alert('Edit Contract', 'Feature coming soon!')}
                      style={styles.modalActionButton}
                    >
                      Edit Contract
                    </Button>
                  )}
                  <Button
                    mode="outlined"
                    icon="share"
                    onPress={() => Alert.alert('Share Contract', 'Feature coming soon!')}
                    style={styles.modalActionButton}
                  >
                    Share Contract
                  </Button>
                  {(selectedContract.status === 'active' || selectedContract.status === 'pending') && (
                    <Button
                      mode="outlined"
                      icon="cancel"
                      buttonColor={COLORS.error + '20'}
                      textColor={COLORS.error}
                      onPress={() => handleTerminateContract(selectedContract)}
                      style={styles.modalActionButton}
                    >
                      Terminate Contract
                    </Button>
                  )}
                </View>
              </ScrollView>
            </Surface>
          )}
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderCreateModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.createModalContainer}
      >
        <BlurView style={styles.createBlurView} blurType="light" blurAmount={10}>
          <Surface style={styles.createModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.createHeader}>
                <Text style={TEXT_STYLES.heading2}>Create New Contract</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowCreateModal(false)}
                />
              </View>

              <Divider style={styles.modalDivider} />

              {/* Form Fields */}
              <View style={styles.formSection}>
                <TextInput
                  label="Client Name *"
                  value={newContract.clientName}
                  onChangeText={(text) => setNewContract(prev => ({ ...prev, clientName: text }))}
                  mode="outlined"
                  style={styles.formInput}
                />

                <View style={styles.chipSection}>
                  <Text style={TEXT_STYLES.body}>Contract Type</Text>
                  <View style={styles.typeChips}>
                    {['training', 'camp', 'personal', 'group'].map((type) => (
                      <Chip
                        key={type}
                        selected={newContract.contractType === type}
                        onPress={() => setNewContract(prev => ({ ...prev, contractType: type }))}
                        style={styles.typeChip}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.chipSection}>
                  <Text style={TEXT_STYLES.body}>Duration (months)</Text>
                  <View style={styles.durationChips}>
                    {['1', '3', '6', '12'].map((duration) => (
                      <Chip
                        key={duration}
                        selected={newContract.duration === duration}
                        onPress={() => setNewContract(prev => ({ ...prev, duration }))}
                        style={styles.durationChip}
                      >
                        {duration}
                      </Chip>
                    ))}
                  </View>
                </View>

                <TextInput
                  label="Total Amount (USD) *"
                  value={newContract.amount}
                  onChangeText={(text) => setNewContract(prev => ({ ...prev, amount: text }))}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.formInput}
                />

                <TextInput
                  label="Contract Description"
                  value={newContract.description}
                  onChangeText={(text) => setNewContract(prev => ({ ...prev, description: text }))}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={styles.formInput}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.createActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowCreateModal(false)}
                  style={styles.createActionButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveContract}
                  style={styles.createActionButton}
                >
                  Create Contract
                </Button>
              </View>
            </ScrollView>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const filteredContracts = filterContracts();
  const totalValue = contractsData.reduce((sum, contract) => sum + contract.amount, 0);
  const activeContracts = contractsData.filter(c => c.status === 'active').length;
  const pendingContracts = contractsData.filter(c => c.status === 'pending').length;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Digital Contracts</Text>
            <IconButton
              icon="filter-list"
              size={24}
              iconColor="white"
              onPress={() => setShowFilterModal(true)}
            />
          </View>
          
          {/* Stats Overview */}
          <View style={styles.statsOverview}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewNumber}>{contractsData.length}</Text>
              <Text style={styles.overviewLabel}>Total Contracts</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewNumber}>{activeContracts}</Text>
              <Text style={styles.overviewLabel}>Active</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewNumber}>${totalValue}</Text>
              <Text style={styles.overviewLabel}>Total Value</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search contracts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
      </View>

      {/* Contracts List */}
      <FlatList
        data={filteredContracts}
        renderItem={renderContractCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Icon name="description" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.heading3, { textAlign: 'center', marginTop: SPACING.md }]}>
              No contracts found
            </Text>
            <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
              Create your first digital contract to get started!
            </Text>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleCreateContract}
        color="white"
      />

      {/* Modals */}
      {renderFilterModal()}
      {renderContractDetailModal()}
      {renderCreateModal()}
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
    marginTop: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading1,
    color: 'white',
    fontSize: 28,
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  overviewCard: {
    alignItems: 'center',
    flex: 1,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  overviewLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: COLORS.surface,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  contractCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  cardContent: {
    padding: SPACING.md,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  contractInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  contractDetails: {
    flex: 1,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  contractStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  contractBody: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  description: {
    marginTop: SPACING.xs,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
  },
  signatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActions: {
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    width: width * 0.9,
    maxHeight: '80%',
  },
  divider: {
    marginVertical: SPACING.md,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SPACING.sm,
  },
  filterChip: {
    margin: SPACING.xs,
  },
  applyButton: {
    marginTop: SPACING.lg,
  },
  contractModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contractBlurView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contractModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: width * 0.95,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalHeaderText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  modalStatusChip: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  modalDivider: {
    marginHorizontal: SPACING.lg,
  },
  modalSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  detailGridItem: {
    width: '50%',
    marginBottom: SPACING.md,
  },
  paymentInfo: {
    marginTop: SPACING.sm,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  modalActions: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  modalActionButton: {
    marginBottom: SPACING.sm,
  },
  createModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBlurView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: width * 0.95,
    maxHeight: '90%',
  },
  createHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  formSection: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  formInput: {
    marginBottom: SPACING.md,
  },
  chipSection: {
    marginBottom: SPACING.md,
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  typeChip: {
    margin: SPACING.xs,
  },
  durationChips: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  durationChip: {
    marginRight: SPACING.sm,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingTop: 0,
  },
  createActionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default DigitalContracts;