import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  Vibration,
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
  Badge,
} from 'react-native-paper';
import { BlurView } from 'expo-blur';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  info: '#2196F3',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const TeamCalendar = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, team, calendar } = useSelector(state => ({
    user: state.auth.user,
    team: state.team.currentTeam || {},
    calendar: state.calendar.events || [],
  }));

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [refreshing, setRefreshing] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    loadCalendarEvents();
  }, [currentMonth]);

  const loadCalendarEvents = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual Redux action
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchCalendarEvents({ teamId: team.id, month: currentMonth }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, team.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCalendarEvents();
    setRefreshing(false);
  }, [loadCalendarEvents]);

  const handleEventPress = useCallback((event) => {
    Vibration.vibrate(50);
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  const handleCreateEvent = useCallback(async (eventData) => {
    try {
      setLoading(true);
      // Simulate event creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        '🎉 Event Created!',
        `${eventData.title} has been added to the team calendar`,
        [{ text: 'Great!', onPress: () => setShowCreateModal(false) }]
      );
      
      // dispatch(createCalendarEvent(eventData));
      await loadCalendarEvents();
    } catch (error) {
      Alert.alert('Creation Failed', 'Please try again later');
    } finally {
      setLoading(false);
    }
  }, [loadCalendarEvents]);

  const getDaysInMonth = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, []);

  const getEventsForDate = useCallback((date) => {
    if (!date) return [];
    
    const dateString = date.toISOString().split('T')[0];
    return mockEvents.filter(event => 
      event.date === dateString
    );
  }, []);

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'training': return COLORS.primary;
      case 'match': return COLORS.success;
      case 'meeting': return COLORS.warning;
      case 'event': return COLORS.info;
      case 'recovery': return COLORS.secondary;
      default: return COLORS.textSecondary;
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'training': return 'fitness-center';
      case 'match': return 'sports-soccer';
      case 'meeting': return 'people';
      case 'event': return 'event';
      case 'recovery': return 'spa';
      default: return 'schedule';
    }
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const navigateMonth = useCallback((direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  }, [currentMonth]);

  const isToday = (date) => {
    const today = new Date();
    return date && 
           date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date && 
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const renderCalendarDay = ({ item: date, index }) => {
    if (!date) {
      return <View style={styles.emptyDay} />;
    }

    const events = getEventsForDate(date);
    const dayEvents = events.slice(0, 3); // Show max 3 events per day
    const hasMoreEvents = events.length > 3;

    return (
      <TouchableOpacity
        style={[
          styles.dayCell,
          isToday(date) && styles.todayCell,
          isSelected(date) && styles.selectedDay,
        ]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[
          styles.dayNumber,
          isToday(date) && styles.todayText,
          isSelected(date) && styles.selectedDayText,
        ]}>
          {date.getDate()}
        </Text>
        
        <View style={styles.eventsContainer}>
          {dayEvents.map((event, idx) => (
            <TouchableOpacity
              key={event.id}
              style={[
                styles.eventDot,
                { backgroundColor: getEventTypeColor(event.type) }
              ]}
              onPress={() => handleEventPress(event)}
            >
              <Text style={styles.eventDotText} numberOfLines={1}>
                {event.title.substring(0, 8)}
              </Text>
            </TouchableOpacity>
          ))}
          {hasMoreEvents && (
            <View style={styles.moreEventsDot}>
              <Text style={styles.moreEventsText}>+{events.length - 3}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDayView = () => {
    const events = getEventsForDate(selectedDate);
    
    return (
      <ScrollView style={styles.dayView} showsVerticalScrollIndicator={false}>
        <Text style={[TEXT_STYLES.h2, styles.dayViewTitle]}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        {events.length > 0 ? (
          events.map((event, index) => (
            <Animated.View
              key={event.id}
              style={[
                styles.dayEventCard,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }]
                }
              ]}
            >
              <TouchableOpacity onPress={() => handleEventPress(event)}>
                <Card style={styles.eventCard} elevation={2}>
                  <Card.Content style={styles.eventCardContent}>
                    <View style={styles.eventHeader}>
                      <View style={[
                        styles.eventTypeIndicator,
                        { backgroundColor: getEventTypeColor(event.type) }
                      ]} />
                      <View style={styles.eventInfo}>
                        <Text style={[TEXT_STYLES.h3, styles.eventTitle]}>
                          {event.title}
                        </Text>
                        <View style={styles.eventMeta}>
                          <Icon name="schedule" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.eventTime}>
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </Text>
                        </View>
                        {event.location && (
                          <View style={styles.eventMeta}>
                            <Icon name="location-on" size={14} color={COLORS.textSecondary} />
                            <Text style={styles.eventLocation}>{event.location}</Text>
                          </View>
                        )}
                      </View>
                      <Chip
                        style={[
                          styles.eventTypeChip,
                          { backgroundColor: getEventTypeColor(event.type) + '20' }
                        ]}
                        textStyle={{ color: getEventTypeColor(event.type), fontSize: 12 }}
                        compact
                      >
                        {event.type.toUpperCase()}
                      </Chip>
                    </View>
                    
                    {event.participants && (
                      <View style={styles.participantsContainer}>
                        <Text style={styles.participantsLabel}>Participants:</Text>
                        <View style={styles.avatarGroup}>
                          {event.participants.slice(0, 5).map((participant, idx) => (
                            <Avatar.Image
                              key={participant.id}
                              size={24}
                              source={{ uri: participant.avatar }}
                              style={[styles.participantAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                            />
                          ))}
                          {event.participants.length > 5 && (
                            <View style={styles.moreParticipants}>
                              <Text style={styles.moreParticipantsText}>
                                +{event.participants.length - 5}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyDayState}>
            <Icon name="event-available" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyDayTitle}>No events today</Text>
            <Text style={styles.emptyDaySubtitle}>
              Tap the + button to schedule something
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderUpcomingEvents = () => {
    const upcomingEvents = mockEvents
      .filter(event => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    return (
      <View style={styles.upcomingSection}>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
          🗓️ Upcoming Events
        </Text>
        {upcomingEvents.map((event, index) => (
          <TouchableOpacity
            key={event.id}
            style={styles.upcomingEventCard}
            onPress={() => handleEventPress(event)}
          >
            <Surface style={styles.upcomingEventSurface}>
              <View style={[
                styles.eventColorBar,
                { backgroundColor: getEventTypeColor(event.type) }
              ]} />
              <View style={styles.upcomingEventContent}>
                <View style={styles.upcomingEventHeader}>
                  <Text style={styles.upcomingEventTitle}>{event.title}</Text>
                  <Text style={styles.upcomingEventDate}>
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <Text style={styles.upcomingEventTime}>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </Text>
              </View>
              <Icon 
                name={getEventTypeIcon(event.type)} 
                size={24} 
                color={getEventTypeColor(event.type)} 
              />
            </Surface>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Mock data for demonstration
  const mockEvents = [
    {
      id: '1',
      title: 'Morning Training',
      type: 'training',
      date: '2025-08-24',
      startTime: '09:00',
      endTime: '11:00',
      location: 'Main Field',
      description: 'Strength and conditioning session focusing on core stability',
      participants: [
        { id: '1', name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
        { id: '2', name: 'Jane Smith', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c77e?w=150' },
        { id: '3', name: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      ]
    },
    {
      id: '2',
      title: 'vs Eagles FC',
      type: 'match',
      date: '2025-08-26',
      startTime: '15:00',
      endTime: '17:00',
      location: 'Stadium A',
      description: 'League match against Eagles FC - Home game',
      participants: []
    },
    {
      id: '3',
      title: 'Team Meeting',
      type: 'meeting',
      date: '2025-08-25',
      startTime: '18:00',
      endTime: '19:00',
      location: 'Club House',
      description: 'Weekly team meeting to discuss strategy and upcoming matches',
      participants: []
    },
    {
      id: '4',
      title: 'Recovery Session',
      type: 'recovery',
      date: '2025-08-27',
      startTime: '10:00',
      endTime: '11:30',
      location: 'Recovery Center',
      description: 'Post-match recovery and physiotherapy',
      participants: []
    },
    {
      id: '5',
      title: 'Skills Training',
      type: 'training',
      date: '2025-08-28',
      startTime: '16:00',
      endTime: '18:00',
      location: 'Training Ground B',
      description: 'Technical skills and ball work',
      participants: []
    },
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = getDaysInMonth(currentMonth);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Team Calendar 📅</Text>
              <Text style={styles.headerSubtitle}>
                {team.name || 'Team Schedule'} • {mockEvents.length} events
              </Text>
            </View>
            <View style={styles.headerActions}>
              <IconButton
                icon="search"
                iconColor="#fff"
                size={24}
                onPress={() => Alert.alert('Feature Coming Soon', 'Search functionality will be available soon')}
              />
              <IconButton
                icon="notifications"
                iconColor="#fff"
                size={24}
                onPress={() => Alert.alert('Feature Coming Soon', 'Notifications will be available soon')}
              />
            </View>
          </View>

          {/* View Mode Toggle */}
          <View style={styles.viewModeToggle}>
            {['month', 'day'].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.viewModeButton,
                  viewMode === mode && styles.activeViewMode
                ]}
                onPress={() => setViewMode(mode)}
              >
                <Text style={[
                  styles.viewModeText,
                  viewMode === mode && styles.activeViewModeText
                ]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {viewMode === 'month' && (
          <Animated.View 
            style={[
              styles.calendarContainer,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* Calendar Header */}
            <Surface style={styles.calendarHeader}>
              <View style={styles.monthNavigation}>
                <IconButton
                  icon="chevron-left"
                  onPress={() => navigateMonth(-1)}
                  iconColor={COLORS.primary}
                />
                <Text style={[TEXT_STYLES.h2, styles.monthTitle]}>
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
                <IconButton
                  icon="chevron-right"
                  onPress={() => navigateMonth(1)}
                  iconColor={COLORS.primary}
                />
              </View>
              
              {/* Week Day Headers */}
              <View style={styles.weekHeader}>
                {weekDays.map(day => (
                  <Text key={day} style={styles.weekDayText}>
                    {day}
                  </Text>
                ))}
              </View>
            </Surface>

            {/* Calendar Grid */}
            <Surface style={styles.calendarGrid}>
              <FlatList
                data={calendarDays}
                renderItem={renderCalendarDay}
                keyExtractor={(item, index) => index.toString()}
                numColumns={7}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </Surface>
          </Animated.View>
        )}

        {viewMode === 'day' && renderDayView()}

        {/* Quick Stats */}
        <Animated.View 
          style={[
            styles.statsContainer,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.statsRow}>
            <Surface style={styles.statCard}>
              <Icon name="event" size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>
                {mockEvents.filter(e => e.type === 'training').length}
              </Text>
              <Text style={styles.statLabel}>Training</Text>
            </Surface>
            
            <Surface style={styles.statCard}>
              <Icon name="sports-soccer" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>
                {mockEvents.filter(e => e.type === 'match').length}
              </Text>
              <Text style={styles.statLabel}>Matches</Text>
            </Surface>
            
            <Surface style={styles.statCard}>
              <Icon name="people" size={24} color={COLORS.warning} />
              <Text style={styles.statNumber}>
                {mockEvents.filter(e => e.type === 'meeting').length}
              </Text>
              <Text style={styles.statLabel}>Meetings</Text>
            </Surface>
          </View>
        </Animated.View>

        {renderUpcomingEvents()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Event Detail Modal */}
      <Portal>
        <Modal
          visible={showEventModal}
          animationType="slide"
          onRequestClose={() => setShowEventModal(false)}
        >
          <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
            <View style={styles.modalContainer}>
              <Surface style={styles.modalContent}>
                {selectedEvent && (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
                        {selectedEvent.title}
                      </Text>
                      <IconButton
                        icon="close"
                        onPress={() => setShowEventModal(false)}
                      />
                    </View>

                    <View style={styles.eventDetailContent}>
                      <View style={styles.eventDetailHeader}>
                        <View style={[
                          styles.eventTypeIndicator,
                          { backgroundColor: getEventTypeColor(selectedEvent.type) }
                        ]} />
                        <Chip
                          style={[
                            styles.eventTypeChip,
                            { backgroundColor: getEventTypeColor(selectedEvent.type) + '20' }
                          ]}
                          textStyle={{ color: getEventTypeColor(selectedEvent.type) }}
                        >
                          {selectedEvent.type.toUpperCase()}
                        </Chip>
                      </View>

                      <View style={styles.eventDetails}>
                        <View style={styles.detailRow}>
                          <Icon name="schedule" size={20} color={COLORS.primary} />
                          <Text style={styles.detailText}>
                            {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Icon name="access-time" size={20} color={COLORS.primary} />
                          <Text style={styles.detailText}>
                            {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                          </Text>
                        </View>
                        
                        {selectedEvent.location && (
                          <View style={styles.detailRow}>
                            <Icon name="location-on" size={20} color={COLORS.primary} />
                            <Text style={styles.detailText}>{selectedEvent.location}</Text>
                          </View>
                        )}
                        
                        {selectedEvent.description && (
                          <View style={styles.detailRow}>
                            <Icon name="description" size={20} color={COLORS.primary} />
                            <Text style={styles.detailText}>{selectedEvent.description}</Text>
                          </View>
                        )}
                      </View>

                      {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                        <View style={styles.participantsSection}>
                          <Text style={[TEXT_STYLES.h3, styles.participantsSectionTitle]}>
                            Participants ({selectedEvent.participants.length})
                          </Text>
                          <View style={styles.participantsList}>
                            {selectedEvent.participants.map((participant) => (
                              <View key={participant.id} style={styles.participantItem}>
                                <Avatar.Image 
                                  size={40} 
                                  source={{ uri: participant.avatar }}
                                />
                                <Text style={styles.participantName}>
                                  {participant.name}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      <View style={styles.eventActions}>
                        <Button
                          mode="outlined"
                          icon="edit"
                          onPress={() => Alert.alert('Feature Coming Soon', 'Edit functionality will be available soon')}
                          style={styles.eventActionButton}
                        >
                          Edit Event
                        </Button>
                        
                        <Button
                          mode="contained"
                          icon="share"
                          onPress={() => Alert.alert('Feature Coming Soon', 'Share functionality will be available soon')}
                          style={[styles.eventActionButton, { backgroundColor: COLORS.primary }]}
                        >
                          Share
                        </Button>
                      </View>
                    </View>
                  </>
                )}
              </Surface>
            </View>
          </BlurView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => Alert.alert('Feature Coming Soon', 'Event creation will be available soon')}
        label="Add Event"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: SPACING.xs,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeViewMode: {
    backgroundColor: '#fff',
  },
  viewModeText: {
    color: '#fff',
    fontWeight: '600',
  },
  activeViewModeText: {
    color: COLORS.primary,
  },
  calendarContainer: {
    margin: SPACING.md,
  },
  calendarHeader: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  monthTitle: {
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekDayText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textAlign: 'center',
    width: width / 7 - 4,
    color: COLORS.textSecondary,
  },
  calendarGrid: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.sm,
    elevation: 2,
  },
  dayCell: {
    width: width / 7 - 4,
    height: 80,
    padding: SPACING.xs,
    margin: 1,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  todayCell: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
  },
  emptyDay: {
    width: width / 7 - 4,
    height: 80,
  },
  dayNumber: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 14,
  },
  todayText: {
    color: COLORS.primary,
  },
  selectedDayText: {
    color: '#fff',
  },
  eventsContainer: {
    flex: 1,
    marginTop: SPACING.xs,
    gap: 2,
  },
  eventDot: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    minHeight: 14,
    justifyContent: 'center',
  },
  eventDotText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  moreEventsDot: {
    backgroundColor: COLORS.textSecondary,
    borderRadius: 4,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    minHeight: 14,
    justifyContent: 'center',
  },
  moreEventsText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Day View Styles
  dayView: {
    flex: 1,
    padding: SPACING.md,
  },
  dayViewTitle: {
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  dayEventCard: {
    marginBottom: SPACING.md,
  },
  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
  },
  eventCardContent: {
    padding: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  eventTypeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  eventTime: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
  },
  eventLocation: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
  },
  eventTypeChip: {
    height: 28,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  participantsLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginRight: SPACING.md,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  moreParticipants: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  moreParticipantsText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyDayState: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyDayTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    color: COLORS.text,
  },
  emptyDaySubtitle: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Stats Styles
  statsContainer: {
    margin: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginVertical: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    textAlign: 'center',
  },

  // Upcoming Events Styles
  upcomingSection: {
    margin: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  upcomingEventCard: {
    marginBottom: SPACING.sm,
  },
  upcomingEventSurface: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  eventColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  upcomingEventContent: {
    flex: 1,
  },
  upcomingEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  upcomingEventTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  upcomingEventDate: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  upcomingEventTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    elevation: 10,
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
    color: COLORS.text,
    flex: 1,
  },
  eventDetailContent: {
    padding: SPACING.lg,
  },
  eventDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  eventDetails: {
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.md,
    color: COLORS.text,
    flex: 1,
  },
  participantsSection: {
    marginBottom: SPACING.lg,
  },
  participantsSectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  participantsList: {
    gap: SPACING.md,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  participantName: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  eventActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  eventActionButton: {
    flex: 1,
    borderRadius: 12,
  },

  // FAB Styles
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    elevation: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default TeamCalendar;