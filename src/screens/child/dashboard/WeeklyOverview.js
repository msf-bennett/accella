import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  StatusBar,
  Animated,
  TouchableOpacity,
  Alert,
  Vibration,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Portal,
  ProgressChart,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/styles';

const { width: screenWidth } = Dimensions.get('window');

const WeeklyOverview = ({ navigation, route }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, -1 = last week, etc.
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));

  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const weeklyData = useSelector(state => state.overview.weekly || {});
  const loading = useSelector(state => state.overview.loading);

  // Get current week dates
  const getCurrentWeekDates = (weekOffset = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1 + (weekOffset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getCurrentWeekDates(selectedWeek);

  // Mock data for demonstration (replace with Redux store data)
  const mockWeeklyData = {
    totalSessions: 5,
    completedSessions: 4,
    totalPoints: 185,
    weeklyGoal: 200,
    streak: 7,
    improvements: ['Speed +12%', 'Endurance +8%', 'Technique +15%'],
    achievements: [
      { id: 1, name: 'Week Warrior', emoji: '⚔️', earned: true },
      { id: 2, name: 'Perfect Attendance', emoji: '🎯', earned: false },
      { id: 3, name: 'Skill Master', emoji: '🏆', earned: true },
    ],
    dailyActivities: {
      Monday: {
        date: weekDates[0],
        sessions: [
          {
            id: 1,
            title: '⚽ Soccer Skills',
            time: '16:00',
            duration: '60 min',
            status: 'completed',
            points: 35,
            rating: 4.5,
            coach: 'Coach Sarah',
          }
        ],
        mood: 'excellent',
        energy: 95,
        notes: 'Great dribbling practice today!',
      },
      Tuesday: {
        date: weekDates[1],
        sessions: [
          {
            id: 2,
            title: '🏃‍♂️ Speed Training',
            time: '15:30',
            duration: '45 min',
            status: 'completed',
            points: 40,
            rating: 4.8,
            coach: 'Coach Mike',
          }
        ],
        mood: 'good',
        energy: 88,
        notes: 'New personal best in sprints!',
      },
      Wednesday: {
        date: weekDates[2],
        sessions: [
          {
            id: 3,
            title: '🏀 Basketball',
            time: '17:00',
            duration: '90 min',
            status: 'completed',
            points: 45,
            rating: 4.2,
            coach: 'Coach Lisa',
          }
        ],
        mood: 'excellent',
        energy: 92,
        notes: 'Improved shooting accuracy!',
      },
      Thursday: {
        date: weekDates[3],
        sessions: [
          {
            id: 4,
            title: '🏊‍♂️ Swimming',
            time: '14:00',
            duration: '75 min',
            status: 'completed',
            points: 50,
            rating: 4.6,
            coach: 'Coach Alex',
          }
        ],
        mood: 'good',
        energy: 85,
        notes: 'Better breathing technique!',
      },
      Friday: {
        date: weekDates[4],
        sessions: [
          {
            id: 5,
            title: '⚽ Soccer Match',
            time: '16:30',
            duration: '90 min',
            status: 'upcoming',
            points: 0,
            coach: 'Coach Sarah',
          }
        ],
        mood: null,
        energy: null,
        notes: null,
      },
      Saturday: {
        date: weekDates[5],
        sessions: [],
        mood: null,
        energy: null,
        notes: null,
      },
      Sunday: {
        date: weekDates[6],
        sessions: [],
        mood: null,
        energy: null,
        notes: null,
      },
    }
  };

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, selectedWeek]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Week navigation
  const navigateWeek = (direction) => {
    Vibration.vibrate(30);
    setSelectedWeek(prev => prev + direction);
  };

  // Day press handler
  const handleDayPress = useCallback((day, dayData) => {
    if (dayData.sessions.length > 0 || dayData.mood) {
      Vibration.vibrate(30);
      setSelectedDay({ day, data: dayData });
      setShowDayDetails(true);
    }
  }, []);

  // Get mood emoji and color
  const getMoodInfo = (mood) => {
    const moods = {
      excellent: { emoji: '😄', color: '#4CAF50', text: 'Excellent' },
      good: { emoji: '😊', color: '#8BC34A', text: 'Good' },
      okay: { emoji: '😐', color: '#FF9800', text: 'Okay' },
      tired: { emoji: '😔', color: '#FF5722', text: 'Tired' },
      sick: { emoji: '🤒', color: '#F44336', text: 'Sick' },
    };
    return moods[mood] || { emoji: '❓', color: COLORS.textSecondary, text: 'Unknown' };
  };

  // Get day status
  const getDayStatus = (dayData) => {
    const today = new Date();
    const dayDate = dayData.Monday ? dayData.Monday.date : dayData.date;
    
    if (dayDate.toDateString() === today.toDateString()) {
      return 'today';
    } else if (dayDate < today) {
      return 'past';
    } else {
      return 'future';
    }
  };

  // Format week title
  const getWeekTitle = () => {
    if (selectedWeek === 0) return 'This Week';
    if (selectedWeek === -1) return 'Last Week';
    if (selectedWeek === 1) return 'Next Week';
    return selectedWeek < 0 ? `${Math.abs(selectedWeek)} Weeks Ago` : `${selectedWeek} Weeks Ahead`;
  };

  // Render weekly stats
  const renderWeeklyStats = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card style={styles.statsCard}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.statsGradient}
        >
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Weekly Progress 📈</Text>
            <Text style={styles.statsSubtitle}>Keep up the great work!</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockWeeklyData.completedSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
              <Text style={styles.statSubLabel}>Completed</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockWeeklyData.totalPoints}</Text>
              <Text style={styles.statLabel}>Points</Text>
              <Text style={styles.statSubLabel}>Earned</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockWeeklyData.streak}</Text>
              <Text style={styles.statLabel}>Day</Text>
              <Text style={styles.statSubLabel}>Streak 🔥</Text>
            </View>
          </View>
          
          <View style={styles.goalProgress}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalText}>Weekly Goal Progress</Text>
              <Text style={styles.goalPercentage}>
                {Math.round((mockWeeklyData.totalPoints / mockWeeklyData.weeklyGoal) * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={mockWeeklyData.totalPoints / mockWeeklyData.weeklyGoal}
              color="white"
              style={styles.goalProgressBar}
            />
            <Text style={styles.goalTarget}>
              {mockWeeklyData.totalPoints}/{mockWeeklyData.weeklyGoal} points
            </Text>
          </View>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  // Render achievements section
  const renderAchievements = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginTop: SPACING.medium,
      }}
    >
      <Card style={styles.achievementsCard}>
        <Card.Content style={styles.achievementsContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements 🏆</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Coming Soon! 🎯', 'Full achievements page is in development.')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {mockWeeklyData.achievements.map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  achievement.earned && styles.achievementEarned
                ]}
                onPress={() => {
                  Vibration.vibrate(30);
                  Alert.alert(
                    achievement.earned ? 'Achievement Unlocked! 🎉' : 'Achievement Locked 🔒',
                    `${achievement.emoji} ${achievement.name}`
                  );
                }}
              >
                <Text style={[
                  styles.achievementEmoji,
                  !achievement.earned && styles.achievementEmojiLocked
                ]}>
                  {achievement.emoji}
                </Text>
                <Text style={[
                  styles.achievementName,
                  !achievement.earned && styles.achievementNameLocked
                ]}>
                  {achievement.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // Render improvements section
  const renderImprovements = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginTop: SPACING.medium,
      }}
    >
      <Card style={styles.improvementsCard}>
        <Card.Content style={styles.improvementsContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Improvements 📊</Text>
          </View>
          
          <View style={styles.improvementsList}>
            {mockWeeklyData.improvements.map((improvement, index) => (
              <View key={index} style={styles.improvementItem}>
                <Icon name="trending-up" size={20} color={COLORS.success} />
                <Text style={styles.improvementText}>{improvement}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // Render weekly calendar
  const renderWeeklyCalendar = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginTop: SPACING.medium,
      }}
    >
      <Card style={styles.calendarCard}>
        <Card.Content style={styles.calendarContent}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() => navigateWeek(-1)}
              style={styles.weekNavButton}
            >
              <Icon name="chevron-left" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            
            <Text style={styles.weekTitle}>{getWeekTitle()}</Text>
            
            <TouchableOpacity
              onPress={() => navigateWeek(1)}
              style={styles.weekNavButton}
            >
              <Icon name="chevron-right" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.weekDays}>
            {Object.entries(mockWeeklyData.dailyActivities).map(([day, dayData], index) => {
              const hasActivity = dayData.sessions.length > 0;
              const isToday = weekDates[index]?.toDateString() === new Date().toDateString();
              const hasMood = dayData.mood;
              const moodInfo = hasMood ? getMoodInfo(dayData.mood) : null;
              
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayContainer,
                    isToday && styles.todayContainer,
                    hasActivity && styles.dayWithActivity,
                  ]}
                  onPress={() => handleDayPress(day, dayData)}
                  disabled={!hasActivity && !hasMood}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dayName,
                    isToday && styles.todayText,
                  ]}>
                    {day.slice(0, 3)}
                  </Text>
                  
                  <Text style={[
                    styles.dayDate,
                    isToday && styles.todayText,
                  ]}>
                    {weekDates[index]?.getDate()}
                  </Text>
                  
                  {hasActivity && (
                    <View style={styles.sessionIndicators}>
                      {dayData.sessions.map((session, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.sessionDot,
                            { backgroundColor: session.status === 'completed' ? COLORS.success : COLORS.primary }
                          ]}
                        />
                      ))}
                    </View>
                  )}
                  
                  {hasMood && (
                    <Text style={styles.moodEmoji}>{moodInfo.emoji}</Text>
                  )}
                  
                  {!hasActivity && !hasMood && (
                    <View style={styles.emptyDay}>
                      <Icon name="remove" size={16} color={COLORS.textSecondary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Weekly Overview 📅</Text>
          <Text style={styles.headerSubtitle}>
            Track your amazing journey!
          </Text>
        </View>
      </LinearGradient>
      
      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
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
        {/* Weekly Stats */}
        {renderWeeklyStats()}
        
        {/* Weekly Calendar */}
        {renderWeeklyCalendar()}
        
        {/* Achievements */}
        {renderAchievements()}
        
        {/* Improvements */}
        {renderImprovements()}
        
        {/* Bottom spacing */}
        <View style={{ height: SPACING.large * 2 }} />
      </ScrollView>
      
      {/* Day Details Modal */}
      <Portal>
        {showDayDetails && selectedDay && (
          <View style={styles.modalOverlay}>
            <BlurView
              style={styles.blurView}
              blurType="light"
              blurAmount={10}
            />
            <View style={styles.modalContent}>
              <Surface style={styles.modal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedDay.day} Details
                  </Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowDayDetails(false)}
                  />
                </View>
                
                <ScrollView style={styles.modalBody}>
                  {/* Date */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>
                      📅 {selectedDay.data.date?.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  
                  {/* Sessions */}
                  {selectedDay.data.sessions.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>🏃‍♂️ Training Sessions</Text>
                      {selectedDay.data.sessions.map((session) => (
                        <View key={session.id} style={styles.sessionCard}>
                          <View style={styles.sessionHeader}>
                            <Text style={styles.sessionTitle}>{session.title}</Text>
                            <Chip
                              style={[
                                styles.sessionStatusChip,
                                { backgroundColor: session.status === 'completed' ? COLORS.success + '20' : COLORS.primary + '20' }
                              ]}
                              textStyle={[
                                styles.sessionStatusText,
                                { color: session.status === 'completed' ? COLORS.success : COLORS.primary }
                              ]}
                              compact
                            >
                              {session.status === 'completed' ? 'Completed' : 'Upcoming'}
                            </Chip>
                          </View>
                          
                          <View style={styles.sessionDetails}>
                            <View style={styles.sessionDetail}>
                              <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                              <Text style={styles.sessionDetailText}>
                                {session.time} • {session.duration}
                              </Text>
                            </View>
                            
                            <View style={styles.sessionDetail}>
                              <Icon name="person" size={16} color={COLORS.textSecondary} />
                              <Text style={styles.sessionDetailText}>{session.coach}</Text>
                            </View>
                            
                            {session.status === 'completed' && (
                              <>
                                <View style={styles.sessionDetail}>
                                  <Icon name="stars" size={16} color="#FFD700" />
                                  <Text style={styles.sessionDetailText}>
                                    {session.points} points earned
                                  </Text>
                                </View>
                                
                                {session.rating && (
                                  <View style={styles.sessionDetail}>
                                    <Icon name="star" size={16} color="#FFD700" />
                                    <Text style={styles.sessionDetailText}>
                                      Rating: {session.rating}/5
                                    </Text>
                                  </View>
                                )}
                              </>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {/* Mood & Energy */}
                  {selectedDay.data.mood && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>😊 How You Felt</Text>
                      <View style={styles.moodEnergyContainer}>
                        <View style={styles.moodContainer}>
                          <Text style={styles.moodLabel}>Mood</Text>
                          <View style={styles.moodDisplay}>
                            <Text style={styles.moodDisplayEmoji}>
                              {getMoodInfo(selectedDay.data.mood).emoji}
                            </Text>
                            <Text style={styles.moodDisplayText}>
                              {getMoodInfo(selectedDay.data.mood).text}
                            </Text>
                          </View>
                        </View>
                        
                        {selectedDay.data.energy && (
                          <View style={styles.energyContainer}>
                            <Text style={styles.energyLabel}>Energy Level</Text>
                            <View style={styles.energyDisplay}>
                              <Text style={styles.energyValue}>{selectedDay.data.energy}%</Text>
                              <ProgressBar
                                progress={selectedDay.data.energy / 100}
                                color={COLORS.primary}
                                style={styles.energyBar}
                              />
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                  
                  {/* Notes */}
                  {selectedDay.data.notes && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>📝 Notes</Text>
                      <Text style={styles.notesText}>{selectedDay.data.notes}</Text>
                    </View>
                  )}
                </ScrollView>
              </Surface>
            </View>
          </View>
        )}
      </Portal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.large,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.large,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: 'white',
    marginBottom: SPACING.small,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.medium,
  },
  
  // Weekly Stats
  statsCard: {
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.large,
  },
  statsHeader: {
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  statsTitle: {
    ...TEXT_STYLES.title,
    color: 'white',
    marginBottom: SPACING.tiny,
  },
  statsSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.large,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TEXT_STYLES.title,
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginTop: SPACING.tiny,
  },
  statSubLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  goalProgress: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.medium,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  goalText: {
    ...TEXT_STYLES.body,
    color: 'white',
  },
  goalPercentage: {
    ...TEXT_STYLES.subtitle,
    color: 'white',
    fontWeight: 'bold',
  },
  goalProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: SPACING.small,
  },
  goalTarget: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  
  // Calendar
  calendarCard: {
    elevation: 3,
    borderRadius: 12,
  },
  calendarContent: {
    padding: SPACING.medium,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  weekNavButton: {
    padding: SPACING.small,
  },
  weekTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    alignItems: 'center',
    padding: SPACING.small,
    borderRadius: 12,
    minHeight: 80,
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: COLORS.background,
  },
  todayContainer: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dayWithActivity: {
    backgroundColor: 'white',
    elevation: 2,
  },
  dayName: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginBottom: SPACING.tiny,
  },
  todayText: {
    color: COLORS.primary,
  },
  dayDate: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.tiny,
  },
  sessionIndicators: {
    flexDirection: 'row',
    marginTop: SPACING.tiny,
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  moodEmoji: {
    fontSize: 16,
    marginTop: SPACING.tiny,
  },
  emptyDay: {
    marginTop: SPACING.small,
    opacity: 0.3,
  },
  
  // Achievements
  achievementsCard: {
    elevation: 3,
    borderRadius: 12,
  },
  achievementsContent: {
    padding: SPACING.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  seeAllText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  achievementsScroll: {
    paddingRight: SPACING.medium,
  },
  achievementItem: {
    alignItems: 'center',
    padding: SPACING.medium,
    borderRadius: 12,
    marginRight: SPACING.medium,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  achievementEarned: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '10',
  },
  achievementEmoji: {
    fontSize: 24,
    marginBottom: SPACING.tiny,
  },
  achievementEmojiLocked: {
    opacity: 0.3,
  },
  achievementName: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  achievementNameLocked: {
    color: COLORS.textSecondary,
    opacity: 0.6,
  },

  // Improvements
  improvementsCard: {
    elevation: 3,
    borderRadius: 12,
  },
  improvementsContent: {
    padding: SPACING.medium,
  },
  improvementsList: {
    gap: SPACING.small,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.small,
    backgroundColor: COLORS.success + '10',
    borderRadius: 8,
  },
  improvementText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.small,
    fontWeight: '500',
  },

  // Modal styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: screenWidth - SPACING.large * 2,
    maxHeight: '80%',
  },
  modal: {
    borderRadius: 16,
    elevation: 8,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  modalBody: {
    maxHeight: 400,
  },
  modalSection: {
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  modalSectionTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.medium,
  },

  // Session card in modal
  sessionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.medium,
    marginBottom: SPACING.small,
    elevation: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  sessionTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    flex: 1,
    marginRight: SPACING.small,
  },
  sessionStatusChip: {
    height: 28,
  },
  sessionStatusText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  sessionDetails: {
    gap: SPACING.small,
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
  },
  sessionDetailText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },

  // Mood and Energy in modal
  moodEnergyContainer: {
    flexDirection: 'row',
    gap: SPACING.large,
  },
  moodContainer: {
    flex: 1,
  },
  moodLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
    fontWeight: '600',
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.medium,
    borderRadius: 8,
  },
  moodDisplayEmoji: {
    fontSize: 20,
    marginRight: SPACING.small,
  },
  moodDisplayText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  energyContainer: {
    flex: 1,
  },
  energyLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
    fontWeight: '600',
  },
  energyDisplay: {
    backgroundColor: COLORS.surface,
    padding: SPACING.medium,
    borderRadius: 8,
  },
  energyValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  energyBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  notesText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    padding: SPACING.medium,
    borderRadius: 8,
    fontStyle: 'italic',
  },
};

export default WeeklyOverview;