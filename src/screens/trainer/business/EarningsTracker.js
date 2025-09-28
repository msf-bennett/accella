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
import { LineChart, BarChart, PieChart } from 'recharts';

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
  income: '#4CAF50',
  pending: '#FF9800',
  expense: '#F44336',
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

const EarningsTrackerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, earnings, transactions } = useSelector(state => ({
    user: state.user,
    earnings: state.earnings || {},
    transactions: state.transactions || [],
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState('overview');

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

  // Mock earnings data
  const mockEarningsData = {
    thisMonth: {
      total: 4850,
      sessions: 3200,
      packages: 1200,
      nutrition: 450,
      growth: 12.5,
    },
    lastMonth: {
      total: 4320,
      sessions: 2800,
      packages: 1100,
      nutrition: 420,
      growth: 8.3,
    },
    thisYear: {
      total: 52400,
      sessions: 35600,
      packages: 12800,
      nutrition: 4000,
      growth: 18.7,
    },
    pending: 1250,
    expenses: 890,
  };

  // Mock transaction data
  const mockTransactions = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      clientAvatar: 'SJ',
      type: 'session',
      amount: 80,
      status: 'completed',
      date: '2024-08-19',
      time: '09:00',
      description: 'Personal Training Session',
      paymentMethod: 'Card',
      sessionType: '1-on-1 Training',
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      clientAvatar: 'MC',
      type: 'package',
      amount: 400,
      status: 'pending',
      date: '2024-08-18',
      time: '14:30',
      description: '10-Session Package',
      paymentMethod: 'Bank Transfer',
      sessionType: 'Training Package',
    },
    {
      id: '3',
      clientName: 'Emma Davis',
      clientAvatar: 'ED',
      type: 'nutrition',
      amount: 120,
      status: 'completed',
      date: '2024-08-17',
      time: '11:00',
      description: 'Nutrition Consultation',
      paymentMethod: 'Cash',
      sessionType: 'Nutrition Coaching',
    },
    {
      id: '4',
      clientName: 'Alex Thompson',
      clientAvatar: 'AT',
      type: 'session',
      amount: 75,
      status: 'failed',
      date: '2024-08-16',
      time: '16:00',
      description: 'Group Training Session',
      paymentMethod: 'Card',
      sessionType: 'Group Training',
    },
    {
      id: '5',
      type: 'expense',
      amount: -50,
      status: 'completed',
      date: '2024-08-15',
      description: 'Equipment Purchase - Resistance Bands',
      category: 'Equipment',
      vendor: 'FitnessPro Store',
    },
  ];

  // Mock chart data
  const monthlyEarningsData = [
    { month: 'Jan', earnings: 3800, sessions: 45 },
    { month: 'Feb', earnings: 4200, sessions: 52 },
    { month: 'Mar', earnings: 3950, sessions: 48 },
    { month: 'Apr', earnings: 4600, sessions: 58 },
    { month: 'May', earnings: 4100, sessions: 49 },
    { month: 'Jun', earnings: 4850, sessions: 61 },
    { month: 'Jul', earnings: 4320, sessions: 54 },
    { month: 'Aug', earnings: 4850, sessions: 62 },
  ];

  const earningsBreakdown = [
    { name: 'Personal Training', value: 3200, color: COLORS.primary },
    { name: 'Training Packages', value: 1200, color: COLORS.secondary },
    { name: 'Nutrition Coaching', value: 450, color: COLORS.success },
  ];

  const periodButtons = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  const viewTabs = [
    { key: 'overview', label: 'Overview', icon: 'dashboard' },
    { key: 'transactions', label: 'Transactions', icon: 'receipt' },
    { key: 'analytics', label: 'Analytics', icon: 'trending-up' },
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'failed': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'pending': return 'schedule';
      case 'failed': return 'error';
      default: return 'help-outline';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'session': return 'fitness-center';
      case 'package': return 'card-giftcard';
      case 'nutrition': return 'restaurant';
      case 'expense': return 'remove-circle';
      default: return 'attach-money';
    }
  };

  const formatCurrency = (amount) => {
    return `$${Math.abs(amount).toLocaleString()}`;
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>Earnings Tracker</Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Track your fitness business income
            </Text>
          </View>
          <IconButton
            icon="filter-list"
            iconColor="white"
            size={28}
            onPress={() => setShowFilters(true)}
            style={styles.filterButton}
          />
        </View>

        <View style={styles.periodSelector}>
          {periodButtons.map((period) => (
            <TouchableOpacity
              key={period.key}
              onPress={() => setSelectedPeriod(period.key)}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.activePeriodButton
              ]}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.activePeriodButtonText
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.earningsOverview}>
          <Surface style={styles.mainEarningsCard}>
            <View style={styles.earningsHeader}>
              <View>
                <Text style={[TEXT_STYLES.caption, styles.earningsLabel]}>
                  This {selectedPeriod === 'year' ? 'Year' : selectedPeriod === 'month' ? 'Month' : 'Week'}
                </Text>
                <Text style={[TEXT_STYLES.h1, styles.earningsAmount]}>
                  ${mockEarningsData.thisMonth.total.toLocaleString()}
                </Text>
              </View>
              <View style={styles.growthIndicator}>
                <MaterialIcons name="trending-up" size={20} color={COLORS.success} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.success, fontWeight: '600' }]}>
                  +{mockEarningsData.thisMonth.growth}%
                </Text>
              </View>
            </View>
            <View style={styles.earningsBreakdown}>
              <View style={styles.breakdownItem}>
                <Text style={TEXT_STYLES.caption}>Sessions</Text>
                <Text style={[TEXT_STYLES.body, { color: COLORS.primary, fontWeight: '600' }]}>
                  ${mockEarningsData.thisMonth.sessions.toLocaleString()}
                </Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={TEXT_STYLES.caption}>Packages</Text>
                <Text style={[TEXT_STYLES.body, { color: COLORS.secondary, fontWeight: '600' }]}>
                  ${mockEarningsData.thisMonth.packages.toLocaleString()}
                </Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={TEXT_STYLES.caption}>Nutrition</Text>
                <Text style={[TEXT_STYLES.body, { color: COLORS.success, fontWeight: '600' }]}>
                  ${mockEarningsData.thisMonth.nutrition.toLocaleString()}
                </Text>
              </View>
            </View>
          </Surface>
        </View>

        <View style={styles.quickStats}>
          <Surface style={styles.quickStatCard}>
            <MaterialIcons name="pending" size={20} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.caption, styles.quickStatLabel]}>Pending</Text>
            <Text style={[TEXT_STYLES.body, styles.quickStatValue]}>
              ${mockEarningsData.pending.toLocaleString()}
            </Text>
          </Surface>
          <Surface style={styles.quickStatCard}>
            <MaterialIcons name="remove-circle" size={20} color={COLORS.error} />
            <Text style={[TEXT_STYLES.caption, styles.quickStatLabel]}>Expenses</Text>
            <Text style={[TEXT_STYLES.body, styles.quickStatValue]}>
              ${mockEarningsData.expenses.toLocaleString()}
            </Text>
          </Surface>
          <Surface style={styles.quickStatCard}>
            <MaterialIcons name="account-balance" size={20} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.caption, styles.quickStatLabel]}>Net Income</Text>
            <Text style={[TEXT_STYLES.body, styles.quickStatValue]}>
              ${(mockEarningsData.thisMonth.total - mockEarningsData.expenses).toLocaleString()}
            </Text>
          </Surface>
        </View>
      </View>
    </LinearGradient>
  );

  const renderViewTabs = () => (
    <View style={styles.tabContainer}>
      {viewTabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveView(tab.key)}
          style={[
            styles.tab,
            activeView === tab.key && styles.activeTab
          ]}
        >
          <MaterialIcons
            name={tab.icon}
            size={20}
            color={activeView === tab.key ? COLORS.primary : COLORS.textLight}
          />
          <Text style={[
            TEXT_STYLES.caption,
            styles.tabText,
            activeView === tab.key && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewContent = () => (
    <View style={styles.contentSection}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Recent Activity</Text>
      <FlatList
        data={mockTransactions.slice(0, 5)}
        renderItem={renderTransactionCard}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => setActiveView('transactions')}
      >
        <Text style={[TEXT_STYLES.body, { color: COLORS.primary, fontWeight: '600' }]}>
          View All Transactions
        </Text>
        <MaterialIcons name="arrow-forward" size={20} color={COLORS.primary} />
      </TouchableOpacity>

      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Earnings Breakdown</Text>
      <Card style={styles.chartCard}>
        <Card.Content style={styles.chartContent}>
          <View style={styles.pieChartContainer}>
            <View style={styles.pieChartPlaceholder}>
              <MaterialIcons name="pie-chart" size={80} color={COLORS.textLight} />
              <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.sm }]}>
                Chart visualization coming soon
              </Text>
            </View>
            <View style={styles.chartLegend}>
              {earningsBreakdown.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={TEXT_STYLES.caption}>{item.name}</Text>
                  <Text style={[TEXT_STYLES.body, { color: item.color, fontWeight: '600' }]}>
                    ${item.value.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderTransactionsContent = () => (
    <View style={styles.contentSection}>
      <FlatList
        data={mockTransactions}
        renderItem={renderTransactionCard}
        keyExtractor={(item) => item.id}
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
            <MaterialIcons name="receipt" size={64} color={COLORS.textLight} />
            <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>No Transactions</Text>
            <Text style={[TEXT_STYLES.caption, styles.emptyMessage]}>
              Your transaction history will appear here
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderAnalyticsContent = () => (
    <View style={styles.contentSection}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Monthly Earnings Trend</Text>
      <Card style={styles.chartCard}>
        <Card.Content style={styles.chartContent}>
          <View style={styles.chartPlaceholder}>
            <MaterialIcons name="trending-up" size={80} color={COLORS.textLight} />
            <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.sm }]}>
              Monthly earnings chart coming soon
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Performance Metrics</Text>
      <View style={styles.metricsGrid}>
        <Surface style={styles.metricCard}>
          <MaterialIcons name="trending-up" size={24} color={COLORS.success} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>+18.7%</Text>
          <Text style={TEXT_STYLES.caption}>YoY Growth</Text>
        </Surface>
        <Surface style={styles.metricCard}>
          <MaterialIcons name="people" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>32</Text>
          <Text style={TEXT_STYLES.caption}>Active Clients</Text>
        </Surface>
        <Surface style={styles.metricCard}>
          <MaterialIcons name="fitness-center" size={24} color={COLORS.secondary} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.secondary }]}>156</Text>
          <Text style={TEXT_STYLES.caption}>Sessions/Month</Text>
        </Surface>
        <Surface style={styles.metricCard}>
          <MaterialIcons name="star" size={24} color={COLORS.warning} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>4.9</Text>
          <Text style={TEXT_STYLES.caption}>Avg Rating</Text>
        </Surface>
      </View>

      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Goals & Targets</Text>
      <Card style={styles.goalsCard}>
        <Card.Content>
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={TEXT_STYLES.body}>Monthly Target</Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.primary, fontWeight: '600' }]}>
                $4,850 / $5,000
              </Text>
            </View>
            <ProgressBar
              progress={0.97}
              color={COLORS.primary}
              style={styles.goalProgress}
            />
            <Text style={TEXT_STYLES.caption}>97% achieved - $150 to go!</Text>
          </View>
          
          <Divider style={styles.goalDivider} />
          
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={TEXT_STYLES.body}>Annual Target</Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.success, fontWeight: '600' }]}>
                $52,400 / $60,000
              </Text>
            </View>
            <ProgressBar
              progress={0.87}
              color={COLORS.success}
              style={styles.goalProgress}
            />
            <Text style={TEXT_STYLES.caption}>87% achieved - On track for goal!</Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderTransactionCard = ({ item: transaction }) => (
    <Card
      style={styles.transactionCard}
      onPress={() => {
        setSelectedTransaction(transaction);
        setShowTransactionDetails(true);
      }}
    >
      <Card.Content style={styles.transactionContent}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionLeft}>
            {transaction.clientAvatar ? (
              <Avatar.Text
                size={40}
                label={transaction.clientAvatar}
                backgroundColor={COLORS.primary}
              />
            ) : (
              <Avatar.Icon
                size={40}
                icon={getTransactionIcon(transaction.type)}
                backgroundColor={transaction.amount < 0 ? COLORS.error : COLORS.primary}
              />
            )}
            <View style={styles.transactionDetails}>
              <Text style={[TEXT_STYLES.body, styles.transactionTitle]}>
                {transaction.clientName || transaction.description}
              </Text>
              <Text style={TEXT_STYLES.caption}>
                {transaction.sessionType || transaction.category} • {transaction.date}
              </Text>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text style={[
              TEXT_STYLES.body,
              {
                color: transaction.amount < 0 ? COLORS.error : COLORS.success,
                fontWeight: '600',
                marginBottom: SPACING.xs,
              }
            ]}>
              {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount)}
            </Text>
            <Chip
              icon={getStatusIcon(transaction.status)}
              style={[
                styles.transactionStatusChip,
                { backgroundColor: getStatusColor(transaction.status) + '20' }
              ]}
              textStyle={{ color: getStatusColor(transaction.status), fontSize: 11 }}
            >
              {transaction.status}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTransactionDetailsModal = () => (
    <Portal>
      <Modal
        visible={showTransactionDetails}
        onDismiss={() => setShowTransactionDetails(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurOverlay} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            {selectedTransaction && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={TEXT_STYLES.h3}>Transaction Details</Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowTransactionDetails(false)}
                  />
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.transactionDetailSection}>
                    {selectedTransaction.clientAvatar ? (
                      <Avatar.Text
                        size={60}
                        label={selectedTransaction.clientAvatar}
                        backgroundColor={COLORS.primary}
                      />
                    ) : (
                      <Avatar.Icon
                        size={60}
                        icon={getTransactionIcon(selectedTransaction.type)}
                        backgroundColor={selectedTransaction.amount < 0 ? COLORS.error : COLORS.primary}
                      />
                    )}
                    <View style={styles.transactionDetailInfo}>
                      <Text style={TEXT_STYLES.h3}>
                        {selectedTransaction.clientName || 'Business Expense'}
                      </Text>
                      <Text style={TEXT_STYLES.caption}>
                        {selectedTransaction.sessionType || selectedTransaction.category}
                      </Text>
                      <Chip
                        icon={getStatusIcon(selectedTransaction.status)}
                        style={[
                          styles.statusChip,
                          { backgroundColor: getStatusColor(selectedTransaction.status) + '20' }
                        ]}
                        textStyle={{ color: getStatusColor(selectedTransaction.status) }}
                      >
                        {selectedTransaction.status.toUpperCase()}
                      </Chip>
                    </View>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="attach-money" size={20} color={COLORS.success} />
                      <Text style={TEXT_STYLES.caption}>Amount</Text>
                      <Text style={[
                        TEXT_STYLES.h3,
                        { color: selectedTransaction.amount < 0 ? COLORS.error : COLORS.success }
                      ]}>
                        {selectedTransaction.amount < 0 ? '-' : '+'}${Math.abs(selectedTransaction.amount)}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="date-range" size={20} color={COLORS.primary} />
                      <Text style={TEXT_STYLES.caption}>Date</Text>
                      <Text style={TEXT_STYLES.body}>{selectedTransaction.date}</Text>
                    </View>
                    {selectedTransaction.time && (
                      <View style={styles.detailItem}>
                        <MaterialIcons name="schedule" size={20} color={COLORS.warning} />
                        <Text style={TEXT_STYLES.caption}>Time</Text>
                        <Text style={TEXT_STYLES.body}>{selectedTransaction.time}</Text>
                      </View>
                    )}
                    {selectedTransaction.paymentMethod && (
                      <View style={styles.detailItem}>
                        <MaterialIcons name="payment" size={20} color={COLORS.textLight} />
                        <Text style={TEXT_STYLES.caption}>Payment Method</Text>
                        <Text style={TEXT_STYLES.body}>{selectedTransaction.paymentMethod}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={[TEXT_STYLES.body, styles.descriptionTitle]}>Description</Text>
                  <Text style={TEXT_STYLES.caption}>{selectedTransaction.description}</Text>
                </ScrollView>

                <View style={styles.modalActions}>
                  {selectedTransaction.status === 'pending' && (
                    <Button
                      mode="outlined"
                      onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Payment reminders will be available soon.')}
                      style={styles.modalButton}
                    >
                      Send Reminder
                    </Button>
                  )}
                  <Button
                    mode="contained"
                    onPress={() => Alert.alert('Feature Coming Soon! 📧', 'Export receipts will be available soon.')}
                    style={styles.modalButton}
                    buttonColor={COLORS.primary}
                  >
                    Export Receipt
                  </Button>
                </View>
              </>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'transactions':
        return renderTransactionsContent();
      case 'analytics':
        return renderAnalyticsContent();
      default:
        return renderOverviewContent();
    }
  };

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
        {renderViewTabs()}
        
        <ScrollView
          style={styles.scrollContent}
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
          {renderContent()}
        </ScrollView>

        <FAB
          icon="add"
          style={styles.fab}
          onPress={() => Alert.alert('Feature Coming Soon! 💰', 'Manual transaction entry will be available soon.')}
          color="white"
        />

        {renderTransactionDetailsModal()}
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
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: SPACING.xs,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  periodButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  activePeriodButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  earningsOverview: {
    marginBottom: SPACING.md,
  },
  mainEarningsCard: {
    borderRadius: 16,
    elevation: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  earningsLabel: {
    marginBottom: SPACING.xs,
  },
  earningsAmount: {
    color: COLORS.primary,
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  earningsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    elevation: 2,
  },
  quickStatLabel: {
    marginVertical: SPACING.xs,
  },
  quickStatValue: {
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    marginLeft: SPACING.xs,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  contentSection: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginVertical: SPACING.sm,
  },
  chartCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  chartContent: {
    padding: SPACING.lg,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieChartPlaceholder: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  chartLegend: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
  },
  goalsCard: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  goalItem: {
    paddingVertical: SPACING.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  goalProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  goalDivider: {
    marginVertical: SPACING.md,
  },
  transactionCard: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 1,
  },
  transactionContent: {
    padding: SPACING.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  transactionTitle: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionStatusChip: {
    borderRadius: 12,
    height: 24,
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
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
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
  transactionDetailSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  transactionDetailInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  statusChip: {
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
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
  descriptionTitle: {
    fontWeight: '600',
    marginBottom: SPACING.sm,
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
});

export default EarningsTrackerScreen;