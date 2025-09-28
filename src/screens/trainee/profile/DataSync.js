import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  AppState,
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
  Badge,
  FAB,
  Avatar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const DataSync = ({ navigation }) => {
  const dispatch = useDispatch();
  const syncStatus = useSelector(state => state.sync.status);
  const user = useSelector(state => state.auth.user);
  const networkStatus = useSelector(state => state.network.isConnected);
  
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [syncProgress, setSyncProgress] = useState(0);
  const [currentSyncItem, setCurrentSyncItem] = useState('');
  
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncOnWifi: true,
    syncWorkouts: true,
    syncProgress: true,
    syncMedia: false,
    syncNutrition: true,
    backgroundSync: true,
  });

  const [syncData, setSyncData] = useState({
    pendingWorkouts: 5,
    pendingProgress: 3,
    pendingMedia: 12,
    pendingNutrition: 2,
    conflicts: 1,
    totalSize: '2.4 MB',
    lastFullSync: '2 hours ago',
  });

  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Start pulse animation for sync status
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (syncing) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
      pulseAnim.setValue(1);
    }

    return () => pulseAnimation.stop();
  }, [syncing]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh sync status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update sync data
      setSyncData(prev => ({
        ...prev,
        lastFullSync: 'Just now',
      }));
      
      // dispatch(refreshSyncStatus());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh sync status');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleSyncToggle = (key) => {
    setSyncSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    Vibration.vibrate(25);
  };

  const handleManualSync = async () => {
    if (!networkStatus) {
      Alert.alert(
        '📶 No Internet Connection',
        'Please connect to the internet to sync your data.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSyncing(true);
    setShowSyncModal(true);
    setSyncProgress(0);
    
    const syncSteps = [
      'Preparing data...',
      'Syncing workouts...',
      'Syncing progress...',
      'Syncing nutrition...',
      'Finalizing...',
    ];

    for (let i = 0; i < syncSteps.length; i++) {
      setCurrentSyncItem(syncSteps[i]);
      
      // Animate progress
      Animated.timing(progressAnim, {
        toValue: (i + 1) / syncSteps.length,
        duration: 800,
        useNativeDriver: false,
      }).start();
      
      setSyncProgress((i + 1) / syncSteps.length);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setSyncing(false);
    setShowSyncModal(false);
    setLastSyncTime(new Date());
    setSyncData(prev => ({
      ...prev,
      pendingWorkouts: 0,
      pendingProgress: 0,
      pendingNutrition: 0,
      lastFullSync: 'Just now',
    }));
    
    Vibration.vibrate([100, 50, 100]);
    Alert.alert('Success', '🎉 Data synchronized successfully!');
  };

  const handleResolveConflict = () => {
    setShowConflictModal(true);
  };

  const handleForceSync = () => {
    Alert.alert(
      '⚠️ Force Sync',
      'This will overwrite local changes with server data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Force Sync',
          style: 'destructive',
          onPress: () => {
            handleManualSync();
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
        <Text style={styles.headerTitle}>Data Sync</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Animated.View
            style={{
              transform: [{ rotate: refreshing ? '360deg' : '0deg' }],
            }}
          >
            <Icon name="refresh" size={24} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderSyncStatus = () => (
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
      <Card style={[styles.card, styles.statusCard]}>
        <LinearGradient
          colors={networkStatus ? ['#4CAF50', '#45a049'] : ['#FF6B6B', '#FF5252']}
          style={styles.statusGradient}
        >
          <View style={styles.statusContent}>
            <Animated.View
              style={[
                styles.statusIcon,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Icon
                name={networkStatus ? (syncing ? 'sync' : 'cloud-done') : 'cloud-off'}
                size={32}
                color="#fff"
              />
            </Animated.View>
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>
                {syncing ? 'Syncing...' : networkStatus ? 'Connected' : 'Offline'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {syncing ? currentSyncItem : 
                 networkStatus ? `Last sync: ${syncData.lastFullSync}` : 
                 'Working in offline mode'}
              </Text>
            </View>
            {syncData.conflicts > 0 && (
              <Badge
                visible={true}
                style={styles.conflictBadge}
                size={24}
              >
                {syncData.conflicts}
              </Badge>
            )}
          </View>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderPendingData = () => (
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
            <Icon name="pending-actions" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Pending Sync</Text>
            <Chip
              mode="outlined"
              compact
              textStyle={styles.chipText}
              style={styles.pendingChip}
            >
              {syncData.totalSize}
            </Chip>
          </View>

          <View style={styles.pendingGrid}>
            <View style={styles.pendingItem}>
              <View style={styles.pendingIcon}>
                <Icon name="fitness-center" size={20} color={COLORS.success} />
              </View>
              <Text style={styles.pendingNumber}>{syncData.pendingWorkouts}</Text>
              <Text style={styles.pendingLabel}>Workouts</Text>
            </View>

            <View style={styles.pendingItem}>
              <View style={styles.pendingIcon}>
                <Icon name="trending-up" size={20} color={COLORS.info} />
              </View>
              <Text style={styles.pendingNumber}>{syncData.pendingProgress}</Text>
              <Text style={styles.pendingLabel}>Progress</Text>
            </View>

            <View style={styles.pendingItem}>
              <View style={styles.pendingIcon}>
                <Icon name="photo" size={20} color={COLORS.secondary} />
              </View>
              <Text style={styles.pendingNumber}>{syncData.pendingMedia}</Text>
              <Text style={styles.pendingLabel}>Media</Text>
            </View>

            <View style={styles.pendingItem}>
              <View style={styles.pendingIcon}>
                <Icon name="restaurant" size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.pendingNumber}>{syncData.pendingNutrition}</Text>
              <Text style={styles.pendingLabel}>Nutrition</Text>
            </View>
          </View>

          {syncData.conflicts > 0 && (
            <TouchableOpacity
              style={styles.conflictAlert}
              onPress={handleResolveConflict}
            >
              <Icon name="warning" size={20} color={COLORS.error} />
              <Text style={styles.conflictText}>
                {syncData.conflicts} conflict{syncData.conflicts > 1 ? 's' : ''} need resolution
              </Text>
              <Icon name="chevron-right" size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderSyncSettings = () => (
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
            <Icon name="settings" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Sync Settings</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="sync" size={24} color={COLORS.success} />
              <View>
                <Text style={styles.settingText}>Auto Sync</Text>
                <Text style={styles.settingSubtext}>Sync automatically when connected</Text>
              </View>
            </View>
            <Switch
              value={syncSettings.autoSync}
              onValueChange={() => handleSyncToggle('autoSync')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="wifi" size={24} color={COLORS.info} />
              <View>
                <Text style={styles.settingText}>Wi-Fi Only</Text>
                <Text style={styles.settingSubtext}>Sync only on Wi-Fi connection</Text>
              </View>
            </View>
            <Switch
              value={syncSettings.syncOnWifi}
              onValueChange={() => handleSyncToggle('syncOnWifi')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="fitness-center" size={24} color={COLORS.success} />
              <View>
                <Text style={styles.settingText}>Workout Data</Text>
                <Text style={styles.settingSubtext}>Sync workout sessions and plans</Text>
              </View>
            </View>
            <Switch
              value={syncSettings.syncWorkouts}
              onValueChange={() => handleSyncToggle('syncWorkouts')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="trending-up" size={24} color={COLORS.info} />
              <View>
                <Text style={styles.settingText}>Progress Data</Text>
                <Text style={styles.settingSubtext}>Sync measurements and achievements</Text>
              </View>
            </View>
            <Switch
              value={syncSettings.syncProgress}
              onValueChange={() => handleSyncToggle('syncProgress')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="photo" size={24} color={COLORS.secondary} />
              <View>
                <Text style={styles.settingText}>Media Files</Text>
                <Text style={styles.settingSubtext}>Sync photos and videos</Text>
              </View>
            </View>
            <Switch
              value={syncSettings.syncMedia}
              onValueChange={() => handleSyncToggle('syncMedia')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="restaurant" size={24} color={COLORS.warning} />
              <View>
                <Text style={styles.settingText}>Nutrition Data</Text>
                <Text style={styles.settingSubtext}>Sync meals and nutrition logs</Text>
              </View>
            </View>
            <Switch
              value={syncSettings.syncNutrition}
              onValueChange={() => handleSyncToggle('syncNutrition')}
              color={COLORS.primary}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderSyncActions = () => (
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
            <Icon name="build" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Sync Actions</Text>
          </View>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('SyncHistory')}
          >
            <View style={styles.actionLeft}>
              <Icon name="history" size={24} color={COLORS.info} />
              <View>
                <Text style={styles.actionText}>Sync History</Text>
                <Text style={styles.actionSubtext}>View past sync activities</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleForceSync}
          >
            <View style={styles.actionLeft}>
              <Icon name="sync-problem" size={24} color={COLORS.warning} />
              <View>
                <Text style={styles.actionText}>Force Sync</Text>
                <Text style={styles.actionSubtext}>Override local changes</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('OfflineData')}
          >
            <View style={styles.actionLeft}>
              <Icon name="offline-bolt" size={24} color={COLORS.secondary} />
              <View>
                <Text style={styles.actionText}>Offline Data</Text>
                <Text style={styles.actionSubtext}>Manage downloaded content</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionItem, styles.dangerAction]}
            onPress={() => {
              Alert.alert(
                '🗑️ Clear Local Data',
                'This will delete all offline data. Are you sure?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: () => {} },
                ]
              );
            }}
          >
            <View style={styles.actionLeft}>
              <Icon name="delete-sweep" size={24} color={COLORS.error} />
              <View>
                <Text style={[styles.actionText, styles.dangerText]}>Clear Local Data</Text>
                <Text style={styles.actionSubtext}>Remove all offline content</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderSyncModal = () => (
    <Portal>
      <Modal
        visible={showSyncModal}
        dismissable={false}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="dark" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔄 Syncing Data</Text>
            <Text style={styles.modalSubtitle}>{currentSyncItem}</Text>
            
            <View style={styles.progressContainer}>
              <Animated.View style={styles.progressBarContainer}>
                <ProgressBar
                  progress={syncProgress}
                  color={COLORS.primary}
                  style={styles.progressBar}
                />
              </Animated.View>
              <Text style={styles.progressText}>
                {Math.round(syncProgress * 100)}% Complete
              </Text>
            </View>

            <View style={styles.syncItems}>
              <View style={styles.syncItem}>
                <Icon name="fitness-center" size={16} color={COLORS.success} />
                <Text style={styles.syncItemText}>Workouts</Text>
                <Icon name="check-circle" size={16} color={syncProgress > 0.2 ? COLORS.success : COLORS.disabled} />
              </View>
              <View style={styles.syncItem}>
                <Icon name="trending-up" size={16} color={COLORS.info} />
                <Text style={styles.syncItemText}>Progress</Text>
                <Icon name="check-circle" size={16} color={syncProgress > 0.4 ? COLORS.success : COLORS.disabled} />
              </View>
              <View style={styles.syncItem}>
                <Icon name="restaurant" size={16} color={COLORS.warning} />
                <Text style={styles.syncItemText}>Nutrition</Text>
                <Icon name="check-circle" size={16} color={syncProgress > 0.8 ? COLORS.success : COLORS.disabled} />
              </View>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderConflictModal = () => (
    <Portal>
      <Modal
        visible={showConflictModal}
        onDismiss={() => setShowConflictModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="dark" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Sync Conflict</Text>
            <Text style={styles.modalSubtitle}>
              Your local data differs from server data. Choose how to resolve:
            </Text>
            
            <View style={styles.conflictOptions}>
              <TouchableOpacity style={styles.conflictOption}>
                <Icon name="cloud-download" size={24} color={COLORS.primary} />
                <Text style={styles.conflictOptionText}>Use Server Data</Text>
                <Text style={styles.conflictOptionSubtext}>Replace local changes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.conflictOption}>
                <Icon name="cloud-upload" size={24} color={COLORS.secondary} />
                <Text style={styles.conflictOptionText}>Use Local Data</Text>
                <Text style={styles.conflictOptionSubtext}>Override server data</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.conflictOption}>
                <Icon name="merge-type" size={24} color={COLORS.success} />
                <Text style={styles.conflictOptionText}>Merge Changes</Text>
                <Text style={styles.conflictOptionSubtext}>Combine both versions</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowConflictModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setShowConflictModal(false);
                  setSyncData(prev => ({ ...prev, conflicts: 0 }));
                  Alert.alert('Success', '🎉 Conflict resolved!');
                }}
                style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
              >
                Resolve
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
        {renderSyncStatus()}
        {renderPendingData()}
        {renderSyncSettings()}
        {renderSyncActions()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        style={[
          styles.fab,
          { backgroundColor: networkStatus ? COLORS.primary : COLORS.disabled }
        ]}
        icon={syncing ? "sync" : "cloud-sync"}
        onPress={handleManualSync}
        disabled={!networkStatus || syncing}
        label={syncing ? "Syncing..." : "Sync Now"}
        extended
      />

      {renderSyncModal()}
      {renderConflictModal()}
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
  refreshButton: {
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
  statusCard: {
    overflow: 'hidden',
  },
  statusGradient: {
    padding: SPACING.lg,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: SPACING.md,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: '600',
  },
  statusSubtitle: {
    ...TEXT_STYLES.body2,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  conflictBadge: {
    backgroundColor: COLORS.error,
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
    flex: 1,
  },
  pendingChip: {
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
  },
  pendingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  pendingItem: {
    alignItems: 'center',
    flex: 1,
  },
  pendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  pendingNumber: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  pendingLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  conflictAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  conflictText: {
    ...TEXT_STYLES.body2,
    color: COLORS.error,
    marginLeft: SPACING.xs,
    flex: 1,
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
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    ...TEXT_STYLES.body1,
    marginLeft: SPACING.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  actionSubtext: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dangerAction: {
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  dangerText: {
    color: COLORS.error,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    elevation: 8,
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
  progressContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  syncItems: {
    marginTop: SPACING.md,
  },
  syncItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  syncItemText: {
    ...TEXT_STYLES.body2,
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.textPrimary,
  },
  conflictOptions: {
    marginVertical: SPACING.lg,
  },
  conflictOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  conflictOptionText: {
    ...TEXT_STYLES.body1,
    marginLeft: SPACING.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1,
  },
  conflictOptionSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default DataSync;
