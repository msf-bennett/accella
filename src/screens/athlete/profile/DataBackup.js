import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Vibration,
  Share,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { 
  Card,
  Button,
  Surface,
  ProgressBar,
  IconButton,
  Portal,
  Modal,
  Divider,
  List,
  Switch,
  Chip,
  TextInput,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import DocumentPicker from 'expo-document-picker';
import RNFetchBlob from 'rn-fetch-blob';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
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

const DataBackup = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Backup states
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'error', 'pending'
  const [lastBackupDate, setLastBackupDate] = useState('2024-08-20T10:30:00Z');
  const [lastSyncDate, setLastSyncDate] = useState('2024-08-22T08:15:00Z');
  
  // Settings
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [includeMedia, setIncludeMedia] = useState(true);
  
  // Modal states
  const [exportModal, setExportModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [syncModal, setSyncModal] = useState(false);
  const [storageModal, setStorageModal] = useState(false);
  
  // Export settings
  const [exportSettings, setExportSettings] = useState({
    workouts: true,
    progress: true,
    achievements: true,
    profile: true,
    media: false,
    format: 'json', // 'json', 'csv', 'pdf'
    dateRange: 'all', // 'all', 'thisYear', 'custom'
    customStartDate: '',
    customEndDate: '',
  });

  // Data statistics
  const dataStats = {
    totalSize: '2.8 GB',
    workouts: 247,
    media: 89,
    achievements: 12,
    profileData: '125 KB',
    mediaSize: '2.5 GB',
    workoutData: '280 MB',
    lastBackupSize: '2.8 GB',
    storageUsed: 68, // percentage
    storageLimit: '5 GB',
  };

  const backupHistory = [
    { id: 1, date: '2024-08-22T08:15:00Z', size: '2.8 GB', status: 'completed', type: 'auto' },
    { id: 2, date: '2024-08-21T08:15:00Z', size: '2.7 GB', status: 'completed', type: 'auto' },
    { id: 3, date: '2024-08-20T10:30:00Z', size: '2.6 GB', status: 'completed', type: 'manual' },
    { id: 4, date: '2024-08-19T08:15:00Z', size: '2.5 GB', status: 'completed', type: 'auto' },
    { id: 5, date: '2024-08-18T14:22:00Z', size: '2.4 GB', status: 'failed', type: 'manual' },
  ];

  useEffect(() => {
    // Check sync status on component mount
    checkSyncStatus();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await checkSyncStatus();
      // dispatch(fetchBackupStatus());
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const checkSyncStatus = async () => {
    try {
      // Simulate API call to check sync status
      const status = Math.random() > 0.8 ? 'error' : 'synced';
      setSyncStatus(status);
    } catch (error) {
      setSyncStatus('error');
    }
  };

  const handleManualBackup = async () => {
    Alert.alert(
      'Create Backup',
      'This will create a complete backup of your training data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Backup Now',
          onPress: async () => {
            setLoading(true);
            setBackupProgress(0);
            
            try {
              // Simulate backup process
              for (let i = 0; i <= 100; i += 10) {
                setBackupProgress(i);
                await new Promise(resolve => setTimeout(resolve, 200));
              }
              
              Vibration.vibrate(100);
              Alert.alert('Success', 'Backup completed successfully! 📦✨');
              setLastBackupDate(new Date().toISOString());
            } catch (error) {
              Alert.alert('Error', 'Backup failed. Please try again.');
            } finally {
              setLoading(false);
              setBackupProgress(0);
            }
          }
        }
      ]
    );
  };

  const handleManualSync = async () => {
    setSyncStatus('syncing');
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSyncStatus('synced');
      setLastSyncDate(new Date().toISOString());
      Vibration.vibrate(50);
      Alert.alert('Success', 'Data synchronized successfully! 🔄✨');
    } catch (error) {
      setSyncStatus('error');
      Alert.alert('Error', 'Sync failed. Check your internet connection.');
    }
  };

  const handleExportData = async () => {
    if (!exportSettings.workouts && !exportSettings.progress && !exportSettings.achievements && !exportSettings.profile) {
      Alert.alert('Error', 'Please select at least one data type to export.');
      return;
    }

    try {
      // Request storage permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Storage permission is required to export data.');
          return;
        }
      }

      setLoading(true);
      
      // Simulate export process
      const exportData = {
        exportDate: new Date().toISOString(),
        user: user?.name || 'Athlete',
        settings: exportSettings,
        data: {
          workouts: exportSettings.workouts ? Array(dataStats.workouts).fill({}) : [],
          progress: exportSettings.progress ? {} : null,
          achievements: exportSettings.achievements ? Array(dataStats.achievements).fill({}) : [],
          profile: exportSettings.profile ? user : null,
        }
      };

      // Generate filename
      const filename = `training_data_${new Date().toISOString().split('T')[0]}.${exportSettings.format}`;
      
      // Simulate file creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setExportModal(false);
      Alert.alert(
        'Export Complete',
        `Data exported as ${filename}. You can find it in your Downloads folder.`,
        [
          { text: 'OK' },
          {
            text: 'Share',
            onPress: () => {
              Share.share({
                message: 'My training data export',
                title: 'Training Data',
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: false,
      });

      Alert.alert(
        'Import Data',
        `Selected file: ${result[0].name}\n\nThis will merge the imported data with your existing data. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            onPress: async () => {
              setLoading(true);
              setRestoreProgress(0);
              
              try {
                // Simulate import process
                for (let i = 0; i <= 100; i += 20) {
                  setRestoreProgress(i);
                  await new Promise(resolve => setTimeout(resolve, 300));
                }
                
                setImportModal(false);
                Vibration.vibrate(100);
                Alert.alert('Success', 'Data imported successfully! 📥✨');
              } catch (error) {
                Alert.alert('Error', 'Import failed. Please check the file format.');
              } finally {
                setLoading(false);
                setRestoreProgress(0);
              }
            }
          }
        ]
      );
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to select file.');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'synced': return COLORS.success;
      case 'syncing': return COLORS.info;
      case 'error': return COLORS.error;
      case 'pending': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'synced': return 'check-circle';
      case 'syncing': return 'sync';
      case 'error': return 'error';
      case 'pending': return 'schedule';
      default: return 'sync';
    }
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
            Data Backup & Sync
          </Text>
          <IconButton
            icon="help-outline"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('Help', 'Manage your training data backups and synchronization settings. Your data is encrypted and securely stored. 🔐')}
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
        {/* Sync Status */}
        <Card style={{ margin: SPACING.md, elevation: 4 }}>
          <Card.Content style={{ paddingVertical: SPACING.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <MaterialIcons 
                name={getSyncStatusIcon()} 
                size={24} 
                color={getSyncStatusColor()}
                style={{ marginRight: SPACING.sm }}
              />
              <Text style={[TEXT_STYLES.h3, { color: getSyncStatusColor() }]}>
                {syncStatus === 'synced' && 'All Data Synced'}
                {syncStatus === 'syncing' && 'Syncing...'}
                {syncStatus === 'error' && 'Sync Error'}
                {syncStatus === 'pending' && 'Sync Pending'}
              </Text>
            </View>
            
            <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md }]}>
              Last sync: {formatDate(lastSyncDate)}
            </Text>
            
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <Button
                mode={syncStatus === 'syncing' ? 'outlined' : 'contained'}
                icon={syncStatus === 'syncing' ? 'sync' : 'cloud-sync'}
                onPress={handleManualSync}
                disabled={syncStatus === 'syncing'}
                loading={syncStatus === 'syncing'}
                style={{ flex: 1 }}
                buttonColor={COLORS.primary}
              >
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button
                mode="outlined"
                icon="settings"
                onPress={() => setSyncModal(true)}
                style={{ flex: 1 }}
              >
                Settings
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Storage Overview */}
        <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              💾 Storage Overview
            </Text>
            
            <View style={{ marginBottom: SPACING.lg }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={TEXT_STYLES.body}>Storage Used</Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                  {dataStats.totalSize} / {dataStats.storageLimit}
                </Text>
              </View>
              <ProgressBar
                progress={dataStats.storageUsed / 100}
                color={dataStats.storageUsed > 80 ? COLORS.error : COLORS.primary}
                style={{ height: 8, borderRadius: 4 }}
              />
              <Text style={[TEXT_STYLES.small, { textAlign: 'center', marginTop: 4 }]}>
                {dataStats.storageUsed}% used
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
              <Surface style={{
                flex: 1,
                minWidth: '45%',
                padding: SPACING.md,
                borderRadius: 8,
                elevation: 1,
              }}>
                <MaterialIcons name="fitness-center" size={20} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>Workouts</Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>{dataStats.workouts}</Text>
              </Surface>
              
              <Surface style={{
                flex: 1,
                minWidth: '45%',
                padding: SPACING.md,
                borderRadius: 8,
                elevation: 1,
              }}>
                <MaterialIcons name="photo-library" size={20} color={COLORS.warning} />
                <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>Media Files</Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>{dataStats.media}</Text>
              </Surface>
              
              <Surface style={{
                flex: 1,
                minWidth: '45%',
                padding: SPACING.md,
                borderRadius: 8,
                elevation: 1,
              }}>
                <MaterialIcons name="jump-rope" size={20} color={COLORS.success} />
                <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>Achievements</Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>{dataStats.achievements}</Text>
              </Surface>
              
              <Surface style={{
                flex: 1,
                minWidth: '45%',
                padding: SPACING.md,
                borderRadius: 8,
                elevation: 1,
              }}>
                <MaterialIcons name="person" size={20} color={COLORS.info} />
                <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>Profile Data</Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>{dataStats.profileData}</Text>
              </Surface>
            </View>
            
            <Button
              mode="outlined"
              icon="storage"
              onPress={() => setStorageModal(true)}
              style={{ marginTop: SPACING.md }}
            >
              Manage Storage
            </Button>
          </Card.Content>
        </Card>

        {/* Backup Actions */}
        <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              📦 Backup & Export
            </Text>
            
            <View style={{ marginBottom: SPACING.lg }}>
              <Text style={[TEXT_STYLES.caption, { marginBottom: 4 }]}>
                Last backup: {formatDate(lastBackupDate)}
              </Text>
              <Text style={[TEXT_STYLES.small, { color: COLORS.success }]}>
                ✓ {dataStats.lastBackupSize} backed up successfully
              </Text>
            </View>

            {backupProgress > 0 && (
              <View style={{ marginBottom: SPACING.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={TEXT_STYLES.caption}>Creating backup...</Text>
                  <Text style={TEXT_STYLES.caption}>{backupProgress}%</Text>
                </View>
                <ProgressBar
                  progress={backupProgress / 100}
                  color={COLORS.primary}
                  style={{ height: 6, borderRadius: 3 }}
                />
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
              <Button
                mode="contained"
                icon="backup"
                onPress={handleManualBackup}
                disabled={loading || backupProgress > 0}
                loading={backupProgress > 0}
                style={{ flex: 1 }}
                buttonColor={COLORS.primary}
              >
                Create Backup
              </Button>
              <Button
                mode="outlined"
                icon="download"
                onPress={() => setExportModal(true)}
                style={{ flex: 1 }}
              >
                Export Data
              </Button>
            </View>
            
            <Button
              mode="text"
              icon="upload"
              onPress={() => setImportModal(true)}
              labelStyle={{ color: COLORS.primary }}
            >
              Import Data from File
            </Button>
          </Card.Content>
        </Card>

        {/* Auto Backup Settings */}
        <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              ⚙️ Automatic Backup
            </Text>
            
            <List.Item
              title="Auto Backup"
              description="Automatically backup your data"
              left={() => <List.Icon icon="backup" />}
              right={() => (
                <Switch
                  value={autoBackupEnabled}
                  onValueChange={(value) => {
                    setAutoBackupEnabled(value);
                    Vibration.vibrate(30);
                  }}
                  thumbColor={autoBackupEnabled ? COLORS.primary : COLORS.border}
                  trackColor={{ false: COLORS.border, true: `${COLORS.primary}40` }}
                />
              )}
            />
            
            <List.Item
              title="Auto Sync"
              description="Keep data synchronized across devices"
              left={() => <List.Icon icon="sync" />}
              right={() => (
                <Switch
                  value={autoSyncEnabled}
                  onValueChange={(value) => {
                    setAutoSyncEnabled(value);
                    Vibration.vibrate(30);
                  }}
                  thumbColor={autoSyncEnabled ? COLORS.primary : COLORS.border}
                  trackColor={{ false: COLORS.border, true: `${COLORS.primary}40` }}
                />
              )}
            />
            
            <List.Item
              title="Include Media Files"
              description="Backup photos and videos"
              left={() => <List.Icon icon="photo-library" />}
              right={() => (
                <Switch
                  value={includeMedia}
                  onValueChange={(value) => {
                    setIncludeMedia(value);
                    Vibration.vibrate(30);
                  }}
                  thumbColor={includeMedia ? COLORS.primary : COLORS.border}
                  trackColor={{ false: COLORS.border, true: `${COLORS.primary}40` }}
                />
              )}
            />
            
            <Divider style={{ marginVertical: SPACING.sm }} />
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.sm }}>
              <Text style={[TEXT_STYLES.body, { flex: 1 }]}>Backup Frequency</Text>
              <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
                {['daily', 'weekly', 'monthly'].map((freq) => (
                  <Chip
                    key={freq}
                    selected={backupFrequency === freq}
                    onPress={() => {
                      setBackupFrequency(freq);
                      Vibration.vibrate(30);
                    }}
                    style={{
                      backgroundColor: backupFrequency === freq ? COLORS.primary : 'transparent'
                    }}
                    textStyle={{
                      color: backupFrequency === freq ? 'white' : COLORS.text
                    }}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Backup History */}
        <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
          <Card.Content>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              📋 Backup History
            </Text>
            
            {backupHistory.slice(0, 5).map((backup) => (
              <View key={backup.id}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.sm,
                }}>
                  <MaterialIcons
                    name={backup.status === 'completed' ? 'check-circle' : 
                          backup.status === 'failed' ? 'error' : 'schedule'}
                    size={20}
                    color={backup.status === 'completed' ? COLORS.success : 
                           backup.status === 'failed' ? COLORS.error : COLORS.warning}
                    style={{ marginRight: SPACING.md }}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={TEXT_STYLES.body}>
                        {formatDate(backup.date)}
                      </Text>
                      <Text style={TEXT_STYLES.caption}>
                        {backup.size}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                      <Chip
                        compact
                        style={{
                          backgroundColor: backup.type === 'auto' ? COLORS.info + '20' : COLORS.warning + '20',
                          marginRight: SPACING.sm,
                        }}
                        textStyle={{
                          color: backup.type === 'auto' ? COLORS.info : COLORS.warning,
                          fontSize: 10,
                        }}
                      >
                        {backup.type === 'auto' ? 'Auto' : 'Manual'}
                      </Chip>
                      <Text style={[
                        TEXT_STYLES.small,
                        {
                          color: backup.status === 'completed' ? COLORS.success : 
                                 backup.status === 'failed' ? COLORS.error : COLORS.warning
                        }
                      ]}>
                        {backup.status.charAt(0).toUpperCase() + backup.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  {backup.status === 'completed' && (
                    <IconButton
                      icon="download"
                      size={20}
                      iconColor={COLORS.primary}
                      onPress={() => Alert.alert('Download Backup', `Download backup from ${formatDate(backup.date)}? 📥`)}
                    />
                  )}
                </View>
                {backup.id < backupHistory[4].id && <Divider style={{ marginVertical: SPACING.xs }} />}
              </View>
            ))}
            
            <Button
              mode="text"
              icon="history"
              onPress={() => Alert.alert('Backup History', 'View complete backup history! 📜')}
              labelStyle={{ color: COLORS.primary }}
              style={{ marginTop: SPACING.sm }}
            >
              View All History
            </Button>
          </Card.Content>
        </Card>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Export Modal */}
      <Portal>
        <Modal
          visible={exportModal}
          onDismiss={() => setExportModal(false)}
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
              📤 Export Training Data
            </Text>
            
            <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
              Select Data Types:
            </Text>
            
            {[
              { key: 'workouts', label: 'Workouts & Sessions', icon: 'fitness-center' },
              { key: 'progress', label: 'Progress & Analytics', icon: 'trending-up' },
              { key: 'achievements', label: 'Achievements & Badges', icon: 'jump-rope' },
              { key: 'profile', label: 'Profile Information', icon: 'person' },
              { key: 'media', label: 'Photos & Videos', icon: 'photo-library' },
            ].map((item) => (
              <List.Item
                key={item.key}
                title={item.label}
                left={() => <List.Icon icon={item.icon} />}
                right={() => (
                  <Switch
                    value={exportSettings[item.key]}
                    onValueChange={(value) => {
                      setExportSettings(prev => ({ ...prev, [item.key]: value }));
                      Vibration.vibrate(30);
                    }}
                    thumbColor={exportSettings[item.key] ? COLORS.primary : COLORS.border}
                  />
                )}
              />
            ))}
            
            <Divider style={{ marginVertical: SPACING.md }} />
            
            <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
              Export Format:
            </Text>
            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
              {[
                { key: 'json', label: 'JSON', description: 'Complete data' },
                { key: 'csv', label: 'CSV', description: 'Spreadsheet format' },
                { key: 'pdf', label: 'PDF', description: 'Report format' },
              ].map((format) => (
                <TouchableOpacity
                  key={format.key}
                  style={{
                    flex: 1,
                    padding: SPACING.sm,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: exportSettings.format === format.key ? COLORS.primary : COLORS.border,
                    backgroundColor: exportSettings.format === format.key ? COLORS.primary + '10' : 'transparent',
                  }}
                  onPress={() => {
                    setExportSettings(prev => ({ ...prev, format: format.key }));
                    Vibration.vibrate(30);
                  }}
                >
                  <Text style={[
                    TEXT_STYLES.caption,
                    {
                      fontWeight: '600',
                      color: exportSettings.format === format.key ? COLORS.primary : COLORS.text,
                      textAlign: 'center'
                    }
                  ]}>
                    {format.label}
                  </Text>
                  <Text style={[
                    TEXT_STYLES.small,
                    {
                      color: exportSettings.format === format.key ? COLORS.primary : COLORS.textSecondary,
                      textAlign: 'center',
                      marginTop: 2
                    }
                  ]}>
                    {format.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
              Date Range:
            </Text>
            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
              {[
                { key: 'all', label: 'All Time' },
                { key: 'thisYear', label: 'This Year' },
                { key: 'custom', label: 'Custom Range' },
              ].map((range) => (
                <Chip
                  key={range.key}
                  selected={exportSettings.dateRange === range.key}
                  onPress={() => {
                    setExportSettings(prev => ({ ...prev, dateRange: range.key }));
                    Vibration.vibrate(30);
                  }}
                  style={{
                    backgroundColor: exportSettings.dateRange === range.key ? COLORS.primary : 'transparent'
                  }}
                  textStyle={{
                    color: exportSettings.dateRange === range.key ? 'white' : COLORS.text
                  }}
                >
                  {range.label}
                </Chip>
              ))}
            </View>
            
            {exportSettings.dateRange === 'custom' && (
              <View style={{ marginBottom: SPACING.md }}>
                <TextInput
                  label="Start Date (YYYY-MM-DD)"
                  value={exportSettings.customStartDate}
                  onChangeText={(text) => setExportSettings(prev => ({ ...prev, customStartDate: text }))}
                  mode="outlined"
                  style={{ marginBottom: SPACING.sm }}
                />
                <TextInput
                  label="End Date (YYYY-MM-DD)"
                  value={exportSettings.customEndDate}
                  onChangeText={(text) => setExportSettings(prev => ({ ...prev, customEndDate: text }))}
                  mode="outlined"
                />
              </View>
            )}
            
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <Button
                mode="outlined"
                onPress={() => setExportModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleExportData}
                loading={loading}
                style={{ flex: 1 }}
                buttonColor={COLORS.primary}
              >
                Export
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Import Modal */}
      <Portal>
        <Modal
          visible={importModal}
          onDismiss={() => setImportModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 12,
            padding: SPACING.lg,
          }}
        >
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
            📥 Import Training Data
          </Text>
          
          <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
            <MaterialIcons name="cloud-upload" size={64} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.md }]}>
              Select a backup file to import your training data.
            </Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
              Supported formats: JSON, CSV, ZIP
            </Text>
          </View>

          {restoreProgress > 0 && (
            <View style={{ marginBottom: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={TEXT_STYLES.caption}>Importing data...</Text>
                <Text style={TEXT_STYLES.caption}>{restoreProgress}%</Text>
              </View>
              <ProgressBar
                progress={restoreProgress / 100}
                color={COLORS.primary}
                style={{ height: 6, borderRadius: 3 }}
              />
            </View>
          )}
          
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <Button
              mode="outlined"
              onPress={() => setImportModal(false)}
              style={{ flex: 1 }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleImportData}
              loading={loading || restoreProgress > 0}
              style={{ flex: 1 }}
              buttonColor={COLORS.primary}
              icon="folder-open"
            >
              Select File
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Sync Settings Modal */}
      <Portal>
        <Modal
          visible={syncModal}
          onDismiss={() => setSyncModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 12,
            padding: SPACING.lg,
          }}
        >
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg }]}>
            🔄 Sync Settings
          </Text>
          
          <List.Item
            title="Real-time Sync"
            description="Sync changes immediately"
            left={() => <List.Icon icon="sync" />}
            right={() => (
              <Switch
                value={true}
                onValueChange={() => Vibration.vibrate(30)}
                thumbColor={COLORS.primary}
              />
            )}
          />
          
          <List.Item
            title="WiFi Only"
            description="Only sync when connected to WiFi"
            left={() => <List.Icon icon="wifi" />}
            right={() => (
              <Switch
                value={false}
                onValueChange={() => Vibration.vibrate(30)}
                thumbColor={COLORS.border}
              />
            )}
          />
          
          <List.Item
            title="Sync Media"
            description="Include photos and videos in sync"
            left={() => <List.Icon icon="photo-library" />}
            right={() => (
              <Switch
                value={true}
                onValueChange={() => Vibration.vibrate(30)}
                thumbColor={COLORS.primary}
              />
            )}
          />
          
          <Divider style={{ marginVertical: SPACING.md }} />
          
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
              Sync Conflicts Resolution:
            </Text>
            {[
              { key: 'server', label: 'Server Wins', description: 'Use server version' },
              { key: 'local', label: 'Local Wins', description: 'Use local version' },
              { key: 'manual', label: 'Ask Me', description: 'Manual resolution' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.sm,
                }}
                onPress={() => Vibration.vibrate(30)}
              >
                <MaterialIcons
                  name={option.key === 'server' ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={20}
                  color={option.key === 'server' ? COLORS.primary : COLORS.border}
                  style={{ marginRight: SPACING.md }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={TEXT_STYLES.body}>{option.label}</Text>
                  <Text style={TEXT_STYLES.small}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <Button
            mode="contained"
            onPress={() => setSyncModal(false)}
            buttonColor={COLORS.primary}
          >
            Save Settings
          </Button>
        </Modal>
      </Portal>

      {/* Storage Management Modal */}
      <Portal>
        <Modal
          visible={storageModal}
          onDismiss={() => setStorageModal(false)}
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
              💾 Storage Management
            </Text>
            
            <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
              <Card.Content>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                  Storage Breakdown
                </Text>
                
                {[
                  { type: 'Media Files', size: '2.5 GB', percentage: 89, color: COLORS.warning },
                  { type: 'Workout Data', size: '280 MB', percentage: 8, color: COLORS.primary },
                  { type: 'Profile & Settings', size: '125 KB', percentage: 2, color: COLORS.success },
                  { type: 'Cache & Temp', size: '45 MB', percentage: 1, color: COLORS.info },
                ].map((item) => (
                  <View key={item.type} style={{ marginBottom: SPACING.md }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={TEXT_STYLES.caption}>{item.type}</Text>
                      <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>
                        {item.size} ({item.percentage}%)
                      </Text>
                    </View>
                    <ProgressBar
                      progress={item.percentage / 100}
                      color={item.color}
                      style={{ height: 6, borderRadius: 3 }}
                    />
                  </View>
                ))}
              </Card.Content>
            </Card>
            
            <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
              Storage Actions:
            </Text>
            
            <List.Item
              title="Clear Cache"
              description="Free up 45 MB"
              left={() => <List.Icon icon="clear" />}
              right={() => (
                <Button
                  mode="outlined"
                  compact
                  onPress={() => Alert.alert('Clear Cache', 'Cache cleared successfully! 🗑️✨')}
                >
                  Clear
                </Button>
              )}
            />
            
            <List.Item
              title="Optimize Media"
              description="Compress photos and videos"
              left={() => <List.Icon icon="compress" />}
              right={() => (
                <Button
                  mode="outlined"
                  compact
                  onPress={() => Alert.alert('Media Optimization', 'This will compress your media files to save space. Continue?')}
                >
                  Optimize
                </Button>
              )}
            />
            
            <List.Item
              title="Delete Old Backups"
              description="Remove backups older than 30 days"
              left={() => <List.Icon icon="delete-sweep" />}
              right={() => (
                <Button
                  mode="outlined"
                  compact
                  onPress={() => Alert.alert('Delete Old Backups', 'This will free up 500 MB. Continue?')}
                >
                  Delete
                </Button>
              )}
            />
            
            <Divider style={{ marginVertical: SPACING.md }} />
            
            <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
                Need more space? Upgrade to Premium for unlimited storage! ⭐
              </Text>
              <Button
                mode="contained"
                icon="star"
                onPress={() => Alert.alert('Upgrade to Premium', 'Get unlimited storage and advanced backup features! 🚀')}
                style={{ marginTop: SPACING.sm }}
                buttonColor={COLORS.warning}
              >
                Upgrade Now
              </Button>
            </View>
            
            <Button
              mode="text"
              onPress={() => setStorageModal(false)}
              labelStyle={{ color: COLORS.primary }}
            >
              Close
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

export default DataBackup;