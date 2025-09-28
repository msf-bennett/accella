import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  Share,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Avatar,
  Surface,
  Chip,
  ProgressBar,
  IconButton,
  FAB,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, BarChart, PieChart } from 'recharts';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
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
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth } = Dimensions.get('window');

const AthleteProfile = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [achievementsModal, setAchievementsModal] = useState(false);
  
  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(200)).current;
  
  // Mock data - replace with real data from Redux store
  const athleteData = {
    name: user?.name || 'Alex Thompson',
    sport: user?.sport || 'Football',
    position: user?.position || 'Midfielder',
    level: user?.level || 'Advanced',
    age: user?.age || 22,
    height: user?.height || '5\'10"',
    weight: user?.weight || '165 lbs',
    bio: user?.bio || 'Passionate footballer with 8+ years of experience. Always striving to improve and help my team succeed!',
    joinedDate: 'January 2023',
    location: 'Nairobi, Kenya',
    avatar: user?.avatar || null,
    stats: {
      totalWorkouts: 247,
      completionRate: 94,
      currentStreak: 18,
      longestStreak: 42,
      totalHours: 312,
      averageRating: 4.8,
    },
    achievements: [
      { id: 1, title: 'Early Bird', description: '50 morning workouts', icon: 'alarm', earned: true, date: '2024-03-15' },
      { id: 2, title: 'Consistency King', description: '30-day streak', icon: 'jump-rope', earned: true, date: '2024-02-28' },
      { id: 3, title: 'Team Player', description: 'Helped 10 teammates', icon: 'people', earned: true, date: '2024-04-10' },
      { id: 4, title: 'Speed Demon', description: 'Improve 40-yard dash by 0.5s', icon: 'speed', earned: false, progress: 75 },
      { id: 5, title: 'Iron Will', description: 'Complete 100 strength sessions', icon: 'fitness-center', earned: false, progress: 68 },
      { id: 6, title: 'Marathon', description: '1000 total workouts', icon: 'directions-run', earned: false, progress: 25 },
    ],
    recentActivity: [
      { id: 1, type: 'workout', title: 'Strength Training', date: 'Today', duration: '45 min', rating: 5 },
      { id: 2, type: 'workout', title: 'Cardio & Agility', date: 'Yesterday', duration: '30 min', rating: 4 },
      { id: 3, type: 'achievement', title: 'Earned "Early Bird" badge', date: '2 days ago' },
      { id: 4, type: 'workout', title: 'Technical Skills', date: '3 days ago', duration: '60 min', rating: 5 },
      { id: 5, type: 'milestone', title: 'Completed 15-day streak!', date: '1 week ago' },
    ],
    performanceData: [
      { month: 'Jan', workouts: 18, hours: 24 },
      { month: 'Feb', workouts: 22, hours: 30 },
      { month: 'Mar', workouts: 25, hours: 35 },
      { month: 'Apr', workouts: 20, hours: 28 },
      { month: 'May', workouts: 28, hours: 38 },
      { month: 'Jun', workouts: 24, hours: 32 },
    ],
    skillsData: [
      { skill: 'Speed', value: 85, color: COLORS.primary },
      { skill: 'Strength', value: 78, color: COLORS.success },
      { skill: 'Agility', value: 92, color: COLORS.warning },
      { skill: 'Endurance', value: 88, color: COLORS.info },
      { skill: 'Technical', value: 76, color: COLORS.error },
    ],
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // dispatch(fetchAthleteProfile());
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out ${athleteData.name}'s athletic profile! ${athleteData.stats.completionRate}% completion rate with a ${athleteData.stats.currentStreak}-day streak!`,
        title: 'Athletic Profile',
      });
      if (result.action === Share.sharedAction) {
        Vibration.vibrate(50);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share profile');
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleSettings = () => {
    navigation.navigate('AccountSettings');
  };

  const renderTabButton = (tab, title, icon) => (
    <TouchableOpacity
      key={tab}
      style={{
        flex: 1,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        borderBottomWidth: activeTab === tab ? 2 : 0,
        borderBottomColor: COLORS.primary,
      }}
      onPress={() => {
        setActiveTab(tab);
        Vibration.vibrate(30);
      }}
    >
      <MaterialIcons 
        name={icon} 
        size={20} 
        color={activeTab === tab ? COLORS.primary : COLORS.textSecondary} 
      />
      <Text style={[
        TEXT_STYLES.caption,
        { color: activeTab === tab ? COLORS.primary : COLORS.textSecondary, marginTop: 2 }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => (
    <View>
      {/* Quick Stats */}
      <Card style={{ margin: SPACING.md, elevation: 4 }}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <Card.Content style={{ paddingVertical: SPACING.lg }}>
            <Text style={[TEXT_STYLES.h3, { color: 'white', textAlign: 'center', marginBottom: SPACING.md }]}>
              Performance Overview
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
                  {athleteData.stats.totalWorkouts}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'white' }]}>Workouts</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
                  {athleteData.stats.completionRate}%
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'white' }]}>Completion</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
                  {athleteData.stats.currentStreak}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'white' }]}>Day Streak</Text>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
        <Card.Content style={{ paddingTop: SPACING.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <Text style={TEXT_STYLES.caption}>Total Hours</Text>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                {athleteData.stats.totalHours}h
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={TEXT_STYLES.caption}>Average Rating</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.warning, marginRight: 4 }]}>
                  {athleteData.stats.averageRating}
                </Text>
                <MaterialIcons name="star" size={20} color={COLORS.warning} />
              </View>
            </View>
          </View>
          <Button
            mode="contained"
            icon="trending-up"
            onPress={() => navigation.navigate('DetailedStats')}
            style={{ marginTop: SPACING.sm }}
            buttonColor={COLORS.primary}
          >
            View Detailed Analytics
          </Button>
        </Card.Content>
      </Card>

      {/* Skills Assessment */}
      <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Skills Assessment
          </Text>
          {athleteData.skillsData.map((skill, index) => (
            <View key={skill.skill} style={{ marginBottom: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={TEXT_STYLES.body}>{skill.skill}</Text>
                <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>{skill.value}%</Text>
              </View>
              <ProgressBar
                progress={skill.value / 100}
                color={skill.color}
                style={{ height: 8, borderRadius: 4 }}
              />
            </View>
          ))}
          <Button
            mode="outlined"
            icon="assessment"
            onPress={() => Alert.alert('Skills Assessment', 'Take a new skills assessment to update your profile!')}
            style={{ marginTop: SPACING.sm }}
          >
            Retake Assessment
          </Button>
        </Card.Content>
      </Card>

      {/* Recent Achievements */}
      <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={TEXT_STYLES.h3}>Recent Achievements</Text>
            <Button
              mode="text"
              onPress={() => setAchievementsModal(true)}
              labelStyle={{ color: COLORS.primary }}
            >
              View All
            </Button>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {athleteData.achievements.filter(a => a.earned).slice(0, 3).map((achievement) => (
              <Surface
                key={achievement.id}
                style={{
                  padding: SPACING.md,
                  marginRight: SPACING.sm,
                  borderRadius: 12,
                  elevation: 2,
                  width: 140,
                }}
              >
                <MaterialIcons 
                  name={achievement.icon}
                  size={32}
                  color={COLORS.primary}
                  style={{ textAlign: 'center', marginBottom: SPACING.xs }}
                />
                <Text style={[TEXT_STYLES.caption, { fontWeight: '600', textAlign: 'center' }]}>
                  {achievement.title}
                </Text>
                <Text style={[TEXT_STYLES.small, { textAlign: 'center', marginTop: 2 }]}>
                  {achievement.date}
                </Text>
              </Surface>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Bio Section */}
      <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            About Me
          </Text>
          <Text style={[TEXT_STYLES.body, { lineHeight: 22, marginBottom: SPACING.md }]}>
            {athleteData.bio}
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
            <Chip icon="cake" compact>Age: {athleteData.age}</Chip>
            <Chip icon="straighten" compact>Height: {athleteData.height}</Chip>
            <Chip icon="fitness-center" compact>Weight: {athleteData.weight}</Chip>
            <Chip icon="school" compact>{athleteData.level}</Chip>
          </View>
          
          <Divider style={{ marginVertical: SPACING.md }} />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={TEXT_STYLES.caption}>Member since</Text>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                {athleteData.joinedDate}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={TEXT_STYLES.caption}>Longest streak</Text>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.warning }]}>
                {athleteData.stats.longestStreak} days
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Training Goals */}
      <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Current Goals
          </Text>
          
          {[
            { goal: 'Improve 40-yard dash time', current: '4.8s', target: '4.5s', progress: 60 },
            { goal: 'Increase max bench press', current: '185 lbs', target: '200 lbs', progress: 75 },
            { goal: 'Complete 300 workouts', current: '247', target: '300', progress: 82 },
          ].map((goal, index) => (
            <View key={index} style={{ marginBottom: SPACING.lg }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600', flex: 1 }]}>
                  {goal.goal}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                  {goal.progress}%
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={TEXT_STYLES.small}>Current: {goal.current}</Text>
                <Text style={TEXT_STYLES.small}>Target: {goal.target}</Text>
              </View>
              <ProgressBar
                progress={goal.progress / 100}
                color={COLORS.primary}
                style={{ height: 8, borderRadius: 4 }}
              />
            </View>
          ))}
          
          <Button
            mode="outlined"
            icon="add"
            onPress={() => Alert.alert('Set Goals', 'Create new training goals to track your progress!')}
            style={{ marginTop: SPACING.sm }}
          >
            Add New Goal
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  const renderActivityTab = () => (
    <View>
      <Card style={{ margin: SPACING.md, elevation: 4 }}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Recent Activity
          </Text>
          {athleteData.recentActivity.map((activity, index) => (
            <View key={activity.id} style={{ marginBottom: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Surface style={{
                  padding: SPACING.sm,
                  borderRadius: 24,
                  backgroundColor: activity.type === 'workout' ? COLORS.primary + '20' : 
                                  activity.type === 'achievement' ? COLORS.warning + '20' : 
                                  COLORS.success + '20',
                  marginRight: SPACING.md,
                }}>
                  <MaterialIcons
                    name={
                      activity.type === 'workout' ? 'fitness-center' :
                      activity.type === 'achievement' ? 'jump-rope' :
                      'flag'
                    }
                    size={20}
                    color={
                      activity.type === 'workout' ? COLORS.primary :
                      activity.type === 'achievement' ? COLORS.warning :
                      COLORS.success
                    }
                  />
                </Surface>
                <View style={{ flex: 1 }}>
                  <Text style={TEXT_STYLES.body}>{activity.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Text style={TEXT_STYLES.small}>{activity.date}</Text>
                    {activity.duration && (
                      <>
                        <Text style={[TEXT_STYLES.small, { marginHorizontal: 4 }]}>•</Text>
                        <Text style={TEXT_STYLES.small}>{activity.duration}</Text>
                      </>
                    )}
                    {activity.rating && (
                      <View style={{ flexDirection: 'row', marginLeft: SPACING.sm }}>
                        {[...Array(5)].map((_, i) => (
                          <MaterialIcons
                            key={i}
                            name="star"
                            size={14}
                            color={i < activity.rating ? COLORS.warning : COLORS.border}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
              {index < athleteData.recentActivity.length - 1 && (
                <Divider style={{ marginTop: SPACING.md }} />
              )}
            </View>
          ))}
          
          <Button
            mode="outlined"
            icon="history"
            onPress={() => navigation.navigate('ActivityHistory')}
            style={{ marginTop: SPACING.sm }}
          >
            View Complete History
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  const renderStatsTab = () => (
    <View>
      <Card style={{ margin: SPACING.md, elevation: 4 }}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg }]}>
            Performance Trends
          </Text>
          
          {/* Monthly Progress */}
          <View style={{ marginBottom: SPACING.xl }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md, fontWeight: '600' }]}>
              Monthly Workouts
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', alignItems: 'end', paddingBottom: SPACING.lg }}>
                {athleteData.performanceData.map((data, index) => (
                  <View key={data.month} style={{ alignItems: 'center', marginRight: SPACING.lg }}>
                    <View
                      style={{
                        height: data.workouts * 4,
                        width: 24,
                        backgroundColor: COLORS.primary,
                        borderRadius: 4,
                        marginBottom: SPACING.sm,
                      }}
                    />
                    <Text style={[TEXT_STYLES.small, { fontWeight: '600' }]}>
                      {data.workouts}
                    </Text>
                    <Text style={TEXT_STYLES.small}>{data.month}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Training Hours */}
          <View style={{ marginBottom: SPACING.lg }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md, fontWeight: '600' }]}>
              Training Hours Distribution
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['Strength', 'Cardio', 'Skills', 'Recovery'].map((category, index) => (
                <View key={category} style={{ width: '50%', marginBottom: SPACING.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: [COLORS.primary, COLORS.success, COLORS.warning, COLORS.info][index],
                        marginRight: SPACING.sm,
                      }}
                    />
                    <Text style={TEXT_STYLES.caption}>{category}</Text>
                  </View>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                    {[78, 65, 42, 28][index]}h
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Personal Records */}
      <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Personal Records
          </Text>
          
          {[
            { exercise: '40-yard dash', value: '4.8s', improvement: '-0.2s', trend: 'up' },
            { exercise: 'Bench Press', value: '185 lbs', improvement: '+15 lbs', trend: 'up' },
            { exercise: 'Vertical Jump', value: '28 inches', improvement: '+2 in', trend: 'up' },
            { exercise: '5K Run', value: '19:45', improvement: '-0:30', trend: 'up' },
          ].map((record, index) => (
            <View key={record.exercise} style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: SPACING.md,
            }}>
              <View style={{ flex: 1 }}>
                <Text style={TEXT_STYLES.body}>{record.exercise}</Text>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                  {record.value}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons 
                    name="trending-up" 
                    size={16} 
                    color={COLORS.success}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                    {record.improvement}
                  </Text>
                </View>
                <Text style={TEXT_STYLES.small}>This month</Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const renderCoachesTab = () => (
    <View>
      <Card style={{ margin: SPACING.md, elevation: 4 }}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            My Coaches
          </Text>
          
          {[
            {
              id: 1,
              name: 'Coach Sarah Wilson',
              specialty: 'Strength & Conditioning',
              avatar: null,
              rating: 4.9,
              sessions: 24,
              status: 'active'
            },
            {
              id: 2,
              name: 'Coach Mike Johnson',
              specialty: 'Technical Skills',
              avatar: null,
              rating: 4.8,
              sessions: 18,
              status: 'active'
            },
            {
              id: 3,
              name: 'Coach Lisa Chen',
              specialty: 'Mental Performance',
              avatar: null,
              rating: 5.0,
              sessions: 8,
              status: 'scheduled'
            }
          ].map((coach) => (
            <Surface
              key={coach.id}
              style={{
                padding: SPACING.md,
                borderRadius: 12,
                marginBottom: SPACING.md,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar.Text
                  size={48}
                  label={coach.name.split(' ').map(n => n[0]).join('')}
                  style={{ backgroundColor: COLORS.primary, marginRight: SPACING.md }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                    {coach.name}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { marginVertical: 2 }]}>
                    {coach.specialty}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <MaterialIcons name="star" size={14} color={COLORS.warning} />
                    <Text style={[TEXT_STYLES.small, { marginLeft: 2, marginRight: SPACING.sm }]}>
                      {coach.rating}
                    </Text>
                    <Text style={TEXT_STYLES.small}>
                      {coach.sessions} sessions
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Chip
                    compact
                    style={{
                      backgroundColor: coach.status === 'active' ? COLORS.success + '20' : COLORS.warning + '20'
                    }}
                    textStyle={{
                      color: coach.status === 'active' ? COLORS.success : COLORS.warning,
                      fontSize: 10
                    }}
                  >
                    {coach.status === 'active' ? 'Active' : 'Scheduled'}
                  </Chip>
                  <IconButton
                    icon="message"
                    size={20}
                    iconColor={COLORS.primary}
                    onPress={() => Alert.alert('Message Coach', `Send a message to ${coach.name}!`)}
                  />
                </View>
              </View>
            </Surface>
          ))}
          
          <Button
            mode="contained"
            icon="person-add"
            onPress={() => navigation.navigate('FindCoaches')}
            style={{ marginTop: SPACING.sm }}
            buttonColor={COLORS.primary}
          >
            Find New Coach
          </Button>
        </Card.Content>
      </Card>

      {/* Training Programs */}
      <Card style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md, elevation: 4 }}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Active Programs
          </Text>
          
          {[
            {
              name: 'Pre-Season Conditioning',
              coach: 'Coach Sarah Wilson',
              progress: 78,
              weeksDone: 7,
              totalWeeks: 9,
              nextSession: 'Tomorrow',
              difficulty: 'High'
            },
            {
              name: 'Technical Skills Mastery',
              coach: 'Coach Mike Johnson',
              progress: 45,
              weeksDone: 4,
              totalWeeks: 8,
              nextSession: 'Friday',
              difficulty: 'Medium'
            }
          ].map((program, index) => (
            <Surface
              key={index}
              style={{
                padding: SPACING.md,
                borderRadius: 12,
                marginBottom: SPACING.md,
                elevation: 2,
                borderLeftWidth: 4,
                borderLeftColor: COLORS.primary,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                    {program.name}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { marginVertical: 2 }]}>
                    by {program.coach}
                  </Text>
                </View>
                <Chip
                  compact
                  style={{
                    backgroundColor: program.difficulty === 'High' ? COLORS.error + '20' :
                                   program.difficulty === 'Medium' ? COLORS.warning + '20' :
                                   COLORS.success + '20'
                  }}
                  textStyle={{
                    color: program.difficulty === 'High' ? COLORS.error :
                           program.difficulty === 'Medium' ? COLORS.warning :
                           COLORS.success,
                    fontSize: 10
                  }}
                >
                  {program.difficulty}
                </Chip>
              </View>
              
              <View style={{ marginBottom: SPACING.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={TEXT_STYLES.small}>
                    Week {program.weeksDone} of {program.totalWeeks}
                  </Text>
                  <Text style={TEXT_STYLES.small}>
                    {program.progress}%
                  </Text>
                </View>
                <ProgressBar
                  progress={program.progress / 100}
                  color={COLORS.primary}
                  style={{ height: 6, borderRadius: 3 }}
                />
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={TEXT_STYLES.small}>Next session:</Text>
                  <Text style={[TEXT_STYLES.caption, { fontWeight: '600', color: COLORS.primary }]}>
                    {program.nextSession}
                  </Text>
                </View>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => Alert.alert('Program Details', `View details for ${program.name}!`)}
                  style={{ borderColor: COLORS.primary }}
                  labelStyle={{ color: COLORS.primary }}
                >
                  View Details
                </Button>
              </View>
            </Surface>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={{ height: headerHeight }}>
        <LinearGradient 
          colors={['#667eea', '#764ba2']} 
          style={{ 
            flex: 1, 
            paddingTop: StatusBar.currentHeight || 44,
            justifyContent: 'space-between',
          }}
        >
          {/* Header Actions */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: SPACING.md,
          }}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <View style={{ flexDirection: 'row' }}>
              <IconButton
                icon="share"
                iconColor="white"
                size={24}
                onPress={handleShare}
              />
              <IconButton
                icon="settings"
                iconColor="white"
                size={24}
                onPress={handleSettings}
              />
            </View>
          </View>
          
          {/* Profile Info */}
          <View style={{ alignItems: 'center', paddingHorizontal: SPACING.md, paddingBottom: SPACING.lg }}>
            <Avatar.Image
              size={80}
              source={athleteData.avatar ? { uri: athleteData.avatar } : { uri: 'https://via.placeholder.com/80' }}
              style={{ marginBottom: SPACING.md }}
            />
            <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center' }]}>
              {athleteData.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <MaterialIcons name="sports-soccer" size={16} color="white" />
              <Text style={[TEXT_STYLES.body, { color: 'white', marginLeft: 4 }]}>
                {athleteData.sport} • {athleteData.position}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <MaterialIcons name="location-on" size={14} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: 2 }]}>
                {athleteData.location}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <Chip 
                icon="edit" 
                onPress={handleEditProfile}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                textStyle={{ color: 'white' }}
              >
                Edit Profile
              </Chip>
              <Chip 
                icon="jump-rope" 
                onPress={() => setAchievementsModal(true)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                textStyle={{ color: 'white' }}
              >
                Achievements
              </Chip>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Tab Navigation */}
      <Surface style={{ elevation: 4, backgroundColor: COLORS.surface }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.md }}>
          {renderTabButton('overview', 'Overview', 'dashboard')}
          {renderTabButton('activity', 'Activity', 'timeline')}
          {renderTabButton('stats', 'Stats', 'bar-chart')}
          {renderTabButton('coaches', 'Coaches', 'people')}
        </View>
      </Surface>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'coaches' && renderCoachesTab()}
        
        <View style={{ height: SPACING.xl }} />
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
        onPress={() => Alert.alert('Quick Action', 'Log workout, update stats, or share achievement!')}
      />

      {/* Achievements Modal */}
      <Portal>
        <Modal
          visible={achievementsModal}
          onDismiss={() => setAchievementsModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 12,
            padding: SPACING.lg,
            maxHeight: '80%',
          }}
        >
          <ScrollView>
            <Text style={[TEXT_STYLES.h2, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
              Achievements
            </Text>
            
            {athleteData.achievements.map((achievement) => (
              <Surface
                key={achievement.id}
                style={{
                  padding: SPACING.md,
                  borderRadius: 12,
                  marginBottom: SPACING.md,
                  elevation: 2,
                  opacity: achievement.earned ? 1 : 0.6,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons
                    name={achievement.icon}
                    size={40}
                    color={COLORS.primary}
                    style={{ marginRight: SPACING.md }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                      {achievement.title}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { marginVertical: 2 }]}>
                      {achievement.description}
                    </Text>
                    {achievement.earned ? (
                      <Text style={[TEXT_STYLES.small, { color: COLORS.success }]}>
                        Earned on {achievement.date}
                      </Text>
                    ) : (
                      <View style={{ marginTop: SPACING.sm }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={TEXT_STYLES.small}>Progress</Text>
                          <Text style={TEXT_STYLES.small}>{achievement.progress}%</Text>
                        </View>
                        <ProgressBar
                          progress={achievement.progress / 100}
                          color={COLORS.primary}
                          style={{ height: 6, borderRadius: 3 }}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </Surface>
            ))}
            
            <Button
              mode="contained"
              onPress={() => setAchievementsModal(false)}
              style={{ marginTop: SPACING.md }}
              buttonColor={COLORS.primary}
            >
              Close
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

export default AthleteProfile;