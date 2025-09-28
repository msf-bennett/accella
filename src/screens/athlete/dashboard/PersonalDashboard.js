import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const PersonalDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const workouts = useSelector(state => state.training.userWorkouts);
  const achievements = useSelector(state => state.gamification.achievements);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch actions to refresh data
      // dispatch(fetchUserWorkouts());
      // dispatch(fetchAchievements());
      await new Promise(resolve => setTimeout(resolve, 1500)); // Mock API call
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  }, [dispatch]);

  // Mock data - replace with real data from Redux store
  const mockStats = {
    weeklyGoal: 5,
    completedSessions: 3,
    currentStreak: 7,
    totalPoints: 1250,
    level: 12,
    levelProgress: 0.65,
  };

  const mockUpcomingSessions = [
    {
      id: 1,
      title: 'Strength Training',
      coach: 'Coach Martinez',
      time: '09:00 AM',
      date: 'Today',
      type: 'strength',
      duration: 60,
    },
    {
      id: 2,
      title: 'Cardio Endurance',
      coach: 'Coach Johnson',
      time: '02:00 PM',
      date: 'Tomorrow',
      type: 'cardio',
      duration: 45,
    },
    {
      id: 3,
      title: 'Skill Development',
      coach: 'Coach Williams',
      time: '10:00 AM',
      date: 'Saturday',
      type: 'skills',
      duration: 90,
    },
  ];

  const mockRecentAchievements = [
    { id: 1, title: 'Week Warrior', description: '7-day streak!', icon: 'local-fire-department', color: '#ff6b6b' },
    { id: 2, title: 'Strength Master', description: 'Complete 20 strength sessions', icon: 'fitness-center', color: '#4ecdc4' },
    { id: 3, title: 'Early Bird', description: '5 morning sessions', icon: 'wb-sunny', color: '#ffe66d' },
  ];

  const mockPerformanceData = [
    { category: 'Strength', score: 85, improvement: '+5%' },
    { category: 'Endurance', score: 78, improvement: '+12%' },
    { category: 'Speed', score: 72, improvement: '+3%' },
    { category: 'Flexibility', score: 90, improvement: '+8%' },
  ];

  const getSessionTypeColor = (type) => {
    switch (type) {
      case 'strength': return '#ff6b6b';
      case 'cardio': return '#4ecdc4';
      case 'skills': return '#ffe66d';
      default: return COLORS.primary;
    }
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'strength': return 'fitness-center';
      case 'cardio': return 'directions-run';
      case 'skills': return 'sports-soccer';
      default: return 'event';
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'start_workout':
        Alert.alert('Feature Coming Soon', 'Quick workout start feature is under development! 🏋️‍♀️');
        break;
      case 'log_nutrition':
        Alert.alert('Feature Coming Soon', 'Nutrition logging feature is under development! 🥗');
        break;
      case 'track_progress':
        Alert.alert('Feature Coming Soon', 'Progress tracking feature is under development! 📊');
        break;
      case 'message_coach':
        Alert.alert('Feature Coming Soon', 'Coach messaging feature is under development! 💬');
        break;
      default:
        break;
    }
  };

  const renderSessionCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }),
        }],
      }}
    >
      <Card
        style={{
          marginRight: SPACING.medium,
          marginBottom: SPACING.small,
          width: screenWidth * 0.75,
          elevation: 3,
        }}
      >
        <LinearGradient
          colors={[getSessionTypeColor(item.type), `${getSessionTypeColor(item.type)}80`]}
          style={{
            padding: SPACING.medium,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>
                {item.title}
              </Text>
              <Text style={[TEXT_STYLES.body, { color: 'white', opacity: 0.9 }]}>
                with {item.coach}
              </Text>
            </View>
            <Icon name={getSessionTypeIcon(item.type)} size={32} color="white" />
          </View>
        </LinearGradient>
        <Card.Content style={{ padding: SPACING.medium }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.small }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="schedule" size={18} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.xsmall, color: COLORS.textSecondary }]}>
                {item.time} • {item.date}
              </Text>
            </View>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {item.duration}min
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={() => handleQuickAction('start_workout')}
            style={{ backgroundColor: getSessionTypeColor(item.type) }}
            compact
          >
            Join Session
          </Button>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderAchievementBadge = ({ item }) => (
    <Surface
      style={{
        marginRight: SPACING.medium,
        padding: SPACING.medium,
        borderRadius: 12,
        elevation: 2,
        backgroundColor: 'white',
        alignItems: 'center',
        width: 120,
      }}
    >
      <Icon name={item.icon} size={32} color={item.color} />
      <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold', marginTop: SPACING.xsmall, textAlign: 'center' }]}>
        {item.title}
      </Text>
      <Text style={[TEXT_STYLES.caption, { fontSize: 10, textAlign: 'center', color: COLORS.textSecondary }]}>
        {item.description}
      </Text>
    </Surface>
  );

  const renderPerformanceItem = ({ item }) => (
    <Surface
      style={{
        padding: SPACING.medium,
        marginBottom: SPACING.small,
        borderRadius: 8,
        elevation: 1,
        backgroundColor: 'white',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.small }}>
        <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>{item.category}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, fontWeight: 'bold' }]}>{item.score}</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.success, marginLeft: SPACING.xsmall }]}>
            {item.improvement}
          </Text>
        </View>
      </View>
      <ProgressBar
        progress={item.score / 100}
        color={COLORS.primary}
        style={{ height: 6, borderRadius: 3 }}
      />
    </Surface>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.large,
          paddingBottom: SPACING.large,
          paddingHorizontal: SPACING.medium,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
              Welcome back, {user?.name || 'Athlete'}! 👋
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'white', opacity: 0.9 }]}>
              Ready to crush your goals today?
            </Text>
          </View>
          <Avatar.Image
            size={50}
            source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
          />
        </View>

        {/* Stats Cards Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Surface style={{ flex: 1, marginRight: SPACING.xsmall, padding: SPACING.small, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="local-fire-department" size={24} color="#ff6b6b" />
              <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>{mockStats.currentStreak}</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'white', opacity: 0.8 }]}>Day Streak</Text>
            </View>
          </Surface>
          <Surface style={{ flex: 1, marginHorizontal: SPACING.xsmall, padding: SPACING.small, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="stars" size={24} color="#ffe66d" />
              <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>{mockStats.totalPoints}</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'white', opacity: 0.8 }]}>Points</Text>
            </View>
          </Surface>
          <Surface style={{ flex: 1, marginLeft: SPACING.xsmall, padding: SPACING.small, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="trending-up" size={24} color="#4ecdc4" />
              <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>Lv.{mockStats.level}</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'white', opacity: 0.8 }]}>Level</Text>
            </View>
          </Surface>
        </View>

        {/* Level Progress */}
        <View style={{ marginTop: SPACING.medium }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xsmall }}>
            <Text style={[TEXT_STYLES.caption, { color: 'white', opacity: 0.9 }]}>
              Level {mockStats.level} Progress
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'white', opacity: 0.9 }]}>
              {Math.round(mockStats.levelProgress * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={mockStats.levelProgress}
            color="white"
            style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' }}
          />
        </View>
      </LinearGradient>

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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Quick Actions */}
        <View style={{ padding: SPACING.medium }}>
          <Text style={[TEXT_STYLES.h3, { fontWeight: 'bold', marginBottom: SPACING.medium }]}>
            Quick Actions 🚀
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[
              { icon: 'play-circle-filled', label: 'Start Workout', action: 'start_workout', color: '#ff6b6b' },
              { icon: 'restaurant', label: 'Log Nutrition', action: 'log_nutrition', color: '#4ecdc4' },
              { icon: 'analytics', label: 'Track Progress', action: 'track_progress', color: '#ffe66d' },
              { icon: 'message', label: 'Message Coach', action: 'message_coach', color: '#667eea' },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleQuickAction(item.action)}
                style={{
                  width: '48%',
                  marginBottom: SPACING.medium,
                }}
              >
                <Surface
                  style={{
                    padding: SPACING.medium,
                    borderRadius: 12,
                    elevation: 2,
                    backgroundColor: 'white',
                    alignItems: 'center',
                  }}
                >
                  <Icon name={item.icon} size={32} color={item.color} />
                  <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', marginTop: SPACING.small, textAlign: 'center' }]}>
                    {item.label}
                  </Text>
                </Surface>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weekly Goal Progress */}
        <View style={{ paddingHorizontal: SPACING.medium, marginBottom: SPACING.large }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
            <Text style={[TEXT_STYLES.h3, { fontWeight: 'bold' }]}>Weekly Goal 🎯</Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
              {mockStats.completedSessions}/{mockStats.weeklyGoal} sessions
            </Text>
          </View>
          <Surface style={{ padding: SPACING.medium, borderRadius: 12, elevation: 2, backgroundColor: 'white' }}>
            <ProgressBar
              progress={mockStats.completedSessions / mockStats.weeklyGoal}
              color={COLORS.success}
              style={{ height: 8, borderRadius: 4, marginBottom: SPACING.small }}
            />
            <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: COLORS.textSecondary }]}>
              {mockStats.weeklyGoal - mockStats.completedSessions} sessions left to reach your goal!
            </Text>
          </Surface>
        </View>

        {/* Upcoming Sessions */}
        <View style={{ marginBottom: SPACING.large }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.medium, marginBottom: SPACING.medium }}>
            <Text style={[TEXT_STYLES.h3, { fontWeight: 'bold' }]}>Upcoming Sessions ⏰</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('TrainingSchedule')}
              compact
            >
              View All
            </Button>
          </View>
          <FlatList
            data={mockUpcomingSessions}
            renderItem={renderSessionCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.medium }}
            keyExtractor={item => item.id.toString()}
          />
        </View>

        {/* Recent Achievements */}
        <View style={{ marginBottom: SPACING.large }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.medium, marginBottom: SPACING.medium }}>
            <Text style={[TEXT_STYLES.h3, { fontWeight: 'bold' }]}>Recent Achievements 🏆</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Achievements')}
              compact
            >
              View All
            </Button>
          </View>
          <FlatList
            data={mockRecentAchievements}
            renderItem={renderAchievementBadge}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.medium }}
            keyExtractor={item => item.id.toString()}
          />
        </View>

        {/* Performance Overview */}
        <View style={{ paddingHorizontal: SPACING.medium, marginBottom: SPACING.xlarge }}>
          <Text style={[TEXT_STYLES.h3, { fontWeight: 'bold', marginBottom: SPACING.medium }]}>
            Performance Overview 📊
          </Text>
          <FlatList
            data={mockPerformanceData}
            renderItem={renderPerformanceItem}
            keyExtractor={item => item.category}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={{
          position: 'absolute',
          margin: SPACING.medium,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        icon="add"
        onPress={() => handleQuickAction('start_workout')}
      />
    </View>
  );
};

export default PersonalDashboard;