import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';

const { width, height } = Dimensions.get('window');

const AthleteDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [athleteData, setAthleteData] = useState({
    name: 'Alex Johnson',
    sport: 'Football',
    level: 'Intermediate',
    streak: 12,
    weeklyGoal: 5,
    completedSessions: 3,
    nextSession: 'Speed & Agility',
    nextSessionTime: '4:30 PM',
    coach: 'Coach Martinez',
    team: 'Lightning FC U18',
  });

  const [todaysStats] = useState({
    caloriesBurned: 420,
    trainingTime: 75,
    heartRateAvg: 145,
    hydrationGoal: 2.5,
    hydrationCurrent: 1.8,
  });

  const [upcomingSchedule] = useState([
    {
      id: 1,
      type: 'Training',
      title: 'Speed & Agility',
      time: '4:30 PM',
      duration: '90 min',
      location: 'Main Field',
      coach: 'Coach Martinez',
    },
    {
      id: 2,
      type: 'Recovery',
      title: 'Recovery Session',
      time: 'Tomorrow 10:00 AM',
      duration: '60 min',
      location: 'Gym',
      coach: 'Recovery Specialist',
    },
    {
      id: 3,
      type: 'Match',
      title: 'League Match vs Rangers',
      time: 'Saturday 2:00 PM',
      duration: '90 min',
      location: 'City Stadium',
      coach: 'Coach Martinez',
    },
  ]);

  const [recentAchievements] = useState([
    {
      id: 1,
      title: '12-Day Training Streak!',
      description: 'Completed training for 12 consecutive days',
      icon: 'local-fire-department',
      color: '#FF6B35',
      date: 'Today',
    },
    {
      id: 2,
      title: 'Personal Best: 40m Sprint',
      description: 'New record: 5.2 seconds',
      icon: 'timer',
      color: '#4CAF50',
      date: 'Yesterday',
    },
    {
      id: 3,
      title: 'Strength Milestone',
      description: 'Increased squat by 10kg',
      icon: 'fitness-center',
      color: '#2196F3',
      date: '2 days ago',
    },
  ]);

  const [weeklyProgress] = useState([
    { day: 'M', completed: true, type: 'strength' },
    { day: 'T', completed: true, type: 'cardio' },
    { day: 'W', completed: true, type: 'skills' },
    { day: 'T', completed: false, type: 'recovery' },
    { day: 'F', completed: false, type: 'strength' },
    { day: 'S', completed: false, type: 'match' },
    { day: 'S', completed: false, type: 'rest' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Dashboard updated!');
    }, 2000);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSessionTypeColor = (type) => {
    const colors = {
      Training: COLORS.primary,
      Recovery: '#4CAF50',
      Match: '#FF6B35',
      Assessment: '#9C27B0',
    };
    return colors[type] || COLORS.primary;
  };

  const getTrainingTypeIcon = (type) => {
    const icons = {
      strength: 'fitness-center',
      cardio: 'directions-run',
      skills: 'sports-soccer',
      recovery: 'self-improvement',
      match: 'sports',
      rest: 'hotel',
    };
    return icons[type] || 'fitness-center';
  };

  const QuickActionCard = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.quickActionCard, { borderColor: color }]} onPress={onPress}>
      <Icon name={icon} size={24} color={color} />
      <Text style={[styles.quickActionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, unit, icon, color }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <View style={styles.statValueContainer}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {athleteData.name.split(' ')[0]}! 👋
            </Text>
            <Text style={styles.headerSubtext}>
              Ready for your {athleteData.sport} training?
            </Text>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('AthleteProfile')}
          >
            <Icon name="person" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Streak Counter */}
        <View style={styles.streakContainer}>
          <Icon name="local-fire-department" size={20} color="#FF6B35" />
          <Text style={styles.streakText}>{athleteData.streak} day streak!</Text>
          <Text style={styles.streakSubtext}>Keep it going!</Text>
        </View>
      </View>

      {/* Next Session Card */}
      <View style={styles.nextSessionCard}>
        <View style={styles.nextSessionHeader}>
          <Icon name="schedule" size={20} color={COLORS.primary} />
          <Text style={styles.nextSessionTitle}>Next Session</Text>
        </View>
        <View style={styles.nextSessionContent}>
          <Text style={styles.nextSessionName}>{athleteData.nextSession}</Text>
          <Text style={styles.nextSessionTime}>
            Today at {athleteData.nextSessionTime} • 90 min
          </Text>
          <Text style={styles.nextSessionCoach}>with {athleteData.coach}</Text>
        </View>
        <TouchableOpacity
          style={styles.startSessionButton}
          onPress={() => navigation.navigate('TodaysWorkout')}
        >
          <Text style={styles.startSessionText}>Start Session</Text>
          <Icon name="play-arrow" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionCard
            title="Today's Workout"
            icon="fitness-center"
            color={COLORS.primary}
            onPress={() => navigation.navigate('TodaysWorkout')}
          />
          <QuickActionCard
            title="Progress"
            icon="trending-up"
            color="#4CAF50"
            onPress={() => navigation.navigate('ProgressDashboard')}
          />
          <QuickActionCard
            title="Nutrition"
            icon="restaurant"
            color="#FF9800"
            onPress={() => navigation.navigate('NutritionDashboard')}
          />
          <QuickActionCard
            title="Coach Chat"
            icon="chat"
            color="#9C27B0"
            onPress={() => navigation.navigate('CoachChat')}
          />
        </View>
      </View>

      {/* Today's Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Calories"
            value={todaysStats.caloriesBurned}
            unit="kcal"
            icon="whatshot"
            color="#FF6B35"
          />
          <StatCard
            title="Training Time"
            value={todaysStats.trainingTime}
            unit="min"
            icon="timer"
            color={COLORS.primary}
          />
          <StatCard
            title="Avg Heart Rate"
            value={todaysStats.heartRateAvg}
            unit="bpm"
            icon="favorite"
            color="#E91E63"
          />
          <StatCard
            title="Hydration"
            value={`${todaysStats.hydrationCurrent}/${todaysStats.hydrationGoal}`}
            unit="L"
            icon="local-drink"
            color="#00BCD4"
          />
        </View>
      </View>

      {/* Weekly Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week's Progress</Text>
        <View style={styles.weeklyProgressContainer}>
          <View style={styles.weeklyProgressStats}>
            <Text style={styles.weeklyProgressNumber}>
              {athleteData.completedSessions}/{athleteData.weeklyGoal}
            </Text>
            <Text style={styles.weeklyProgressLabel}>Sessions Completed</Text>
          </View>
          <View style={styles.weeklyProgressDays}>
            {weeklyProgress.map((day, index) => (
              <View key={index} style={styles.dayContainer}>
                <View
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: day.completed ? '#4CAF50' : '#E0E0E0',
                    },
                  ]}
                >
                  <Icon
                    name={getTrainingTypeIcon(day.type)}
                    size={14}
                    color={day.completed ? '#fff' : '#9E9E9E'}
                  />
                </View>
                <Text style={styles.dayText}>{day.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        {recentAchievements.map((achievement) => (
          <TouchableOpacity
            key={achievement.id}
            style={styles.achievementCard}
            onPress={() => navigation.navigate('Achievements')}
          >
            <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
              <Icon name={achievement.icon} size={20} color="#fff" />
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
            </View>
            <Text style={styles.achievementDate}>{achievement.date}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming Schedule */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
          <TouchableOpacity onPress={() => navigation.navigate('BookingCalendar')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {upcomingSchedule.map((session) => (
          <TouchableOpacity key={session.id} style={styles.scheduleCard}>
            <View style={[styles.sessionTypeIndicator, { backgroundColor: getSessionTypeColor(session.type) }]} />
            <View style={styles.scheduleContent}>
              <View style={styles.scheduleHeader}>
                <Text style={styles.scheduleTitle}>{session.title}</Text>
                <Text style={[styles.scheduleType, { color: getSessionTypeColor(session.type) }]}>
                  {session.type}
                </Text>
              </View>
              <Text style={styles.scheduleTime}>
                {session.time} • {session.duration}
              </Text>
              <Text style={styles.scheduleLocation}>
                📍 {session.location} • {session.coach}
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Team & Coach Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Team</Text>
        <View style={styles.teamInfoCard}>
          <View style={styles.teamInfo}>
            <Icon name="group" size={24} color={COLORS.primary} />
            <View style={styles.teamDetails}>
              <Text style={styles.teamName}>{athleteData.team}</Text>
              <Text style={styles.coachName}>Coach: {athleteData.coach}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.teamChatButton}
            onPress={() => navigation.navigate('TeamChat')}
          >
            <Icon name="chat" size={16} color={COLORS.primary} />
            <Text style={styles.teamChatText}>Team Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  timeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 15,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  streakSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  nextSessionCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nextSessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
  },
  nextSessionContent: {
    marginBottom: 15,
  },
  nextSessionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  nextSessionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  nextSessionCoach: {
    fontSize: 14,
    color: '#666',
  },
  startSessionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
  },
  startSessionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#fff',
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    fontWeight: '600',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statUnit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  weeklyProgressContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weeklyProgressStats: {
    alignItems: 'center',
    marginBottom: 20,
  },
  weeklyProgressNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  weeklyProgressLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  weeklyProgressDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayText: {
    fontSize: 12,
    color: '#666',
  },
  achievementCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
  },
  achievementDate: {
    fontSize: 12,
    color: '#999',
  },
  scheduleCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sessionTypeIndicator: {
    width: 4,
    height: 50,
    borderRadius: 2,
    marginRight: 15,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scheduleType: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  scheduleLocation: {
    fontSize: 12,
    color: '#999',
  },
  teamInfoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  teamDetails: {
    marginLeft: 15,
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  coachName: {
    fontSize: 14,
    color: '#666',
  },
  teamChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
  },
  teamChatText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AthleteDashboard;