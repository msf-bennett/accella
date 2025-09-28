import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Calendar, LocaleConfig } from 'react-native-calendars';

const { width } = Dimensions.get('window');

// Configure locale for calendar
LocaleConfig.locales['en'] = {
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  monthNamesShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ],
  dayNames: [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: "Today"
};
LocaleConfig.defaultLocale = 'en';

const CalendarScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [eventTypes, setEventTypes] = useState(['training', 'match', 'assessment', 'event']);
  const [selectedEventTypes, setSelectedEventTypes] = useState(['training', 'match', 'assessment', 'event']);
  const [loading, setLoading] = useState(false);

  // Mock data for children
  const mockChildren = [
    {
      id: 1,
      name: 'Alex Johnson',
      color: '#007AFF',
      sports: ['Football', 'Swimming']
    },
    {
      id: 2,
      name: 'Emma Johnson',
      color: '#FF6B6B',
      sports: ['Basketball']
    },
    {
      id: 3,
      name: 'Ryan Johnson',
      color: '#4ECDC4',
      sports: ['Tennis']
    }
  ];

  // Mock events data
  const mockEvents = [
    {
      id: 1,
      childId: 1,
      childName: 'Alex Johnson',
      title: 'Football Training',
      type: 'training',
      date: '2025-08-12',
      startTime: '16:00',
      endTime: '17:30',
      location: 'Elite Football Academy',
      coach: 'Coach Mike',
      description: 'Regular training session focusing on ball control',
      color: '#007AFF',
      sport: 'Football'
    },
    {
      id: 2,
      childId: 1,
      title: 'Swimming Lesson',
      type: 'training',
      date: '2025-08-13',
      startTime: '18:00',
      endTime: '19:00',
      location: 'Aqua Swimming Center',
      coach: 'Coach Sarah',
      description: 'Butterfly stroke technique improvement',
      color: '#007AFF',
      sport: 'Swimming'
    },
    {
      id: 3,
      childId: 2,
      title: 'Basketball Match',
      type: 'match',
      date: '2025-08-14',
      startTime: '15:00',
      endTime: '17:00',
      location: 'Sports Complex Arena',
      coach: 'Coach James',
      description: 'Championship quarter-final match',
      color: '#FF6B6B',
      sport: 'Basketball'
    },
    {
      id: 4,
      childId: 1,
      title: 'Fitness Assessment',
      type: 'assessment',
      date: '2025-08-15',
      startTime: '10:00',
      endTime: '11:00',
      location: 'Elite Football Academy',
      coach: 'Coach Mike',
      description: 'Monthly fitness and skill evaluation',
      color: '#007AFF',
      sport: 'Football'
    },
    {
      id: 5,
      childId: 3,
      title: 'Tennis Tournament',
      type: 'event',
      date: '2025-08-16',
      startTime: '09:00',
      endTime: '15:00',
      location: 'City Tennis Club',
      coach: 'Coach Anna',
      description: 'Junior tennis championship - first round',
      color: '#4ECDC4',
      sport: 'Tennis'
    },
    {
      id: 6,
      childId: 2,
      title: 'Team Building',
      type: 'event',
      date: '2025-08-17',
      startTime: '14:00',
      endTime: '16:00',
      location: 'Champions Basketball Hub',
      coach: 'Coach James',
      description: 'Team bonding and strategy session',
      color: '#FF6B6B',
      sport: 'Basketball'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    generateMarkedDates();
  }, [events, selectedChildren, selectedEventTypes]);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setChildren(mockChildren);
      setSelectedChildren(mockChildren.map(child => child.id));
      setEvents(mockEvents);
    } catch (error) {
      Alert.alert('Error', 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const generateMarkedDates = () => {
    const marked = {};
    const filteredEvents = getFilteredEvents();

    // Group events by date
    const eventsByDate = {};
    filteredEvents.forEach(event => {
      if (!eventsByDate[event.date]) {
        eventsByDate[event.date] = [];
      }
      eventsByDate[event.date].push(event);
    });

    // Create marked dates
    Object.keys(eventsByDate).forEach(date => {
      const dayEvents = eventsByDate[date];
      const dots = dayEvents.slice(0, 3).map(event => ({
        color: event.color,
        selectedDotColor: '#fff'
      }));

      marked[date] = {
        dots: dots,
        marked: dayEvents.length > 0
      };
    });

    // Mark selected date
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#007AFF',
      selectedTextColor: '#fff'
    };

    setMarkedDates(marked);
  };

  const getFilteredEvents = () => {
    return events.filter(event => 
      selectedChildren.includes(event.childId) &&
      selectedEventTypes.includes(event.type)
    );
  };

  const getEventsForDate = (date) => {
    const filteredEvents = getFilteredEvents();
    return filteredEvents.filter(event => event.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'training': return 'fitness-outline';
      case 'match': return 'trophy-outline';
      case 'assessment': return 'clipboard-outline';
      case 'event': return 'calendar-outline';
      default: return 'calendar-outline';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'training': return '#007AFF';
      case 'match': return '#FF3B30';
      case 'assessment': return '#FF9500';
      case 'event': return '#34C759';
      default: return '#007AFF';
    }
  };

  const renderChildFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childFilter}>
      {children.map(child => (
        <TouchableOpacity
          key={child.id}
          style={[
            styles.childFilterItem,
            { borderColor: child.color },
            selectedChildren.includes(child.id) && { backgroundColor: child.color }
          ]}
          onPress={() => {
            if (selectedChildren.includes(child.id)) {
              setSelectedChildren(selectedChildren.filter(id => id !== child.id));
            } else {
              setSelectedChildren([...selectedChildren, child.id]);
            }
          }}
        >
        <Text style={[
          styles.childFilterText,
          selectedChildren.includes(child.id) && styles.childFilterTextSelected
        ]}>
          {child?.name?.split(' ')[0] || 'Unknown'}
        </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderEventCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.eventCard, { borderLeftColor: item.color }]}
      onPress={() => {
        setSelectedEvent(item);
        setShowEventModal(true);
      }}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventTime}>
          <Text style={styles.eventTimeText}>
            {item.startTime} - {item.endTime}
          </Text>
          <View style={[styles.eventTypeBadge, { backgroundColor: getEventTypeColor(item.type) }]}>
            <Icon name={getEventTypeIcon(item.type)} size={12} color="#fff" />
            <Text style={styles.eventTypeText}>{item.type}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventChild}>{item.childName} • {item.sport}</Text>
        <View style={styles.eventLocation}>
          <Icon name="location-outline" size={14} color="#666" />
          <Text style={styles.eventLocationText}>{item.location}</Text>
        </View>
        <Text style={styles.eventCoach}>with {item.coach}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEventsList = () => {
    const dayEvents = getEventsForDate(selectedDate);
    
    if (dayEvents.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No events scheduled</Text>
          <Text style={styles.emptyStateSubtext}>
            This day is free from training and activities
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={dayEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.eventsList}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const EventDetailsModal = () => (
    <Modal
      visible={showEventModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Event Details</Text>
          <TouchableOpacity onPress={() => setShowEventModal(false)}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {selectedEvent && (
          <ScrollView style={styles.modalContent}>
            <View style={[styles.eventDetailCard, { borderLeftColor: selectedEvent.color }]}>
              <View style={styles.eventDetailHeader}>
                <Text style={styles.eventDetailTitle}>{selectedEvent.title}</Text>
                <View style={[
                  styles.eventDetailTypeBadge,
                  { backgroundColor: getEventTypeColor(selectedEvent.type) }
                ]}>
                  <Icon name={getEventTypeIcon(selectedEvent.type)} size={16} color="#fff" />
                  <Text style={styles.eventDetailTypeText}>
                    {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.eventDetailInfo}>
                <View style={styles.eventDetailRow}>
                  <Icon name="person-outline" size={20} color="#666" />
                  <Text style={styles.eventDetailText}>{selectedEvent.childName}</Text>
                </View>
                
                <View style={styles.eventDetailRow}>
                  <Icon name="time-outline" size={20} color="#666" />
                  <Text style={styles.eventDetailText}>
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </Text>
                </View>
                
                <View style={styles.eventDetailRow}>
                  <Icon name="location-outline" size={20} color="#666" />
                  <Text style={styles.eventDetailText}>{selectedEvent.location}</Text>
                </View>
                
                <View style={styles.eventDetailRow}>
                  <Icon name="fitness-outline" size={20} color="#666" />
                  <Text style={styles.eventDetailText}>
                    {selectedEvent.coach} • {selectedEvent.sport}
                  </Text>
                </View>
              </View>
              
              {selectedEvent.description && (
                <View style={styles.eventDescription}>
                  <Text style={styles.eventDescriptionTitle}>Description</Text>
                  <Text style={styles.eventDescriptionText}>{selectedEvent.description}</Text>
                </View>
              )}
              
              <View style={styles.eventActions}>
                <TouchableOpacity style={styles.eventActionButton}>
                  <Icon name="create-outline" size={18} color="#007AFF" />
                  <Text style={styles.eventActionText}>Edit Event</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.eventActionButton}>
                  <Icon name="chatbubble-outline" size={18} color="#007AFF" />
                  <Text style={styles.eventActionText}>Message Coach</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.eventActionButton}>
                  <Icon name="navigate-outline" size={18} color="#007AFF" />
                  <Text style={styles.eventActionText}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.filterModal}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filter Events</Text>
          <TouchableOpacity onPress={() => setShowFilterModal(false)}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.filterContent}>
          {/* Event Types Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Event Types</Text>
            <View style={styles.filterOptions}>
              {eventTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    selectedEventTypes.includes(type) && styles.filterOptionSelected
                  ]}
                  onPress={() => {
                    if (selectedEventTypes.includes(type)) {
                      setSelectedEventTypes(selectedEventTypes.filter(t => t !== type));
                    } else {
                      setSelectedEventTypes([...selectedEventTypes, type]);
                    }
                  }}
                >
                  <Icon 
                    name={getEventTypeIcon(type)} 
                    size={16} 
                    color={selectedEventTypes.includes(type) ? '#fff' : '#666'} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    selectedEventTypes.includes(type) && styles.filterOptionTextSelected
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
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
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <Icon name="filter" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Child Filter */}
      {renderChildFilter()}

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={currentMonth}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          onMonthChange={(month) => setCurrentMonth(month.dateString)}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#007AFF',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#007AFF',
            selectedDotColor: '#ffffff',
            arrowColor: '#007AFF',
            monthTextColor: '#2d4150',
            indicatorColor: '#007AFF',
            textDayFontWeight: '500',
            textMonthFontWeight: '600',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
        />
      </View>

      {/* Selected Date Header */}
      <View style={styles.selectedDateHeader}>
        <Text style={styles.selectedDateText}>
          {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
        <Text style={styles.eventsCount}>
          {getEventsForDate(selectedDate).length} events
        </Text>
      </View>

      {/* Events List */}
      <View style={styles.eventsContainer}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} />
          }
        >
          {renderEventsList()}
        </ScrollView>
      </View>

      <EventDetailsModal />
      <FilterModal />
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
  childFilter: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  childFilterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginHorizontal: 5,
  },
  childFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  childFilterTextSelected: {
    color: '#fff',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedDateHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  eventsCount: {
    fontSize: 14,
    color: '#666',
  },
  eventsContainer: {
    flex: 1,
  },
  eventsList: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 4,
  },
  eventContent: {
    marginTop: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventChild: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 6,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventLocationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  eventCoach: {
    fontSize: 12,
    color: '#888',
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  eventDetailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 4,
  },
  eventDetailHeader: {
    marginBottom: 20,
  },
  eventDetailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  eventDetailTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  eventDetailTypeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6,
  },
  eventDetailInfo: {
    marginBottom: 20,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  eventDescription: {
    marginBottom: 20,
  },
  eventDescriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventDescriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  eventActionButton: {
    alignItems: 'center',
    padding: 10,
  },
  eventActionText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  // Filter Modal Styles
  filterModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  filterOptionSelected: {
    backgroundColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 6,
  },
  filterOptionTextSelected: {
    color: '#fff',
  },
});

export default CalendarScreen;