import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Dimensions,
  StatusBar,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Surface,
  IconButton,
  Searchbar,
  FAB,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design System Imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 22, fontWeight: '600' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const EarningsReports = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, earnings } = useSelector((state) => state.coach);
  
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  // Sample earnings data (replace with Redux state)
  const [earningsData, setEarningsData] = useState({
    totalRevenue: 15750,
    monthlyGrowth: 12.5,
    activeClients: 28,
    averageSessionRate: 75,
    totalSessions: 210,
    pendingPayments: 850,
    recentTransactions: [
      {
        id: '1',
        client: 'Sarah Johnson',
        amount: 150,
        type: 'Session Payment',
        date: '2025-08-15',
        status: 'completed'
      },
      {
        id: '2',
        client: 'Mike Chen',
        amount: 300,
        type: 'Training Package',
        date: '2025-08-14',
        status: 'completed'
      },
      {
        id: '3',
        client: 'Emma Wilson',
        amount: 75,
        type: 'Session Payment',
        date: '2025-08-13',
        status: 'pending'
      },
    ],
    monthlyBreakdown: [
      { month: 'Jan', revenue: 12500 },
      { month: 'Feb', revenue: 13200 },
      { month: 'Mar', revenue: 14100 },
      { month: 'Apr', revenue: 13800 },
      { month: 'May', revenue: 15200 },
      { month: 'Jun', revenue: 14900 },
      { month: 'Jul', revenue: 15750 },
    ]
  });

  // Animation setup
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Dispatch action to refresh earnings data
      // dispatch(fetchEarningsData());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh earnings data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleExportReport = () => {
    Alert.alert(
      '📊 Export Report',
      'Feature coming soon! Export functionality will allow you to generate PDF reports and CSV files of your earnings data.',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const handleViewDetails = (transactionId) => {
    Alert.alert(
      '💳 Transaction Details',
      'Feature coming soon! View detailed transaction information and manage payments.',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const renderKPICard = (title, value, subtitle, icon, color = COLORS.primary) => (
    <Animated.View
      style={[
        styles.kpiCard,
        {
          opacity: animatedValue,
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        },
      ]}
    >
      <Surface style={styles.kpiSurface} elevation={2}>
        <View style={styles.kpiHeader}>
          <Icon name={icon} size={24} color={color} />
          <Text style={[TEXT_STYLES.caption, styles.kpiTitle]}>{title}</Text>
        </View>
        <Text style={[TEXT_STYLES.h2, { color }]}>{value}</Text>
        <Text style={TEXT_STYLES.caption}>{subtitle}</Text>
      </Surface>
    </Animated.View>
  );

  const renderTransactionItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleViewDetails(item.id)}
      style={styles.transactionItem}
    >
      <View style={styles.transactionLeft}>
        <Icon 
          name={item.status === 'completed' ? 'check-circle' : 'access-time'} 
          size={20} 
          color={item.status === 'completed' ? COLORS.success : COLORS.warning} 
        />
        <View style={styles.transactionDetails}>
          <Text style={TEXT_STYLES.body}>{item.client}</Text>
          <Text style={TEXT_STYLES.caption}>{item.type} • {item.date}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
          ${item.amount}
        </Text>
        <Chip 
          mode="outlined" 
          compact
          textStyle={{ fontSize: 10 }}
          style={{
            backgroundColor: item.status === 'completed' ? COLORS.success + '20' : COLORS.warning + '20'
          }}
        >
          {item.status}
        </Chip>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>💰 Earnings Reports</Text>
          <Text style={styles.headerSubtitle}>Track your coaching revenue</Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon="filter-list"
            iconColor="white"
            size={24}
            onPress={() => setFilterModalVisible(true)}
          />
          <IconButton
            icon="file-download"
            iconColor="white"
            size={24}
            onPress={handleExportReport}
          />
        </View>
      </LinearGradient>

      {/* Period Selection */}
      <View style={styles.periodContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <Chip
              key={period}
              mode={selectedPeriod === period ? 'flat' : 'outlined'}
              selected={selectedPeriod === period}
              onPress={() => setSelectedPeriod(period)}
              style={styles.periodChip}
              selectedColor={COLORS.primary}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Chip>
          ))}
        </ScrollView>
      </View>

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
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          {renderKPICard(
            'Total Revenue',
            `$${earningsData.totalRevenue.toLocaleString()}`,
            `+${earningsData.monthlyGrowth}% this month`,
            'trending-up',
            COLORS.success
          )}
          {renderKPICard(
            'Active Clients',
            earningsData.activeClients,
            'Monthly subscribers',
            'group',
            COLORS.primary
          )}
          {renderKPICard(
            'Avg Session Rate',
            `$${earningsData.averageSessionRate}`,
            'Per hour rate',
            'attach-money',
            COLORS.secondary
          )}
          {renderKPICard(
            'Pending Payments',
            `$${earningsData.pendingPayments}`,
            'Awaiting collection',
            'schedule',
            COLORS.warning
          )}
        </View>

        {/* Revenue Chart Placeholder */}
        <Card style={styles.chartCard}>
          <Card.Title 
            title="📈 Revenue Trend" 
            subtitle="Monthly breakdown"
            titleStyle={TEXT_STYLES.h3}
            right={(props) => (
              <IconButton {...props} icon="dots-vertical" onPress={handleExportReport} />
            )}
          />
          <Card.Content>
            <View style={styles.chartPlaceholder}>
              <Icon name="show-chart" size={48} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                Interactive revenue charts coming soon! 📊
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Progress Indicators */}
        <Card style={styles.progressCard}>
          <Card.Title 
            title="🎯 Monthly Goals" 
            subtitle="Track your progress"
            titleStyle={TEXT_STYLES.h3}
          />
          <Card.Content>
            <View style={styles.progressItem}>
              <Text style={TEXT_STYLES.body}>Revenue Target: $18,000</Text>
              <ProgressBar 
                progress={earningsData.totalRevenue / 18000} 
                color={COLORS.primary}
                style={styles.progressBar}
              />
              <Text style={TEXT_STYLES.caption}>
                ${earningsData.totalRevenue} / $18,000 (87.5%)
              </Text>
            </View>
            
            <View style={styles.progressItem}>
              <Text style={TEXT_STYLES.body}>Sessions Target: 250</Text>
              <ProgressBar 
                progress={earningsData.totalSessions / 250} 
                color={COLORS.success}
                style={styles.progressBar}
              />
              <Text style={TEXT_STYLES.caption}>
                {earningsData.totalSessions} / 250 (84%)
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Transactions */}
        <Card style={styles.transactionsCard}>
          <Card.Title 
            title="💳 Recent Transactions" 
            subtitle="Latest payments"
            titleStyle={TEXT_STYLES.h3}
            right={(props) => (
              <Button 
                mode="outlined" 
                compact 
                onPress={() => navigation.navigate('PaymentHistory')}
              >
                View All
              </Button>
            )}
          />
          <Card.Content>
            {earningsData.recentTransactions.map((transaction, index) => (
              <View key={transaction.id}>
                {renderTransactionItem({ item: transaction, index })}
                {index < earningsData.recentTransactions.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Title 
            title="⚡ Quick Actions" 
            titleStyle={TEXT_STYLES.h3}
          />
          <Card.Content>
            <View style={styles.actionGrid}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('InvoiceGenerator')}
              >
                <Icon name="receipt" size={24} color={COLORS.primary} />
                <Text style={styles.actionText}>Generate Invoice</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('PaymentRequests')}
              >
                <Icon name="payment" size={24} color={COLORS.success} />
                <Text style={styles.actionText}>Request Payment</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('TaxReports')}
              >
                <Icon name="description" size={24} color={COLORS.secondary} />
                <Text style={styles.actionText}>Tax Reports</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleExportReport}
              >
                <Icon name="cloud-download" size={24} color={COLORS.warning} />
                <Text style={styles.actionText}>Export Data</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  periodContainer: {
    paddingVertical: SPACING.md,
    paddingLeft: SPACING.md,
    backgroundColor: 'white',
    elevation: 1,
  },
  periodChip: {
    marginRight: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  kpiCard: {
    width: (width - SPACING.md * 3) / 2,
    marginBottom: SPACING.md,
  },
  kpiSurface: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  kpiTitle: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  chartCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  progressCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  progressItem: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: SPACING.sm,
  },
  transactionsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.background,
    marginVertical: SPACING.sm,
  },
  actionsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - SPACING.md * 5) / 2,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default EarningsReports;