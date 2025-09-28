import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/colors';

const PrivacySettings = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    // Child Profile Visibility
    childProfileVisibility: {
      coachesOnly: true,
      academyStaff: true,
      otherParents: false,
      publicSearch: false,
    },
    
    // Performance Data Sharing
    performanceDataSharing: {
      shareWithCoach: true,
      shareWithAcademy: true,
      shareForAnalytics: false,
      allowComparisons: false,
    },
    
    // Location & Tracking
    locationSettings: {
      shareLocation: true,
      trackAttendance: true,
      nearbyRecommendations: true,
      locationHistory: false,
    },
    
    // Communication & Messaging
    communicationSettings: {
      allowDirectMessages: true,
      coachMessagesOnly: true,
      groupChats: true,
      mediaSharing: true,
      readReceipts: false,
    },
    
    // Marketing & Notifications
    marketingSettings: {
      promotionalEmails: false,
      academyOffers: true,
      parentCommunity: false,
      thirdPartyOffers: false,
      analytics: false,
    },
    
    // Data Retention
    dataRetentionSettings: {
      keepAfterLeaving: false,
      shareWithNewCoach: true,
      exportDataOnRequest: true,
      autoDeleteInactive: true,
    },
    
    // Child Safety & Monitoring
    childSafetySettings: {
      parentalApproval: true,
      monitorMessages: true,
      restrictedWords: true,
      reportInappropriate: true,
      blockUnknownUsers: true,
    },
  });

  const handleSettingChange = (category, setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      }
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      Alert.alert('Success', 'Privacy settings have been updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update privacy settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'We will prepare your data export and send it to your registered email within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Export', onPress: () => console.log('Data export requested') }
      ]
    );
  };

  const handleAccountDeletion = () => {
    if (deleteConfirmText.toLowerCase() === 'delete my account') {
      Alert.alert(
        'Account Deletion',
        'Your account deletion request has been submitted. All data will be permanently deleted within 30 days.',
        [{ text: 'OK', onPress: () => setShowDeleteModal(false) }]
      );
      setDeleteConfirmText('');
    } else {
      Alert.alert('Error', 'Please type "DELETE MY ACCOUNT" to confirm.');
    }
  };

  const SettingSection = ({ title, children, icon }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const SettingRow = ({ title, description, value, onValueChange, category, setting }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => onValueChange(category, setting, newValue)}
        trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '40' }}
        thumbColor={value ? COLORS.primary : COLORS.gray}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Settings</Text>
        <TouchableOpacity onPress={saveSettings} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.introText}>
          Manage how your child's information is shared and used within the app. 
          Your privacy is important to us.
        </Text>

        <SettingSection title="Child Profile Visibility" icon="person-outline">
          <SettingRow
            title="Visible to Coaches"
            description="Allow assigned coaches to view child's profile"
            value={privacySettings.childProfileVisibility.coachesOnly}
            onValueChange={handleSettingChange}
            category="childProfileVisibility"
            setting="coachesOnly"
          />
          <SettingRow
            title="Visible to Academy Staff"
            description="Allow academy staff to view profile information"
            value={privacySettings.childProfileVisibility.academyStaff}
            onValueChange={handleSettingChange}
            category="childProfileVisibility"
            setting="academyStaff"
          />
          <SettingRow
            title="Visible to Other Parents"
            description="Show profile in parent community features"
            value={privacySettings.childProfileVisibility.otherParents}
            onValueChange={handleSettingChange}
            category="childProfileVisibility"
            setting="otherParents"
          />
          <SettingRow
            title="Public Search Results"
            description="Include profile in public search results"
            value={privacySettings.childProfileVisibility.publicSearch}
            onValueChange={handleSettingChange}
            category="childProfileVisibility"
            setting="publicSearch"
          />
        </SettingSection>

        <SettingSection title="Performance Data Sharing" icon="analytics-outline">
          <SettingRow
            title="Share with Coach"
            description="Allow coaches to access performance metrics"
            value={privacySettings.performanceDataSharing.shareWithCoach}
            onValueChange={handleSettingChange}
            category="performanceDataSharing"
            setting="shareWithCoach"
          />
          <SettingRow
            title="Share with Academy"
            description="Allow academy to access training data"
            value={privacySettings.performanceDataSharing.shareWithAcademy}
            onValueChange={handleSettingChange}
            category="performanceDataSharing"
            setting="shareWithAcademy"
          />
          <SettingRow
            title="Anonymous Analytics"
            description="Help improve the app with anonymous data"
            value={privacySettings.performanceDataSharing.shareForAnalytics}
            onValueChange={handleSettingChange}
            category="performanceDataSharing"
            setting="shareForAnalytics"
          />
          <SettingRow
            title="Performance Comparisons"
            description="Allow comparing with other players anonymously"
            value={privacySettings.performanceDataSharing.allowComparisons}
            onValueChange={handleSettingChange}
            category="performanceDataSharing"
            setting="allowComparisons"
          />
        </SettingSection>

        <SettingSection title="Location & Tracking" icon="location-outline">
          <SettingRow
            title="Share Location"
            description="Allow location sharing for nearby features"
            value={privacySettings.locationSettings.shareLocation}
            onValueChange={handleSettingChange}
            category="locationSettings"
            setting="shareLocation"
          />
          <SettingRow
            title="Attendance Tracking"
            description="Track session attendance automatically"
            value={privacySettings.locationSettings.trackAttendance}
            onValueChange={handleSettingChange}
            category="locationSettings"
            setting="trackAttendance"
          />
          <SettingRow
            title="Nearby Recommendations"
            description="Get recommendations based on location"
            value={privacySettings.locationSettings.nearbyRecommendations}
            onValueChange={handleSettingChange}
            category="locationSettings"
            setting="nearbyRecommendations"
          />
          <SettingRow
            title="Location History"
            description="Store location history for insights"
            value={privacySettings.locationSettings.locationHistory}
            onValueChange={handleSettingChange}
            category="locationSettings"
            setting="locationHistory"
          />
        </SettingSection>

        <SettingSection title="Communication & Messaging" icon="chatbubble-outline">
          <SettingRow
            title="Allow Direct Messages"
            description="Enable direct messaging features"
            value={privacySettings.communicationSettings.allowDirectMessages}
            onValueChange={handleSettingChange}
            category="communicationSettings"
            setting="allowDirectMessages"
          />
          <SettingRow
            title="Coaches Only"
            description="Limit messages to assigned coaches only"
            value={privacySettings.communicationSettings.coachMessagesOnly}
            onValueChange={handleSettingChange}
            category="communicationSettings"
            setting="coachMessagesOnly"
          />
          <SettingRow
            title="Group Chats"
            description="Allow participation in team/group chats"
            value={privacySettings.communicationSettings.groupChats}
            onValueChange={handleSettingChange}
            category="communicationSettings"
            setting="groupChats"
          />
          <SettingRow
            title="Media Sharing"
            description="Allow sharing photos and videos"
            value={privacySettings.communicationSettings.mediaSharing}
            onValueChange={handleSettingChange}
            category="communicationSettings"
            setting="mediaSharing"
          />
          <SettingRow
            title="Read Receipts"
            description="Show when messages are read"
            value={privacySettings.communicationSettings.readReceipts}
            onValueChange={handleSettingChange}
            category="communicationSettings"
            setting="readReceipts"
          />
        </SettingSection>

        <SettingSection title="Child Safety & Monitoring" icon="shield-checkmark-outline">
          <SettingRow
            title="Parental Approval Required"
            description="Require approval for new connections"
            value={privacySettings.childSafetySettings.parentalApproval}
            onValueChange={handleSettingChange}
            category="childSafetySettings"
            setting="parentalApproval"
          />
          <SettingRow
            title="Monitor Messages"
            description="Allow parental monitoring of messages"
            value={privacySettings.childSafetySettings.monitorMessages}
            onValueChange={handleSettingChange}
            category="childSafetySettings"
            setting="monitorMessages"
          />
          <SettingRow
            title="Content Filtering"
            description="Filter inappropriate content automatically"
            value={privacySettings.childSafetySettings.restrictedWords}
            onValueChange={handleSettingChange}
            category="childSafetySettings"
            setting="restrictedWords"
          />
          <SettingRow
            title="Report Inappropriate Content"
            description="Enable reporting of inappropriate behavior"
            value={privacySettings.childSafetySettings.reportInappropriate}
            onValueChange={handleSettingChange}
            category="childSafetySettings"
            setting="reportInappropriate"
          />
          <SettingRow
            title="Block Unknown Users"
            description="Automatically block unverified users"
            value={privacySettings.childSafetySettings.blockUnknownUsers}
            onValueChange={handleSettingChange}
            category="childSafetySettings"
            setting="blockUnknownUsers"
          />
        </SettingSection>

        <SettingSection title="Marketing & Communications" icon="mail-outline">
          <SettingRow
            title="Promotional Emails"
            description="Receive promotional emails and offers"
            value={privacySettings.marketingSettings.promotionalEmails}
            onValueChange={handleSettingChange}
            category="marketingSettings"
            setting="promotionalEmails"
          />
          <SettingRow
            title="Academy Offers"
            description="Receive offers from enrolled academies"
            value={privacySettings.marketingSettings.academyOffers}
            onValueChange={handleSettingChange}
            category="marketingSettings"
            setting="academyOffers"
          />
          <SettingRow
            title="Parent Community Updates"
            description="Get updates from parent community"
            value={privacySettings.marketingSettings.parentCommunity}
            onValueChange={handleSettingChange}
            category="marketingSettings"
            setting="parentCommunity"
          />
          <SettingRow
            title="Third-Party Offers"
            description="Receive offers from partner organizations"
            value={privacySettings.marketingSettings.thirdPartyOffers}
            onValueChange={handleSettingChange}
            category="marketingSettings"
            setting="thirdPartyOffers"
          />
        </SettingSection>

        <SettingSection title="Data Management" icon="document-outline">
          <TouchableOpacity style={styles.actionButton} onPress={handleDataExport}>
            <Ionicons name="download-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Export My Data</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              This action cannot be undone. All data associated with your account and your child's profile will be permanently deleted.
            </Text>
            <Text style={styles.modalSubtext}>
              Type "DELETE MY ACCOUNT" to confirm:
            </Text>
            <TextInput
              style={styles.confirmInput}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="DELETE MY ACCOUNT"
              autoCapitalize="characters"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]} 
                onPress={handleAccountDeletion}
              >
                <Text style={[styles.modalButtonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introText: {
    fontSize: 14,
    color: COLORS.gray,
    marginVertical: 20,
    lineHeight: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingText: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 10,
  },
  dangerButton: {
    borderBottomColor: COLORS.error + '20',
  },
  dangerText: {
    color: COLORS.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  linkText: {
    fontSize: 12,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 10,
  },
  confirmInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  deleteButtonText: {
    color: COLORS.white,
  },
});

export default PrivacySettings;