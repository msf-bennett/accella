import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Modal,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';

const { width } = Dimensions.get('window');

const PaymentReminders = ({ navigation, route }) => {
  const [upcomingPayments, setUpcomingPayments] = useState([
    {
      id: 'payment_001',
      childName: 'Emma Johnson',
      academy: 'Elite Sports Academy',
      plan: 'Premium Training Plan',
      amount: 149.99,
      dueDate: '2024-02-15',
      daysUntilDue: 3,
      status: 'upcoming',
      paymentMethod: '**** 4242',
      reminderSent: true,
    },
    {
      id: 'payment_002',
      childName: 'Jake Johnson',
      academy: 'Young Athletes Club',
      plan: 'Basic Skills Program',
      amount: 89.99,
      dueDate: '2024-02-20',
      daysUntilDue: 8,
      status: 'upcoming',
      paymentMethod: '**** 4242',
      reminderSent: false,
    },
    {
      id: 'payment_003',
      childName: 'Emma Johnson',
      academy: 'Elite Sports Academy',
      plan: 'Equipment Fee',
      amount: 75.00,
      dueDate: '2024-02-10',
      daysUntilDue: -2,
      status: 'overdue',
      paymentMethod: '**** 8888',
      reminderSent: true,
    },
  ]);

  const [failedPayments, setFailedPayments] = useState([
    {
      id: 'failed_001',
      childName: 'Emma Johnson',
      academy: 'Elite Sports Academy',
      plan: 'Premium Training Plan',
      amount: 149.99,
      failDate: '2024-01-30',
      reason: 'Insufficient funds',
      paymentMethod: '**** 8888',
      retryCount: 2,
      nextRetry: '2024-02-14',
    },
  ]);

  const [reminderSettings, setReminderSettings] = useState({
    enableReminders: true,
    reminderDays: [7, 3, 1], // Days before due date
    enableOverdueReminders: true,
    overdueFrequency: 'daily', // daily, weekly
    enableFailedPaymentAlerts: true,
    enableAutoRetry: true,
    retryAttempts: 3,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });

  const [notifications, setNotifications] = useState([
    {
      id: 'notif_001',
      type: 'reminder',
      title: 'Payment Due Soon',
      message: 'Premium Training Plan payment of $149.99 is due in 3 days',
      date: '2024-02-12T10:00:00',
      read: false,
      paymentId: 'payment_001',
    },
    {
      id: 'notif_002',
      type: 'failed',
      title: 'Payment Failed',
      message: 'Your payment for Premium Training Plan failed. Please update your payment method.',
      date: '2024-01-30T14:30:00',
      read: false,
      paymentId: 'failed_001',
    },
    {
      id: 'notif_003',
      type: 'overdue',
      title: 'Payment Overdue',
      message: 'Equipment Fee payment of $75.00 is now overdue',
      date: '2024-02-11T09:00:00',
      read: true,
      paymentId: 'payment_003',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('upcoming'); // upcoming, failed, notifications

  useEffect(() => {
    loadPaymentReminders();
  }, []);

  const loadPaymentReminders = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Load payment reminders data from API
      markNotificationsAsRead();
    } catch (error) {
      console.error('Error loading payment reminders:', error);
      Alert.alert('Error', 'Failed to load payment reminders');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handlePayNow = async (payment) => {
    Alert.alert(
      'Process Payment',
      `Pay $${payment.amount} for ${payment.plan}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: () => processPayment(payment)
        },
      ]
    );
  };

  const processPayment = async (payment) => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status
      setUpcomingPayments(prev => 
        prev.filter(p => p.id !== payment.id)
      );
      
      // Remove from failed payments if exists
      setFailedPayments(prev => 
        prev.filter(p => p.childName !== payment.childName && p.plan !== payment.plan)
      );
      
      Alert.alert('Success', 'Payment processed successfully');
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retryFailedPayment = async (failedPayment) => {
    Alert.alert(
      'Retry Payment',
      `Retry payment of $${failedPayment.amount} for ${failedPayment.plan}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Retry', 
          onPress: () => processRetryPayment(failedPayment)
        },
      ]
    );
  };

  const processRetryPayment = async (failedPayment) => {
    setLoading(true);
    try {
      // Simulate retry payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove from failed payments
      setFailedPayments(prev => 
        prev.filter(p => p.id !== failedPayment.id)
      );
      
      Alert.alert('Success', 'Payment retry successful');
    } catch (error) {
      console.error('Error retrying payment:', error);
      
      // Update retry count
      setFailedPayments(prev => 
        prev.map(p => 
          p.id === failedPayment.id 
            ? { ...p, retryCount: p.retryCount + 1 }
            : p
        )
      );
      
      Alert.alert('Error', 'Payment retry failed. Please check your payment method.');
    } finally {
      setLoading(false);
    }
  };

  const updateReminderSetting = (key, value) => {
    setReminderSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveReminderSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSettingsModalVisible(false);
      Alert.alert('Success', 'Reminder settings updated');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return COLORS.primary;
      case 'overdue': return COLORS.error;
      case 'failed': return COLORS.error;
      default: return COLORS.gray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return 'schedule';
      case 'overdue': return 'warning';
      case 'failed': return 'error';
      default: return 'info';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reminder': return 'schedule';
      case 'failed': return 'error';
      case 'overdue': return 'warning';
      default: return 'notifications';
    }
  };

  const TabHeader = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
        onPress={() => setSelectedTab('upcoming')}
      >
        <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.activeTabText]}>
          Upcoming ({upcomingPayments.filter(p => p.status === 'upcoming').length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'failed' && styles.activeTab]}
        onPress={() => setSelectedTab('failed')}
      >
        <Text style={[styles.tabText, selectedTab === 'failed' && styles.activeTabText]}>
          Failed ({failedPayments.length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'notifications' && styles.activeTab]}
        onPress={() => setSelectedTab('notifications')}
      >
        <Text style={[styles.tabText, selectedTab === 'notifications' && styles.activeTabText]}>
          Notifications ({notifications.filter(n => !n.read).length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const UpcomingPaymentsTab = () => (
    <View style={styles.tabContent}>
      {upcomingPayments.map(payment => (
        <View key={payment.id} style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.statusIndicator}>
              <Icon 
                name={getStatusIcon(payment.status)} 
                size={20} 
                color={getStatusColor(payment.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                {payment.status === 'upcoming' 
                  ? `Due in ${payment.daysUntilDue} days`
                  : `${Math.abs(payment.daysUntilDue)} days overdue`
                }
              </Text>
            </View>
            
            <Text style={styles.amountText}>${payment.amount}</Text>
          </View>
          
          <View style={styles.paymentInfo}>
            <Text style={styles.planName}>{payment.plan}</Text>
            <Text style={styles.childName}>{payment.childName}</Text>
            <Text style={styles.academyName}>{payment.academy}</Text>
          </View>
          
          <View style={styles.paymentDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(payment.dueDate).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method:</Text>
              <Text style={styles.detailValue}>{payment.paymentMethod}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reminder Sent:</Text>
              <Text style={[styles.detailValue, {
                color: payment.reminderSent ? COLORS.success : COLORS.gray
              }]}>
                {payment.reminderSent ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
          
          <View style={styles.paymentActions}>
            <TouchableOpacity
              style={styles.payNowButton}
              onPress={() => handlePayNow(payment)}
            >
              <Text style={styles.payNowText}>Pay Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.updateMethodButton}
              onPress={() => navigation.navigate('BillingSettings')}
            >
              <Text style={styles.updateMethodText}>Update Payment Method</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      
      {upcomingPayments.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="check-circle" size={48} color={COLORS.success} />
          <Text style={styles.emptyTitle}>All payments up to date!</Text>
          <Text style={styles.emptyMessage}>You have no upcoming payments at this time.</Text>
        </View>
      )}
    </View>
  );

  const FailedPaymentsTab = () => (
    <View style={styles.tabContent}>
      {failedPayments.map(payment => (
        <View key={payment.id} style={[styles.paymentCard, styles.failedCard]}>
          <View style={styles.paymentHeader}>
            <View style={styles.statusIndicator}>
              <Icon name="error" size={20} color={COLORS.error} />
              <Text style={[styles.statusText, { color: COLORS.error }]}>
                Payment Failed
              </Text>
            </View>
            
            <Text style={styles.amountText}>${payment.amount}</Text>
          </View>
          
          <View style={styles.paymentInfo}>
            <Text style={styles.planName}>{payment.plan}</Text>
            <Text style={styles.childName}>{payment.childName}</Text>
            <Text style={styles.academyName}>{payment.academy}</Text>
          </View>
          
          <View style={styles.failureDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Failed Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(payment.failDate).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reason:</Text>
              <Text style={[styles.detailValue, { color: COLORS.error }]}>
                {payment.reason}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Retry Attempts:</Text>
              <Text style={styles.detailValue}>{payment.retryCount}/3</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next Auto Retry:</Text>
              <Text style={styles.detailValue}>
                {new Date(payment.nextRetry).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.paymentActions}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => retryFailedPayment(payment)}
            >
              <Icon name="refresh" size={16} color={COLORS.white} />
              <Text style={styles.retryText}>Retry Payment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.updateMethodButton}
              onPress={() => navigation.navigate('BillingSettings')}
            >
              <Text style={styles.updateMethodText}>Update Payment Method</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      
      {failedPayments.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="check-circle" size={48} color={COLORS.success} />
          <Text style={styles.emptyTitle}>No failed payments!</Text>
          <Text style={styles.emptyMessage}>All your payments are processing successfully.</Text>
        </View>
      )}
    </View>
  );

  const NotificationsTab = () => (
    <View style={styles.tabContent}>
      {notifications.map(notification => (
        <TouchableOpacity key={notification.id} style={[
          styles.notificationCard,
          !notification.read && styles.unreadNotification
        ]}>
          <View style={styles.notificationHeader}>
            <Icon 
              name={getNotificationIcon(notification.type)} 
              size={20} 
              color={getStatusColor(notification.type === 'reminder' ? 'upcoming' : notification.type)} 
            />
            <Text style={styles.notificationTime}>
              {new Date(notification.date).toLocaleDateString()}
            </Text>
          </View>
          
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          
          {!notification.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      ))}
      
      {notifications.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="notifications-none" size={48} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyMessage}>You'll see payment reminders and alerts here.</Text>
        </View>
      )}
    </View>
  );

  const ReminderSettingsModal = () => (
    <Modal
      visible={settingsModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Reminder Settings</Text>
          <TouchableOpacity onPress={saveReminderSettings} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.settingSection}>
            <Text style={styles.settingSectionTitle}>General Settings</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Enable Payment Reminders</Text>
              <Switch
                value={reminderSettings.enableReminders}
                onValueChange={(value) => updateReminderSetting('enableReminders', value)}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={reminderSettings.enableReminders ? COLORS.white : COLORS.gray}
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Enable Overdue Reminders</Text>
              <Switch
                value={reminderSettings.enableOverdueReminders}
                onValueChange={(value) => updateReminderSetting('enableOverdueReminders', value)}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={reminderSettings.enableOverdueReminders ? COLORS.white : COLORS.gray}
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Failed Payment Alerts</Text>
              <Switch
                value={reminderSettings.enableFailedPaymentAlerts}
                onValueChange={(value) => updateReminderSetting('enableFailedPaymentAlerts', value)}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={reminderSettings.enableFailedPaymentAlerts ? COLORS.white : COLORS.gray}
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Auto Retry Failed Payments</Text>
              <Switch
                value={reminderSettings.enableAutoRetry}
                onValueChange={(value) => updateReminderSetting('enableAutoRetry', value)}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={reminderSettings.enableAutoRetry ? COLORS.white : COLORS.gray}
              />
            </View>
          </View>
          
          <View style={styles.settingSection}>
            <Text style={styles.settingSectionTitle}>Notification Channels</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Switch
                value={reminderSettings.emailNotifications}
                onValueChange={(value) => updateReminderSetting('emailNotifications', value)}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={reminderSettings.emailNotifications ? COLORS.white : COLORS.gray}
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Switch
                value={reminderSettings.pushNotifications}
                onValueChange={(value) => updateReminderSetting('pushNotifications', value)}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={reminderSettings.pushNotifications ? COLORS.white : COLORS.gray}
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>SMS Notifications</Text>
              <Switch
                value={reminderSettings.smsNotifications}
                onValueChange={(value) => updateReminderSetting('smsNotifications', value)}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={reminderSettings.smsNotifications ? COLORS.white : COLORS.gray}
              />
            </View>
          </View>
          
          <View style={styles.reminderDaysSection}>
            <Text style={styles.settingSectionTitle}>Reminder Schedule</Text>
            <Text style={styles.reminderDaysText}>
              Send reminders {reminderSettings.reminderDays.join(', ')} days before payment due
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading && !settingsModalVisible) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading payment reminders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment Reminders</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Icon name="settings" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <TabHeader />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'upcoming' && <UpcomingPaymentsTab />}
        {selectedTab === 'failed' && <FailedPaymentsTab />}
        {selectedTab === 'notifications' && <NotificationsTab />}
      </ScrollView>
      
      <ReminderSettingsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  settingsButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  paymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  failedCard: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  paymentInfo: {
    marginBottom: 15,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  childName: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  academyName: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  paymentDetails: {
    marginBottom: 15,
  },
  failureDetails: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 15,
  },
  payNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  payNowText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  updateMethodButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateMethodText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    position: 'relative',
  },
  unreadNotification: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 10,
    color: COLORS.gray,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 16,
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 5,
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginHorizontal: 20,
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
  settingSection: {
    marginBottom: 25,
  },
  settingSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingLabel: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  reminderDaysSection: {
    marginBottom: 20,
  },
  reminderDaysText: {
    fontSize: 12,
    color: COLORS.gray,
    backgroundColor: COLORS.lightGray,
    padding: 10,
    borderRadius: 6,
    textAlign: 'center',
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

export default PaymentReminders;