import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  FAB,
  Avatar,
  Surface,
  Portal,
  Dialog,
  TextInput,
  Chip,
  ProgressBar,
  Badge,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f8f9fa',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const ClientCheckins = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { clientId } = route.params || {};
  
  // Redux state
  const user = useSelector(state => state.auth.user);
  const clients = useSelector(state => state.clients.list);
  const checkins = useSelector(state => state.checkins.data);
  
  // Local state
  const [selectedClient, setSelectedClient] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      setSelectedClient(client);
    }
  }, [clientId, clients]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filterOptions = [
    { label: 'All', value: 'all', icon: 'list' },
    { label: 'Weekly', value: 'weekly', icon: 'event' },
    { label: 'Photos', value: 'photos', icon: 'photo-camera' },
    { label: 'Measurements', value: 'measurements', icon: 'straighten' },
    { label: 'Missed', value: 'missed', icon: 'schedule' },
  ];

  const moodEmojis = {
    1: '😔', 2: '🙁', 3: '😐', 4: '😊', 5: '😄'
  };

  const energyEmojis = {
    1: '🔋', 2: '🔋🔋', 3: '🔋🔋🔋', 4: '🔋🔋🔋🔋', 5: '🔋🔋🔋🔋🔋'
  };

  // Mock data for check-ins
  const mockCheckins = [
    {
      id: '1',
      clientId: selectedClient?.id,
      date: '2024-03-30',
      type: 'weekly',
      status: 'completed',
      mood: 4,
      energy: 3,
      sleep: 7.5,
      weight: 72.5,
      photos: ['progress_front.jpg', 'progress_side.jpg'],
      notes: 'Feeling stronger this week! Increased weights on all exercises.',
      measurements: {
        chest: 102,
        waist: 82,
        hips: 95,
        arms: 35,
        thighs: 58,
      },
      completed: true,
    },
    {
      id: '2',
      clientId: selectedClient?.id,
      date: '2024-03-23',
      type: 'weekly',
      status: 'completed',
      mood: 3,
      energy: 4,
      sleep: 6.5,
      weight: 73.1,
      photos: ['progress_front_2.jpg'],
      notes: 'Good week overall. Had some stress at work but managed to stick to the program.',
      measurements: {
        chest: 101.5,
        waist: 83,
        hips: 95.5,
        arms: 34.5,
        thighs: 58.5,
      },
      completed: true,
    },
    {
      id: '3',
      clientId: selectedClient?.id,
      date: '2024-03-16',
      type: 'weekly',
      status: 'missed',
      mood: null,
      energy: null,
      sleep: null,
      weight: null,
      photos: [],
      notes: null,
      measurements: null,
      completed: false,
    },
  ];

  const handleCreateCheckin = () => {
    Alert.alert(
      'Create Check-in 📝',
      'This feature will allow you to create custom check-in templates and send them to clients.',
      [{ text: 'Got it!' }]
    );
  };

  const handleViewDetail = (checkin) => {
    setSelectedCheckin(checkin);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'missed': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'pending': return 'schedule';
      case 'missed': return 'cancel';
      default: return 'help';
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.clientInfo}>
          <Avatar.Text
            size={60}
            label={selectedClient?.name?.charAt(0) || 'C'}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            labelStyle={{ color: 'white' }}
          />
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>
              {selectedClient?.name || 'Select Client'}
            </Text>
            <Text style={styles.clientMeta}>
              Check-in Management 📋
            </Text>
          </View>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilter = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search check-ins..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filterOptions.map((option) => (
          <Chip
            key={option.value}
            mode={selectedFilter === option.value ? 'flat' : 'outlined'}
            selected={selectedFilter === option.value}
            onPress={() => setSelectedFilter(option.value)}
            style={[
              styles.filterChip,
              selectedFilter === option.value && styles.selectedChip,
            ]}
            textStyle={{
              color: selectedFilter === option.value ? 'white' : COLORS.primary,
            }}
            icon={option.icon}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickStats = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Quick Overview 📊</Text>
        <View style={styles.statsGrid}>
          <Surface style={styles.statCard}>
            <Icon name="trending-up" size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statDescription}>Completion Rate</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Icon name="mood" size={24} color={COLORS.warning} />
            <Text style={styles.statNumber}>4.2</Text>
            <Text style={styles.statDescription}>Avg Mood</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Icon name="flash-on" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>3.8</Text>
            <Text style={styles.statDescription}>Avg Energy</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Icon name="bedtime" size={24} color={COLORS.secondary} />
            <Text style={styles.statNumber}>7.2h</Text>
            <Text style={styles.statDescription}>Avg Sleep</Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCheckinItem = ({ item }) => (
    <Card style={styles.checkinCard}>
      <Card.Content>
        <View style={styles.checkinHeader}>
          <View style={styles.checkinDate}>
            <Text style={styles.dateText}>
              {new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </Text>
            <Text style={styles.dayText}>
              {new Date(item.date).toLocaleDateString('en-US', {
                weekday: 'short'
              })}
            </Text>
          </View>
          
          <View style={styles.checkinStatus}>
            <Badge
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) }
              ]}
            >
              {item.status.toUpperCase()}
            </Badge>
            <Icon
              name={getStatusIcon(item.status)}
              size={20}
              color={getStatusColor(item.status)}
            />
          </View>
        </View>

        {item.completed ? (
          <View style={styles.checkinContent}>
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Mood</Text>
                <Text style={styles.metricValue}>{moodEmojis[item.mood]}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Energy</Text>
                <Text style={styles.metricValue}>{energyEmojis[item.energy]}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Sleep</Text>
                <Text style={styles.metricValue}>{item.sleep}h</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Weight</Text>
                <Text style={styles.metricValue}>{item.weight}kg</Text>
              </View>
            </View>

            <View style={styles.checkinTags}>
              {item.photos?.length > 0 && (
                <Chip
                  mode="outlined"
                  compact
                  icon="photo-camera"
                  style={styles.tag}
                  textStyle={{ fontSize: 12 }}
                >
                  {item.photos.length} Photos
                </Chip>
              )}
              {item.measurements && (
                <Chip
                  mode="outlined"
                  compact
                  icon="straighten"
                  style={styles.tag}
                  textStyle={{ fontSize: 12 }}
                >
                  Measurements
                </Chip>
              )}
              {item.notes && (
                <Chip
                  mode="outlined"
                  compact
                  icon="note"
                  style={styles.tag}
                  textStyle={{ fontSize: 12 }}
                >
                  Notes
                </Chip>
              )}
            </View>

            {item.notes && (
              <Text style={styles.checkinNotes} numberOfLines={2}>
                "{item.notes}"
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.missedCheckin}>
            <Icon name="event-busy" size={24} color={COLORS.textSecondary} />
            <Text style={styles.missedText}>Check-in was missed</Text>
          </View>
        )}

        <View style={styles.checkinActions}>
          <Button
            mode="outlined"
            onPress={() => handleViewDetail(item)}
            compact
            style={styles.actionButton}
          >
            View Details
          </Button>
          {!item.completed && (
            <Button
              mode="contained"
              onPress={() => Alert.alert('Send Reminder', 'Reminder sent to client!')}
              compact
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              labelStyle={{ color: 'white' }}
            >
              Send Reminder
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderDetailModal = () => (
    <Portal>
      <Dialog
        visible={showDetailModal}
        onDismiss={() => setShowDetailModal(false)}
        style={styles.detailDialog}
      >
        <Dialog.Title>
          Check-in Details 📋
          <Text style={styles.detailDate}>
            {selectedCheckin && new Date(selectedCheckin.date).toLocaleDateString()}
          </Text>
        </Dialog.Title>
        <Dialog.ScrollArea style={styles.dialogScrollArea}>
          <ScrollView>
            {selectedCheckin && selectedCheckin.completed && (
              <View style={styles.detailContent}>
                <Text style={styles.detailSectionTitle}>Wellness Metrics</Text>
                <View style={styles.detailMetrics}>
                  <View style={styles.detailMetric}>
                    <Icon name="mood" size={20} color={COLORS.primary} />
                    <Text style={styles.detailMetricLabel}>Mood</Text>
                    <Text style={styles.detailMetricValue}>
                      {moodEmojis[selectedCheckin.mood]} ({selectedCheckin.mood}/5)
                    </Text>
                  </View>
                  <View style={styles.detailMetric}>
                    <Icon name="flash-on" size={20} color={COLORS.warning} />
                    <Text style={styles.detailMetricLabel}>Energy</Text>
                    <Text style={styles.detailMetricValue}>
                      {energyEmojis[selectedCheckin.energy]} ({selectedCheckin.energy}/5)
                    </Text>
                  </View>
                  <View style={styles.detailMetric}>
                    <Icon name="bedtime" size={20} color={COLORS.secondary} />
                    <Text style={styles.detailMetricLabel}>Sleep</Text>
                    <Text style={styles.detailMetricValue}>{selectedCheckin.sleep} hours</Text>
                  </View>
                  <View style={styles.detailMetric}>
                    <Icon name="monitor-weight" size={20} color={COLORS.success} />
                    <Text style={styles.detailMetricLabel}>Weight</Text>
                    <Text style={styles.detailMetricValue}>{selectedCheckin.weight} kg</Text>
                  </View>
                </View>

                {selectedCheckin.measurements && (
                  <>
                    <Text style={styles.detailSectionTitle}>Body Measurements</Text>
                    <View style={styles.measurementGrid}>
                      {Object.entries(selectedCheckin.measurements).map(([key, value]) => (
                        <View key={key} style={styles.measurementItem}>
                          <Text style={styles.measurementLabel}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Text>
                          <Text style={styles.measurementValue}>{value} cm</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {selectedCheckin.photos?.length > 0 && (
                  <>
                    <Text style={styles.detailSectionTitle}>Progress Photos</Text>
                    <View style={styles.photosContainer}>
                      {selectedCheckin.photos.map((photo, index) => (
                        <View key={index} style={styles.photoPlaceholder}>
                          <Icon name="photo" size={30} color={COLORS.textSecondary} />
                          <Text style={styles.photoLabel}>{photo}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {selectedCheckin.notes && (
                  <>
                    <Text style={styles.detailSectionTitle}>Client Notes</Text>
                    <Text style={styles.detailNotes}>{selectedCheckin.notes}</Text>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={() => setShowDetailModal(false)}>Close</Button>
          <Button
            mode="contained"
            onPress={() => {
              setShowDetailModal(false);
              Alert.alert('Export', 'Check-in data exported successfully!');
            }}
            style={{ backgroundColor: COLORS.primary }}
          >
            Export
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="event-note" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Check-ins Yet</Text>
      <Text style={styles.emptyText}>
        Create your first check-in template to start tracking client progress
      </Text>
      <Button
        mode="contained"
        onPress={handleCreateCheckin}
        style={styles.emptyButton}
        icon="add"
      >
        Create Check-in
      </Button>
    </View>
  );

  if (!selectedClient) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="person-search" size={80} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>Select a Client</Text>
        <Text style={styles.emptyText}>
          Choose a client to view their check-in history
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}
      
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
        {renderSearchAndFilter()}
        {renderQuickStats()}
        
        <Text style={styles.listTitle}>Recent Check-ins 📋</Text>
        
        {mockCheckins.length > 0 ? (
          <FlatList
            data={mockCheckins}
            renderItem={renderCheckinItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.checkinsList}
          />
        ) : (
          renderEmptyState()
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleCreateCheckin}
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
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  clientName: {
    ...TEXT_STYLES.title,
    color: 'white',
    fontSize: 20,
  },
  clientMeta: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  headerStats: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  statValue: {
    ...TEXT_STYLES.title,
    color: 'white',
    fontSize: 18,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchContainer: {
    marginVertical: SPACING.md,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: SPACING.sm,
    borderColor: COLORS.primary,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  statsCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 1,
  },
  statNumber: {
    ...TEXT_STYLES.title,
    fontSize: 18,
    marginVertical: SPACING.xs,
  },
  statDescription: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  listTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
  },
  checkinsList: {
    paddingBottom: SPACING.md,
  },
  checkinCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  checkinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkinDate: {
    alignItems: 'center',
  },
  dateText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  dayText: {
    ...TEXT_STYLES.caption,
  },
  checkinStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    marginRight: SPACING.sm,
  },
  checkinContent: {
    marginBottom: SPACING.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  metricValue: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  checkinTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  tag: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  checkinNotes: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  missedCheckin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  missedText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  checkinActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  detailDialog: {
    maxHeight: '80%',
  },
  detailDate: {
    ...TEXT_STYLES.caption,
    fontWeight: 'normal',
  },
  dialogScrollArea: {
    maxHeight: 400,
  },
  detailContent: {
    padding: SPACING.sm,
  },
  detailSectionTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  detailMetrics: {
    marginBottom: SPACING.md,
  },
  detailMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailMetricLabel: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  detailMetricValue: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  measurementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  measurementItem: {
    width: '48%',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  measurementLabel: {
    ...TEXT_STYLES.caption,
  },
  measurementValue: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  photoLabel: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    textAlign: 'center',
  },
  detailNotes: {
    ...TEXT_STYLES.body,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.title,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ClientCheckins;