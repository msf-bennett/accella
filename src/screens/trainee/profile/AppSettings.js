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
  Linking,
} from 'react-native';
import {
  Card,
  Button,
  Surface,
  IconButton,
  Switch,
  Portal,
  Modal,
  Chip,
  ProgressBar,
  RadioButton,
  Slider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const AppSettings = ({ navigation }) => {
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);
  const user = useSelector(state => state.auth.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [showCacheModal, setShowCacheModal] = useState(false);
  
  const [appPreferences, setAppPreferences] = useState({
    theme: 'system', // light, dark, system
    language: 'en',
    autoSync: true,
    offlineMode: true,
    hapticFeedback: true,
    soundEnabled: true,
    autoPlay: false,
    dataUsage: 'wifi', // wifi, cellular, all
  });

  const [unitSettings, setUnitSettings] = useState({
    weightUnit: 'kg', // kg, lbs
    distanceUnit: 'km', // km, miles
    temperatureUnit: 'celsius', // celsius, fahrenheit
  });

  const [performanceSettings, setPerformanceSettings] = useState({
    videoQuality: 'auto', // auto, high, medium, low
    cacheSize: 512, // MB
    backgroundSync: true,
    imageCompression: true,
    animationsEnabled: true,
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
      // Simulate API call to refresh settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dispatch refresh settings action
      // dispatch(refreshAppSettings());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh app settings');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handlePreferenceToggle = (key) => {
    setAppPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    Vibration.vibrate(25);
  };

  const handlePerformanceToggle = (key) => {
    setPerformanceSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    Vibration.vibrate(25);
  };

  const handleClearCache = () => {
    Alert.alert(
      '🗑️ Clear Cache',
      'This will free up storage space but may slow down the app temporarily.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            setShowCacheModal(true);
            Vibration.vibrate(50);
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      '🔄 Reset Settings',
      'This will restore all app settings to their default values.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Reset all settings to defaults
            setAppPreferences({
              theme: 'system',
              language: 'en',
              autoSync: true,
              offlineMode: true,
              hapticFeedback: true,
              soundEnabled: true,
              autoPlay: false,
              dataUsage: 'wifi',
            });
            setUnitSettings({
              weightUnit: 'kg',
              distanceUnit: 'km',
              temperatureUnit: 'celsius',
            });
            setPerformanceSettings({
              videoQuality: 'auto',
              cacheSize: 512,
              backgroundSync: true,
              imageCompression: true,
              animationsEnabled: true,
            });
            Vibration.vibrate([100, 50, 100]);
            Alert.alert('Success', '🎉 Settings reset to defaults!');
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>App Settings</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetSettings}
        >
          <Icon name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderAppearanceSection = () => (
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
            <Icon name="palette" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowThemeModal(true)}
          >
            <View style={styles.settingLeft}>
              <Icon name="brightness-6" size={24} color={COLORS.textSecondary} />
              <View>
                <Text style={styles.settingText}>Theme</Text>
                <Text style={styles.settingSubtext}>
                  {appPreferences.theme === 'system' ? 'Follow System' : 
                   appPreferences.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingLeft}>
              <Icon name="language" size={24} color={COLORS.textSecondary} />
              <View>
                <Text style={styles.settingText}>Language</Text>
                <Text style={styles.settingSubtext}>
                  {appPreferences.language === 'en' ? 'English' : 
                   appPreferences.language === 'es' ? 'Español' : 'Français'}
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="animation" size={24} color={COLORS.success} />
              <View>
                <Text style={styles.settingText}>Animations</Text>
                <Text style={styles.settingSubtext}>Enable smooth transitions</Text>
              </View>
            </View>
            <Switch
              value={performanceSettings.animationsEnabled}
              onValueChange={() => handlePerformanceToggle('animationsEnabled')}
              color={COLORS.primary}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderPreferencesSection = () => (
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
            <Icon name="tune" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="sync" size={24} color={COLORS.info} />
              <View>
                <Text style={styles.settingText}>Auto Sync</Text>
                <Text style={styles.settingSubtext}>Sync data automatically</Text>
              </View>
            </View>
            <Switch
              value={appPreferences.autoSync}
              onValueChange={() => handlePreferenceToggle('autoSync')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="offline-bolt" size={24} color={COLORS.secondary} />
              <View>
                <Text style={styles.settingText}>Offline Mode</Text>
                <Text style={styles.settingSubtext}>Work without internet</Text>
              </View>
            </View>
            <Switch
              value={appPreferences.offlineMode}
              onValueChange={() => handlePreferenceToggle('offlineMode')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="vibration" size={24} color={COLORS.warning} />
              <View>
                <Text style={styles.settingText}>Haptic Feedback</Text>
                <Text style={styles.settingSubtext}>Feel button presses</Text>
              </View>
            </View>
            <Switch
              value={appPreferences.hapticFeedback}
              onValueChange={() => handlePreferenceToggle('hapticFeedback')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="volume-up" size={24} color={COLORS.success} />
              <View>
                <Text style={styles.settingText}>Sound Effects</Text>
                <Text style={styles.settingSubtext}>App sounds and alerts</Text>
              </View>
            </View>
            <Switch
              value={appPreferences.soundEnabled}
              onValueChange={() => handlePreferenceToggle('soundEnabled')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="play-arrow" size={24} color={COLORS.error} />
              <View>
                <Text style={styles.settingText}>Auto-play Videos</Text>
                <Text style={styles.settingSubtext}>Start videos automatically</Text>
              </View>
            </View>
            <Switch
              value={appPreferences.autoPlay}
              onValueChange={() => handlePreferenceToggle('autoPlay')}
              color={COLORS.primary}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderUnitsSection = () => (
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
            <Icon name="straighten" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Units & Measurements</Text>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowUnitsModal(true)}
          >
            <View style={styles.settingLeft}>
              <Icon name="fitness-center" size={24} color={COLORS.success} />
              <View>
                <Text style={styles.settingText}>Weight Unit</Text>
                <Text style={styles.settingSubtext}>
                  {unitSettings.weightUnit === 'kg' ? 'Kilograms (kg)' : 'Pounds (lbs)'}
                </Text>
              </View>
            </View>
            <Chip
              mode="outlined"
              compact
              textStyle={styles.chipText}
            >
              {unitSettings.weightUnit.toUpperCase()}
            </Chip>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowUnitsModal(true)}
          >
            <View style={styles.settingLeft}>
              <Icon name="directions-run" size={24} color={COLORS.info} />
              <View>
                <Text style={styles.settingText}>Distance Unit</Text>
                <Text style={styles.settingSubtext}>
                  {unitSettings.distanceUnit === 'km' ? 'Kilometers' : 'Miles'}
                </Text>
              </View>
            </View>
            <Chip
              mode="outlined"
              compact
              textStyle={styles.chipText}
            >
              {unitSettings.distanceUnit.toUpperCase()}
            </Chip>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderPerformanceSection = () => (
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
            <Icon name="speed" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Performance</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="hd" size={24} color={COLORS.secondary} />
              <View>
                <Text style={styles.settingText}>Video Quality</Text>
                <Text style={styles.settingSubtext}>
                  {performanceSettings.videoQuality === 'auto' ? 'Auto (recommended)' :
                   performanceSettings.videoQuality === 'high' ? 'High Quality' :
                   performanceSettings.videoQuality === 'medium' ? 'Medium Quality' : 'Low Quality'}
                </Text>
              </View>
            </View>
            <Chip
              mode="outlined"
              compact
              textStyle={styles.chipText}
            >
              {performanceSettings.videoQuality.toUpperCase()}
            </Chip>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="storage" size={24} color={COLORS.warning} />
              <View>
                <Text style={styles.settingText}>Cache Size</Text>
                <Text style={styles.settingSubtext}>
                  {performanceSettings.cacheSize} MB used for offline content
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClearCache}>
              <Chip
                mode="outlined"
                compact
                textStyle={styles.chipText}
                icon="delete"
              >
                CLEAR
              </Chip>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="cloud-sync" size={24} color={COLORS.info} />
              <View>
                <Text style={styles.settingText}>Background Sync</Text>
                <Text style={styles.settingSubtext}>Sync when app is closed</Text>
              </View>
            </View>
            <Switch
              value={performanceSettings.backgroundSync}
              onValueChange={() => handlePerformanceToggle('backgroundSync')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="compress" size={24} color={COLORS.success} />
              <View>
                <Text style={styles.settingText}>Image Compression</Text>
                <Text style={styles.settingSubtext}>Reduce image file sizes</Text>
              </View>
            </View>
            <Switch
              value={performanceSettings.imageCompression}
              onValueChange={() => handlePerformanceToggle('imageCompression')}
              color={COLORS.primary}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderDataSection = () => (
    <Animated.View
      style={[
        styles.section,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            }),
          }],
        },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="data-usage" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Data & Storage</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="wifi" size={24} color={COLORS.info} />
              <View>
                <Text style={styles.settingText}>Data Usage</Text>
                <Text style={styles.settingSubtext}>
                  {appPreferences.dataUsage === 'wifi' ? 'Wi-Fi Only' :
                   appPreferences.dataUsage === 'cellular' ? 'Cellular Only' : 'Wi-Fi & Cellular'}
                </Text>
              </View>
            </View>
            <Chip
              mode="outlined"
              compact
              textStyle={styles.chipText}
            >
              {appPreferences.dataUsage.toUpperCase()}
            </Chip>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('StorageManagement')}
          >
            <View style={styles.settingLeft}>
              <Icon name="folder" size={24} color={COLORS.secondary} />
              <View>
                <Text style={styles.settingText}>Storage Management</Text>
                <Text style={styles.settingSubtext}>Manage downloaded content</Text>
              </View>
            </View>
            <View style={styles.storageInfo}>
              <Text style={styles.storageText}>2.4 GB</Text>
              <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
            </View>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderAboutSection = () => (
    <Animated.View
      style={[
        styles.section,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [120, 0],
            }),
          }],
        },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon name="info" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('AppInfo')}
          >
            <View style={styles.settingLeft}>
              <Icon name="phone-android" size={24} color={COLORS.textSecondary} />
              <View>
                <Text style={styles.settingText}>App Version</Text>
                <Text style={styles.settingSubtext}>1.2.3 (Build 456)</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Linking.openURL('https://example.com/terms')}
          >
            <View style={styles.settingLeft}>
              <Icon name="description" size={24} color={COLORS.textSecondary} />
              <Text style={styles.settingText}>Terms & Conditions</Text>
            </View>
            <Icon name="open-in-new" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Linking.openURL('https://example.com/privacy')}
          >
            <View style={styles.settingLeft}>
              <Icon name="privacy-tip" size={24} color={COLORS.textSecondary} />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Icon name="open-in-new" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderThemeModal = () => (
    <Portal>
      <Modal
        visible={showThemeModal}
        onDismiss={() => setShowThemeModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="dark" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎨 Choose Theme</Text>
            <Text style={styles.modalSubtitle}>Select your preferred theme</Text>
            
            <RadioButton.Group
              onValueChange={(value) => {
                setAppPreferences(prev => ({ ...prev, theme: value }));
                Vibration.vibrate(25);
              }}
              value={appPreferences.theme}
            >
              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => setAppPreferences(prev => ({ ...prev, theme: 'light' }))}
              >
                <RadioButton value="light" color={COLORS.primary} />
                <View style={styles.radioContent}>
                  <Icon name="wb-sunny" size={24} color={COLORS.secondary} />
                  <Text style={styles.radioText}>Light Mode</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => setAppPreferences(prev => ({ ...prev, theme: 'dark' }))}
              >
                <RadioButton value="dark" color={COLORS.primary} />
                <View style={styles.radioContent}>
                  <Icon name="brightness-2" size={24} color={COLORS.textSecondary} />
                  <Text style={styles.radioText}>Dark Mode</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => setAppPreferences(prev => ({ ...prev, theme: 'system' }))}
              >
                <RadioButton value="system" color={COLORS.primary} />
                <View style={styles.radioContent}>
                  <Icon name="brightness-auto" size={24} color={COLORS.primary} />
                  <Text style={styles.radioText}>Follow System</Text>
                </View>
              </TouchableOpacity>
            </RadioButton.Group>

            <Button
              mode="contained"
              onPress={() => setShowThemeModal(false)}
              style={[styles.modalButton, { backgroundColor: COLORS.primary, marginTop: SPACING.lg }]}
            >
              Apply Theme
            </Button>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderCacheModal = () => (
    <Portal>
      <Modal
        visible={showCacheModal}
        onDismiss={() => setShowCacheModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="dark" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <Text style={styles.modalTitle}>🧹 Clearing Cache</Text>
            <Text style={styles.modalSubtitle}>Please wait while we free up space...</Text>
            
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={0.7}
                color={COLORS.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>Clearing 358 MB...</Text>
            </View>

            <Button
              mode="outlined"
              onPress={() => {
                setShowCacheModal(false);
                Alert.alert('Success', '🎉 Cache cleared successfully!');
              }}
              style={styles.modalButton}
            >
              Done
            </Button>
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
        {renderAppearanceSection()}
        {renderPreferencesSection()}
        {renderUnitsSection()}
        {renderPerformanceSection()}
        {renderDataSection()}
        {renderAboutSection()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderThemeModal()}
      {renderCacheModal()}
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
  resetButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: '600',
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
  chipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  storageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storageText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.secondary,
    marginRight: SPACING.xs,
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
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  radioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  radioText: {
    ...TEXT_STYLES.body1,
    marginLeft: SPACING.sm,
    color: COLORS.textPrimary,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modalButton: {
    marginTop: SPACING.md,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default AppSettings;