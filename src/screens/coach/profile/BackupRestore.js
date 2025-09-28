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
  Surface,
  Portal,
  Modal,
  ProgressBar,
  Chip,
  IconButton,
  Avatar,
  FAB,
  Switch,
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

const BackupStore = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isLoading = useSelector(state => state.ui.isLoading);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [autoBackup, setAutoBackup] = useState(true);
  const [cloudSync, setCloudSync] = useState(true);
  const [backupData, setBackupData] = useState({
    totalSize: '245 MB',
    lastBackup: '2 hours ago',
    nextBackup: 'Tomorrow at 3:00 AM',
    cloudStorage: '1.2 GB / 5 GB',
    backupCount: 12,
  });

  const [backupHistory, setBackupHistory] = useState([
    {
      id: 1,
      date: '2025-08-17T10:30:00Z',
      size: '245 MB',
      type: 'Full Backup',
      status: 'completed',
      clients: 24,
      sessions: 156,
      plans: 8,
    },
    {
      id: 2,
      date: '2025-08-16T03:00:00Z',
      size: '242 MB',
      type: 'Auto Backup',
      status: 'completed',
      clients: 24,
      sessions: 154,
      plans: 8,
    },
    {
      id: 3,
      date: '2025-08-15T15:45:00Z',
      size: '238 MB',
      type: 'Manual Backup',
      status: 'completed',
      clients: 23,
      sessions: 150,
      plans: 7,
    },
    {
      id: 4,
      date: '2025-08-14T03:00:00Z',
      size: '235 MB',
      type: 'Auto Backup',
      status: 'partial',
      clients: 23,
      sessions: 148,
      plans: 7,
    },
  ]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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
      // Simulate API call to refresh backup data
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchBackupData());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh backup data');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleCreateBackup = useCallback(async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    Vibration.vibrate(100);

    try {
      // Simulate backup process with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setBackupProgress(i / 100);
        
        Animated.timing(progressAnim, {
          toValue: i / 100,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }

      // Add new backup to history
      const newBackup = {
        id: Date.now(),
        date: new Date().toISOString(),
        size: '247 MB',
        type: 'Manual Backup',
        status: 'completed',
        clients: 24,
        sessions: 156,
        plans: 8,
      };

      setBackupHistory(prev => [newBackup, ...prev]);
      setBackupModalVisible(false);
      
      Alert.alert('Success! 🎉', 'Your data has been backed up successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create backup');
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  }, []);

  const handleRestoreBackup = useCallback(async (backup) => {
    setIsRestoring(true);
    setRestoreProgress(0);
    setSelectedBackup(backup);
    Vibration.vibrate(100);

    try {
      // Simulate restore process
      for (let i = 0; i <= 100; i += 15) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setRestoreProgress(i / 100);
      }

      setRestoreModalVisible(false);
      Alert.alert('Success! 🎉', 'Your data has been restored successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to restore backup');
    } finally {
      setIsRestoring(false);
      setRestoreProgress(0);
      setSelectedBackup(null);
    }
  }, []);

  const handleDeleteBackup = useCallback((backupId) => {
    Alert.alert(
      'Delete Backup',
      'Are you sure you want to delete this backup? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBackupHistory(prev => prev.filter(backup => backup.id !== backupId));
            Vibration.vibrate(50);
            Alert.alert('Deleted! 🗑️', 'Backup has been deleted successfully');
          },
        },
      ]
    );
  }, []);

  const handleExportData = useCallback(() => {
    Alert.alert(
      'Export Data',
      'Choose export format for your coaching data:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PDF Report', onPress: () => Alert.alert('Feature Coming Soon! 🚧', 'PDF export is being developed.') },
        { text: 'CSV Data', onPress: () => Alert.alert('Feature Coming Soon! 🚧', 'CSV export is being developed.') },
        { text: 'JSON Backup', onPress: () => Alert.alert('Feature Coming Soon! 🚧', 'JSON export is being developed.') },
      ]
    );
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'partial': return COLORS.warning;
      case 'failed': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'partial': return 'warning';
      case 'failed': return 'error';
      default: return 'info';
    }
  };

  const renderBackupHeader = () => (
    <Surface style={styles.backupHeader} elevation={2}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="cloud-upload" size={40} color="white" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: SPACING.xs }]}>
              Backup & Restore 💾
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
              Keep your coaching data safe
            </Text>
          </View>
        </View>
        
        <View style={styles.storageInfo}>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            Cloud Storage Used
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'white', fontWeight: 'bold' }]}>
            {backupData.cloudStorage}
          </Text>
          <ProgressBar
            progress={0.24}
            color="rgba(255,255,255,0.8)"
            style={styles.storageProgress}
          />
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderQuickActions = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.md }]}>
          Quick Actions ⚡
        </Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setBackupModalVisible(true);
              Vibration.vibrate(50);
            }}
          >
            <LinearGradient
              colors={[COLORS.success, '#45a049']}
              style={styles.actionGradient}
            >
              <MaterialIcons name="backup" size={24} color="white" />
              <Text style={styles.actionText}>Create Backup</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setRestoreModalVisible(true);
              Vibration.vibrate(50);
            }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.actionGradient}
            >
              <MaterialIcons name="restore" size={24} color="white" />
              <Text style={styles.actionText}>Restore Data</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              handleExportData();
              Vibration.vibrate(50);
            }}
          >
            <LinearGradient
              colors={[COLORS.warning, '#f57c00']}
              style={styles.actionGradient}
            >
              <MaterialIcons name="file-download" size={24} color="white" />
              <Text style={styles.actionText}>Export Data</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert('Feature Coming Soon! 🚧', 'Cloud sync settings are being developed.');
              Vibration.vibrate(50);
            }}
          >
            <LinearGradient
              colors={['#9c27b0', '#7b1fa2']}
              style={styles.actionGradient}
            >
              <MaterialIcons name="sync" size={24} color="white" />
              <Text style={styles.actionText}>Sync Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderBackupSettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.md }]}>
          Backup Settings ⚙️
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[TEXT_STYLES.body, { color: COLORS.text }]}>Auto Backup</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Daily automatic backups at 3:00 AM
            </Text>
          </View>
          <Switch
            value={autoBackup}
            onValueChange={setAutoBackup}
            color={COLORS.primary}
          />
        </View>

        <Divider style={{ marginVertical: SPACING.md }} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[TEXT_STYLES.body, { color: COLORS.text }]}>Cloud Sync</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Sync data across all devices
            </Text>
          </View>
          <Switch
            value={cloudSync}
            onValueChange={setCloudSync}
            color={COLORS.primary}
          />
        </View>

        <Divider style={{ marginVertical: SPACING.md }} />

        <View style={styles.backupStats}>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Last Backup</Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.text, fontWeight: '600' }]}>
              {backupData.lastBackup}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Next Backup</Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.text, fontWeight: '600' }]}>
              {backupData.nextBackup}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderBackupHistory = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.md }]}>
          Backup History 📚
        </Text>
        
        {backupHistory.map((backup, index) => (
          <View key={backup.id} style={styles.backupItem}>
            <View style={styles.backupInfo}>
              <View style={styles.backupHeader}>
                <MaterialIcons
                  name={getStatusIcon(backup.status)}
                  size={20}
                  color={getStatusColor(backup.status)}
                />
                <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginLeft: SPACING.sm }]}>
                  {backup.type}
                </Text>
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.statusChip, { borderColor: getStatusColor(backup.status) }]}
                  textStyle={{ color: getStatusColor(backup.status), fontSize: 10 }}
                >
                  {backup.status}
                </Chip>
              </View>
              
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: SPACING.xs }]}>
                {formatDate(backup.date)} • {backup.size}
              </Text>
              
              <View style={styles.backupDetails}>
                <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>
                  {backup.clients} clients • {backup.sessions} sessions • {backup.plans} plans
                </Text>
              </View>
            </View>
            
            <View style={styles.backupActions}>
              <IconButton
                icon="restore"
                iconColor={COLORS.primary}
                size={20}
                onPress={() => handleRestoreBackup(backup)}
              />
              <IconButton
                icon="delete"
                iconColor={COLORS.error}
                size={20}
                onPress={() => handleDeleteBackup(backup.id)}
              />
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderBackupModal = () => (
    <Portal>
      <Modal
        visible={backupModalVisible}
        onDismiss={() => !isBackingUp && setBackupModalVisible(false)}
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
                {isBackingUp ? 'Creating Backup... 💾' : 'Create New Backup 🆕'}
              </Text>
              
              {isBackingUp ? (
                <View style={styles.progressContainer}>
                  <ProgressBar
                    progress={backupProgress}
                    color={COLORS.primary}
                    style={styles.progressBar}
                  />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm }]}>
                    {Math.round(backupProgress * 100)}% complete
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.text, textAlign: 'center', marginTop: SPACING.md }]}>
                    Securing your coaching data...
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.lg }]}>
                    This will create a complete backup of all your coaching data including:
                  </Text>
                  
                  <View style={styles.backupIncludes}>
                    {[
                      '👥 Client profiles and progress',
                      '📋 Training plans and sessions',
                      '📊 Performance analytics',
                      '💬 Messages and feedback',
                      '⚙️ App settings and preferences'
                    ].map((item, index) => (
                      <Text key={index} style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                        {item}
                      </Text>
                    ))}
                  </View>
                  
                  <View style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => setBackupModalVisible(false)}
                      style={styles.modalButton}
                    >
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleCreateBackup}
                      style={styles.modalButton}
                      buttonColor={COLORS.primary}
                      icon="backup"
                    >
                      Create Backup
                    </Button>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderRestoreModal = () => (
    <Portal>
      <Modal
        visible={restoreModalVisible}
        onDismiss={() => !isRestoring && setRestoreModalVisible(false)}
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
                {isRestoring ? 'Restoring Data... 🔄' : 'Restore From Backup 📤'}
              </Text>
              
              {isRestoring ? (
                <View style={styles.progressContainer}>
                  <ProgressBar
                    progress={restoreProgress}
                    color={COLORS.primary}
                    style={styles.progressBar}
                  />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm }]}>
                    {Math.round(restoreProgress * 100)}% complete
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.text, textAlign: 'center', marginTop: SPACING.md }]}>
                    Restoring your coaching data...
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.backupList}>
                  {backupHistory.slice(0, 5).map((backup) => (
                    <TouchableOpacity
                      key={backup.id}
                      style={[
                        styles.backupOption,
                        selectedBackup?.id === backup.id && styles.selectedBackup
                      ]}
                      onPress={() => setSelectedBackup(backup)}
                    >
                      <View style={styles.optionInfo}>
                        <Text style={[TEXT_STYLES.body, { color: COLORS.text }]}>
                          {backup.type}
                        </Text>
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          {formatDate(backup.date)} • {backup.size}
                        </Text>
                      </View>
                      <MaterialIcons
                        name={selectedBackup?.id === backup.id ? "radio-button-checked" : "radio-button-unchecked"}
                        size={20}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              
              {!isRestoring && (
                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setRestoreModalVisible(false)}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => selectedBackup && handleRestoreBackup(selectedBackup)}
                    style={styles.modalButton}
                    buttonColor={COLORS.primary}
                    disabled={!selectedBackup}
                    icon="restore"
                  >
                    Restore Data
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        </BlurView>
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
              title="Syncing backups..."
              titleColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderBackupHeader()}
          {renderQuickActions()}
          {renderBackupSettings()}
          {renderBackupHistory()}
        </ScrollView>
      </Animated.View>
      
      <FAB
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        icon="backup"
        onPress={() => {
          setBackupModalVisible(true);
          Vibration.vibrate(50);
        }}
        label="Quick Backup"
      />
      
      {renderBackupModal()}
      {renderRestoreModal()}
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
    paddingBottom: SPACING.xl * 3,
  },
  backupHeader: {
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
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  storageInfo: {
    alignItems: 'center',
  },
  storageProgress: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginTop: SPACING.sm,
  },
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: SPACING.sm,
    overflow: 'hidden',
    elevation: 2,
  },
  actionGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '600',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  backupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  backupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backupInfo: {
    flex: 1,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    marginLeft: 'auto',
    height: 20,
  },
  backupDetails: {
    marginTop: SPACING.xs,
  },
  backupActions: {
    flexDirection: 'row',
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
  progressContainer: {
    paddingVertical: SPACING.lg,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
 backupIncludes: {
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  backupList: {
    maxHeight: 300,
    marginBottom: SPACING.lg,
  },
  backupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedBackup: {
    backgroundColor: `${COLORS.primary}20`,
    borderColor: COLORS.primary,
  },
  optionInfo: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
});

export default BackupStore;