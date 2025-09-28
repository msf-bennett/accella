import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Vibration,
  Animated,
  Platform,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { 
  Card,
  Button,
  Text,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Modal,
  TextInput,
  Chip,
  Switch,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { BlurView } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
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
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};

const { width: screenWidth } = Dimensions.get('window');

const AccountManagement = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isLoading = useSelector(state => state.ui.isLoading);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    specialization: user?.specialization || [],
    experience: user?.experience || '',
    location: user?.location || '',
  });
  const [businessSettings, setBusinessSettings] = useState({
    hourlyRate: user?.hourlyRate || '',
    currency: user?.currency || 'USD',
    availability: user?.availability || 'Available',
    autoAcceptBookings: user?.autoAcceptBookings || false,
    notifications: {
      bookings: true,
      messages: true,
      reviews: true,
      marketing: false,
    },
  });
  const [activeSection, setActiveSection] = useState('profile');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchUserProfile());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh profile data');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleSaveProfile = useCallback(async () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      Alert.alert('Validation Error', 'First name and last name are required');
      return;
    }

    try {
      Vibration.vibrate(100);
      // dispatch(updateUserProfile(profileData));
      setEditModalVisible(false);
      Alert.alert('Success! 🎉', 'Your profile has been updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  }, [profileData]);

  const handleBusinessSettingsUpdate = useCallback(async (newSettings) => {
    try {
      setBusinessSettings(newSettings);
      // dispatch(updateBusinessSettings(newSettings));
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Error', 'Failed to update business settings');
    }
  }, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Feature Coming Soon! 🚧',
              'Account deletion functionality is currently under development.'
            );
          },
        },
      ]
    );
  }, []);

  const renderProfileHeader = () => (
    <Surface style={styles.profileHeader} elevation={2}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Avatar.Image
            size={80}
            source={{ uri: user?.avatar || 'https://via.placeholder.com/80' }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: SPACING.xs }]}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
              🏆 Level {user?.level || 5} Coach
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user?.totalClients || 24}</Text>
                <Text style={styles.statLabel}>Clients</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user?.rating || '4.8'}⭐</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user?.completedSessions || 156}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderSectionTabs = () => (
    <View style={styles.tabContainer}>
      {['profile', 'business', 'privacy', 'support'].map((section, index) => (
        <TouchableOpacity
          key={section}
          style={[
            styles.tab,
            activeSection === section && styles.activeTab
          ]}
          onPress={() => {
            setActiveSection(section);
            Vibration.vibrate(30);
          }}
        >
          <MaterialIcons
            name={
              section === 'profile' ? 'person' :
              section === 'business' ? 'business' :
              section === 'privacy' ? 'security' : 'support'
            }
            size={20}
            color={activeSection === section ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[
            styles.tabText,
            activeSection === section && styles.activeTabText
          ]}>
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderProfileSection = () => (
    <View style={styles.section}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
              Personal Information 👤
            </Text>
            <IconButton
              icon="edit"
              iconColor={COLORS.primary}
              onPress={() => {
                setEditModalVisible(true);
                Vibration.vibrate(50);
              }}
            />
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>{user?.email || 'coach@example.com'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>{user?.phone || '+1 (555) 123-4567'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>{user?.location || 'New York, NY'}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.md }]}>
            Specializations 🎯
          </Text>
          <View style={styles.chipContainer}>
            {(user?.specialization || ['Football', 'Fitness', 'Youth Training']).map((spec, index) => (
              <Chip
                key={index}
                mode="outlined"
                style={styles.chip}
                textStyle={{ color: COLORS.primary }}
              >
                {spec}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.md }]}>
            Experience 💪
          </Text>
          <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
            {user?.bio || '5+ years of professional coaching experience in football and fitness training. Specialized in youth development and performance optimization.'}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderBusinessSection = () => (
    <View style={styles.section}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.md }]}>
            Pricing & Availability 💰
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.text }]}>Hourly Rate</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                ${businessSettings.hourlyRate || '50'}/hour
              </Text>
            </View>
            <IconButton
              icon="edit"
              iconColor={COLORS.primary}
              onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Rate editing will be available soon.')}
            />
          </View>

          <Divider style={{ marginVertical: SPACING.md }} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.text }]}>Auto-accept Bookings</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Automatically accept session requests
              </Text>
            </View>
            <Switch
              value={businessSettings.autoAcceptBookings}
              onValueChange={(value) => {
                handleBusinessSettingsUpdate({
                  ...businessSettings,
                  autoAcceptBookings: value
                });
              }}
              color={COLORS.primary}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.md }]}>
            Revenue Analytics 📊
          </Text>
          
          <View style={styles.revenueStats}>
            <View style={styles.revenueStat}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>$2,450</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>This Month</Text>
            </View>
            <View style={styles.revenueStat}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>$28,600</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>This Year</Text>
            </View>
          </View>
          
          <ProgressBar
            progress={0.75}
            color={COLORS.success}
            style={styles.progressBar}
          />
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, textAlign: 'center' }]}>
            75% of monthly goal reached 🎯
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderPrivacySection = () => (
    <View style={styles.section}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.md }]}>
            Notification Settings 🔔
          </Text>
          
          {Object.entries(businessSettings.notifications).map(([key, value]) => (
            <View key={key} style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[TEXT_STYLES.body, { color: COLORS.text }]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Receive {key} notifications
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={(newValue) => {
                  const newNotifications = {
                    ...businessSettings.notifications,
                    [key]: newValue
                  };
                  handleBusinessSettingsUpdate({
                    ...businessSettings,
                    notifications: newNotifications
                  });
                }}
                color={COLORS.primary}
              />
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.md }]}>
            Privacy & Security 🔒
          </Text>
          
          <Button
            mode="outlined"
            icon="lock"
            onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Password change functionality is being developed.')}
            style={styles.actionButton}
          >
            Change Password
          </Button>
          
          <Button
            mode="outlined"
            icon="security"
            onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Two-factor authentication setup will be available soon.')}
            style={styles.actionButton}
          >
            Enable Two-Factor Auth
          </Button>
          
          <Button
            mode="outlined"
            icon="download"
            onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Data export functionality is under development.')}
            style={styles.actionButton}
          >
            Download My Data
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  const renderSupportSection = () => (
    <View style={styles.section}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.md }]}>
            Help & Support 🆘
          </Text>
          
          <Button
            mode="outlined"
            icon="help"
            onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Help center integration is being developed.')}
            style={styles.actionButton}
          >
            Help Center
          </Button>
          
          <Button
            mode="outlined"
            icon="email"
            onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Direct support messaging will be available soon.')}
            style={styles.actionButton}
          >
            Contact Support
          </Button>
          
          <Button
            mode="outlined"
            icon="star"
            onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'App rating functionality is under development.')}
            style={styles.actionButton}
          >
            Rate Our App
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { borderColor: COLORS.error, borderWidth: 1 }]}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.error, marginBottom: SPACING.md }]}>
            Danger Zone ⚠️
          </Text>
          
          <Button
            mode="outlined"
            icon="delete"
            textColor={COLORS.error}
            style={[styles.actionButton, { borderColor: COLORS.error }]}
            onPress={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  const renderEditModal = () => (
    <Portal>
      <Modal
        visible={editModalVisible}
        onDismiss={() => setEditModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.lg }]}>
                Edit Profile ✏️
              </Text>
              
              <TextInput
                label="First Name"
                value={profileData.firstName}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Last Name"
                value={profileData.lastName}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Phone"
                value={profileData.phone}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />
              
              <TextInput
                label="Location"
                value={profileData.location}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, location: text }))}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Bio"
                value={profileData.bio}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
              />
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setEditModalVisible(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                >
                  Save Changes
                </Button>
              </View>
            </Card.Content>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'business':
        return renderBusinessSection();
      case 'privacy':
        return renderPrivacySection();
      case 'support':
        return renderSupportSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              title="Updating profile..."
              titleColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderProfileHeader()}
          {renderSectionTabs()}
          {renderCurrentSection()}
        </ScrollView>
      </Animated.View>
      
      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  profileHeader: {
    marginBottom: SPACING.md,
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + SPACING.lg : SPACING.xl * 2,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  statNumber: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.small,
    color: 'rgba(255,255,255,0.8)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: SPACING.sm,
    padding: SPACING.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: SPACING.xs,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  infoText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    marginBottom: SPACING.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  settingInfo: {
    flex: 1,
  },
  revenueStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  revenueStat: {
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    maxHeight: '80%',
  },
  input: {
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 0.45,
  },
});

export default AccountManagement;