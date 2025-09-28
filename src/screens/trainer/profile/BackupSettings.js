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
  Platform,
} from 'react-native';
import { 
  Card,
  Button,
  Surface,
  IconButton,
  Divider,
  ProgressBar,
  Portal,
  Modal,
  Chip,
  RadioButton,
  List,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const BackupSettings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { backupSettings, lastBackup } = useSelector(state => state.backup);

  const [refreshing, setRefreshing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  const [settings, setSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily', // daily, weekly, monthly
    backupLocation: 'cloud', // cloud, local, both
    includeMedia: true,
    includeClientData: true,
    includeTrainingPlans: true,
    includeProgress: true,
    includeMessages: false,
    wifiOnly: true,
    backupTime: '02:00',
  });

  const [backupHistory, setBackupHistory] = useState([
    {
      id: '1',
      date: new Date(Date.now() - 86400000),
      size: '12.5 MB',
      type: 'Automatic',
      status: 'completed',
      location: 'Cloud',
    },
    {
      id: '2',
      date: new Date(Date.now() - 172800000),
      size: '11.8 MB',
      type: 'Manual',
      status: 'completed',
      location: 'Cloud',
    },
    {
      id: '3',
      date: new Date(Date.now() - 604800000),
      size: '13.2 MB',
      type: 'Automatic',
      status: 'completed',
      location: 'Local',
    },
  ]);

  const [storageInfo, setStorageInfo] = useState({
    used: 45.7,
    total: 100,
    cloudUsed: 28.3,
    cloudTotal: 50,
    localUsed: 17.4,
    localTotal: 32,
  });

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = useCallback(() => {
    // Initialize backup settings from Redux store
    if (backupSettings) {
      setSettings(prevSettings => ({ ...prevSettings, ...backupSettings }));
    }
  }, [backupSettings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call for refreshing backup data
      setTimeout(() => {
        setRefreshing(false);
      }, 1500);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh backup data');
    }
  }, []);

  const handleBackupNow = useCallback(async () => {
    Vibration.vibrate(50);
    setIsBackingUp(true);
    setBackupProgress(0);
    setShowBackupModal(true);

    try {
      // Simulate backup process with progress
      const backupSteps = [
        'Preparing backup...',
        'Backing up training plans...',
        'Backing up client data...',
        'Backing up progress records...',
        'Backing up media files...',
        'Finalizing backup...',
      ];

      for (let i = 0; i < backupSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBackupProgress((i + 1) / backupSteps.length);
      }

      // Add new backup to history
      const newBackup = {
        id: Date.now().toString(),
        date: new Date(),
        size: '13.7 MB',
        type: 'Manual',
        status: 'completed',
        location: settings.backupLocation === 'cloud' ? 'Cloud' : 'Local',
      };
      
      setBackupHistory(prev => [newBackup, ...prev]);
      setIsBackingUp(false);
      
      Alert.alert(
        'Backup Successful! ✅',
        'Your data has been backed up successfully.',
        [{ text: 'OK', onPress: () => setShowBackupModal(false) }]
      );
    } catch (error) {
      setIsBackingUp(false);
      setShowBackupModal(false);
      Alert.alert('Backup Failed', 'Failed to create backup. Please try again.');
    }
  }, [settings.backupLocation]);

  const handleRestoreBackup = useCallback((backupId) => {
    const backup = backupHistory.find(b => b.id === backupId);
    
    Alert.alert(
      '⚠️ Restore Backup',
      `Are you sure you want to restore from backup created on ${backup.date.toLocaleDateString()}? This will replace your current data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Feature in Development', 'Backup restore feature is being developed.');
          }
        }
      ]
    );
  }, [backupHistory]);

  const handleSaveSettings = useCallback(async () => {
    Vibration.vibrate(50);
    try {
      // Here you would dispatch an action to save backup settings
      // dispatch(updateBackupSettings(settings));
      
      Alert.alert(
        'Settings Saved! 💾',
        'Your backup preferences have been updated.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save backup settings.');
    }
  }, [settings]);

  const renderBackupOverview = () => (
    <Card style={styles.card}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.overviewHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.overviewContent}>
          <Icon name="backup" size={48} color={COLORS.white} />
          <View style={styles.overviewText}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
              Backup Status
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
              {lastBackup ? `Last backup: ${new Date(lastBackup).toLocaleDateString()}` : 'No backups yet'}
            </Text>
          </View>
        </View>
        
        <View style={styles.backupStats}>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Total Backups</Text>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
              {backupHistory.length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Storage Used</Text>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
              {storageInfo.used.toFixed(1)} MB
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      <Card.Content style={styles.quickActions}>
        <Button
          mode="contained"
          onPress={handleBackupNow}
          disabled={isBackingUp}
          buttonColor={COLORS.primary}
          style={styles.actionButton}
          icon="backup"
        >
          {isBackingUp ? 'Backing Up...' : 'Backup Now'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => setShowRestoreModal(true)}
          style={styles.actionButton}
          icon="restore"
        >
          Restore Data
        </Button>
      </Card.Content>
    </Card>
  );

  const renderBackupSettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Backup Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={TEXT_STYLES.body}>Automatic Backup</Text>
            <Text style={TEXT_STYLES.caption}>Enable scheduled backups</Text>
          </View>
          <Switch
            value={settings.autoBackup}
            onValueChange={(value) => 
              setSettings(prev => ({ ...prev, autoBackup: value }))
            }
            trackColor={{ true: COLORS.primary }}
          />
        </View>

        {settings.autoBackup && (
          <>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowScheduleModal(true)}
            >
              <View style={styles.settingLeft}>
                <Text style={TEXT_STYLES.body}>Backup Frequency</Text>
                <Text style={TEXT_STYLES.caption}>
                  Currently: {settings.backupFrequency}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={COLORS.text} />
            </TouchableOpacity>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={TEXT_STYLES.body}>WiFi Only</Text>
                <Text style={TEXT_STYLES.caption}>Only backup on WiFi connection</Text>
              </View>
              <Switch
                value={settings.wifiOnly}
                onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, wifiOnly: value }))
                }
                trackColor={{ true: COLORS.primary }}
              />
            </View>
          </>
        )}

        <Divider style={styles.divider} />

        <Text style={[TEXT_STYLES.subtitle, styles.subsectionTitle]}>What to Backup</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={TEXT_STYLES.body}>Training Plans</Text>
            <Text style={TEXT_STYLES.caption}>All your created training programs</Text>
          </View>
          <Switch
            value={settings.includeTrainingPlans}
            onValueChange={(value) => 
              setSettings(prev => ({ ...prev, includeTrainingPlans: value }))
            }
            trackColor={{ true: COLORS.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={TEXT_STYLES.body}>Client Data</Text>
            <Text style={TEXT_STYLES.caption}>Client profiles and information</Text>
          </View>
          <Switch
            value={settings.includeClientData}
            onValueChange={(value) => 
              setSettings(prev => ({ ...prev, includeClientData: value }))
            }
            trackColor={{ true: COLORS.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={TEXT_STYLES.body}>Progress Records</Text>
            <Text style={TEXT_STYLES.caption}>Performance tracking data</Text>
          </View>
          <Switch
            value={settings.includeProgress}
            onValueChange={(value) => 
              setSettings(prev => ({ ...prev, includeProgress: value }))
            }
            trackColor={{ true: COLORS.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={TEXT_STYLES.body}>Media Files</Text>
            <Text style={TEXT_STYLES.caption}>Photos, videos, and documents</Text>
          </View>
          <Switch
            value={settings.includeMedia}
            onValueChange={(value) => 
              setSettings(prev => ({ ...prev, includeMedia: value }))
            }
            trackColor={{ true: COLORS.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={TEXT_STYLES.body}>Messages</Text>
            <Text style={TEXT_STYLES.caption}>Chat history with clients</Text>
          </View>
          <Switch
            value={settings.includeMessages}
            onValueChange={(value) => 
              setSettings(prev => ({ ...prev, includeMessages: value }))
            }
            trackColor={{ true: COLORS.primary }}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSaveSettings}
          style={styles.saveButton}
          buttonColor={COLORS.primary}
          icon="save"
        >
          Save Settings
        </Button>
      </Card.Content>
    </Card>
  );

  const renderStorageInfo = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Storage Usage</Text>
        
        <View style={styles.storageItem}>
          <View style={styles.storageHeader}>
            <Text style={TEXT_STYLES.body}>Cloud Storage</Text>
            <Text style={TEXT_STYLES.caption}>
              {storageInfo.cloudUsed.toFixed(1)} / {storageInfo.cloudTotal} GB
            </Text>
          </View>
          <ProgressBar
            progress={storageInfo.cloudUsed / storageInfo.cloudTotal}
            color={COLORS.primary}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.storageItem}>
          <View style={styles.storageHeader}>
            <Text style={TEXT_STYLES.body}>Local Storage</Text>
            <Text style={TEXT_STYLES.caption}>
              {storageInfo.localUsed.toFixed(1)} / {storageInfo.localTotal} GB
            </Text>
          </View>
          <ProgressBar
            progress={storageInfo.localUsed / storageInfo.localTotal}
            color={COLORS.success}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.storageActions}>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Feature in Development', 'Storage cleanup is being developed.')}
            style={styles.storageButton}
            icon="cleaning-services"
          >
            Clean Up
          </Button>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Feature in Development', 'Storage upgrade is being developed.')}
            style={styles.storageButton}
            icon="upgrade"
          >
            Upgrade
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderBackupHistory = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Recent Backups</Text>
        
        {backupHistory.map((backup, index) => (
          <TouchableOpacity
            key={backup.id}
            style={styles.historyItem}
            onPress={() => handleRestoreBackup(backup.id)}
          >
            <Surface style={styles.historyIcon}>
              <Icon
                name={backup.status === 'completed' ? 'check-circle' : 'error'}
                size={24}
                color={backup.status === 'completed' ? COLORS.success : COLORS.error}
              />
            </Surface>
            
            <View style={styles.historyContent}>
              <Text style={TEXT_STYLES.body}>
                {backup.type} Backup
              </Text>
              <Text style={TEXT_STYLES.caption}>
                {backup.date.toLocaleDateString()} • {backup.size} • {backup.location}
              </Text>
            </View>
            
            <View style={styles.historyActions}>
              <Chip
                mode="outlined"
                compact
                style={[styles.statusChip, {
                  backgroundColor: backup.status === 'completed' 
                    ? COLORS.success + '20' 
                    : COLORS.error + '20'
                }]}
              >
                {backup.status}
              </Chip>
            </View>
          </TouchableOpacity>
        ))}
        
        <Button
          mode="text"
          onPress={() => Alert.alert('Feature in Development', 'Backup history view is being developed.')}
          style={styles.viewAllButton}
        >
          View All Backups
        </Button>
      </Card.Content>
    </Card>
  );

  const renderBackupModal = () => (
    <Portal>
      <Modal
        visible={showBackupModal}
        onDismiss={() => !isBackingUp && setShowBackupModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.backupModalContent}>
          <Icon name="backup" size={64} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
            {isBackingUp ? 'Creating Backup...' : 'Backup Complete'}
          </Text>
          {isBackingUp && (
            <>
              <ProgressBar
                progress={backupProgress}
                color={COLORS.primary}
                style={styles.backupProgress}
              />
              <Text style={TEXT_STYLES.caption}>
                {Math.round(backupProgress * 100)}% Complete
              </Text>
            </>
          )}
        </View>
      </Modal>
    </Portal>
  );

  const renderRestoreModal = () => (
    <Portal>
      <Modal
        visible={showRestoreModal}
        onDismiss={() => setShowRestoreModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView>
          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>Restore Backup</Text>
          <Text style={[TEXT_STYLES.body, styles.modalSubtitle]}>
            Select a backup to restore your data from:
          </Text>
          
          {backupHistory.slice(0, 5).map((backup) => (
            <TouchableOpacity
              key={backup.id}
              style={styles.restoreItem}
              onPress={() => {
                setShowRestoreModal(false);
                handleRestoreBackup(backup.id);
              }}
            >
              <View style={styles.restoreContent}>
                <Text style={TEXT_STYLES.body}>
                  {backup.type} Backup
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {backup.date.toLocaleDateString()} • {backup.size}
                </Text>
              </View>
              <Icon name="restore" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ))}
          
          <Button
            mode="outlined"
            onPress={() => setShowRestoreModal(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderScheduleModal = () => (
    <Portal>
      <Modal
        visible={showScheduleModal}
        onDismiss={() => setShowScheduleModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>Backup Schedule</Text>
        
        <RadioButton.Group
          onValueChange={value => setSettings(prev => ({ ...prev, backupFrequency: value }))}
          value={settings.backupFrequency}
        >
          <View style={styles.radioItem}>
            <RadioButton value="daily" color={COLORS.primary} />
            <Text style={TEXT_STYLES.body}>Daily</Text>
          </View>
          <View style={styles.radioItem}>
            <RadioButton value="weekly" color={COLORS.primary} />
            <Text style={TEXT_STYLES.body}>Weekly</Text>
          </View>
          <View style={styles.radioItem}>
            <RadioButton value="monthly" color={COLORS.primary} />
            <Text style={TEXT_STYLES.body}>Monthly</Text>
          </View>
        </RadioButton.Group>
        
        <View style={styles.modalButtons}>
          <Button
            mode="outlined"
            onPress={() => setShowScheduleModal(false)}
            style={[styles.modalButton, { marginRight: SPACING.md }]}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={() => setShowScheduleModal(false)}
            style={styles.modalButton}
            buttonColor={COLORS.primary}
          >
            Save
          </Button>
        </View>
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
        {renderBackupOverview()}
        {renderBackupSettings()}
        {renderStorageInfo()}
        {renderBackupHistory()}
      </ScrollView>

      {renderBackupModal()}
      {renderRestoreModal()}
      {renderScheduleModal()}
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
  overviewHeader: {
    padding: SPACING.lg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  overviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  overviewText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  backupStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  subsectionTitle: {
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
    color: COLORS.text,
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
  divider: {
    marginVertical: SPACING.md,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
  storageItem: {
    marginBottom: SPACING.md,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  storageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  storageButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  historyContent: {
    flex: 1,
  },
  historyActions: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 24,
  },
  viewAllButton: {
    marginTop: SPACING.sm,
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
  modalSubtitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.textSecondary,
  },
  backupModalContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  backupProgress: {
    width: '100%',
    marginVertical: SPACING.lg,
    height: 8,
    borderRadius: 4,
  },
  restoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  restoreContent: {
    flex: 1,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
  },
});

export default BackupSettings;
