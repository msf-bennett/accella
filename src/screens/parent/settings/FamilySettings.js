import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';

const { width } = Dimensions.get('window');

const FamilySettings = ({ navigation, route }) => {
  const [familyProfile, setFamilyProfile] = useState({
    familyName: 'Johnson Family',
    address: '123 Oak Street, New York, NY 10001',
    emergencyContact: {
      name: 'John Johnson',
      phone: '+1 (555) 987-6543',
      relationship: 'Father',
    },
    primaryParent: 'Sarah Johnson',
    timezone: 'America/New_York',
    language: 'English',
  });

  const [children, setChildren] = useState([
    {
      id: 'child_001',
      name: 'Emma Johnson',
      age: 12,
      dateOfBirth: '2012-03-15',
      gender: 'Female',
      profileImage: 'https://via.placeholder.com/80x80/FF6B6B/FFFFFF?text=EJ',
      sports: ['Football', 'Swimming'],
      medicalInfo: {
        allergies: ['Peanuts'],
        medications: [],
        emergencyContact: 'Dr. Smith - (555) 123-4567',
        bloodType: 'A+',
      },
      permissions: {
        allowCoachMessaging: true,
        shareProgressWithCoaches: true,
        allowPhotoSharing: true,
        allowLocationTracking: false,
      },
      restrictions: {
        sessionTimeLimit: 120, // minutes
        weeklySessionLimit: 4,
        allowWeekendSessions: true,
        bedtimeRestriction: '21:00',
      },
    },
    {
      id: 'child_002',
      name: 'Jake Johnson',
      age: 9,
      dateOfBirth: '2015-08-22',
      gender: 'Male',
      profileImage: 'https://via.placeholder.com/80x80/4ECDC4/FFFFFF?text=JJ',
      sports: ['Basketball', 'Tennis'],
      medicalInfo: {
        allergies: [],
        medications: ['Inhaler for asthma'],
        emergencyContact: 'Dr. Smith - (555) 123-4567',
        bloodType: 'O+',
      },
      permissions: {
        allowCoachMessaging: false,
        shareProgressWithCoaches: true,
        allowPhotoSharing: false,
        allowLocationTracking: false,
      },
      restrictions: {
        sessionTimeLimit: 90,
        weeklySessionLimit: 3,
        allowWeekendSessions: false,
        bedtimeRestriction: '20:00',
      },
    },
  ]);

  const [privacySettings, setPrivacySettings] = useState({
    shareDataWithAcademies: true,
    allowMarketingCommunications: false,
    shareProgressAnalytics: true,
    allowThirdPartyIntegrations: false,
    dataRetentionPeriod: '2 years',
    allowAnonymousDataCollection: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    requirePinForPayments: true,
    enableTwoFactorAuth: false,
    sessionTimeout: 30, // minutes
    allowBiometricLogin: true,
    requirePasswordChange: false,
    lastPasswordChange: '2024-01-01',
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    sessionReminders: true,
    progressUpdates: true,
    paymentNotifications: true,
    emergencyAlerts: true,
    coachMessages: true,
    weeklyReports: true,
    achievementNotifications: true,
    scheduleChanges: true,
  });

  const [loading, setLoading] = useState(false);
  const [editChildModalVisible, setEditChildModalVisible] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [addChildModalVisible, setAddChildModalVisible] = useState(false);
  const [newChildData, setNewChildData] = useState({
    name: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    sports: [],
  });

  useEffect(() => {
    loadFamilySettings();
  }, []);

  const loadFamilySettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Load family settings from API
    } catch (error) {
      console.error('Error loading family settings:', error);
      Alert.alert('Error', 'Failed to load family settings');
    } finally {
      setLoading(false);
    }
  };

  const updateFamilyProfile = async (updatedProfile) => {
    try {
      setFamilyProfile(prev => ({ ...prev, ...updatedProfile }));
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      Alert.alert('Success', 'Family profile updated');
    } catch (error) {
      console.error('Error updating family profile:', error);
      Alert.alert('Error', 'Failed to update family profile');
    }
  };

  const updateChildProfile = async (childId, updatedData) => {
    try {
      setChildren(prev => 
        prev.map(child => 
          child.id === childId 
            ? { ...child, ...updatedData }
            : child
        )
      );
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      Alert.alert('Success', 'Child profile updated');
    } catch (error) {
      console.error('Error updating child profile:', error);
      Alert.alert('Error', 'Failed to update child profile');
    }
  };

  const addNewChild = async () => {
    if (!newChildData.name || !newChildData.age || !newChildData.dateOfBirth) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newChild = {
        id: `child_${Date.now()}`,
        name: newChildData.name,
        age: parseInt(newChildData.age),
        dateOfBirth: newChildData.dateOfBirth,
        gender: newChildData.gender,
        profileImage: `https://via.placeholder.com/80x80/45B7D1/FFFFFF?text=${newChildData.name.charAt(0)}`,
        sports: newChildData.sports,
        medicalInfo: {
          allergies: [],
          medications: [],
          emergencyContact: '',
          bloodType: '',
        },
        permissions: {
          allowCoachMessaging: true,
          shareProgressWithCoaches: true,
          allowPhotoSharing: true,
          allowLocationTracking: false,
        },
        restrictions: {
          sessionTimeLimit: 120,
          weeklySessionLimit: 4,
          allowWeekendSessions: true,
          bedtimeRestriction: '21:00',
        },
      };

      setChildren(prev => [...prev, newChild]);
      setAddChildModalVisible(false);
      setNewChildData({
        name: '',
        age: '',
        dateOfBirth: '',
        gender: '',
        sports: [],
      });

      Alert.alert('Success', 'Child profile created successfully');
    } catch (error) {
      console.error('Error adding child:', error);
      Alert.alert('Error', 'Failed to add child profile');
    } finally {
      setLoading(false);
    }
  };

  const deleteChild = (childId) => {
    const child = children.find(c => c.id === childId);
    Alert.alert(
      'Delete Child Profile',
      `Are you sure you want to delete ${child.name}'s profile? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setChildren(prev => prev.filter(c => c.id !== childId));
            Alert.alert('Success', 'Child profile deleted');
          }
        },
      ]
    );
  };

  const updatePrivacySetting = (key, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateSecuritySetting = (key, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNotificationPreference = (key, value) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const FamilyProfileSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Family Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditFamilyProfile')}>
          <Icon name="edit" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Family Name:</Text>
          <Text style={styles.infoValue}>{familyProfile.familyName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>{familyProfile.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Primary Parent:</Text>
          <Text style={styles.infoValue}>{familyProfile.primaryParent}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Emergency Contact:</Text>
          <Text style={styles.infoValue}>
            {familyProfile.emergencyContact.name} - {familyProfile.emergencyContact.phone}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Timezone:</Text>
          <Text style={styles.infoValue}>{familyProfile.timezone}</Text>
        </View>
      </View>
    </View>
  );

  const ChildrenSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Children ({children.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddChildModalVisible(true)}
        >
          <Icon name="add" size={16} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add Child</Text>
        </TouchableOpacity>
      </View>

      {children.map(child => (
        <View key={child.id} style={styles.childCard}>
          <Image source={{ uri: child.profileImage }} style={styles.childImage} />
          
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childDetails}>{child.age} years • {child.gender}</Text>
            <Text style={styles.childSports}>Sports: {child.sports.join(', ')}</Text>
          </View>

          <View style={styles.childActions}>
            <TouchableOpacity
              style={styles.editChildButton}
              onPress={() => {
                setSelectedChild(child);
                setEditChildModalVisible(true);
              }}
            >
              <Icon name="edit" size={16} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteChildButton}
              onPress={() => deleteChild(child.id)}
            >
              <Icon name="delete" size={16} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const PrivacySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Privacy Settings</Text>

      {Object.entries(privacySettings).map(([key, value]) => (
        <View key={key} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
            <Text style={styles.settingDescription}>
              {getPrivacyDescription(key)}
            </Text>
          </View>
          {typeof value === 'boolean' ? (
            <Switch
              value={value}
              onValueChange={(newValue) => updatePrivacySetting(key, newValue)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={value ? COLORS.white : COLORS.gray}
            />
          ) : (
            <Text style={styles.settingValue}>{value}</Text>
          )}
        </View>
      ))}
    </View>
  );

  const SecuritySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Security Settings</Text>

      {Object.entries(securitySettings).map(([key, value]) => (
        <View key={key} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
            <Text style={styles.settingDescription}>
              {getSecurityDescription(key)}
            </Text>
          </View>
          {typeof value === 'boolean' ? (
            <Switch
              value={value}
              onValueChange={(newValue) => updateSecuritySetting(key, newValue)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={value ? COLORS.white : COLORS.gray}
            />
          ) : (
            <Text style={styles.settingValue}>{value}</Text>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.changePasswordButton}>
        <Icon name="lock" size={20} color={COLORS.primary} />
        <Text style={styles.changePasswordText}>Change Password</Text>
        <Icon name="chevron-right" size={20} color={COLORS.gray} />
      </TouchableOpacity>
    </View>
  );

  const NotificationsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Preferences</Text>

      {Object.entries(notificationPreferences).map(([key, value]) => (
        <View key={key} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
            <Text style={styles.settingDescription}>
              {getNotificationDescription(key)}
            </Text>
          </View>
          <Switch
            value={value}
            onValueChange={(newValue) => updateNotificationPreference(key, newValue)}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={value ? COLORS.white : COLORS.gray}
          />
        </View>
      ))}
    </View>
  );

  const getPrivacyDescription = (key) => {
    const descriptions = {
      shareDataWithAcademies: 'Allow academies to access child progress data',
      allowMarketingCommunications: 'Receive promotional content and offers',
      shareProgressAnalytics: 'Help improve app with anonymous analytics',
      allowThirdPartyIntegrations: 'Connect with fitness and health apps',
      dataRetentionPeriod: 'How long we keep your family data',
      allowAnonymousDataCollection: 'Help improve app features',
    };
    return descriptions[key] || '';
  };

  const getSecurityDescription = (key) => {
    const descriptions = {
      requirePinForPayments: 'Require PIN confirmation for all payments',
      enableTwoFactorAuth: 'Add extra security to your account',
      sessionTimeout: 'Auto-logout after inactivity (minutes)',
      allowBiometricLogin: 'Use fingerprint or face unlock',
      requirePasswordChange: 'Force password update on next login',
      lastPasswordChange: 'Last time password was updated',
    };
    return descriptions[key] || '';
  };

  const getNotificationDescription = (key) => {
    const descriptions = {
      sessionReminders: 'Get notified before upcoming training sessions',
      progressUpdates: 'Updates about your children\'s progress',
      paymentNotifications: 'Payment confirmations and reminders',
      emergencyAlerts: 'Important safety and emergency notifications',
      coachMessages: 'Messages from coaches and trainers',
      weeklyReports: 'Weekly summary of activities and progress',
      achievementNotifications: 'Celebrate milestones and achievements',
      scheduleChanges: 'Notifications about schedule updates',
    };
    return descriptions[key] || '';
  };

  const EditChildModal = () => {
    if (!selectedChild) return null;

    return (
      <Modal
        visible={editChildModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditChildModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit {selectedChild.name}</Text>
            <TouchableOpacity onPress={() => setEditChildModalVisible(false)}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Permissions</Text>
              
              {Object.entries(selectedChild.permissions).map(([key, value]) => (
                <View key={key} style={styles.modalSettingItem}>
                  <Text style={styles.modalSettingLabel}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <Switch
                    value={value}
                    onValueChange={(newValue) => {
                      const updatedPermissions = {
                        ...selectedChild.permissions,
                        [key]: newValue,
                      };
                      setSelectedChild(prev => ({
                        ...prev,
                        permissions: updatedPermissions,
                      }));
                    }}
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                    thumbColor={value ? COLORS.white : COLORS.gray}
                  />
                </View>
              ))}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Restrictions</Text>
              
              <View style={styles.modalSettingItem}>
                <Text style={styles.modalSettingLabel}>Session Time Limit (minutes)</Text>
                <Text style={styles.modalSettingValue}>{selectedChild.restrictions.sessionTimeLimit}</Text>
              </View>

              <View style={styles.modalSettingItem}>
                <Text style={styles.modalSettingLabel}>Weekly Session Limit</Text>
                <Text style={styles.modalSettingValue}>{selectedChild.restrictions.weeklySessionLimit}</Text>
              </View>

              <View style={styles.modalSettingItem}>
                <Text style={styles.modalSettingLabel}>Allow Weekend Sessions</Text>
                <Switch
                  value={selectedChild.restrictions.allowWeekendSessions}
                  onValueChange={(newValue) => {
                    const updatedRestrictions = {
                      ...selectedChild.restrictions,
                      allowWeekendSessions: newValue,
                    };
                    setSelectedChild(prev => ({
                      ...prev,
                      restrictions: updatedRestrictions,
                    }));
                  }}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={selectedChild.restrictions.allowWeekendSessions ? COLORS.white : COLORS.gray}
                />
              </View>

              <View style={styles.modalSettingItem}>
                <Text style={styles.modalSettingLabel}>Bedtime Restriction</Text>
                <Text style={styles.modalSettingValue}>{selectedChild.restrictions.bedtimeRestriction}</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Medical Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Allergies</Text>
                <Text style={styles.inputValue}>
                  {selectedChild.medicalInfo.allergies.length > 0 
                    ? selectedChild.medicalInfo.allergies.join(', ')
                    : 'None'
                  }
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Medications</Text>
                <Text style={styles.inputValue}>
                  {selectedChild.medicalInfo.medications.length > 0 
                    ? selectedChild.medicalInfo.medications.join(', ')
                    : 'None'
                  }
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Emergency Contact</Text>
                <Text style={styles.inputValue}>{selectedChild.medicalInfo.emergencyContact || 'Not set'}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Blood Type</Text>
                <Text style={styles.inputValue}>{selectedChild.medicalInfo.bloodType || 'Not specified'}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const AddChildModal = () => (
    <Modal
      visible={addChildModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setAddChildModalVisible(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Child</Text>
          <TouchableOpacity onPress={addNewChild} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.saveText}>Add</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.textInput}
              value={newChildData.name}
              onChangeText={(text) => setNewChildData(prev => ({ ...prev, name: text }))}
              placeholder="Enter child's full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age *</Text>
            <TextInput
              style={styles.textInput}
              value={newChildData.age}
              onChangeText={(text) => setNewChildData(prev => ({ ...prev, age: text }))}
              placeholder="Enter age"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth *</Text>
            <TextInput
              style={styles.textInput}
              value={newChildData.dateOfBirth}
              onChangeText={(text) => setNewChildData(prev => ({ ...prev, dateOfBirth: text }))}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderButtons}>
              {['Male', 'Female', 'Other'].map(gender => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderButton,
                    newChildData.gender === gender && styles.selectedGenderButton
                  ]}
                  onPress={() => setNewChildData(prev => ({ ...prev, gender }))}
                >
                  <Text style={[
                    styles.genderButtonText,
                    newChildData.gender === gender && styles.selectedGenderButtonText
                  ]}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Interested Sports</Text>
            <Text style={styles.inputDescription}>
              You can add specific sports and academies later
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading && !editChildModalVisible && !addChildModalVisible) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading family settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <FamilyProfileSection />
      <ChildrenSection />
      <PrivacySection />
      <SecuritySection />
      <NotificationsSection />
      <EditChildModal />
      <AddChildModal />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: 10,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  profileInfo: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 10,
  },
  childImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  childDetails: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  childSports: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
  },
  childActions: {
    flexDirection: 'row',
  },
  editChildButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteChildButton: {
    padding: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 11,
    color: COLORS.gray,
  },
  settingValue: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  changePasswordText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  saveText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 25,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  modalSettingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalSettingLabel: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  modalSettingValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputValue: {
    fontSize: 14,
    color: COLORS.gray,
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
  },
  inputDescription: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedGenderButton: {
    backgroundColor: COLORS.primary,
  },
  genderButtonText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  selectedGenderButtonText: {
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
  },
});

export default FamilySettings;