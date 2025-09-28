import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Vibration,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { 
  Card,
  Button,
  Avatar,
  Surface,
  IconButton,
  Divider,
  List,
  Portal,
  Modal,
  TextInput,
  Chip,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const AccountManagement = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { profile } = useSelector(state => state.profile);

  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specialization: '',
  });
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailUpdates: true,
    sessionReminders: true,
    clientMessages: true,
    promotionalOffers: false,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    biometricAuth: false,
  });

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = useCallback(() => {
    if (user && profile) {
      setEditForm({
        name: profile.name || '',
        email: user.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        specialization: profile.specialization || '',
      });
    }
  }, [user, profile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call for refreshing account data
      setTimeout(() => {
        setRefreshing(false);
      }, 1500);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh account data');
    }
  }, []);

  const handleSaveProfile = useCallback(async () => {
    Vibration.vibrate(50);
    try {
      // Here you would dispatch an action to update the profile
      // dispatch(updateProfile(editForm));
      
      Alert.alert(
        'Profile Updated! 🎉',
        'Your profile changes have been saved successfully.',
        [{ text: 'OK', onPress: () => setShowEditModal(false) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  }, [editForm]);

  const handleSecurityUpdate = useCallback(async () => {
    Vibration.vibrate(50);
    try {
      // Here you would dispatch an action to update security settings
      // dispatch(updateSecuritySettings(securitySettings));
      
      Alert.alert(
        'Security Settings Updated! 🔒',
        'Your security preferences have been saved.',
        [{ text: 'OK', onPress: () => setShowSecurityModal(false) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update security settings.');
    }
  }, [securitySettings]);

  const handleNotificationUpdate = useCallback(async () => {
    Vibration.vibrate(50);
    try {
      // Here you would dispatch an action to update notification settings
      // dispatch(updateNotificationSettings(notifications));
      
      Alert.alert(
        'Notifications Updated! 🔔',
        'Your notification preferences have been saved.',
        [{ text: 'OK', onPress: () => setShowNotificationModal(false) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings.');
    }
  }, [notifications]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      '⚠️ Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data, training plans, and client connections.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Proceed',
                  style: 'destructive',
                  onPress: () => {
                    // Handle account deletion
                    Alert.alert('Feature in Development', 'Account deletion feature is being developed. Please contact support for assistance.');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  }, []);

  const renderProfileSection = () => (
    <Card style={styles.card}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.profileHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileInfo}>
          <Avatar.Image
            size={80}
            source={{ uri: profile?.avatar || 'https://via.placeholder.com/80' }}
            style={styles.avatar}
          />
          <View style={styles.profileDetails}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
              {profile?.name || 'Fitness Trainer'}
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
              {profile?.specialization || 'Personal Trainer'}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Clients</Text>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
                  {profile?.clientCount || 0}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Rating</Text>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
                  ⭐ {profile?.rating || '5.0'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <IconButton
          icon="edit"
          iconColor={COLORS.white}
          size={24}
          onPress={() => setShowEditModal(true)}
          style={styles.editButton}
        />
      </LinearGradient>
    </Card>
  );

  const renderAccountOptions = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Account Settings</Text>
        
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => setShowEditModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.optionLeft}>
            <Surface style={styles.optionIcon}>
              <Icon name="person" size={24} color={COLORS.primary} />
            </Surface>
            <View>
              <Text style={TEXT_STYLES.body}>Personal Information</Text>
              <Text style={TEXT_STYLES.caption}>Update your profile details</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => setShowSecurityModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.optionLeft}>
            <Surface style={styles.optionIcon}>
              <Icon name="security" size={24} color={COLORS.primary} />
            </Surface>
            <View>
              <Text style={TEXT_STYLES.body}>Security & Privacy</Text>
              <Text style={TEXT_STYLES.caption}>Manage your security settings</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => setShowNotificationModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.optionLeft}>
            <Surface style={styles.optionIcon}>
              <Icon name="notifications" size={24} color={COLORS.primary} />
            </Surface>
            <View>
              <Text style={TEXT_STYLES.body}>Notifications</Text>
              <Text style={TEXT_STYLES.caption}>Control your notification preferences</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => Alert.alert('Feature in Development', 'Subscription management is being developed.')}
          activeOpacity={0.7}
        >
          <View style={styles.optionLeft}>
            <Surface style={styles.optionIcon}>
              <Icon name="card-membership" size={24} color={COLORS.primary} />
            </Surface>
            <View>
              <Text style={TEXT_STYLES.body}>Subscription & Billing</Text>
              <Text style={TEXT_STYLES.caption}>Manage your subscription plan</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Divider style={styles.divider} />

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => Alert.alert('Feature in Development', 'Data export feature is being developed.')}
          activeOpacity={0.7}
        >
          <View style={styles.optionLeft}>
            <Surface style={styles.optionIcon}>
              <Icon name="download" size={24} color={COLORS.success} />
            </Surface>
            <View>
              <Text style={TEXT_STYLES.body}>Export My Data</Text>
              <Text style={TEXT_STYLES.caption}>Download your account data</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionItem}
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
        >
          <View style={styles.optionLeft}>
            <Surface style={[styles.optionIcon, { backgroundColor: COLORS.error + '20' }]}>
              <Icon name="delete-forever" size={24} color={COLORS.error} />
            </Surface>
            <View>
              <Text style={[TEXT_STYLES.body, { color: COLORS.error }]}>Delete Account</Text>
              <Text style={TEXT_STYLES.caption}>Permanently delete your account</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  const renderEditModal = () => (
    <Portal>
      <Modal
        visible={showEditModal}
        onDismiss={() => setShowEditModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView>
          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>Edit Profile</Text>
          
          <TextInput
            label="Full Name"
            value={editForm.name}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
            style={styles.input}
            left={<TextInput.Icon icon="person" />}
          />

          <TextInput
            label="Email Address"
            value={editForm.email}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
            style={styles.input}
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Phone Number"
            value={editForm.phone}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
            style={styles.input}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />

          <TextInput
            label="Specialization"
            value={editForm.specialization}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, specialization: text }))}
            style={styles.input}
            left={<TextInput.Icon icon="fitness-center" />}
          />

          <TextInput
            label="Bio"
            value={editForm.bio}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
            style={styles.input}
            multiline
            numberOfLines={4}
            left={<TextInput.Icon icon="description" />}
          />

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowEditModal(false)}
              style={[styles.modalButton, { marginRight: SPACING.md }]}
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
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderSecurityModal = () => (
    <Portal>
      <Modal
        visible={showSecurityModal}
        onDismiss={() => setShowSecurityModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView>
          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>Security Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={TEXT_STYLES.body}>Two-Factor Authentication</Text>
              <Text style={TEXT_STYLES.caption}>Add extra security to your account</Text>
            </View>
            <Switch
              value={securitySettings.twoFactorAuth}
              onValueChange={(value) => 
                setSecuritySettings(prev => ({ ...prev, twoFactorAuth: value }))
              }
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={TEXT_STYLES.body}>Login Alerts</Text>
              <Text style={TEXT_STYLES.caption}>Get notified of new device logins</Text>
            </View>
            <Switch
              value={securitySettings.loginAlerts}
              onValueChange={(value) => 
                setSecuritySettings(prev => ({ ...prev, loginAlerts: value }))
              }
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={TEXT_STYLES.body}>Biometric Authentication</Text>
              <Text style={TEXT_STYLES.caption}>Use fingerprint or face unlock</Text>
            </View>
            <Switch
              value={securitySettings.biometricAuth}
              onValueChange={(value) => 
                setSecuritySettings(prev => ({ ...prev, biometricAuth: value }))
              }
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <Button
            mode="outlined"
            onPress={() => Alert.alert('Feature in Development', 'Change password feature is being developed.')}
            style={styles.securityButton}
            icon="lock"
          >
            Change Password
          </Button>

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowSecurityModal(false)}
              style={[styles.modalButton, { marginRight: SPACING.md }]}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSecurityUpdate}
              style={styles.modalButton}
              buttonColor={COLORS.primary}
            >
              Save Settings
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderNotificationModal = () => (
    <Portal>
      <Modal
        visible={showNotificationModal}
        onDismiss={() => setShowNotificationModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView>
          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>Notification Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={TEXT_STYLES.body}>Push Notifications</Text>
              <Text style={TEXT_STYLES.caption}>Receive notifications on your device</Text>
            </View>
            <Switch
              value={notifications.pushNotifications}
              onValueChange={(value) => 
                setNotifications(prev => ({ ...prev, pushNotifications: value }))
              }
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={TEXT_STYLES.body}>Email Updates</Text>
              <Text style={TEXT_STYLES.caption}>Get important updates via email</Text>
            </View>
            <Switch
              value={notifications.emailUpdates}
              onValueChange={(value) => 
                setNotifications(prev => ({ ...prev, emailUpdates: value }))
              }
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={TEXT_STYLES.body}>Session Reminders</Text>
              <Text style={TEXT_STYLES.caption}>Get reminded about upcoming sessions</Text>
            </View>
            <Switch
              value={notifications.sessionReminders}
              onValueChange={(value) => 
                setNotifications(prev => ({ ...prev, sessionReminders: value }))
              }
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={TEXT_STYLES.body}>Client Messages</Text>
              <Text style={TEXT_STYLES.caption}>Get notified of new client messages</Text>
            </View>
            <Switch
              value={notifications.clientMessages}
              onValueChange={(value) => 
                setNotifications(prev => ({ ...prev, clientMessages: value }))
              }
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={TEXT_STYLES.body}>Promotional Offers</Text>
              <Text style={TEXT_STYLES.caption}>Receive special offers and promotions</Text>
            </View>
            <Switch
              value={notifications.promotionalOffers}
              onValueChange={(value) => 
                setNotifications(prev => ({ ...prev, promotionalOffers: value }))
              }
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowNotificationModal(false)}
              style={[styles.modalButton, { marginRight: SPACING.md }]}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleNotificationUpdate}
              style={styles.modalButton}
              buttonColor={COLORS.primary}
            >
              Save Settings
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        {renderProfileSection()}
        {renderAccountOptions()}
      </ScrollView>

      {renderEditModal()}
      {renderSecurityModal()}
      {renderNotificationModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  card: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 12,
  },
  profileHeader: {
    padding: SPACING.lg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: 'relative',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: SPACING.md,
  },
  profileDetails: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  stat: {
    marginRight: SPACING.lg,
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    backgroundColor: COLORS.primary + '20',
  },
  divider: {
    marginVertical: SPACING.md,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    borderRadius: 12,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  input: {
    marginBottom: SPACING.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flex: 1,
  },
  securityButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
});

export default AccountManagement;