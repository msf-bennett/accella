import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
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
  Dialog,
  ProgressBar,
  Divider,
  List,
  Switch,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width, height } = Dimensions.get('window');

const Subscription = ({ navigation }) => {
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Redux state
  const dispatch = useDispatch();
  const { user, subscription } = useSelector(state => state.profile);

  // Mock subscription data - replace with actual data from Redux
  const [currentSubscription, setCurrentSubscription] = useState({
    plan: 'Premium',
    status: 'Active',
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    nextBilling: '2024-08-15',
    price: 29.99,
    currency: 'USD',
    features: [
      'Unlimited Training Plans',
      'AI-Powered Recommendations',
      'Video Analysis',
      'Nutrition Tracking',
      'Priority Coach Support',
      'Performance Analytics',
    ],
    daysRemaining: 45,
    progress: 0.75,
  });

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'Forever',
      color: COLORS.textSecondary,
      features: [
        'Basic Training Plans',
        'Limited Workouts (5/month)',
        'Community Access',
        'Progress Tracking',
      ],
      limitations: [
        'No AI Recommendations',
        'No Video Analysis',
        'Basic Support Only',
      ],
      popular: false,
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      period: 'month',
      color: COLORS.success,
      features: [
        'Unlimited Basic Plans',
        'Progress Tracking',
        'Community Access',
        'Email Support',
        'Workout Library',
      ],
      limitations: [
        'No AI Features',
        'No Video Analysis',
      ],
      popular: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 29.99,
      period: 'month',
      color: COLORS.primary,
      features: [
        'Everything in Basic',
        'AI-Powered Recommendations',
        'Video Analysis',
        'Nutrition Tracking',
        'Priority Support',
        'Performance Analytics',
        'Custom Training Plans',
      ],
      limitations: [],
      popular: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 49.99,
      period: 'month',
      color: '#FF6B35',
      features: [
        'Everything in Premium',
        '1-on-1 Coach Sessions',
        'Live Training Classes',
        'Advanced Analytics',
        'API Access',
        'White-label Features',
        'Team Management',
      ],
      limitations: [],
      popular: false,
    },
  ];

  const billingHistory = [
    {
      id: 1,
      date: '2024-07-15',
      amount: 29.99,
      plan: 'Premium',
      status: 'Paid',
      invoice: 'INV-2024-001',
    },
    {
      id: 2,
      date: '2024-06-15',
      amount: 29.99,
      plan: 'Premium',
      status: 'Paid',
      invoice: 'INV-2024-002',
    },
    {
      id: 3,
      date: '2024-05-15',
      amount: 29.99,
      plan: 'Premium',
      status: 'Paid',
      invoice: 'INV-2024-003',
    },
  ];

  // Component lifecycle
  useEffect(() => {
    startEntranceAnimation();
  }, []);

  const startEntranceAnimation = () => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Implement refresh logic
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeDialog(true);
  };

  const confirmUpgrade = () => {
    Alert.alert(
      'Subscription Upgraded! 🎉',
      `You've successfully upgraded to ${selectedPlan.name} plan.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowUpgradeDialog(false);
            setSelectedPlan(null);
          }
        }
      ]
    );
  };

  const handleCancelSubscription = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    Alert.alert(
      'Subscription Cancelled',
      'Your subscription has been cancelled. You can continue using premium features until your current billing period ends.',
      [
        {
          text: 'OK',
          onPress: () => setShowCancelDialog(false)
        }
      ]
    );
  };

  const renderCurrentPlanCard = () => (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        opacity: fadeAnim,
        marginBottom: SPACING.lg,
      }}
    >
      <Card style={{ backgroundColor: 'white', elevation: 6 }}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            padding: SPACING.lg,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
                {currentSubscription.plan} Plan
              </Text>
              <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
                ${currentSubscription.price}/month
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Badge
                style={{
                  backgroundColor: currentSubscription.status === 'Active' ? COLORS.success : COLORS.error,
                  marginBottom: SPACING.xs,
                }}
              >
                {currentSubscription.status}
              </Badge>
              <MaterialIcons name="star" size={32} color="#FFD700" />
            </View>
          </View>

          <View style={{ marginTop: SPACING.md }}>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.xs }]}>
              Days Remaining: {currentSubscription.daysRemaining}
            </Text>
            <ProgressBar
              progress={currentSubscription.progress}
              color="#FFD700"
              style={{ height: 6, borderRadius: 3 }}
            />
          </View>
        </LinearGradient>

        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
            <View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Next Billing</Text>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                {new Date(currentSubscription.nextBilling).toLocaleDateString()}
              </Text>
            </View>
            <View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Auto Renewal</Text>
              <Switch
                value={autoRenewal}
                onValueChange={setAutoRenewal}
                color={COLORS.primary}
              />
            </View>
          </View>

          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
            Included Features ✨
          </Text>
          {currentSubscription.features.map((feature, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
              <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>
                {feature}
              </Text>
            </View>
          ))}
        </Card.Content>

        <Card.Actions>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Manage payment method functionality will be available soon.')}
          >
            Manage Payment
          </Button>
          <Button
            mode="contained"
            onPress={() => handleUpgrade(subscriptionPlans.find(p => p.name === 'Pro'))}
          >
            Upgrade Plan
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderPlanCard = (plan) => (
    <Animated.View
      key={plan.id}
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
        marginBottom: SPACING.md,
      }}
    >
      <Card 
        style={{ 
          backgroundColor: 'white', 
          elevation: plan.popular ? 6 : 3,
          borderWidth: plan.popular ? 2 : 0,
          borderColor: plan.popular ? COLORS.primary : 'transparent',
        }}
      >
        {plan.popular && (
          <View
            style={{
              position: 'absolute',
              top: -10,
              left: 20,
              backgroundColor: COLORS.primary,
              paddingHorizontal: SPACING.sm,
              paddingVertical: SPACING.xs,
              borderRadius: 12,
              zIndex: 1,
            }}
          >
            <Text style={[TEXT_STYLES.caption, { color: 'white', fontWeight: 'bold' }]}>
              MOST POPULAR
            </Text>
          </View>
        )}

        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <View>
              <Text style={[TEXT_STYLES.h2, { color: plan.color }]}>
                {plan.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={[TEXT_STYLES.h1, { color: COLORS.textPrimary }]}>
                  ${plan.price}
                </Text>
                <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginLeft: SPACING.xs }]}>
                  /{plan.period}
                </Text>
              </View>
            </View>
            <Avatar.Icon
              size={50}
              icon={
                plan.name === 'Free' ? 'star-outline' :
                plan.name === 'Basic' ? 'star-half-full' :
                plan.name === 'Premium' ? 'star' : 'stars'
              }
              style={{ backgroundColor: plan.color }}
            />
          </View>

          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.sm }]}>
            Features:
          </Text>
          {plan.features.map((feature, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
              <MaterialIcons name="check" size={16} color={COLORS.success} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>
                {feature}
              </Text>
            </View>
          ))}

          {plan.limitations.length > 0 && (
            <View style={{ marginTop: SPACING.sm }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.sm, color: COLORS.error }]}>
                Limitations:
              </Text>
              {plan.limitations.map((limitation, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <MaterialIcons name="close" size={16} color={COLORS.error} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1, color: COLORS.textSecondary }]}>
                    {limitation}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card.Content>

        <Card.Actions>
          {currentSubscription.plan.toLowerCase() === plan.name.toLowerCase() ? (
            <Button mode="outlined" disabled>
              Current Plan
            </Button>
          ) : (
            <Button
              mode={plan.popular ? "contained" : "outlined"}
              onPress={() => handleUpgrade(plan)}
              style={{
                backgroundColor: plan.popular ? plan.color : 'transparent',
              }}
            >
              {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
            </Button>
          )}
          <Button
            mode="text"
            onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Plan comparison functionality will be available soon.')}
          >
            Compare
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderBillingHistory = () => (
    <Card style={{ backgroundColor: 'white', elevation: 4, marginBottom: SPACING.md }}>
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.textPrimary }]}>
            Billing History 📄
          </Text>
          <Button
            mode="text"
            onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Download all invoices functionality will be available soon.')}
          >
            Download All
          </Button>
        </View>

        {billingHistory.map((bill, index) => (
          <View key={bill.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                  {bill.plan} Plan
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {new Date(bill.date).toLocaleDateString()} • {bill.invoice}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                  ${bill.amount}
                </Text>
                <Chip
                  mode="outlined"
                  compact
                  style={{
                    backgroundColor: bill.status === 'Paid' ? COLORS.success : COLORS.error,
                  }}
                >
                  {bill.status}
                </Chip>
              </View>
            </View>
            {index < billingHistory.length - 1 && <Divider />}
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderUpgradeDialog = () => (
    <Portal>
      <Dialog visible={showUpgradeDialog} onDismiss={() => setShowUpgradeDialog(false)}>
        <Dialog.Title>Upgrade to {selectedPlan?.name}? 🚀</Dialog.Title>
        <Dialog.Content>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
            You're about to upgrade to the {selectedPlan?.name} plan for ${selectedPlan?.price}/{selectedPlan?.period}.
          </Text>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
            Your next billing date will be {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Billing Cycle</Text>
            <View style={{ flexDirection: 'row' }}>
              <Chip
                mode={billingCycle === 'monthly' ? 'flat' : 'outlined'}
                onPress={() => setBillingCycle('monthly')}
                style={{ marginRight: SPACING.xs }}
              >
                Monthly
              </Chip>
              <Chip
                mode={billingCycle === 'yearly' ? 'flat' : 'outlined'}
                onPress={() => setBillingCycle('yearly')}
              >
                Yearly (20% off)
              </Chip>
            </View>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowUpgradeDialog(false)}>Cancel</Button>
          <Button
            mode="contained"
            onPress={confirmUpgrade}
          >
            Confirm Upgrade
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderCancelDialog = () => (
    <Portal>
      <Dialog visible={showCancelDialog} onDismiss={() => setShowCancelDialog(false)}>
        <Dialog.Title>Cancel Subscription? 😢</Dialog.Title>
        <Dialog.Content>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
            We're sorry to see you go! You can continue using premium features until your current billing period ends.
          </Text>
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
            Your subscription will remain active until {new Date(currentSubscription.endDate).toLocaleDateString()}.
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            You can reactivate your subscription anytime before it expires.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowCancelDialog(false)}>Keep Subscription</Button>
          <Button
            mode="contained"
            buttonColor={COLORS.error}
            onPress={confirmCancel}
          >
            Cancel Subscription
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: Platform.OS === 'ios' ? 50 : 30,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <IconButton
            icon="arrow-back"
            size={24}
            iconColor="white"
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, textAlign: 'center' }]}>
            Subscription
          </Text>
          <IconButton
            icon="help-outline"
            size={24}
            iconColor="white"
            onPress={() => Alert.alert('Subscription Help', 'Manage your subscription plan, view billing history, and upgrade or downgrade your membership anytime.')}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md }}
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
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Current Plan */}
          {renderCurrentPlanCard()}

          {/* Available Plans */}
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.textPrimary }]}>
            Available Plans 💎
          </Text>
          {subscriptionPlans.map(plan => renderPlanCard(plan))}

          {/* Billing History */}
          {renderBillingHistory()}

          {/* Subscription Management */}
          <Card style={{ backgroundColor: 'white', elevation: 4, marginBottom: SPACING.md }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.textPrimary }]}>
                Manage Subscription ⚙️
              </Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Button
                  mode="outlined"
                  icon="payment"
                  onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Payment method management will be available soon.')}
                  style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                >
                  Payment Method
                </Button>
                <Button
                  mode="outlined"
                  icon="receipt"
                  onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Invoice downloads will be available soon.')}
                  style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                >
                  Download Invoices
                </Button>
                <Button
                  mode="outlined"
                  icon="cancel"
                  onPress={handleCancelSubscription}
                  style={{ marginBottom: SPACING.sm }}
                  buttonColor="rgba(255, 107, 53, 0.1)"
                  textColor={COLORS.error}
                >
                  Cancel Subscription
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* FAQ */}
          <Card style={{ backgroundColor: 'white', elevation: 2 }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                <MaterialIcons name="help" size={24} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm, color: COLORS.textPrimary }]}>
                  FAQ ❓
                </Text>
              </View>
              
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.xs }]}>
                Can I change my plan anytime?
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.md }]}>
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </Text>
              
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.xs }]}>
                What happens when I cancel?
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.md }]}>
                You'll continue to have access to premium features until your current billing period ends.
              </Text>
              
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginBottom: SPACING.xs }]}>
                Is there a refund policy?
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                We offer a 30-day money-back guarantee for all subscriptions.
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Dialogs */}
      {renderUpgradeDialog()}
      {renderCancelDialog()}

      {/* Floating Action Button */}
      <FAB
        icon="star"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => handleUpgrade(subscriptionPlans.find(p => p.popular))}
        label="Upgrade"
      />
    </View>
  );
};

export default Subscription;