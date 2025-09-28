import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Button, Chip, FAB, Searchbar, Menu, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';

const PaymentHistory = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [paymentData, setPaymentData] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    // Replace with actual API call
    const samplePayments = [
      {
        id: 1,
        type: 'Monthly Training Fee',
        childName: 'Alex Johnson',
        amount: 250.00,
        currency: 'USD',
        date: '2025-08-01',
        dueDate: '2025-08-01',
        status: 'paid',
        paymentMethod: 'Credit Card (*4532)',
        academy: 'Elite Sports Academy',
        program: 'Football Development Program',
        invoiceNumber: 'INV-2025-0801',
        description: 'Monthly training fee for August 2025',
      },
      {
        id: 2,
        type: 'Equipment Fee',
        childName: 'Emma Johnson',
        amount: 85.00,
        currency: 'USD',
        date: '2025-07-28',
        dueDate: '2025-07-28',
        status: 'paid',
        paymentMethod: 'Bank Transfer',
        academy: 'Aquatic Center',
        program: 'Swimming Program',
        invoiceNumber: 'INV-2025-0728',
        description: 'Swimming equipment and gear',
      },
      {
        id: 3,
        type: 'Registration Fee',
        childName: 'Alex Johnson',
        amount: 150.00,
        currency: 'USD',
        date: '2025-07-25',
        dueDate: '2025-07-25',
        status: 'paid',
        paymentMethod: 'Credit Card (*4532)',
        academy: 'Elite Sports Academy',
        program: 'Football Development Program',
        invoiceNumber: 'INV-2025-0725',
        description: 'Program registration and assessment fee',
      },
      {
        id: 4,
        type: 'Monthly Training Fee',
        childName: 'Alex Johnson',
        amount: 250.00,
        currency: 'USD',
        date: '2025-07-01',
        dueDate: '2025-07-01',
        status: 'paid',
        paymentMethod: 'Credit Card (*4532)',
        academy: 'Elite Sports Academy',
        program: 'Football Development Program',
        invoiceNumber: 'INV-2025-0701',
        description: 'Monthly training fee for July 2025',
      },
      {
        id: 5,
        type: 'Monthly Training Fee',
        childName: 'Emma Johnson',
        amount: 180.00,
        currency: 'USD',
        date: '2025-08-01',
        dueDate: '2025-08-01',
        status: 'paid',
        paymentMethod: 'Bank Transfer',
        academy: 'Aquatic Center',
        program: 'Swimming Program',
        invoiceNumber: 'INV-2025-0801-SW',
        description: 'Monthly swimming lessons for August 2025',
      },
      {
        id: 6,
        type: 'Monthly Training Fee',
        childName: 'Alex Johnson',
        amount: 250.00,
        currency: 'USD',
        date: '2025-09-01',
        dueDate: '2025-09-01',
        status: 'pending',
        paymentMethod: null,
        academy: 'Elite Sports Academy',
        program: 'Football Development Program',
        invoiceNumber: 'INV-2025-0901',
        description: 'Monthly training fee for September 2025',
      },
      {
        id: 7,
        type: 'Competition Fee',
        childName: 'Emma Johnson',
        amount: 45.00,
        currency: 'USD',
        date: '2025-08-15',
        dueDate: '2025-08-20',
        status: 'overdue',
        paymentMethod: null,
        academy: 'Aquatic Center',
        program: 'Swimming Program',
        invoiceNumber: 'INV-2025-0815',
        description: 'Regional swimming competition entry fee',
      },
    ];

    const sampleSummary = {
      totalPaid: 1160.00,
      totalPending: 295.00,
      totalOverdue: 45.00,
      monthlyBudget: 430.00, // Both children combined
      nextPaymentDate: '2025-08-20',
      activeSubscriptions: 2,
    };

    setPaymentData(samplePayments);
    setSummary(sampleSummary);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaymentData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'overdue': return COLORS.error;
      case 'cancelled': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'PAID';
      case 'pending': return 'PENDING';
      case 'overdue': return 'OVERDUE';
      case 'cancelled': return 'CANCELLED';
      default: return status.toUpperCase();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handlePayNow = (payment) => {
    Alert.alert(
      'Make Payment',
      `Pay ${formatCurrency(payment.amount)} for ${payment.description}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: () => {
            // Navigate to payment screen or process payment
            Alert.alert('Success', 'Payment processed successfully!');
          }
        },
      ]
    );
  };

  const handleViewInvoice = (payment) => {
    Alert.alert(
      'Invoice Details',
      `Invoice: ${payment.invoiceNumber}\nChild: ${payment.childName}\nProgram: ${payment.program}\nAcademy: ${payment.academy}`,
      [{ text: 'OK' }]
    );
  };

  const filteredPayments = paymentData.filter(payment => {
    const matchesSearch = payment.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.academy.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && payment.status === selectedFilter;
  });

  const PaymentCard = ({ payment }) => (
    <Card style={styles.paymentCard}>
      <TouchableOpacity onPress={() => handleViewInvoice(payment)}>
        <View style={styles.cardHeader}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentType}>{payment.type}</Text>
            <Text style={styles.childName}>{payment.childName} • {payment.academy}</Text>
            <Text style={styles.paymentDate}>
              {payment.status === 'paid' ? 'Paid on' : 'Due on'} {formatDate(payment.status === 'paid' ? payment.date : payment.dueDate)}
            </Text>
          </View>
          <View style={styles.amountSection}>
            <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
            <Chip 
              mode="flat"
              style={[styles.statusChip, { backgroundColor: `${getStatusColor(payment.status)}20` }]}
              textStyle={{ color: getStatusColor(payment.status), fontSize: 12, fontWeight: 'bold' }}
            >
              {getStatusText(payment.status)}
            </Chip>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <Text style={styles.description} numberOfLines={2}>{payment.description}</Text>
        
        {payment.paymentMethod && (
          <View style={styles.paymentMethodRow}>
            <Icon name="credit-card" size={16} color={COLORS.textSecondary} />
            <Text style={styles.paymentMethod}>{payment.paymentMethod}</Text>
          </View>
        )}

        {(payment.status === 'pending' || payment.status === 'overdue') && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => handlePayNow(payment)}
              style={styles.payButton}
              buttonColor={payment.status === 'overdue' ? COLORS.error : COLORS.primary}
              contentStyle={styles.buttonContent}
            >
              Pay Now
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleViewInvoice(payment)}
              style={styles.viewButton}
              contentStyle={styles.buttonContent}
            >
              View Invoice
            </Button>
          </View>
        )}
      </View>
    </Card>
  );

  const SummaryCard = () => (
    <Card style={styles.summaryCard}>
      <Card.Content>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatCurrency(summary.totalPaid)}</Text>
            <Text style={styles.summaryLabel}>Total Paid</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.warning }]}>{formatCurrency(summary.totalPending)}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.error }]}>{formatCurrency(summary.totalOverdue)}</Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{formatCurrency(summary.monthlyBudget)}</Text>
            <Text style={styles.summaryLabel}>Monthly Budget</Text>
          </View>
        </View>

        <Divider style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryRowItem}>
            <Icon name="event" size={20} color={COLORS.primary} />
            <Text style={styles.summaryRowText}>Next Payment: {formatDate(summary.nextPaymentDate)}</Text>
          </View>
          <View style={styles.summaryRowItem}>
            <Icon name="subscriptions" size={20} color={COLORS.success} />
            <Text style={styles.summaryRowText}>{summary.activeSubscriptions} Active Programs</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Payments & Bills</Text>
        <Text style={styles.subtitle}>Track and manage your children's training expenses</Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search payments..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
<Menu
  visible={filterVisible}
  onDismiss={() => setFilterVisible(false)}
  anchor={
    <TouchableOpacity 
      style={styles.filterButton}
      onPress={() => setFilterVisible(true)}
    >
      <Icon name="filter-list" size={24} color={COLORS.primary} />
    </TouchableOpacity>
  }
>
  <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title="All Payments" />
  <Menu.Item onPress={() => { setSelectedFilter('paid'); setFilterVisible(false); }} title="Paid" />
  <Menu.Item onPress={() => { setSelectedFilter('pending'); setFilterVisible(false); }} title="Pending" />
  <Menu.Item onPress={() => { setSelectedFilter('overdue'); setFilterVisible(false); }} title="Overdue" />
  <Divider />
  <Menu.Item 
    onPress={() => { 
      setFilterVisible(false); 
      // Navigate to a sample payment details (you can use any payment ID)
      navigation.navigate('PaymentDetails', { paymentId: paymentData[0]?.id || 1 });
    }} 
    title="View Payment Details" 
    leadingIcon="receipt"
  /><Menu.Item 
    onPress={() => { 
      setFilterVisible(false); 
      // Navigate to a sample payment details (you can use any payment ID)
      navigation.navigate('BillingSettings', { paymentId: paymentData[0]?.id || 1 });
    }} 
    title="Billing Settings" 
    leadingIcon="receipt"
  /><Menu.Item 
    onPress={() => { 
      setFilterVisible(false); 
      // Navigate to a sample payment details (you can use any payment ID)
      navigation.navigate('PaymentReminders', { paymentId: paymentData[0]?.id || 1 });
    }} 
    title="Payment Reminders" 
    leadingIcon="receipt"
  />
</Menu>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <SummaryCard />

        {/* Payment History */}
        <View style={styles.paymentsSection}>
          <Text style={styles.sectionTitle}>
            Payment History ({filteredPayments.length})
          </Text>
          
          {filteredPayments.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt" size={80} color={COLORS.lightGray} />
              <Text style={styles.emptyTitle}>No Payments Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try adjusting your search terms' : 'Your payment history will appear here'}
              </Text>
            </View>
          ) : (
            filteredPayments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB for quick actions */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('PaymentDashboard')}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    backgroundColor: '#f8f9fa',
  },
  filterButton: {
    marginLeft: 12,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  summaryRow: {
    gap: 12,
  },
  summaryRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryRowText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    fontWeight: '600',
  },
  paymentsSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  paymentCard: {
    marginBottom: 12,
    elevation: 1,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  childName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  statusChip: {
    height: 24,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethod: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  payButton: {
    flex: 1,
  },
  viewButton: {
    flex: 1,
  },
  buttonContent: {
    height: 36,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default PaymentHistory;