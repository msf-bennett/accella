import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  FAB, 
  Searchbar, 
  Surface, 
  Avatar, 
  Badge,
  Menu,
  IconButton,
  Dialog,
  Portal,
  ProgressBar
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';
import SessionService from '../../services/SessionService';
import { formatDate, formatTime, getTimeUntil } from '../../utils/dateUtils';

const SessionDetails = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'upcoming', 'completed', 'scheduled'
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar'

  const filterOptions = [
    { value: 'all', label: 'All Sessions', icon: 'view-list' },
    { value: 'upcoming', label: 'Upcoming', icon: 'clock' },
    { value: 'completed', label: 'Completed', icon: 'check-circle' },
    { value: 'scheduled', label: 'Scheduled', icon: 'calendar' },
    { value: 'in-progress', label: 'In Progress', icon: 'play-circle' },
  ];

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, selectedFilter]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      
      // Try to load from local storage first
      const cachedSessions = await AsyncStorage.getItem('cached_sessions');
      if (cachedSessions) {
        setSessions(JSON.parse(cachedSessions));
      }

      // Fetch latest from server
      const response = await SessionService.getUserSessions(user.id);
      setSessions(response.data);
      
      // Cache the sessions
      await AsyncStorage.setItem('cached_sessions', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error loading sessions:', error);
      Alert.alert('Error', 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const filterSessions = () => {
    let filtered = sessions;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.coach?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'upcoming':
        filtered = filtered.filter(session => 
          session.status === 'scheduled' && new Date(session.scheduledDate) > new Date()
        );
        break;
      case 'completed':
        filtered = filtered.filter(session => session.status === 'completed');
        break;
      case 'scheduled':
        filtered = filtered.filter(session => session.status === 'scheduled');
        break;
      case 'in-progress':
        filtered = filtered.filter(session => session.status === 'in-progress');
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Sort by date (upcoming first, then by scheduled date)
    filtered.sort((a, b) => {
      if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
      if (b.status === 'in-progress' && a.status !== 'in-progress') return 1;
      
      const dateA = new Date(a.scheduledDate);
      const dateB = new Date(b.scheduledDate);
      const now = new Date();
      
      // Upcoming sessions first
      if (dateA >= now && dateB >= now) {
        return dateA - dateB;
      }
      // Then past sessions (most recent first)
      if (dateA < now && dateB < now) {
        return dateB - dateA;
      }
      // Mixed: upcoming before past
      return dateA >= now ? -1 : 1;
    });

    setFilteredSessions(filtered);
  };

  const handleSessionPress = (session) => {
    if (session.status === 'in-progress') {
      navigation.navigate('ActiveSession', { sessionId: session.id });
    } else if (session.status === 'completed') {
      navigation.navigate('SessionSummary', { sessionId: session.id });
    } else {
      navigation.navigate('SessionDetails', { sessionId: session.id });
    }
  };

  const handleStartSession = async (sessionId) => {
    try {
      await SessionService.startSession(sessionId);
      await loadSessions();
      navigation.navigate('ActiveSession', { sessionId });
    } catch (error) {
      Alert.alert('Error', 'Failed to start session');
    }
  };

  const handleCancelSession = async () => {
    if (!sessionToCancel) return;

    try {
      await SessionService.cancelSession(sessionToCancel.id);
      await loadSessions();
      setShowCancelDialog(false);
      setSessionToCancel(null);
      Alert.alert('Success', 'Session cancelled successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel session');
    }
  };

  const getSessionStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'in-progress': return COLORS.warning;
      case 'scheduled': return COLORS.primary;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getSessionStatusText = (session) => {
    switch (session.status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'scheduled': 
        const now = new Date();
        const sessionDate = new Date(session.scheduledDate);
        if (sessionDate < now) return 'Overdue';
        return getTimeUntil(sessionDate);
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const renderSessionCard = ({ item: session }) => (
    <Card style={styles.sessionCard} onPress={() => handleSessionPress(session)}>
      <Card.Content>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <Text style={styles.sessionType}>{session.type}</Text>
          </View>
          <View style={styles.sessionStatus}>
            <Chip 
              mode="outlined" 
              textStyle={{ color: getSessionStatusColor(session.status) }}
              style={{ borderColor: getSessionStatusColor(session.status) }}>
              {getSessionStatusText(session)}
            </Chip>
          </View>
        </View>

        <View style={styles.sessionDetails}>
          <View style={styles.sessionMeta}>
            <Text style={styles.sessionDate}>
              {formatDate(session.scheduledDate)} at {formatTime(session.scheduledDate)}
            </Text>
            <Text style={styles.sessionDuration}>
              Duration: {session.plannedDuration || session.actualDuration || 'Not set'}
            </Text>
          </View>

          {session.coach && (
            <View style={styles.coachInfo}>
              <Avatar.Text 
                size={32} 
                label={session.coach.name.charAt(0)} 
                style={styles.coachAvatar}
              />
              <Text style={styles.coachName}>Coach: {session.coach.name}</Text>
            </View>
          )}
        </View>

        {session.progress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Progress</Text>
              <Text style={styles.progressPercentage}>
                {Math.round(session.progress.percentage)}%
              </Text>
            </View>
            <ProgressBar 
              progress={session.progress.percentage / 100} 
              color={COLORS.primary}
              style={styles.progressBar}
            />
          </View>
        )}

        <View style={styles.sessionActions}>
          {session.status === 'scheduled' && new Date(session.scheduledDate) <= new Date() && (
            <Button 
              mode="contained" 
              onPress={() => handleStartSession(session.id)}
              style={styles.actionButton}>
              Start Session
            </Button>
          )}
          
          {session.status === 'in-progress' && (
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('ActiveSession', { sessionId: session.id })}
              style={styles.actionButton}>
              Continue
            </Button>
          )}

          {session.status === 'completed' && (
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('SessionSummary', { sessionId: session.id })}
              style={styles.actionButton}>
              View Summary
            </Button>
          )}

          {session.status === 'scheduled' && (
            <Button 
              mode="text" 
              onPress={() => {
                setSessionToCancel(session);
                setShowCancelDialog(true);
              }}
              textColor={COLORS.error}
              style={styles.cancelButton}>
              Cancel
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Avatar.Icon size={80} icon="calendar-blank" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No sessions found</Text>
      <Text style={styles.emptyText}>
        {selectedFilter === 'all' 
          ? "You don't have any sessions yet. Create your first session!"
          : `No ${selectedFilter} sessions found. Try adjusting your filters.`}
      </Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('CreateSession')}
        style={styles.createButton}>
        Create Session
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search and Filter Header */}
      <Surface style={styles.headerSurface}>
        <Searchbar
          placeholder="Search sessions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filterRow}>
          <Menu
            visible={showFilterMenu}
            onDismiss={() => setShowFilterMenu(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setShowFilterMenu(true)}
                icon="filter"
                style={styles.filterButton}>
                {filterOptions.find(f => f.value === selectedFilter)?.label}
              </Button>
            }>
            {filterOptions.map(option => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  setSelectedFilter(option.value);
                  setShowFilterMenu(false);
                }}
                title={option.label}
                leadingIcon={option.icon}
                titleStyle={selectedFilter === option.value ? { color: COLORS.primary } : {}}
              />
            ))}
          </Menu>

          <IconButton
            icon={viewMode === 'list' ? 'calendar' : 'view-list'}
            onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            style={styles.viewToggle}
          />
        </View>
      </Surface>

      {/* Sessions List */}
      <FlatList
        data={filteredSessions}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateSession')}
        label="New Session"
      />

      {/* Cancel Session Dialog */}
      <Portal>
        <Dialog visible={showCancelDialog} onDismiss={() => setShowCancelDialog(false)}>
          <Dialog.Title>Cancel Session</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to cancel "{sessionToCancel?.title}"? 
              {'\n\n'}This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCancelDialog(false)}>Keep Session</Button>
            <Button 
              onPress={handleCancelSession}
              textColor={COLORS.error}>
              Cancel Session
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSurface: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    elevation: 2,
  },
  searchbar: {
    marginBottom: SPACING.sm,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  viewToggle: {
    margin: 0,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  sessionCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sessionType: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  sessionStatus: {
    marginLeft: SPACING.sm,
  },
  sessionDetails: {
    marginBottom: SPACING.md,
  },
  sessionMeta: {
    marginBottom: SPACING.sm,
  },
  sessionDate: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: 2,
  },
  sessionDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  coachName: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginLeft: SPACING.sm,
  },
  cancelButton: {
    marginLeft: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  createButton: {
    paddingHorizontal: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default SessionDetails;