import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import {
  Card,
  Button,
  Avatar,
  Surface,
  IconButton,
  Switch,
  Portal,
  Modal,
  TextInput,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const AccountManagement = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const subscription = useSelector(state => state.subscription.current);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notifications, setNotifications] = useState({
    training: true,
    achievements: true,
    social: false,
    marketing: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    statsVisible: true,
    workoutsVisible: false,
  });
  
  const slideAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh user data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dispatch refresh action
      // dispatch(refreshUserData());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh account data');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleLogout = () => {
    Alert.alert(
      '🚪 Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            Vibration.vibrate(50);
            // dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
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
            setShowDeleteModal(true);
            Vibration.vibrate([100, 50, 100]);
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleNotificationToggle = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
    Vibration.vibrate(25);
  };

  const handlePrivacyToggle = (type) => {
    setPrivacy(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
    Vibration.vibrate(25);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={styles.headerRight} />
      </View>
    </LinearGradient>
  );

  const renderAccountSection = () => (
    <Animated.View
      style={[
        styles.section,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="person" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Account Information</Text>
          </View>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.settingLeft}>
              <Avatar.Text
                size={48}
                label={user?.name?.charAt(0) || 'U'}
                style={{ backgroundColor: COLORS.primary }}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleChangePassword}
          >
            <View style={styles.settingLeft}>
              <Icon name="lock" size={24} color={COLORS.textSecondary} />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('SubscriptionManagement')}
          >
            <View style={styles.settingLeft}>
              <Icon name="star" size={24} color={COLORS.secondary} />
              <View>
                <Text style={styles.settingText}>Subscription</Text>
                <Text style={styles.subscriptionStatus}>
                  {subscription?.plan || 'Free Plan'} • {subscription?.status || 'Active'}
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderNotificationSection = () => (
    <Animated.View
      style={[
        styles.section,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [40, 0],
            }),
          }],
        },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="notifications" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="fitness-center" size={24} color={COLORS.success} />
              <View>
                <Text style={styles.settingText}>Training Reminders</Text>
                <Text style={styles.settingSubtext}>Get notified about upcoming sessions</Text>
              </View>
            </View>
            <Switch
              value={notifications.training}
              onValueChange={() => handleNotificationToggle('training')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="jump-rope" size={24} color={COLORS.secondary} />
              <View>
                <Text style={styles.settingText}>Achievements & Progress</Text>
                <Text style={styles.settingSubtext}>Celebrate your milestones</Text>
              </View>
            </View>
            <Switch
              value={notifications.achievements}
              onValueChange={() => handleNotificationToggle('achievements')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="group" size={24} color={COLORS.info} />
              <View>
                <Text style={styles.settingText}>Social Updates</Text>
                <Text style={styles.settingSubtext}>Friend activities and challenges</Text>
              </View>
            </View>
            <Switch
              value={notifications.social}
              onValueChange={() => handleNotificationToggle('social')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="campaign" size={24} color={COLORS.warning} />
              <View>
                <Text style={styles.settingText}>Marketing & Tips</Text>
                <Text style={styles.settingSubtext}>Health tips and app updates</Text>
              </View>
            </View>
            <Switch
              value={notifications.marketing}
              onValueChange={() => handleNotificationToggle('marketing')}
              color={COLORS.primary}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderPrivacySection = () => (
    <Animated.View
      style={[
        styles.section,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [60, 0],
            }),
          }],
        },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="security" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="visibility" size={24} color={COLORS.success} />
              <View>
                <Text style={styles.settingText}>Public Profile</Text>
                <Text style={styles.settingSubtext}>Let others find your profile</Text>
              </View>
            </View>
            <Switch
              value={privacy.profileVisible}
              onValueChange={() => handlePrivacyToggle('profileVisible')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="analytics" size={24} color={COLORS.info} />
              <View>
                <Text style={styles.settingText}>Share Statistics</Text>
                <Text style={styles.settingSubtext}>Show progress to coaches</Text>
              </View>
            </View>
            <Switch
              value={privacy.statsVisible}
              onValueChange={() => handlePrivacyToggle('statsVisible')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="history" size={24} color={COLORS.warning} />
              <View>
                <Text style={styles.settingText}>Workout History</Text>
                <Text style={styles.settingSubtext}>Share workout data publicly</Text>
              </View>
            </View>
            <Switch
              value={privacy.workoutsVisible}
              onValueChange={() => handlePrivacyToggle('workoutsVisible')}
              color={COLORS.primary}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderActionsSection = () => (
    <Animated.View
      style={[
        styles.section,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [80, 0],
            }),
          }],
        },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="settings" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Account Actions</Text>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('DataExport')}
          >
            <View style={styles.settingLeft}>
              <Icon name="download" size={24} color={COLORS.info} />
              <Text style={styles.settingText}>Export My Data</Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Support')}
          >
            <View style={styles.settingLeft}>
              <Icon name="help" size={24} color={COLORS.success} />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleDeleteAccount}
          >
            <View style={styles.settingLeft}>
              <Icon name="delete-forever" size={24} color={COLORS.error} />
              <Text style={[styles.settingText, styles.dangerText]}>Delete Account</Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        contentStyle={styles.logoutButtonContent}
        labelStyle={styles.logoutButtonText}
        icon="logout"
      >
        Sign Out
      </Button>
    </Animated.View>
  );

  const renderPasswordModal = () => (
    <Portal>
      <Modal
        visible={showPasswordModal}
        onDismiss={() => setShowPasswordModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="dark" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔐 Change Password</Text>
            <Text style={styles.modalSubtitle}>Create a new secure password</Text>
            
            <TextInput
              mode="outlined"
              label="Current Password"
              secureTextEntry
              style={styles.textInput}
              theme={{ colors: { primary: COLORS.primary } }}
            />
            
            <TextInput
              mode="outlined"
              label="New Password"
              secureTextEntry
              style={styles.textInput}
              theme={{ colors: { primary: COLORS.primary } }}
            />
            
            <TextInput
              mode="outlined"
              label="Confirm New Password"
              secureTextEntry
              style={styles.textInput}
              theme={{ colors: { primary: COLORS.primary } }}
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowPasswordModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setShowPasswordModal(false);
                  Alert.alert('Success', '🎉 Password updated successfully!');
                }}
                style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
              >
                Update
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor={COLORS.background}
          />
        }
      >
        {renderAccountSection()}
        {renderNotificationSection()}
        {renderPrivacySection()}
        {renderActionsSection()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderPasswordModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  card: {
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    ...TEXT_STYLES.body1,
    marginLeft: SPACING.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  settingSubtext: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  userName: {
    ...TEXT_STYLES.h4,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  userEmail: {
    ...TEXT_STYLES.body2,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subscriptionStatus: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: 2,
    marginLeft: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  dangerItem: {
    backgroundColor: '#fff5f5',
  },
  dangerText: {
    color: COLORS.error,
  },
  logoutButton: {
    marginTop: SPACING.lg,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  logoutButtonContent: {
    paddingVertical: SPACING.xs,
  },
  logoutButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: 16,
    elevation: 8,
    maxWidth: 400,
    width: '90%',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body2,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  textInput: {
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default AccountManagement;