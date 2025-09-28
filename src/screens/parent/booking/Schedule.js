import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';

const { width } = Dimensions.get('window');

const Schedule = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('week'); // 'week', 'month', 'list'
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  // Mock data for children
  const mockChildren = [
    {
      id: 1,
      name: 'Alex Johnson',
      age: 14,
      sports: ['Football', 'Swimming'],
      avatar: 'https://via.placeholder.com/50',
      activePrograms: 2
    },
    {
      id: 2,
      name: 'Emma Johnson',
      age: 11,
      sports: ['Basketball'],
      avatar: 'https://via.placeholder.com/50',
      activePrograms: 1
    }
  ];

  // Mock session data
  const mockSessions = [
    {
      id: 1,
      childId: 1,
      title: 'Football Training',
      coach: 'Coach Mike',
      academy: 'Elite Football Academy',
      date: '2025-08-12',
      startTime: '16:00',
      endTime: '17:30',
      duration: 90,
      type: 'training',
      status: 'scheduled',
      location: 'Main Field',
      notes: 'Focus on ball control and passing',
      sport: 'Football'
    },
    {
      id: 2,
      childId: 1,
      title: 'Swimming Lesson',
      coach: 'Coach Sarah',
      academy: 'Aqua Swimming Center',
      date: '2025-08-13',
      startTime: '18:00',
      endTime: '19:00',
      duration: 60,
      type: 'lesson',
      status: 'scheduled',
      location: 'Pool A',
      notes: 'Butterfly stroke technique',
      sport: 'Swimming'
    },
    {
      id: 3,
      childId: 2,
      title: 'Basketball Practice',
      coach: 'Coach James',
      academy: 'Champions Basketball Hub',
      date: '2025-08-12',
      startTime: '17:00',
      endTime: '18:30',
      duration: 90,
      type: 'practice',
      status: 'completed',
      location: 'Court 1',
      notes: 'Great improvement in shooting',
      sport: 'Basketball'
    },
    {
      id: 4,
      childId: 1,
      title: 'Football Match',
      coach: 'Coach Mike',
      academy: 'Elite Football Academy',
      date: '2025-08-14',
      startTime: '15:00',
      endTime: '16:30',
      duration: 90,
      type: 'match',
      status: 'upcoming',
      location: 'Stadium Field',
      notes: 'Championship semi-final',
      sport: 'Football'
    }
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSessions();
    generateMarkedDates();
  }, [selectedChild, selectedDate, sessions]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setChildren(mockChildren);
      setSelectedChild(mockChildren[0]);
      setSessions(mockSessions);
    } catch (error) {
      Alert.alert('Error', 'Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    if (!selectedChild) return [];
    return sessions.filter(session => session.childId === selectedChild.id);
  };

  const generateMarkedDates = () => {
    const marked = {};
    const childSessions = filterSessions();
    
    childSessions.forEach(session => {
      marked[session.date] = {
        marked: true,
        dotColor: getStatusColor(session.status),
      };
    });

    // Mark selected date
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#007AFF',
    };

    setMarkedDates(marked);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'scheduled': return '#007AFF';
      case 'upcoming': return '#FF9500';
      case 'cancelled': return '#FF3B30';
      default: return '#007AFF';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'training': return 'fitness-outline';
      case 'lesson': return 'book-outline';
      case 'practice': return 'basketball-outline';
      case 'match': return 'trophy-outline';
      default: return 'calendar-outline';
    }
  };

  const getSessionsForDate = (date) => {
    const childSessions = filterSessions();
    return childSessions.filter(session => session.date === date);
  };

  const getCurrentWeekDates = () => {
    const today = new Date(selectedDate);
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const renderChildSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.childSelector}
    >
      {children.map((child) => (
        <TouchableOpacity
          key={child.id}
          style={[
            styles.childCard,
            selectedChild?.id === child.id && styles.childCardSelected
          ]}
          onPress={() => setSelectedChild(child)}
        >
            <View style={styles.childAvatar}>
              <Text style={styles.childAvatarText}>
                {child?.name ? 
                  child.name.split(' ')
                    .filter(n => n.length > 0)
                    .map(n => n[0]?.toUpperCase())
                    .join('') || 'NN'
                  : 'NN'
                }
              </Text>
            </View>
          <Text style={[
            styles.childName,
            selectedChild?.id === child.id && styles.childNameSelected
          ]}>{child.name.split(' ')[0]}</Text>
          <Text style={[
            styles.childPrograms,
            selectedChild?.id === child.id && styles.childProgramsSelected
          ]}>{child.activePrograms} programs</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderWeekView = () => {
    const weekDates = getCurrentWeekDates();
    
    return (
      <View style={styles.weekView}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weekDates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const sessions = getSessionsForDate(dateStr);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCard,
                  isSelected && styles.dayCardSelected
                ]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text style={[
                  styles.dayName,
                  isSelected && styles.dayNameSelected
                ]}>{weekDays[index]}</Text>
                <View style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                  isToday && !isSelected && styles.dayNumberToday
                ]}>
                  <Text style={[
                    styles.dayNumberText,
                    isSelected && styles.dayNumberTextSelected,
                    isToday && !isSelected && styles.dayNumberTextToday
                  ]}>{date.getDate()}</Text>
                </View>
                {sessions.length > 0 && (
                  <View style={styles.sessionDots}>
                    {sessions.slice(0, 3).map((session, i) => (
                      <View 
                        key={i} 
                        style={[
                          styles.sessionDot,
                          { backgroundColor: getStatusColor(session.status) }
                        ]} 
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderSessionCard = ({ item }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => navigation.navigate('SessionDetails', { session: item })}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionTime}>
          <Text style={styles.sessionTimeText}>{item.startTime}</Text>
          <Text style={styles.sessionDuration}>{item.duration}min</Text>
        </View>
        <View style={[
          styles.sessionStatus,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.sessionStatusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.sessionContent}>
        <View style={styles.sessionIcon}>
          <Icon name={getTypeIcon(item.type)} size={24} color="#007AFF" />
        </View>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>{item.title}</Text>
          <Text style={styles.sessionCoach}>with {item.coach}</Text>
          <Text style={styles.sessionLocation}>
            <Icon name="location-outline" size={12} color="#666" />
            {item.academy} • {item.location}
          </Text>
          {item.notes && (
            <Text style={styles.sessionNotes} numberOfLines={2}>
              {item.notes}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDaySessions = () => {
    const daySessions = getSessionsForDate(selectedDate);
    
    if (daySessions.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No sessions scheduled</Text>
          <Text style={styles.emptyStateSubtext}>
            This day is free for other activities
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={daySessions.sort((a, b) => a.startTime.localeCompare(b.startTime))}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.sessionsList}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const CalendarModal = () => (
    <Modal
      visible={showCalendar}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.calendarModal}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>Select Date</Text>
          <TouchableOpacity onPress={() => setShowCalendar(false)}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <Calendar
          current={selectedDate}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setShowCalendar(false);
          }}
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: '#007AFF',
            todayTextColor: '#007AFF',
            arrowColor: '#007AFF',
          }}
        />
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowCalendar(true)}
          >
            <Icon name="calendar" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('CalendarScreen')}
          >
            <Icon name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Child Selector */}
      {renderChildSelector()}

      {/* Selected Child Info */}
      {selectedChild && (
        <View style={styles.selectedChildInfo}>
          <Text style={styles.selectedChildName}>{selectedChild.name}</Text>
          <Text style={styles.selectedChildDetails}>
            {selectedChild.sports.join(', ')} • {selectedChild.activePrograms} active programs
          </Text>
        </View>
      )}

      {/* View Mode Toggle */}
      <View style={styles.viewModeToggle}>
        {['week', 'month', 'list'].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.viewModeButton,
              viewMode === mode && styles.viewModeButtonActive
            ]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[
              styles.viewModeText,
              viewMode === mode && styles.viewModeTextActive
            ]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Week View */}
      {viewMode === 'week' && renderWeekView()}

      {/* Sessions for Selected Date */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        {renderDaySessions()}
      </ScrollView>

      <CalendarModal />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childSelector: {
    backgroundColor: '#fff',
    paddingVertical: 15,
  },
  childCard: {
    alignItems: 'center',
    marginLeft: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: '#f8f8f8',
    minWidth: 80,
  },
  childCardSelected: {
    backgroundColor: '#007AFF',
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  childAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  childName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  childNameSelected: {
    color: '#fff',
  },
  childPrograms: {
    fontSize: 10,
    color: '#666',
  },
  childProgramsSelected: {
    color: '#fff',
  },
  selectedChildInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedChildName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  selectedChildDetails: {
    fontSize: 12,
    color: '#666',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 2,
    borderRadius: 20,
  },
  viewModeButtonActive: {
    backgroundColor: '#007AFF',
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  viewModeTextActive: {
    color: '#fff',
  },
  weekView: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayCard: {
    alignItems: 'center',
    marginLeft: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    minWidth: 60,
  },
  dayCardSelected: {
    backgroundColor: '#007AFF',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  dayNameSelected: {
    color: '#fff',
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dayNumberToday: {
    backgroundColor: '#007AFF',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dayNumberTextSelected: {
    color: '#fff',
  },
  dayNumberTextToday: {
    color: '#fff',
  },
  sessionDots: {
    flexDirection: 'row',
    marginTop: 4,
  },
  sessionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  content: {
    flex: 1,
  },
  sessionsList: {
    padding: 20,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionTime: {
    alignItems: 'center',
  },
  sessionTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sessionDuration: {
    fontSize: 12,
    color: '#666',
  },
  sessionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  sessionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sessionIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sessionCoach: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  sessionLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  sessionNotes: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  // Calendar Modal Styles
  calendarModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default Schedule;