import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Vibration,
  Modal,
  TextInput,
  Platform,
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
  Dialog,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const CertificationTracker = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, certifications, loading } = useSelector(state => state.coach);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [newCertification, setNewCertification] = useState({
    name: '',
    organization: '',
    issueDate: '',
    expiryDate: '',
    category: 'fitness',
    credentialId: '',
    status: 'active'
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample certifications data (replace with Redux state)
  const [certificationsData, setCertificationsData] = useState([
    {
      id: '1',
      name: 'Certified Personal Trainer',
      organization: 'ACSM',
      issueDate: '2023-01-15',
      expiryDate: '2025-01-15',
      category: 'fitness',
      credentialId: 'CPT-2023-789',
      status: 'active',
      daysUntilExpiry: 156,
      progress: 85
    },
    {
      id: '2',
      name: 'Youth Sports Psychology',
      organization: 'AASP',
      issueDate: '2022-06-10',
      expiryDate: '2024-06-10',
      category: 'psychology',
      credentialId: 'YSP-2022-456',
      status: 'expiring_soon',
      daysUntilExpiry: 45,
      progress: 95
    },
    {
      id: '3',
      name: 'Strength & Conditioning Specialist',
      organization: 'NSCA',
      issueDate: '2021-03-20',
      expiryDate: '2024-03-20',
      category: 'strength',
      credentialId: 'CSCS-2021-123',
      status: 'expired',
      daysUntilExpiry: -30,
      progress: 100
    }
  ]);

  const categories = [
    { key: 'all', label: 'All', icon: 'view-module' },
    { key: 'fitness', label: 'Fitness', icon: 'fitness-center' },
    { key: 'strength', label: 'Strength', icon: 'trending-up' },
    { key: 'psychology', label: 'Psychology', icon: 'psychology' },
    { key: 'nutrition', label: 'Nutrition', icon: 'restaurant' }
  ];

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch action to fetch certifications
      // dispatch(fetchCertifications());
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh certifications');
    }
    setRefreshing(false);
  }, []);

  const filteredCertifications = certificationsData.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || cert.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'expiring_soon': return COLORS.warning;
      case 'expired': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'check-circle';
      case 'expiring_soon': return 'warning';
      case 'expired': return 'error';
      default: return 'help';
    }
  };

  const handleAddCertification = () => {
    Vibration.vibrate(50);
    setShowAddDialog(true);
  };

  const handleViewDetails = (certification) => {
    setSelectedCertification(certification);
    setShowDetailsModal(true);
  };

  const handleRenewCertification = (certId) => {
    Alert.alert(
      'Renew Certification',
      'This will redirect you to the certification provider\'s renewal portal.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // Handle renewal process
            Alert.alert('Feature Coming Soon', 'Certification renewal integration is under development! 🚀');
          }
        }
      ]
    );
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Surface style={styles.statCard}>
        <LinearGradient
          colors={[COLORS.success, '#4CAF50']}
          style={styles.statGradient}
        >
          <Icon name="verified" size={24} color="white" />
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Active</Text>
        </LinearGradient>
      </Surface>
      
      <Surface style={styles.statCard}>
        <LinearGradient
          colors={[COLORS.warning, '#FF9800']}
          style={styles.statGradient}
        >
          <Icon name="schedule" size={24} color="white" />
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>Expiring Soon</Text>
        </LinearGradient>
      </Surface>
      
      <Surface style={styles.statCard}>
        <LinearGradient
          colors={[COLORS.primary, '#764ba2']}
          style={styles.statGradient}
        >
          <Icon name="trending-up" size={24} color="white" />
          <Text style={styles.statNumber}>89%</Text>
          <Text style={styles.statLabel}>Compliance</Text>
        </LinearGradient>
      </Surface>
    </View>
  );

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <Chip
          key={category.key}
          mode={selectedCategory === category.key ? 'flat' : 'outlined'}
          selected={selectedCategory === category.key}
          onPress={() => setSelectedCategory(category.key)}
          icon={category.icon}
          style={[
            styles.categoryChip,
            selectedCategory === category.key && styles.selectedChip
          ]}
          textStyle={[
            styles.chipText,
            selectedCategory === category.key && styles.selectedChipText
          ]}
        >
          {category.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderCertificationCard = (certification) => (
    <TouchableOpacity
      key={certification.id}
      onPress={() => handleViewDetails(certification)}
      activeOpacity={0.7}
    >
      <Card style={[styles.certificationCard, { borderLeftColor: getStatusColor(certification.status) }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.certificationInfo}>
              <Text style={styles.certificationName}>{certification.name}</Text>
              <Text style={styles.organizationName}>{certification.organization}</Text>
              <Text style={styles.credentialId}>ID: {certification.credentialId}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Icon
                name={getStatusIcon(certification.status)}
                size={24}
                color={getStatusColor(certification.status)}
              />
              <Chip
                mode="outlined"
                compact
                style={[styles.statusChip, { borderColor: getStatusColor(certification.status) }]}
                textStyle={{ color: getStatusColor(certification.status), fontSize: 10 }}
              >
                {certification.status.replace('_', ' ').toUpperCase()}
              </Chip>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>
                {certification.daysUntilExpiry > 0 
                  ? `${certification.daysUntilExpiry} days until expiry`
                  : `Expired ${Math.abs(certification.daysUntilExpiry)} days ago`}
              </Text>
              <Text style={styles.expiryDate}>
                Expires: {new Date(certification.expiryDate).toLocaleDateString()}
              </Text>
            </View>
            <ProgressBar
              progress={certification.progress / 100}
              color={getStatusColor(certification.status)}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.cardActions}>
            <Button
              mode="outlined"
              compact
              onPress={() => handleViewDetails(certification)}
              style={styles.actionButton}
            >
              View Details
            </Button>
            {certification.status === 'expiring_soon' || certification.status === 'expired' ? (
              <Button
                mode="contained"
                compact
                onPress={() => handleRenewCertification(certification.id)}
                style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              >
                Renew Now
              </Button>
            ) : null}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderAddCertificationDialog = () => (
    <Portal>
      <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)}>
        <Dialog.Title>Add New Certification</Dialog.Title>
        <Dialog.Content>
          <TextInput
            style={styles.input}
            placeholder="Certification Name"
            value={newCertification.name}
            onChangeText={(text) => setNewCertification({...newCertification, name: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Organization"
            value={newCertification.organization}
            onChangeText={(text) => setNewCertification({...newCertification, organization: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Credential ID"
            value={newCertification.credentialId}
            onChangeText={(text) => setNewCertification({...newCertification, credentialId: text})}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowAddDialog(false)}>Cancel</Button>
          <Button
            mode="contained"
            onPress={() => {
              // Handle add certification
              Alert.alert('Feature Coming Soon', 'Adding certifications is under development! 🚀');
              setShowAddDialog(false);
            }}
          >
            Add
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showDetailsModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDetailsModal(false)}
    >
      <BlurView
        style={StyleSheet.absoluteFillObject}
        blurType="dark"
        blurAmount={10}
      />
      <View style={styles.modalContainer}>
        <Surface style={styles.modalContent}>
          {selectedCertification && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedCertification.name}</Text>
                <IconButton
                  icon="close"
                  onPress={() => setShowDetailsModal(false)}
                />
              </View>
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Organization:</Text>
                  <Text style={styles.detailValue}>{selectedCertification.organization}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Issue Date:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedCertification.issueDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Expiry Date:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedCertification.expiryDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Credential ID:</Text>
                  <Text style={styles.detailValue}>{selectedCertification.credentialId}</Text>
                </View>
              </ScrollView>
            </>
          )}
        </Surface>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Certifications</Text>
            <IconButton
              icon="notifications"
              iconColor="white"
              onPress={() => Alert.alert('Feature Coming Soon', 'Notifications are under development! 🔔')}
            />
          </View>
          
          <View style={styles.headerStats}>
            <Text style={styles.welcomeText}>Track Your Professional Growth 📜</Text>
            <Text style={styles.subtitle}>Stay certified and compliant</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Stats Cards */}
          {renderStatsCards()}

          {/* Search */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search certifications..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor={COLORS.primary}
            />
          </View>

          {/* Category Filter */}
          {renderCategoryFilter()}

          {/* Certifications List */}
          <View style={styles.certificationsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Your Certifications ({filteredCertifications.length})
              </Text>
            </View>

            {filteredCertifications.length > 0 ? (
              filteredCertifications.map(renderCertificationCard)
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Icon name="school" size={64} color={COLORS.textSecondary} />
                  <Text style={styles.emptyTitle}>No Certifications Found</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery ? 'Try adjusting your search' : 'Add your first certification'}
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* FAB */}
      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={handleAddCertification}
        label="Add Certification"
      />

      {/* Modals */}
      {renderAddCertificationDialog()}
      {renderDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerStats: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  welcomeText: {
    ...TEXT_STYLES.h3,
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.md,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    elevation: 4,
  },
  statGradient: {
    padding: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: SPACING.md,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  categoryContainer: {
    marginBottom: SPACING.lg,
  },
  categoryContent: {
    paddingRight: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    backgroundColor: 'white',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textPrimary,
  },
  selectedChipText: {
    color: 'white',
  },
  certificationsSection: {
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  certificationCard: {
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  certificationInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  certificationName: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  organizationName: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  credentialId: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  statusContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusChip: {
    height: 24,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  expiryDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    flex: 1,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
});

export default CertificationTracker;