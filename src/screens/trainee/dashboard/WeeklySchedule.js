import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Vibration,
  StatusBar,
  FlatList,
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
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_WIDTH = (SCREEN_WIDTH - (SPACING.lg * 2)) / 7;

const WeeklySchedule = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, schedule, isLoading } = useSelector(state => ({
    user: state.auth.user,
    schedule: state.schedule.weeklySchedule,
    isLoading: state.schedule.loading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [completedSessions, setCompletedSessions] = useState(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const weekScrollRef = useRef(null);
  const dayScrollRef = useRef(null);

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Date utilities
  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      week.push(currentDate);
    }
    return week;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isToday = (date) => {
    return isSameDay(date, new Date());
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
    Vibration.vibrate(50);
  };

  const selectSession = (session) => {
    setSelectedSession(session);
    setShowSessionModal(true);
    Vibration.vibrate(100);
  };

  const completeSession = (sessionId) => {
    setCompletedSessions(new Set([...completedSessions, sessionId]));
    setShowSessionModal(false);
    Vibration.vibrate([50, 100, 50]);
    
    dispatch({
      type: 'COMPLETE_SESSION',
      payload: { sessionId, completedAt: new Date().toISOString() }
    });
  };

  // Mock data - in real app this would come from Redux store
  const mockSchedule = {
    '2024-08-25': [
      {
        id: 1,
        title: 'Morning Cardio 🏃‍♂️',
        coach: 'Coach Sarah',
        time: '07:00',
        duration: 45,
        type: 'Cardio',
        status: 'scheduled',
        location: 'Track',
        intensity: 'Medium'
      }
    ],
    '2024-08-26': [
      {
        id: 2,
        title: 'Soccer Training ⚽',
        coach: 'Coach Martinez',
        time: '09:00',
        duration: 90,
        type: 'Technical',
        status: 'scheduled',
        location: 'Main Field',
        intensity: 'High'
      },
      {
        id: 3,
        title: 'Strength Training 💪',
        coach: 'Coach Mike',
        time: '16:00',
        duration: 60,
        type: 'Strength',
        status: 'scheduled',
        location: 'Gym A',
        intensity: 'High'
      }
    ],
    '2024-08-27': [
      {
        id: 4,
        title: 'Recovery Session 🧘‍♂️',
        coach: 'Coach Emma',
        time: '18:00',
        duration: 30,
        type: 'Recovery',
        status: 'scheduled',
        location: 'Studio',
        intensity: 'Low'
      }
    ],
    '2024-08-28': [
      {
        id: 5,
        title: 'Team Practice ⚽',
        coach: 'Coach Martinez',
        time: '14:00',
        duration: 120,
        type: 'Team',
        status: 'scheduled',
        location: 'Main Field',
        intensity: 'High'
      }
    ],
    '2024-08-29': [
      {
        id: 6,
        title: 'Personal Training 🎯',
        coach: 'Coach Sarah',
        time: '10:00',
        duration: 60,
        type: 'Personal',
        status: 'scheduled',
        location: 'Gym B',
        intensity: 'Medium'
      },
      {
        id: 7,
        title: 'Swimming 🏊‍♂️',
        coach: 'Coach Thompson',
        time: '17:00',
        duration: 75,
        type: 'Cardio',
        status: 'scheduled',
        location: 'Pool',
        intensity: 'Medium'
      }
    ],
    '2024-08-30': [
      {
        id: 8,
        title: 'Skills Workshop 🎪',
        coach: 'Coach Johnson',
        time: '11:00',
        duration: 90,
        type: 'Skills',
        status: 'scheduled',
        location: 'Indoor Court',
        intensity: 'Medium'
      }
    ],
    '2024-08-31': []
  };

  const currentSchedule = schedule || mockSchedule;
  const weekDates = getWeekDates(currentWeek);
  
  const getIntensityColor = (intensity) => {
    switch (intensity.toLowerCase()) {
      case 'low': return COLORS.success;
      case 'medium': return '#FFA726';
      case 'high': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'cardio': return 'directions-run';
      case 'strength': return 'fitness-center';
      case 'technical': return 'sports-soccer';
      case 'recovery': return 'spa';
      case 'team': return 'group';
      case 'personal': return 'person';
      case 'skills': return 'star';
      default: return 'sports';
    }
  };

  const getWeeklyStats = () => {
    let totalSessions = 0;
    let completedCount = 0;
    let totalDuration = 0;

    weekDates.forEach(date => {
      const dateKey = date.toISOString().split('T')[0];
      const daySessions = currentSchedule[dateKey] || [];
      totalSessions += daySessions.length;
      totalDuration += daySessions.reduce((sum, session) => sum + session.duration, 0);
      
      daySessions.forEach(session => {
        if (completedSessions.has(session.id)) {
          completedCount++;
        }
      });
    });

    return { totalSessions, completedCount, totalDuration };
  };

  const weeklyStats = getWeeklyStats();
  const weeklyProgress = weeklyStats.totalSessions > 0 ? 
    (weeklyStats.completedCount / weeklyStats.totalSessions) * 100 : 0;

  const renderDayHeader = (date, index) => {
    const isSelected = isSameDay(date, selectedDate);
    const isCurrentDay = isToday(date);
    const dateKey = date.toISOString().split('T')[0];
    const daySessions = currentSchedule[dateKey] || [];
    const dayCompleted = daySessions.length > 0 && 
      daySessions.every(session => completedSessions.has(session.id));

    return (
      <TouchableOpacity
        key={index}
        style={{
          width: DAY_WIDTH,
          alignItems: 'center',
          paddingVertical: SPACING.sm,
        }}
        onPress={() => {
          setSelectedDate(date);
          setViewMode('day');
          Vibration.vibrate(50);
        }}
      >
        <Text style={[
          TEXT_STYLES.caption, 
          { 
            color: isSelected ? COLORS.primary : COLORS.textSecondary,
            fontWeight: isCurrentDay ? 'bold' : 'normal'
          }
        ]}>
          {formatDay(date)}
        </Text>
        
        <Surface style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 4,
          backgroundColor: isSelected ? COLORS.primary : 
            isCurrentDay ? COLORS.primary + '20' : 'transparent',
          elevation: isSelected ? 2 : 0,
        }}>
          <Text style={[
            TEXT_STYLES.body,
            { 
              color: isSelected ? 'white' : 
                isCurrentDay ? COLORS.primary : COLORS.text,
              fontWeight: isCurrentDay ? 'bold' : 'normal'
            }
          ]}>
            {date.getDate()}
          </Text>
        </Surface>

        {/* Session indicators */}
        <View style={{
          flexDirection: 'row',
          marginTop: 4,
          justifyContent: 'center',
        }}>
          {daySessions.slice(0, 3).map((session, sessionIndex) => (
            <View
              key={sessionIndex}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: completedSessions.has(session.id) ? 
                  COLORS.success : getIntensityColor(session.intensity),
                marginHorizontal: 1,
              }}
            />
          ))}
          {daySessions.length > 3 && (
            <Text style={[TEXT_STYLES.caption, { fontSize: 10, color: COLORS.textSecondary }]}>
              +{daySessions.length - 3}
            </Text>
          )}
        </View>

        {dayCompleted && daySessions.length > 0 && (
          <MaterialIcons 
            name="check-circle" 
            size={16} 
            color={COLORS.success} 
            style={{ marginTop: 2 }}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderSessionCard = (session, index) => {
    const isCompleted = completedSessions.has(session.id);

    return (
      <Animated.View
        key={session.id}
        style={{
          opacity: fadeAnim,
          transform: [{ 
            translateY: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 50 + (index * 5)],
            })
          }],
          marginBottom: SPACING.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => selectSession(session)}
          activeOpacity={0.8}
        >
          <Card style={{
            marginHorizontal: SPACING.md,
            elevation: 2,
            opacity: isCompleted ? 0.8 : 1,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: SPACING.md,
            }}>
              <LinearGradient
                colors={isCompleted ? ['#4CAF50', '#45a049'] : ['#667eea', '#764ba2']}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <MaterialIcons 
                  name={isCompleted ? 'check' : getTypeIcon(session.type)} 
                  size={24} 
                  color="white" 
                />
              </LinearGradient>

              <View style={{ flex: 1 }}>
                <Text style={TEXT_STYLES.subtitle}>
                  {session.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {session.coach} • {session.location}
                </Text>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 4,
                }}>
                  <MaterialIcons name="access-time" size={14} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
                    {session.time} • {session.duration} min
                  </Text>
                  
                  <Chip
                    mode="outlined"
                    textStyle={{ fontSize: 10 }}
                    style={{
                      marginLeft: SPACING.sm,
                      backgroundColor: getIntensityColor(session.intensity) + '20',
                      borderColor: getIntensityColor(session.intensity),
                      height: 24,
                    }}
                  >
                    {session.intensity}
                  </Chip>
                </View>
              </View>

              <IconButton
                icon="chevron-right"
                size={20}
                iconColor={COLORS.textSecondary}
                onPress={() => selectSession(session)}
              />
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderWeekView = () => {
    return (
      <ScrollView
        ref={weekScrollRef}
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
        <View style={{ paddingBottom: 100 }}>
          {weekDates.map(date => {
            const dateKey = date.toISOString().split('T')[0];
            const daySessions = currentSchedule[dateKey] || [];
            
            if (daySessions.length === 0) return null;

            return (
              <View key={dateKey} style={{ marginBottom: SPACING.lg }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: SPACING.lg,
                  marginBottom: SPACING.sm,
                }}>
                  <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>
                    {formatDay(date)}, {formatDate(date)}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    {daySessions.length} session{daySessions.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                
                {daySessions.map((session, index) => 
                  renderSessionCard(session, index)
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderDayView = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const daySessions = currentSchedule[dateKey] || [];

    return (
      <ScrollView
        ref={dayScrollRef}
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
        <View style={{ padding: SPACING.lg, paddingBottom: 100 }}>
          <Text style={[TEXT_STYLES.h2, { marginBottom: SPACING.lg }]}>
            {formatDay(selectedDate)}, {formatDate(selectedDate)}
          </Text>
          
          {daySessions.length > 0 ? (
            daySessions.map((session, index) => renderSessionCard(session, index))
          ) : (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: SPACING.xl,
            }}>
              <MaterialIcons name="event-available" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
                No sessions scheduled
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' }]}>
                Enjoy your rest day or add a custom workout
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: SPACING.md,
        }}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
              Weekly Schedule 📅
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
              {currentWeek.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </Text>
          </View>
          <IconButton
            icon={viewMode === 'week' ? 'view-day' : 'view-week'}
            iconColor="white"
            size={24}
            onPress={() => {
              setViewMode(viewMode === 'week' ? 'day' : 'week');
              Vibration.vibrate(50);
            }}
          />
        </View>

        {/* Weekly Stats */}
        <Surface style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 12,
          padding: SPACING.md,
          marginBottom: SPACING.md,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.sm,
          }}>
            <Text style={[TEXT_STYLES.subtitle, { color: 'white' }]}>
              This Week's Progress
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
              {weeklyStats.completedCount}/{weeklyStats.totalSessions}
            </Text>
          </View>
          
          <ProgressBar
            progress={weeklyProgress / 100}
            color="white"
            style={{
              height: 6,
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: 3,
              marginBottom: SPACING.sm,
            }}
          />
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                {weeklyStats.totalDuration}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Total Minutes
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                {Math.round(weeklyProgress)}%
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Complete
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                {weekDates.filter(date => {
                  const dateKey = date.toISOString().split('T')[0];
                  return (currentSchedule[dateKey] || []).length > 0;
                }).length}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Active Days
              </Text>
            </View>
          </View>
        </Surface>

        {/* Week Navigation */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <IconButton
            icon="chevron-left"
            iconColor="white"
            size={24}
            onPress={() => navigateWeek(-1)}
          />
          
          <View style={{ flexDirection: 'row', flex: 1 }}>
            {weekDates.map((date, index) => renderDayHeader(date, index))}
          </View>
          
          <IconButton
            icon="chevron-right"
            iconColor="white"
            size={24}
            onPress={() => navigateWeek(1)}
          />
        </View>
      </LinearGradient>

      {/* Content */}
      {viewMode === 'week' ? renderWeekView() : renderDayView()}

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Alert.alert(
            '➕ Add Session',
            'Feature Coming Soon!',
            [{ text: 'OK' }]
          );
        }}
      />

      {/* Session Detail Modal */}
      <Portal>
        {showSessionModal && selectedSession && (
          <BlurView
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            blurType="light"
            blurAmount={10}
          >
            <Surface style={{
              margin: SPACING.lg,
              borderRadius: 16,
              elevation: 8,
              maxWidth: SCREEN_WIDTH - (SPACING.lg * 2),
            }}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={{
                  padding: SPACING.lg,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  alignItems: 'center',
                }}
              >
                <Avatar.Icon
                  size={60}
                  icon={getTypeIcon(selectedSession.type)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
                <Text style={[TEXT_STYLES.h2, { color: 'white', marginTop: SPACING.sm, textAlign: 'center' }]}>
                  {selectedSession.title}
                </Text>
                <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
                  {selectedSession.coach}
                </Text>
              </LinearGradient>
              
              <View style={{ padding: SPACING.lg }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: SPACING.md,
                }}>
                  <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="access-time" size={24} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 4 }]}>
                      Time
                    </Text>
                    <Text style={TEXT_STYLES.body}>
                      {selectedSession.time}
                    </Text>
                  </View>
                  
                  <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="timer" size={24} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 4 }]}>
                      Duration
                    </Text>
                    <Text style={TEXT_STYLES.body}>
                      {selectedSession.duration} min
                    </Text>
                  </View>
                  
                  <View style={{ alignItems: 'center' }}>
                    <MaterialIcons name="location-on" size={24} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 4 }]}>
                      Location
                    </Text>
                    <Text style={TEXT_STYLES.body}>
                      {selectedSession.location}
                    </Text>
                  </View>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginBottom: SPACING.lg,
                }}>
                  <Chip
                    mode="outlined"
                    style={{
                      backgroundColor: getIntensityColor(selectedSession.intensity) + '20',
                      borderColor: getIntensityColor(selectedSession.intensity),
                    }}
                  >
                    {selectedSession.intensity} Intensity
                  </Chip>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowSessionModal(false)}
                    style={{ flex: 1, marginRight: SPACING.sm }}
                  >
                    Close
                  </Button>
                  
                  {!completedSessions.has(selectedSession.id) ? (
                    <Button
                      mode="contained"
                      onPress={() => completeSession(selectedSession.id)}
                      buttonColor={COLORS.success}
                      style={{ flex: 1, marginLeft: SPACING.sm }}
                    >
                      Mark Complete
                    </Button>
                  ) : (
                    <Button
                      mode="contained"
                      disabled
                      style={{ flex: 1, marginLeft: SPACING.sm }}
                    >
                      ✅ Completed
                    </Button>
                  )}
                </View>
              </View>
            </Surface>
          </BlurView>
        )}
      </Portal>
    </View>
  );
};

export default WeeklySchedule;