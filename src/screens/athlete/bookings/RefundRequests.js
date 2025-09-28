import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  TouchableOpacity,
  Animated,
  Vibration,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  FAB,
  Surface,
  Avatar,
  IconButton,
  Portal,
  Modal,
  TextInput,
  Chip,
  ProgressBar,
  Searchbar,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const RefundRequests = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, refundRequests, loading } = useSelector(state => ({
    user: state.auth.user,
    refundRequests: state.refunds?.requests || [],
    loading: state.refunds?.loading || false,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    bookingId: '',
    reason: '',
    description: '',
    amount: '',
    refundMethod: 'original',
  });
  const [errors, setErrors] = useState({});
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // Mock data for demonstration
  const mockRefundRequests = [
    {
      id: 'REF001',
      bookingId: 'BK001234',
      coachName: 'Sarah Johnson',
      amount: 75.00,
      reason: 'Session cancelled by coach',
      description: 'Coach had to cancel due to emergency. Session was not rescheduled.',
      status: 'pending',
      requestDate: '2024-08-20T10:30:00Z',
      refundMethod: 'original',
    },
    {
      id: 'REF002',
      bookingId: 'BK001235',
      coachName: 'Mike Rodriguez',
      amount: 120.00,
      reason: 'Technical issues during session',
      description: 'Video call connection failed multiple times, session could not proceed.',
      status: 'approved',
      requestDate: '2024-08-18T14:15:00Z',
      refundMethod: 'original',
    },
    {
      id: 'REF003',
      bookingId: 'BK001236',
      coachName: 'Emily Chen',
      amount: 90.00,
      reason: 'Duplicate booking',
      description: 'Accidentally booked the same session twice.',
      status: 'processed',
      requestDate: '2024-08-15T09:45:00Z',
      processedDate: '2024-08-16T16:30:00Z',
      refundMethod: 'original',
    },
  ];

  useEffect(() => {
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

    loadRefundRequests();
  }, []);

  const loadRefundRequests = useCallback(async () => {
    try {
      // Simulated API call - replace with actual Redux action
      // dispatch(fetchRefundRequests(user.id));
    } catch (error) {
      Alert.alert('Error', 'Failed to load refund requests');
    }
  }, [dispatch, user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRefundRequests();
    setRefreshing(false);
  }, [loadRefundRequests]);

  const handleNewRefundRequest = () => {
    setFormData({
      bookingId: '',
      reason: '',
      description: '',
      amount: '',
      refundMethod: 'original',
    });
    setErrors({});
    setShowNewRequestModal(true);
    Vibration.vibrate(50);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bookingId.trim()) {
      newErrors.bookingId = 'Booking ID is required';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitRefundRequest = async () => {
    if (!validateForm()) return;

    try {
      Vibration.vibrate(100);
      
      const requestData = {
        ...formData,
        userId: user.id,
        requestDate: new Date().toISOString(),
        status: 'pending',
        amount: parseFloat(formData.amount),
      };

      // dispatch(submitRefundRequest(requestData));
      Alert.alert(
        'Success! 🎉', 
        'Your refund request has been submitted successfully. You will receive an update within 2-3 business days.'
      );
      
      setShowNewRequestModal(false);
      loadRefundRequests();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit refund request');
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
    Vibration.vibrate(50);
  };

  const handleCancelRequest = (request) => {
    if (request.status !== 'pending') {
      Alert.alert('Cannot Cancel', 'Only pending requests can be cancelled.');
      return;
    }

    Alert.alert(
      'Cancel Refund Request',
      'Are you sure you want to cancel this refund request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              Vibration.vibrate(100);
              // dispatch(cancelRefundRequest(request.id));
              Alert.alert('Success', 'Refund request cancelled successfully!');
              loadRefundRequests();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel refund request');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return COLORS.warning;
      case 'approved': return COLORS.success;
      case 'processed': return COLORS.primary;
      case 'rejected': return COLORS.error;
      case 'cancelled': return COLORS.textLight;
      default: return COLORS.textLight;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'schedule';
      case 'approved': return 'check-circle';
      case 'processed': return 'done-all';
      case 'rejected': return 'cancel';
      case 'cancelled': return 'block';
      default: return 'help';
    }
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredRequests = mockRefundRequests.filter(request => {
    const matchesSearch = 
      request.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    return {
      pending: mockRefundRequests.filter(r => r.status === 'pending').length,
      approved: mockRefundRequests.filter(r => r.status === 'approved').length,
      processed: mockRefundRequests.filter(r => r.status === 'processed').length,
      rejected: mockRefundRequests.filter(r => r.status === 'rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

  const renderRefundRequestCard = ({ item: request }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card style={styles.requestCard}>
        <TouchableOpacity
          onPress={() => handleViewDetails(request)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.requestInfo}>
              <View style={styles.requestMeta}>
                <Text style={TEXT_STYLES.subtitle}>
                  Booking #{request.bookingId}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {request.coachName} • {formatDate(request.requestDate)}
                </Text>
              </View>
              
              <View style={styles.statusChip}>
                <Chip
                  mode="outlined"
                  icon={getStatusIcon(request.status)}
                  style={[
                    styles.statusChipStyle,
                    { borderColor: getStatusColor(request.status) }
                  ]}
                  textStyle={[
                    styles.statusText,
                    { color: getStatusColor(request.status) }
                  ]}
                >
                  {request.status.toUpperCase()}
                </Chip>
              </View>
            </View>

            <View style={styles.amountSection}>
              <Text style={styles.refundAmount}>
                {formatCurrency(request.amount)}
              </Text>
              <Text style={TEXT_STYLES.caption}>
                Refund Amount
              </Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.reasonSection}>
              <Icon name="info-outline" size={16} color={COLORS.textLight} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, flex: 1 }]}>
                {request.reason}
              </Text>
            </View>

            {request.status === 'pending' && (
              <View style={styles.progressSection}>
                <ProgressBar
                  progress={0.33}
                  color={COLORS.warning}
                  style={styles.progressBar}
                />
                <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                  Processing • Expected response in 2-3 business days
                </Text>
              </View>
            )}

            {request.status === 'approved' && (
              <View style={styles.progressSection}>
                <ProgressBar
                  progress={0.66}
                  color={COLORS.success}
                  style={styles.progressBar}
                />
                <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs, color: COLORS.success }]}>
                  Approved • Processing refund...
                </Text>
              </View>
            )}

            {request.status === 'processed' && (
              <View style={styles.successSection}>
                <Icon name="check-circle" size={20} color={COLORS.success} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: COLORS.success }]}>
                  Refund processed successfully on {formatDate(request.processedDate)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cardActions}>
            <Button
              mode="outlined"
              compact
              onPress={() => handleViewDetails(request)}
              style={styles.actionButton}
            >
              View Details
            </Button>
            
            {request.status === 'pending' && (
              <Button
                mode="text"
                compact
                textColor={COLORS.error}
                onPress={() => handleCancelRequest(request)}
                style={styles.actionButton}
              >
                Cancel
              </Button>
            )}
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderNewRequestModal = () => (
    <Portal>
      <Modal
        visible={showNewRequestModal}
        onDismiss={() => setShowNewRequestModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurOverlay} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.heading}>New Refund Request</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowNewRequestModal(false)}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formContainer}>
                <TextInput
                  label="Booking ID *"
                  value={formData.bookingId}
                  onChangeText={(text) => setFormData({ ...formData, bookingId: text })}
                  error={!!errors.bookingId}
                  style={styles.input}
                  placeholder="e.g., BK001234"
                />
                {errors.bookingId && (
                  <Text style={styles.errorText}>{errors.bookingId}</Text>
                )}

                <TextInput
                  label="Refund Amount *"
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                  keyboardType="decimal-pad"
                  error={!!errors.amount}
                  style={styles.input}
                  placeholder="0.00"
                  left={<TextInput.Affix text="$" />}
                />
                {errors.amount && (
                  <Text style={styles.errorText}>{errors.amount}</Text>
                )}

                <TextInput
                  label="Reason for Refund *"
                  value={formData.reason}
                  onChangeText={(text) => setFormData({ ...formData, reason: text })}
                  error={!!errors.reason}
                  style={styles.input}
                  placeholder="e.g., Session cancelled by coach"
                />
                {errors.reason && (
                  <Text style={styles.errorText}>{errors.reason}</Text>
                )}

                <TextInput
                  label="Detailed Description *"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={4}
                  error={!!errors.description}
                  style={styles.input}
                  placeholder="Please provide detailed information about why you're requesting this refund..."
                />
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}

                <View style={styles.refundMethodSection}>
                  <Text style={TEXT_STYLES.subtitle}>Refund Method</Text>
                  <View style={styles.refundMethods}>
                    {[
                      { value: 'original', label: 'Original Payment Method', icon: 'refresh' },
                      { value: 'wallet', label: 'App Wallet', icon: 'account-balance-wallet' },
                      { value: 'bank', label: 'Bank Transfer', icon: 'account-balance' },
                    ].map((method) => (
                      <TouchableOpacity
                        key={method.value}
                        style={[
                          styles.refundMethodOption,
                          formData.refundMethod === method.value && styles.selectedRefundMethod,
                        ]}
                        onPress={() => setFormData({ ...formData, refundMethod: method.value })}
                      >
                        <Icon
                          name={method.icon}
                          size={20}
                          color={
                            formData.refundMethod === method.value ? COLORS.primary : COLORS.textLight
                          }
                        />
                        <Text style={[
                          TEXT_STYLES.caption,
                          { 
                            marginLeft: SPACING.sm,
                            color: formData.refundMethod === method.value ? COLORS.primary : COLORS.text
                          }
                        ]}>
                          {method.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowNewRequestModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmitRefundRequest}
                  loading={loading}
                  style={styles.submitButton}
                >
                  Submit Request
                </Button>
              </View>
            </ScrollView>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderDetailsModal = () => (
    <Portal>
      <Modal
        visible={showDetailsModal}
        onDismiss={() => setShowDetailsModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurOverlay} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.heading}>Refund Details</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowDetailsModal(false)}
              />
            </View>

            {selectedRequest && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailsContainer}>
                  <View style={styles.statusSection}>
                    <Chip
                      mode="outlined"
                      icon={getStatusIcon(selectedRequest.status)}
                      style={[
                        styles.detailsStatusChip,
                        { borderColor: getStatusColor(selectedRequest.status) }
                      ]}
                      textStyle={{ color: getStatusColor(selectedRequest.status) }}
                    >
                      {selectedRequest.status.toUpperCase()}
                    </Chip>
                  </View>

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={TEXT_STYLES.caption}>Request ID</Text>
                      <Text style={TEXT_STYLES.subtitle}>#{selectedRequest.id}</Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Text style={TEXT_STYLES.caption}>Booking ID</Text>
                      <Text style={TEXT_STYLES.subtitle}>#{selectedRequest.bookingId}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={TEXT_STYLES.caption}>Coach</Text>
                      <Text style={TEXT_STYLES.subtitle}>{selectedRequest.coachName}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={TEXT_STYLES.caption}>Amount</Text>
                      <Text style={[TEXT_STYLES.subtitle, { color: COLORS.primary }]}>
                        {formatCurrency(selectedRequest.amount)}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={TEXT_STYLES.caption}>Request Date</Text>
                      <Text style={TEXT_STYLES.subtitle}>
                        {formatDate(selectedRequest.requestDate)}
                      </Text>
                    </View>

                    {selectedRequest.processedDate && (
                      <View style={styles.detailItem}>
                        <Text style={TEXT_STYLES.caption}>Processed Date</Text>
                        <Text style={TEXT_STYLES.subtitle}>
                          {formatDate(selectedRequest.processedDate)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.reasonSection}>
                    <Text style={TEXT_STYLES.subtitle}>Reason</Text>
                    <Text style={[TEXT_STYLES.body, { marginTop: SPACING.xs }]}>
                      {selectedRequest.reason}
                    </Text>
                  </View>

                  <View style={styles.descriptionSection}>
                    <Text style={TEXT_STYLES.subtitle}>Description</Text>
                    <Text style={[TEXT_STYLES.body, { marginTop: SPACING.xs }]}>
                      {selectedRequest.description}
                    </Text>
                  </View>

                  {selectedRequest.adminNotes && (
                    <View style={styles.adminNotesSection}>
                      <Text style={TEXT_STYLES.subtitle}>Admin Notes</Text>
                      <Text style={[TEXT_STYLES.body, { marginTop: SPACING.xs }]}>
                        {selectedRequest.adminNotes}
                      </Text>
                    </View>
                  )}
                </View>

                {selectedRequest.status === 'pending' && (
                  <View style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleCancelRequest(selectedRequest)}
                      style={styles.cancelRefundButton}
                      textColor={COLORS.error}
                    >
                      Cancel Request
                    </Button>
                  </View>
                )}
              </ScrollView>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <Text style={styles.headerTitle}>Refund Requests 💰</Text>
        <Text style={styles.headerSubtitle}>
          Track and manage your refund requests
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard}>
            <Icon name="schedule" size={24} color={COLORS.warning} />
            <Text style={TEXT_STYLES.caption}>Pending</Text>
            <Text style={TEXT_STYLES.heading}>{statusCounts.pending}</Text>
          </Surface>
          
          <Surface style={styles.statCard}>
            <Icon name="check-circle" size={24} color={COLORS.success} />
            <Text style={TEXT_STYLES.caption}>Approved</Text>
            <Text style={TEXT_STYLES.heading}>{statusCounts.approved}</Text>
          </Surface>

          <Surface style={styles.statCard}>
            <Icon name="done-all" size={24} color={COLORS.primary} />
            <Text style={TEXT_STYLES.caption}>Processed</Text>
            <Text style={TEXT_STYLES.heading}>{statusCounts.processed}</Text>
          </Surface>
        </View>

        <View style={styles.filtersContainer}>
          <Searchbar
            placeholder="Search requests..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterChips}
          >
            {[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'processed', label: 'Processed' },
              { value: 'rejected', label: 'Rejected' },
            ].map((filter) => (
              <Chip
                key={filter.value}
                mode={statusFilter === filter.value ? 'flat' : 'outlined'}
                selected={statusFilter === filter.value}
                onPress={() => setStatusFilter(filter.value)}
                style={[
                  styles.filterChip,
                  statusFilter === filter.value && { backgroundColor: COLORS.primary }
                ]}
                textStyle={{
                  color: statusFilter === filter.value ? '#ffffff' : COLORS.text
                }}
              >
                {filter.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {filteredRequests.length > 0 ? (
          <FlatList
            data={filteredRequests}
            renderItem={renderRefundRequestCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          >
            <Card style={styles.emptyStateCard}>
              <View style={styles.emptyState}>
                <Icon name="receipt-long" size={64} color={COLORS.textLight} />
                <Text style={[TEXT_STYLES.subtitle, { marginTop: SPACING.md }]}>
                  {searchQuery || statusFilter !== 'all' 
                    ? 'No requests found' 
                    : 'No Refund Requests'
                  }
                </Text>
                <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Request refunds for cancelled or problematic sessions'
                  }
                </Text>
                {!searchQuery && statusFilter === 'all' && (
                  <Button
                    mode="contained"
                    onPress={handleNewRefundRequest}
                    style={{ marginTop: SPACING.lg }}
                    icon="add"
                  >
                    New Refund Request
                  </Button>
                )}
              </View>
            </Card>
          </ScrollView>
        )}
      </View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleNewRefundRequest}
        color="#ffffff"
      />

      {renderNewRequestModal()}
      {renderDetailsModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 0.3,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  filterChips: {
    flexGrow: 0,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  listContainer: {
    paddingBottom: SPACING.xl * 2,
  },
  requestCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  requestInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  requestMeta: {
    flex: 1,
  },
  statusChip: {
    marginLeft: SPACING.md,
  },
  statusChipStyle: {
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  refundAmount: {
    ...TEXT_STYLES.heading,
    color: COLORS.primary,
    fontSize: 20,
  },
  cardContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  reasonSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  successSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flex: 0.45,
  },
  emptyStateCard: {
    padding: SPACING.xl,
    borderRadius: 16,
    elevation: 2,
    marginTop: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    borderRadius: 20,
    padding: SPACING.lg,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginBottom: SPACING.sm,
    marginTop: -SPACING.sm,
  },
  refundMethodSection: {
    marginTop: SPACING.lg,
  },
  refundMethods: {
    marginTop: SPACING.md,
  },
  refundMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  selectedRefundMethod: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 0.45,
  },
  submitButton: {
    flex: 0.45,
  },
  detailsContainer: {
    marginBottom: SPACING.lg,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  detailsStatusChip: {
    borderWidth: 2,
    paddingHorizontal: SPACING.md,
  },
  detailsGrid: {
    marginBottom: SPACING.xl,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  descriptionSection: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
  },
  adminNotesSection: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: `${COLORS.warning}10`,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  cancelRefundButton: {
    flex: 1,
    borderColor: COLORS.error,
  },
};

export default RefundRequests;