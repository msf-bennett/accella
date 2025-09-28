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
  Dimensions,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  Searchbar,
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const MedicalClearance = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, medicalClearances } = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedClearance, setSelectedClearance] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Medical clearances state
  const [clearances, setClearances] = useState([
    {
      id: 1,
      type: 'Pre-participation Physical',
      status: 'valid',
      issueDate: '2024-01-15',
      expiryDate: '2025-01-15',
      issuedBy: 'Dr. Sarah Johnson',
      facility: 'Sports Medicine Center',
      documentUrl: null,
      sport: 'Football',
      level: 'High School',
      restrictions: [],
      notes: 'Cleared for all activities'
    },
    {
      id: 2,
      type: 'Cardiac Screening',
      status: 'expiring',
      issueDate: '2023-08-20',
      expiryDate: '2024-08-20',
      issuedBy: 'Dr. Michael Chen',
      facility: 'Heart Health Clinic',
      documentUrl: null,
      sport: 'All Sports',
      level: 'Competitive',
      restrictions: [],
      notes: 'ECG and Echo normal'
    },
    {
      id: 3,
      type: 'Concussion Baseline',
      status: 'valid',
      issueDate: '2024-02-10',
      expiryDate: '2026-02-10',
      issuedBy: 'Dr. Emily Rodriguez',
      facility: 'Neurology Associates',
      documentUrl: null,
      sport: 'Contact Sports',
      level: 'All Levels',
      restrictions: [],
      notes: 'ImPACT test completed'
    },
    {
      id: 4,
      type: 'Return to Play',
      status: 'expired',
      issueDate: '2023-05-15',
      expiryDate: '2023-11-15',
      issuedBy: 'Dr. James Wilson',
      facility: 'Orthopedic Clinic',
      documentUrl: null,
      sport: 'Football',
      level: 'High School',
      restrictions: ['No contact drills for 2 weeks'],
      notes: 'Post ankle injury clearance'
    }
  ]);

  const [requirements, setRequirements] = useState([
    {
      id: 1,
      name: 'Annual Physical Exam',
      description: 'Comprehensive physical examination',
      frequency: 'Yearly',
      dueDate: '2025-01-15',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 2,
      name: 'Vision Screening',
      description: 'Eye examination for sports participation',
      frequency: 'Every 2 years',
      dueDate: '2024-12-01',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: 3,
      name: 'Immunization Update',
      description: 'Tetanus and other required vaccines',
      frequency: 'As needed',
      dueDate: '2024-09-30',
      status: 'overdue',
      priority: 'high'
    }
  ]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    loadMedicalClearances();
  }, []);

  const loadMedicalClearances = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, dispatch action to load clearances
    } catch (error) {
      Alert.alert('Error', 'Failed to load medical clearances');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMedicalClearances();
    setRefreshing(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return COLORS.success;
      case 'expiring': return '#FF9500';
      case 'expired': return COLORS.error;
      case 'pending': return '#007AFF';
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid': return 'check-circle';
      case 'expiring': return 'warning';
      case 'expired': return 'cancel';
      case 'pending': return 'schedule';
      default: return 'help';
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getClearanceStatus = (clearance) => {
    const daysUntilExpiry = getDaysUntilExpiry(clearance.expiryDate);
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'valid';
  };

  const getOverallComplianceScore = () => {
    const validClearances = clearances.filter(c => getClearanceStatus(c) === 'valid').length;
    const totalClearances = clearances.length;
    return Math.round((validClearances / totalClearances) * 100);
  };

  const filteredClearances = clearances.filter(clearance => {
    const matchesSearch = clearance.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clearance.issuedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || getClearanceStatus(clearance) === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderComplianceOverview = () => (
    <Card style={styles.overviewCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientHeader}
      >
        <View style={styles.overviewContent}>
          <View style={styles.overviewLeft}>
            <Text style={styles.overviewTitle}>Medical Compliance</Text>
            <Text style={styles.overviewSubtitle}>
              {clearances.filter(c => getClearanceStatus(c) === 'valid').length} of {clearances.length} valid
            </Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{getOverallComplianceScore()}%</Text>
            <Icon 
              name={getOverallComplianceScore() >= 80 ? 'verified' : 'warning'} 
              size={24} 
              color="white" 
            />
          </View>
        </View>
        <ProgressBar
          progress={getOverallComplianceScore() / 100}
          color={getOverallComplianceScore() >= 80 ? COLORS.success : '#FF9500'}
          style={styles.progressBar}
        />
      </LinearGradient>
    </Card>
  );

  const renderQuickStats = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.statsScroll}
      contentContainerStyle={styles.statsContainer}
    >
      <Surface style={[styles.statCard, { backgroundColor: COLORS.success + '20' }]}>
        <Icon name="check-circle" size={32} color={COLORS.success} />
        <Text style={styles.statNumber}>
          {clearances.filter(c => getClearanceStatus(c) === 'valid').length}
        </Text>
        <Text style={styles.statLabel}>Valid</Text>
      </Surface>
      
      <Surface style={[styles.statCard, { backgroundColor: '#FF9500' + '20' }]}>
        <Icon name="warning" size={32} color="#FF9500" />
        <Text style={styles.statNumber}>
          {clearances.filter(c => getClearanceStatus(c) === 'expiring').length}
        </Text>
        <Text style={styles.statLabel}>Expiring</Text>
      </Surface>
      
      <Surface style={[styles.statCard, { backgroundColor: COLORS.error + '20' }]}>
        <Icon name="cancel" size={32} color={COLORS.error} />
        <Text style={styles.statNumber}>
          {clearances.filter(c => getClearanceStatus(c) === 'expired').length}
        </Text>
        <Text style={styles.statLabel}>Expired</Text>
      </Surface>

      <Surface style={[styles.statCard, { backgroundColor: '#007AFF' + '20' }]}>
        <Icon name="schedule" size={32} color="#007AFF" />
        <Text style={styles.statNumber}>
          {requirements.filter(r => r.status === 'pending').length}
        </Text>
        <Text style={styles.statLabel}>Pending</Text>
      </Surface>
    </ScrollView>
  );

  const renderSearchAndFilter = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search clearances..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
      />
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
      >
        {['all', 'valid', 'expiring', 'expired'].map(status => (
          <Chip
            key={status}
            mode={filterStatus === status ? 'flat' : 'outlined'}
            selected={filterStatus === status}
            onPress={() => setFilterStatus(status)}
            style={styles.filterChip}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderClearanceCard = (clearance) => {
    const status = getClearanceStatus(clearance);
    const daysUntilExpiry = getDaysUntilExpiry(clearance.expiryDate);

    return (
      <TouchableOpacity
        key={clearance.id}
        onPress={() => {
          setSelectedClearance(clearance);
          setDetailModalVisible(true);
          Vibration.vibrate(50);
        }}
        activeOpacity={0.7}
      >
        <Card style={styles.clearanceCard}>
          <Card.Content style={styles.clearanceContent}>
            <View style={styles.clearanceHeader}>
              <View style={styles.clearanceInfo}>
                <Text style={styles.clearanceType}>{clearance.type}</Text>
                <Text style={styles.clearanceDoctor}>Dr. {clearance.issuedBy}</Text>
                <Text style={styles.clearanceFacility}>{clearance.facility}</Text>
              </View>
              <View style={styles.clearanceStatus}>
                <Icon 
                  name={getStatusIcon(status)} 
                  size={28} 
                  color={getStatusColor(status)} 
                />
                <Chip
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: getStatusColor(status) + '20' }]}
                  textStyle={{ color: getStatusColor(status), fontSize: 12 }}
                >
                  {status.toUpperCase()}
                </Chip>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.clearanceDetails}>
              <View style={styles.detailRow}>
                <Icon name="event" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  Expires: {clearance.expiryDate}
                  {status !== 'expired' && (
                    <Text style={{ color: getStatusColor(status) }}>
                      {daysUntilExpiry > 0 ? ` (${daysUntilExpiry} days)` : ' (Today)'}
                    </Text>
                  )}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Icon name="sports" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{clearance.sport} - {clearance.level}</Text>
              </View>

              {clearance.restrictions.length > 0 && (
                <View style={styles.detailRow}>
                  <Icon name="warning" size={16} color="#FF9500" />
                  <Text style={[styles.detailText, { color: '#FF9500' }]}>
                    {clearance.restrictions.length} restriction(s)
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
          
          <View style={styles.cardActions}>
            <Button
              mode="text"
              icon="visibility"
              onPress={() => {
                setSelectedClearance(clearance);
                setDetailModalVisible(true);
              }}
            >
              View Details
            </Button>
            {clearance.documentUrl && (
              <Button
                mode="text"
                icon="file-download"
                onPress={() => Alert.alert('Download', 'Feature coming soon!')}
              >
                Download
              </Button>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderRequirements = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Upcoming Requirements 📋"
        titleStyle={styles.cardTitle}
        right={() => (
          <Badge size={24} style={{ backgroundColor: COLORS.primary }}>
            {requirements.filter(r => r.status !== 'completed').length}
          </Badge>
        )}
      />
      <Card.Content>
        {requirements.map(requirement => (
          <Surface key={requirement.id} style={styles.requirementItem}>
            <View style={styles.requirementInfo}>
              <Text style={styles.requirementName}>{requirement.name}</Text>
              <Text style={styles.requirementDesc}>{requirement.description}</Text>
              <Text style={styles.requirementDue}>Due: {requirement.dueDate}</Text>
            </View>
            <Chip
              icon={requirement.status === 'completed' ? 'check' : 
                   requirement.status === 'overdue' ? 'warning' : 'schedule'}
              mode={requirement.status === 'completed' ? 'flat' : 'outlined'}
              style={[
                styles.requirementChip,
                requirement.status === 'completed' && { backgroundColor: COLORS.success + '20' },
                requirement.status === 'overdue' && { backgroundColor: COLORS.error + '20' }
              ]}
              textStyle={{
                color: requirement.status === 'completed' ? COLORS.success :
                       requirement.status === 'overdue' ? COLORS.error : COLORS.primary
              }}
            >
              {requirement.status}
            </Chip>
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
              title={selectedClearance?.type}
              titleStyle={styles.modalTitle}
              right={() => (
                <IconButton
                  icon="close"
                  onPress={() => setDetailModalVisible(false)}
                />
              )}
            />
            <Card.Content>
              {selectedClearance && (
                <ScrollView style={styles.modalContent}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Status</Text>
                    <View style={styles.modalStatusRow}>
                      <Icon 
                        name={getStatusIcon(getClearanceStatus(selectedClearance))} 
                        size={24} 
                        color={getStatusColor(getClearanceStatus(selectedClearance))} 
                      />
                      <Text style={[styles.modalStatusText, { 
                        color: getStatusColor(getClearanceStatus(selectedClearance)) 
                      }]}>
                        {getClearanceStatus(selectedClearance).toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Medical Professional</Text>
                    <Text style={styles.modalText}>Dr. {selectedClearance.issuedBy}</Text>
                    <Text style={styles.modalSubtext}>{selectedClearance.facility}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Dates</Text>
                    <Text style={styles.modalText}>Issued: {selectedClearance.issueDate}</Text>
                    <Text style={styles.modalText}>Expires: {selectedClearance.expiryDate}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Sport & Level</Text>
                    <Text style={styles.modalText}>{selectedClearance.sport}</Text>
                    <Text style={styles.modalSubtext}>{selectedClearance.level}</Text>
                  </View>

                  {selectedClearance.restrictions.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Restrictions</Text>
                      {selectedClearance.restrictions.map((restriction, index) => (
                        <Text key={index} style={[styles.modalText, { color: '#FF9500' }]}>
                          • {restriction}
                        </Text>
                      ))}
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Notes</Text>
                    <Text style={styles.modalText}>{selectedClearance.notes}</Text>
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
              <Button
                mode="contained"
                icon="file-download"
                onPress={() => Alert.alert('Download', 'Feature coming soon!')}
                style={styles.modalButton}
              >
                Download
              </Button>
            </Card.Actions>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderUploadModal = () => (
    <Portal>
      <Modal
        visible={uploadModalVisible}
        onDismiss={() => setUploadModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <Card style={styles.modalCard}>
            <Card.Title
              title="Upload Clearance 📄"
              titleStyle={styles.modalTitle}
              right={() => (
                <IconButton
                  icon="close"
                  onPress={() => setUploadModalVisible(false)}
                />
              )}
            />
            <Card.Content>
              <Text style={styles.modalText}>
                Feature coming soon! 🚧
              </Text>
              <Text style={styles.modalSubtext}>
                You'll be able to upload and manage your medical clearance documents here.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => setUploadModalVisible(false)}
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
        {renderQuickStats()}
        {renderSearchAndFilter()}
        
        <Text style={styles.sectionTitle}>Medical Clearances 🏥</Text>
        {filteredClearances.map(renderClearanceCard)}
        
        {renderRequirements()}
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          setUploadModalVisible(true);
          Vibration.vibrate(50);
        }}
      />

      {renderDetailModal()}
      {renderUploadModal()}
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
  statsScroll: {
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    paddingHorizontal: SPACING.xs,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    minWidth: 80,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: SPACING.lg,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  clearanceCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  clearanceContent: {
    paddingBottom: 0,
  },
  clearanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clearanceInfo: {
    flex: 1,
  },
  clearanceType: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  clearanceDoctor: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginTop: SPACING.xs / 2,
  },
  clearanceFacility: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  clearanceStatus: {
    alignItems: 'center',
  },
  statusChip: {
    marginTop: SPACING.xs,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  clearanceDetails: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  cardActions: {
    paddingTop: 0,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  requirementInfo: {
    flex: 1,
  },
  requirementName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  requirementDesc: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  requirementDue: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginTop: SPACING.xs / 2,
  },
  requirementChip: {
    marginLeft: SPACING.md,
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
  },
  modalSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modalActions: {
    justifyContent: 'space-between',
  },
  modalButton: {
    marginLeft: SPACING.sm,
  },
});

export default MedicalClearance;
