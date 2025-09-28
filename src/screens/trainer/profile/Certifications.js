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
  Image,
  Linking,
} from 'react-native';
import { 
  Card,
  Button,
  Surface,
  IconButton,
  Divider,
  Portal,
  Modal,
  TextInput,
  Chip,
  FAB,
  Badge,
  ProgressBar,
  Avatar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const Certification = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { certifications, profile } = useSelector(state => state.profile);

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [certForm, setCertForm] = useState({
    name: '',
    organization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    description: '',
    category: '',
    document: null,
  });

  const [myCertifications, setMyCertifications] = useState([
    {
      id: '1',
      name: 'Certified Personal Trainer',
      organization: 'NASM',
      issueDate: '2023-01-15',
      expiryDate: '2025-01-15',
      credentialId: 'CPT-2023-001',
      category: 'Personal Training',
      status: 'active',
      verified: true,
      document: 'nasm_cert.pdf',
      description: 'National Academy of Sports Medicine Personal Trainer Certification',
      skills: ['Exercise Programming', 'Injury Prevention', 'Client Assessment'],
    },
    {
      id: '2',
      name: 'Strength & Conditioning Specialist',
      organization: 'NSCA',
      issueDate: '2022-06-20',
      expiryDate: '2024-06-20',
      credentialId: 'CSCS-2022-456',
      category: 'Strength Training',
      status: 'expiring_soon',
      verified: true,
      document: 'nsca_cert.pdf',
      description: 'Certified Strength and Conditioning Specialist',
      skills: ['Strength Training', 'Athletic Performance', 'Program Design'],
    },
    {
      id: '3',
      name: 'Corrective Exercise Specialist',
      organization: 'NASM',
      issueDate: '2023-08-10',
      expiryDate: '2025-08-10',
      credentialId: 'CES-2023-789',
      category: 'Corrective Exercise',
      status: 'active',
      verified: false,
      document: null,
      description: 'Specialization in corrective exercise and movement assessment',
      skills: ['Movement Assessment', 'Corrective Exercise', 'Injury Recovery'],
    },
  ]);

  const [certificationStats, setCertificationStats] = useState({
    total: 3,
    active: 2,
    expiringSoon: 1,
    expired: 0,
    verified: 2,
    credibilityScore: 85,
  });

  const [recommendedCerts, setRecommendedCerts] = useState([
    {
      id: '1',
      name: 'Nutrition Coach Certification',
      organization: 'Precision Nutrition',
      category: 'Nutrition',
      duration: '6 months',
      level: 'Intermediate',
      popularity: 95,
    },
    {
      id: '2',
      name: 'Youth Exercise Specialist',
      organization: 'NASM',
      category: 'Specialized Training',
      duration: '3 months',
      level: 'Advanced',
      popularity: 78,
    },
    {
      id: '3',
      name: 'Functional Movement Screen',
      organization: 'FMS',
      category: 'Assessment',
      duration: '2 weeks',
      level: 'Beginner',
      popularity: 89,
    },
  ]);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = useCallback(() => {
    // Initialize certifications from Redux store
    if (certifications) {
      setMyCertifications(certifications);
      calculateStats(certifications);
    }
  }, [certifications]);

  const calculateStats = (certs) => {
    const now = new Date();
    const stats = {
      total: certs.length,
      active: 0,
      expiringSoon: 0,
      expired: 0,
      verified: 0,
    };

    certs.forEach(cert => {
      if (cert.verified) stats.verified++;
      
      const expiryDate = new Date(cert.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        stats.expired++;
      } else if (daysUntilExpiry <= 30) {
        stats.expiringSoon++;
      } else {
        stats.active++;
      }
    });

    stats.credibilityScore = Math.min(100, (stats.verified / stats.total) * 50 + stats.active * 10 + stats.total * 5);
    setCertificationStats(stats);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call for refreshing certification data
      setTimeout(() => {
        setRefreshing(false);
      }, 1500);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh certification data');
    }
  }, []);

  const handleAddCertification = useCallback(async () => {
    if (!certForm.name || !certForm.organization) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    Vibration.vibrate(50);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i / 100);
      }

      const newCert = {
        id: Date.now().toString(),
        ...certForm,
        status: 'active',
        verified: false,
        skills: [],
      };

      setMyCertifications(prev => [newCert, ...prev]);
      calculateStats([newCert, ...myCertifications]);
      
      setCertForm({
        name: '',
        organization: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        description: '',
        category: '',
        document: null,
      });

      setIsUploading(false);
      setShowAddModal(false);
      
      Alert.alert(
        'Certification Added! 🎓',
        'Your certification has been added successfully. It will be verified within 24 hours.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Error', 'Failed to add certification. Please try again.');
    }
  }, [certForm, myCertifications]);

  const handleViewCertification = useCallback((cert) => {
    setSelectedCert(cert);
    setShowDetailModal(true);
  }, []);

  const handleVerifyCertification = useCallback((certId) => {
    Alert.alert(
      'Verify Certification',
      'To verify this certification, please upload the official document or provide additional verification details.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upload Document',
          onPress: () => {
            Alert.alert('Feature in Development', 'Document upload feature is being developed.');
          }
        }
      ]
    );
  }, []);

  const handleRenewCertification = useCallback((certId) => {
    Alert.alert(
      'Renew Certification',
      'Would you like to start the renewal process for this certification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Renewal',
          onPress: () => {
            Alert.alert('Feature in Development', 'Certification renewal feature is being developed.');
          }
        }
      ]
    );
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'expiring_soon':
        return COLORS.warning;
      case 'expired':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expiring_soon':
        return 'Expiring Soon';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const renderOverviewCard = () => (
    <Card style={styles.card}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.overviewHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.overviewContent}>
          <Icon name="school" size={48} color={COLORS.white} />
          <View style={styles.overviewText}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
              My Certifications
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
              Professional credentials and qualifications
            </Text>
          </View>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
              {certificationStats.total}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
              {certificationStats.active}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
              {certificationStats.verified}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Verified</Text>
          </View>
        </View>
      </LinearGradient>
      
      <Card.Content style={styles.credibilitySection}>
        <View style={styles.credibilityHeader}>
          <Text style={TEXT_STYLES.subtitle}>Professional Credibility Score</Text>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
            {certificationStats.credibilityScore}%
          </Text>
        </View>
        <ProgressBar
          progress={certificationStats.credibilityScore / 100}
          color={COLORS.primary}
          style={styles.credibilityBar}
        />
        <Text style={TEXT_STYLES.caption}>
          Based on verified certifications, active status, and professional credentials
        </Text>
      </Card.Content>
    </Card>
  );

  const renderCertificationCard = (cert) => (
    <Card key={cert.id} style={styles.certCard}>
      <Card.Content>
        <View style={styles.certHeader}>
          <View style={styles.certInfo}>
            <View style={styles.certTitleRow}>
              <Text style={TEXT_STYLES.subtitle} numberOfLines={1}>
                {cert.name}
              </Text>
              {cert.verified && (
                <Icon name="verified" size={20} color={COLORS.success} style={styles.verifiedIcon} />
              )}
            </View>
            <Text style={[TEXT_STYLES.body, { color: COLORS.primary }]}>
              {cert.organization}
            </Text>
            <Text style={TEXT_STYLES.caption}>
              ID: {cert.credentialId}
            </Text>
          </View>
          
          <Surface style={styles.statusBadge}>
            <Text style={[TEXT_STYLES.caption, { color: getStatusColor(cert.status) }]}>
              {getStatusText(cert.status)}
            </Text>
          </Surface>
        </View>

        <View style={styles.certDetails}>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={TEXT_STYLES.caption}>Issued</Text>
              <Text style={TEXT_STYLES.body}>
                {new Date(cert.issueDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={TEXT_STYLES.caption}>Expires</Text>
              <Text style={[TEXT_STYLES.body, { 
                color: cert.status === 'expiring_soon' ? COLORS.warning : COLORS.text 
              }]}>
                {new Date(cert.expiryDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {cert.skills && cert.skills.length > 0 && (
            <View style={styles.skillsRow}>
              <Text style={TEXT_STYLES.caption}>Skills:</Text>
              <View style={styles.skillChips}>
                {cert.skills.slice(0, 2).map((skill, index) => (
                  <Chip key={index} mode="outlined" compact style={styles.skillChip}>
                    {skill}
                  </Chip>
                ))}
                {cert.skills.length > 2 && (
                  <Text style={TEXT_STYLES.caption}>+{cert.skills.length - 2} more</Text>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.certActions}>
          <Button
            mode="outlined"
            onPress={() => handleViewCertification(cert)}
            style={styles.actionButton}
            icon="visibility"
            compact
          >
            View
          </Button>
          
          {!cert.verified && (
            <Button
              mode="outlined"
              onPress={() => handleVerifyCertification(cert.id)}
              style={styles.actionButton}
              icon="verified-user"
              compact
            >
              Verify
            </Button>
          )}
          
          {cert.status === 'expiring_soon' && (
            <Button
              mode="contained"
              onPress={() => handleRenewCertification(cert.id)}
              style={styles.actionButton}
              buttonColor={COLORS.warning}
              icon="refresh"
              compact
            >
              Renew
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderRecommendedCerts = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
          Recommended Certifications 🎯
        </Text>
        <Text style={[TEXT_STYLES.caption, styles.sectionSubtitle]}>
          Boost your credibility with these popular certifications
        </Text>
        
        {recommendedCerts.map((cert) => (
          <TouchableOpacity
            key={cert.id}
            style={styles.recommendedItem}
            onPress={() => Alert.alert('Feature in Development', 'Certification enrollment is being developed.')}
          >
            <View style={styles.recommendedContent}>
              <Text style={TEXT_STYLES.body}>{cert.name}</Text>
              <Text style={TEXT_STYLES.caption}>
                {cert.organization} • {cert.duration} • {cert.level}
              </Text>
              <View style={styles.popularityRow}>
                <ProgressBar
                  progress={cert.popularity / 100}
                  color={COLORS.success}
                  style={styles.popularityBar}
                />
                <Text style={TEXT_STYLES.caption}>{cert.popularity}% popular</Text>
              </View>
            </View>
            <Icon name="arrow-forward" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        ))}
      </Card.Content>
    </Card>
  );

  const renderAddModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => !isUploading && setShowAddModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView>
          <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
            Add Certification
          </Text>
          
          {isUploading ? (
            <View style={styles.uploadingContent}>
              <Icon name="upload" size={48} color={COLORS.primary} />
              <Text style={TEXT_STYLES.body}>Uploading certification...</Text>
              <ProgressBar
                progress={uploadProgress}
                color={COLORS.primary}
                style={styles.uploadProgress}
              />
              <Text style={TEXT_STYLES.caption}>
                {Math.round(uploadProgress * 100)}% Complete
              </Text>
            </View>
          ) : (
            <>
              <TextInput
                label="Certification Name *"
                value={certForm.name}
                onChangeText={(text) => setCertForm(prev => ({ ...prev, name: text }))}
                style={styles.input}
                left={<TextInput.Icon icon="school" />}
              />

              <TextInput
                label="Issuing Organization *"
                value={certForm.organization}
                onChangeText={(text) => setCertForm(prev => ({ ...prev, organization: text }))}
                style={styles.input}
                left={<TextInput.Icon icon="business" />}
              />

              <TextInput
                label="Category"
                value={certForm.category}
                onChangeText={(text) => setCertForm(prev => ({ ...prev, category: text }))}
                style={styles.input}
                placeholder="e.g., Personal Training, Nutrition"
                left={<TextInput.Icon icon="category" />}
              />

              <TextInput
                label="Credential ID"
                value={certForm.credentialId}
                onChangeText={(text) => setCertForm(prev => ({ ...prev, credentialId: text }))}
                style={styles.input}
                left={<TextInput.Icon icon="badge" />}
              />

              <TextInput
                label="Issue Date"
                value={certForm.issueDate}
                onChangeText={(text) => setCertForm(prev => ({ ...prev, issueDate: text }))}
                style={styles.input}
                placeholder="YYYY-MM-DD"
                left={<TextInput.Icon icon="date-range" />}
              />

              <TextInput
                label="Expiry Date"
                value={certForm.expiryDate}
                onChangeText={(text) => setCertForm(prev => ({ ...prev, expiryDate: text }))}
                style={styles.input}
                placeholder="YYYY-MM-DD"
                left={<TextInput.Icon icon="event" />}
              />

              <TextInput
                label="Description"
                value={certForm.description}
                onChangeText={(text) => setCertForm(prev => ({ ...prev, description: text }))}
                style={styles.input}
                multiline
                numberOfLines={3}
                left={<TextInput.Icon icon="description" />}
              />

              <Button
                mode="outlined"
                onPress={() => Alert.alert('Feature in Development', 'Document upload is being developed.')}
                style={styles.uploadButton}
                icon="attach-file"
              >
                Upload Certificate Document
              </Button>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAddModal(false)}
                  style={[styles.modalButton, { marginRight: SPACING.md }]}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddCertification}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                >
                  Add Certification
                </Button>
              </View>
            </>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={showDetailModal}
        onDismiss={() => setShowDetailModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedCert && (
          <ScrollView>
            <View style={styles.detailHeader}>
              <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
                {selectedCert.name}
              </Text>
              {selectedCert.verified && (
                <Icon name="verified" size={24} color={COLORS.success} />
              )}
            </View>
            
            <View style={styles.detailContent}>
              <Text style={TEXT_STYLES.subtitle}>Organization</Text>
              <Text style={TEXT_STYLES.body}>{selectedCert.organization}</Text>
              
              <Text style={[TEXT_STYLES.subtitle, { marginTop: SPACING.md }]}>
                Credential ID
              </Text>
              <Text style={TEXT_STYLES.body}>{selectedCert.credentialId}</Text>
              
              <Text style={[TEXT_STYLES.subtitle, { marginTop: SPACING.md }]}>
                Description
              </Text>
              <Text style={TEXT_STYLES.body}>{selectedCert.description}</Text>
              
              <Text style={[TEXT_STYLES.subtitle, { marginTop: SPACING.md }]}>
                Validity Period
              </Text>
              <Text style={TEXT_STYLES.body}>
                {new Date(selectedCert.issueDate).toLocaleDateString()} - {' '}
                {new Date(selectedCert.expiryDate).toLocaleDateString()}
              </Text>
              
              {selectedCert.skills && selectedCert.skills.length > 0 && (
                <>
                  <Text style={[TEXT_STYLES.subtitle, { marginTop: SPACING.md }]}>
                    Skills & Competencies
                  </Text>
                  <View style={styles.skillsGrid}>
                    {selectedCert.skills.map((skill, index) => (
                      <Chip key={index} mode="outlined" style={styles.skillChip}>
                        {skill}
                      </Chip>
                    ))}
                  </View>
                </>
              )}
            </View>

            <View style={styles.detailActions}>
              {selectedCert.document && (
                <Button
                  mode="outlined"
                  onPress={() => Alert.alert('Feature in Development', 'Document viewing is being developed.')}
                  style={styles.detailButton}
                  icon="description"
                >
                  View Certificate
                </Button>
              )}
              
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Feature in Development', 'Sharing feature is being developed.')}
                style={styles.detailButton}
                icon="share"
              >
                Share
              </Button>
            </View>
            
            <Button
              mode="outlined"
              onPress={() => setShowDetailModal(false)}
              style={styles.closeButton}
            >
              Close
            </Button>
          </ScrollView>
        )}
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
        {renderOverviewCard()}
        
        <View style={styles.certificationsList}>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
            My Certifications ({myCertifications.length})
          </Text>
          {myCertifications.map(renderCertificationCard)}
        </View>

        {renderRecommendedCerts()}
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        color={COLORS.white}
      />

      {renderAddModal()}
      {renderDetailModal()}
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
    paddingBottom: 100,
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
    marginBottom: SPACING.lg,
  },
  overviewText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  credibilitySection: {
    paddingTop: SPACING.md,
  },
  credibilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  credibilityBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  sectionSubtitle: {
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
  },
  certificationsList: {
    marginBottom: SPACING.md,
  },
  certCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  certInfo: {
    flex: 1,
  },
  certTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  verifiedIcon: {
    marginLeft: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  certDetails: {
    marginBottom: SPACING.md,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  dateItem: {
    flex: 1,
  },
  skillsRow: {
    marginTop: SPACING.sm,
  },
  skillChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
    alignItems: 'center',
  },
  skillChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  certActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: SPACING.xs,
  },
  recommendedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recommendedContent: {
    flex: 1,
  },
  popularityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  popularityBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    borderRadius: 12,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  input: {
    marginBottom: SPACING.md,
  },
  uploadButton: {
    marginBottom: SPACING.lg,
  },
  uploadingContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  uploadProgress: {
    width: '100%',
    marginVertical: SPACING.lg,
    height: 8,
    borderRadius: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  detailContent: {
    marginBottom: SPACING.lg,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  detailButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  closeButton: {
    marginTop: SPACING.md,
  },
});

export default Certification;