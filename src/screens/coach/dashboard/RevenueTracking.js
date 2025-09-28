import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  Dimensions,
} from 'react-native';
import { Card, Avatar, Chip, IconButton, Surface, ProgressBar, Button } from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';


const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.xl * 3) / 2;

const RevenueTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const { revenue, isLoading } = useSelector(state => state.coach);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [animationValues] = useState(() =>
    Array.from({ length: 4 }, () => new Animated.Value(0))
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Mock revenue data - replace with actual Redux data
  const mockRevenueData = {
    currentMonth: {
      total: 3250,
      goal: 4000,
      growth: 12.5,
      sessions: 45,
      avgPerSession: 72.22,
    },
    currentWeek: {
      total: 820,
      sessions: 12,
      avgPerSession: 68.33,
    },
    yearToDate: {
      total: 28750,
      growth: 18.3,
    },
    pendingPayments: [
      {
        id: '1',
        playerName: 'Alex Johnson',
        amount: 150,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        sessionType: 'Monthly Package',
        status: 'overdue',
      },
      {
        id: '2',
        playerName: 'Emma Davis',
        amount: 75,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        sessionType: 'Individual Session',
        status: 'pending',
      },
      {
        id: '3',
        playerName: 'Mike Wilson',
        amount: 200,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        sessionType: 'Group Training',
        status: 'pending',
      },
    ],
    recentTransactions: [
      {
        id: '1',
        playerName: 'Sarah Martinez',
        amount: 120,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'payment',
        method: 'card',
        sessionType: 'Weekly Package',
      },
      {
        id: '2',
        playerName: 'Tom Rodriguez',
        amount: 80,
        date: new Date(Date.now() - 6 * 60 * 60 * 1000),
        type: 'payment',
        method: 'cash',
        sessionType: 'Individual Session',
      },
      {
        id: '3',
        playerName: 'Platform Fee',
        amount: -15,
        date: new Date(Date.now() - 12 * 60 * 60 * 1000),
        type: 'fee',
        method: 'auto',
        sessionType: 'Service Fee',
      },
    ],
  };

  const revenueData = revenue || mockRevenueData;

  useEffect(() => {
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
      ...animationValues.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const formatCurrency = (amount) => {
    return `$${Math.abs(amount).toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = date - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return `${Math.abs(days)}d overdue`;
    return `${days}d left`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue': return COLORS.error;
      case 'pending': return COLORS.warning;
      case 'paid': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
      Alert.alert('💰 Updated!', 'Revenue data refreshed successfully');
    }, 1500);
  }, []);

  const handleViewDetails = (type) => {
    Vibration.vibrate(50);
    Alert.alert(
      '📊 Feature Coming Soon',
      `Detailed ${type} analytics and management will be available soon. Get ready for comprehensive financial insights!`,
      [{ text: 'Sounds great!', style: 'default' }]
    );
  };

  const handlePaymentAction = (payment) => {
    Vibration.vibrate(50);
    Alert.alert(
      '💳 Feature Coming Soon',
      `Payment management for ${payment.playerName} will be available soon. You'll be able to send reminders, update status, and process payments!`,
      [{ text: 'Perfect!', style: 'default' }]
    );
  };

  const renderRevenueCard = (title, amount, subtitle, icon, color, gradient, index, onPress) => {
    const animatedStyle = {
      opacity: animationValues[index],
      transform: [
        {
          scale: animationValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
          }),
        },
      ],
    };

    return (
      <Animated.View style={[animatedStyle, { marginBottom: SPACING.md }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
        >
          <Card
            style={{
              width: CARD_WIDTH,
              height: 110,
              marginHorizontal: SPACING.xs,
              elevation: 6,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={gradient}
              style={{
                flex: 1,
                padding: SPACING.md,
                justifyContent: 'space-between',
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Surface
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    borderRadius: 12,
                    padding: SPACING.xs,
                    elevation: 0,
                  }}
                >
                  <Icon name={icon} size={20} color="white" />
                </Surface>
                <Icon
                  name="trending-up"
                  size={16}
                  color="rgba(255, 255, 255, 0.8)"
                />
              </View>
              <View>
                <Text
                  style={[
                    TEXT_STYLES.h6,
                    { color: 'white', fontWeight: 'bold', marginBottom: 2 }
                  ]}
                >
                  {formatCurrency(amount)}
                </Text>
                <Text
                  style={[
                    TEXT_STYLES.caption,
                    { color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }
                  ]}
                >
                  {title}
                </Text>
                <Text
                  style={[
                    TEXT_STYLES.caption,
                    { color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }
                  ]}
                >
                  {subtitle}
                </Text>
              </View>
            </LinearGradient>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPendingPayment = (payment) => (
    <TouchableOpacity
      key={payment.id}
      activeOpacity={0.8}
      onPress={() => handlePaymentAction(payment)}
    >
      <Card
        style={{
          marginBottom: SPACING.sm,
          borderRadius: 12,
          elevation: 2,
          borderLeftWidth: 4,
          borderLeftColor: getStatusColor(payment.status),
        }}
      >
        <View style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Avatar.Text
                size={40}
                label={payment.playerName.substring(0, 2)}
                style={{ 
                  backgroundColor: getStatusColor(payment.status),
                  marginRight: SPACING.sm 
                }}
                labelStyle={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    TEXT_STYLES.subtitle2,
                    { color: COLORS.text, fontWeight: '600', marginBottom: 2 }
                  ]}
                >
                  {payment.playerName}
                </Text>
                <Text
                  style={[
                    TEXT_STYLES.caption,
                    { color: COLORS.textSecondary }
                  ]}
                >
                  {payment.sessionType} • {formatDate(payment.dueDate)}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={[
                  TEXT_STYLES.subtitle1,
                  { color: COLORS.text, fontWeight: 'bold' }
                ]}
              >
                {formatCurrency(payment.amount)}
              </Text>
              <Chip
                mode="flat"
                compact
                textStyle={{ 
                  fontSize: 10, 
                  color: getStatusColor(payment.status),
                  fontWeight: '600'
                }}
                style={{
                  backgroundColor: `${getStatusColor(payment.status)}20`,
                  height: 20,
                  marginTop: 4,
                }}
              >
                {payment.status.toUpperCase()}
              </Chip>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderTransaction = (transaction) => (
    <View
      key={transaction.id}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Surface
          style={{
            backgroundColor: transaction.amount > 0 ? COLORS.success : COLORS.error,
            borderRadius: 16,
            padding: SPACING.xs,
            marginRight: SPACING.sm,
            elevation: 1,
          }}
        >
          <Icon
            name={transaction.amount > 0 ? 'arrow-downward' : 'arrow-upward'}
            size={16}
            color="white"
          />
        </Surface>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              TEXT_STYLES.body2,
              { color: COLORS.text, fontWeight: '500' }
            ]}
          >
            {transaction.playerName}
          </Text>
          <Text
            style={[
              TEXT_STYLES.caption,
              { color: COLORS.textSecondary }
            ]}
          >
            {transaction.sessionType} • {transaction.method}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={[
            TEXT_STYLES.subtitle2,
            { 
              color: transaction.amount > 0 ? COLORS.success : COLORS.error,
              fontWeight: 'bold'
            }
          ]}
        >
          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
        </Text>
        <Text
          style={[
            TEXT_STYLES.caption,
            { color: COLORS.textSecondary }
          ]}
        >
          {new Date(transaction.date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingHorizontal: SPACING.md }}>
      {/* Section Header */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: SPACING.md,
          marginTop: SPACING.sm,
        }}
      >
        <Text style={[TEXT_STYLES.h6, { color: COLORS.text, fontWeight: 'bold' }]}>
          Revenue Tracking 💰
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            icon="analytics"
            size={20}
            iconColor={COLORS.primary}
            onPress={() => handleViewDetails('analytics')}
          />
          <IconButton
            icon="download"
            size={20}
            iconColor={COLORS.textSecondary}
            onPress={() => Alert.alert('📥 Feature Coming Soon', 'Export revenue reports will be available soon!')}
          />
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Pull to refresh revenue data..."
            titleColor={COLORS.textSecondary}
          />
        }
        contentContainerStyle={{ paddingBottom: SPACING.xl }}
      >
        {/* Revenue Cards */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginBottom: SPACING.lg,
          }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {renderRevenueCard(
              'This Month',
              revenueData.currentMonth.total,
              `${revenueData.currentMonth.sessions} sessions • +${revenueData.currentMonth.growth}%`,
              'calendar-today',
              COLORS.primary,
              ['#667eea', '#764ba2'],
              0,
              () => handleViewDetails('monthly')
            )}
            {renderRevenueCard(
              'This Week',
              revenueData.currentWeek.total,
              `${revenueData.currentWeek.sessions} sessions`,
              'date-range',
              COLORS.success,
              ['#11998e', '#38ef7d'],
              1,
              () => handleViewDetails('weekly')
            )}
            {renderRevenueCard(
              'Year to Date',
              revenueData.yearToDate.total,
              `+${revenueData.yearToDate.growth}% growth`,
              'trending-up',
              COLORS.warning,
              ['#f7971e', '#ffd200'],
              2,
              () => handleViewDetails('yearly')
            )}
            {renderRevenueCard(
              'Avg/Session',
              revenueData.currentMonth.avgPerSession,
              'Monthly average',
              'attach-money',
              COLORS.info,
              ['#4facfe', '#00f2fe'],
              3,
              () => handleViewDetails('average')
            )}
          </View>
        </Animated.View>

        {/* Monthly Goal Progress */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginBottom: SPACING.lg,
          }}
        >
          <Card style={{ borderRadius: 16, elevation: 4 }}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={{ borderRadius: 16 }}
            >
              <View style={{ padding: SPACING.lg }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
                  <Text style={[TEXT_STYLES.h6, { color: 'white', fontWeight: 'bold' }]}>
                    Monthly Goal 🎯
                  </Text>
                  <Text style={[TEXT_STYLES.subtitle1, { color: 'white' }]}>
                    {Math.round((revenueData.currentMonth.total / revenueData.currentMonth.goal) * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={revenueData.currentMonth.total / revenueData.currentMonth.goal}
                  color="white"
                  style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                    {formatCurrency(revenueData.currentMonth.total)} earned
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                    {formatCurrency(revenueData.currentMonth.goal)} goal
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Card>
        </Animated.View>

        {/* Pending Payments */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginBottom: SPACING.lg,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.h6, { color: COLORS.text, fontWeight: 'bold' }]}>
              Pending Payments 📋
            </Text>
            <Chip
              mode="outlined"
              compact
              textStyle={{ fontSize: 12, color: COLORS.error }}
              style={{ borderColor: COLORS.error, backgroundColor: 'transparent' }}
            >
              {revenueData.pendingPayments.length} Due
            </Chip>
          </View>
          {revenueData.pendingPayments.map(renderPendingPayment)}
        </Animated.View>

        {/* Recent Transactions */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.h6, { color: COLORS.text, fontWeight: 'bold' }]}>
              Recent Transactions 💳
            </Text>
            <TouchableOpacity onPress={() => handleViewDetails('transactions')}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: '600' }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <Card style={{ borderRadius: 16, elevation: 4, overflow: 'hidden' }}>
            {revenueData.recentTransactions.map(renderTransaction)}
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default RevenueTracking;