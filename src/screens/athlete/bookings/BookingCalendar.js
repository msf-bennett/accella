import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Vibration,
  StatusBar,
  Dimensions,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import constants (these would be defined in your constants file)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
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
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const BookingCalendar = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { bookings, loading } = useSelector(state => state.bookings);

  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar', 'list'
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample data (replace with Redux data)
  const [sessions] = useState([
    {
      id: 1,
      title: 'Football Training',
      coach: 'Coach Johnson',
      date: new Date(2024, 11, 25, 16, 0),
      duration: 90,
      location: 'Main Stadium',
      type: 'training',
      status: 'confirmed',
      price: 50,
      participants: 12,
      maxParticipants: 20,
      description: 'Advanced football training focusing on ball control and team tactics.',
      coachAvatar: 'https://via.placeholder.com/100',
    },
    {
      id: 2,
      title: 'Fitness Session',
      coach: 'Trainer Sarah',
      date: new Date(2024, 11, 26, 18, 30),
      duration: 60,
      location: 'Gym A',
      type: 'fitness',
      status: 'pending',
      price: 35,
      participants: 8,
      maxParticipants: 15,
      description: 'High-intensity interval training for improved endurance.',
      coachAvatar: 'https://via.placeholder.com/100',
    },
    {
      id: 3,
      title: 'Basketball Skills',
      coach: 'Coach Mike',
      date: new Date(2024, 11, 27, 17, 0),
      duration: 75,
      location: 'Court 1',
      type: 'skills',
      status: 'confirmed',
      price: 45,
      participants: 6,
      maxParticipants: 10,
      description: 'Individual basketball skills development session.',
      coachAvatar: 'https://via.placeholder.com/100',
    },
  ]);

  // Component mount animation
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
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch refresh action
      // await dispatch(refreshBookings());
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh bookings');
    }
    setRefreshing(false);
  }, [dispatch]);

  // Calendar generation
  const generateCalendarDays = () => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(start);
    startDate.setDate(start.getDate() - start.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const sessionsOnDay = sessions.filter(session => 
        session.date.toDateString() === current.toDateString()
      );

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === currentMonth.getMonth(),
        isToday: current.toDateString() === new Date().toDateString(),
        isSelected: current.toDateString() === selectedDate.toDateString(),
        sessions: sessionsOnDay,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Get sessions for selected date
  const getSessionsForDate = (date) => {
    return sessions.filter(session => 
      session.date.toDateString() === date.toDateString()
    );
  };

  const selectedDateSessions = getSessionsForDate(selectedDate);

  // Session status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  // Handle session selection
  const handleSessionSelect = (session) => {
    Vibration.vibrate(10);
    setSelectedSession(session);
    setShowSessionModal(true);
  };

  // Handle booking action
  const handleBookingAction = (action, session) => {
    Vibration.vibrate(20);
    
    Alert.alert(
      `${action} Session`,
      `Are you sure you want to ${action.toLowerCase()} "${session.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // Dispatch booking action
            Alert.alert('Success', `Session ${action.toLowerCase()}ed successfully!`);
            setShowSessionModal(false);
          },
        },
      ]
    );
  };

  // Header component
  const CalendarHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.lg,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
          My Bookings 📅
        </Text>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SPACING.sm,
            }}
          >
            <Icon 
              name={viewMode === 'calendar' ? 'view-list' : 'calendar-today'} 
              size={24} 
              color={COLORS.white} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  // Calendar view component
  const CalendarView = () => (
    <Card style={{ margin: SPACING.md, elevation: 4 }}>
      {/* Month navigation */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      }}>
        <IconButton
          icon="chevron-left"
          size={24}
          onPress={() => {
            const newMonth = new Date(currentMonth);
            newMonth.setMonth(currentMonth.getMonth() - 1);
            setCurrentMonth(newMonth);
          }}
        />
        
        <Text style={[TEXT_STYLES.h3]}>
          {currentMonth.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </Text>
        
        <IconButton
          icon="chevron-right"
          size={24}
          onPress={() => {
            const newMonth = new Date(currentMonth);
            newMonth.setMonth(currentMonth.getMonth() + 1);
            setCurrentMonth(newMonth);
          }}
        />
      </View>

      {/* Week days */}
      <View style={{
        flexDirection: 'row',
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.background,
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <View key={day} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              if (day.isCurrentMonth) {
                setSelectedDate(day.date);
                Vibration.vibrate(10);
              }
            }}
            style={{
              width: width / 7 - 4,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: day.isSelected ? COLORS.primary : 
                            day.isToday ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              opacity: day.isCurrentMonth ? 1 : 0.3,
              borderRadius: day.isSelected ? 8 : 0,
            }}
          >
            <Text style={[
              TEXT_STYLES.body,
              {
                color: day.isSelected ? COLORS.white : 
                      day.isToday ? COLORS.primary : COLORS.text,
                fontWeight: day.isToday || day.isSelected ? '600' : 'normal',
              }
            ]}>
              {day.date.getDate()}
            </Text>
            
            {day.sessions.length > 0 && (
              <View style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: day.isSelected ? COLORS.white : COLORS.primary,
                marginTop: 2,
              }} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  // Session card component
  const SessionCard = ({ session, onPress }) => (
    <TouchableOpacity onPress={() => onPress(session)}>
      <Card style={{
        margin: SPACING.sm,
        marginHorizontal: SPACING.md,
        elevation: 2,
      }}>
        <View style={{
          flexDirection: 'row',
          padding: SPACING.md,
        }}>
          <Avatar.Image
            size={50}
            source={{ uri: session.coachAvatar }}
            style={{ marginRight: SPACING.md }}
          />
          
          <View style={{ flex: 1 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: SPACING.xs,
            }}>
              <Text style={[TEXT_STYLES.h3, { flex: 1 }]} numberOfLines={1}>
                {session.title}
              </Text>
              
              <Chip
                mode="outlined"
                compact
                textStyle={{ fontSize: 10 }}
                style={{
                  backgroundColor: getStatusColor(session.status) + '20',
                  borderColor: getStatusColor(session.status),
                }}
              >
                {session.status}
              </Chip>
            </View>
            
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.xs }]}>
              with {session.coach}
            </Text>
            
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: SPACING.xs,
            }}>
              <Icon name="access-time" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                {session.date.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })} • {session.duration} min
              </Text>
            </View>
            
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="location-on" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                  {session.location}
                </Text>
              </View>
              
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                ${session.price}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  // Session modal component
  const SessionModal = () => (
    <Portal>
      <Modal
        visible={showSessionModal}
        onDismiss={() => setShowSessionModal(false)}
        contentContainerStyle={{
          margin: SPACING.lg,
        }}
      >
        <BlurView intensity={100} style={{ borderRadius: 12 }}>
          <Card style={{ elevation: 8 }}>
            {selectedSession && (
              <>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={{
                    padding: SPACING.lg,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  }}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: SPACING.md,
                  }}>
                    <Avatar.Image
                      size={60}
                      source={{ uri: selectedSession.coachAvatar }}
                      style={{ marginRight: SPACING.md }}
                    />
                    
                    <View style={{ flex: 1 }}>
                      <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
                        {selectedSession.title}
                      </Text>
                      <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
                        with {selectedSession.coach}
                      </Text>
                    </View>
                    
                    <IconButton
                      icon="close"
                      size={24}
                      iconColor={COLORS.white}
                      onPress={() => setShowSessionModal(false)}
                    />
                  </View>
                  
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
                        Date & Time
                      </Text>
                      <Text style={[TEXT_STYLES.body, { color: COLORS.white, fontWeight: '600' }]}>
                        {selectedSession.date.toLocaleDateString()}
                      </Text>
                      <Text style={[TEXT_STYLES.body, { color: COLORS.white, fontWeight: '600' }]}>
                        {selectedSession.date.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </Text>
                    </View>
                    
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
                        Duration
                      </Text>
                      <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
                        {selectedSession.duration} min
                      </Text>
                    </View>
                    
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
                        Price
                      </Text>
                      <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
                        ${selectedSession.price}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
                
                <View style={{ padding: SPACING.lg }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: SPACING.md,
                  }}>
                    <Icon name="location-on" size={20} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                      {selectedSession.location}
                    </Text>
                  </View>
                  
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: SPACING.md,
                  }}>
                    <Icon name="group" size={20} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                      {selectedSession.participants}/{selectedSession.maxParticipants} participants
                    </Text>
                  </View>
                  
                  <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg }]}>
                    {selectedSession.description}
                  </Text>
                  
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                    {selectedSession.status === 'confirmed' ? (
                      <>
                        <Button
                          mode="outlined"
                          onPress={() => handleBookingAction('Reschedule', selectedSession)}
                          style={{ flex: 1, marginRight: SPACING.sm }}
                          icon="schedule"
                        >
                          Reschedule
                        </Button>
                        <Button
                          mode="contained"
                          onPress={() => handleBookingAction('Cancel', selectedSession)}
                          style={{ flex: 1, marginLeft: SPACING.sm }}
                          buttonColor={COLORS.error}
                          icon="cancel"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : selectedSession.status === 'pending' ? (
                      <Button
                        mode="contained"
                        onPress={() => handleBookingAction('Confirm', selectedSession)}
                        style={{ flex: 1 }}
                        buttonColor={COLORS.success}
                        icon="check"
                      >
                        Confirm Booking
                      </Button>
                    ) : (
                      <Button
                        mode="contained"
                        onPress={() => handleBookingAction('Rebook', selectedSession)}
                        style={{ flex: 1 }}
                        buttonColor={COLORS.primary}
                        icon="refresh"
                      >
                        Book Again
                      </Button>
                    )}
                  </View>
                </View>
              </>
            )}
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      
      <CalendarHeader />
      
      <Animated.View style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.white}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Search bar */}
          <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
            <Searchbar
              placeholder="Search sessions..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ elevation: 2 }}
              iconColor={COLORS.primary}
            />
          </View>

          {viewMode === 'calendar' ? (
            <>
              <CalendarView />
              
              {/* Selected date sessions */}
              <View style={{ marginTop: SPACING.md }}>
                <Text style={[
                  TEXT_STYLES.h3,
                  {
                    marginHorizontal: SPACING.md,
                    marginBottom: SPACING.md,
                  }
                ]}>
                  Sessions for {selectedDate.toLocaleDateString()} 🏃‍♂️
                </Text>
                
                {selectedDateSessions.length > 0 ? (
                  selectedDateSessions.map(session => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onPress={handleSessionSelect}
                    />
                  ))
                ) : (
                  <Card style={{
                    margin: SPACING.md,
                    padding: SPACING.xl,
                    alignItems: 'center',
                    elevation: 2,
                  }}>
                    <Icon name="event-busy" size={48} color={COLORS.textSecondary} />
                    <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.md }]}>
                      No sessions scheduled for this date
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
                      Check other dates or book a new session
                    </Text>
                  </Card>
                )}
              </View>
            </>
          ) : (
            // List view
            <View style={{ marginTop: SPACING.md }}>
              <Text style={[
                TEXT_STYLES.h3,
                {
                  marginHorizontal: SPACING.md,
                  marginBottom: SPACING.md,
                }
              ]}>
                All Sessions 📋
              </Text>
              
              {sessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onPress={handleSessionSelect}
                />
              ))}
            </View>
          )}
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* FAB for new booking */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          bottom: SPACING.lg,
          right: SPACING.lg,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Vibration.vibrate(10);
          navigation.navigate('FindCoaches');
        }}
      />

      <SessionModal />
    </View>
  );
};

export default BookingCalendar;