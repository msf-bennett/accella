import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  TextInput,
  Switch,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Dimensions,
  RefreshControl
} from 'react-native';
import { 
  CreditCard, 
  History, 
  Bell, 
  Settings, 
  Plus, 
  Star, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Calendar, 
  DollarSign,
  Users,
  Target,
  TrendingUp,
  Shield,
  Smartphone,
  Building,
  PayPal as PayPalIcon,
  Heart,
  Search,
  Filter,
  MoreHorizontal,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Color scheme
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  accent: '#8B5CF6',
  light: '#F3F4F6'
};

// Main Payment Dashboard Component
const PaymentDashboard = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for payment data
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'pm_001',
      type: 'card',
      brand: 'visa',
      lastFour: '4242',
      expiryMonth: '12',
      expiryYear: '2026',
      isDefault: true,
      holderName: 'Sarah Johnson',
      isFavorite: true,
      nickname: 'Primary Card'
    },
    {
      id: 'pm_002',
      type: 'card',
      brand: 'mastercard',
      lastFour: '8888',
      expiryMonth: '08',
      expiryYear: '2025',
      isDefault: false,
      holderName: 'Sarah Johnson',
      isFavorite: false,
      nickname: 'Backup Card'
    },
    {
      id: 'pm_003',
      type: 'mobile',
      provider: 'mpesa',
      phoneNumber: '+254700123456',
      isDefault: false,
      isFavorite: true,
      nickname: 'M-Pesa'
    }
  ]);

  const [recentPayments, setRecentPayments] = useState([
    {
      id: 'pay_001',
      description: 'Monthly Training - Elite Football Academy',
      amount: 150.00,
      date: '2024-08-10',
      status: 'completed',
      paymentMethod: '**** 4242',
      recipient: 'Elite Football Academy',
      type: 'subscription',
      isFavorite: true
    },
    {
      id: 'pay_002',
      description: 'Private Coaching Session - John Smith',
      amount: 75.00,
      date: '2024-08-08',
      status: 'completed',
      paymentMethod: 'M-Pesa',
      recipient: 'John Smith',
      type: 'session'
    },
    {
      id: 'pay_003',
      description: 'Equipment Purchase - Sports Store',
      amount: 89.99,
      date: '2024-08-05',
      status: 'completed',
      paymentMethod: '**** 8888',
      recipient: 'Sports Store',
      type: 'purchase'
    }
  ]);

  const [upcomingPayments, setUpcomingPayments] = useState([
    {
      id: 'up_001',
      description: 'Monthly Training - Elite Football Academy',
      amount: 150.00,
      dueDate: '2024-08-15',
      paymentMethod: '**** 4242',
      recipient: 'Elite Football Academy',
      type: 'subscription',
      reminderSet: true
    },
    {
      id: 'up_002',
      description: 'Swimming Lessons - Aquatic Center',
      amount: 120.00,
      dueDate: '2024-08-18',
      paymentMethod: 'M-Pesa',
      recipient: 'Aquatic Center',
      type: 'subscription',
      reminderSet: false
    }
  ]);

  const [favoritePayees, setFavoritePayees] = useState([
    {
      id: 'fav_001',
      name: 'Elite Football Academy',
      type: 'academy',
      avatar: '🏈',
      lastAmount: 150.00,
      frequency: 'monthly'
    },
    {
      id: 'fav_002',
      name: 'John Smith - Personal Trainer',
      type: 'trainer',
      avatar: '💪',
      lastAmount: 75.00,
      frequency: 'weekly'
    },
    {
      id: 'fav_003',
      name: 'Aquatic Center',
      type: 'academy',
      avatar: '🏊',
      lastAmount: 120.00,
      frequency: 'monthly'
    }
  ]);

  const [quickStats, setQuickStats] = useState({
    totalSpent: 1245.50,
    monthlyBudget: 500.00,
    upcomingDue: 270.00,
    savedMethods: 3,
    favoritePayees: 3,
    completedPayments: 12
  });

  // Navigation function
  const navigateToScreen = (screenName, params = {}) => {
    setCurrentScreen(screenName);
    if (screenName === 'edit_payment_method' && params.method) {
      setSelectedPaymentMethod(params.method);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Dashboard Screen Component
  const DashboardScreen = () => (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Payment Center</Text>
          <Text style={styles.headerSubtitle}>Manage your training payments</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigatToScreen('reminders')}
        >
          <Bell size={24} color={COLORS.primary} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <DollarSign size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>${quickStats.totalSpent}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>${quickStats.monthlyBudget}</Text>
            <Text style={styles.statLabel}>Monthly Budget</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color={COLORS.warning} />
            <Text style={styles.statValue}>${quickStats.upcomingDue}</Text>
            <Text style={styles.statLabel}>Due Soon</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={24} color={COLORS.success} />
            <Text style={styles.statValue}>{quickStats.completedPayments}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigateToScreen('add_payment_method')}
          >
            <Plus size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Add Payment Method</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigateToScreen('payment_history')}
          >
            <History size={24} color={COLORS.secondary} />
            <Text style={styles.quickActionText}>Payment History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigateToScreen('reminders')}
          >
            <Bell size={24} color={COLORS.warning} />
            <Text style={styles.quickActionText}>Set Reminders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigateToScreen('settings')}
          >
            <Settings size={24} color={COLORS.accent} />
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Favorite Payment Methods */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Favorite Payment Methods</Text>
          <TouchableOpacity onPress={() => navigateToScreen('payment_methods')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {paymentMethods.filter(method => method.isFavorite).map(method => (
            <PaymentMethodCard key={method.id} method={method} isHorizontal />
          ))}
        </ScrollView>
      </View>

      {/* Recent Payments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          <TouchableOpacity onPress={() => navigateToScreen('payment_history')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentPayments.slice(0, 3).map(payment => (
          <RecentPaymentCard key={payment.id} payment={payment} />
        ))}
      </View>

      {/* Upcoming Payments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Payments</Text>
          <TouchableOpacity onPress={() => navigateToScreen('reminders')}>
            <Text style={styles.viewAllText}>Manage</Text>
          </TouchableOpacity>
        </View>
        {upcomingPayments.map(payment => (
          <UpcomingPaymentCard key={payment.id} payment={payment} />
        ))}
      </View>

      {/* Favorite Payees */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favorite Payees</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {favoritePayees.map(payee => (
            <FavoritePayeeCard key={payee.id} payee={payee} />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );

  // Payment Method Card Component
  const PaymentMethodCard = ({ method, isHorizontal = false }) => (
    <TouchableOpacity 
      style={[styles.paymentMethodCard, isHorizontal && styles.horizontalCard]}
      onPress={() => navigateToScreen('edit_payment_method', { method })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          {method.type === 'card' ? (
            <CreditCard size={20} color={COLORS.primary} />
          ) : (
            <Smartphone size={20} color={COLORS.secondary} />
          )}
          <Text style={styles.cardBrand}>{method.brand || method.provider}</Text>
        </View>
        <View style={styles.cardActions}>
          {method.isFavorite && <Heart size={16} color={COLORS.error} fill={COLORS.error} />}
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.cardNumber}>
        {method.type === 'card' ? `**** ${method.lastFour}` : method.phoneNumber}
      </Text>
      
      {method.nickname && (
        <Text style={styles.cardNickname}>{method.nickname}</Text>
      )}
      
      {method.type === 'card' && (
        <Text style={styles.cardExpiry}>Expires {method.expiryMonth}/{method.expiryYear}</Text>
      )}
    </TouchableOpacity>
  );

  // Recent Payment Card Component
  const RecentPaymentCard = ({ payment }) => (
    <TouchableOpacity style={styles.recentPaymentCard}>
      <View style={styles.paymentIcon}>
        <Text style={styles.paymentEmoji}>
          {payment.type === 'subscription' ? '🔄' : payment.type === 'session' ? '🎯' : '🛒'}
        </Text>
      </View>
      
      <View style={styles.paymentDetails}>
        <Text style={styles.paymentDescription}>{payment.description}</Text>
        <Text style={styles.paymentRecipient}>{payment.recipient}</Text>
        <Text style={styles.paymentDate}>{new Date(payment.date).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.paymentAmount}>
        <Text style={styles.amountText}>${payment.amount}</Text>
        <Text style={styles.paymentMethodText}>{payment.paymentMethod}</Text>
        {payment.isFavorite && <Heart size={14} color={COLORS.error} fill={COLORS.error} />}
      </View>
    </TouchableOpacity>
  );

  // Upcoming Payment Card Component
  const UpcomingPaymentCard = ({ payment }) => (
    <View style={styles.upcomingPaymentCard}>
      <View style={styles.upcomingHeader}>
        <Text style={styles.upcomingDescription}>{payment.description}</Text>
        <Text style={styles.upcomingAmount}>${payment.amount}</Text>
      </View>
      
      <View style={styles.upcomingDetails}>
        <Text style={styles.upcomingDue}>Due: {new Date(payment.dueDate).toLocaleDateString()}</Text>
        <Text style={styles.upcomingMethod}>{payment.paymentMethod}</Text>
      </View>
      
      <View style={styles.upcomingActions}>
        <TouchableOpacity style={styles.reminderButton}>
          <Bell size={16} color={payment.reminderSet ? COLORS.warning : COLORS.textSecondary} />
          <Text style={[styles.reminderText, { color: payment.reminderSet ? COLORS.warning : COLORS.textSecondary }]}>
            {payment.reminderSet ? 'Reminder Set' : 'Set Reminder'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.payNowButton}>
          <Text style={styles.payNowText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Favorite Payee Card Component
  const FavoritePayeeCard = ({ payee }) => (
    <TouchableOpacity style={styles.favoritePayeeCard}>
      <Text style={styles.payeeAvatar}>{payee.avatar}</Text>
      <Text style={styles.payeeName}>{payee.name}</Text>
      <Text style={styles.payeeAmount}>${payee.lastAmount}</Text>
      <Text style={styles.payeeFrequency}>{payee.frequency}</Text>
    </TouchableOpacity>
  );

  // Payment Methods Screen
  const PaymentMethodsScreen = () => {
    const [selectedMethod, setSelectedMethod] = useState(null);

    const handleDeleteMethod = (methodId) => {
      Alert.alert(
        'Delete Payment Method',
        'Are you sure you want to delete this payment method?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
            }
          }
        ]
      );
    };

    const toggleFavorite = (methodId) => {
      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === methodId ? { ...method, isFavorite: !method.isFavorite } : method
        )
      );
    };

    const setAsDefault = (methodId) => {
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === methodId
        }))
      );
    };

    return (
      <ScrollView style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => navigateToScreen('dashboard')}>
            <ArrowRight size={24} color={COLORS.primary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Payment Methods</Text>
          <TouchableOpacity onPress={() => navigateToScreen('add_payment_method')}>
            <Plus size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {paymentMethods.map(method => (
            <View key={method.id} style={styles.fullPaymentMethodCard}>
              <PaymentMethodCard method={method} />
              
              <View style={styles.methodActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => toggleFavorite(method.id)}
                >
                  <Heart 
                    size={20} 
                    color={method.isFavorite ? COLORS.error : COLORS.textSecondary}
                    fill={method.isFavorite ? COLORS.error : 'none'}
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => navigateToScreen('edit_payment_method', { method })}
                >
                  <Edit3 size={20} color={COLORS.primary} />
                </TouchableOpacity>
                
                {!method.isDefault && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => setAsDefault(method.id)}
                  >
                    <Star size={20} color={COLORS.warning} />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteMethod(method.id)}
                >
                  <Trash2 size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Add Payment Method Screen
  const AddPaymentMethodScreen = () => {
    const [paymentType, setPaymentType] = useState('card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [holderName, setHolderName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [nickname, setNickname] = useState('');
    const [setAsDefault, setSetAsDefaultToggle] = useState(false);
    const [setAsFavorite, setSetAsFavoriteToggle] = useState(false);

    const handleSave = () => {
      const newMethod = {
        id: `pm_${Date.now()}`,
        type: paymentType,
        ...(paymentType === 'card' ? {
          brand: 'visa', // Would detect from card number
          lastFour: cardNumber.slice(-4),
          expiryMonth: expiryDate.split('/')[0],
          expiryYear: expiryDate.split('/')[1],
          holderName
        } : {
          provider: 'mpesa',
          phoneNumber
        }),
        isDefault: setAsDefault,
        isFavorite: setAsFavorite,
        nickname
      };

      setPaymentMethods(prev => [...prev, newMethod]);
      navigateToScreen('payment_methods');
    };

    return (
      <ScrollView style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => navigateToScreen('payment_methods')}>
            <ArrowRight size={24} color={COLORS.primary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Add Payment Method</Text>
          <View />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Type</Text>
          
          <View style={styles.paymentTypeSelector}>
            <TouchableOpacity 
              style={[styles.typeButton, paymentType === 'card' && styles.activeTypeButton]}
              onPress={() => setPaymentType('card')}
            >
              <CreditCard size={20} color={paymentType === 'card' ? COLORS.surface : COLORS.textSecondary} />
              <Text style={[styles.typeButtonText, paymentType === 'card' && styles.activeTypeButtonText]}>
                Credit/Debit Card
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.typeButton, paymentType === 'mobile' && styles.activeTypeButton]}
              onPress={() => setPaymentType('mobile')}
            >
              <Smartphone size={20} color={paymentType === 'mobile' ? COLORS.surface : COLORS.textSecondary} />
              <Text style={[styles.typeButtonText, paymentType === 'mobile' && styles.activeTypeButtonText]}>
                Mobile Money
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {paymentType === 'card' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.textInput}
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  placeholder="MM/YY"
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.textInput}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  secureTextEntry
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.textInput}
                value={holderName}
                onChangeText={setHolderName}
                placeholder="John Doe"
              />
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mobile Money Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+254 700 123 456"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nickname (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder="e.g., Primary Card, Work Phone"
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Set as Default</Text>
            <Switch
              value={setAsDefault}
              onValueChange={setSetAsDefaultToggle}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Add to Favorites</Text>
            <Switch
              value={setAsFavorite}
              onValueChange={setSetAsFavoriteToggle}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
        </View>

        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Payment Method</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Edit Payment Method Screen
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const EditPaymentMethodScreen = () => {
    if (!selectedPaymentMethod) return null;

    const [nickname, setNickname] = useState(selectedPaymentMethod.nickname || '');
    const [isDefault, setIsDefault] = useState(selectedPaymentMethod.isDefault);
    const [isFavorite, setIsFavorite] = useState(selectedPaymentMethod.isFavorite);

    const handleUpdate = () => {
      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === selectedPaymentMethod.id 
            ? { ...method, nickname, isDefault, isFavorite }
            : { ...method, isDefault: isDefault ? false : method.isDefault }
        )
      );
      navigateToScreen('payment_methods');
    };

    return (
      <ScrollView style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => navigateToScreen('payment_methods')}>
            <ArrowRight size={24} color={COLORS.primary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Edit Payment Method</Text>
          <View />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method Details</Text>
          <PaymentMethodCard method={selectedPaymentMethod} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nickname</Text>
            <TextInput
              style={styles.textInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder="Add a nickname for this payment method"
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Set as Default</Text>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Add to Favorites</Text>
            <Switch
              value={isFavorite}
              onValueChange={setIsFavorite}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
        </View>

        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
            <Text style={styles.saveButtonText}>Update Payment Method</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Payment History Screen
  const PaymentHistoryScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredPayments = recentPayments.filter(payment => {
      const matchesSearch = payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.recipient.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || payment.type === filterType;
      return matchesSearch && matchesFilter;
    });

    const togglePaymentFavorite = (paymentId) => {
      setRecentPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId ? { ...payment, isFavorite: !payment.isFavorite } : payment
        )
      );
    };

    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => navigateToScreen('dashboard')}>
            <ArrowRight size={24} color={COLORS.primary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Payment History</Text>
          <TouchableOpacity>
            <Filter size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search payments..."
            />
          </View>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'subscription', 'session', 'purchase'].map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, filterType === type && styles.activeFilterChip]}
                onPress={() => setFilterType(type)}
              >
                <Text style={[styles.filterChipText, filterType === type && styles.activeFilterChipText]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.historyList}>
          {filteredPayments.map(payment => (
            <View key={payment.id} style={styles.historyPaymentCard}>
              <View style={styles.paymentCardHeader}>
                <View style={styles.paymentIconContainer}>
                  <Text style={styles.paymentTypeIcon}>
                    {payment.type === 'subscription' ? '🔄' : 
                     payment.type === 'session' ? '🎯' : '🛒'}
                  </Text>
                </View>
                
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>{payment.description}</Text>
                  <Text style={styles.paymentRecipient}>{payment.recipient}</Text>
                  <Text style={styles.paymentDate}>
                    {new Date(payment.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                
                <View style={styles.paymentAmountContainer}>
                  <Text style={styles.paymentAmount}>${payment.amount}</Text>
                  <View style={styles.paymentStatus}>
                    <CheckCircle size={16} color={COLORS.success} />
                    <Text style={styles.statusText}>Paid</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.paymentCardFooter}>
                <Text style={styles.paymentMethodUsed}>{payment.paymentMethod}</Text>
                
                <View style={styles.paymentActions}>
                  <TouchableOpacity 
                    style={styles.favoriteButton}
                    onPress={() => togglePaymentFavorite(payment.id)}
                  >
                    <Heart 
                      size={16} 
                      color={payment.isFavorite ? COLORS.error : COLORS.textSecondary}
                      fill={payment.isFavorite ? COLORS.error : 'none'}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.repeatButton}>
                    <Text style={styles.repeatButtonText}>Repeat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Reminders Screen
  const RemindersScreen = () => {
    const [reminders, setReminders] = useState([
      {
        id: 'rem_001',
        title: 'Elite Football Academy Payment',
        amount: 150.00,
        dueDate: '2024-08-15',
        reminderDate: '2024-08-13',
        isActive: true,
        frequency: 'monthly',
        paymentMethodId: 'pm_001'
      },
      {
        id: 'rem_002',
        title: 'Swimming Lessons',
        amount: 120.00,
        dueDate: '2024-08-18',
        reminderDate: '2024-08-16',
        isActive: false,
        frequency: 'monthly',
        paymentMethodId: 'pm_003'
      }
    ]);

    const toggleReminder = (reminderId) => {
      setReminders(prev => 
        prev.map(reminder => 
          reminder.id === reminderId ? { ...reminder, isActive: !reminder.isActive } : reminder
        )
      );
    };

    const addNewReminder = () => {
      Alert.alert('Add Reminder', 'Feature coming soon!');
    };

    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => navigateToScreen('dashboard')}>
            <ArrowRight size={24} color={COLORS.primary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Payment Reminders</Text>
          <TouchableOpacity onPress={addNewReminder}>
            <Plus size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.remindersSummary}>
          <View style={styles.reminderStat}>
            <Text style={styles.reminderStatNumber}>{reminders.filter(r => r.isActive).length}</Text>
            <Text style={styles.reminderStatLabel}>Active Reminders</Text>
          </View>
          <View style={styles.reminderStat}>
            <Text style={styles.reminderStatNumber}>${upcomingPayments.reduce((sum, p) => sum + p.amount, 0)}</Text>
            <Text style={styles.reminderStatLabel}>Due This Month</Text>
          </View>
        </View>

        <ScrollView style={styles.remindersList}>
          {reminders.map(reminder => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderAmount}>${reminder.amount}</Text>
                  <Text style={styles.reminderDue}>
                    Due: {new Date(reminder.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                
                <Switch
                  value={reminder.isActive}
                  onValueChange={() => toggleReminder(reminder.id)}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                />
              </View>
              
              <View style={styles.reminderDetails}>
                <View style={styles.reminderDetailItem}>
                  <Bell size={16} color={COLORS.textSecondary} />
                  <Text style={styles.reminderDetailText}>
                    Remind on: {new Date(reminder.reminderDate).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.reminderDetailItem}>
                  <CreditCard size={16} color={COLORS.textSecondary} />
                  <Text style={styles.reminderDetailText}>
                    {paymentMethods.find(pm => pm.id === reminder.paymentMethodId)?.nickname || 'Default method'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Settings Screen
  const SettingsScreen = () => {
    const [settings, setSettings] = useState({
      notifications: true,
      biometric: false,
      autoBackup: true,
      currency: 'USD',
      language: 'English'
    });

    const updateSetting = (key, value) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => navigateToScreen('dashboard')}>
            <ArrowRight size={24} color={COLORS.primary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Payment Settings</Text>
          <View />
        </View>

        <ScrollView style={styles.settingsList}>
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>Security</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Shield size={20} color={COLORS.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Biometric Authentication</Text>
                  <Text style={styles.settingDescription}>Use fingerprint or face ID for payments</Text>
                </View>
              </View>
              <Switch
                value={settings.biometric}
                onValueChange={(value) => updateSetting('biometric', value)}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>Notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Bell size={20} color={COLORS.warning} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Payment Notifications</Text>
                  <Text style={styles.settingDescription}>Get notified about payment updates</Text>
                </View>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => updateSetting('notifications', value)}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>Data</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Shield size={20} color={COLORS.secondary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Auto Backup</Text>
                  <Text style={styles.settingDescription}>Automatically backup payment data</Text>
                </View>
              </View>
              <Switch
                value={settings.autoBackup}
                onValueChange={(value) => updateSetting('autoBackup', value)}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>Preferences</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <DollarSign size={20} color={COLORS.accent} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Currency</Text>
                  <Text style={styles.settingDescription}>{settings.currency}</Text>
                </View>
              </View>
              <ArrowRight size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Render the current screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'payment_methods':
        return <PaymentMethodsScreen />;
      case 'add_payment_method':
        return <AddPaymentMethodScreen />;
      case 'edit_payment_method':
        return <EditPaymentMethodScreen />;
      case 'payment_history':
        return <PaymentHistoryScreen />;
      case 'reminders':
        return <RemindersScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderCurrentScreen()}
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: COLORS.surface,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  horizontalScroll: {
    paddingVertical: 5,
  },
  paymentMethodCard: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalCard: {
    width: 200,
    marginRight: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBrand: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  defaultText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
  },
  cardNickname: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  cardExpiry: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  recentPaymentCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  paymentEmoji: {
    fontSize: 20,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  paymentRecipient: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  paymentDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  paymentMethodText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  upcomingPaymentCard: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  upcomingDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  upcomingAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  upcomingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  upcomingDue: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  upcomingMethod: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  upcomingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reminderText: {
    fontSize: 12,
    marginLeft: 5,
  },
  payNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  payNowText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '500',
  },
  favoritePayeeCard: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 15,
    width: 120,
  },
  payeeAvatar: {
    fontSize: 30,
    marginBottom: 8,
  },
  payeeName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  payeeAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  payeeFrequency: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  fullPaymentMethodCard: {
    marginBottom: 15,
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: COLORS.light,
  },
  paymentTypeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: COLORS.light,
    marginRight: 10,
  },
  activeTypeButton: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  activeTypeButtonText: {
    color: COLORS.surface,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  bottomButtonContainer: {
    padding: 20,
    backgroundColor: COLORS.surface,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: COLORS.surface,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 10,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.light,
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  activeFilterChipText: {
    color: COLORS.surface,
  },
  historyList: {
    flex: 1,
    padding: 20,
  },
  historyPaymentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  paymentTypeIcon: {
    fontSize: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  paymentAmountContainer: {
    alignItems: 'flex-end',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 5,
  },
  paymentCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  paymentMethodUsed: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  paymentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 8,
    marginRight: 10,
  },
  repeatButton: {
    backgroundColor: COLORS.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  repeatButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  remindersSummary: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 20,
  },
  reminderStat: {
    flex: 1,
    alignItems: 'center',
  },
  reminderStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  reminderStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  remindersList: {
    flex: 1,
    padding: 20,
  },
  reminderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  reminderAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 2,
  },
  reminderDue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reminderDetails: {
    marginTop: 10,
  },
  reminderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  reminderDetailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  settingsList: {
    flex: 1,
  },
  settingsSection: {
    backgroundColor: COLORS.surface,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default PaymentDashboard;
