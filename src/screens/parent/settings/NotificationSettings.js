import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { 
  Card,
  Button,
  Divider,
  List,
  Portal,
  Modal,
  Chip,
  SegmentedButtons,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../../styles/colors';

const NotificationSettings = ({ navigation, route }) => {
  // Get user role from route params or storage
  const [userRole, setUserRole] = useState(route?.params?.userRole || 'player');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [quietHoursModalVisible, setQuietHoursModalVisible] = useState(false);
  const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    // Training & Sessions
    sessionReminders: {
      enabled: true,
      frequency: '30min', // 15min, 30min, 1hour, 2hour
      sound: true,
      vibration: true,
    },
    sessionUpdates: {
      enabled: true,
      frequency: 'instant',
      sound: true,
      vibration: false,
    },
    newTrainingPlans: {
      enabled: true,
      frequency: 'instant',
      sound: true,
      vibration: true,
    },
    
    // Communication
    coachMessages: {
      enabled: true,
      frequency: 'instant',
      sound: true,
      vibration: true,
    },
    playerMessages: {
      enabled: true,
      frequency: 'instant',
      sound: true,
      vibration: true,
    },
    groupMessages: {
      enabled: true,
      frequency: 'bundled', // instant, bundled, summary
      sound: true,
      vibration: false,
    },
    
    // Performance & Progress
    performanceUpdates: {
      enabled: true,
      frequency: 'weekly',
      sound: false,
      vibration: false,
    },
    milestoneAchievements: {
      enabled: true,
      frequency: 'instant',
      sound: true,
      vibration: true,
    },
    progressReports: {
      enabled: true,
      frequency: 'weekly',
      sound: false,
      vibration: false,
    },
    
    // Bookings & Payments
    bookingConfirmations: {
      enabled: true,
      frequency: 'instant',
      sound: true,
      vibration: true,
    },
    paymentReminders: {
      enabled: true,
      frequency: '24hours',
      sound: true,
      vibration: false,
    },
    paymentConfirmations: {
      enabled: true,
      frequency: 'instant',
      sound: true,
      vibration: true,
    },
    
    // AI & Recommendations
    aiRecommendations: {
      enabled: true,
      frequency: 'weekly',
      sound: false,
      vibration: false,
    },
    nutritionTips: {
      enabled: true,
      frequency: 'daily',
      sound: false,
      vibration: false,
    },
    recoveryReminders: {
      enabled: true,
      frequency: 'custom',
      sound: false,
      vibration: false,
    },
    
    // Social & Community
    newConnections: {
      enabled: true,
      frequency: 'instant',
      sound: true,
      vibration: false,
    },
    teamUpdates: {
      enabled: true,
      frequency: 'bundled',
      sound: false,
      vibration: false,
    },
    eventInvitations: {
      enabled: true,
      frequency: 'instant',
      sound: true,
      vibration: true,
    },
    
    // System & General
    appUpdates: {
      enabled: true,
      frequency: 'weekly',
      sound: false,
      vibration: false,
    },
    maintenanceAlerts: {
      enabled: true,
      frequency: 'instant',
      sound: false,
      vibration: false,
    },
    securityAlerts: {
      enabled: true,
      frequency: 'instant',
      sound: true,
      vibration: true,
    },
  });

  // Quiet hours settings
  const [quietHours, setQuietHours] = useState({
    enabled: true,
    startTime: '22:00',
    endTime: '07:00',
    weekendsOnly: false,
  });

  // Global settings
  const [globalSettings, setGlobalSettings] = useState({
    doNotDisturb: false,
    notificationsEnabled: true,
    badgeCount: true,
    lockScreenPreview: true,
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      const savedQuietHours = await AsyncStorage.getItem('quietHours');
      const savedGlobalSettings = await AsyncStorage.getItem('globalNotificationSettings');
      const savedUserRole = await AsyncStorage.getItem('userRole');

      if (savedSettings) {
        setNotificationSettings(JSON.parse(savedSettings));
      }
      if (savedQuietHours) {
        setQuietHours(JSON.parse(savedQuietHours));
      }
      if (savedGlobalSettings) {
        setGlobalSettings(JSON.parse(savedGlobalSettings));
      }
      if (savedUserRole) {
        setUserRole(savedUserRole);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      await AsyncStorage.setItem('quietHours', JSON.stringify(quietHours));
      await AsyncStorage.setItem('globalNotificationSettings', JSON.stringify(globalSettings));
      
      // Here you would typically sync with your backend API
      // await syncNotificationSettingsWithServer(notificationSettings);
      
      Alert.alert('Success', 'Notification settings have been saved successfully.');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings. Please try again.');
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all notification settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Reset to initial state
            setNotificationSettings({
              // ... (copy the initial state from above)
            });
            setQuietHours({
              enabled: true,
              startTime: '22:00',
              endTime: '07:00',
              weekendsOnly: false,
            });
            setGlobalSettings({
              doNotDisturb: false,
              notificationsEnabled: true,
              badgeCount: true,
              lockScreenPreview: true,
            });
          },
        },
      ]
    );
  };

  const updateNotificationSetting = (category, property, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [property]: value,
      },
    }));
  };

  const updateGlobalSetting = (property, value) => {
    setGlobalSettings(prev => ({
      ...prev,
      [property]: value,
    }));
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'instant': 'Instantly',
      '15min': '15 minutes before',
      '30min': '30 minutes before',
      '1hour': '1 hour before',
      '2hour': '2 hours before',
      '24hours': '24 hours before',
      'daily': 'Daily',
      'weekly': 'Weekly',
      'bundled': 'Bundled (few times daily)',
      'summary': 'Daily summary',
      'custom': 'Custom schedule',
    };
    return labels[frequency] || frequency;
  };

  const getNotificationCategoriesByRole = () => {
    const baseCategories = [
      {
        title: 'Training & Sessions',
        icon: 'fitness-center',
        color: COLORS.primary,
        items: ['sessionReminders', 'sessionUpdates', 'newTrainingPlans'],
      },
      {
        title: 'Communication',
        icon: 'chat',
        color: '#2196F3',
        items: userRole === 'coach' 
          ? ['playerMessages', 'groupMessages'] 
          : ['coachMessages', 'groupMessages'],
      },
      {
        title: 'Performance & Progress',
        icon: 'trending-up',
        color: '#4CAF50',
        items: ['performanceUpdates', 'milestoneAchievements', 'progressReports'],
      },
    ];

    if (userRole === 'parent' || userRole === 'player') {
      baseCategories.push({
        title: 'Bookings & Payments',
        icon: 'payment',
        color: '#FF9800',
        items: ['bookingConfirmations', 'paymentReminders', 'paymentConfirmations'],
      });
    }

    baseCategories.push(
      {
        title: 'AI & Recommendations',
        icon: 'psychology',
        color: '#9C27B0',
        items: ['aiRecommendations', 'nutritionTips', 'recoveryReminders'],
      },
      {
        title: 'Social & Community',
        icon: 'groups',
        color: '#FF5722',
        items: userRole === 'coach' 
          ? ['newConnections', 'teamUpdates', 'eventInvitations']
          : ['newConnections', 'teamUpdates', 'eventInvitations'],
      },
      {
        title: 'System & General',
        icon: 'settings',
        color: '#607D8B',
        items: ['appUpdates', 'maintenanceAlerts', 'securityAlerts'],
      }
    );

    return baseCategories;
  };

  const getItemDisplayName = (item) => {
    const names = {
      sessionReminders: 'Session Reminders',
      sessionUpdates: 'Session Updates',
      newTrainingPlans: 'New Training Plans',
      coachMessages: 'Coach Messages',
      playerMessages: 'Player Messages',
      groupMessages: 'Group Messages',
      performanceUpdates: 'Performance Updates',
      milestoneAchievements: 'Milestone Achievements',
      progressReports: 'Progress Reports',
      bookingConfirmations: 'Booking Confirmations',
      paymentReminders: 'Payment Reminders',
      paymentConfirmations: 'Payment Confirmations',
      aiRecommendations: 'AI Recommendations',
      nutritionTips: 'Nutrition Tips',
      recoveryReminders: 'Recovery Reminders',
      newConnections: 'New Connections',
      teamUpdates: 'Team Updates',
      eventInvitations: 'Event Invitations',
      appUpdates: 'App Updates',
      maintenanceAlerts: 'Maintenance Alerts',
      securityAlerts: 'Security Alerts',
    };
    return names[item] || item;
  };

  const FrequencyModal = () => (
    <Modal visible={frequencyModalVisible} onDismiss={() => setFrequencyModalVisible(false)}>
      <Card style={styles.modalCard}>
        <Card.Content>
          <Text style={styles.modalTitle}>Notification Frequency</Text>
          <Text style={styles.modalSubtext}>
            Choose how often you want to receive {getItemDisplayName(selectedCategory)} notifications
          </Text>
          
          <View style={styles.frequencyOptions}>
            {['instant', '15min', '30min', '1hour', '2hour', '24hours', 'daily', 'weekly', 'bundled', 'summary'].map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyOption,
                  notificationSettings[selectedCategory]?.frequency === freq && styles.selectedFrequency
                ]}
                onPress={() => {
                  updateNotificationSetting(selectedCategory, 'frequency', freq);
                  setFrequencyModalVisible(false);
                }}
              >
                <Text style={[
                  styles.frequencyText,
                  notificationSettings[selectedCategory]?.frequency === freq && styles.selectedFrequencyText
                ]}>
                  {getFrequencyLabel(freq)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Button
            mode="outlined"
            onPress={() => setFrequencyModalVisible(false)}
            style={styles.closeButton}
          >
            Close
          </Button>
        </Card.Content>
      </Card>
    </Modal>
  );

  const QuietHoursModal = () => (
    <Modal visible={quietHoursModalVisible} onDismiss={() => setQuietHoursModalVisible(false)}>
      <Card style={styles.modalCard}>
        <Card.Content>
          <Text style={styles.modalTitle}>Quiet Hours</Text>
          <Text style={styles.modalSubtext}>
            Set times when you don't want to receive non-urgent notifications
          </Text>
          
          <View style={styles.quietHoursContent}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Enable Quiet Hours</Text>
              <Switch
                value={quietHours.enabled}
                onValueChange={(value) => setQuietHours(prev => ({ ...prev, enabled: value }))}
                trackColor={{ false: '#767577', true: COLORS.primary + '50' }}
                thumbColor={quietHours.enabled ? COLORS.primary : '#f4f3f4'}
              />
            </View>
            
            {quietHours.enabled && (
              <>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>From:</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>{quietHours.startTime}</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>To:</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>{quietHours.endTime}</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Weekends Only</Text>
                  <Switch
                    value={quietHours.weekendsOnly}
                    onValueChange={(value) => setQuietHours(prev => ({ ...prev, weekendsOnly: value }))}
                    trackColor={{ false: '#767577', true: COLORS.primary + '50' }}
                    thumbColor={quietHours.weekendsOnly ? COLORS.primary : '#f4f3f4'}
                  />
                </View>
              </>
            )}
          </View>
          
          <Button
            mode="contained"
            onPress={() => setQuietHoursModalVisible(false)}
            style={styles.saveButton}
          >
            Save Quiet Hours
          </Button>
        </Card.Content>
      </Card>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading notification settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <TouchableOpacity onPress={saveNotificationSettings}>
          <Icon name="save" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Role Badge */}
        <View style={styles.roleBadgeContainer}>
          <Chip
            mode="flat"
            style={styles.roleBadge}
            textStyle={styles.roleBadgeText}
            icon={
              userRole === 'coach' ? 'sports' :
              userRole === 'player' ? 'sports-football' :
              userRole === 'parent' ? 'family-restroom' : 'person'
            }
          >
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Settings
          </Chip>
        </View>

        {/* Global Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Global Settings</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Icon name="notifications" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>Enable All Notifications</Text>
              </View>
              <Switch
                value={globalSettings.notificationsEnabled}
                onValueChange={(value) => updateGlobalSetting('notificationsEnabled', value)}
                trackColor={{ false: '#767577', true: COLORS.primary + '50' }}
                thumbColor={globalSettings.notificationsEnabled ? COLORS.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Icon name="do-not-disturb" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>Do Not Disturb</Text>
              </View>
              <Switch
                value={globalSettings.doNotDisturb}
                onValueChange={(value) => updateGlobalSetting('doNotDisturb', value)}
                trackColor={{ false: '#767577', true: COLORS.primary + '50' }}
                thumbColor={globalSettings.doNotDisturb ? COLORS.primary : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => setQuietHoursModalVisible(true)}
            >
              <View style={styles.settingInfo}>
                <Icon name="bedtime" size={24} color={COLORS.primary} />
                <View>
                  <Text style={styles.settingText}>Quiet Hours</Text>
                  <Text style={styles.settingSubtext}>
                    {quietHours.enabled ? `${quietHours.startTime} - ${quietHours.endTime}` : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Notification Categories */}
        {getNotificationCategoriesByRole().map((category, categoryIndex) => (
          <Card key={categoryIndex} style={styles.card}>
            <Card.Content>
              <View style={styles.categoryHeader}>
                <Icon name={category.icon} size={24} color={category.color} />
                <Text style={[styles.cardTitle, { color: category.color }]}>
                  {category.title}
                </Text>
              </View>
              
              {category.items.map((item, itemIndex) => {
                const setting = notificationSettings[item];
                return (
                  <View key={itemIndex}>
                    <View style={styles.notificationItem}>
                      <View style={styles.itemHeader}>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemTitle}>{getItemDisplayName(item)}</Text>
                          <Text style={styles.itemFrequency}>
                            {getFrequencyLabel(setting?.frequency || 'instant')}
                          </Text>
                        </View>
                        <Switch
                          value={setting?.enabled || false}
                          onValueChange={(value) => updateNotificationSetting(item, 'enabled', value)}
                          trackColor={{ false: '#767577', true: category.color + '50' }}
                          thumbColor={setting?.enabled ? category.color : '#f4f3f4'}
                        />
                      </View>
                      
                      {setting?.enabled && (
                        <View style={styles.itemOptions}>
                          <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => {
                              setSelectedCategory(item);
                              setFrequencyModalVisible(true);
                            }}
                          >
                            <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.optionText}>
                              {getFrequencyLabel(setting?.frequency || 'instant')}
                            </Text>
                          </TouchableOpacity>
                          
                          <View style={styles.soundVibrationOptions}>
                            <TouchableOpacity
                              style={[
                                styles.miniOption,
                                setting?.sound && styles.miniOptionActive
                              ]}
                              onPress={() => updateNotificationSetting(item, 'sound', !setting?.sound)}
                            >
                              <Icon 
                                name={setting?.sound ? "volume-up" : "volume-off"} 
                                size={16} 
                                color={setting?.sound ? category.color : COLORS.textSecondary} 
                              />
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                              style={[
                                styles.miniOption,
                                setting?.vibration && styles.miniOptionActive
                              ]}
                              onPress={() => updateNotificationSetting(item, 'vibration', !setting?.vibration)}
                            >
                              <Icon 
                                name={setting?.vibration ? "vibration" : "phone-android"} 
                                size={16} 
                                color={setting?.vibration ? category.color : COLORS.textSecondary} 
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                    {itemIndex < category.items.length - 1 && <Divider style={styles.itemDivider} />}
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        ))}

        {/* Action Buttons */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Actions</Text>
            
            <Button
              mode="contained"
              onPress={saveNotificationSettings}
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              icon="save"
            >
              Save All Settings
            </Button>
            
            <Button
              mode="outlined"
              onPress={resetToDefaults}
              style={styles.actionButton}
              textColor={COLORS.error}
              icon="restore"
            >
              Reset to Defaults
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('NotificationHistory')}
              style={styles.actionButton}
              icon="history"
            >
              View Notification History
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modals */}
      <Portal>
        <FrequencyModal />
        <QuietHoursModal />
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  roleBadgeContainer: {
    alignItems: 'center',
    padding: 16,
  },
  roleBadge: {
    backgroundColor: COLORS.primary + '20',
  },
  roleBadgeText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  card: {
    margin: 16,
    marginTop: 0,
    marginBottom: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  settingSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notificationItem: {
    paddingVertical: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemFrequency: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  itemOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingLeft: 4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  optionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  soundVibrationOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  miniOption: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  miniOptionActive: {
    backgroundColor: COLORS.primary + '20',
  },
  itemDivider: {
    marginVertical: 8,
  },
  actionButton: {
    marginVertical: 6,
  },
  bottomPadding: {
    height: 20,
  },
  modalCard: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  frequencyOptions: {
    marginBottom: 20,
  },
  frequencyOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedFrequency: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  frequencyText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedFrequencyText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 8,
  },
  quietHoursContent: {
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  timeLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  timeButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  timeText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 8,
  },
});

export default NotificationSettings;