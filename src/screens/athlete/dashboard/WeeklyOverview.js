import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  Vibration,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  cardShadow: 'rgba(0,0,0,0.1)',
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
  bodySmall: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const WeeklyOverviewScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, weeklyData, trainingPlan, achievements } = useSelector(state => ({
    user: state.auth.user,
    weeklyData: state.training.weeklyOverview,
    trainingPlan: state.training.currentPlan,
    achievements: state.gamification.achievements,
  }));

  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [weekOffset, setWeekOffset] = useState(0);
  const [showStats, setShowStats] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});

  // Animation References
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Get current week dates
  const getCurrentWeekDates = useCallback(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1 + (weekOffset * 7));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      week.push(day);
    }
    return week;
  }, [weekOffset]);

  const weekDates = getCurrentWeekDates();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Mock data for demonstration
  const mockWeeklyData = {
    completedSessions: 4,
    totalSessions: 6,
    totalMinutes: 320,
    calories: 1250,
    streak: 12,
    weeklyGoal: 360,
    performanceScore: 87,
    improvements: [
      { metric: 'Endurance', change: '+12%', trend: 'up' },
      { metric: 'Strength', change: '+8%', trend: 'up' },
      { metric: 'Speed', change: '+5%', trend: 'up' },
    ],
    dailySessions: [
      { 
        day: 0, 
        sessions: [
          { id: 1, name: 'Morning Cardio', time: '07:00', duration: 45, type: 'cardio', completed: true },
          { id: 2, name: 'Strength Training', time: '18:00', duration: 60, type: 'strength', completed: true }
        ]
      },
      { 
        day: 1, 
        sessions: [
          { id: 3, name: 'Speed Work', time: '17:00', duration: 50, type: 'speed', completed: true }
        ]
      },
      { 
        day: 2, 
        sessions: [
          { id: 4, name: 'Recovery Run', time: '07:30', duration: 30, type: 'recovery', completed: true }
        ]
      },
      { 
        day: 3, 
        sessions: [
          { id: 5, name: 'Technique Training', time: '18:30', duration: 75, type: 'technique', completed: false }
        ]
      },
      { 
        day: 4, 
        sessions: [
          { id: 6, name: 'Match Preparation', time: '16:00', duration: 90, type: 'match-prep', completed: false }
        ]
      },
      { day: 5, sessions: [] },
      { day: 6, sessions: [] }
    ]
  };

  const mockAchievements = [
    { id: 1, title: 'Week Warrior', description: '4 sessions this week', icon: '🏆', unlocked: true },
    { id: 2, title: 'Early Bird', description: 'Morning training streak', icon: '🌅', unlocked: true },
    { id: 3, title: 'Consistency King', description: '12-day streak', icon: '🔥', unlocked: true },
  ];

  // Animation Effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Dispatch refresh actions
    console.log('Refreshing weekly overview data...');
    Alert.alert('Data Updated', 'Your weekly overview has been refreshed! 📊', [
      { text: 'Great!', style: 'default' }
    ]);
    setRefreshing(false);
  }, []);

  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
    Vibration.vibrate(30);
  };

  const getSessionTypeIcon = (type) => {
    const icons = {
      cardio: 'favorite',
      strength: 'fitness-center',
      speed: 'speed',
      recovery: 'self-improvement',
      technique: 'sports',
      'match-prep': 'sports-soccer',
    };
    return icons[type] || 'fitness-center';
  };

  const getSessionTypeColor = (type) => {
    const colors = {
      cardio: COLORS.error,
      strength: COLORS.primary,
      speed: COLORS.warning,
      recovery: COLORS.success,
      technique: COLORS.secondary,
      'match-prep': '#9C27B0',
    };
    return colors[type] || COLORS.primary;
  };

  const WeekNavigation = () => (
    <Surface style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      marginHorizontal: SPACING.md,
      borderRadius: 12,
      marginBottom: SPACING.md,
      elevation: 2,
    }}>
      <IconButton
        icon="chevron-left"
        size={24}
        onPress={() => setWeekOffset(prev => prev - 1)}
      />
      <Text style={[TEXT_STYLES.h3]}>
        {weekOffset === 0 ? 'This Week' : 
         weekOffset === -1 ? 'Last Week' : 
         weekOffset === 1 ? 'Next Week' : 
         `${Math.abs(weekOffset)} weeks ${weekOffset > 0 ? 'ahead' : 'ago'}`}
      </Text>
      <IconButton
        icon="chevron-right"
        size={24}
        onPress={() => setWeekOffset(prev => prev + 1)}
        disabled={weekOffset >= 2}
      />
    </Surface>
  );

  const WeeklyStatsCard = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <Card style={{
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        borderRadius: 16,
        elevation: 4,
      }}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={{
            borderRadius: 16,
            padding: SPACING.lg,
          }}
        >
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.md,
          }}>
            <Text style={[TEXT_STYLES.h2, { color: '#ffffff' }]}>
              Weekly Progress 📊
            </Text>
            <TouchableOpacity
              onPress={() => setShowStats(!showStats)}
              style={{
                padding: SPACING.sm,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Icon 
                name={showStats ? 'expand-less' : 'expand-more'} 
                size={20} 
                color="#ffffff" 
              />
            </TouchableOpacity>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: SPACING.lg,
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h1, { color: '#ffffff' }]}>
                {mockWeeklyData.completedSessions}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Completed
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h1, { color: '#ffffff' }]}>
                {mockWeeklyData.totalMinutes}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Minutes
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h1, { color: '#ffffff' }]}>
                {mockWeeklyData.streak}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Day Streak
              </Text>
            </View>
          </View>

          <View style={{ marginBottom: SPACING.md }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: SPACING.sm,
            }}>
              <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)' }]}>
                Weekly Goal Progress
              </Text>
              <Text style={[TEXT_STYLES.bodySmall, { color: '#ffffff' }]}>
                {mockWeeklyData.totalMinutes}/{mockWeeklyData.weeklyGoal} min
              </Text>
            </View>
            <ProgressBar
              progress={mockWeeklyData.totalMinutes / mockWeeklyData.weeklyGoal}
              color="#ffffff"
              style={{ height: 8, borderRadius: 4 }}
            />
          </View>

          {showStats && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: SPACING.md,
              }}
            >
              <Text style={[TEXT_STYLES.body, { color: '#ffffff', marginBottom: SPACING.sm }]}>
                Performance Score: {mockWeeklyData.performanceScore}% 🎯
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                {mockWeeklyData.improvements.map((item, index) => (
                  <View key={index} style={{ alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                      {item.metric}
                    </Text>
                    <Text style={[TEXT_STYLES.bodySmall, { 
                      color: item.trend === 'up' ? '#4CAF50' : '#FF5722',
                      fontWeight: '600'
                    }]}>
                      {item.change} {item.trend === 'up' ? '↗️' : '↘️'}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const DayCard = ({ dayIndex, date, sessions }) => {
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDay === dayIndex;
    const completedCount = sessions.filter(s => s.completed).length;
    const totalCount = sessions.length;
    const isExpanded = expandedCards[`day-${dayIndex}`];

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedDay(dayIndex);
          toggleCardExpansion(`day-${dayIndex}`);
        }}
        activeOpacity={0.8}
      >
        <Card style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          borderRadius: 12,
          borderWidth: isToday ? 2 : 0,
          borderColor: isToday ? COLORS.primary : 'transparent',
          elevation: isSelected ? 6 : 2,
        }}>
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.sm,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { 
                  color: isToday ? COLORS.primary : COLORS.text 
                }]}>
                  {dayNames[dayIndex]}
                </Text>
                {isToday && (
                  <Chip
                    mode="flat"
                    style={{ 
                      marginLeft: SPACING.sm,
                      backgroundColor: COLORS.primary,
                      height: 24,
                    }}
                    textStyle={{ color: '#ffffff', fontSize: 10 }}
                  >
                    TODAY
                  </Chip>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {totalCount > 0 && (
                  <Chip
                    mode="outlined"
                    style={{ marginRight: SPACING.sm, height: 28 }}
                    textStyle={{ fontSize: 12 }}
                  >
                    {completedCount}/{totalCount}
                  </Chip>
                )}
                <Text style={[TEXT_STYLES.bodySmall, { 
                  color: COLORS.textSecondary 
                }]}>
                  {date.getDate()}
                </Text>
              </View>
            </View>

            {totalCount === 0 ? (
              <View style={{
                paddingVertical: SPACING.lg,
                alignItems: 'center',
                opacity: 0.6,
              }}>
                <Icon name="free-breakfast" size={32} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.bodySmall, { marginTop: SPACING.sm }]}>
                  Rest Day 😴
                </Text>
              </View>
            ) : (
              <>
                <ProgressBar
                  progress={completedCount / totalCount}
                  color={COLORS.success}
                  style={{ 
                    height: 6, 
                    borderRadius: 3, 
                    marginBottom: SPACING.md,
                    backgroundColor: COLORS.border,
                  }}
                />

                {sessions.slice(0, isExpanded ? sessions.length : 2).map((session, index) => (
                  <TouchableOpacity
                    key={session.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: SPACING.sm,
                      paddingHorizontal: SPACING.sm,
                      marginBottom: SPACING.xs,
                      backgroundColor: session.completed ? 
                        'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                      borderRadius: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: getSessionTypeColor(session.type),
                    }}
                    onPress={() => Alert.alert(
                      session.name,
                      `${session.time} • ${session.duration} min\n${session.completed ? 'Completed ✅' : 'Upcoming ⏰'}`,
                      [
                        { text: 'View Details', onPress: () => console.log('Navigate to session') },
                        { text: 'OK', style: 'cancel' }
                      ]
                    )}
                  >
                    <Icon
                      name={getSessionTypeIcon(session.type)}
                      size={20}
                      color={getSessionTypeColor(session.type)}
                      style={{ marginRight: SPACING.sm }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[TEXT_STYLES.bodySmall, {
                        fontWeight: '500',
                        textDecorationLine: session.completed ? 'line-through' : 'none',
                      }]}>
                        {session.name}
                      </Text>
                      <Text style={[TEXT_STYLES.caption]}>
                        {session.time} • {session.duration}min
                      </Text>
                    </View>
                    <Icon
                      name={session.completed ? 'check-circle' : 'schedule'}
                      size={20}
                      color={session.completed ? COLORS.success : COLORS.warning}
                    />
                  </TouchableOpacity>
                ))}

                {sessions.length > 2 && (
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      paddingVertical: SPACING.sm,
                    }}
                    onPress={() => toggleCardExpansion(`day-${dayIndex}`)}
                  >
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                      {isExpanded ? 'Show Less' : `+${sessions.length - 2} more sessions`}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const AchievementsCard = () => (
    <Card style={{
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.md,
      borderRadius: 12,
      elevation: 2,
    }}>
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: SPACING.md,
        }}>
          <Text style={[TEXT_STYLES.h3]}>Weekly Achievements 🏆</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Achievements')}
          >
            <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: SPACING.md }}
        >
          {mockAchievements.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={{
                alignItems: 'center',
                marginRight: SPACING.md,
                padding: SPACING.md,
                backgroundColor: achievement.unlocked ? COLORS.background : 'rgba(0,0,0,0.05)',
                borderRadius: 12,
                minWidth: 100,
                opacity: achievement.unlocked ? 1 : 0.6,
              }}
              onPress={() => {
                Vibration.vibrate(50);
                Alert.alert(
                  achievement.title,
                  achievement.description + (achievement.unlocked ? ' 🎉' : ' (Keep going!)'),
                  [{ text: 'Awesome!', style: 'default' }]
                );
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: SPACING.xs }}>
                {achievement.icon}
              </Text>
              <Text style={[TEXT_STYLES.caption, { 
                textAlign: 'center',
                fontWeight: '500',
              }]}>
                {achievement.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, { 
                textAlign: 'center',
                fontSize: 10,
                marginTop: SPACING.xs,
              }]} numberOfLines={2}>
                {achievement.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.sm,
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.md,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: '#ffffff' }]}>
              Weekly Overview 📅
            </Text>
            <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)' }]}>
              Track your progress and stay motivated! 💪
            </Text>
          </View>
          <Avatar.Text
            size={50}
            label={user?.name?.[0] || 'A'}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
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
        <View style={{ paddingTop: SPACING.md }}>
          <WeekNavigation />
          <WeeklyStatsCard />
          <AchievementsCard />

          {/* Daily Sessions */}
          <Text style={[TEXT_STYLES.h2, { 
            marginHorizontal: SPACING.md,
            marginBottom: SPACING.md,
            marginTop: SPACING.sm,
          }]}>
            Daily Schedule 📋
          </Text>

          {mockWeeklyData.dailySessions.map((day) => (
            <DayCard
              key={day.day}
              dayIndex={day.day}
              date={weekDates[day.day]}
              sessions={day.sessions}
            />
          ))}

          {/* Bottom spacing for FAB */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

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
            'Quick Actions',
            'What would you like to do?',
            [
              { text: 'Log Workout', onPress: () => console.log('Log workout') },
              { text: 'View Calendar', onPress: () => navigation.navigate('Calendar') },
              { text: 'Contact Coach', onPress: () => navigation.navigate('TeamChat') },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }}
      />
    </View>
  );
};

export default WeeklyOverviewScreen;