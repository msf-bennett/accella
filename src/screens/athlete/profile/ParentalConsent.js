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
  Linking,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  Divider,
  List,
  Badge,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const ParentalConsent = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, parentalConsents } = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Parental consent state
  const [consentData, setConsentData] = useState({
    parentInfo: {
      primaryParent: {
        name: 'Sarah Johnson',
        relationship: 'Mother',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-123-4567',
        verified: true,
      },
      secondaryParent: {
        name: 'Michael Johnson',
        relationship: 'Father', 
        email: 'michael.johnson@email.com',
        phone: '+1-555-123-4568',
        verified: true,
      },
    },
    emergencyContacts: [
      {
        name: 'Lisa Davis',
        relationship: 'Aunt',
        phone: '+1-555-987-6543',
        canPickup: true,
        verified: false,
      }
    ],
    overallStatus: 'active', // pending, active, expired, revoked
    lastUpdated: '2024-08-15',
  });

  const [consentForms, setConsentForms] = useState([
    {
      id: 1,
      type: 'General Sports Participation',
      status: 'approved',
      requestedDate: '2024-08-01',
      approvedDate: '2024-08-02',
      expiryDate: '2025-08-02',
      parentSignature: 'Sarah Johnson',
      documentUrl: null,
      description: 'General consent for sports participation and training',
      requiredFor: ['Training Sessions', 'Team Events'],
      priority: 'high',
      autoRenew: true,
    },
    {
      id: 2,
      type: 'Medical Treatment Authorization',
      status: 'approved',
      requestedDate: '2024-08-01',
      approvedDate: '2024-08-02',
      expiryDate: '2025-08-02',
      parentSignature: 'Sarah Johnson',
      documentUrl: null,
      description: 'Authorization for emergency medical treatment',
      requiredFor: ['All Activities', 'Travel'],
      priority: 'high',
      autoRenew: true,
    },
    {
      id: 3,
      type: 'Photo/Video Release',
      status: 'approved',
      requestedDate: '2024-08-01',
      approvedDate: '2024-08-03',
      expiryDate: '2026-08-03',
      parentSignature: 'Michael Johnson',
      documentUrl: null,
      description: 'Permission to use photos/videos for promotional purposes',
      requiredFor: ['Social Media', 'Marketing'],
      priority: 'medium',
      autoRenew: false,
    },
    {
      id: 4,
      type: 'Transportation Consent',
      status: 'pending',
      requestedDate: '2024-08-20',
      approvedDate: null,
      expiryDate: null,
      parentSignature: null,
      documentUrl: null,
      description: 'Consent for team transportation to away games',
      requiredFor: ['Travel', 'Competitions'],
      priority: 'medium',
      autoRenew: true,
    },
    {
      id: 5,
      type: 'Overnight Trip Permission',
      status: 'expired',
      requestedDate: '2023-06-15',
      approvedDate: '2023-06-16',
      expiryDate: '2024-06-16',
      parentSignature: 'Sarah Johnson',
      documentUrl: null,
      description: 'Permission for overnight team trips and tournaments',
      requiredFor: ['Tournaments', 'Camps'],
      priority: 'medium',
      autoRenew: false,
    }
  ]);

  const [digitalSignatures, setDigitalSignatures] = useState([
    {
      id: 1,
      parentName: 'Sarah Johnson',
      signatureDate: '2024-08-02T14:30:00Z',
      ipAddress: '192.168.1.100',
      deviceInfo: 'iPhone 14 Pro, iOS 17.1',
      documentIds: [1, 2, 5],
      verified: true,
    },
    {
      id: 2,
      parentName: 'Michael Johnson',
      signatureDate: '2024-08-03T09:15:00Z',
      ipAddress: '192.168.1.101',
      deviceInfo: 'MacBook Pro, Safari 17.0',
      documentIds: [3],
      verified: true,
    }
  ]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    loadParentalConsents();
    checkConsentRequirements();
  }, []);

  const loadParentalConsents = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, dispatch action to load consents
    } catch (error) {
      Alert.alert('Error', 'Failed to load parental consent information');
    } finally {
      setLoading(false);
    }
  };

  const checkConsentRequirements = () => {
    const pendingConsents = consentForms.filter(form => form.status === 'pending').length;
    const expiredConsents = consentForms.filter(form => form.status === 'expired').length;
    
    if (pendingConsents > 0) {
      // Show notification about pending consents
    }
    if (expiredConsents > 0) {
      // Show notification about expired consents
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadParentalConsents();
    setRefreshing(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return COLORS.success;
      case 'pending': return '#FF9500';
      case 'expired': return COLORS.error;
      case 'revoked': return '#8E8E93';
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'check-circle';
      case 'pending': return 'schedule';
      case 'expired': return 'warning';
      case 'revoked': return 'cancel';
      default: return 'help';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return '#FF9500';
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getComplianceScore = () => {
    const approvedConsents = consentForms.filter(form => form.status === 'approved').length;
    const totalRequired = consentForms.filter(form => form.priority === 'high').length;
    return Math.round((approvedConsents / Math.max(totalRequired, 1)) * 100);
  };

  const requestParentApproval = async (consentType) => {
    try {
      Alert.alert(
        'Request Sent! 📧',
        `A consent request has been sent to ${consentData.parentInfo.primaryParent.name} for approval.`,
        [
          {
            text: 'Send Reminder Later',
            style: 'cancel',
          },
          {
            text: 'Call Parent',
            onPress: () => Linking.openURL(`tel:${consentData.parentInfo.primaryParent.phone}`),
          },
        ]
      );
      
      // Update consent status to pending
      setConsentForms(prev => prev.map(form => 
        form.type === consentType 
          ? { ...form, status: 'pending', requestedDate: new Date().toISOString().split('T')[0] }
          : form
      ));
      
    } catch (error) {
      Alert.alert('Error', 'Failed to send consent request');
    }
  };

  const renderComplianceOverview = () => (
    <Card style={styles.overviewCard}>
      <LinearGradient
        colors={getComplianceScore() >= 80 ? ['#4CAF50', '#8BC34A'] : ['#FF9500', '#FF6B35']}
        style={styles.gradientHeader}
      >
        <View style={styles.overviewContent}>
          <View style={styles.overviewLeft}>
            <Text style={styles.overviewTitle}>Consent Status</Text>
            <Text style={styles.overviewSubtitle}>
              {consentForms.filter(f => f.status === 'approved').length} of {consentForms.length} approved
            </Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{getComplianceScore()}%</Text>
            <Icon 
              name={getComplianceScore() >= 80 ? 'verified-user' : 'warning'} 
              size={28} 
              color="white" 
            />
          </View>
        </View>
        <ProgressBar
          progress={getComplianceScore() / 100}
          color="white"
          style={styles.progressBar}
        />
        {getComplianceScore() < 80 && (
          <Text style={styles.warningText}>
            ⚠️ Some required consents are missing or expired
          </Text>
        )}
      </LinearGradient>
    </Card>
  );

  const renderParentInfo = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Parent/Guardian Information 👨‍👩‍👧‍👦"
        titleStyle={styles.cardTitle}
        right={() => (
          <IconButton
            icon="edit"
            onPress={() => Alert.alert('Edit', 'Parent information editing coming soon!')}
          />
        )}
      />
      <Card.Content>
        <Surface style={styles.parentCard}>
          <View style={styles.parentHeader}>
            <Avatar.Icon icon="account" size={40} />
            <View style={styles.parentInfo}>
              <Text style={styles.parentName}>{consentData.parentInfo.primaryParent.name}</Text>
              <Text style={styles.parentRole}>Primary Guardian ({consentData.parentInfo.primaryParent.relationship})</Text>
            </View>
            {consentData.parentInfo.primaryParent.verified && (
              <Icon name="verified" size={24} color={COLORS.success} />
            )}
          </View>
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Icon name="email" size={16} color={COLORS.textSecondary} />
              <Text style={styles.contactText}>{consentData.parentInfo.primaryParent.email}</Text>
            </View>
            <View style={styles.contactRow}>
              <Icon name="phone" size={16} color={COLORS.textSecondary} />
              <Text style={styles.contactText}>{consentData.parentInfo.primaryParent.phone}</Text>
            </View>
          </View>
        </Surface>

        <Surface style={styles.parentCard}>
          <View style={styles.parentHeader}>
            <Avatar.Icon icon="account" size={40} />
            <View style={styles.parentInfo}>
              <Text style={styles.parentName}>{consentData.parentInfo.secondaryParent.name}</Text>
              <Text style={styles.parentRole}>Secondary Guardian ({consentData.parentInfo.secondaryParent.relationship})</Text>
            </View>
            {consentData.parentInfo.secondaryParent.verified && (
              <Icon name="verified" size={24} color={COLORS.success} />
            )}
          </View>
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Icon name="email" size={16} color={COLORS.textSecondary} />
              <Text style={styles.contactText}>{consentData.parentInfo.secondaryParent.email}</Text>
            </View>
            <View style={styles.contactRow}>
              <Icon name="phone" size={16} color={COLORS.textSecondary} />
              <Text style={styles.contactText}>{consentData.parentInfo.secondaryParent.phone}</Text>
            </View>
          </View>
        </Surface>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.actionsScroll}
      contentContainerStyle={styles.actionsContainer}
    >
      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: COLORS.primary + '20' }]}
        onPress={() => setRequestModalVisible(true)}
      >
        <Icon name="send" size={32} color={COLORS.primary} />
        <Text style={styles.actionText}>Request Consent</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: COLORS.success + '20' }]}
        onPress={() => Alert.alert('Call Parent', 'Feature coming soon!')}
      >
        <Icon name="phone" size={32} color={COLORS.success} />
        <Text style={styles.actionText}>Call Parent</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: '#FF9500' + '20' }]}
        onPress={() => Alert.alert('View Documents', 'Feature coming soon!')}
      >
        <Icon name="folder" size={32} color="#FF9500" />
        <Text style={styles.actionText}>Documents</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: '#007AFF' + '20' }]}
        onPress={() => Alert.alert('Digital Signature', 'Feature coming soon!')}
      >
        <Icon name="draw" size={32} color="#007AFF" />
        <Text style={styles.actionText}>E-Signature</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderConsentForm = (form) => {
    const daysUntilExpiry = getDaysUntilExpiry(form.expiryDate);
    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

    return (
      <TouchableOpacity
        key={form.id}
        onPress={() => {
          setSelectedConsent(form);
          setDetailModalVisible(true);
          Vibration.vibrate(50);
        }}
        activeOpacity={0.7}
      >
        <Card style={styles.consentCard}>
          <Card.Content>
            <View style={styles.consentHeader}>
              <View style={styles.consentInfo}>
                <Text style={styles.consentType}>{form.type}</Text>
                <Text style={styles.consentDesc}>{form.description}</Text>
              </View>
              <View style={styles.consentStatus}>
                <Icon 
                  name={getStatusIcon(form.status)} 
                  size={28} 
                  color={getStatusColor(form.status)} 
                />
                <Chip
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: getStatusColor(form.status) + '20' }]}
                  textStyle={{ color: getStatusColor(form.status), fontSize: 12 }}
                >
                  {form.status.toUpperCase()}
                </Chip>
              </View>
            </View>

            <View style={styles.consentDetails}>
              <View style={styles.priorityRow}>
                <Chip
                  icon="flag"
                  mode="outlined"
                  style={[styles.priorityChip, { borderColor: getPriorityColor(form.priority) }]}
                  textStyle={{ color: getPriorityColor(form.priority) }}
                >
                  {form.priority.toUpperCase()} PRIORITY
                </Chip>
                {form.autoRenew && (
                  <Chip
                    icon="autorenew"
                    mode="outlined"
                    style={styles.renewChip}
                  >
                    AUTO-RENEW
                  </Chip>
                )}
              </View>

              <View style={styles.requiredFor}>
                <Text style={styles.requiredLabel}>Required for:</Text>
                <View style={styles.requirementChips}>
                  {form.requiredFor.map((requirement, index) => (
                    <Chip key={index} mode="outlined" style={styles.requirementChip}>
                      {requirement}
                    </Chip>
                  ))}
                </View>
              </View>

              {form.status === 'approved' && form.expiryDate && (
                <View style={styles.expiryInfo}>
                  <Icon 
                    name="event" 
                    size={16} 
                    color={isExpiringSoon ? '#FF9500' : COLORS.textSecondary} 
                  />
                  <Text style={[
                    styles.expiryText,
                    isExpiringSoon && { color: '#FF9500', fontWeight: 'bold' }
                  ]}>
                    Expires: {form.expiryDate}
                    {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                      <Text> ({daysUntilExpiry} days)</Text>
                    )}
                  </Text>
                </View>
              )}

              {form.parentSignature && (
                <View style={styles.signatureInfo}>
                  <Icon name="verified" size={16} color={COLORS.success} />
                  <Text style={styles.signatureText}>Signed by {form.parentSignature}</Text>
                </View>
              )}
            </View>
          </Card.Content>

          <View style={styles.cardActions}>
            {form.status === 'pending' && (
              <Button
                mode="contained"
                icon="send"
                onPress={() => requestParentApproval(form.type)}
                style={styles.actionButton}
              >
                Send Reminder
              </Button>
            )}
            {form.status === 'expired' && (
              <Button
                mode="contained"
                icon="refresh"
                onPress={() => requestParentApproval(form.type)}
                style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
              >
                Renew
              </Button>
            )}
            <Button
              mode="text"
              icon="visibility"
              onPress={() => {
                setSelectedConsent(form);
                setDetailModalVisible(true);
              }}
            >
              View Details
            </Button>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderDigitalSignatures = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Digital Signatures ✍️"
        titleStyle={styles.cardTitle}
        subtitle="Verified parent signatures"
        right={() => (
          <Badge size={20} style={{ backgroundColor: COLORS.success }}>
            {digitalSignatures.length}
          </Badge>
        )}
      />
      <Card.Content>
        {digitalSignatures.map(signature => (
          <Surface key={signature.id} style={styles.signatureItem}>
            <View style={styles.signatureHeader}>
              <Avatar.Icon icon="draw" size={40} />
              <View style={styles.signatureInfo}>
                <Text style={styles.signatureName}>{signature.parentName}</Text>
                <Text style={styles.signatureDate}>
                  {new Date(signature.signatureDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                <Text style={styles.signatureDevice}>{signature.deviceInfo}</Text>
              </View>
              {signature.verified && (
                <Icon name="verified" size={24} color={COLORS.success} />
              )}
            </View>
            <Text style={styles.documentsCount}>
              Signed {signature.documentIds.length} document(s)
            </Text>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={detailModalVisible}
        onDismiss={() => setDetailModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <Card style={styles.modalCard}>
            <Card.Title
              title={selectedConsent?.type}
              titleStyle={styles.modalTitle}
              right={() => (
                <IconButton
                  icon="close"
                  onPress={() => setDetailModalVisible(false)}
                />
              )}
            />
            <Card.Content>
              {selectedConsent && (
                <ScrollView style={styles.modalContent}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Status</Text>
                    <View style={styles.modalStatusRow}>
                      <Icon 
                        name={getStatusIcon(selectedConsent.status)} 
                        size={24} 
                        color={getStatusColor(selectedConsent.status)} 
                      />
                      <Text style={[styles.modalStatusText, { 
                        color: getStatusColor(selectedConsent.status) 
                      }]}>
                        {selectedConsent.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Description</Text>
                    <Text style={styles.modalText}>{selectedConsent.description}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Required For</Text>
                    {selectedConsent.requiredFor.map((requirement, index) => (
                      <Text key={index} style={styles.modalText}>• {requirement}</Text>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Dates</Text>
                    <Text style={styles.modalText}>Requested: {selectedConsent.requestedDate}</Text>
                    {selectedConsent.approvedDate && (
                      <Text style={styles.modalText}>Approved: {selectedConsent.approvedDate}</Text>
                    )}
                    {selectedConsent.expiryDate && (
                      <Text style={styles.modalText}>Expires: {selectedConsent.expiryDate}</Text>
                    )}
                  </View>

                  {selectedConsent.parentSignature && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Signature</Text>
                      <Text style={styles.modalText}>Signed by: {selectedConsent.parentSignature}</Text>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Settings</Text>
                    <Text style={styles.modalText}>
                      Priority: {selectedConsent.priority.charAt(0).toUpperCase() + selectedConsent.priority.slice(1)}
                    </Text>
                    <Text style={styles.modalText}>
                      Auto-renew: {selectedConsent.autoRenew ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                </ScrollView>
              )}
            </Card.Content>
            <Card.Actions style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setDetailModalVisible(false)}
              >
                Close
              </Button>
              {selectedConsent?.status === 'pending' && (
                <Button
                  mode="contained"
                  icon="send"
                  onPress={() => {
                    setDetailModalVisible(false);
                    requestParentApproval(selectedConsent.type);
                  }}
                  style={styles.modalButton}
                >
                  Send Reminder
                </Button>
              )}
            </Card.Actions>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderRequestModal = () => (
    <Portal>
      <Modal
        visible={requestModalVisible}
        onDismiss={() => setRequestModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <Card style={styles.modalCard}>
            <Card.Title
              title="Request Consent 📧"
              titleStyle={styles.modalTitle}
              right={() => (
                <IconButton
                  icon="close"
                  onPress={() => setRequestModalVisible(false)}
                />
              )}
            />
            <Card.Content>
              <Text style={styles.modalText}>
                Feature coming soon! 🚧
              </Text>
              <Text style={styles.modalSubtext}>
                You'll be able to request specific consent forms from your parents here.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => setRequestModalVisible(false)}
                style={styles.modalButton}
              >
                Got it
              </Button>
            </Card.Actions>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
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
        {renderComplianceOverview()}
        {renderParentInfo()}
        {renderQuickActions()}
        
        <Text style={styles.sectionTitle}>Consent Forms 📋</Text>
        {consentForms.map(renderConsentForm)}
        
        {renderDigitalSignatures()}
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          setRequestModalVisible(true);
          Vibration.vibrate(50);
        }}
      />

      {renderDetailModal()}
      {renderRequestModal()}
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
    paddingTop: SPACING.xl * 2,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  overviewCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  overviewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  overviewLeft: {
    flex: 1,
  },
  overviewTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  overviewSubtitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
    marginRight: SPACING.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  warningText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginTop: SPACING.sm,
    textAlign: 'center',
    opacity: 0.9,
  },
  card: {
    marginBottom: SPACING.lg,
    elevation: 2,
    borderRadius: 12,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  parentCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  parentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  parentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  parentName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  parentRole: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  contactInfo: {
    marginTop: SPACING.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  contactText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  actionsScroll: {
    marginBottom: SPACING.lg,
  },
  actionsContainer: {
    paddingHorizontal: SPACING.xs,
  },
  actionCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    minWidth: 100,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  consentCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  consentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  consentInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  consentType: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  consentDesc: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
    lineHeight: 18,
  },
  consentStatus: {
    alignItems: 'center',
  },
  statusChip: {
    marginTop: SPACING.xs,
  },
  consentDetails: {
    marginBottom: SPACING.sm,
  },
  priorityRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  priorityChip: {
    marginRight: SPACING.sm,
  },
  renewChip: {
    borderColor: COLORS.primary,
  },
  requiredFor: {
    marginBottom: SPACING.sm,
  },
  requiredLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  requirementChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  requirementChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  expiryText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  signatureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signatureText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    marginLeft: SPACING.sm,
  },
  cardActions: {
    paddingTop: 0,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: SPACING.md,
  },
  signatureItem: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  signatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  signatureName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  signatureDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  signatureDevice: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  documentsCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalCard: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  modalContent: {
    maxHeight: 400,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalStatusText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  modalText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
    lineHeight: 20,
  },
  modalSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalActions: {
    justifyContent: 'space-between',
  },
  modalButton: {
    marginLeft: SPACING.sm,
  },
  signatureInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  
});

export default ParentalConsent;