import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
  RefreshControl,
  StatusBar,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Switch,
  Avatar,
  IconButton,
  Surface,
  Chip,
  ProgressBar,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const DataManagement = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showParentalModal, setShowParentalModal] = useState(false);
  const [dataSettings, setDataSettings] = useState({
    shareProgress: true,
    allowCoachAccess: true,
    saveVideos: false,
    enableAnalytics: true,
    parentNotifications: true,
    autoSync: true,
  });

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  const handleSettingToggle = (setting) => {
    setDataSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
    Vibration.vibrate(25);
  };

  const handleParentalRequest = () => {
    Alert.alert(
      "👨‍👩‍👧‍👦 Parent Permission Required",
      "This setting needs your parent's approval. We'll send them a notification!",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Ask Parent", 
          onPress: () => {
            setShowParentalModal(true);
            Vibration.vibrate(50);
          }
        },
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      "📊 Export Training Data",
      "Your parent can request a copy of your training progress and achievements.",
      [
        { text: "OK", onPress: () => Vibration.vibrate(25) }
      ]
    );
  };

  const handleDeleteRequest = () => {
    Alert.alert(
      "🗑️ Delete Data Request",
      "Only your parent can request to delete your account data. This will remove all your training progress and achievements.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Ask Parent", onPress: handleParentalRequest },
      ]
    );
  };

  const dataUsageInfo = [
    { label: 'Training Sessions', value: '24 sessions', icon: 'fitness-center' },
    { label: 'Progress Photos', value: '12 photos', icon: 'photo-camera' },
    { label: 'Achievement Badges', value: '8 badges', icon: 'military-tech' },
    { label: 'Coach Messages', value: '156 messages', icon: 'message' },
  ];

  const privacyTips = [
    { 
      icon: 'shield', 
      title: 'Safe Sharing', 
      description: 'Only share progress with your coach and parents!' 
    },
    { 
      icon: 'visibility-off', 
      title: 'Privacy First', 
      description: 'Your personal info stays private and secure.' 
    },
    { 
      icon: 'family-restroom', 
      title: 'Parent Control', 
      description: 'Your parents can see and manage your data settings.' 
    },
    { 
      icon: 'lock', 
      title: 'Secure Storage', 
      description: 'All your data is encrypted and protected!' 
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient 
        colors={['#667eea', '#764ba2']} 
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Avatar.Text 
            size={60} 
            label={user?.name?.charAt(0) || 'K'} 
            style={styles.avatar}
          />
          <Text style={styles.headerTitle}>My Data & Privacy 🛡️</Text>
          <Text style={styles.headerSubtitle}>Keep your info safe and sound!</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        {/* Data Usage Overview */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>📊 Your Training Data</Text>
          <View style={styles.dataGrid}>
            {dataUsageInfo.map((item, index) => (
              <Card key={index} style={styles.dataCard}>
                <Card.Content style={styles.dataCardContent}>
                  <Icon name={item.icon} size={24} color={COLORS.primary} />
                  <Text style={styles.dataValue}>{item.value}</Text>
                  <Text style={styles.dataLabel}>{item.label}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </Animated.View>

        {/* Privacy Settings */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>⚙️ Privacy Settings</Text>
          <Text style={styles.sectionDescription}>
            These settings help keep you safe online! 🌟
          </Text>

          <Card style={styles.settingsCard}>
            <Card.Content>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Icon name="share" size={20} color={COLORS.primary} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Share My Progress</Text>
                    <Text style={styles.settingDescription}>
                      Let your coach see your awesome improvements! 🏆
                    </Text>
                  </View>
                </View>
                <Switch
                  value={dataSettings.shareProgress}
                  onValueChange={() => handleSettingToggle('shareProgress')}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Icon name="sports" size={20} color={COLORS.primary} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Coach Access</Text>
                    <Text style={styles.settingDescription}>
                      Allow your coach to give you feedback 💪
                    </Text>
                  </View>
                </View>
                <Switch
                  value={dataSettings.allowCoachAccess}
                  onValueChange={() => handleSettingToggle('allowCoachAccess')}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Icon name="notifications" size={20} color={COLORS.primary} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Parent Notifications</Text>
                    <Text style={styles.settingDescription}>
                      Keep your parents updated on your training! 👨‍👩‍👧‍👦
                    </Text>
                  </View>
                </View>
                <Switch
                  value={dataSettings.parentNotifications}
                  onValueChange={() => handleSettingToggle('parentNotifications')}
                  color={COLORS.primary}
                />
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Privacy Tips */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>💡 Privacy Tips for Young Athletes</Text>
          
          {privacyTips.map((tip, index) => (
            <Card key={index} style={styles.tipCard}>
              <Card.Content style={styles.tipContent}>
                <Icon name={tip.icon} size={28} color={COLORS.primary} />
                <View style={styles.tipText}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDescription}>{tip.description}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </Animated.View>

        {/* Data Actions */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>📋 Data Actions</Text>
          
          <Card style={styles.actionCard}>
            <Card.Content>
              <View style={styles.actionItem}>
                <Icon name="download" size={24} color={COLORS.primary} />
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>Download My Data</Text>
                  <Text style={styles.actionDescription}>
                    Get a copy of your training progress 📈
                  </Text>
                </View>
                <IconButton
                  icon="arrow-forward"
                  size={20}
                  iconColor={COLORS.primary}
                  onPress={handleDataExport}
                />
              </View>

              <View style={styles.actionItem}>
                <Icon name="delete-outline" size={24} color={COLORS.error} />
                <View style={styles.actionText}>
                  <Text style={[styles.actionTitle, { color: COLORS.error }]}>
                    Delete My Account
                  </Text>
                  <Text style={styles.actionDescription}>
                    Ask parent to remove all your data 🗑️
                  </Text>
                </View>
                <IconButton
                  icon="arrow-forward"
                  size={20}
                  iconColor={COLORS.error}
                  onPress={handleDeleteRequest}
                />
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Data Storage Info */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>💾 How We Keep Your Data Safe</Text>
          
          <Surface style={styles.infoSurface}>
            <Text style={styles.infoText}>
              🔐 All your training data is encrypted and stored securely{'\n'}
              👨‍👩‍👧‍👦 Your parents have full control over your account{'\n'}
              🏫 Only approved coaches and academies can see your progress{'\n'}
              🚫 We never share your personal information with strangers{'\n'}
              📱 Your data works offline and syncs when connected
            </Text>
          </Surface>
        </Animated.View>

        {/* Parent Contact */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Card style={styles.parentCard}>
            <LinearGradient 
              colors={['#4facfe', '#00f2fe']} 
              style={styles.parentCardGradient}
            >
              <Card.Content>
                <View style={styles.parentInfo}>
                  <Icon name="family-restroom" size={32} color="white" />
                  <View style={styles.parentText}>
                    <Text style={styles.parentTitle}>Need Help? 🤔</Text>
                    <Text style={styles.parentDescription}>
                      Ask your parent or guardian about any privacy questions!
                    </Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  buttonColor="rgba(255,255,255,0.2)"
                  textColor="white"
                  onPress={() => setShowParentalModal(true)}
                  style={styles.parentButton}
                >
                  Ask Parent 👨‍👩‍👧‍👦
                </Button>
              </Card.Content>
            </LinearGradient>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Parental Request Modal */}
      <Portal>
        <Modal
          visible={showParentalModal}
          onDismiss={() => setShowParentalModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.modalBlur}
            blurType="light"
            blurAmount={10}
          >
            <Card style={styles.modalCard}>
              <Card.Content style={styles.modalContent}>
                <Icon name="family-restroom" size={48} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Parent Request Sent! 📨</Text>
                <Text style={styles.modalDescription}>
                  We've notified your parent about your request. They'll help you with any data or privacy questions!
                </Text>
                <View style={styles.modalActions}>
                  <Button
                    mode="contained"
                    onPress={() => setShowParentalModal(false)}
                    style={styles.modalButton}
                  >
                    Got it! 👍
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </BlurView>
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
    paddingTop: StatusBar.currentHeight + SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  sectionDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dataCard: {
    width: '48%',
    marginBottom: SPACING.md,
    elevation: 2,
  },
  dataCardContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  dataValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  dataLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs / 2,
  },
  settingsCard: {
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  settingTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  tipCard: {
    marginBottom: SPACING.md,
    elevation: 1,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  tipTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  tipDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  actionCard: {
    elevation: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  actionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  infoSurface: {
    padding: SPACING.lg,
    borderRadius: 12,
    elevation: 1,
  },
  infoText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  parentCard: {
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  parentCardGradient: {
    padding: 0,
  },
  parentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  parentText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  parentTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: '700',
  },
  parentDescription: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  parentButton: {
    borderRadius: 25,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalCard: {
    width: '85%',
    borderRadius: 20,
    elevation: 5,
  },
  modalContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  modalActions: {
    width: '100%',
  },
  modalButton: {
    borderRadius: 25,
  },
});

export default DataManagement;