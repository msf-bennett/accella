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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/colors';

const ChildProtection = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [reportDetails, setReportDetails] = useState({
    type: '',
    description: '',
    incident: '',
  });

  // Protection Settings State
  const [protectionSettings, setProtectionSettings] = useState({
    // Communication Safety
    messageFiltering: {
      enabled: true,
      strictMode: true,
      allowedContactsOnly: false,
      blockUnknownSenders: true,
      moderateGroupChats: true,
    },

    // Content Monitoring
    contentMonitoring: {
      parentalOversight: true,
      aiContentScanning: true,
      photoVideoReview: true,
      linkBlocking: true,
      keywordFiltering: true,
    },

    // Interaction Controls
    interactionControls: {
      coachApprovalRequired: true,
      restrictPrivateMessages: true,
      parentNotifications: true,
      sessionRecording: false,
      witnessRequired: true,
    },

    // Location Safety
    locationSafety: {
      parentalTracking: true,
      safeZoneAlerts: true,
      checkInReminders: true,
      emergencyContacts: true,
      locationSharing: false,
    },

    // Emergency Protocols
    emergencyProtocols: {
      quickReportButton: true,
      emergencyContacts: true,
      autoAuthorities: false,
      parentAlerts: true,
      academyNotification: true,
    },
  });

  // Mock data for blocked users and reported incidents
  const [blockedUsers, setBlockedUsers] = useState([
    { id: '1', name: 'Blocked User 1', type: 'Parent', reason: 'Inappropriate behavior', date: '2024-01-15' },
    { id: '2', name: 'Blocked User 2', type: 'Coach', reason: 'Reported by parent', date: '2024-01-10' },
  ]);

  const [recentReports, setRecentReports] = useState([
    { id: '1', type: 'Inappropriate Message', status: 'Under Review', date: '2024-01-20', resolved: false },
    { id: '2', type: 'Unsafe Behavior', status: 'Resolved', date: '2024-01-18', resolved: true },
    { id: '3', type: 'Privacy Violation', status: 'Investigating', date: '2024-01-15', resolved: false },
  ]);

  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: '1', name: 'Primary Guardian', phone: '+1 (555) 123-4567', relationship: 'Parent' },
    { id: '2', name: 'Secondary Guardian', phone: '+1 (555) 987-6543', relationship: 'Parent' },
    { id: '3', name: 'Emergency Contact', phone: '+1 (555) 456-7890', relationship: 'Relative' },
  ]);

  const reportTypes = [
    'Inappropriate Message',
    'Unsafe Behavior',
    'Privacy Violation',
    'Bullying/Harassment',
    'Physical Concern',
    'Other Safety Issue',
  ];

  const handleSettingChange = (category, setting, value) => {
    setProtectionSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      }
    }));
  };

  const handleQuickReport = (type) => {
    setReportDetails({ ...reportDetails, type });
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportDetails.type || !reportDetails.description) {
      Alert.alert('Error', 'Please provide all required information.');
      return;
    }

    setLoading(true);
    try {
      // API call to submit report
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newReport = {
        id: Date.now().toString(),
        type: reportDetails.type,
        status: 'Under Review',
        date: new Date().toISOString().split('T')[0],
        resolved: false,
      };
      
      setRecentReports(prev => [newReport, ...prev]);
      setReportDetails({ type: '', description: '', incident: '' });
      setShowReportModal(false);
      
      Alert.alert(
        'Report Submitted',
        'Your safety report has been submitted and will be reviewed within 24 hours. You will receive updates on the investigation.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyAlert = () => {
    Alert.alert(
      'Emergency Alert',
      'This will immediately notify your emergency contacts and academy staff. Use only for genuine emergencies.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Emergency Alert', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Emergency Alert Sent', 'Emergency contacts have been notified.');
          }
        }
      ]
    );
  };

  const ProtectionSection = ({ title, children, icon, critical = false }) => (
    <View style={[styles.section, critical && styles.criticalSection]}>
      <View style={styles.sectionHeader}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={critical ? COLORS.error : COLORS.primary} 
        />
        <Text style={[styles.sectionTitle, critical && styles.criticalTitle]}>
          {title}
        </Text>
        {critical && (
          <View style={styles.criticalBadge}>
            <Text style={styles.criticalBadgeText}>CRITICAL</Text>
          </View>
        )}
      </View>
      {children}
    </View>
  );

  const SettingRow = ({ title, description, value, onValueChange, category, setting, critical = false }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, critical && styles.criticalSettingTitle]}>
          {title}
        </Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => onValueChange(category, setting, newValue)}
        trackColor={{ false: COLORS.lightGray, true: (critical ? COLORS.error : COLORS.primary) + '40' }}
        thumbColor={value ? (critical ? COLORS.error : COLORS.primary) : COLORS.gray}
      />
    </View>
  );

  const QuickActionButton = ({ title, icon, onPress, type = 'primary' }) => (
    <TouchableOpacity 
      style={[
        styles.quickActionButton, 
        type === 'emergency' && styles.emergencyButton,
        type === 'warning' && styles.warningButton
      ]} 
      onPress={onPress}
    >
      <Ionicons 
        name={icon} 
        size={24} 
        color={type === 'emergency' ? COLORS.white : type === 'warning' ? COLORS.warning : COLORS.primary} 
      />
      <Text style={[
        styles.quickActionText,
        type === 'emergency' && styles.emergencyText,
        type === 'warning' && styles.warningText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderBlockedUser = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
        <Text style={styles.listItemSubtitle}>{item.type} • {item.reason}</Text>
        <Text style={styles.listItemDate}>Blocked on {item.date}</Text>
      </View>
      <TouchableOpacity style={styles.unblockButton}>
        <Text style={styles.unblockButtonText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReport = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemContent}>
        <View style={styles.reportHeader}>
          <Text style={styles.listItemTitle}>{item.type}</Text>
          <View style={[
            styles.statusBadge, 
            item.resolved && styles.resolvedBadge
          ]}>
            <Text style={[
              styles.statusBadgeText,
              item.resolved && styles.resolvedBadgeText
            ]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.listItemDate}>Reported on {item.date}</Text>
      </View>
    </View>
  );

  const renderEmergencyContact = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
        <Text style={styles.listItemSubtitle}>{item.relationship}</Text>
        <Text style={styles.listItemPhone}>{item.phone}</Text>
      </View>
      <TouchableOpacity style={styles.callButton}>
        <Ionicons name="call" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Child Protection</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Actions */}
        <ProtectionSection title="Emergency Actions" icon="alert-circle" critical={true}>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              title="Emergency Alert"
              icon="warning"
              type="emergency"
              onPress={handleEmergencyAlert}
            />
            <QuickActionButton
              title="Quick Report"
              icon="flag"
              type="warning"
              onPress={() => setShowReportModal(true)}
            />
          </View>
        </ProtectionSection>

        {/* Quick Report Buttons */}
        <ProtectionSection title="Quick Report Issues" icon="flag-outline">
          <View style={styles.reportButtonsGrid}>
            {reportTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reportTypeButton}
                onPress={() => handleQuickReport(type)}
              >
                <Text style={styles.reportTypeText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ProtectionSection>

        {/* Communication Safety */}
        <ProtectionSection title="Communication Safety" icon="chatbubble-ellipses-outline" critical={true}>
          <SettingRow
            title="Message Filtering"
            description="Automatically filter inappropriate messages"
            value={protectionSettings.messageFiltering.enabled}
            onValueChange={handleSettingChange}
            category="messageFiltering"
            setting="enabled"
            critical={true}
          />
          <SettingRow
            title="Strict Filtering Mode"
            description="Use enhanced filtering algorithms"
            value={protectionSettings.messageFiltering.strictMode}
            onValueChange={handleSettingChange}
            category="messageFiltering"
            setting="strictMode"
            critical={true}
          />
          <SettingRow
            title="Block Unknown Senders"
            description="Block messages from unverified users"
            value={protectionSettings.messageFiltering.blockUnknownSenders}
            onValueChange={handleSettingChange}
            category="messageFiltering"
            setting="blockUnknownSenders"
          />
          <SettingRow
            title="Moderate Group Chats"
            description="Require moderation for group messages"
            value={protectionSettings.messageFiltering.moderateGroupChats}
            onValueChange={handleSettingChange}
            category="messageFiltering"
            setting="moderateGroupChats"
          />
        </ProtectionSection>

        {/* Content Monitoring */}
        <ProtectionSection title="Content Monitoring" icon="eye-outline" critical={true}>
          <SettingRow
            title="Parental Oversight"
            description="Allow parents to review child's interactions"
            value={protectionSettings.contentMonitoring.parentalOversight}
            onValueChange={handleSettingChange}
            category="contentMonitoring"
            setting="parentalOversight"
            critical={true}
          />
          <SettingRow
            title="AI Content Scanning"
            description="Use AI to detect inappropriate content"
            value={protectionSettings.contentMonitoring.aiContentScanning}
            onValueChange={handleSettingChange}
            category="contentMonitoring"
            setting="aiContentScanning"
            critical={true}
          />
          <SettingRow
            title="Photo/Video Review"
            description="Review shared media before sending"
            value={protectionSettings.contentMonitoring.photoVideoReview}
            onValueChange={handleSettingChange}
            category="contentMonitoring"
            setting="photoVideoReview"
          />
          <SettingRow
            title="Block Suspicious Links"
            description="Block potentially harmful web links"
            value={protectionSettings.contentMonitoring.linkBlocking}
            onValueChange={handleSettingChange}
            category="contentMonitoring"
            setting="linkBlocking"
          />
        </ProtectionSection>

        {/* Interaction Controls */}
        <ProtectionSection title="Interaction Controls" icon="people-outline" critical={true}>
          <SettingRow
            title="Coach Approval Required"
            description="Require approval for new coach interactions"
            value={protectionSettings.interactionControls.coachApprovalRequired}
            onValueChange={handleSettingChange}
            category="interactionControls"
            setting="coachApprovalRequired"
            critical={true}
          />
          <SettingRow
            title="Restrict Private Messages"
            description="Limit private messaging capabilities"
            value={protectionSettings.interactionControls.restrictPrivateMessages}
            onValueChange={handleSettingChange}
            category="interactionControls"
            setting="restrictPrivateMessages"
          />
          <SettingRow
            title="Parent Notifications"
            description="Notify parents of new interactions"
            value={protectionSettings.interactionControls.parentNotifications}
            onValueChange={handleSettingChange}
            category="interactionControls"
            setting="parentNotifications"
            critical={true}
          />
          <SettingRow
            title="Witness Required"
            description="Require witness for one-on-one sessions"
            value={protectionSettings.interactionControls.witnessRequired}
            onValueChange={handleSettingChange}
            category="interactionControls"
            setting="witnessRequired"
          />
        </ProtectionSection>

        {/* Recent Reports */}
        <ProtectionSection title="Recent Safety Reports" icon="document-text-outline">
          <FlatList
            data={recentReports}
            renderItem={renderReport}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No recent reports</Text>
            }
          />
        </ProtectionSection>

        {/* Blocked Users */}
        <ProtectionSection title="Blocked Users" icon="ban-outline">
          <FlatList
            data={blockedUsers}
            renderItem={renderBlockedUser}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No blocked users</Text>
            }
          />
        </ProtectionSection>

        {/* Emergency Contacts */}
        <ProtectionSection title="Emergency Contacts" icon="call-outline" critical={true}>
          <FlatList
            data={emergencyContacts}
            renderItem={renderEmergencyContact}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
          <TouchableOpacity style={styles.addContactButton}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.addContactText}>Add Emergency Contact</Text>
          </TouchableOpacity>
        </ProtectionSection>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.helpButtonText}>Child Safety Resources</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>
            If you suspect immediate danger, contact local authorities immediately.
          </Text>
        </View>
      </ScrollView>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Safety Report</Text>
            <Text style={styles.modalSubtitle}>
              Help us keep everyone safe by reporting any concerns.
            </Text>
            
            <Text style={styles.inputLabel}>Report Type *</Text>
            <View style={styles.reportTypeContainer}>
              {reportTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.reportTypeOption,
                    reportDetails.type === type && styles.selectedReportType
                  ]}
                  onPress={() => setReportDetails({...reportDetails, type})}
                >
                  <Text style={[
                    styles.reportTypeOptionText,
                    reportDetails.type === type && styles.selectedReportTypeText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={styles.textArea}
              value={reportDetails.description}
              onChangeText={(text) => setReportDetails({...reportDetails, description: text})}
              placeholder="Please describe the safety concern in detail..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => setShowReportModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]} 
                onPress={submitReport}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={[styles.modalButtonText, styles.submitButtonText]}>Submit Report</Text>
                )}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  criticalSection: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
    paddingLeft: 15,
    marginLeft: -15,
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
    flex: 1,
  },
  criticalTitle: {
    color: COLORS.error,
  },
  criticalBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  criticalBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
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
  criticalSettingTitle: {
    color: COLORS.error,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  emergencyButton: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  warningButton: {
    backgroundColor: COLORS.warning + '10',
    borderColor: COLORS.warning,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emergencyText: {
    color: COLORS.white,
  },
  warningText: {
    color: COLORS.warning,
  },
  reportButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reportTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    marginRight: 5,
    marginBottom: 10,
  },
  reportTypeText: {
    fontSize: 12,
    color: COLORS.text,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  listItemDate: {
    fontSize: 11,
    color: COLORS.gray,
  },
  listItemPhone: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    color: COLORS.warning,
    fontWeight: '500',
  },
  resolvedBadge: {
    backgroundColor: COLORS.success + '20',
  },
  resolvedBadgeText: {
    color: COLORS.success,
  },
  unblockButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 6,
  },
  unblockButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  callButton: {
    padding: 8,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 20,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  addContactText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 15,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    gap: 8,
  },
  helpButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.error,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 20,
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
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  reportTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedReportType: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  reportTypeOptionText: {
    fontSize: 12,
    color: COLORS.text,
  },
  selectedReportTypeText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    height: 100,
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
  submitButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  submitButtonText: {
    color: COLORS.white,
  },
});

export default ChildProtection;