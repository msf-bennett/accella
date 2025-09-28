import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  Vibration,
  Dimensions,
  TouchableOpacity,
  Share,
  Linking,
} from 'react-native';
import { 
  Card,
  Button,
  Switch,
  List,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Modal,
  TextInput,
  Divider,
  RadioButton,
  Chip,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#FF6B35',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const TrainerSettings = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const { user, preferences } = useSelector(state => state.auth);
  const { trainerData, businessSettings } = useSelector(state => state.trainer);

  // Local state
  const [settings, setSettings] = useState({
    // Notification settings
    pushNotifications: true,
    emailNotifications: true,
    sessionReminders: true,
    paymentAlerts: true,
    clientMessages: true,
    
    // Privacy settings
    showOnlineStatus: true,
    shareLocation: false,
    publicProfile: true,
    allowClientReviews: true,
    
    // Business settings
    autoAcceptBookings: false,
    requireDeposit: true,
    allowCancellations: true,
    cancellationHours: 24,
    
    // App preferences
    darkMode: false,
    language: 'en',
    currency: 'USD',
    timeFormat: '12h',
    dateFormat: 'MM/DD/YYYY',
  });

  const [showModal, setShowModal] = useState('');
  const [tempValue, setTempValue] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  ];

  const trainerProfile = {
    name: 'Alex Rodriguez',
    email: 'alex.rodriguez@email.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-01-15',
    totalEarnings: 15420,
    sessionsCompleted: 856,
  };

  // Effects
  useEffect(() => {
    startAnimations();
    loadSettings();
  }, []);

  // Animation functions
  const startAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Data loading functions
  const loadSettings = useCallback(async () => {
    try {
      console.log('Loading user settings...');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, [dispatch]);

  // Handler functions
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    Vibration.vibrate(30);
    saveSettingToServer(key, value);
  };

  const saveSettingToServer = async (key, value) => {
    try {
      console.log(`Saving setting: ${key} = ${value}`);
    } catch (error) {
      console.error('Error saving setting:', error);
      Alert.alert('Error', 'Failed to save setting');
    }
  };

  const handleAccountSettings = () => {
    Vibration.vibrate(50);
    navigation.navigate('AccountSettings');
  };

  const handleBusinessSettings = () => {
    Vibration.vibrate(50);
    navigation.navigate('BusinessSettings');
  };

  const handlePaymentSettings = () => {
    Vibration.vibrate(50);
    navigation.navigate('PaymentSettings');
  };

  const handlePrivacyPolicy = () => {
    Vibration.vibrate(50);
    Linking.openURL('https://yourapp.com/privacy-policy');
  };

  const handleTermsOfService = () => {
    Vibration.vibrate(50);
    Linking.openURL('https://yourapp.com/terms-of-service');
  };

  const handleContactSupport = () => {
    Vibration.vibrate(50);
    Alert.alert(
      'Contact Support',
      'How would you like to contact us?',
      [
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@yourapp.com'),
        },
        {
          text: 'Phone',
          onPress: () => Linking.openURL('tel:+1234567890'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      Vibration.vibrate(50);
      await Share.share({
        message: 'Check out this amazing fitness training app! Download it now and start your fitness journey.',
        url: 'https://yourapp.com/download',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleRateApp = () => {
    Vibration.vibrate(50);
    Alert.alert(
      'Rate Our App',
      'Would you like to rate our app on the App Store?',
      [
        {
          text: 'Rate Now',
          onPress: () => Linking.openURL('https://apps.apple.com/app/yourapp'),
        },
        { text: 'Later', style: 'cancel' },
      ]
    );
  };

  const handleExportData = () => {
    Vibration.vibrate(50);
    Alert.alert(
      'Export Data',
      'This will export all your training data and client information. Continue?',
      [
        {
          text: 'Export',
          onPress: async () => {
            try {
              Alert.alert('Success', 'Data export has been sent to your email!');
            } catch (error) {
              Alert.alert('Error', 'Failed to export data');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Vibration.vibrate(100);
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      Alert.alert('Account Deleted', 'Your account has been deleted.');
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete account');
                    }
                  },
                },
              ]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    Vibration.vibrate(50);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Logout',
          onPress: async () => {
            try {
              Alert.alert('Logged Out', 'You have been successfully logged out.');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showLanguageModal = () => {
    setSelectedLanguage(settings.language);
    setShowModal('language');
  };

  const showCurrencyModal = () => {
    setSelectedCurrency(settings.currency);
    setShowModal('currency');
  };

  const showCancellationModal = () => {
    setTempValue(settings.cancellationHours.toString());
    setShowModal('cancellation');
  };

  const saveLanguageSetting = () => {
    handleSettingChange('language', selectedLanguage);
    setShowModal('');
  };

  const saveCurrencySetting = () => {
    handleSettingChange('currency', selectedCurrency);
    setShowModal('');
  };

  const saveCancellationSetting = () => {
    const hours = parseInt(tempValue);
    if (hours > 0 && hours <= 168) {
      handleSettingChange('cancellationHours', hours);
      setShowModal('');
    } else {
      Alert.alert('Error', 'Please enter a valid number of hours (1-168)');
    }
  };

  // Render header
  const renderHeader = () => (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Animated.View
        style={[
          styles.headerContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <IconButton
          icon="arrow-back"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>
    </LinearGradient>
  );

  const renderAccountSection = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Account</Text>
        <View style={styles.accountInfo}>
          <Avatar.Image size={60} source={{ uri: trainerProfile.avatar }} />
          <View style={styles.accountDetails}>
            <Text style={TEXT_STYLES.body}>{trainerProfile.name}</Text>
            <Text style={TEXT_STYLES.caption}>{trainerProfile.email}</Text>
            <Text style={TEXT_STYLES.small}>
              Member since {new Date(trainerProfile.joinDate).toLocaleDateString()}
            </Text>
          </View>
          <IconButton icon="edit" size={20} onPress={handleAccountSettings} />
        </View>
      </Card.Content>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="notifications" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Push Notifications</Text>
              <Text style={TEXT_STYLES.caption}>Receive app notifications</Text>
            </View>
          </View>
          <Switch
            value={settings.pushNotifications}
            onValueChange={(value) => handleSettingChange('pushNotifications', value)}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="email" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Email Notifications</Text>
              <Text style={TEXT_STYLES.caption}>Receive email updates</Text>
            </View>
          </View>
          <Switch
            value={settings.emailNotifications}
            onValueChange={(value) => handleSettingChange('emailNotifications', value)}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="schedule" size={24} color={COLORS.success} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Session Reminders</Text>
              <Text style={TEXT_STYLES.caption}>Get reminded before sessions</Text>
            </View>
          </View>
          <Switch
            value={settings.sessionReminders}
            onValueChange={(value) => handleSettingChange('sessionReminders', value)}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="payment" size={24} color={COLORS.accent} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Payment Alerts</Text>
              <Text style={TEXT_STYLES.caption}>Get notified about payments</Text>
            </View>
          </View>
          <Switch
            value={settings.paymentAlerts}
            onValueChange={(value) => handleSettingChange('paymentAlerts', value)}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="message" size={24} color={COLORS.warning} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Client Messages</Text>
              <Text style={TEXT_STYLES.caption}>Receive client message alerts</Text>
            </View>
          </View>
          <Switch
            value={settings.clientMessages}
            onValueChange={(value) => handleSettingChange('clientMessages', value)}
            color={COLORS.primary}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderPrivacySettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Privacy & Security</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="visibility" size={24} color={COLORS.success} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Show Online Status</Text>
              <Text style={TEXT_STYLES.caption}>Let clients see when you're online</Text>
            </View>
          </View>
          <Switch
            value={settings.showOnlineStatus}
            onValueChange={(value) => handleSettingChange('showOnlineStatus', value)}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="location-on" size={24} color={COLORS.error} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Share Location</Text>
              <Text style={TEXT_STYLES.caption}>Help clients find you easier</Text>
            </View>
          </View>
          <Switch
            value={settings.shareLocation}
            onValueChange={(value) => handleSettingChange('shareLocation', value)}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="public" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Public Profile</Text>
              <Text style={TEXT_STYLES.caption}>Make your profile discoverable</Text>
            </View>
          </View>
          <Switch
            value={settings.publicProfile}
            onValueChange={(value) => handleSettingChange('publicProfile', value)}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="rate-review" size={24} color={COLORS.warning} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Allow Client Reviews</Text>
              <Text style={TEXT_STYLES.caption}>Let clients review your services</Text>
            </View>
          </View>
          <Switch
            value={settings.allowClientReviews}
            onValueChange={(value) => handleSettingChange('allowClientReviews', value)}
            color={COLORS.primary}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderBusinessSettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Business Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="auto-awesome" size={24} color={COLORS.success} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Auto Accept Bookings</Text>
              <Text style={TEXT_STYLES.caption}>Automatically accept new bookings</Text>
            </View>
          </View>
          <Switch
            value={settings.autoAcceptBookings}
            onValueChange={(value) => handleSettingChange('autoAcceptBookings', value)}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="account-balance" size={24} color={COLORS.accent} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Require Deposit</Text>
              <Text style={TEXT_STYLES.caption}>Require upfront payment</Text>
            </View>
          </View>
          <Switch
            value={settings.requireDeposit}
            onValueChange={(value) => handleSettingChange('requireDeposit', value)}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="cancel" size={24} color={COLORS.error} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Allow Cancellations</Text>
              <Text style={TEXT_STYLES.caption}>Let clients cancel sessions</Text>
            </View>
          </View>
          <Switch
            value={settings.allowCancellations}
            onValueChange={(value) => handleSettingChange('allowCancellations', value)}
            color={COLORS.primary}
          />
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={showCancellationModal}>
          <View style={styles.settingInfo}>
            <Icon name="access-time" size={24} color={COLORS.warning} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Cancellation Notice</Text>
              <Text style={TEXT_STYLES.caption}>
                {settings.cancellationHours} hours notice required
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  const renderAppPreferences = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>App Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="dark-mode" size={24} color={COLORS.text} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Dark Mode</Text>
              <Text style={TEXT_STYLES.caption}>Switch to dark theme</Text>
            </View>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => handleSettingChange('darkMode', value)}
            color={COLORS.primary}
          />
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={showLanguageModal}>
          <View style={styles.settingInfo}>
            <Icon name="language" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Language</Text>
              <Text style={TEXT_STYLES.caption}>
                {languages.find(l => l.code === settings.language)?.name || 'English'}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={showCurrencyModal}>
          <View style={styles.settingInfo}>
            <Icon name="attach-money" size={24} color={COLORS.success} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Currency</Text>
              <Text style={TEXT_STYLES.caption}>
                {currencies.find(c => c.code === settings.currency)?.name || 'US Dollar'}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="access-time" size={24} color={COLORS.warning} />
            <View style={styles.settingText}>
              <Text style={TEXT_STYLES.body}>Time Format</Text>
              <Text style={TEXT_STYLES.caption}>
                {settings.timeFormat === '12h' ? '12 Hour' : '24 Hour'}
              </Text>
            </View>
          </View>
          <Switch
            value={settings.timeFormat === '24h'}
            onValueChange={(value) => handleSettingChange('timeFormat', value ? '24h' : '12h')}
            color={COLORS.primary}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Quick Actions</Text>
        
        <List.Item
          title="Business Settings"
          description="Manage your business profile"
          left={(props) => <Icon name="business" size={24} color={COLORS.primary} {...props} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleBusinessSettings}
          style={styles.listItem}
        />

        <List.Item
          title="Payment Settings"
          description="Configure payment methods"
          left={(props) => <Icon name="payment" size={24} color={COLORS.accent} {...props} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={handlePaymentSettings}
          style={styles.listItem}
        />

        <List.Item
          title="Export Data"
          description="Download your training data"
          left={(props) => <Icon name="file-download" size={24} color={COLORS.success} {...props} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleExportData}
          style={styles.listItem}
        />

        <List.Item
          title="Share App"
          description="Invite others to join"
          left={(props) => <Icon name="share" size={24} color={COLORS.warning} {...props} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleShareApp}
          style={styles.listItem}
        />
      </Card.Content>
    </Card>
  );

  const renderSupportSection = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Support & Legal</Text>
        
        <List.Item
          title="Contact Support"
          description="Get help with your account"
          left={(props) => <Icon name="support-agent" size={24} color={COLORS.primary} {...props} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleContactSupport}
          style={styles.listItem}
        />

        <List.Item
          title="Rate App"
          description="Rate us on the App Store"
          left={(props) => <Icon name="star-rate" size={24} color={COLORS.warning} {...props} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleRateApp}
          style={styles.listItem}
        />

        <List.Item
          title="Privacy Policy"
          description="Read our privacy policy"
          left={(props) => <Icon name="privacy-tip" size={24} color={COLORS.success} {...props} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={handlePrivacyPolicy}
          style={styles.listItem}
        />

        <List.Item
          title="Terms of Service"
          description="Read our terms of service"
          left={(props) => <Icon name="description" size={24} color={COLORS.textSecondary} {...props} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={handleTermsOfService}
          style={styles.listItem}
        />
      </Card.Content>
    </Card>
  );

  const renderDangerZone = () => (
    <Card style={[styles.card, { borderColor: COLORS.error, borderWidth: 1 }]}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.error }]}>
          Danger Zone
        </Text>
        
        <Button
          mode="outlined"
          onPress={handleLogout}
          textColor={COLORS.error}
          style={[styles.dangerButton, { borderColor: COLORS.error }]}
          icon="logout"
        >
          Logout
        </Button>

        <Button
          mode="outlined"
          onPress={handleDeleteAccount}
          textColor={COLORS.error}
          style={[styles.dangerButton, { borderColor: COLORS.error }]}
          icon="delete-forever"
        >
          Delete Account
        </Button>
      </Card.Content>
    </Card>
  );

  const renderVersionInfo = () => (
    <View style={styles.versionContainer}>
      <Text style={[TEXT_STYLES.small, { textAlign: 'center' }]}>
        FitTrainer Pro v2.1.0
      </Text>
      <Text style={[TEXT_STYLES.small, { textAlign: 'center', marginTop: SPACING.xs }]}>
        © 2024 Your Company. All rights reserved.
      </Text>
      <Text style={[TEXT_STYLES.small, { textAlign: 'center', marginTop: SPACING.xs }]}>
        Build 2024.08.21
      </Text>
    </View>
  );

  const renderModals = () => (
    <Portal>
      {/* Language Selection Modal */}
      <Modal
        visible={showModal === 'language'}
        onDismiss={() => setShowModal('')}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.modalCard}>
          <Card.Title title="Select Language" />
          <Card.Content>
            <ScrollView style={styles.modalScrollView}>
              <RadioButton.Group
                onValueChange={setSelectedLanguage}
                value={selectedLanguage}
              >
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={styles.radioItem}
                    onPress={() => setSelectedLanguage(lang.code)}
                  >
                    <View style={styles.radioContent}>
                      <Text style={styles.flagText}>{lang.flag}</Text>
                      <Text style={TEXT_STYLES.body}>{lang.name}</Text>
                    </View>
                    <RadioButton value={lang.code} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => setShowModal('')}>Cancel</Button>
            <Button mode="contained" onPress={saveLanguageSetting}>
              Save
            </Button>
          </Card.Actions>
        </Card>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal
        visible={showModal === 'currency'}
        onDismiss={() => setShowModal('')}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.modalCard}>
          <Card.Title title="Select Currency" />
          <Card.Content>
            <ScrollView style={styles.modalScrollView}>
              <RadioButton.Group
                onValueChange={setSelectedCurrency}
                value={selectedCurrency}
              >
                {currencies.map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    style={styles.radioItem}
                    onPress={() => setSelectedCurrency(currency.code)}
                  >
                    <View style={styles.radioContent}>
                      <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                      <View>
                        <Text style={TEXT_STYLES.body}>{currency.name}</Text>
                        <Text style={TEXT_STYLES.caption}>{currency.code}</Text>
                      </View>
                    </View>
                    <RadioButton value={currency.code} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => setShowModal('')}>Cancel</Button>
            <Button mode="contained" onPress={saveCurrencySetting}>
              Save
            </Button>
          </Card.Actions>
        </Card>
      </Modal>

      {/* Cancellation Hours Modal */}
      <Modal
        visible={showModal === 'cancellation'}
        onDismiss={() => setShowModal('')}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.modalCard}>
          <Card.Title title="Cancellation Notice" />
          <Card.Content>
            <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md }]}>
              Set how many hours in advance clients must cancel sessions
            </Text>
            <TextInput
              label="Hours"
              value={tempValue}
              onChangeText={setTempValue}
              mode="outlined"
              keyboardType="numeric"
              placeholder="24"
              style={styles.textInput}
            />
            <Text style={TEXT_STYLES.small}>
              Recommended: 24 hours for individual sessions, 48+ hours for group sessions
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => setShowModal('')}>Cancel</Button>
            <Button mode="contained" onPress={saveCancellationSetting}>
              Save
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderAccountSection()}
        {renderNotificationSettings()}
        {renderPrivacySettings()}
        {renderBusinessSettings()}
        {renderAppPreferences()}
        {renderQuickActions()}
        {renderSupportSection()}
        {renderDangerZone()}
        {renderVersionInfo()}
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
      {renderModals()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    margin: 0,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.background,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  listItem: {
    paddingHorizontal: 0,
  },
  dangerButton: {
    marginBottom: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    borderRadius: 12,
  },
  modalScrollView: {
    maxHeight: height * 0.4,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.background,
  },
  radioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagText: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SPACING.md,
    width: 30,
    textAlign: 'center',
  },
  textInput: {
    marginBottom: SPACING.md,
  },
  versionContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default TrainerSettings;