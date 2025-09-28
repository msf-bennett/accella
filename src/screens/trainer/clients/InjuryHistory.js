import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  ProgressBar,
  Portal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const InjuryHistory = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, clients } = useSelector(state => state.auth);
  const { injuries, isLoading } = useSelector(state => state.injuries);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(route?.params?.clientId || null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInjury, setSelectedInjury] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Mock data for development
  const mockInjuries = [
    {
      id: '1',
      clientId: 'client1',
      clientName: 'Sarah Johnson',
      injuryType: 'Knee Strain',
      bodyPart: 'Knee',
      severity: 'moderate',
      date: '2025-08-15',
      status: 'recovering',
      description: 'Experienced knee pain during squats',
      restrictions: ['No heavy leg workouts', 'Avoid jumping'],
      treatmentPlan: 'Physical therapy 3x/week',
      estimatedRecovery: '2-3 weeks',
      doctorNotes: 'Minor strain, rest recommended',
    },
    {
      id: '2',
      clientId: 'client2',
      clientName: 'Mike Chen',
      injuryType: 'Lower Back Pain',
      bodyPart: 'Lower Back',
      severity: 'mild',
      date: '2025-08-10',
      status: 'healed',
      description: 'Mild discomfort during deadlifts',
      restrictions: ['Modified deadlift form'],
      treatmentPlan: 'Stretching and mobility work',
      estimatedRecovery: '1 week',
      doctorNotes: 'Muscle tension, no structural damage',
    },
    {
      id: '3',
      clientId: 'client1',
      clientName: 'Sarah Johnson',
      injuryType: 'Shoulder Impingement',
      bodyPart: 'Shoulder',
      severity: 'severe',
      date: '2025-07-28',
      status: 'chronic',
      description: 'Recurring shoulder pain during overhead movements',
      restrictions: ['No overhead pressing', 'Limited shoulder mobility'],
      treatmentPlan: 'Specialist consultation required',
      estimatedRecovery: '6-8 weeks',
      doctorNotes: 'Chronic condition, needs ongoing management',
    },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Injury history updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh injury history');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild': return COLORS.success;
      case 'moderate': return '#ff9500';
      case 'severe': return COLORS.error;
      default: return COLORS.secondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healed': return COLORS.success;
      case 'recovering': return '#ff9500';
      case 'chronic': return COLORS.error;
      case 'acute': return '#ff4757';
      default: return COLORS.secondary;
    }
  };

  const filteredInjuries = mockInjuries.filter(injury => {
    const matchesSearch = injury.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         injury.injuryType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         injury.bodyPart.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || injury.severity === filterSeverity;
    const matchesClient = !selectedClient || injury.clientId === selectedClient;
    
    return matchesSearch && matchesSeverity && matchesClient;
  });

  const handleAddInjury = () => {
    setShowAddModal(true);
  };

  const handleViewDetails = (injury) => {
    setSelectedInjury(injury);
  };

  const handleUpdateStatus = (injuryId, newStatus) => {
    Alert.alert(
      'Update Status',
      `Update injury status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => {
            // Dispatch update action
            Alert.alert('Success', 'Injury status updated!');
          }
        },
      ]
    );
  };

  const renderInjuryCard = (injury) => (
    <Card key={injury.id} style={styles.injuryCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <Avatar.Text 
              size={40} 
              label={injury.clientName.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: COLORS.primary }}
            />
            <View style={styles.clientDetails}>
              <Text style={styles.clientName}>{injury.clientName}</Text>
              <Text style={styles.injuryDate}>{new Date(injury.date).toLocaleDateString()}</Text>
            </View>
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => handleViewDetails(injury)}
          />
        </View>

        <View style={styles.injuryInfo}>
          <View style={styles.injuryHeader}>
            <Text style={styles.injuryType}>{injury.injuryType}</Text>
            <Chip 
              style={[styles.severityChip, { backgroundColor: getSeverityColor(injury.severity) + '20' }]}
              textStyle={{ color: getSeverityColor(injury.severity), fontSize: 12 }}
            >
              {injury.severity.toUpperCase()}
            </Chip>
          </View>
          
          <Text style={styles.bodyPart}>📍 {injury.bodyPart}</Text>
          <Text style={styles.description}>{injury.description}</Text>
          
          <View style={styles.statusRow}>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(injury.status) + '20' }]}
              textStyle={{ color: getStatusColor(injury.status), fontSize: 12 }}
              icon={() => <Icon name="healing" size={16} color={getStatusColor(injury.status)} />}
            >
              {injury.status.toUpperCase()}
            </Chip>
            <Text style={styles.recoveryTime}>⏱️ {injury.estimatedRecovery}</Text>
          </View>

          {injury.restrictions.length > 0 && (
            <View style={styles.restrictionsContainer}>
              <Text style={styles.restrictionsTitle}>⚠️ Current Restrictions:</Text>
              {injury.restrictions.map((restriction, index) => (
                <Text key={index} style={styles.restrictionItem}>• {restriction}</Text>
              ))}
            </View>
          )}

          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => handleUpdateStatus(injury.id, 'healed')}
              style={styles.actionButton}
              labelStyle={{ fontSize: 12 }}
            >
              Mark Healed
            </Button>
            <Button
              mode="contained"
              onPress={() => handleViewDetails(injury)}
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              labelStyle={{ fontSize: 12 }}
            >
              View Details
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <Icon name="local-hospital" size={80} color={COLORS.secondary} />
      <Text style={styles.emptyTitle}>No Injury Records</Text>
      <Text style={styles.emptyText}>
        {selectedClient 
          ? "This client has no recorded injuries" 
          : "No injury records found for your clients"}
      </Text>
      <Button
        mode="contained"
        onPress={handleAddInjury}
        style={styles.addButton}
        icon="add"
      >
        Record First Injury
      </Button>
    </Surface>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={!!selectedInjury}
        onDismiss={() => setSelectedInjury(null)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalOverlay} blurType="light" blurAmount={5}>
          <Surface style={styles.detailCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Injury Details</Text>
              <IconButton
                icon="close"
                onPress={() => setSelectedInjury(null)}
              />
            </View>
            
            {selectedInjury && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Client</Text>
                  <Text style={styles.detailValue}>{selectedInjury.clientName}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Injury Type</Text>
                  <Text style={styles.detailValue}>{selectedInjury.injuryType}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Body Part</Text>
                  <Text style={styles.detailValue}>{selectedInjury.bodyPart}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Severity</Text>
                  <Chip 
                    style={[styles.severityChip, { backgroundColor: getSeverityColor(selectedInjury.severity) + '20' }]}
                    textStyle={{ color: getSeverityColor(selectedInjury.severity) }}
                  >
                    {selectedInjury.severity.toUpperCase()}
                  </Chip>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{selectedInjury.description}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Treatment Plan</Text>
                  <Text style={styles.detailValue}>{selectedInjury.treatmentPlan}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Doctor's Notes</Text>
                  <Text style={styles.detailValue}>{selectedInjury.doctorNotes}</Text>
                </View>
                
                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setSelectedInjury(null);
                      Alert.alert('Feature Coming Soon', 'Edit injury functionality will be available in the next update');
                    }}
                    style={styles.modalActionButton}
                  >
                    Edit Injury
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleUpdateStatus(selectedInjury.id, 'healed')}
                    style={[styles.modalActionButton, { backgroundColor: COLORS.success }]}
                  >
                    Mark as Healed
                  </Button>
                </View>
              </ScrollView>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Injury History 🏥</Text>
        <Text style={styles.headerSubtitle}>Track and manage client injuries</Text>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search injuries, clients, or body parts..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              {['all', 'mild', 'moderate', 'severe'].map((severity) => (
                <Chip
                  key={severity}
                  selected={filterSeverity === severity}
                  onPress={() => setFilterSeverity(severity)}
                  style={[
                    styles.filterChip,
                    filterSeverity === severity && { backgroundColor: COLORS.primary + '20' }
                  ]}
                  textStyle={{ 
                    color: filterSeverity === severity ? COLORS.primary : COLORS.secondary 
                  }}
                >
                  {severity === 'all' ? 'All Injuries' : severity.charAt(0).toUpperCase() + severity.slice(1)}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.statsRow}>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{mockInjuries.length}</Text>
            <Text style={styles.statLabel}>Total Injuries</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>
              {mockInjuries.filter(i => i.status === 'recovering').length}
            </Text>
            <Text style={styles.statLabel}>Recovering</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>
              {mockInjuries.filter(i => i.status === 'healed').length}
            </Text>
            <Text style={styles.statLabel}>Healed</Text>
          </Surface>
        </View>

        <ScrollView
          style={styles.injuriesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {filteredInjuries.length > 0 ? (
            filteredInjuries.map((injury) => renderInjuryCard(injury))
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleAddInjury}
        color="white"
      />

      {renderDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  searchSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterChips: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  injuriesList: {
    flex: 1,
  },
  injuryCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientDetails: {
    marginLeft: SPACING.md,
  },
  clientName: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  injuryDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  injuryInfo: {
    marginTop: SPACING.sm,
  },
  injuryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  injuryType: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    flex: 1,
  },
  severityChip: {
    marginLeft: SPACING.sm,
  },
  bodyPart: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statusChip: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  recoveryTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  restrictionsContainer: {
    backgroundColor: '#fff3cd',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
  },
  restrictionsTitle: {
    ...TEXT_STYLES.subtitle,
    color: '#856404',
    marginBottom: SPACING.sm,
  },
  restrictionItem: {
    ...TEXT_STYLES.body,
    color: '#856404',
    marginBottom: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    borderRadius: 12,
    margin: SPACING.lg,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  detailCard: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  detailSection: {
    marginBottom: SPACING.lg,
  },
  detailLabel: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  modalActionButton: {
    flex: 1,
  },
});

export default InjuryHistory;