import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  ProgressBar,
  Switch,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  gold: '#FFD700',
  premium: '#9C27B0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const SubscriptionPlan = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [showYearlyPricing, setShowYearlyPricing] = useState(false);

  // Redux state
  const user = useSelector(state => state.user);
  const subscription = useSelector(state => state.subscription || {});

  // Mock current subscription data
  const currentSubscription = {
    plan: 'premium',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    autoRenew: true,
    nextBilling: '2024-02-01',
    price: 19.99,
    billingCycle: 'monthly',
    daysRemaining: 342,
    featuresUsed: {
      sessionsBooked: 25,
      videoAnalysis: 8,
      aiRecommendations: 45,
      coachConnections: 12,
    },
  };

  // Subscription plans
  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      tagline: 'Get Started',
      price: { monthly: 0, yearly: 0 },
      color: COLORS.textSecondary,
      gradient: ['#9E9E9E', '#757575'],
      features: [
        { name: '3 Coach Connections', included: true, limit: '3' },
        { name: 'Basic Training Plans', included: true },
        { name: 'Progress Tracking', included: true },
        { name: 'Community Access', included: true },
        { name: 'Video Analysis', included: false },
        { name: 'AI Recommendations', included: false },
        { name: 'Unlimited Sessions', included: false },
        { name: 'Priority Support', included: false },
      ],
      popular: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      tagline: 'Most Popular',
      price: { monthly: 19.99, yearly: 199.99 },
      color: COLORS.primary,
      gradient: ['#667eea', '#764ba2'],
      features: [
        { name: 'Unlimited Coach Connections', included: true },
        { name: 'Advanced Training Plans', included: true },
        { name: 'Progress Tracking', included: true },
        { name: 'Community Access', included: true },
        { name: 'Video Analysis', included: true, limit: '20/month' },
        { name: 'AI Recommendations', included: true },
        { name: 'Unlimited Sessions', included: true },
        { name: 'Priority Support', included: true },
      ],
      popular: true,
      savings: 'Save $40/year',
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'Elite Athletes',
      price: { monthly: 39.99, yearly: 399.99 },
      color: COLORS.gold,
      gradient: ['#FFD700', '#FFA000'],
      features: [
        { name: 'Everything in Premium', included: true },
        { name: 'Unlimited Video Analysis', included: true },
        { name: 'Personal AI Coach', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Custom Nutrition Plans', included: true },
        { name: '1-on-1 Expert Sessions', included: true, limit: '2/month' },
        { name: 'White-glove Support', included: true },
        { name: 'Early Feature Access', included: true },
      ],
      popular: false,
      savings: 'Save $80/year',
    },
  ];

  // Usage statistics for current plan
  const usageStats = [
    {
      title: 'Sessions Booked',
      current: currentSubscription.featuresUsed.sessionsBooked,
      limit: currentSubscription.plan === 'free' ? 10 : null,
      icon: 'event',
      color: COLORS.primary,
    },
    {
      title: 'Video Analysis',
      current: currentSubscription.featuresUsed.videoAnalysis,
      limit: currentSubscription.plan === 'premium' ? 20 : null,
      icon: 'videocam',
      color: COLORS.secondary,
    },
    {
      title: 'AI Recommendations',
      current: currentSubscription.featuresUsed.aiRecommendations,
      limit: null,
      icon: 'psychology',
      color: COLORS.success,
    },
    {
      title: 'Coach Connections',
      current: currentSubscription.featuresUsed.coachConnections,
      limit: currentSubscription.plan === 'free' ? 3 : null,
      icon: 'people',
      color: COLORS.warning,
    },
  ];

  // Animation
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Focus effect
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      // Simulate loading
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, [])
  );

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handlePlanSelect = useCallback((planId) => {
    setSelectedPlan(planId);
    Vibration.vibrate(30);
  }, []);

  const handleSubscribe = useCallback((plan) => {
    Alert.alert(
      'Upgrade Subscription 🚀',
      `Would you like to subscribe to ${plan.name} for $${showYearlyPricing ? plan.price.yearly : plan.price.monthly}${showYearlyPricing ? '/year' : '/month'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            Alert.alert(
              'Feature Coming Soon! 💳',
              'Payment processing is currently under development. Stay tuned for updates!',
              [{ text: 'Got it!' }]
            );
            Vibration.vibrate(100);
          },
        },
      ]
    );
  }, [showYearlyPricing]);

  const handleCancelSubscription = useCallback(() => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You\'ll lose access to premium features at the end of your billing cycle.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Feature Coming Soon! ⚙️',
              'Subscription management is currently under development. Please contact support for assistance.',
              [{ text: 'Got it!' }]
            );
          },
        },
      ]
    );
  }, []);

  const handleManageBilling = useCallback(() => {
    Alert.alert(
      'Feature Coming Soon! 💳',
      'Billing management is currently under development. Stay tuned for updates!',
      [{ text: 'Got it!' }]
    );
  }, []);

  const renderCurrentPlan = () => {
    const plan = subscriptionPlans.find(p => p.id === currentSubscription.plan);
    if (!plan) return null;

    return (
      <Animated.View
        style={[
          styles.currentPlanContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient colors={plan.gradient} style={styles.currentPlanCard}>
          <View style={styles.currentPlanHeader}>
            <View>
              <Text style={styles.currentPlanTitle}>Current Plan</Text>
              <Text style={styles.currentPlanName}>{plan.name}</Text>
            </View>
            <View style={styles.currentPlanBadge}>
              <Icon name="star" size={20} color={COLORS.white} />
            </View>
          </View>

          <View style={styles.currentPlanDetails}>
            <View style={styles.planDetailItem}>
              <Text style={styles.planDetailLabel}>Next Billing</Text>
              <Text style={styles.planDetailValue}>{currentSubscription.nextBilling}</Text>
            </View>
            <View style={styles.planDetailItem}>
              <Text style={styles.planDetailLabel}>Amount</Text>
              <Text style={styles.planDetailValue}>${currentSubscription.price}/month</Text>
            </View>
            <View style={styles.planDetailItem}>
              <Text style={styles.planDetailLabel}>Days Remaining</Text>
              <Text style={styles.planDetailValue}>{currentSubscription.daysRemaining} days</Text>
            </View>
          </View>

          <View style={styles.autoRenewContainer}>
            <Text style={styles.autoRenewLabel}>Auto-Renew</Text>
            <Switch
              value={currentSubscription.autoRenew}
              onValueChange={() => Alert.alert('Feature Coming Soon!', 'Auto-renew settings are under development.')}
              color={COLORS.white}
            />
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderUsageStats = () => (
    <Animated.View
      style={[
        styles.usageContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>Usage This Month 📊</Text>
      
      <View style={styles.usageGrid}>
        {usageStats.map((stat, index) => (
          <Surface key={index} style={[styles.usageCard, { borderLeftColor: stat.color }]}>
            <View style={styles.usageHeader}>
              <Icon name={stat.icon} size={24} color={stat.color} />
              <Text style={styles.usageTitle}>{stat.title}</Text>
            </View>
            
            <View style={styles.usageStats}>
              <Text style={styles.usageCurrent}>{stat.current}</Text>
              {stat.limit && (
                <Text style={styles.usageLimit}>/ {stat.limit}</Text>
              )}
            </View>
            
            {stat.limit && (
              <ProgressBar
                progress={stat.current / stat.limit}
                color={stat.color}
                style={styles.usageProgress}
              />
            )}
          </Surface>
        ))}
      </View>
    </Animated.View>
  );

  const renderPlanCard = (plan, index) => (
    <Animated.View
      key={plan.id}
      style={[
        styles.planCardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => handlePlanSelect(plan.id)}
        activeOpacity={0.9}
      >
        <Card
          style={[
            styles.planCard,
            selectedPlan === plan.id && styles.selectedPlanCard,
            plan.popular && styles.popularPlanCard,
          ]}
          elevation={plan.popular ? 8 : 3}
        >
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
            </View>
          )}

          <LinearGradient
            colors={plan.gradient}
            style={styles.planHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planTagline}>{plan.tagline}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.currency}>$</Text>
              <Text style={styles.price}>
                {showYearlyPricing ? plan.price.yearly : plan.price.monthly}
              </Text>
              <Text style={styles.period}>
                {plan.price.monthly === 0 ? '' : showYearlyPricing ? '/year' : '/month'}
              </Text>
            </View>
            
            {plan.savings && showYearlyPricing && (
              <Chip
                mode="outlined"
                style={styles.savingsChip}
                textStyle={styles.savingsChipText}
              >
                {plan.savings}
              </Chip>
            )}
          </LinearGradient>

          <View style={styles.planFeatures}>
            {plan.features.map((feature, featureIndex) => (
              <View key={featureIndex} style={styles.featureRow}>
                <Icon
                  name={feature.included ? 'check-circle' : 'cancel'}
                  size={16}
                  color={feature.included ? COLORS.success : COLORS.error}
                />
                <Text
                  style={[
                    styles.featureText,
                    !feature.included && styles.disabledFeatureText,
                  ]}
                >
                  {feature.name}
                  {feature.limit && ` (${feature.limit})`}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.planActions}>
            {currentSubscription.plan === plan.id ? (
              <Button
                mode="outlined"
                icon="check"
                style={styles.currentPlanButton}
                textColor={plan.color}
              >
                Current Plan
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => handleSubscribe(plan)}
                style={[styles.subscribeButton, { backgroundColor: plan.color }]}
                contentStyle={styles.subscribeButtonContent}
              >
                {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
              </Button>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderBillingToggle = () => (
    <View style={styles.billingToggleContainer}>
      <Text style={styles.billingToggleLabel}>Billing Cycle</Text>
      <View style={styles.billingToggle}>
        <TouchableOpacity
          style={[
            styles.billingOption,
            !showYearlyPricing && styles.activeBillingOption,
          ]}
          onPress={() => {
            setShowYearlyPricing(false);
            Vibration.vibrate(30);
          }}
        >
          <Text
            style={[
              styles.billingOptionText,
              !showYearlyPricing && styles.activeBillingOptionText,
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.billingOption,
            showYearlyPricing && styles.activeBillingOption,
          ]}
          onPress={() => {
            setShowYearlyPricing(true);
            Vibration.vibrate(30);
          }}
        >
          <Text
            style={[
              styles.billingOptionText,
              showYearlyPricing && styles.activeBillingOptionText,
            ]}
          >
            Yearly
          </Text>
          <Chip
            mode="flat"
            style={styles.saveBadge}
            textStyle={styles.saveBadgeText}
          >
            Save 20%
          </Chip>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderManagementActions = () => (
    <View style={styles.managementContainer}>
      <Text style={styles.sectionTitle}>Manage Subscription ⚙️</Text>
      
      <Surface style={styles.managementCard}>
        <TouchableOpacity
          style={styles.managementAction}
          onPress={handleManageBilling}
        >
          <Icon name="credit-card" size={24} color={COLORS.primary} />
          <View style={styles.managementActionContent}>
            <Text style={styles.managementActionTitle}>Billing & Payment</Text>
            <Text style={styles.managementActionSubtitle}>Update payment method and billing info</Text>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <Divider />

        <TouchableOpacity
          style={styles.managementAction}
          onPress={() => Alert.alert('Feature Coming Soon!', 'Invoice history is under development.')}
        >
          <Icon name="receipt" size={24} color={COLORS.primary} />
          <View style={styles.managementActionContent}>
            <Text style={styles.managementActionTitle}>Invoice History</Text>
            <Text style={styles.managementActionSubtitle}>View past payments and invoices</Text>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <Divider />

        <TouchableOpacity
          style={styles.managementAction}
          onPress={handleCancelSubscription}
        >
          <Icon name="cancel" size={24} color={COLORS.error} />
          <View style={styles.managementActionContent}>
            <Text style={[styles.managementActionTitle, { color: COLORS.error }]}>Cancel Subscription</Text>
            <Text style={styles.managementActionSubtitle}>Cancel your current subscription</Text>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </Surface>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ProgressBar indeterminate color={COLORS.white} />
          <Text style={styles.loadingText}>Loading your subscription...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Subscription Plans 💎</Text>
          <Text style={styles.headerSubtitle}>
            Choose the perfect plan for your athletic journey
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
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
        {/* Current Plan */}
        {renderCurrentPlan()}

        {/* Usage Stats */}
        {renderUsageStats()}

        {/* Billing Toggle */}
        {renderBillingToggle()}

        {/* Plans */}
        <View style={styles.plansContainer}>
          <Text style={styles.sectionTitle}>Available Plans 🎯</Text>
          {subscriptionPlans.map((plan, index) => renderPlanCard(plan, index))}
        </View>

        {/* Management Actions */}
        {renderManagementActions()}

        {/* FAQ Section */}
        <View style={styles.faqContainer}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions ❓</Text>
          <Surface style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Can I change my plan anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </Text>
            
            <Text style={styles.faqQuestion}>What happens if I cancel?</Text>
            <Text style={styles.faqAnswer}>
              You'll continue to have access to premium features until the end of your current billing cycle.
            </Text>
            
            <Text style={styles.faqQuestion}>Is there a free trial?</Text>
            <Text style={styles.faqAnswer}>
              New users get a 14-day free trial of our Premium plan. No credit card required!
            </Text>
          </Surface>
        </View>
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="support"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon!', 'Support chat is under development.')}
        label="Support"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    fontSize: 28,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  currentPlanContainer: {
    padding: SPACING.md,
  },
  currentPlanCard: {
    borderRadius: 16,
    padding: SPACING.lg,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  currentPlanTitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentPlanName: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    fontSize: 32,
    marginTop: SPACING.xs,
  },
  currentPlanBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: SPACING.sm,
  },
  currentPlanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  planDetailItem: {
    alignItems: 'center',
  },
  planDetailLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.xs,
  },
  planDetailValue: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    fontWeight: '600',
  },
  autoRenewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  autoRenewLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    fontWeight: '500',
  },
  usageContainer: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  usageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  usageCard: {
    width: '48%',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    elevation: 2,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  usageTitle: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    fontWeight: '600',
    flex: 1,
  },
  usageStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  usageCurrent: {
    ...TEXT_STYLES.h2,
    fontSize: 24,
  },
  usageLimit: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  usageProgress: {
    height: 4,
    borderRadius: 2,
  },
  billingToggleContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  billingToggleLabel: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    borderRadius: 25,
    padding: SPACING.xs,
  },
  billingOption: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 100,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeBillingOption: {
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  billingOptionText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeBillingOptionText: {
    color: COLORS.primary,
  },
  saveBadge: {
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.success,
    height: 20,
  },
  saveBadgeText: {
    color: COLORS.white,
    fontSize: 10,
  },
  plansContainer: {
    padding: SPACING.md,
  },
  planCardContainer: {
    marginBottom: SPACING.lg,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  selectedPlanCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  popularPlanCard: {
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    zIndex: 1,
  },
  popularBadgeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  planHeader: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  planName: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  planTagline: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.lg,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  currency: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontSize: 20,
    marginTop: SPACING.xs,
  },
  price: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 48,
  },
  period: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.lg,
  },
  savingsChip: {
    backgroundColor: COLORS.white,
    borderColor: 'transparent',
  },
  savingsChipText: {
    color: COLORS.success,
    fontWeight: 'bold',
    fontSize: 12,
  },
  planFeatures: {
    padding: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  disabledFeatureText: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  planActions: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  currentPlanButton: {
    borderColor: COLORS.border,
  },
  subscribeButton: {
    borderRadius: 25,
  },
  subscribeButtonContent: {
    paddingVertical: SPACING.sm,
  },
  managementContainer: {
    padding: SPACING.md,
  },
  managementCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  managementAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  managementActionContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  managementActionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
  },
  managementActionSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  faqContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  faqCard: {
    borderRadius: 12,
    padding: SPACING.lg,
    elevation: 2,
  },
  faqQuestion: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    color: COLORS.primary,
  },
  faqAnswer: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
  },
});

export default SubscriptionPlan;