import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Schedule = ({ navigation }) => {
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [childFilter, setChildFilter] = useState('all');

  // Mock data
  const children = [
    { id: 1, name: 'Alex Johnson', color: '#007AFF' },
    { id: 2, name: 'Emma Johnson', color: '#FF9500' }
  ];

  const mockSessions = [
    {
      id: 1,
      title: 'Football Training',
      childId: 1,
      childName: 'Alex Johnson',
      coach: 'Coach Martinez',
      academy: 'Elite Sports Academy',
      startTime: new Date('2024-08-12T15:00:00'),
      endTime: new Date('2024-08-12T16:30:00'),
      type: 'training',
      status: 'confirmed',
      location: 'Main Field',
      recurring: true,
      color: '#007AFF'
    },
    {
      id: 2,
      title: 'Swimming Lesson',
      childId: 2,
      childName: 'Emma Johnson',
      coach: 'Coach Williams',
      academy: 'AquaTech Center',
      startTime: new Date('2024-08-13T10:00:00'),
      endTime: new Date('2024-08-13T11:00:00'),
      type: 'lesson',
      status: 'confirmed',
      location: 'Pool A',
      recurring: true,
      color: '#00C853'
    },
    {
      id: 3,
      title: 'Football Match',
      childId: 1,
      childName: 'Alex Johnson',
      coach: 'Coach Martinez',
      academy: 'Elite Sports Academy',
      startTime: new Date('2024-08-15T18:00:00'),
      endTime: new Date('2024-08-15T19:30:00'),
      type: 'match',
      status: 'pending',
      location: 'Stadium',
      recurring: false,
      color: '#FF3B30'
    },
    {
      id: 4,
      title: 'Skills Assessment',
      childId: 1,
      childName: 'Alex Johnson',
      coach: 'Coach Davis',
      academy: 'Elite Sports Academy',
      startTime: new Date('2024-08-14T16:00:00'),
      endTime: new Date('2024-08-14T17:00:00'),
      type: 'assessment',
      status: 'rescheduled',
      location: 'Training Ground',
      recurring: false,
      color: '#9C27B0',
      originalTime: new Date('2024-08-14T15:00:00'),
      rescheduleReason: 'Coach availability conflict'
    },
    {
      id: 5,
      title: 'Team Practice',
      childId: 2,
      childName: 'Emma Johnson',
      coach: 'Coach Thompson',
      academy: 'AquaTech Center',
      startTime: new Date('2024-08-16T14:00:00'),
      endTime: new Date('2024-08-16T15:30:00'),
      type: 'practice',
      status: 'confirmed',
      location: 'Pool B',
      recurring: true,
      color: '#FF9500'
    }
  ];

  const mockConflicts = [
    {
      id: 1,
      sessionId: 3,
      type: 'overlap',
      message: 'Football match overlaps with swimming practice',
      conflictWith: 'Swimming practice at AquaTech Center',
      severity: 'high'
    }
  ];

  useEffect(() => {
    loadScheduleData();
  }, [currentDate, childFilter]);

  const loadScheduleData = async () => {
    // Replace with actual API calls
    let filteredSessions = mockSessions;
    
    if (childFilter !== 'all') {
      filteredSessions = mockSessions.filter(session => 
        session.childId === parseInt(childFilter)
      );
    }
    
    setSessions(filteredSessions);
    setConflicts(mockConflicts);
  };

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const getSessionsForDate = (date) => {
    return sessions.filter(session => 
      session.startTime.toDateString() === date.toDateString()
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#00C853';
      case 'pending': return '#FF9500';
      case 'cancelled': return '#FF5722';
      case 'rescheduled': return '#9C27B0';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      case 'rescheduled': return 'repeat';
      default: return 'help-circle';
    }
  };

  const formatSessionTime = (startTime, endTime) => {
    const start = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const end = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${start} - ${end}`;
  };

  const handleSessionPress = (session) => {
    navigation.navigate('SessionDetails', { sessionId: session.id });
  };

  const handleReschedule = (session) => {
    setSelectedSession(session);
    setShowRescheduleModal(true);
  };

  const confirmReschedule = () => {
    Alert.alert(
      'Request Reschedule',
      `Send reschedule request for ${selectedSession?.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: () => {
            // Update session status
            setSessions(prev => 
              prev.map(s => 
                s.id === selectedSession.id 
                  ? { ...s, status: 'pending', rescheduleRequested: true }
                  : s
              )
            );
            setShowRescheduleModal(false);
            Alert.alert('Success', 'Reschedule request sent to coach!');
          }
        }
      ]
    );
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    
    return (
      <View style={styles.weekContainer}>
        {/* Week Header */}
        <View style={styles.weekHeader}>
          {weekDates.map((date, index) => {
            const dayName = date.toLocaleDateString('en', { weekday: 'short' });
            const dayNumber = date.getDate();
            const isToday = date.toDateString() === new Date().toDateString();
            const hasSessions = getSessionsForDate(date).length > 0;

            return (
              <View key={index} style={styles.dayHeader}>
                <Text style={[styles.dayName, isToday && styles.todayText]}>
                  {dayName}
                </Text>
                <View style={[
                  styles.dayNumber,
                  isToday && styles.todayCircle,
                  hasSessions && styles.hasSessionsCircle
                ]}>
                  <Text style={[
                    styles.dayNumberText,
                    isToday && styles.todayText,
                    hasSessions && styles.hasSessionsText
                  ]}>
                    {dayNumber}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Sessions for each day */}
        <ScrollView style={styles.weekContent}>
          {weekDates.map((date, index) => {
            const daySessions = getSessionsForDate(date);
            
            return (
              <View key={index} style={styles.dayContainer}>
                <View style={styles.dayLabel}>
                  <Text style={styles.dayLabelText}>
                    {date.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </Text>
                  {daySessions.length > 0 && (
                    <Text style={styles.sessionCount}>
                      {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
                
                {daySessions.length === 0 ? (
                  <View style={styles.noSessions}>
                    <Text style={styles.noSessionsText}>No sessions scheduled</Text>
                  </View>
                ) : (
                  daySessions.map(session => (
                    <TouchableOpacity
                      key={session.id}
                      style={[
                        styles.sessionCard,
                        { borderLeftColor: session.color },
                        session.status === 'rescheduled' && styles.rescheduledCard
                      ]}
                      onPress={() => handleSessionPress(session)}
                    >
                      <View style={styles.sessionHeader}>
                        <View style={styles.sessionInfo}>
                          <Text style={styles.sessionTitle}>{session.title}</Text>
                          <Text style={styles.sessionChild}>{session.childName}</Text>
                          <Text style={styles.sessionTime}>
                            {formatSessionTime(session.startTime, session.endTime)}
                          </Text>
                          <Text style={styles.sessionLocation}>
                            📍 {session.academy} - {session.location}
                          </Text>
                        </View>
                        
                        <View style={styles.sessionActions}>
                          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
                            <Ionicons 
                              name={getStatusIcon(session.status)} 
                              size={12} 
                              color="#fff" 
                            />
                            <Text style={styles.statusText}>
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </Text>
                          </View>
                          
                          {session.status !== 'cancelled' && (
                            <TouchableOpacity
                              style={styles.rescheduleButton}
                              onPress={() => handleReschedule(session)}
                            >
                              <Ionicons name="calendar-outline" size={16} color="#007AFF" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      
                      {session.status === 'rescheduled' && session.rescheduleReason && (
                        <View style={styles.rescheduleInfo}>
                          <Ionicons name="information-circle" size={14} color="#9C27B0" />
                          <Text style={styles.rescheduleReason}>
                            Moved from {session.originalTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {session.rescheduleReason}
                          </Text>
                        </View>
                      )}
                      
                      {session.recurring && (
                        <View style={styles.recurringIndicator}>
                          <Ionicons name="repeat" size={12} color="#666" />
                          <Text style={styles.recurringText}>Recurring weekly</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderMonthView = () => {
    // Simplified month view - could be expanded with a proper calendar grid
    const monthSessions = sessions.filter(session => {
      const sessionMonth = session.startTime.getMonth();
      const sessionYear = session.startTime.getFullYear();
      return sessionMonth === currentDate.getMonth() && sessionYear === currentDate.getFullYear();
    });

    // Group sessions by date
    const sessionsByDate = monthSessions.reduce((acc, session) => {
      const dateKey = session.startTime.toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(session);
      return acc;
    }, {});

    return (
      <View style={styles.monthContainer}>
        <Text style={styles.monthTitle}>
          {currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
        </Text>
        
        <ScrollView style={styles.monthContent}>
          {Object.entries(sessionsByDate)
            .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
            .map(([dateStr, dateSessions]) => (
              <View key={dateStr} style={styles.monthDayContainer}>
                <Text style={styles.monthDayHeader}>
                  {new Date(dateStr).toLocaleDateString('en', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
                {dateSessions.map(session => (
                  <TouchableOpacity
                    key={session.id}
                    style={[styles.monthSessionCard, { borderLeftColor: session.color }]}
                    onPress={() => handleSessionPress(session)}
                  >
                    <Text style={styles.monthSessionTitle}>{session.title}</Text>
                    <Text style={styles.monthSessionTime}>
                      {formatSessionTime(session.startTime, session.endTime)}
                    </Text>
                    <Text style={styles.monthSessionChild}>{session.childName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Schedule</Text>
          {conflicts.length > 0 && (
            <View style={styles.conflictBadge}>
              <Ionicons name="warning" size={12} color="#fff" />
              <Text style={styles.conflictText}>{conflicts.length}</Text>
            </View>
          )}
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'week' && styles.activeToggle]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.toggleText, viewMode === 'week' && styles.activeToggleText]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'month' && styles.activeToggle]}
            onPress={() => setViewMode('month')}
          >
            <Text style={[styles.toggleText, viewMode === 'month' && styles.activeToggleText]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Child Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.childFilter, childFilter === 'all' && styles.activeChildFilter]}
            onPress={() => setChildFilter('all')}
          >
            <Text style={[styles.childFilterText, childFilter === 'all' && styles.activeChildFilterText]}>
              All Children
            </Text>
          </TouchableOpacity>
          {children.map(child => (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.childFilter,
                childFilter === child.id.toString() && styles.activeChildFilter,
                { borderColor: child.color }
              ]}
              onPress={() => setChildFilter(child.id.toString())}
            >
              <View style={[styles.childColorDot, { backgroundColor: child.color }]} />
              <Text style={[
                styles.childFilterText,
                childFilter === child.id.toString() && styles.activeChildFilterText
              ]}>
                {child.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => viewMode === 'week' ? navigateWeek(-1) : navigateMonth(-1)}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.navTitle}>
          {viewMode === 'week' 
            ? `Week of ${getWeekDates(currentDate)[0].toLocaleDateString('en', { month: 'short', day: 'numeric' })}`
            : currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })
          }
        </Text>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => viewMode === 'week' ? navigateWeek(1) : navigateMonth(1)}
        >
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <View style={styles.conflictsAlert}>
          <Ionicons name="warning" size={20} color="#FF9500" />
          <Text style={styles.conflictsText}>
            {conflicts.length} scheduling conflict{conflicts.length > 1 ? 's' : ''} detected
          </Text>
          <TouchableOpacity>
            <Text style={styles.resolveText}>Resolve</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Schedule Content */}
      {viewMode === 'week' ? renderWeekView() : renderMonthView()}

      {/* Reschedule Modal */}
      <Modal visible={showRescheduleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.rescheduleModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Reschedule</Text>
              <TouchableOpacity onPress={() => setShowRescheduleModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.sessionDetails}>
                {selectedSession?.title} with {selectedSession?.coach}
              </Text>
              <Text style={styles.currentTime}>
                Currently scheduled: {selectedSession?.startTime.toLocaleDateString()} at{' '}
                {formatSessionTime(selectedSession?.startTime, selectedSession?.endTime)}
              </Text>
              <Text style={styles.rescheduleNote}>
                A reschedule request will be sent to your coach. They will contact you with alternative times.
              </Text>
              <TouchableOpacity
                style={styles.confirmRescheduleButton}
                onPress={confirmReschedule}
              >
                <Text style={styles.confirmRescheduleText}>Send Reschedule Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  conflictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  },
  conflictText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  activeToggleText: {
    color: '#fff',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  childFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginLeft: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeChildFilter: {
    backgroundColor: '#007AFF',
  },
  childColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  childFilterText: {
    fontSize: 14,
    color: '#666',
  },
  activeChildFilterText: {
    color: '#fff',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  navButton: {
    padding: 8,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  conflictsAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  conflictsText: {
    flex: 1,
    fontSize: 14,
    color: '#F57C00',
    marginLeft: 8,
  },
  resolveText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
  },
  weekContainer: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  todayText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    backgroundColor: '#007AFF',
  },
  hasSessionsCircle: {
    backgroundColor: '#E3F2FD',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  hasSessionsText: {
    color: '#007AFF',
  },
  weekContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sessionCount: {
    fontSize: 12,
    color: '#666',
  },
  noSessions: {
    padding: 20,
    alignItems: 'center',
  },
  noSessionsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rescheduledCard: {
    backgroundColor: '#FDF4FF',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sessionChild: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sessionLocation: {
    fontSize: 12,
    color: '#999',
  },
  sessionActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  rescheduleButton: {
    padding: 4,
  },
  rescheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F3E5F5',
    borderRadius: 6,
  },
  rescheduleReason: {
    fontSize: 12,
    color: '#7B1FA2',
    marginLeft: 6,
    flex: 1,
  },
  recurringIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  recurringText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  monthContainer: {
    flex: 1,
    padding: 16,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  monthContent: {
    flex: 1,
  },
  monthDayContainer: {
    marginBottom: 20,
  },
  monthDayHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  monthSessionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  monthSessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  monthSessionTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  monthSessionChild: {
    fontSize: 11,
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rescheduleModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  sessionDetails: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  currentTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  rescheduleNote: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmRescheduleButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmRescheduleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Schedule;