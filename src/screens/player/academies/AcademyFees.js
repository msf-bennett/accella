import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  TouchableOpacity,
  Dimensions,
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
  Portal,
  Modal,
  Searchbar,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  disabled: '#cccccc',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 22, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const AcademyFees = ({ navigation, route }) => {
  // Redux state
  const dispatch = useDispatch();
  const { user, academyFees, payments, loading } = useSelector(state => ({
    user: state.auth.user,
    academyFees: state.academy.fees,
    payments: state.payments.history,
    loading: state.academy.loading,
  }));

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, pending, paid, overdue
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Mock data for demonstration
  const mockFeeStructure = {
    monthlyFee: 2500,
    registrationFee: 1000,
    equipmentFee: 500,
    tournamentFee: 300,
    totalMonthly: 2500,
  };

  const mockPayments = [
    {
      id: '1',
      month: 'January 2024',
      amount: 2500,
      dueDate: '2024-01-15',
      status: 'paid',
      paidDate: '2024-01-12',
      paymentMethod: 'M-Pesa',
    },
    {
      id: '2',
      month: 'February 2024',
      amount: 2500,
      dueDate: '2024-02-15',
      status: 'paid',
      paidDate: '2024-02-10',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: '3',
      month: 'March 2024',
      amount: 2500,
      dueDate: '2024-03-15',
      status: 'pending',
      paymentMethod: null,
    },
    {
      id: '4',
      month: 'April 2024',
      amount: 2500,
      dueDate: '2024-04-15',
      status: 'overdue',
      paymentMethod: null,
      daysOverdue: 12,
    },
  ];

  // Animation setup
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

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch refresh actions
      // await dispatch(fetchAcademyFees());
      // await dispatch(fetchPaymentHistory());
      
      // Simulate API call
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing:', error);
      setRefreshing(false);
    }
  }, [dispatch]);

  const handlePayNow = (paymentId) => {
    Vibration.vibrate(50);
    Alert.alert(
      '💳 Payment Gateway',
      'This feature is coming soon! You\'ll be able to pay academy fees directly through the app.',
      [{ text: 'Got it! 🎯', style: 'default' }]
    );
  };

  const handleViewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'overdue':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return 'check-circle';
      case 'pending':
        return 'schedule';
      case 'overdue':
        return 'warning';
      default:
        return 'info';
    }
  };

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.month.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || payment.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalOutstanding = mockPayments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueCount = mockPayments.filter(p => p.status === 'overdue').length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, marginLeft: SPACING.sm }]}>
            💰 Academy Fees
          </Text>
          <Badge
            visible={overdueCount > 0}
            style={{ backgroundColor: COLORS.error }}
          >
            {overdueCount}
          </Badge>
        </View>

        {/* Fee Summary */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Surface
            style={{
              borderRadius: 16,
              padding: SPACING.md,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              elevation: 4,
            }}
          >
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
              Monthly Fee Structure 📊
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                  KES {mockFeeStructure.monthlyFee.toLocaleString()}
                </Text>
                <Text style={TEXT_STYLES.caption}>Per month</Text>
              </View>
              {totalOutstanding > 0 && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.error, fontWeight: '600' }]}>
                    KES {totalOutstanding.toLocaleString()}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.error }]}>Outstanding</Text>
                </View>
              )}
            </View>
          </Surface>
        </Animated.View>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={{ padding: SPACING.md, paddingBottom: SPACING.sm }}>
        <Searchbar
          placeholder="Search payments..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ marginBottom: SPACING.md, elevation: 2 }}
          iconColor={COLORS.primary}
        />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: SPACING.md }}
        >
          {['all', 'paid', 'pending', 'overdue'].map((filter) => (
            <Chip
              key={filter}
              selected={filterType === filter}
              onPress={() => setFilterType(filter)}
              style={{ 
                marginRight: SPACING.sm,
                backgroundColor: filterType === filter ? COLORS.primary : COLORS.surface,
              }}
              textStyle={{
                color: filterType === filter ? 'white' : COLORS.text,
                textTransform: 'capitalize',
              }}
            >
              {filter} {filter === 'overdue' && overdueCount > 0 ? `(${overdueCount})` : ''}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Payment History */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingTop: 0 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Payment History 📋
        </Text>

        {filteredPayments.length === 0 ? (
          <Card style={{ padding: SPACING.xl, alignItems: 'center' }}>
            <Icon name="receipt" size={48} color={COLORS.disabled} />
            <Text style={[TEXT_STYLES.body, { marginTop: SPACING.md, textAlign: 'center' }]}>
              No payments found matching your search
            </Text>
          </Card>
        ) : (
          filteredPayments.map((payment, index) => (
            <Animated.View
              key={payment.id}
              style={{
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 25 + (index * 10)],
                  })
                }],
              }}
            >
              <Card
                style={{
                  marginBottom: SPACING.md,
                  elevation: 3,
                }}
                onPress={() => handleViewPaymentDetails(payment)}
              >
                <Card.Content>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                    <Icon
                      name={getStatusIcon(payment.status)}
                      size={24}
                      color={getStatusColor(payment.status)}
                      style={{ marginRight: SPACING.sm }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                        {payment.month}
                      </Text>
                      <Text style={TEXT_STYLES.caption}>
                        Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                        KES {payment.amount.toLocaleString()}
                      </Text>
                      <Chip
                        compact
                        style={{ 
                          backgroundColor: getStatusColor(payment.status),
                          marginTop: SPACING.xs,
                        }}
                        textStyle={{ color: 'white', fontSize: 10 }}
                      >
                        {payment.status.toUpperCase()}
                      </Chip>
                    </View>
                  </View>

                  {payment.status === 'overdue' && (
                    <View style={{ 
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      padding: SPACING.sm,
                      borderRadius: 8,
                      marginBottom: SPACING.sm,
                    }}>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.error }]}>
                        ⚠️ {payment.daysOverdue} days overdue
                      </Text>
                    </View>
                  )}

                  {payment.status === 'paid' && payment.paidDate && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                      <Icon name="payment" size={16} color={COLORS.success} />
                      <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                        Paid on {new Date(payment.paidDate).toLocaleDateString()} via {payment.paymentMethod}
                      </Text>
                    </View>
                  )}

                  {(payment.status === 'pending' || payment.status === 'overdue') && (
                    <Button
                      mode="contained"
                      onPress={() => handlePayNow(payment.id)}
                      style={{ 
                        marginTop: SPACING.sm,
                        backgroundColor: COLORS.primary,
                      }}
                      icon="payment"
                    >
                      Pay Now
                    </Button>
                  )}
                </Card.Content>
              </Card>
            </Animated.View>
          ))
        )}

        {/* Fee Breakdown */}
        <Card style={{ marginTop: SPACING.lg, elevation: 3 }}>
          <Card.Title
            title="💳 Fee Breakdown"
            titleStyle={TEXT_STYLES.h3}
            left={(props) => <Avatar.Icon {...props} icon="receipt" backgroundColor={COLORS.primary} />}
          />
          <Card.Content>
            {Object.entries(mockFeeStructure).map(([key, value]) => {
              if (key === 'totalMonthly') return null;
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return (
                <View key={key} style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  paddingVertical: SPACING.xs,
                }}>
                  <Text style={TEXT_STYLES.body}>{label}</Text>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                    KES {value.toLocaleString()}
                  </Text>
                </View>
              );
            })}
          </Card.Content>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Payment Details Modal */}
      <Portal>
        <Modal
          visible={showPaymentModal}
          onDismiss={() => setShowPaymentModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.md,
            borderRadius: 16,
            padding: SPACING.lg,
          }}
        >
          {selectedPayment && (
            <>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, textAlign: 'center' }]}>
                Payment Details 📄
              </Text>
              
              <View style={{ marginBottom: SPACING.md }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                  {selectedPayment.month}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  Amount: KES {selectedPayment.amount.toLocaleString()}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  Due Date: {new Date(selectedPayment.dueDate).toLocaleDateString()}
                </Text>
                {selectedPayment.paidDate && (
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                    Paid: {new Date(selectedPayment.paidDate).toLocaleDateString()}
                  </Text>
                )}
                {selectedPayment.paymentMethod && (
                  <Text style={TEXT_STYLES.caption}>
                    Method: {selectedPayment.paymentMethod}
                  </Text>
                )}
              </View>

              <Button
                mode="outlined"
                onPress={() => setShowPaymentModal(false)}
                style={{ marginTop: SPACING.md }}
              >
                Close
              </Button>
            </>
          )}
        </Modal>
      </Portal>

      {/* Quick Pay FAB */}
      {totalOutstanding > 0 && (
        <FAB
          icon="payment"
          label="Quick Pay"
          onPress={() => handlePayNow('quick')}
          style={{
            position: 'absolute',
            margin: SPACING.md,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.primary,
          }}
        />
      )}
    </View>
  );
};

export default AcademyFees;