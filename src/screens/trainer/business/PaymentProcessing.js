import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
  Vibration,
  FlatList,
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
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const PaymentProcessing = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, payments } = useSelector(state => state);
  
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('this_month');

  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 12580.50,
    pendingPayments: 850.00,
    successfulTransactions: 156,
    refundRequests: 2,
    processingFees: 245.30,
    netEarnings: 12335.20,
  });

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 'txn_001',
      clientName: 'Sarah Johnson',
      amount: 120.00,
      type: 'session_payment',
      status: 'completed',
      date: '2025-01-18T10:30:00Z',
      method: 'card',
      sessionType: '1-on-1 Training',
      clientAvatar: null,
    },
    {
      id: 'txn_002',
      clientName: 'Mike Chen',
      amount: 200.00,
      type: 'package_payment',
      status: 'pending',
      date: '2025-01-17T15:45:00Z',
      method: 'bank_transfer',
      sessionType: '4-Week Program',
      clientAvatar: null,
    },
    {
      id: 'txn_003',
      clientName: 'Emma Davis',
      amount: 80.00,
      type: 'session_payment',
      status: 'completed',
      date: '2025-01-16T09:15:00Z',
      method: 'digital_wallet',
      sessionType: 'Group Class',
      clientAvatar: null,
    },
    {
      id: 'txn_004',
      clientName: 'James Wilson',
      amount: 300.00,
      type: 'monthly_subscription',
      status: 'completed',
      date: '2025-01-15T14:20:00Z',
      method: 'card',
      sessionType: 'Premium Plan',
      clientAvatar: null,
    },
    {
      id: 'txn_005',
      clientName: 'Lisa Rodriguez',
      amount: 150.00,
      type: 'session_payment',
      status: 'refunded',
      date: '2025-01-14T11:00:00Z',
      method: 'card',
      sessionType: '1-on-1 Training',
      clientAvatar: null,
    },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'card_001',
      type: 'credit_card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2027',
      isDefault: true,
    },
    {
      id: 'bank_001',
      type: 'bank_account',
      bankName: 'Chase Bank',
      accountType: 'checking',
      last4: '1234',
      isDefault: false,
    },
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'dashboard' },
    { id: 'transactions', title: 'Transactions', icon: 'receipt' },
    { id: 'methods', title: 'Payment Methods', icon: 'payment' },
    { id: 'analytics', title: 'Analytics', icon: 'analytics' },
  ];

  const filterPeriods = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_year', label: 'This Year' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'pending': return '#FFA726';
      case 'failed': return COLORS.error;
      case 'refunded': return '#9C27B0';
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'pending': return 'schedule';
      case 'failed': return 'error';
      case 'refunded': return 'undo';
      default: return 'help';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card': return 'credit-card';
      case 'bank_transfer': return 'account-balance';
      case 'digital_wallet': return 'account-balance-wallet';
      default: return 'payment';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTransactionPress = (transaction) => {
    Vibration.vibrate(50);
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleRefundRequest = () => {
    Alert.alert(
      'Process Refund',
      `Are you sure you want to refund ${formatCurrency(selectedTransaction.amount)} to ${selectedTransaction.clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Refund Processed', 'The refund has been initiated and will be processed within 3-5 business days.');
            setModalVisible(false);
          }
        }
      ]
    );
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Payment method integration coming soon! You\'ll be able to add cards, bank accounts, and digital wallets.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const handleWithdrawFunds = () => {
    Alert.alert(
      'Withdraw Funds',
      `Withdraw ${formatCurrency(paymentStats.netEarnings)} to your default payment method?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          onPress: () => {
            Alert.alert('Withdrawal Initiated', 'Your funds will be transferred within 1-2 business days.');
          }
        }
      ]
    );
  };

  const renderOverviewTab = () => (
    <View>
      <Card style={styles.statsCard}>
        <LinearGradient
          colors={[COLORS.primary, '#764ba2']}
          style={styles.statsGradient}
        >
          <View style={styles.statsContent}>
            <Text style={styles.statsTitle}>Payment Summary</Text>
            <View style={styles.mainStat}>
              <Text style={styles.mainStatNumber}>{formatCurrency(paymentStats.netEarnings)}</Text>
              <Text style={styles.mainStatLabel}>Net Earnings</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatCurrency(paymentStats.totalRevenue)}</Text>
                <Text style={styles.statLabel}>Total Revenue</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{paymentStats.successfulTransactions}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Card>

      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStatsRow}>
          <Surface style={[styles.quickStatCard, { borderLeftColor: '#FFA726' }]}>
            <Text style={styles.quickStatAmount}>{formatCurrency(paymentStats.pendingPayments)}</Text>
            <Text style={styles.quickStatLabel}>Pending</Text>
          </Surface>
          <Surface style={[styles.quickStatCard, { borderLeftColor: COLORS.error }]}>
            <Text style={styles.quickStatAmount}>{formatCurrency(paymentStats.processingFees)}</Text>
            <Text style={styles.quickStatLabel}>Fees</Text>
          </Surface>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => setSelectedTab('transactions')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentTransactions.slice(0, 3).map(renderTransactionItem)}
      </View>

      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleWithdrawFunds}
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
          icon="account-balance-wallet"
        >
          Withdraw Funds
        </Button>
        <Button
          mode="outlined"
          onPress={handleAddPaymentMethod}
          style={styles.secondaryButton}
          contentStyle={styles.buttonContent}
          icon="add"
        >
          Add Payment Method
        </Button>
      </View>
    </View>
  );

  const renderTransactionsTab = () => (
    <View>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterPeriods.map((period, index) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.filterChip,
                { marginLeft: index === 0 ? SPACING.lg : SPACING.sm },
                filterPeriod === period.id && styles.activeFilterChip
              ]}
              onPress={() => setFilterPeriod(period.id)}
            >
              <Text style={[
                styles.filterChipText,
                filterPeriod === period.id && styles.activeFilterChipText
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search transactions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={recentTransactions.filter(transaction =>
          transaction.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.sessionType.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderTransactionItem(item)}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderTransactionItem = (transaction) => (
    <TouchableOpacity
      key={transaction.id}
      style={styles.transactionCard}
      onPress={() => handleTransactionPress(transaction)}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionClient}>
              <Avatar.Text
                size={40}
                label={transaction.clientName.split(' ').map(n => n[0]).join('')}
                style={{ backgroundColor: COLORS.primary }}
              />
              <View style={styles.transactionInfo}>
                <Text style={styles.clientName}>{transaction.clientName}</Text>
                <Text style={styles.sessionType}>{transaction.sessionType}</Text>
              </View>
            </View>
            <View style={styles.transactionAmount}>
              <Text style={[
                styles.amountText,
                transaction.status === 'refunded' && styles.refundedAmount
              ]}>
                {transaction.status === 'refunded' ? '-' : '+'}{formatCurrency(transaction.amount)}
              </Text>
              <Chip
                mode="outlined"
                textStyle={[styles.statusChipText, { color: getStatusColor(transaction.status) }]}
                style={[styles.statusChip, { borderColor: getStatusColor(transaction.status) }]}
                icon={getStatusIcon(transaction.status)}
              >
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </Chip>
            </View>
          </View>
          <View style={styles.transactionFooter}>
            <View style={styles.transactionMeta}>
              <Icon
                name={getPaymentMethodIcon(transaction.method)}
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderPaymentMethodsTab = () => (
    <View style={styles.paymentMethodsContainer}>
      <Text style={styles.sectionTitle}>Your Payment Methods</Text>
      
      {paymentMethods.map((method) => (
        <Card key={method.id} style={styles.paymentMethodCard}>
          <Card.Content>
            <View style={styles.paymentMethodHeader}>
              <View style={styles.paymentMethodInfo}>
                <Icon
                  name={method.type === 'credit_card' ? 'credit-card' : 'account-balance'}
                  size={24}
                  color={COLORS.primary}
                />
                <View style={styles.paymentMethodDetails}>
                  <Text style={styles.paymentMethodType}>
                    {method.type === 'credit_card' 
                      ? `${method.brand.toUpperCase()} •••• ${method.last4}`
                      : `${method.bankName} •••• ${method.last4}`
                    }
                  </Text>
                  <Text style={styles.paymentMethodSubtext}>
                    {method.type === 'credit_card' 
                      ? `Expires ${method.expiryMonth}/${method.expiryYear}`
                      : method.accountType.charAt(0).toUpperCase() + method.accountType.slice(1)
                    }
                  </Text>
                </View>
              </View>
              {method.isDefault && (
                <Chip mode="outlined" textStyle={styles.defaultChipText} style={styles.defaultChip}>
                  Default
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      ))}

      <TouchableOpacity style={styles.addPaymentMethodCard} onPress={handleAddPaymentMethod}>
        <Card style={styles.card}>
          <Card.Content style={styles.addPaymentContent}>
            <Icon name="add-circle-outline" size={32} color={COLORS.primary} />
            <Text style={styles.addPaymentText}>Add New Payment Method</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </View>
  );

  const renderAnalyticsTab = () => (
    <View style={styles.analyticsContainer}>
      <Card style={styles.analyticsCard}>
        <Card.Content>
          <Text style={styles.analyticsTitle}>Revenue Trend</Text>
          <View style={styles.trendContainer}>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>This Month</Text>
              <Text style={styles.trendValue}>{formatCurrency(8450.00)}</Text>
              <View style={styles.trendIndicator}>
                <Icon name="trending-up" size={16} color={COLORS.success} />
                <Text style={[styles.trendChange, { color: COLORS.success }]}>+12.5%</Text>
              </View>
            </View>
            <Divider style={styles.trendDivider} />
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>Last Month</Text>
              <Text style={styles.trendValue}>{formatCurrency(7520.00)}</Text>
              <View style={styles.trendIndicator}>
                <Icon name="trending-up" size={16} color={COLORS.success} />
                <Text style={[styles.trendChange, { color: COLORS.success }]}>+8.3%</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.analyticsCard}>
        <Card.Content>
          <Text style={styles.analyticsTitle}>Payment Methods Usage</Text>
          <View style={styles.usageContainer}>
            <View style={styles.usageItem}>
              <Text style={styles.usageLabel}>Credit Cards</Text>
              <ProgressBar progress={0.65} color={COLORS.primary} style={styles.progressBar} />
              <Text style={styles.usagePercentage}>65%</Text>
            </View>
            <View style={styles.usageItem}>
              <Text style={styles.usageLabel}>Bank Transfer</Text>
              <ProgressBar progress={0.25} color="#FFA726" style={styles.progressBar} />
              <Text style={styles.usagePercentage}>25%</Text>
            </View>
            <View style={styles.usageItem}>
              <Text style={styles.usageLabel}>Digital Wallet</Text>
              <ProgressBar progress={0.10} color="#4ECDC4" style={styles.progressBar} />
              <Text style={styles.usagePercentage}>10%</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={() => Alert.alert('Advanced Analytics', 'Detailed analytics dashboard coming soon!')}
        style={styles.analyticsButton}
        contentStyle={styles.buttonContent}
        icon="analytics"
      >
        View Detailed Analytics
      </Button>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab();
      case 'transactions':
        return renderTransactionsTab();
      case 'methods':
        return renderPaymentMethodsTab();
      case 'analytics':
        return renderAnalyticsTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderTransactionModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10} />
        <Surface style={styles.modalContent}>
          {selectedTransaction && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Transaction Details</Text>
                <IconButton
                  icon="close"
                  onPress={() => setModalVisible(false)}
                />
              </View>

              <View style={styles.modalBody}>
                <View style={styles.transactionDetailHeader}>
                  <Avatar.Text
                    size={50}
                    label={selectedTransaction.clientName.split(' ').map(n => n[0]).join('')}
                    style={{ backgroundColor: COLORS.primary }}
                  />
                  <View style={styles.transactionDetailInfo}>
                    <Text style={styles.transactionDetailName}>{selectedTransaction.clientName}</Text>
                    <Text style={styles.transactionDetailType}>{selectedTransaction.sessionType}</Text>
                  </View>
                </View>

                <View style={styles.transactionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={[
                      styles.detailValue,
                      selectedTransaction.status === 'refunded' && styles.refundedAmount
                    ]}>
                      {selectedTransaction.status === 'refunded' ? '-' : '+'}{formatCurrency(selectedTransaction.amount)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Chip
                      mode="outlined"
                      textStyle={[styles.statusChipText, { color: getStatusColor(selectedTransaction.status) }]}
                      style={[styles.statusChip, { borderColor: getStatusColor(selectedTransaction.status) }]}
                      icon={getStatusIcon(selectedTransaction.status)}
                    >
                      {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                    </Chip>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedTransaction.date)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment Method</Text>
                    <View style={styles.paymentMethodDetail}>
                      <Icon
                        name={getPaymentMethodIcon(selectedTransaction.method)}
                        size={16}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.detailValue}>
                        {selectedTransaction.method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Transaction ID</Text>
                    <Text style={styles.detailValue}>{selectedTransaction.id.toUpperCase()}</Text>
                  </View>
                </View>

                {selectedTransaction.status === 'completed' && (
                  <View style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={handleRefundRequest}
                      style={styles.refundButton}
                      contentStyle={styles.buttonContent}
                      icon="undo"
                    >
                      Process Refund
                    </Button>
                  </View>
                )}
              </View>
            </>
          )}
        </Surface>
      </Modal>
    </Portal>
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
        <Text style={styles.headerTitle}>Payment Processing</Text>
        <Text style={styles.headerSubtitle}>Manage your earnings 💰</Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                { marginLeft: index === 0 ? SPACING.lg : SPACING.sm },
                selectedTab === tab.id && styles.activeTab
              ]}
              onPress={() => {
                Vibration.vibrate(50);
                setSelectedTab(tab.id);
              }}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={selectedTab === tab.id ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderTabContent()}
        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleAddPaymentMethod}
      />

      {renderTransactionModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
  },
  tabContainer: {
    paddingVertical: SPACING.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    margin: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsContent: {
    alignItems: 'center',
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    marginBottom: SPACING.lg,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  mainStatNumber: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 32,
  },
  mainStatLabel: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  quickStatsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickStatCard: {
    flex: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 1,
  },
  quickStatAmount: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  quickStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  sectionContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  viewAllText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  secondaryButton: {
    borderColor: COLORS.primary,
  },
  buttonContent: {
    paddingVertical: SPACING.sm,
  },
  filterContainer: {
    paddingVertical: SPACING.md,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: SPACING.sm,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary + '20',
  },
  filterChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: '#fff',
    elevation: 1,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  transactionCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  transactionClient: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  clientName: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
  },
  sessionType: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...TEXT_STYLES.h4,
    color: COLORS.success,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  refundedAmount: {
    color: COLORS.error,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  paymentMethodsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  paymentMethodCard: {
    marginBottom: SPACING.md,
    backgroundColor: '#fff',
    elevation: 2,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  paymentMethodType: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
  },
  paymentMethodSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  defaultChip: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  defaultChipText: {
    color: COLORS.success,
    fontSize: 11,
  },
  addPaymentMethodCard: {
    marginTop: SPACING.md,
  },
  addPaymentContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  addPaymentText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  analyticsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  analyticsCard: {
    marginBottom: SPACING.lg,
    backgroundColor: '#fff',
    elevation: 2,
  },
  analyticsTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  trendContainer: {
    flexDirection: 'row',
  },
  trendItem: {
    flex: 1,
    alignItems: 'center',
  },
  trendLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  trendValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendChange: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  trendDivider: {
    width: 1,
    height: 60,
    marginHorizontal: SPACING.lg,
  },
  usageContainer: {
    marginTop: SPACING.md,
  },
  usageItem: {
    marginBottom: SPACING.md,
  },
  usageLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  usagePercentage: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  analyticsButton: {
    borderColor: COLORS.primary,
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  modalContent: {
    width: width - 40,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  transactionDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  transactionDetailInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  transactionDetailName: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  transactionDetailType: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  transactionDetails: {
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  paymentMethodDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  refundButton: {
    borderColor: COLORS.error,
  },
};

export default PaymentProcessing;
