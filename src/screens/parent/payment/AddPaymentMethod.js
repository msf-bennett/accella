import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../styles/colors';

const AddPaymentMethod = ({ navigation, route }) => {
  const { editPaymentMethod } = route.params || {};
  
  const [selectedPaymentType, setSelectedPaymentType] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [savePaymentInfo, setSavePaymentInfo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [cardType, setCardType] = useState('');
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Payment methods available
  const paymentTypes = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'credit-card',
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: 'cellphone',
      description: 'Mobile money payment'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: 'bank',
      description: 'Direct bank account transfer'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'paypal',
      description: 'Pay with your PayPal account'
    }
  ];

  // Mock banks data for Kenya
  const banks = [
    { id: 1, name: 'KCB Bank', code: 'KCB', logo: 'https://via.placeholder.com/40' },
    { id: 2, name: 'Equity Bank', code: 'EQB', logo: 'https://via.placeholder.com/40' },
    { id: 3, name: 'Cooperative Bank', code: 'COOP', logo: 'https://via.placeholder.com/40' },
    { id: 4, name: 'ABSA Bank', code: 'ABSA', logo: 'https://via.placeholder.com/40' },
    { id: 5, name: 'Standard Chartered', code: 'SCB', logo: 'https://via.placeholder.com/40' },
    { id: 6, name: 'Stanbic Bank', code: 'SBK', logo: 'https://via.placeholder.com/40' },
    { id: 7, name: 'I&M Bank', code: 'IMB', logo: 'https://via.placeholder.com/40' },
    { id: 8, name: 'Diamond Trust Bank', code: 'DTB', logo: 'https://via.placeholder.com/40' }
  ];

  useEffect(() => {
    // Animation on component mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Pre-fill data if editing
    if (editPaymentMethod) {
      setSelectedPaymentType(editPaymentMethod.type);
      setCardNumber(editPaymentMethod.cardNumber || '');
      setCardholderName(editPaymentMethod.holderName || '');
      setPhoneNumber(editPaymentMethod.phone || '');
      setSetAsDefault(editPaymentMethod.isDefault || false);
    }
  }, []);

  // Card number formatting and validation
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'card';
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedPaymentType === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Valid card number is required';
      }
      if (!expiryDate || expiryDate.length < 5) {
        newErrors.expiryDate = 'Valid expiry date is required';
      }
      if (!cvv || cvv.length < 3) {
        newErrors.cvv = 'Valid CVV is required';
      }
      if (!cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
    } else if (selectedPaymentType === 'mpesa') {
      if (!phoneNumber || phoneNumber.length < 10) {
        newErrors.phoneNumber = 'Valid phone number is required';
      }
    } else if (selectedPaymentType === 'bank') {
      if (!selectedBank) {
        newErrors.bank = 'Please select a bank';
      }
      if (!accountNumber) {
        newErrors.accountNumber = 'Account number is required';
      }
      if (!branchCode) {
        newErrors.branchCode = 'Branch code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePaymentMethod = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentData = {
        type: selectedPaymentType,
        isDefault: setAsDefault,
        ...(selectedPaymentType === 'card' && {
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryDate,
          holderName: cardholderName,
          cardType: detectCardType(cardNumber)
        }),
        ...(selectedPaymentType === 'mpesa' && {
          phone: phoneNumber
        }),
        ...(selectedPaymentType === 'bank' && {
          bankName: selectedBank?.name,
          accountNumber,
          branchCode
        })
      };

      Alert.alert(
        'Success!',
        `Payment method ${editPaymentMethod ? 'updated' : 'added'} successfully.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={COLORS.dark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {editPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}
      </Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderPaymentTypeSelection = () => (
    <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sectionTitle}>Select Payment Method</Text>
      
      {paymentTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.paymentTypeCard,
            selectedPaymentType === type.id && styles.selectedPaymentType
          ]}
          onPress={() => {
            setSelectedPaymentType(type.id);
            setErrors({});
          }}
        >
          <View style={styles.paymentTypeHeader}>
            <Icon
              name={type.icon}
              size={24}
              color={selectedPaymentType === type.id ? COLORS.primary : COLORS.gray}
            />
            <View style={styles.paymentTypeInfo}>
              <Text style={[
                styles.paymentTypeName,
                selectedPaymentType === type.id && styles.selectedPaymentTypeName
              ]}>
                {type.name}
              </Text>
              <Text style={styles.paymentTypeDescription}>{type.description}</Text>
            </View>
            {selectedPaymentType === type.id && (
              <Icon name="check-circle" size={20} color={COLORS.primary} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  const renderCardForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Card Information</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Card Number</Text>
        <View style={[styles.inputContainer, errors.cardNumber && styles.errorInput]}>
          <TextInput
            style={styles.textInput}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChangeText={(text) => {
              const formatted = formatCardNumber(text);
              setCardNumber(formatted);
              setCardType(detectCardType(formatted));
              if (errors.cardNumber) {
                setErrors({...errors, cardNumber: null});
              }
            }}
            keyboardType="numeric"
            maxLength={19}
          />
          {cardType && (
            <Icon
              name={cardType === 'visa' ? 'credit-card' : cardType === 'mastercard' ? 'credit-card' : 'credit-card'}
              size={20}
              color={COLORS.primary}
              style={styles.cardIcon}
            />
          )}
        </View>
        {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Expiry Date</Text>
          <View style={[styles.inputContainer, errors.expiryDate && styles.errorInput]}>
            <TextInput
              style={styles.textInput}
              placeholder="MM/YY"
              value={expiryDate}
              onChangeText={(text) => {
                const formatted = formatExpiryDate(text);
                setExpiryDate(formatted);
                if (errors.expiryDate) {
                  setErrors({...errors, expiryDate: null});
                }
              }}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
        </View>

        <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.label}>CVV</Text>
          <View style={[styles.inputContainer, errors.cvv && styles.errorInput]}>
            <TextInput
              style={styles.textInput}
              placeholder="123"
              value={cvv}
              onChangeText={(text) => {
                setCvv(text.replace(/\D/g, '').substring(0, 4));
                if (errors.cvv) {
                  setErrors({...errors, cvv: null});
                }
              }}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />
          </View>
          {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Cardholder Name</Text>
        <View style={[styles.inputContainer, errors.cardholderName && styles.errorInput]}>
          <TextInput
            style={styles.textInput}
            placeholder="John Doe"
            value={cardholderName}
            onChangeText={(text) => {
              setCardholderName(text);
              if (errors.cardholderName) {
                setErrors({...errors, cardholderName: null});
              }
            }}
            autoCapitalize="words"
          />
        </View>
        {errors.cardholderName && <Text style={styles.errorText}>{errors.cardholderName}</Text>}
      </View>
    </View>
  );

  const renderMpesaForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>M-Pesa Information</Text>
      
      <View style={styles.mpesaInfo}>
        <Icon name="information" size={20} color={COLORS.info} />
        <Text style={styles.mpesaInfoText}>
          Enter your M-Pesa registered phone number. You'll receive a payment prompt when making transactions.
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={[styles.inputContainer, errors.phoneNumber && styles.errorInput]}>
          <Text style={styles.countryCode}>+254</Text>
          <TextInput
            style={[styles.textInput, styles.phoneInput]}
            placeholder="700123456"
            value={phoneNumber}
            onChangeText={(text) => {
              const cleaned = text.replace(/\D/g, '');
              setPhoneNumber(cleaned.substring(0, 9));
              if (errors.phoneNumber) {
                setErrors({...errors, phoneNumber: null});
              }
            }}
            keyboardType="phone-pad"
            maxLength={9}
          />
        </View>
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
      </View>
    </View>
  );

  const renderBankForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bank Account Information</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Select Bank</Text>
        <TouchableOpacity
          style={[styles.bankSelector, errors.bank && styles.errorInput]}
          onPress={() => setShowBankModal(true)}
        >
          {selectedBank ? (
            <View style={styles.selectedBankContainer}>
              <Image source={{ uri: selectedBank.logo }} style={styles.bankLogo} />
              <Text style={styles.selectedBankName}>{selectedBank.name}</Text>
            </View>
          ) : (
            <Text style={styles.bankSelectorPlaceholder}>Choose your bank</Text>
          )}
          <Icon name="chevron-down" size={20} color={COLORS.gray} />
        </TouchableOpacity>
        {errors.bank && <Text style={styles.errorText}>{errors.bank}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Account Number</Text>
        <View style={[styles.inputContainer, errors.accountNumber && styles.errorInput]}>
          <TextInput
            style={styles.textInput}
            placeholder="1234567890"
            value={accountNumber}
            onChangeText={(text) => {
              setAccountNumber(text.replace(/\D/g, ''));
              if (errors.accountNumber) {
                setErrors({...errors, accountNumber: null});
              }
            }}
            keyboardType="numeric"
          />
        </View>
        {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Branch Code</Text>
        <View style={[styles.inputContainer, errors.branchCode && styles.errorInput]}>
          <TextInput
            style={styles.textInput}
            placeholder="001"
            value={branchCode}
            onChangeText={(text) => {
              setBranchCode(text.replace(/\D/g, ''));
              if (errors.branchCode) {
                setErrors({...errors, branchCode: null});
              }
            }}
            keyboardType="numeric"
          />
        </View>
        {errors.branchCode && <Text style={styles.errorText}>{errors.branchCode}</Text>}
      </View>
    </View>
  );

  const renderPayPalForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>PayPal Account</Text>
      
      <View style={styles.paypalInfo}>
        <Icon name="paypal" size={40} color="#0070ba" />
        <Text style={styles.paypalInfoText}>
          You'll be redirected to PayPal to authorize payments when making transactions.
        </Text>
      </View>

      <TouchableOpacity style={styles.paypalConnectButton}>
        <Icon name="paypal" size={20} color="#0070ba" />
        <Text style={styles.paypalConnectText}>Connect PayPal Account</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPaymentForm = () => {
    switch (selectedPaymentType) {
      case 'card':
        return renderCardForm();
      case 'mpesa':
        return renderMpesaForm();
      case 'bank':
        return renderBankForm();
      case 'paypal':
        return renderPayPalForm();
      default:
        return null;
    }
  };

  const renderSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Settings</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Set as Default</Text>
          <Text style={styles.settingDescription}>
            Use this payment method as your primary option
          </Text>
        </View>
        <Switch
          value={setAsDefault}
          onValueChange={setSetAsDefault}
          trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
          thumbColor={setAsDefault ? COLORS.primary : COLORS.gray}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Save Payment Information</Text>
          <Text style={styles.settingDescription}>
            Securely save details for faster future payments
          </Text>
        </View>
        <Switch
          value={savePaymentInfo}
          onValueChange={setSavePaymentInfo}
          trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
          thumbColor={savePaymentInfo ? COLORS.primary : COLORS.gray}
        />
      </View>
    </View>
  );

  const renderSecurityInfo = () => (
    <View style={styles.securitySection}>
      <View style={styles.securityHeader}>
        <Icon name="shield-check" size={20} color={COLORS.success} />
        <Text style={styles.securityTitle}>Your payment information is secure</Text>
      </View>
      <Text style={styles.securityText}>
        We use industry-standard encryption to protect your financial data. Your information is never stored on our servers.
      </Text>
    </View>
  );

  const renderBankModal = () => (
    <Modal visible={showBankModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.bankModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Bank</Text>
            <TouchableOpacity onPress={() => setShowBankModal(false)}>
              <Icon name="close" size={24} color={COLORS.dark} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.bankList}>
            {banks.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={styles.bankItem}
                onPress={() => {
                  setSelectedBank(bank);
                  setBankName(bank.name);
                  setShowBankModal(false);
                  if (errors.bank) {
                    setErrors({...errors, bank: null});
                  }
                }}
              >
                <Image source={{ uri: bank.logo }} style={styles.bankItemLogo} />
                <Text style={styles.bankItemName}>{bank.name}</Text>
                <Text style={styles.bankItemCode}>{bank.code}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.disabledButton]}
        onPress={handleSavePaymentMethod}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : editPaymentMethod ? 'Update Payment Method' : 'Add Payment Method'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderPaymentTypeSelection()}
          {renderPaymentForm()}
          {renderSettings()}
          {renderSecurityInfo()}
        </ScrollView>
        
        {renderFooter()}
      </KeyboardAvoidingView>
      
      {renderBankModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  placeholder: {
    width: 34,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 20,
  },
  paymentTypeCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPaymentType: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  paymentTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTypeInfo: {
    flex: 1,
    marginLeft: 15,
  },
  paymentTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 3,
  },
  selectedPaymentTypeName: {
    color: COLORS.primary,
  },
  paymentTypeDescription: {
    fontSize: 12,
    color: COLORS.gray,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  textInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: COLORS.dark,
  },
  cardIcon: {
    marginRight: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  countryCode: {
    paddingLeft: 12,
    paddingRight: 8,
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '500',
  },
  phoneInput: {
    paddingLeft: 0,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 5,
  },
  mpesaInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: COLORS.info + '15',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
    marginBottom: 20,
  },
  mpesaInfoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.info,
    marginLeft: 10,
    lineHeight: 18,
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  selectedBankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankLogo: {
    width: 25,
    height: 25,
    borderRadius: 12,
    marginRight: 10,
  },
  selectedBankName: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '500',
  },
  bankSelectorPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray,
  },
  paypalInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    marginBottom: 20,
  },
  paypalInfoText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  paypalConnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#0070ba' + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0070ba',
  },
  paypalConnectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0070ba',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '50',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 16,
  },
  securitySection: {
    padding: 20,
    backgroundColor: COLORS.success + '10',
    margin: 20,
    borderRadius: 12,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 8,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.success,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bankModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  bankList: {
    paddingHorizontal: 20,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '50',
  },
  bankItemLogo: {
    width: 35,
    height: 35,
    borderRadius: 17,
    marginRight: 15,
  },
  bankItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
  bankItemCode: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
});

export default AddPaymentMethod;