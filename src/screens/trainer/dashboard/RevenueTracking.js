import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Vibration,
  Alert,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card, 
  Chip, 
  ProgressBar, 
  IconButton, 
  Surface,
  Portal,
  Modal,
  Button,
  Divider
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const RevenueTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const { revenueData, isLoading, user } = useSelector(state => state.trainer);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showRevenueBreakdown, setShowRevenueBreakdown] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock revenue data - replace with real Redux state
  const mockRevenueData = {
    currentMonth: {
      total: 4850.00,
      growth: 15.3,
      sessions: 48,
      avgPerSession: 101.04,
    },
    currentWeek: {
      total: 1240.00,
      growth: 8.5,
      sessions: 12,
      avgPerSession: 103.33,
    },
    today: {
      total: 320.00,
      growth: 20.0,
      sessions: 3,
      avgPerSession: 106.67,
    },
    yearToDate: {
      total: 38750.00,
      growth: 22.1,
      sessions: 387,
      avgPerSession: 100.13,
    },
    breakdown: {
      personalTraining: { amount: 3200.00, percentage: 66, sessions: 32, color: '#667eea' },
      groupSessions: { amount: 980.00, percentage: 20, sessions: 14, color: '#11998e' },
      nutrition: { amount: 450.00, percentage: 9, sessions: 9, color: '#f39c12' },
      specialPrograms: { amount: 220.00, percentage: 5, sessions: 3, color: '#9b59b6' },
    },
    recentTransactions: [
      {
        id: 'txn_1',
        clientName: 'Sarah Johnson',
        amount: 120.00,
        service: 'Personal Training',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed',
        paymentMethod: 'card',
      },
      {
        id: 'txn_2',
        clientName: 'Mike Thompson',
        amount: 85.00,
        service: 'Group Session',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: 'completed',
        paymentMethod: 'cash',
      },
      {
        id: 'txn_3',
        clientName: 'Emily Davis',
        amount: 75.00,
        service: 'Nutrition Consultation',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'pending',
        paymentMethod: 'transfer',
      },
      {
        id: 'txn_4',
        clientName: 'Alex Rodriguez',
        amount: 150.00,
        service: 'Special Program',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'refunded',
        paymentMethod: 'card',
      },
    ],
    monthlyGoal: 5000.00,
    weeklyGoal: 1300.00,
    upcomingPayments: [
      {
        id: 'upcoming_1',
        clientName: 'Jennifer White',
        amount: 240.00,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        service: 'Monthly Package',
      },
      {
        id: 'upcoming_2',
        clientName: 'David Brown',
        amount: 180.00,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        service: 'Nutrition Plan',
      },
    ],
  };

  const revenueInfo = revenueData || mockRevenueData;

  useEffect(() => {
    // Animate entrance
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

    // Fetch revenue data
    // dispatch(fetchRevenueData());
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // dispatch(fetchRevenueData());
    }, 1000);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPeriodData = () => {
    switch (selectedPeriod) {
      case 'today': return revenueInfo.today;
      case 'week': return revenueInfo.currentWeek;
      case 'year': return revenueInfo.yearToDate;
      default: return revenueInfo.currentMonth;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'pending': return '#ff9500';
      case 'refunded': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const toggleCardExpansion = useCallback((cardId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
    Vibration.vibrate(30);
  }, []);

  const handleAction = useCallback((action, data = null) => {
    Vibration.vibrate(50);
    
    switch (action) {
      case 'viewFullReport':
        navigation.navigate('FullRevenueReport');
        break;
      case 'exportData':
        Alert.alert('Export Data', 'Revenue data export functionality coming soon!');
        break;
      case 'manageGoals':
        navigation.navigate('RevenueGoals');
        break;
      case 'viewTransaction':
        navigation.navigate('TransactionDetails', { transactionId: data.id });
        break;
      case 'contactClient':
        navigation.navigate('Messages', { clientId: data.clientId });
        break;
      default:
        Alert.alert(
          'Feature Development',
          `${action} feature is currently under development and will be available in the next update! 🚀`,
          [{ text: 'Got it!', style: 'default' }]
        );
    }
  }, [navigation]);

  const renderPeriodSelector = () => {
    const periods = [
      { key: 'today', label: 'Today' },
      { key: 'week', label: 'Week' },
      { key: 'month', label: 'Month' },
      { key: 'year', label: 'Year' },
    ];

    return (
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive
            ]}
            onPress={() => {
              setSelectedPeriod(period.key);
              Vibration.vibrate(30);
            }}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMainRevenueCard = () => {
    const currentData = getPeriodData();
    const isGoalCard = selectedPeriod === 'month' || selectedPeriod === 'week';
    const goal = selectedPeriod === 'month' ? revenueInfo.monthlyGoal : revenueInfo.weeklyGoal;
    const progressPercent = isGoalCard ? (currentData.total / goal) : null;

    return (
      <Animated.View 
        style={[
          styles.mainRevenueCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.revenueGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueTitle}>
              {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Revenue
            </Text>
            <TouchableOpacity
              onPress={() => setShowRevenueBreakdown(true)}
              activeOpacity={0.8}
            >
              <Icon name="pie-chart" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.revenueAmount}>
            {formatCurrency(currentData.total)}
          </Text>

          <View style={styles.revenueStats}>
            <View style={styles.statRow}>
              <Icon name="trending-up" size={20} color="white" />
              <Text style={styles.growthText}>
                {currentData.growth > 0 ? '+' : ''}{currentData.growth}% growth
              </Text>
            </View>
            <View style={styles.statRow}>
              <Icon name="fitness-center" size={20} color="white" />
              <Text style={styles.sessionsText}>
                {currentData.sessions} sessions
              </Text>
            </View>
          </View>

          <View style={styles.avgPerSession}>
            <Text style={styles.avgLabel}>Avg per session</Text>
            <Text style={styles.avgAmount}>
              {formatCurrency(currentData.avgPerSession)}
            </Text>
          </View>

          {isGoalCard && (
            <View style={styles.goalSection}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>Goal Progress</Text>
                <Text style={styles.goalPercent}>
                  {Math.round(progressPercent * 100)}%
                </Text>
              </View>
              <ProgressBar
                progress={Math.min(progressPercent, 1)}
                color="white"
                style={styles.goalProgress}
              />
              <Text style={styles.goalRemaining}>
                {formatCurrency(Math.max(0, goal - currentData.total))} to goal
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderRevenueBreakdown = () => {
    const breakdown = revenueInfo.breakdown;
    const breakdownItems = Object.entries(breakdown);

    return (
      <Card style={styles.breakdownCard} elevation={4}>
        <TouchableOpacity
          onPress={() => toggleCardExpansion('breakdown')}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Revenue Breakdown</Text>
            <Icon 
              name={expandedCards.has('breakdown') ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color={COLORS.text} 
            />
          </View>

          <View style={styles.breakdownPreview}>
            {breakdownItems.map(([key, data]) => (
              <View key={key} style={styles.breakdownItem}>
                <View style={[styles.breakdownColor, { backgroundColor: data.color }]} />
                <Text style={styles.breakdownLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <Text style={styles.breakdownAmount}>
                  {formatCurrency(data.amount)}
                </Text>
              </View>
            ))}
          </View>

          {expandedCards.has('breakdown') && (
            <View style={styles.expandedBreakdown}>
              <Divider style={styles.divider} />
              {breakdownItems.map(([key, data]) => (
                <View key={key} style={styles.detailedBreakdownItem}>
                  <View style={styles.breakdownItemHeader}>
                    <View style={[styles.breakdownColor, { backgroundColor: data.color }]} />
                    <Text style={styles.breakdownItemTitle}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Text>
                  </View>
                  <View style={styles.breakdownItemStats}>
                    <Text style={styles.breakdownItemAmount}>
                      {formatCurrency(data.amount)}
                    </Text>
                    <Text style={styles.breakdownItemSessions}>
                      {data.sessions} sessions
                    </Text>
                    <Text style={styles.breakdownItemPercent}>
                      {data.percentage}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={data.percentage / 100}
                    color={data.color}
                    style={styles.breakdownProgress}
                  />
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </Card>
    );
  };

  const renderRecentTransactions = () => {
    return (
      <Card style={styles.transactionsCard} elevation={4}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => handleAction('viewFullReport')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {revenueInfo.recentTransactions.map((transaction) => (
          <TouchableOpacity
            key={transaction.id}
            style={styles.transactionItem}
            onPress={() => handleAction('viewTransaction', transaction)}
            activeOpacity={0.8}
          >
            <View style={styles.transactionLeft}>
              <View style={[
                styles.transactionIcon,
                { backgroundColor: getStatusColor(transaction.status) + '20' }
              ]}>
                <Icon 
                  name={transaction.paymentMethod === 'card' ? 'credit-card' : 
                        transaction.paymentMethod === 'cash' ? 'money' : 'account-balance'} 
                  size={20} 
                  color={getStatusColor(transaction.status)} 
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionClient}>
                  {transaction.clientName}
                </Text>
                <Text style={styles.transactionService}>
                  {transaction.service}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
            </View>

            <View style={styles.transactionRight}>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.status === 'refunded' ? COLORS.error : COLORS.success }
              ]}>
                {transaction.status === 'refunded' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </Text>
              <Chip
                mode="outlined"
                textStyle={{ 
                  color: getStatusColor(transaction.status), 
                  fontSize: 10,
                  textTransform: 'uppercase'
                }}
                style={[
                  styles.statusChip,
                  { borderColor: getStatusColor(transaction.status) }
                ]}
              >
                {transaction.status}
              </Chip>
            </View>
          </TouchableOpacity>
        ))}
      </Card>
    );
  };

  const renderUpcomingPayments = () => {
    return (
      <Card style={styles.upcomingCard} elevation={4}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Upcoming Payments</Text>
          <Text style={styles.upcomingCount}>
            {revenueInfo.upcomingPayments.length} pending
          </Text>
        </View>

        {revenueInfo.upcomingPayments.map((payment) => (
          <TouchableOpacity
            key={payment.id}
            style={styles.upcomingItem}
            onPress={() => handleAction('contactClient', payment)}
            activeOpacity={0.8}
          >
            <View style={styles.upcomingLeft}>
              <Icon name="schedule" size={20} color={COLORS.primary} />
              <View style={styles.upcomingDetails}>
                <Text style={styles.upcomingClient}>
                  {payment.clientName}
                </Text>
                <Text style={styles.upcomingService}>
                  {payment.service}
                </Text>
              </View>
            </View>

            <View style={styles.upcomingRight}>
              <Text style={styles.upcomingAmount}>
                {formatCurrency(payment.amount)}
              </Text>
              <Text style={styles.upcomingDate}>
                Due {formatDate(payment.dueDate)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Revenue Tracking</Text>
        <Text style={styles.sectionSubtitle}>
          Monitor your financial performance 💰
        </Text>
      </View>

      {/* Period Selector */}
      {renderPeriodSelector()}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
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
        {/* Main Revenue Card */}
        {renderMainRevenueCard()}

        {/* Revenue Breakdown */}
        {renderRevenueBreakdown()}

        {/* Recent Transactions */}
        {renderRecentTransactions()}

        {/* Upcoming Payments */}
        {renderUpcomingPayments()}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAction('exportData')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#11998e', '#38ef7d']}
              style={styles.actionGradient}
            >
              <Icon name="file-download" size={20} color="white" />
              <Text style={styles.actionText}>Export</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAction('manageGoals')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#f39c12', '#e67e22']}
              style={styles.actionGradient}
            >
              <Icon name="track-changes" size={20} color="white" />
              <Text style={styles.actionText}>Goals</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Revenue Breakdown Modal */}
      <Portal>
        <Modal
          visible={showRevenueBreakdown}
          onDismiss={() => setShowRevenueBreakdown(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalSurface}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Revenue Analytics</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowRevenueBreakdown(false)}
              />
            </View>
            <Text style={styles.modalText}>
              Detailed revenue analytics with charts, trends, and insights would be displayed here.
            </Text>
            <Button
              mode="contained"
              style={styles.modalButton}
              onPress={() => setShowRevenueBreakdown(false)}
            >
              Close
            </Button>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    opacity: 0.8,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 4,
    marginBottom: SPACING.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 20,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  mainRevenueCard: {
    marginBottom: SPACING.lg,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  revenueGradient: {
    padding: SPACING.lg,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  revenueTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
  },
  revenueAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  revenueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  growthText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.9,
  },
  sessionsText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.9,
  },
  avgPerSession: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avgLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  avgAmount: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  goalSection: {
    marginTop: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  goalPercent: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  goalProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 8,
  },
  goalRemaining: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  breakdownCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownPreview: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  breakdownColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  breakdownLabel: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  breakdownAmount: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  expandedBreakdown: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  divider: {
    marginBottom: SPACING.md,
  },
  detailedBreakdownItem: {
    marginBottom: SPACING.lg,
  },
  breakdownItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  breakdownItemTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  breakdownItemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  breakdownItemAmount: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownItemSessions: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  breakdownItemPercent: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownProgress: {
    height: 4,
    borderRadius: 2,
  },
  transactionsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionClient: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionService: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  transactionDate: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusChip: {
    height: 24,
  },
  upcomingCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  upcomingCount: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upcomingDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  upcomingClient: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  upcomingService: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  upcomingRight: {
    alignItems: 'flex-end',
  },
  upcomingAmount: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  upcomingDate: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: SPACING.lg,
  },
  modalSurface: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  modalText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
});

export default RevenueTracking;