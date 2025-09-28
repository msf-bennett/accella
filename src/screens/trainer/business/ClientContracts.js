import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Dimensions,
  Platform,
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
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your constants (adjust path as needed)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textLight: '#666666',
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
  caption: { fontSize: 14, color: COLORS.textLight },
  small: { fontSize: 12, color: COLORS.textLight },
};

const { width, height } = Dimensions.get('window');

const ClientContractsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, contracts, clients } = useSelector(state => ({
    user: state.user,
    contracts: state.contracts || [],
    clients: state.clients || [],
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [newContract, setNewContract] = useState({
    clientId: '',
    planType: '',
    duration: '',
    price: '',
    startDate: '',
    status: 'draft',
    sessions: '',
    description: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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

  const mockContracts = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      clientAvatar: 'SJ',
      planType: 'Personal Training',
      duration: '3 months',
      price: '$1200',
      monthlyPrice: '$400',
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      status: 'active',
      sessions: 36,
      completedSessions: 24,
      progress: 0.67,
      description: '3x per week personal training sessions',
      paymentStatus: 'paid',
      renewalDate: '2024-04-15',
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      clientAvatar: 'MC',
      planType: 'Group Training',
      duration: '6 months',
      price: '$800',
      monthlyPrice: '$133',
      startDate: '2024-02-01',
      endDate: '2024-08-01',
      status: 'active',
      sessions: 48,
      completedSessions: 16,
      progress: 0.33,
      description: '2x per week group fitness sessions',
      paymentStatus: 'pending',
      renewalDate: '2024-08-01',
    },
    {
      id: '3',
      clientName: 'Emma Davis',
      clientAvatar: 'ED',
      planType: 'Nutrition Coaching',
      duration: '2 months',
      price: '$400',
      monthlyPrice: '$200',
      startDate: '2024-03-01',
      endDate: '2024-05-01',
      status: 'pending',
      sessions: 16,
      completedSessions: 0,
      progress: 0,
      description: 'Weekly nutrition consultations',
      paymentStatus: 'unpaid',
      renewalDate: '2024-05-01',
    },
    {
      id: '4',
      clientName: 'Alex Thompson',
      clientAvatar: 'AT',
      planType: 'Online Coaching',
      duration: '12 months',
      price: '$2400',
      monthlyPrice: '$200',
      startDate: '2023-10-01',
      endDate: '2024-10-01',
      status: 'expired',
      sessions: 104,
      completedSessions: 104,
      progress: 1,
      description: 'Comprehensive online fitness program',
      paymentStatus: 'paid',
      renewalDate: '2024-10-01',
    },
  ];

  const filterButtons = [
    { key: 'all', label: 'All', count: mockContracts.length },
    { key: 'active', label: 'Active', count: mockContracts.filter(c => c.status === 'active').length },
    { key: 'pending', label: 'Pending', count: mockContracts.filter(c => c.status === 'pending').length },
    { key: 'expired', label: 'Expired', count: mockContracts.filter(c => c.status === 'expired').length },
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'expired': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'check-circle';
      case 'pending': return 'schedule';
      case 'expired': return 'cancel';
      default: return 'help-outline';
    }
  };

  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = contract.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.planType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || contract.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = mockContracts.reduce((sum, contract) => {
    return sum + parseFloat(contract.price.replace('$', ''));
  }, 0);

  const monthlyRevenue = mockContracts
    .filter(c => c.status === 'active')
    .reduce((sum, contract) => {
      return sum + parseFloat(contract.monthlyPrice.replace('$', ''));
    }, 0);

  const handleCreateContract = () => {
    Alert.alert(
      'Contract Created! 📋',
      'New client contract has been created successfully.',
      [{ text: 'OK', onPress: () => setShowCreateModal(false) }]
    );
  };

  const handleContractAction = (action, contract) => {
    switch (action) {
      case 'renew':
        Alert.alert('Contract Renewed! 🔄', `${contract.clientName}'s contract has been renewed.`);
        break;
      case 'terminate':
        Alert.alert('Contract Terminated', `${contract.clientName}'s contract has been terminated.`);
        break;
      case 'modify':
        Alert.alert('Modify Contract', `Opening contract modification for ${contract.clientName}.`);
        break;
      default:
        break;
    }
  };

  const renderContractCard = ({ item: contract }) => (
    <Card style={styles.contractCard} onPress={() => {
      setSelectedContract(contract);
      setShowContractDetails(true);
    }}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <Avatar.Text
              size={40}
              label={contract.clientAvatar}
              backgroundColor={COLORS.primary}
            />
            <View style={styles.clientDetails}>
              <Text style={[TEXT_STYLES.body, styles.clientName]}>{contract.clientName}</Text>
              <Text style={TEXT_STYLES.caption}>{contract.planType}</Text>
            </View>
          </View>
          <View style={styles.contractStatus}>
            <Chip
              icon={getStatusIcon(contract.status)}
              style={[styles.statusChip, { backgroundColor: getStatusColor(contract.status) + '20' }]}
              textStyle={{ color: getStatusColor(contract.status), fontWeight: '600' }}
            >
              {contract.status.toUpperCase()}
            </Chip>
            {contract.paymentStatus === 'pending' && (
              <Badge style={styles.paymentBadge} size={8} />
            )}
          </View>
        </View>

        <View style={styles.contractDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={16} color={COLORS.textLight} />
            <Text style={TEXT_STYLES.caption}>{contract.duration} • {contract.sessions} sessions</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="attach-money" size={16} color={COLORS.success} />
            <Text style={[TEXT_STYLES.body, { color: COLORS.success, fontWeight: '600' }]}>
              {contract.price}
            </Text>
          </View>
        </View>

        {contract.status === 'active' && (
          <>
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={TEXT_STYLES.caption}>Progress</Text>
                <Text style={TEXT_STYLES.caption}>
                  {contract.completedSessions}/{contract.sessions}
                </Text>
              </View>
              <ProgressBar
                progress={contract.progress}
                color={COLORS.primary}
                style={styles.progressBar}
              />
            </View>
          </>
        )}

        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            compact
            onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Session scheduling will be available soon.')}
            style={styles.actionButton}
          >
            Schedule
          </Button>
          <Button
            mode="outlined"
            compact
            onPress={() => Alert.alert('Feature Coming Soon! 💬', 'Client messaging will be available soon.')}
            style={styles.actionButton}
          >
            Message
          </Button>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => handleContractAction('modify', contract)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>Client Contracts</Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Manage your training agreements
            </Text>
          </View>
          <IconButton
            icon="add"
            iconColor="white"
            size={28}
            onPress={() => setShowCreateModal(true)}
            style={styles.addButton}
          />
        </View>

        <View style={styles.statsContainer}>
          <Surface style={styles.statCard}>
            <MaterialIcons name="description" size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h3, styles.statValue]}>{mockContracts.length}</Text>
            <Text style={TEXT_STYLES.caption}>Total Contracts</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <MaterialIcons name="trending-up" size={24} color={COLORS.success} />
            <Text style={[TEXT_STYLES.h3, styles.statValue]}>${totalRevenue.toLocaleString()}</Text>
            <Text style={TEXT_STYLES.caption}>Total Value</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <MaterialIcons name="attach-money" size={24} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.h3, styles.statValue]}>${monthlyRevenue}</Text>
            <Text style={TEXT_STYLES.caption}>Monthly Revenue</Text>
          </Surface>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCreateContractModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurOverlay} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.h3}>Create New Contract</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowCreateModal(false)}
              />
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[TEXT_STYLES.body, styles.inputLabel]}>Client Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Select or add client"
                  value={newContract.clientId}
                  onChangeText={(text) => setNewContract({...newContract, clientId: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[TEXT_STYLES.body, styles.inputLabel]}>Plan Type</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Personal Training, Group Training, etc."
                  value={newContract.planType}
                  onChangeText={(text) => setNewContract({...newContract, planType: text})}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                  <Text style={[TEXT_STYLES.body, styles.inputLabel]}>Duration</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="3 months"
                    value={newContract.duration}
                    onChangeText={(text) => setNewContract({...newContract, duration: text})}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
                  <Text style={[TEXT_STYLES.body, styles.inputLabel]}>Price</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="$1200"
                    value={newContract.price}
                    onChangeText={(text) => setNewContract({...newContract, price: text})}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[TEXT_STYLES.body, styles.inputLabel]}>Sessions</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="36 sessions"
                  value={newContract.sessions}
                  onChangeText={(text) => setNewContract({...newContract, sessions: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[TEXT_STYLES.body, styles.inputLabel]}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Contract description and terms"
                  value={newContract.description}
                  onChangeText={(text) => setNewContract({...newContract, description: text})}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowCreateModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateContract}
                style={styles.modalButton}
                buttonColor={COLORS.primary}
              >
                Create Contract
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderContractDetailsModal = () => (
    <Portal>
      <Modal
        visible={showContractDetails}
        onDismiss={() => setShowContractDetails(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurOverlay} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            {selectedContract && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={TEXT_STYLES.h3}>Contract Details</Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowContractDetails(false)}
                  />
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.clientSection}>
                    <Avatar.Text
                      size={60}
                      label={selectedContract.clientAvatar}
                      backgroundColor={COLORS.primary}
                    />
                    <View style={styles.clientInfo}>
                      <Text style={TEXT_STYLES.h3}>{selectedContract.clientName}</Text>
                      <Text style={TEXT_STYLES.caption}>{selectedContract.planType}</Text>
                      <Chip
                        icon={getStatusIcon(selectedContract.status)}
                        style={[styles.statusChip, { backgroundColor: getStatusColor(selectedContract.status) + '20' }]}
                        textStyle={{ color: getStatusColor(selectedContract.status) }}
                      >
                        {selectedContract.status.toUpperCase()}
                      </Chip>
                    </View>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
                      <Text style={TEXT_STYLES.caption}>Duration</Text>
                      <Text style={TEXT_STYLES.body}>{selectedContract.duration}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="attach-money" size={20} color={COLORS.success} />
                      <Text style={TEXT_STYLES.caption}>Total Value</Text>
                      <Text style={[TEXT_STYLES.body, { color: COLORS.success, fontWeight: '600' }]}>
                        {selectedContract.price}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="fitness-center" size={20} color={COLORS.warning} />
                      <Text style={TEXT_STYLES.caption}>Sessions</Text>
                      <Text style={TEXT_STYLES.body}>{selectedContract.sessions} total</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="date-range" size={20} color={COLORS.textLight} />
                      <Text style={TEXT_STYLES.caption}>Start Date</Text>
                      <Text style={TEXT_STYLES.body}>{selectedContract.startDate}</Text>
                    </View>
                  </View>

                  {selectedContract.status === 'active' && (
                    <>
                      <Text style={[TEXT_STYLES.body, styles.progressTitle]}>Session Progress</Text>
                      <View style={styles.progressDetail}>
                        <ProgressBar
                          progress={selectedContract.progress}
                          color={COLORS.primary}
                          style={styles.progressBarLarge}
                        />
                        <Text style={TEXT_STYLES.caption}>
                          {selectedContract.completedSessions} of {selectedContract.sessions} completed
                        </Text>
                      </View>
                    </>
                  )}

                  <Text style={[TEXT_STYLES.body, styles.descriptionTitle]}>Description</Text>
                  <Text style={TEXT_STYLES.caption}>{selectedContract.description}</Text>
                </ScrollView>

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => handleContractAction('modify', selectedContract)}
                    style={styles.modalButton}
                  >
                    Modify
                  </Button>
                  {selectedContract.status === 'active' && (
                    <Button
                      mode="contained"
                      onPress={() => handleContractAction('renew', selectedContract)}
                      style={styles.modalButton}
                      buttonColor={COLORS.success}
                    >
                      Renew
                    </Button>
                  )}
                </View>
              </>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {renderHeader()}

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search contracts or clients"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={TEXT_STYLES.body}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filterButtons.map((filter) => (
              <Chip
                key={filter.key}
                selected={selectedFilter === filter.key}
                onPress={() => setSelectedFilter(filter.key)}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.key && styles.selectedFilter
                ]}
                textStyle={[
                  styles.filterText,
                  selectedFilter === filter.key && styles.selectedFilterText
                ]}
              >
                {filter.label} ({filter.count})
              </Chip>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredContracts}
          renderItem={renderContractCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="description" size={64} color={COLORS.textLight} />
              <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>No Contracts Found</Text>
              <Text style={[TEXT_STYLES.caption, styles.emptyMessage]}>
                {searchQuery ? 'Try adjusting your search' : 'Create your first client contract'}
              </Text>
            </View>
          }
        />

        <FAB
          icon="add"
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
          color="white"
        />

        {renderCreateContractModal()}
        {renderContractDetailsModal()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    elevation: 2,
  },
  statValue: {
    marginVertical: SPACING.xs,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.sm,
  },
  filterContainer: {
    paddingRight: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  selectedFilter: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textLight,
  },
  selectedFilterText: {
    color: 'white',
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  contractCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  clientName: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  contractStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    borderRadius: 16,
  },
  paymentBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
  },
  contractDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  actionButton: {
    marginRight: SPACING.sm,
    borderColor: COLORS.border,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyMessage: {
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  modalContent: {
    maxHeight: height * 0.8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalBody: {
    padding: SPACING.md,
    maxHeight: height * 0.6,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  inputLabel: {
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    backgroundColor: COLORS.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    marginLeft: SPACING.sm,
  },
  clientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  detailItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  progressTitle: {
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  progressDetail: {
    marginBottom: SPACING.lg,
  },
  progressBarLarge: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  descriptionTitle: {
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
});

export default ClientContractsScreen;