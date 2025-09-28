import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
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
  Searchbar,
  Portal,
  Modal,
  Text,
  Divider,
  List,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const ClientAttendance = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, clients, attendanceData, loading } = useSelector(state => ({
    user: state.auth.user,
    clients: state.trainer.clients || [],
    attendanceData: state.attendance.data || {},
    loading: state.attendance.loading,
  }));

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('all'); // all, present, absent, late
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('today'); // today, weekly, monthly
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
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
      }),
    ]).start();

    loadAttendanceData();
  }, [selectedDate, viewMode]);

  const loadAttendanceData = useCallback(async () => {
    try {
      // Simulate API call for loading attendance data
      // In real implementation, dispatch Redux action to fetch data
      console.log('Loading attendance data for:', selectedDate);
    } catch (error) {
      Alert.alert('Error', 'Failed to load attendance data');
    }
  }, [selectedDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAttendanceData();
    setRefreshing(false);
  }, [loadAttendanceData]);

  // Mock data for demonstration
  const mockClients = [
    {
      id: '1',
      name: 'John Doe',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      email: 'john@example.com',
      phone: '+1234567890',
      attendanceRate: 85,
      sessionsThisMonth: 12,
      totalSessions: 45,
      status: 'present',
      checkInTime: '09:15 AM',
      program: 'Weight Loss Program',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      email: 'sarah@example.com',
      phone: '+1234567891',
      attendanceRate: 92,
      sessionsThisMonth: 15,
      totalSessions: 38,
      status: 'present',
      checkInTime: '10:30 AM',
      program: 'Strength Training',
    },
    {
      id: '3',
      name: 'Mike Wilson',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      email: 'mike@example.com',
      phone: '+1234567892',
      attendanceRate: 76,
      sessionsThisMonth: 8,
      totalSessions: 22,
      status: 'absent',
      checkInTime: null,
      program: 'Cardio Fitness',
    },
    {
      id: '4',
      name: 'Emma Davis',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      email: 'emma@example.com',
      phone: '+1234567893',
      attendanceRate: 88,
      sessionsThisMonth: 11,
      totalSessions: 33,
      status: 'late',
      checkInTime: '09:45 AM',
      program: 'HIIT Training',
    },
  ];

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || client.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const attendanceStats = {
    total: mockClients.length,
    present: mockClients.filter(c => c.status === 'present').length,
    absent: mockClients.filter(c => c.status === 'absent').length,
    late: mockClients.filter(c => c.status === 'late').length,
    averageAttendance: Math.round(mockClients.reduce((acc, c) => acc + c.attendanceRate, 0) / mockClients.length),
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return COLORS.success;
      case 'absent': return COLORS.error;
      case 'late': return COLORS.warning;
      default: return COLORS.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return 'check-circle';
      case 'absent': return 'cancel';
      case 'late': return 'access-time';
      default: return 'help';
    }
  };

  const handleMarkAttendance = (client) => {
    setSelectedClient(client);
    setAttendanceStatus(client.status);
    setShowAttendanceModal(true);
  };

  const saveAttendance = () => {
    Alert.alert(
      'Attendance Updated',
      `${selectedClient.name}'s attendance has been marked as ${attendanceStatus}`,
      [{ text: 'OK', onPress: () => setShowAttendanceModal(false) }]
    );
  };

  const handleClientMessage = (client) => {
    Alert.alert(
      'Feature Coming Soon',
      'Direct messaging with clients will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const handleClientCall = (client) => {
    Alert.alert(
      'Call Client',
      `Call ${client.name} at ${client.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Calling:', client.phone) }
      ]
    );
  };

  const renderStatsCard = () => (
    <Card style={[styles.statsCard, { marginHorizontal: SPACING.md }]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.statsGradient}
      >
        <View style={styles.statsHeader}>
          <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
            Today's Attendance
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              {attendanceStats.present}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Present
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              {attendanceStats.late}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Late
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              {attendanceStats.absent}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Absent
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              {attendanceStats.averageAttendance}%
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Average
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={{ paddingHorizontal: SPACING.md }}
    >
      {[
        { key: 'all', label: 'All', count: attendanceStats.total },
        { key: 'present', label: 'Present', count: attendanceStats.present },
        { key: 'absent', label: 'Absent', count: attendanceStats.absent },
        { key: 'late', label: 'Late', count: attendanceStats.late },
      ].map((filter) => (
        <Chip
          key={filter.key}
          selected={filterType === filter.key}
          onPress={() => setFilterType(filter.key)}
          style={[
            styles.filterChip,
            filterType === filter.key && { backgroundColor: COLORS.primary }
          ]}
          textStyle={{
            color: filterType === filter.key ? 'white' : COLORS.text,
            fontWeight: filterType === filter.key ? 'bold' : 'normal'
          }}
        >
          {filter.label} ({filter.count})
        </Chip>
      ))}
    </ScrollView>
  );

  const renderClientCard = (client) => (
    <Card key={client.id} style={styles.clientCard}>
      <Card.Content>
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <Avatar.Image
              size={50}
              source={{ uri: client.avatar }}
              style={styles.avatar}
            />
            <View style={styles.clientDetails}>
              <Text style={TEXT_STYLES.h4}>{client.name}</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                {client.program}
              </Text>
              {client.checkInTime && (
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                  Check-in: {client.checkInTime}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            <Chip
              icon={getStatusIcon(client.status)}
              style={{
                backgroundColor: `${getStatusColor(client.status)}20`,
                borderColor: getStatusColor(client.status),
                borderWidth: 1,
              }}
              textStyle={{ color: getStatusColor(client.status), fontWeight: 'bold' }}
            >
              {client.status.toUpperCase()}
            </Chip>
          </View>
        </View>

        <View style={styles.attendanceInfo}>
          <View style={styles.attendanceItem}>
            <Text style={TEXT_STYLES.caption}>Attendance Rate</Text>
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={client.attendanceRate / 100}
                color={client.attendanceRate >= 80 ? COLORS.success : 
                       client.attendanceRate >= 60 ? COLORS.warning : COLORS.error}
                style={styles.progressBar}
              />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                {client.attendanceRate}%
              </Text>
            </View>
          </View>

          <View style={styles.sessionStats}>
            <View style={styles.sessionItem}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                This Month
              </Text>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                {client.sessionsThisMonth}
              </Text>
            </View>
            <View style={styles.sessionItem}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                Total Sessions
              </Text>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                {client.totalSessions}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => handleMarkAttendance(client)}
            style={styles.actionButton}
            icon="edit"
          >
            Mark Attendance
          </Button>
          
          <View style={styles.quickActions}>
            <IconButton
              icon="message"
              size={20}
              onPress={() => handleClientMessage(client)}
              style={[styles.quickActionBtn, { backgroundColor: COLORS.primary + '20' }]}
            />
            <IconButton
              icon="phone"
              size={20}
              onPress={() => handleClientCall(client)}
              style={[styles.quickActionBtn, { backgroundColor: COLORS.success + '20' }]}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAttendanceModal = () => (
    <Portal>
      <Modal
        visible={showAttendanceModal}
        onDismiss={() => setShowAttendanceModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <BlurView
          style={styles.blurContainer}
          blurType="light"
          blurAmount={10}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={TEXT_STYLES.h3}>Mark Attendance</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowAttendanceModal(false)}
                />
              </View>

              {selectedClient && (
                <View style={styles.clientModalInfo}>
                  <Avatar.Image
                    size={60}
                    source={{ uri: selectedClient.avatar }}
                  />
                  <View style={{ marginLeft: SPACING.md }}>
                    <Text style={TEXT_STYLES.h4}>{selectedClient.name}</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                      {selectedClient.program}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={[TEXT_STYLES.body, { marginVertical: SPACING.md }]}>
                Select attendance status:
              </Text>

              <View style={styles.statusOptions}>
                {['present', 'absent', 'late'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      attendanceStatus === status && {
                        backgroundColor: getStatusColor(status) + '20',
                        borderColor: getStatusColor(status),
                      }
                    ]}
                    onPress={() => setAttendanceStatus(status)}
                  >
                    <Icon
                      name={getStatusIcon(status)}
                      size={24}
                      color={getStatusColor(status)}
                    />
                    <Text
                      style={[
                        TEXT_STYLES.body,
                        { color: getStatusColor(status), textTransform: 'capitalize' }
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                mode="contained"
                onPress={saveAttendance}
                style={styles.saveButton}
              >
                Save Attendance
              </Button>
            </Card.Content>
          </Card>
        </BlurView>
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
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              size={24}
              iconColor="white"
              onPress={() => navigation.goBack()}
            />
            <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, textAlign: 'center' }]}>
              Client Attendance
            </Text>
            <IconButton
              icon="analytics"
              size={24}
              iconColor="white"
              onPress={() => setShowAnalytics(!showAnalytics)}
            />
          </View>
          
          <Searchbar
            placeholder="Search clients..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={{ color: COLORS.text }}
          />
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
          {renderStatsCard()}
          
          <View style={styles.filtersSection}>
            {renderFilterChips()}
          </View>

          <View style={styles.clientsList}>
            {filteredClients.length > 0 ? (
              filteredClients.map(renderClientCard)
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Icon name="people-outline" size={64} color={COLORS.secondary} />
                  <Text style={[TEXT_STYLES.h4, { color: COLORS.secondary, marginTop: SPACING.md }]}>
                    No clients found
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary, textAlign: 'center' }]}>
                    Try adjusting your search or filter criteria
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {renderAttendanceModal()}

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Feature Coming Soon',
            'Quick attendance marking for all clients will be available soon!',
            [{ text: 'OK' }]
          );
        }}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 4,
    borderRadius: 25,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  statsCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsHeader: {
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filtersSection: {
    marginBottom: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  clientsList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  clientCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  clientInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  clientDetails: {
    flex: 1,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  attendanceInfo: {
    marginBottom: SPACING.md,
  },
  attendanceItem: {
    marginBottom: SPACING.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  sessionItem: {
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginRight: SPACING.md,
  },
  quickActions: {
    flexDirection: 'row',
  },
  quickActionBtn: {
    marginLeft: SPACING.xs,
  },
  emptyCard: {
    marginTop: SPACING.xl,
    elevation: 2,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  clientModalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statusOption: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  saveButton: {
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
};

export default ClientAttendance;