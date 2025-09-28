import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
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
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySecondary: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth } = Dimensions.get('window');

const InjuryLog = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInjury, setSelectedInjury] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // New injury form state
  const [newInjury, setNewInjury] = useState({
    type: '',
    bodyPart: '',
    severity: 'mild',
    date: new Date().toISOString().split('T')[0],
    description: '',
    treatmentPlan: '',
    expectedRecovery: '',
  });

  // Mock data - in real app, this would come from Redux store
  const [injuries, setInjuries] = useState([
    {
      id: 1,
      type: 'Muscle Strain',
      bodyPart: 'Hamstring',
      severity: 'moderate',
      date: '2024-08-15',
      status: 'recovering',
      recoveryProgress: 75,
      description: 'Felt tightness during sprint training',
      treatmentPlan: 'Rest, ice, physical therapy',
      expectedRecovery: '2024-09-01',
      notes: ['Aug 16: Started physiotherapy', 'Aug 20: Reduced pain', 'Aug 23: Light training resumed'],
      nextAppointment: '2024-08-25',
    },
    {
      id: 2,
      type: 'Sprain',
      bodyPart: 'Ankle',
      severity: 'mild',
      date: '2024-07-28',
      status: 'recovered',
      recoveryProgress: 100,
      description: 'Twisted ankle during game',
      treatmentPlan: 'RICE protocol, ankle support',
      expectedRecovery: '2024-08-10',
      notes: ['Jul 29: Swelling reduced', 'Aug 5: Full mobility restored'],
      recoveredDate: '2024-08-08',
    },
    {
      id: 3,
      type: 'Overuse',
      bodyPart: 'Knee',
      severity: 'mild',
      date: '2024-06-10',
      status: 'monitoring',
      recoveryProgress: 90,
      description: 'Knee pain after intense training',
      treatmentPlan: 'Load management, strengthening exercises',
      expectedRecovery: '2024-08-30',
      notes: ['Jun 15: Pain decreased', 'Jul 1: Returned to full training'],
    },
  ]);

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild': return COLORS.success;
      case 'moderate': return COLORS.warning;
      case 'severe': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.error;
      case 'recovering': return COLORS.warning;
      case 'recovered': return COLORS.success;
      case 'monitoring': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'warning';
      case 'recovering': return 'healing';
      case 'recovered': return 'check-circle';
      case 'monitoring': return 'visibility';
      default: return 'help';
    }
  };

  const filterInjuries = () => {
    let filtered = injuries;
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(injury => injury.status === selectedFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(injury =>
        injury.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        injury.bodyPart.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleAddInjury = () => {
    if (!newInjury.type || !newInjury.bodyPart) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    const injury = {
      id: Date.now(),
      ...newInjury,
      status: 'active',
      recoveryProgress: 0,
      notes: [],
    };

    setInjuries(prev => [injury, ...prev]);
    setNewInjury({
      type: '',
      bodyPart: '',
      severity: 'mild',
      date: new Date().toISOString().split('T')[0],
      description: '',
      treatmentPlan: '',
      expectedRecovery: '',
    });
    setShowAddModal(false);
    Alert.alert('Success', 'Injury logged successfully! 📝');
  };

  const renderInjuryCard = (injury) => (
    <TouchableOpacity
      key={injury.id}
      onPress={() => {
        setSelectedInjury(injury);
        setShowDetailModal(true);
      }}
      activeOpacity={0.7}
    >
      <Card style={styles.injuryCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Icon
                name={getStatusIcon(injury.status)}
                size={24}
                color={getStatusColor(injury.status)}
              />
              <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
                {injury.type}
              </Text>
            </View>
            <Chip
              mode="outlined"
              textStyle={{ color: getSeverityColor(injury.severity) }}
              style={{ borderColor: getSeverityColor(injury.severity) }}
            >
              {injury.severity}
            </Chip>
          </View>
          
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Icon name="accessibility" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.xs }]}>
                {injury.bodyPart}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="date-range" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.bodySecondary, { marginLeft: SPACING.xs }]}>
                {new Date(injury.date).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {injury.status === 'recovering' && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={TEXT_STYLES.bodySecondary}>Recovery Progress</Text>
                <Text style={[TEXT_STYLES.bodySecondary, { fontWeight: '600' }]}>
                  {injury.recoveryProgress}%
                </Text>
              </View>
              <ProgressBar
                progress={injury.recoveryProgress / 100}
                color={COLORS.primary}
                style={styles.progressBar}
              />
              {injury.nextAppointment && (
                <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                  Next appointment: {new Date(injury.nextAppointment).toLocaleDateString()}
                </Text>
              )}
            </View>
          )}

          {injury.status === 'recovered' && (
            <View style={styles.recoveredBanner}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={[TEXT_STYLES.bodySecondary, { marginLeft: SPACING.xs, color: COLORS.success }]}>
                Recovered on {new Date(injury.recoveredDate).toLocaleDateString()} 🎉
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderStats = () => {
    const activeInjuries = injuries.filter(i => i.status === 'active' || i.status === 'recovering').length;
    const totalInjuries = injuries.length;
    const recoveredCount = injuries.filter(i => i.status === 'recovered').length;

    return (
      <View style={styles.statsContainer}>
        <Surface style={styles.statCard}>
          <Icon name="warning" size={28} color={COLORS.warning} />
          <Text style={[TEXT_STYLES.h2, { color: COLORS.warning }]}>{activeInjuries}</Text>
          <Text style={TEXT_STYLES.caption}>Active</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Icon name="healing" size={28} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>{totalInjuries}</Text>
          <Text style={TEXT_STYLES.caption}>Total</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Icon name="check-circle" size={28} color={COLORS.success} />
          <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>{recoveredCount}</Text>
          <Text style={TEXT_STYLES.caption}>Recovered</Text>
        </Surface>
      </View>
    );
  };

  const renderFilters = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
      {[
        { key: 'all', label: 'All', icon: 'list' },
        { key: 'active', label: 'Active', icon: 'warning' },
        { key: 'recovering', label: 'Recovering', icon: 'healing' },
        { key: 'recovered', label: 'Recovered', icon: 'check-circle' },
        { key: 'monitoring', label: 'Monitoring', icon: 'visibility' },
      ].map(filter => (
        <TouchableOpacity
          key={filter.key}
          onPress={() => setSelectedFilter(filter.key)}
          style={[
            styles.filterChip,
            selectedFilter === filter.key && styles.filterChipActive
          ]}
        >
          <Icon
            name={filter.icon}
            size={18}
            color={selectedFilter === filter.key ? COLORS.surface : COLORS.textSecondary}
          />
          <Text
            style={[
              TEXT_STYLES.bodySecondary,
              { marginLeft: SPACING.xs },
              selectedFilter === filter.key && { color: COLORS.surface, fontWeight: '600' }
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderAddModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView intensity={20} style={styles.modalBlur}>
          <Card style={styles.modalCard}>
            <Card.Title
              title="Log New Injury 🏥"
              titleStyle={TEXT_STYLES.h3}
              left={(props) => <Avatar.Icon {...props} icon="add" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="close"
                  onPress={() => setShowAddModal(false)}
                />
              )}
            />
            <Card.Content>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput
                  label="Injury Type *"
                  value={newInjury.type}
                  onChangeText={(text) => setNewInjury(prev => ({ ...prev, type: text }))}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Body Part *"
                  value={newInjury.bodyPart}
                  onChangeText={(text) => setNewInjury(prev => ({ ...prev, bodyPart: text }))}
                  mode="outlined"
                  style={styles.input}
                />
                <View style={styles.severityContainer}>
                  <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Severity</Text>
                  <View style={styles.severityButtons}>
                    {['mild', 'moderate', 'severe'].map(severity => (
                      <TouchableOpacity
                        key={severity}
                        onPress={() => setNewInjury(prev => ({ ...prev, severity }))}
                        style={[
                          styles.severityButton,
                          newInjury.severity === severity && {
                            backgroundColor: getSeverityColor(severity),
                          }
                        ]}
                      >
                        <Text
                          style={[
                            TEXT_STYLES.body,
                            newInjury.severity === severity && { color: COLORS.surface }
                          ]}
                        >
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <TextInput
                  label="Description"
                  value={newInjury.description}
                  onChangeText={(text) => setNewInjury(prev => ({ ...prev, description: text }))}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
                <TextInput
                  label="Treatment Plan"
                  value={newInjury.treatmentPlan}
                  onChangeText={(text) => setNewInjury(prev => ({ ...prev, treatmentPlan: text }))}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  style={styles.input}
                />
                <TextInput
                  label="Expected Recovery Date"
                  value={newInjury.expectedRecovery}
                  onChangeText={(text) => setNewInjury(prev => ({ ...prev, expectedRecovery: text }))}
                  mode="outlined"
                  placeholder="YYYY-MM-DD"
                  style={styles.input}
                />
              </ScrollView>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setShowAddModal(false)}>Cancel</Button>
              <Button
                mode="contained"
                onPress={handleAddInjury}
                style={{ backgroundColor: COLORS.primary }}
              >
                Log Injury
              </Button>
            </Card.Actions>
          </Card>
        </BlurView>
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
        <BlurView intensity={20} style={styles.modalBlur}>
          <Card style={styles.modalCard}>
            {selectedInjury && (
              <>
                <Card.Title
                  title={selectedInjury.type}
                  subtitle={selectedInjury.bodyPart}
                  titleStyle={TEXT_STYLES.h3}
                  left={(props) => (
                    <Avatar.Icon
                      {...props}
                      icon={getStatusIcon(selectedInjury.status)}
                      style={{ backgroundColor: getStatusColor(selectedInjury.status) }}
                    />
                  )}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="close"
                      onPress={() => setShowDetailModal(false)}
                    />
                  )}
                />
                <Card.Content>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.detailSection}>
                      <Text style={TEXT_STYLES.h3}>Details</Text>
                      <View style={styles.detailGrid}>
                        <View style={styles.detailItem}>
                          <Text style={TEXT_STYLES.bodySecondary}>Date</Text>
                          <Text style={TEXT_STYLES.body}>
                            {new Date(selectedInjury.date).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={TEXT_STYLES.bodySecondary}>Severity</Text>
                          <Chip
                            mode="outlined"
                            textStyle={{ color: getSeverityColor(selectedInjury.severity) }}
                            style={{ borderColor: getSeverityColor(selectedInjury.severity) }}
                          >
                            {selectedInjury.severity}
                          </Chip>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={TEXT_STYLES.bodySecondary}>Status</Text>
                          <Chip
                            mode="outlined"
                            textStyle={{ color: getStatusColor(selectedInjury.status) }}
                            style={{ borderColor: getStatusColor(selectedInjury.status) }}
                          >
                            {selectedInjury.status}
                          </Chip>
                        </View>
                      </View>
                    </View>

                    {selectedInjury.description && (
                      <View style={styles.detailSection}>
                        <Text style={TEXT_STYLES.h3}>Description</Text>
                        <Text style={TEXT_STYLES.body}>{selectedInjury.description}</Text>
                      </View>
                    )}

                    {selectedInjury.treatmentPlan && (
                      <View style={styles.detailSection}>
                        <Text style={TEXT_STYLES.h3}>Treatment Plan</Text>
                        <Text style={TEXT_STYLES.body}>{selectedInjury.treatmentPlan}</Text>
                      </View>
                    )}

                    {selectedInjury.notes && selectedInjury.notes.length > 0 && (
                      <View style={styles.detailSection}>
                        <Text style={TEXT_STYLES.h3}>Recovery Notes</Text>
                        {selectedInjury.notes.map((note, index) => (
                          <View key={index} style={styles.noteItem}>
                            <Icon name="note" size={16} color={COLORS.primary} />
                            <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>
                              {note}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </ScrollView>
                </Card.Content>
                <Card.Actions>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      Alert.alert('Feature Coming Soon', 'Update injury status functionality will be available in the next update! 🚧');
                    }}
                  >
                    Update Status
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      Alert.alert('Feature Coming Soon', 'Add recovery note functionality will be available in the next update! 📝');
                    }}
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    Add Note
                  </Button>
                </Card.Actions>
              </>
            )}
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const filteredInjuries = filterInjuries();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.surface }]}>Injury Log 🏥</Text>
          <Text style={[TEXT_STYLES.body, { color: COLORS.surface, opacity: 0.9 }]}>
            Track your health journey
          </Text>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
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
        {renderStats()}

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search injuries..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        {renderFilters()}

        <View style={styles.content}>
          {filteredInjuries.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="healing" size={64} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, textAlign: 'center' }]}>
                  {searchQuery || selectedFilter !== 'all' 
                    ? 'No injuries match your search' 
                    : 'No injuries logged yet'}
                </Text>
                <Text style={[TEXT_STYLES.bodySecondary, { textAlign: 'center', marginTop: SPACING.sm }]}>
                  {searchQuery || selectedFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Stay healthy and injury-free! 💪'}
                </Text>
                {!searchQuery && selectedFilter === 'all' && (
                  <Button
                    mode="contained"
                    onPress={() => setShowAddModal(true)}
                    style={[styles.emptyButton, { backgroundColor: COLORS.primary }]}
                  >
                    Log First Injury
                  </Button>
                )}
              </Card.Content>
            </Card>
          ) : (
            filteredInjuries.map(renderInjuryCard)
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        icon="add"
        onPress={() => setShowAddModal(true)}
        color={COLORS.surface}
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
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: 16,
    elevation: 2,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 12,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  content: {
    paddingHorizontal: SPACING.md,
  },
  injuryCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  recoveredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.success + '20',
    borderRadius: 8,
  },
  emptyCard: {
    borderRadius: 16,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyButton: {
    marginTop: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  modalCard: {
    maxHeight: '90%',
    borderRadius: 16,
  },
  input: {
    marginBottom: SPACING.md,
  },
  severityContainer: {
    marginBottom: SPACING.md,
  },
  severityButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  severityButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  detailSection: {
    marginBottom: SPACING.lg,
  },
  detailGrid: {
    marginTop: SPACING.sm,
  },
  detailItem: {
    marginBottom: SPACING.md,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default InjuryLog;