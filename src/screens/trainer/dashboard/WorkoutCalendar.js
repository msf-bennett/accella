import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  FlatList,
  Vibration,
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
  Searchbar,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
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
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body1: { fontSize: 16, color: COLORS.text },
  body2: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WorkingCalendar = ({ navigation }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock session data
  const sessionsData = {
    '2024-08-20': [
      {
        id: '1',
        clientName: 'Sarah Johnson',
        clientAvatar: 'https://i.pravatar.cc/100?img=1',
        type: 'Personal Training',
        time: '09:00',
        duration: 60,
        status: 'confirmed',
        location: 'Gym Floor A',
      },
      {
        id: '2',
        clientName: 'Mike Chen',
        clientAvatar: 'https://i.pravatar.cc/100?img=3',
        type: 'Group Session',
        time: '11:30',
        duration: 45,
        status: 'confirmed',
        location: 'Studio B',
      },
    ],
    '2024-08-21': [
      {
        id: '3',
        clientName: 'Emma Davis',
        clientAvatar: 'https://i.pravatar.cc/100?img=5',
        type: 'Assessment',
        time: '14:00',
        duration: 30,
        status: 'pending',
        location: 'Assessment Room',
      },
    ],
    '2024-08-22': [
      {
        id: '4',
        clientName: 'Team Warriors',
        clientAvatar: 'https://i.pravatar.cc/100?img=8',
        type: 'Team Training',
        time: '16:00',
        duration: 90,
        status: 'confirmed',
        location: 'Field C',
      },
    ],
  };

  const workingHours = {
    start: '07:00',
    end: '20:00',
    breakStart: '12:00',
    breakEnd: '13:00',
  };

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getSessionsForDate = (date) => {
    const dateStr = formatDate(date);
    return sessionsData[dateStr] || [];
  };

  const getDaysInMonth = (date) => {
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
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const handleDatePress = (date) => {
    if (!date) return;
    
    Vibration.vibrate(30);
    setSelectedDate(date);
    
    const sessions = getSessionsForDate(date);
    if (sessions.length > 0) {
      setViewMode('day');
    }
  };

  const handleSessionPress = (session) => {
    Vibration.vibrate(50);
    setSelectedSession(session);
    setShowSessionModal(true);
  };

  const handleQuickAction = (action) => {
    Vibration.vibrate(30);
    Alert.alert(
      'Feature Coming Soon',
      `${action} feature is under development and will be available in the next update! 🚀`,
      [{ text: 'Got it!' }]
    );
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const renderCalendarHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.md,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
        <View>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
            Working Calendar 📅
          </Text>
          <Text style={[TEXT_STYLES.body2, { color: 'rgba(255,255,255,0.8)' }]}>
            Manage your training schedule
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon="today"
            size={24}
            iconColor="white"
            onPress={() => {
              setSelectedDate(new Date());
              setCurrentMonth(new Date());
            }}
          />
          <IconButton
            icon="add"
            size={24}
            iconColor="white"
            onPress={() => setShowAddModal(true)}
          />
        </View>
      </View>

      {/* View Mode Selector */}
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {['day', 'week', 'month'].map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => setViewMode(mode)}
            style={{
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              marginHorizontal: SPACING.xs,
              backgroundColor: viewMode === mode ? 'rgba(255,255,255,0.3)' : 'transparent',
              borderRadius: 20,
            }}
          >
            <Text style={{
              color: 'white',
              fontWeight: viewMode === mode ? 'bold' : 'normal',
              textTransform: 'capitalize',
            }}>
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );

  const renderMonthNavigation = () => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      backgroundColor: COLORS.surface,
      elevation: 2,
    }}>
      <IconButton
        icon="chevron-left"
        size={24}
        iconColor={COLORS.primary}
        onPress={() => navigateMonth(-1)}
      />
      <Text style={TEXT_STYLES.h3}>
        {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
      </Text>
      <IconButton
        icon="chevron-right"
        size={24}
        iconColor={COLORS.primary}
        onPress={() => navigateMonth(1)}
      />
    </View>
  );

  const renderDayCell = (date, isSmall = false) => {
    if (!date) {
      return <View style={{ flex: 1, height: isSmall ? 40 : 80 }} />;
    }

    const isToday = formatDate(date) === formatDate(new Date());
    const isSelected = formatDate(date) === formatDate(selectedDate);
    const sessions = getSessionsForDate(date);
    const hasEvents = sessions.length > 0;

    return (
      <TouchableOpacity
        onPress={() => handleDatePress(date)}
        style={{
          flex: 1,
          height: isSmall ? 40 : 80,
          margin: 1,
          backgroundColor: isSelected ? COLORS.primary : COLORS.surface,
          borderRadius: 8,
          padding: SPACING.xs,
          justifyContent: 'space-between',
          elevation: isSelected ? 3 : 1,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            color: isSelected ? 'white' : isToday ? COLORS.primary : COLORS.text,
            fontWeight: isToday ? 'bold' : 'normal',
            fontSize: isSmall ? 12 : 16,
          }}>
            {date.getDate()}
          </Text>
        </View>
        
        {!isSmall && hasEvents && (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {sessions.slice(0, 2).map((session, index) => (
              <View
                key={session.id}
                style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : getStatusColor(session.status),
                  borderRadius: 2,
                  padding: 2,
                  marginVertical: 1,
                }}
              >
                <Text style={{
                  color: isSelected ? 'white' : 'white',
                  fontSize: 8,
                  fontWeight: '500',
                }} numberOfLines={1}>
                  {session.time} {session.clientName}
                </Text>
              </View>
            ))}
            {sessions.length > 2 && (
              <Text style={{
                color: isSelected ? 'white' : COLORS.textSecondary,
                fontSize: 8,
                textAlign: 'center',
                marginTop: 2,
              }}>
                +{sessions.length - 2} more
              </Text>
            )}
          </View>
        )}

        {isSmall && hasEvents && (
          <View style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : COLORS.primary,
          }} />
        )}
      </TouchableOpacity>
    );
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentMonth);
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <View style={{ backgroundColor: COLORS.background }}>
        {/* Days of week header */}
        <View style={{ flexDirection: 'row', backgroundColor: COLORS.surface, paddingVertical: SPACING.sm }}>
          {DAYS.map((day) => (
            <View key={day} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={{ flexDirection: 'row' }}>
            {week.map((day, dayIndex) => (
              <View key={dayIndex} style={{ flex: 1 }}>
                {renderDayCell(day)}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(selectedDate);

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', backgroundColor: COLORS.background, minWidth: screenWidth }}>
          {weekDays.map((day, index) => (
            <View key={index} style={{ width: screenWidth / 7 }}>
              {renderDayCell(day, true)}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderDayView = () => {
    const sessions = getSessionsForDate(selectedDate);
    const hours = [];
    
    for (let i = 7; i <= 20; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }

    return (
      <ScrollView style={{ backgroundColor: COLORS.background }}>
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, textAlign: 'center' }]}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>

          {hours.map((hour) => {
            const hourSessions = sessions.filter(s => s.time === hour);
            
            return (
              <View key={hour} style={{ flexDirection: 'row', minHeight: 60, marginBottom: SPACING.sm }}>
                <View style={{ width: 60, alignItems: 'center', paddingTop: SPACING.sm }}>
                  <Text style={TEXT_STYLES.caption}>{hour}</Text>
                </View>
                
                <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: COLORS.textSecondary, paddingLeft: SPACING.md }}>
                  {hourSessions.map((session) => (
                    <TouchableOpacity
                      key={session.id}
                      onPress={() => handleSessionPress(session)}
                      style={{
                        backgroundColor: getStatusColor(session.status),
                        borderRadius: 8,
                        padding: SPACING.sm,
                        marginBottom: SPACING.xs,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar.Image
                          size={30}
                          source={{ uri: session.clientAvatar }}
                          style={{ marginRight: SPACING.sm }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={[TEXT_STYLES.body1, { color: 'white', fontWeight: 'bold' }]}>
                            {session.clientName}
                          </Text>
                          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                            {session.type} • {session.duration}min • {session.location}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                  
                  {hour >= workingHours.breakStart && hour < workingHours.breakEnd && (
                    <View style={{
                      backgroundColor: COLORS.warning,
                      borderRadius: 8,
                      padding: SPACING.sm,
                      opacity: 0.7,
                    }}>
                      <Text style={[TEXT_STYLES.body2, { color: 'white', textAlign: 'center' }]}>
                        🍽️ Lunch Break
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderSessionModal = () => (
    <Portal>
      <Modal
        visible={showSessionModal}
        onDismiss={() => setShowSessionModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.surface,
          margin: SPACING.md,
          borderRadius: 12,
          padding: SPACING.lg,
        }}
      >
        {selectedSession && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <Avatar.Image
                size={60}
                source={{ uri: selectedSession.clientAvatar }}
                style={{ marginRight: SPACING.md }}
              />
              <View style={{ flex: 1 }}>
                <Text style={TEXT_STYLES.h3}>{selectedSession.clientName}</Text>
                <Text style={TEXT_STYLES.body2}>{selectedSession.type}</Text>
                <Chip
                  style={{ backgroundColor: getStatusColor(selectedSession.status), marginTop: SPACING.xs }}
                  textStyle={{ color: 'white' }}
                >
                  {selectedSession.status.toUpperCase()}
                </Chip>
              </View>
            </View>

            <Divider style={{ marginVertical: SPACING.md }} />

            <View style={{ marginBottom: SPACING.md }}>
              <Text style={TEXT_STYLES.body1}>
                🕐 Time: {selectedSession.time} ({selectedSession.duration} minutes)
              </Text>
              <Text style={TEXT_STYLES.body1}>
                📍 Location: {selectedSession.location}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.lg }}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowSessionModal(false);
                  handleQuickAction('Edit Session');
                }}
                icon="edit"
              >
                Edit
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setShowSessionModal(false);
                  handleQuickAction('Start Session');
                }}
                buttonColor={COLORS.success}
                icon="play-arrow"
              >
                Start
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowSessionModal(false);
                  handleQuickAction('Cancel Session');
                }}
                textColor={COLORS.error}
                icon="cancel"
              >
                Cancel
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          flex: 1,
        }}
      >
        {renderCalendarHeader()}
        
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
          {viewMode === 'month' && renderMonthNavigation()}
          
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}

          {/* Stats Summary */}
          <Surface style={{
            margin: SPACING.md,
            padding: SPACING.md,
            borderRadius: 12,
            elevation: 3,
          }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              Today's Summary 📊
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                  {getSessionsForDate(selectedDate).length}
                </Text>
                <Text style={TEXT_STYLES.caption}>Sessions</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                  {getSessionsForDate(selectedDate).reduce((sum, s) => sum + s.duration, 0)}
                </Text>
                <Text style={TEXT_STYLES.caption}>Minutes</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>
                  ${getSessionsForDate(selectedDate).length * 75}
                </Text>
                <Text style={TEXT_STYLES.caption}>Revenue</Text>
              </View>
            </View>
          </Surface>

          <View style={{ height: 80 }} />
        </ScrollView>
      </Animated.View>

      {renderSessionModal()}

      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => handleQuickAction('Add New Session')}
      />
    </View>
  );
};

export default WorkingCalendar;
