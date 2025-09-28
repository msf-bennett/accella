import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Alert,
  Switch,
  Vibration,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { 
  Card,
  Button,
  Avatar,
  Surface,
  Portal,
  Modal,
  TextInput,
  Chip,
  Divider,
  List,
  IconButton,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import ImagePicker from 'react-native-image-picker';

// Import your established constants
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
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const AccountSettings = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailUpdates: true,
    trainingReminders: true,
    coachMessages: true,
    progressUpdates: false,
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showStats: true,
    showLocation: false,
  });
  
  // Modal states
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    sport: user?.sport || '',
    position: user?.position || '',
    experience: user?.experience || '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh user data
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchUserProfile());
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleNotificationToggle = (key) => {
    Vibration.vibrate(50);
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // dispatch(updateNotificationSettings({ [key]: !notifications[key] }));
  };

  const handlePrivacyToggle = (key) => {
    Vibration.vibrate(50);
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleProfileImagePicker = () => {
    const options = {
      title: 'Select Profile Photo',
      mediaType: 'photo',
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (!response.didCancel && !response.error) {
        // dispatch(updateProfileImage(response.uri));
        Alert.alert('Success', 'Profile photo updated! 📸');
      }
    });
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      // dispatch(updateUserProfile(profileForm));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEditProfileModal(false);
      Alert.alert('Success', 'Profile updated successfully! ✨');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // dispatch(changePassword(passwordForm));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setChangePasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password changed successfully! 🔒');
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // dispatch(deleteAccount());
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            // dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={{ paddingTop: StatusBar.currentHeight || 44 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.md,
        }}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, marginLeft: SPACING.sm }]}>
            Account Settings
          </Text>
          <IconButton
            icon="help-outline"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('Help', 'Need assistance? Contact support at support@app.com')}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
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
        {/* Profile Overview */}
        <Card style={{ margin: SPACING.md, elevation: 4 }}>
          <Card.Content style={{ alignItems: 'center', paddingVertical: SPACING.lg }}>
            <TouchableOpacity onPress={handleProfileImagePicker}>
              <View>
                <Avatar.Image
                  size={80}
                  source={user?.avatar ? { uri: user.avatar } : require('../../assets/default-avatar.png')}
                />
                <Surface style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  borderRadius: 16,
                  padding: 4,
                  backgroundColor: COLORS.primary,
                }}>
                  <MaterialIcons name="camera-alt" size={16} color="white" />
                </Surface>
              </View>
            </TouchableOpacity>
            
            <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md }]}>
              {user?.name || 'Athlete Name'}
            </Text>
            <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md }]}>
              {user?.sport || 'Sport'} • {user?.level || 'Beginner'}
            </Text>
            
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <Chip icon="edit" onPress={() => setEditProfileModal(true)}>
                Edit Profile
              </Chip>
              <Chip icon="lock" onPress={() => setChangePasswordModal(true)}>
                Password
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              📊 Your Progress
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>47</Text>
                <Text style={TEXT_STYLES.caption}>Workouts</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>89%</Text>
                <Text style={TEXT_STYLES.caption}>Completion</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>12</Text>
                <Text style={TEXT_STYLES.caption}>Streak</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Notifications */}
        <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              🔔 Notifications
            </Text>
            
            {Object.entries(notifications).map(([key, value]) => (
              <View key={key} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: SPACING.sm,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={TEXT_STYLES.body}>
                    {key === 'pushNotifications' && 'Push Notifications'}
                    {key === 'emailUpdates' && 'Email Updates'}
                    {key === 'trainingReminders' && 'Training Reminders'}
                    {key === 'coachMessages' && 'Coach Messages'}
                    {key === 'progressUpdates' && 'Progress Updates'}
                  </Text>
                  <Text style={TEXT_STYLES.small}>
                    {key === 'pushNotifications' && 'Receive push notifications'}
                    {key === 'emailUpdates' && 'Get updates via email'}
                    {key === 'trainingReminders' && 'Reminders for upcoming sessions'}
                    {key === 'coachMessages' && 'Notifications for coach messages'}
                    {key === 'progressUpdates' && 'Weekly progress summaries'}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={() => handleNotificationToggle(key)}
                  thumbColor={value ? COLORS.primary : COLORS.border}
                  trackColor={{ false: COLORS.border, true: `${COLORS.primary}40` }}
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Privacy & Security */}
        <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              🔒 Privacy & Security
            </Text>
            
            <List.Item
              title="Profile Visibility"
              description={privacy.profileVisibility === 'public' ? 'Public profile' : 'Private profile'}
              left={() => <List.Icon icon="visibility" />}
              right={() => (
                <Switch
                  value={privacy.profileVisibility === 'public'}
                  onValueChange={() => handlePrivacyToggle('profileVisibility')}
                  thumbColor={privacy.profileVisibility === 'public' ? COLORS.primary : COLORS.border}
                />
              )}
            />
            
            <List.Item
              title="Show Statistics"
              description="Allow others to see your performance stats"
              left={() => <List.Icon icon="bar-chart" />}
              right={() => (
                <Switch
                  value={privacy.showStats}
                  onValueChange={() => handlePrivacyToggle('showStats')}
                  thumbColor={privacy.showStats ? COLORS.primary : COLORS.border}
                />
              )}
            />
            
            <List.Item
              title="Location Services"
              description="Share location for finding nearby facilities"
              left={() => <List.Icon icon="location-on" />}
              right={() => (
                <Switch
                  value={privacy.showLocation}
                  onValueChange={() => handlePrivacyToggle('showLocation')}
                  thumbColor={privacy.showLocation ? COLORS.primary : COLORS.border}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              ⚙️ Account Actions
            </Text>
            
            <List.Item
              title="Export Data"
              description="Download your training data"
              left={() => <List.Icon icon="download" />}
              onPress={() => Alert.alert('Feature Coming Soon', 'Data export will be available in a future update! 📦')}
            />
            
            <List.Item
              title="Support & Feedback"
              description="Get help or send feedback"
              left={() => <List.Icon icon="support-agent" />}
              onPress={() => Alert.alert('Support', 'Contact us at support@app.com for assistance! 🤝')}
            />
            
            <List.Item
              title="Terms & Privacy Policy"
              description="Review our terms and policies"
              left={() => <List.Icon icon="gavel" />}
              onPress={() => Alert.alert('Legal', 'Legal documents will open in browser! 📄')}
            />
            
            <Divider style={{ marginVertical: SPACING.sm }} />
            
            <List.Item
              title="Logout"
              description="Sign out of your account"
              left={() => <List.Icon icon="logout" />}
              titleStyle={{ color: COLORS.warning }}
              onPress={handleLogout}
            />
            
            <List.Item
              title="Delete Account"
              description="Permanently delete your account"
              left={() => <List.Icon icon="delete-forever" />}
              titleStyle={{ color: COLORS.error }}
              onPress={() => setDeleteAccountModal(true)}
            />
          </Card.Content>
        </Card>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={editProfileModal}
          onDismiss={() => setEditProfileModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 12,
            padding: SPACING.lg,
            maxHeight: '80%',
          }}
        >
          <ScrollView>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg }]}>
              ✏️ Edit Profile
            </Text>
            
            <TextInput
              label="Full Name"
              value={profileForm.name}
              onChangeText={(text) => setProfileForm(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
            />
            
            <TextInput
              label="Email"
              value={profileForm.email}
              onChangeText={(text) => setProfileForm(prev => ({ ...prev, email: text }))}
              mode="outlined"
              keyboardType="email-address"
              style={{ marginBottom: SPACING.md }}
            />
            
            <TextInput
              label="Phone"
              value={profileForm.phone}
              onChangeText={(text) => setProfileForm(prev => ({ ...prev, phone: text }))}
              mode="outlined"
              keyboardType="phone-pad"
              style={{ marginBottom: SPACING.md }}
            />
            
            <TextInput
              label="Bio"
              value={profileForm.bio}
              onChangeText={(text) => setProfileForm(prev => ({ ...prev, bio: text }))}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginBottom: SPACING.md }}
            />
            
            <TextInput
              label="Primary Sport"
              value={profileForm.sport}
              onChangeText={(text) => setProfileForm(prev => ({ ...prev, sport: text }))}
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
            />
            
            <TextInput
              label="Position"
              value={profileForm.position}
              onChangeText={(text) => setProfileForm(prev => ({ ...prev, position: text }))}
              mode="outlined"
              style={{ marginBottom: SPACING.lg }}
            />
            
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <Button
                mode="outlined"
                onPress={() => setEditProfileModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveProfile}
                loading={loading}
                style={{ flex: 1 }}
                buttonColor={COLORS.primary}
              >
                Save
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Change Password Modal */}
      <Portal>
        <Modal
          visible={changePasswordModal}
          onDismiss={() => setChangePasswordModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 12,
            padding: SPACING.lg,
          }}
        >
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg }]}>
            🔒 Change Password
          </Text>
          
          <TextInput
            label="Current Password"
            value={passwordForm.currentPassword}
            onChangeText={(text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
            mode="outlined"
            secureTextEntry
            style={{ marginBottom: SPACING.md }}
          />
          
          <TextInput
            label="New Password"
            value={passwordForm.newPassword}
            onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
            mode="outlined"
            secureTextEntry
            style={{ marginBottom: SPACING.md }}
          />
          
          <TextInput
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
            mode="outlined"
            secureTextEntry
            style={{ marginBottom: SPACING.lg }}
          />
          
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <Button
              mode="outlined"
              onPress={() => setChangePasswordModal(false)}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleChangePassword}
              loading={loading}
              style={{ flex: 1 }}
              buttonColor={COLORS.primary}
            >
              Update
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Delete Account Modal */}
      <Portal>
        <Modal
          visible={deleteAccountModal}
          onDismiss={() => setDeleteAccountModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 12,
            padding: SPACING.lg,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
            <MaterialIcons name="warning" size={48} color={COLORS.error} />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.error, textAlign: 'center', marginTop: SPACING.md }]}>
              Delete Account?
            </Text>
            <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
              This action cannot be undone. All your training data, progress, and connections will be permanently deleted.
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <Button
              mode="outlined"
              onPress={() => setDeleteAccountModal(false)}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleDeleteAccount}
              style={{ flex: 1 }}
              buttonColor={COLORS.error}
            >
              Delete
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default AccountSettings;