import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';

const { width } = Dimensions.get('window');

const BillingSettings = ({ navigation, route }) => {
  const [activeSubscriptions, setActiveSubscriptions] = useState([
    {
      id: 'sub_001',
      childName: 'Emma Johnson',
      academy: 'Elite Sports Academy',
      plan: 'Premium Training Plan',
      amount: 149.99,
      frequency: 'monthly',
      nextBilling: '2024-02-15',
      status: 'active',
      autoRenew: true,
    },
    {
      id: 'sub_002',
      childName: 'Jake Johnson',
      academy: 'Young Athletes Club',
      plan: 'Basic Skills Program',
      amount: 89.99,
      frequency: 'monthly',
      nextBilling: '2024-02-20',
      status: 'active',
      autoRenew: true,
    },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'card_001',
      type: 'credit',
      brand: 'visa',
      lastFour: '4242',
      expiryMonth: '12',
      expiryYear: '2026',
      isDefault: true,
      holderName: 'Sarah Johnson',
    },
    {
      id: 'card_002',
      type: 'credit',
      brand: 'mastercard',
      lastFour: '8888',
      expiryMonth: '08',
      expiryYear: '2025',
      isDefault: false,
      holderName: 'Sarah Johnson',
    },
  ]);

  const [billingHistory, setBillingHistory] = useState([
    {
      id: 'bill_001',
      date: '2024-01-15',
      amount: 149.99,
      description: 'Premium Training Plan - Emma Johnson',
      status: 'paid',
      method: '**** 4242',
      invoice: 'INV-2024-001',
    },
    {
      id: 'bill_002',
      date: '2024-01-20',
      amount: 89.99,
      description: 'Basic Skills Program - Jake Johnson',
      status: 'paid',
      method: '**** 4242',
      invoice: 'INV-2024-002',
    },
    {
      id: 'bill_003',
      date: '2023-12-15',
      amount: 149.99,
      description: 'Premium Training Plan - Emma Johnson',
      status: 'paid',
      method: '**** 8888',
      invoice: 'INV-2023-156',
    },
  ]);

  const [billingPreferences, setBillingPreferences] = useState({
    emailReceipts: true,
    autoRenew: true,
    lowBalanceAlerts: true,
    paymentReminders: true,
    billingNotifications: true,
  });

  const [loading, setLoading] = useState(false);
  const [addCardModalVisible, setAddCardModalVisible] = useState(false);
  const [newCardData, setNewCardData] = useState({
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    holderName: '',
  });

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Load billing data from API
    } catch (error) {
      console.error('Error loading billing data:', error);
      Alert.alert('Error', 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = (subscription) => {
    Alert.alert(
      'Cancel Subscription',
      `Are you sure you want to cancel the ${subscription.plan} for ${subscription.childName}? This will take effect at the end of the current billing period.`,
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { 
          text: 'Cancel Subscription', 
          style: 'destructive',
          onPress: () => cancelSubscription(subscription.id)
        },
      ]
    );
  };

  const cancelSubscription = async (subscriptionId) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setActiveSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, status: 'cancelled', autoRenew: false }
            : sub
        )
      );
      
      Alert.alert('Success', 'Subscription has been cancelled');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      Alert.alert('Error', 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoRenew = async (subscriptionId, currentValue) => {
    try {
      setActiveSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, autoRenew: !currentValue }
            : sub
        )
      );
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error updating auto-renew:', error);
      Alert.alert('Error', 'Failed to update auto-renew setting');
    }
  };

  const handleDeletePaymentMethod = (cardId) => {
    const card = paymentMethods.find(c => c.id === cardId);
    if (card.isDefault) {
      Alert.alert('Cannot Delete', 'You cannot delete your default payment method. Please set another card as default first.');
      return;
    }

    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete this payment method ending in ${card.lastFour}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deletePaymentMethod(cardId)
        },
      ]
    );
  };

  const deletePaymentMethod = async (cardId) => {
    try {
      setPaymentMethods(prev => prev.filter(card => card.id !== cardId));
      Alert.alert('Success', 'Payment method has been deleted');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      Alert.alert('Error', 'Failed to delete payment method');
    }
  };

  const setDefaultPaymentMethod = async (cardId) => {
    try {
      setPaymentMethods(prev => 
        prev.map(card => ({
          ...card,
          isDefault: card.id === cardId
        }))
      );
      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to update default payment method');
    }
  };

  const addPaymentMethod = async () => {
    if (!newCardData.number || !newCardData.expiryMonth || !newCardData.expiryYear || !newCardData.cvc) {
      Alert.alert('Error', 'Please fill in all card details');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newCard = {
        id: `card_${Date.now()}`,
        type: 'credit',
        brand: getBrandFromNumber(newCardData.number),
        lastFour: newCardData.number.slice(-4),
        expiryMonth: newCardData.expiryMonth,
        expiryYear: newCardData.expiryYear,
        isDefault: paymentMethods.length === 0,
        holderName: newCardData.holderName,
      };
      
      setPaymentMethods(prev => [...prev, newCard]);
      setAddCardModalVisible(false);
      setNewCardData({
        number: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        holderName: '',
      });
      
      Alert.alert('Success', 'Payment method added successfully');
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const getBrandFromNumber = (number) => {
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const getCardIcon = (brand) => {
    const icons = {
      visa: 'credit-card',
      mastercard: 'credit-card',
      amex: 'credit-card',
      unknown: 'credit-card',
    };
    return icons[brand] || 'credit-card';
  };

  const handlePreferenceChange = (key, value) => {
    setBillingPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const SubscriptionsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Active Subscriptions</Text>
      
      {activeSubscriptions.map(subscription => (
        <View key={subscription.id} style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionPlan}>{subscription.plan}</Text>
              <Text style={styles.subscriptionChild}>{subscription.childName}</Text>
              <Text style={styles.subscriptionAcademy}>{subscription.academy}</Text>
            </View>
            <View style={styles.subscriptionAmount}>
              <Text style={styles.amountText}>${subscription.amount}</Text>
              <Text style={styles.frequencyText}>/{subscription.frequency}</Text>
            </View>
          </View>
          
          <View style={styles.subscriptionDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Next Billing:</Text>
              <Text style={styles.detailValue}>
                {new Date(subscription.nextBilling).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status:</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { 
                  backgroundColor: subscription.status === 'active' ? COLORS.success : COLORS.error 
                }]} />
                <Text style={[styles.statusText, {
                  color: subscription.status === 'active' ? COLORS.success : COLORS.error
                }]}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.subscriptionActions}>
            <View style={styles.autoRenewContainer}>
              <Text style={styles.autoRenewText}>Auto-renew</Text>
              <Switch
                value={subscription.autoRenew}
                onValueChange={(value) => toggleAutoRenew(subscription.id, subscription.autoRenew)}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={subscription.autoRenew ? COLORS.white : COLORS.gray}
                disabled={subscription.status === 'cancelled'}
              />
            </View>
            
            {subscription.status === 'active' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelSubscription(subscription)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const PaymentMethodsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddCardModalVisible(true)}
        >
          <Icon name="add" size={20} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add Card</Text>
        </TouchableOpacity>
      </View>
      
      {paymentMethods.map(card => (
        <View key={card.id} style={styles.paymentCard}>
          <View style={styles.cardInfo}>
            <Icon name={getCardIcon(card.brand)} size={24} color={COLORS.primary} />
            <View style={styles.cardDetails}>
              <Text style={styles.cardNumber}>**** **** **** {card.lastFour}</Text>
              <Text style={styles.cardExpiry}>
                Expires {card.expiryMonth}/{card.expiryYear}
              </Text>
              <Text style={styles.cardHolder}>{card.holderName}</Text>
            </View>
          </View>
          
          <View style={styles.cardActions}>
            {card.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
            
            <View style={styles.cardButtons}>
              {!card.isDefault && (
                <TouchableOpacity
                  style={styles.setDefaultButton}
                  onPress={() => setDefaultPaymentMethod(card.id)}
                >
                  <Text style={styles.setDefaultText}>Set Default</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePaymentMethod(card.id)}
              >
                <Icon name="delete" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const BillingHistorySection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Billing History</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PaymentHistory')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {billingHistory.slice(0, 3).map(bill => (
        <TouchableOpacity key={bill.id} style={styles.historyItem}>
          <View style={styles.historyInfo}>
            <Text style={styles.historyDescription}>{bill.description}</Text>
            <Text style={styles.historyDate}>
              {new Date(bill.date).toLocaleDateString()} • {bill.method}
            </Text>
            <Text style={styles.invoiceNumber}>{bill.invoice}</Text>
          </View>
          
          <View style={styles.historyAmount}>
            <Text style={styles.amountText}>${bill.amount}</Text>
            <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const BillingPreferencesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Billing Preferences</Text>
      
      {Object.entries(billingPreferences).map(([key, value]) => (
        <View key={key} style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceTitle}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
            <Text style={styles.preferenceDescription}>
              {getPreferenceDescription(key)}
            </Text>
          </View>
          <Switch
            value={value}
            onValueChange={(newValue) => handlePreferenceChange(key, newValue)}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={value ? COLORS.white : COLORS.gray}
          />
        </View>
      ))}
    </View>
  );

  const getPreferenceDescription = (key) => {
    const descriptions = {
      emailReceipts: 'Receive payment receipts via email',
      autoRenew: 'Automatically renew subscriptions',
      lowBalanceAlerts: 'Alert when payment fails',
      paymentReminders: 'Remind before payment due',
      billingNotifications: 'General billing notifications',
    };
    return descriptions[key] || '';
  };

  const AddCardModal = () => (
    <Modal
      visible={addCardModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setAddCardModalVisible(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Payment Method</Text>
          <TouchableOpacity onPress={addPaymentMethod} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.saveText}>Add</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.textInput}
              value={newCardData.number}
              onChangeText={(text) => setNewCardData(prev => ({ ...prev, number: text.replace(/\s/g, '') }))}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={16}
            />
          </View>
          
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>Expiry Month</Text>
              <TextInput
                style={styles.textInput}
                value={newCardData.expiryMonth}
                onChangeText={(text) => setNewCardData(prev => ({ ...prev, expiryMonth: text }))}
                placeholder="MM"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.inputLabel}>Expiry Year</Text>
              <TextInput
                style={styles.textInput}
                value={newCardData.expiryYear}
                onChangeText={(text) => setNewCardData(prev => ({ ...prev, expiryYear: text }))}
                placeholder="YYYY"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CVC</Text>
            <TextInput
              style={styles.textInput}
              value={newCardData.cvc}
              onChangeText={(text) => setNewCardData(prev => ({ ...prev, cvc: text }))}
              placeholder="123"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.textInput}
              value={newCardData.holderName}
              onChangeText={(text) => setNewCardData(prev => ({ ...prev, holderName: text }))}
              placeholder="John Doe"
            />
          </View>
          
          <View style={styles.securityNote}>
            <Icon name="security" size={16} color={COLORS.gray} />
            <Text style={styles.securityText}>
              Your payment information is encrypted and secure
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading && !addCardModalVisible) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading billing information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SubscriptionsSection />
      <PaymentMethodsSection />
      <BillingHistorySection />
      <BillingPreferencesSection />
      <AddCardModal />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: 10,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  subscriptionCard: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionPlan: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subscriptionChild: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  subscriptionAcademy: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  subscriptionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  frequencyText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  subscriptionDetails: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subscriptionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 15,
  },
  autoRenewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoRenewText: {
    fontSize: 14,
    color: COLORS.text,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  paymentCard: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  cardHolder: {
    fontSize: 12,
    color: COLORS.gray,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  cardButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setDefaultButton: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  setDefaultText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  historyInfo: {
    flex: 1,
  },
  historyDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  invoiceNumber: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
  },
  historyAmount: {
    alignItems: 'flex-end',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 12,
    color: COLORS.gray,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  saveText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
  },
});

export default BillingSettings;