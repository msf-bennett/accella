import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  ProgressBar,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';
//import PlaceholderScreen from '../components/PlaceholderScreen';
//import { Text } from '../components/StyledText';

const { width } = Dimensions.get('window');

const SubscriptionPlans = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { subscription } = useSelector(state => state.subscription);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgrade, setSelectedUpgrade] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));

  // Mock current subscription data
  const currentSubscription = {
    plan: 'Basic',
    type: 'monthly',
    price: 9.99,
    startDate: '2024-01-15',
    nextBilling: '2024-12-15',
    status: 'active',
    daysLeft: 25,
    usage: {
      sessionsBooked: 8,
      sessionsLimit: 10,
      coachesConnected: 3,
      coachesLimit: 5,
      storageUsed: 2.3,
      storageLimit: 5,
    },
  };

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      subtitle: 'Perfect for trying out',
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      color: '#9CA3AF',
      features: [
        { text: '2 sessions per month', included: true },
        { text: '1 coach connection', included: true },
        { text: '1GB storage', included: true },
        { text: 'Basic progress tracking', included: true },
        { text: 'Community support', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Priority booking', included: false },
        { text: 'Video calls', included: false },
      ],
      benefits: ['🎯 Try the platform', '📱 Mobile app access', '💬 Community support'],
    },
    {
      id: 'basic',
      name: 'Basic',
      subtitle: 'Great for regular training',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      popular: false,
      color: COLORS.primary,
      features: [
        { text: '10 sessions per month', included: true },
        { text: '5 coach connections', included: true },
        { text: '5GB storage', included: true },
        { text: 'Advanced progress tracking', included: true },
        { text: 'Priority support', included: true },
        { text: 'Basic video calls (15 min)', included: true },
        { text: 'Custom training plans', included: false },
        { text: 'Unlimited coaches', included: false },
      ],
      benefits: ['⚡ Priority booking', '📊 Detailed analytics', '🎥 Video consultations'],
    },
    {
      id: 'premium',
      name: 'Premium',
      subtitle: 'For serious athletes',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      popular: true,
      color: '#F59E0B',
      features: [
        { text: 'Unlimited sessions', included: true },
        { text: 'Unlimited coach connections', included: true },
        { text: '25GB storage', included: true },
        { text: 'AI-powered recommendations', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'Unlimited video calls', included: true },
        { text: 'Custom training plans', included: true },
        { text: 'Performance analytics', included: true },
      ],
      benefits: ['🚀 Unlimited everything', '🤖 AI coaching assistant', '📈 Advanced analytics'],
    },
    {
      id: 'pro',
      name: 'Pro Coach',
      subtitle: 'For professional coaches',
      monthlyPrice: 39.99,
      yearlyPrice: 399.99,
      popular: false,
      color: '#8B5CF6',
      features: [
        { text: 'Everything in Premium', included: true },
        { text: 'Unlimited athletes', included: true },
        { text: '100GB storage', included: true },
        { text: 'Business dashboard', included: true },
        { text: 'Revenue analytics', included: true },
        { text: 'White-label options', included: true },
        { text: 'API access', included: true },
        { text: 'Custom branding', included: true },
      ],
      benefits: ['💼 Business tools', '📊 Revenue tracking', '🎨 Custom branding'],
    },
  ];

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getPrice = (plan) => {
    return selectedPlan === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getSavings = (plan) => {
    if (selectedPlan === 'yearly' && plan.monthlyPrice > 0) {
      const monthlyCost = plan.monthlyPrice * 12;
      const yearlyCost = plan.yearlyPrice;
      const savings = ((monthlyCost - yearlyCost) / monthlyCost * 100).toFixed(0);
      return savings;
    }
    return 0;
  };

  const handleUpgrade = (plan) => {
    setSelectedUpgrade(plan);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = () => {
    Alert.alert(
      '🎉 Subscription Updated!',
      `Welcome to ${selectedUpgrade?.name}! Your new features are now active. You'll be charged $${getPrice(selectedUpgrade)} ${selectedPlan}.`,
      [
        {
          text: 'Get Started',
          onPress: () => {
            setShowUpgradeModal(false);
            // Navigate to welcome screen or feature tour
          },
        },
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You\'ll lose access to premium features at the end of your billing cycle.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            Alert.alert('🔄 Feature in Development', 'Subscription cancellation will be available soon!');
          },
        },
      ]
    );
  };

  const renderCurrentSubscription = () => (
    <Card style={styles.currentCard} elevation={3}>
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.currentHeader}
      >
        <View style={styles.currentInfo}>
          <Text style={styles.currentTitle}>Current Plan</Text>
          <Text style={styles.currentPlan}>{currentSubscription.plan}</Text>
          <Text style={styles.currentPrice}>
            ${currentSubscription.price}/{currentSubscription.type}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Icon name="verified" size={20} color="#fff" />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </LinearGradient>

      <View style={styles.currentContent}>
        <View style={styles.billingInfo}>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Next billing:</Text>
            <Text style={styles.billingValue}>
              {new Date(currentSubscription.nextBilling).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Days remaining:</Text>
            <Text style={styles.billingValue}>{currentSubscription.daysLeft} days</Text>
          </View>
        </View>

        <Text style={styles.usageTitle}>Usage Overview</Text>
        <View style={styles.usageContainer}>
          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageLabel}>Sessions</Text>
              <Text style={styles.usageValue}>
                {currentSubscription.usage.sessionsBooked}/{currentSubscription.usage.sessionsLimit}
              </Text>
            </View>
            <ProgressBar
              progress={currentSubscription.usage.sessionsBooked / currentSubscription.usage.sessionsLimit}
              color={COLORS.primary}
              style={styles.usageBar}
            />
          </View>

          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageLabel}>Coaches</Text>
              <Text style={styles.usageValue}>
                {currentSubscription.usage.coachesConnected}/{currentSubscription.usage.coachesLimit}
              </Text>
            </View>
            <ProgressBar
              progress={currentSubscription.usage.coachesConnected / currentSubscription.usage.coachesLimit}
              color={COLORS.success}
              style={styles.usageBar}
            />
          </View>

          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageLabel}>Storage</Text>
              <Text style={styles.usageValue}>
                {currentSubscription.usage.storageUsed}GB/{currentSubscription.usage.storageLimit}GB
              </Text>
            </View>
            <ProgressBar
              progress={currentSubscription.usage.storageUsed / currentSubscription.usage.storageLimit}
              color={COLORS.warning}
              style={styles.usageBar}
            />
          </View>
        </View>

        <View style={styles.currentActions}>
          <Button
            mode="outlined"
            onPress={handleCancelSubscription}
            style={styles.actionButton}
            icon="cancel"
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={() => Alert.alert('🔄 Feature in Development', 'Billing management coming soon!')}
            style={styles.actionButton}
            icon="payment"
          >
            Manage Billing
          </Button>
        </View>
      </View>
    </Card>
  );

  const renderPlanCard = (plan) => {
    const isCurrentPlan = plan.name.toLowerCase() === currentSubscription.plan.toLowerCase();
    const price = getPrice(plan);
    const savings = getSavings(plan);

    return (
      <Animated.View
        key={plan.id}
        style={[
          styles.planCard,
          { opacity: animatedValue },
          plan.popular && styles.popularCard,
        ]}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}

        <Card style={[styles.card, isCurrentPlan && styles.currentPlanCard]} elevation={plan.popular ? 8 : 2}>
          <LinearGradient
            colors={plan.popular ? [plan.color, '#FF6B6B'] : [plan.color, plan.color + '80']}
            style={styles.cardHeader}
          >
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                ${price}
                {price > 0 && <Text style={styles.pricePeriod}>/{selectedPlan === 'yearly' ? 'year' : 'month'}</Text>}
              </Text>
              {savings > 0 && (
                <Chip style={styles.savingsChip} textStyle={styles.savingsText}>
                  Save {savings}%
                </Chip>
              )}
            </View>
          </LinearGradient>

          <View style={styles.cardContent}>
            <View style={styles.benefitsContainer}>
              {plan.benefits.map((benefit, index) => (
                <Text key={index} style={styles.benefit}>
                  {benefit}
                </Text>
              ))}
            </View>

            <Divider style={styles.divider} />

            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Icon
                    name={feature.included ? 'check-circle' : 'cancel'}
                    size={16}
                    color={feature.included ? COLORS.success : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      !feature.included && styles.featureTextDisabled,
                    ]}
                  >
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>

            <Button
              mode={isCurrentPlan ? 'outlined' : 'contained'}
              onPress={() => isCurrentPlan ? null : handleUpgrade(plan)}
              style={[styles.planButton, isCurrentPlan && styles.currentPlanButton]}
              disabled={isCurrentPlan}
              icon={isCurrentPlan ? 'check' : 'arrow-upward'}
            >
              {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </Button>
          </View>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Subscription Plans</Text>
        <Text style={styles.headerSubtitle}>
          Choose the perfect plan for your training journey
        </Text>
      </LinearGradient>

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
        {/* Current Subscription */}
        {user && renderCurrentSubscription()}

        {/* Plan Toggle */}
        <Surface style={styles.toggleContainer} elevation={1}>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedPlan === 'monthly' && styles.activeToggle,
              ]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedPlan === 'monthly' && styles.activeToggleText,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedPlan === 'yearly' && styles.activeToggle,
              ]}
              onPress={() => setSelectedPlan('yearly')}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedPlan === 'yearly' && styles.activeToggleText,
                ]}
              >
                Yearly
              </Text>
              <Chip style={styles.saveChip} textStyle={styles.saveText}>
                Save up to 20%
              </Chip>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Plans Grid */}
        <View style={styles.plansContainer}>
          {subscriptionPlans.map((plan) => renderPlanCard(plan))}
        </View>

        {/* FAQ Section */}
        <Card style={styles.faqCard} elevation={2}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => Alert.alert('🔄 Feature in Development', 'FAQ expansion coming soon!')}
          >
            <Text style={styles.faqQuestion}>Can I change plans anytime?</Text>
            <Icon name="expand-more" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => Alert.alert('🔄 Feature in Development', 'FAQ expansion coming soon!')}
          >
            <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
            <Icon name="expand-more" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => Alert.alert('🔄 Feature in Development', 'FAQ expansion coming soon!')}
          >
            <Text style={styles.faqQuestion}>Is there a free trial available?</Text>
            <Icon name="expand-more" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Support Section */}
        <Card style={styles.supportCard} elevation={2}>
          <View style={styles.supportContent}>
            <Icon name="support-agent" size={40} color={COLORS.primary} />
            <View style={styles.supportText}>
              <Text style={styles.supportTitle}>Need Help Choosing?</Text>
              <Text style={styles.supportDescription}>
                Our team is here to help you find the perfect plan
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => Alert.alert('🔄 Feature in Development', 'Live chat support coming soon!')}
              style={styles.supportButton}
              icon="chat"
              compact
            >
              Chat Now
            </Button>
          </View>
        </Card>
      </ScrollView>

      {/* Upgrade Confirmation Modal */}
      <Portal>
        <Modal
          visible={showUpgradeModal}
          onDismiss={() => setShowUpgradeModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedUpgrade && (
            <Card style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirm Upgrade</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowUpgradeModal(false)}
                />
              </View>

              <View style={styles.modalContent}>
                <LinearGradient
                  colors={[selectedUpgrade.color, selectedUpgrade.color + '80']}
                  style={styles.modalPlanHeader}
                >
                  <Text style={styles.modalPlanName}>{selectedUpgrade.name}</Text>
                  <Text style={styles.modalPlanPrice}>
                    ${getPrice(selectedUpgrade)}/{selectedPlan}
                  </Text>
                </LinearGradient>

                <View style={styles.modalFeatures}>
                  <Text style={styles.modalFeaturesTitle}>What you'll get:</Text>
                  {selectedUpgrade.benefits.map((benefit, index) => (
                    <Text key={index} style={styles.modalBenefit}>
                      {benefit}
                    </Text>
                  ))}
                </View>

                <View style={styles.modalBilling}>
                  <View style={styles.modalBillingRow}>
                    <Text style={styles.modalBillingLabel}>Plan:</Text>
                    <Text style={styles.modalBillingValue}>{selectedUpgrade.name}</Text>
                  </View>
                  <View style={styles.modalBillingRow}>
                    <Text style={styles.modalBillingLabel}>Billing:</Text>
                    <Text style={styles.modalBillingValue}>
                      {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.modalBillingRow}>
                    <Text style={styles.modalBillingLabel}>Total:</Text>
                    <Text style={styles.modalBillingTotal}>
                      ${getPrice(selectedUpgrade)}/{selectedPlan}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowUpgradeModal(false)}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={confirmUpgrade}
                    style={styles.modalButton}
                    icon="credit-card"
                  >
                    Subscribe Now
                  </Button>
                </View>
              </View>
            </Card>
          )}
        </Modal>
      </Portal>
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  currentCard: {
    marginVertical: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  currentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
  },
  currentInfo: {
    flex: 1,
  },
  currentTitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.xs,
  },
  currentPlan: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  currentPrice: {
    ...TEXT_STYLES.h4,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  currentContent: {
    padding: SPACING.lg,
  },
  billingInfo: {
    marginBottom: SPACING.lg,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  billingLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  billingValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  usageTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  usageContainer: {
    marginBottom: SPACING.lg,
  },
  usageItem: {
    marginBottom: SPACING.md,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  usageLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  usageValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  usageBar: {
    height: 6,
    borderRadius: 3,
  },
  currentActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  toggleContainer: {
    marginVertical: SPACING.lg,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleButtons: {
    flexDirection: 'row',
    padding: SPACING.xs,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#fff',
  },
  saveChip: {
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.warning,
  },
  saveText: {
    fontSize: 10,
    color: '#fff',
  },
  plansContainer: {
    marginBottom: SPACING.xl,
  },
  planCard: {
    marginBottom: SPACING.lg,
  },
  popularCard: {
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'center',
  },
  popularText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cardHeader: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  planName: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  planSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    fontWeight: '700',
  },
  pricePeriod: {
    ...TEXT_STYLES.body,
    fontSize: 16,
  },
  savingsChip: {
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  savingsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: SPACING.lg,
  },
  benefitsContainer: {
    marginBottom: SPACING.md,
  },
  benefit: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  divider: {
    marginVertical: SPACING.md,
  },
  featuresContainer: {
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  featureTextDisabled: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  planButton: {
    borderRadius: 8,
  },
  currentPlanButton: {
    borderColor: COLORS.success,
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  faqTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
  },
  faqQuestion: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  supportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportText: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  supportTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  supportDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  supportButton: {
    paddingHorizontal: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: 0,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalPlanHeader: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  modalPlanName: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  modalPlanPrice: {
    ...TEXT_STYLES.h3,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  modalFeatures: {
    marginBottom: SPACING.lg,
  },
  modalFeaturesTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  modalBenefit: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  modalBilling: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  modalBillingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  modalBillingLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  modalBillingValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  modalBillingTotal: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default SubscriptionPlans;