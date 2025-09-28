import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
  Platform,
  StyleSheet,
  FlatList,
  SafeAreaView,
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
  Modal,
  ActivityIndicator,
  Snackbar,
  Menu,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AttendanceTrackingScreen = ({ navigation, route }) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [sessionsData, setSessionsData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());
  const [attendanceStats, setAttendanceStats] = useState({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Redux
  const dispatch = useDispatch();
  const { 
    user, 
    teams, 
    players, 
    isOffline, 
    notifications 
  } = useSelector(state => ({
    user: state.auth.user,
    teams: state.teams.teams || [],
    players: state.players.players || [],
    isOffline: state.network.isOffline || false,
    notifications: state.notifications.unread || 0,
  }));

  // Initialize component
  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate, filterStatus]);

  const initializeScreen = useCallback(() => {
    // Entrance animations
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
  }, []);

  // Data Management
  const loadAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check offline data first
      const cachedData = await AsyncStorage.getItem(`attendance_${selectedDate}`);
      if (cachedData && isOffline) {
        const parsed = JSON.parse(cachedData);
        setAttendanceData(parsed.attendance);
        setSessionsData(parsed.sessions);
        setAttendanceStats(parsed.stats);
        setLoading(false);
        return;
      }

      // Simulate API call with better mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAttendanceData = [
        {
          id: '1',
          playerId: 'p1',
          playerName: 'Alex Johnson',
          avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=667eea&color=fff',
          sessionId: 's1',
          date: selectedDate,
          status: 'present',
          arrivalTime: '09:00',
          departureTime: '11:00',
          notes: 'Excellent performance today! 🌟',
          streak: 5,
          weeklyAttendance: 85,
          position: 'Forward',
          points: 120,
          badges: ['punctual', 'consistent'],
        },
        {
          id: '2',
          playerId: 'p2',
          playerName: 'Sarah Smith',
          avatar: 'https://ui-avatars.com/api/?name=Sarah+Smith&background=764ba2&color=fff',
          sessionId: 's1',
          date: selectedDate,
          status: 'late',
          arrivalTime: '09:15',
          departureTime: '11:00',
          notes: 'Traffic delay - informed coach beforehand ⏰',
          streak: 2,
          weeklyAttendance: 78,
          position: 'Midfielder',
          points: 95,
          badges: ['team-player'],
        },
        {
          id: '3',
          playerId: 'p3',
          playerName: 'Mike Wilson',
          avatar: 'https://ui-avatars.com/api/?name=Mike+Wilson&background=4ade80&color=fff',
          sessionId: 's1',
          date: selectedDate,
          status: 'absent',
          arrivalTime: null,
          departureTime: null,
          notes: 'Family emergency - excused absence 👨‍👩‍👧‍👦',
          streak: 0,
          weeklyAttendance: 62,
          position: 'Defender',
          points: 45,
          badges: [],
        },
        {
          id: '4',
          playerId: 'p4',
          playerName: 'Emma Davis',
          avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=f59e0b&color=fff',
          sessionId: 's1',
          date: selectedDate,
          status: 'present',
          arrivalTime: '08:55',
          departureTime: '11:00',
          notes: 'Early arrival, great attitude! 💪',
          streak: 8,
          weeklyAttendance: 92,
          position: 'Goalkeeper',
          points: 150,
          badges: ['early-bird', 'dedicated', 'mvp'],
        },
      ];

      const mockSessionsData = [
        {
          id: 's1',
          name: 'Morning Training',
          time: '09:00 - 11:00',
          location: 'Main Field',
          coach: 'Coach Martinez',
          participants: 15,
          present: 12,
          late: 2,
          absent: 1,
          type: 'Practice',
          difficulty: 'Intermediate',
        },
        {
          id: 's2',
          name: 'Afternoon Conditioning',
          time: '15:00 - 17:00',
          location: 'Indoor Court',
          coach: 'Coach Thompson',
          participants: 20,
          present: 18,
          late: 1,
          absent: 1,
          type: 'Fitness',
          difficulty: 'Advanced',
        },
      ];

      const mockStats = {
        totalSessions: 24,
        averageAttendance: 87,
        currentStreak: 5,
        topAttender: 'Emma Davis',
        improvementNeeded: ['Mike Wilson'],
        weeklyProgress: 12,
        monthlyGoal: 90,
        teamRanking: 3,
      };

      // Cache data for offline use
      await AsyncStorage.setItem(`attendance_${selectedDate}`, JSON.stringify({
        attendance: mockAttendanceData,
        sessions: mockSessionsData,
        stats: mockStats,
      }));

      setAttendanceData(mockAttendanceData);
      setSessionsData(mockSessionsData);
      setAttendanceStats(mockStats);

    } catch (error) {
      console.error('Error loading attendance data:', error);
      showSnackbar('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, isOffline]);

  // Event Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAttendanceData();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadAttendanceData]);

  const handleAttendanceChange = useCallback((playerId, newStatus) => {
    Vibration.vibrate(75);
    
    setAttendanceData(prev => 
      prev.map(record => 
        record.playerId === playerId 
          ? { 
              ...record, 
              status: newStatus,
              arrivalTime: newStatus === 'present' ? new Date().toLocaleTimeString('en', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : null
            }
          : record
      )
    );

    // Update points based on attendance
    const pointsMap = { present: 10, late: 5, absent: 0 };
    const player = attendanceData.find(r => r.playerId === playerId);
    if (player) {
      showSnackbar(`${player.playerName} marked as ${newStatus}! +${pointsMap[newStatus]} points`);
    }
  }, [attendanceData]);

  const handleBulkMarkAttendance = useCallback((status) => {
    if (selectedPlayers.size === 0) {
      Alert.alert('No Players Selected 📋', 'Please select players first');
      return;
    }

    Alert.alert(
      'Confirm Bulk Action 🚀',
      `Mark ${selectedPlayers.size} players as ${status}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            selectedPlayers.forEach(playerId => {
              handleAttendanceChange(playerId, status);
            });
            setSelectedPlayers(new Set());
            setBulkActionMode(false);
            Vibration.vibrate(100);
            showSnackbar(`Bulk action completed for ${selectedPlayers.size} players! 🎉`);
          },
        },
      ]
    );
  }, [selectedPlayers, handleAttendanceChange]);

  const togglePlayerSelection = useCallback((playerId) => {
    const newSelection = new Set(selectedPlayers);
    if (newSelection.has(playerId)) {
      newSelection.delete(playerId);
    } else {
      newSelection.add(playerId);
    }
    setSelectedPlayers(newSelection);
    Vibration.vibrate(25);
  }, [selectedPlayers]);

  const showSnackbar = useCallback((message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  // Utility Functions
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'present': return COLORS.success;
      case 'late': return COLORS.warning;
      case 'absent': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'present': return 'check-circle';
      case 'late': return 'schedule';
      case 'absent': return 'cancel';
      default: return 'help';
    }
  }, []);

  const getBadgeIcon = useCallback((badge) => {
    switch (badge) {
      case 'punctual': return '⏰';
      case 'consistent': return '🎯';
      case 'team-player': return '🤝';
      case 'early-bird': return '🌅';
      case 'dedicated': return '💪';
      case 'mvp': return '🏆';
      default: return '⭐';
    }
  }, []);

  // Filter attendance data
  const filteredAttendance = attendanceData.filter(record => {
    const matchesSearch = record.playerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Render Components
  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <SafeAreaView>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header Controls */}
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerTitleContainer}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
                📊 Attendance Hub
              </Text>
              {isOffline && (
                <Chip
                  mode="outlined"
                  textStyle={{ color: 'white', fontSize: 10 }}
                  style={styles.offlineChip}
                >
                  📡 Offline
                </Chip>
              )}
            </View>
            <View style={styles.headerActions}>
              <IconButton
                icon={bulkActionMode ? 'close' : 'checklist'}
                iconColor="white"
                size={24}
                onPress={() => setBulkActionMode(!bulkActionMode)}
              />
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="filter-list"
                    iconColor="white"
                    size={24}
                    onPress={() => setMenuVisible(true)}
                  />
                }
              >
                <Menu.Item
                  onPress={() => { setFilterStatus('all'); setMenuVisible(false); }}
                  title="All Status"
                  leadingIcon="view-list"
                />
                <Menu.Item
                  onPress={() => { setFilterStatus('present'); setMenuVisible(false); }}
                  title="Present Only"
                  leadingIcon="check-circle"
                />
                <Menu.Item
                  onPress={() => { setFilterStatus('late'); setMenuVisible(false); }}
                  title="Late Only"
                  leadingIcon="schedule"
                />
                <Menu.Item
                  onPress={() => { setFilterStatus('absent'); setMenuVisible(false); }}
                  title="Absent Only"
                  leadingIcon="cancel"
                />
              </Menu>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                {attendanceStats.averageAttendance || 0}%
              </Text>
              <Text style={styles.statLabel}>
                Avg Attendance
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                {attendanceStats.currentStreak || 0}
              </Text>
              <Text style={styles.statLabel}>
                Day Streak
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                {filteredAttendance.filter(r => r.status === 'present').length}
              </Text>
              <Text style={styles.statLabel}>
                Present Today
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                #{attendanceStats.teamRanking || 0}
              </Text>
              <Text style={styles.statLabel}>
                Team Rank
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <Searchbar
            placeholder="Search players by name or position..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderDateSelector = () => (
    <Card style={styles.dateCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
          📅 Select Session Date
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[-3, -2, -1, 0, 1, 2, 3].map(offset => {
            const date = new Date();
            date.setDate(date.getDate() + offset);
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;
            const isToday = offset === 0;
            
            return (
              <TouchableOpacity
                key={dateStr}
                onPress={() => setSelectedDate(dateStr)}
                style={[
                  styles.dateItem,
                  isSelected && styles.selectedDateItem,
                ]}
              >
                <Text style={[
                  styles.dateText,
                  isSelected && styles.selectedDateText,
                ]}>
                  {isToday ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' })}
                </Text>
                <Text style={[
                  styles.dayText,
                  isSelected && styles.selectedDayText,
                ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderAttendanceItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.attendanceItemContainer,
        {
          opacity: fadeAnim,
          transform: [{
            translateX: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}
    >
      <Surface style={[styles.attendanceItem, { borderLeftColor: getStatusColor(item.status) }]}>
        <TouchableOpacity
          onPress={() => bulkActionMode && togglePlayerSelection(item.playerId)}
          style={styles.attendanceItemContent}
        >
          <View style={styles.attendanceItemHeader}>
            {bulkActionMode && (
              <MaterialIcons
                name={selectedPlayers.has(item.playerId) ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={selectedPlayers.has(item.playerId) ? COLORS.primary : COLORS.textSecondary}
                style={{ marginRight: SPACING.sm }}
              />
            )}
            
            <Avatar.Image
              size={50}
              source={{ uri: item.avatar }}
              style={{ marginRight: SPACING.md }}
            />
            
            <View style={styles.playerInfo}>
              <View style={styles.playerNameRow}>
                <Text style={TEXT_STYLES.body}>{item.playerName}</Text>
                <View style={styles.playerBadges}>
                  {item.badges.slice(0, 2).map(badge => (
                    <Text key={badge} style={styles.badgeEmoji}>
                      {getBadgeIcon(badge)}
                    </Text>
                  ))}
                </View>
              </View>
              
              <View style={styles.playerMeta}>
                <Text style={[TEXT_STYLES.caption, { marginRight: SPACING.md }]}>
                  {item.position} • {item.points} pts
                </Text>
                <View style={styles.statusContainer}>
                  <MaterialIcons
                    name={getStatusIcon(item.status)}
                    size={16}
                    color={getStatusColor(item.status)}
                    style={{ marginRight: SPACING.xs }}
                  />
                  <Text style={[TEXT_STYLES.caption, { color: getStatusColor(item.status) }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              {item.arrivalTime && (
                <Text style={[TEXT_STYLES.small, { marginTop: SPACING.xs }]}>
                  🕐 {item.arrivalTime} {item.departureTime && `- ${item.departureTime}`}
                </Text>
              )}
              
              {item.streak > 0 && (
                <View style={styles.streakContainer}>
                  <Text style={styles.streakText}>
                    🔥 {item.streak} day streak
                  </Text>
                </View>
              )}
              
              {item.notes && (
                <Text style={styles.notesText}>
                  💬 {item.notes}
                </Text>
              )}
            </View>
          </View>
          
          {!bulkActionMode && (
            <View style={styles.actionButtons}>
              <IconButton
                icon="check-circle"
                iconColor={item.status === 'present' ? COLORS.success : COLORS.textSecondary}
                size={20}
                onPress={() => handleAttendanceChange(item.playerId, 'present')}
                style={styles.actionButton}
              />
              <IconButton
                icon="schedule"
                iconColor={item.status === 'late' ? COLORS.warning : COLORS.textSecondary}
                size={20}
                onPress={() => handleAttendanceChange(item.playerId, 'late')}
                style={styles.actionButton}
              />
              <IconButton
                icon="cancel"
                iconColor={item.status === 'absent' ? COLORS.error : COLORS.textSecondary}
                size={20}
                onPress={() => handleAttendanceChange(item.playerId, 'absent')}
                style={styles.actionButton}
              />
            </View>
          )}
        </TouchableOpacity>
      </Surface>
    </Animated.View>
  );

  const renderSessionOverview = () => (
    <Card style={styles.sessionCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          🏃‍♂️ Today's Sessions
        </Text>
        {sessionsData.map(session => (
          <Surface key={session.id} style={styles.sessionItem}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <Text style={TEXT_STYLES.body}>{session.name}</Text>
                <Text style={TEXT_STYLES.caption}>
                  {session.time} • {session.location}
                </Text>
                <Text style={[TEXT_STYLES.small, { marginTop: SPACING.xs }]}>
                  👨‍🏫 {session.coach} • {session.difficulty}
                </Text>
              </View>
              <View style={styles.sessionStats}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                  {Math.round((session.present / session.participants) * 100)}%
                </Text>
                <ProgressBar
                  progress={session.present / session.participants}
                  color={COLORS.success}
                  style={styles.sessionProgress}
                />
              </View>
            </View>
            
            <View style={styles.sessionChips}>
              <Chip mode="outlined" style={styles.sessionChip} textStyle={styles.chipText}>
                ✅ {session.present} Present
              </Chip>
              <Chip mode="outlined" style={styles.sessionChip} textStyle={styles.chipText}>
                ⏰ {session.late} Late
              </Chip>
              <Chip mode="outlined" style={styles.sessionChip} textStyle={styles.chipText}>
                ❌ {session.absent} Absent
              </Chip>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderBulkActionModal = () => (
    <Portal>
      <Modal
        visible={bulkActionMode && selectedPlayers.size > 0}
        onDismiss={() => setBulkActionMode(false)}
        contentContainerStyle={styles.modalContent}
      >
        <BlurView style={styles.modalBlur} blurType="light">
          <Text style={styles.modalTitle}>
            🚀 Bulk Actions ({selectedPlayers.size} players)
          </Text>
          <Text style={styles.modalSubtitle}>
            Select an action to apply to all selected players
          </Text>
          <View style={styles.bulkActionButtons}>
            <Button
              mode="contained"
              buttonColor={COLORS.success}
              onPress={() => handleBulkMarkAttendance('present')}
              style={styles.bulkButton}
              icon="check-circle"
            >
              Present
            </Button>
            <Button
              mode="contained"
              buttonColor={COLORS.warning}
              onPress={() => handleBulkMarkAttendance('late')}
              style={styles.bulkButton}
              icon="schedule"
            >
              Late
            </Button>
            <Button
              mode="contained"
              buttonColor={COLORS.error}
              onPress={() => handleBulkMarkAttendance('absent')}
              style={styles.bulkButton}
              icon="cancel"
            >
              Absent
            </Button>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderFloatingActions = () => (
    <>
      <FAB
        icon="analytics"
        style={[styles.fab, { bottom: 100, backgroundColor: COLORS.accent }]}
        onPress={() => {
          Alert.alert(
            'Analytics Dashboard 📊',
            'View detailed attendance analytics, trends, and performance insights. Export reports and track progress over time.',
            [{ text: 'Coming Soon! 🚀', style: 'default' }]
          );
        }}
      />
      <FAB
        icon="notifications"
        style={[styles.fab, { bottom: 160, backgroundColor: COLORS.info }]}
        onPress={() => {
          Alert.alert(
            'Smart Notifications 📱',
            'Send automated attendance updates to parents and players. Customize notification preferences and schedules.',
            [{ text: 'Feature Preview 👀', style: 'default' }]
          );
        }}
      />
      <FAB
        icon="share"
        style={[styles.fab, { bottom: SPACING.md, backgroundColor: COLORS.secondary }]}
        onPress={() => {
          Alert.alert(
            'Share Attendance Report 📤',
            'Generate and share attendance summaries with team members, parents, or coaching staff.',
            [{ text: 'Export Options 📋', style: 'default' }]
          );
        }}
      />
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[TEXT_STYLES.body, { marginTop: SPACING.md, textAlign: 'center' }]}>
          Loading attendance data...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      <FlatList
        data={[
          { type: 'date-selector', id: 'date' },
          { type: 'session-overview', id: 'sessions' },
          { type: 'attendance-header', id: 'header' },
          ...filteredAttendance.map(item => ({ ...item, type: 'attendance' })),
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'date-selector':
              return renderDateSelector();
            case 'session-overview':
              return renderSessionOverview();
            case 'attendance-header':
              return (
                <View style={styles.attendanceHeader}>
                  <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>
                    👥 Player Attendance ({filteredAttendance.length})
                  </Text>
                  {bulkActionMode && (
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                      {selectedPlayers.size} selected
                    </Text>
                  )}
                </View>
              );
            case 'attendance':
              return renderAttendanceItem({ item });
            default:
              return null;
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={() => <View style={{ height: 200 }} />}
      />

      {renderBulkActionModal()}
      {renderFloatingActions()}
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
  },
  offlineChip: {
    marginTop: SPACING.xs,
    borderColor: 'rgba(255,255,255,0.5)',
    alignSelf: 'flex-start',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    elevation: 0,
    borderRadius: 25,
  },
  dateCard: {
    margin: SPACING.md,
    elevation: 4,
    borderRadius: 16,
  },
  dateItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    minWidth: 70,
  },
  selectedDateItem: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  selectedDateText: {
    color: 'white',
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  selectedDayText: {
    color: 'white',
  },
  sessionCard: {
    margin: SPACING.md,
    elevation: 4,
    borderRadius: 16,
  },
  sessionItem: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  sessionInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  sessionStats: {
    alignItems: 'center',
    minWidth: 80,
  },
  sessionProgress: {
    width: 60,
    marginTop: SPACING.xs,
    borderRadius: 4,
  },
  sessionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  sessionChip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  attendanceItemContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  attendanceItem: {
    borderRadius: 16,
    elevation: 2,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  attendanceItemContent: {
    padding: SPACING.md,
  },
  attendanceItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  playerInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  playerBadges: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.success,
    borderRadius: 12,
    marginTop: SPACING.xs,
  },
  streakText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    marginLeft: SPACING.xs,
  },
  modalContent: {
    backgroundColor: 'transparent',
    margin: SPACING.lg,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalBlur: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  bulkActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: SPACING.sm,
  },
  bulkButton: {
    flex: 1,
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    borderRadius: 16,
  },
  snackbar: {
    backgroundColor: COLORS.success,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
});

export default AttendanceTrackingScreen;