import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
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
  Portal,
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const FunActivities = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [streakCount, setStreakCount] = useState(7);
  const [totalPoints, setTotalPoints] = useState(485);
  const [level, setLevel] = useState(3);
  
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
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
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const funActivities = [
    {
      id: 1,
      title: 'Soccer Skill Challenge 🥅',
      description: 'Practice juggling and dribbling',
      icon: 'sports-soccer',
      points: 25,
      duration: '10 min',
      difficulty: 'Easy',
      color: '#4CAF50',
      category: 'Sports',
    },
    {
      id: 2,
      title: 'Dance Party Workout 💃',
      description: 'Follow fun dance moves',
      icon: 'music-note',
      points: 30,
      duration: '15 min',
      difficulty: 'Medium',
      color: '#FF9800',
      category: 'Dance',
    },
    {
      id: 3,
      title: 'Animal Movements 🐻',
      description: 'Bear crawls, frog jumps & more!',
      icon: 'pets',
      points: 20,
      duration: '8 min',
      difficulty: 'Easy',
      color: '#9C27B0',
      category: 'Movement',
    },
    {
      id: 4,
      title: 'Basketball Free Throws 🏀',
      description: 'Improve your shooting accuracy',
      icon: 'sports-basketball',
      points: 35,
      duration: '12 min',
      difficulty: 'Medium',
      color: '#FF5722',
      category: 'Sports',
    },
    {
      id: 5,
      title: 'Yoga Adventure 🧘‍♀️',
      description: 'Fun poses with stories',
      icon: 'self-improvement',
      points: 25,
      duration: '20 min',
      difficulty: 'Easy',
      color: '#00BCD4',
      category: 'Wellness',
    },
    {
      id: 6,
      title: 'Obstacle Course 🏃‍♂️',
      description: 'Build your own fun course',
      icon: 'directions-run',
      points: 40,
      duration: '25 min',
      difficulty: 'Hard',
      color: '#E91E63',
      category: 'Adventure',
    },
  ];

  const achievements = [
    { id: 1, title: 'First Goal!', icon: '🎯', unlocked: true },
    { id: 2, title: 'Dance Master', icon: '💃', unlocked: true },
    { id: 3, title: 'Animal Expert', icon: '🐾', unlocked: true },
    { id: 4, title: 'Week Warrior', icon: '🔥', unlocked: false },
    { id: 5, title: 'Perfect Month', icon: '⭐', unlocked: false },
  ];

  const handleActivityPress = (activity) => {
    Vibration.vibrate(10);
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  const startActivity = () => {
    if (selectedActivity) {
      Alert.alert(
        '🚀 Feature Coming Soon!',
        `The ${selectedActivity.title} activity is being developed and will be available soon. Get ready for an amazing experience!`,
        [{ text: 'Got it! 👍', style: 'default' }]
      );
      setShowActivityModal(false);
    }
  };

  const completeActivity = (activityId) => {
    if (!completedActivities.includes(activityId)) {
      setCompletedActivities([...completedActivities, activityId]);
      const activity = funActivities.find(a => a.id === activityId);
      setTotalPoints(totalPoints + activity.points);
      Vibration.vibrate([100, 50, 100]);
      
      Alert.alert(
        '🎉 Awesome Job!',
        `You earned ${activity.points} points! Keep up the great work!`,
        [{ text: 'Yay! 🎊', style: 'default' }]
      );
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
        <Avatar.Text
          size={50}
          label={user?.name?.charAt(0) || 'K'}
          style={{ backgroundColor: COLORS.secondary }}
        />
        <View style={{ marginLeft: SPACING.md, flex: 1 }}>
          <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: 4 }]}>
            Hey {user?.name || 'Champion'}! 👋
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
            Ready for some fun activities?
          </Text>
        </View>
        <IconButton
          icon="notifications"
          iconColor="white"
          size={24}
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Surface style={styles.statCard}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>Level</Text>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>{level}</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>Points</Text>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.secondary }]}>{totalPoints}</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>Streak</Text>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>{streakCount} 🔥</Text>
        </Surface>
      </View>

      <View style={{ marginTop: SPACING.md }}>
        <Text style={[TEXT_STYLES.body, { color: 'white', marginBottom: 8 }]}>
          Progress to Level {level + 1}
        </Text>
        <ProgressBar
          progress={0.65}
          color="white"
          style={{ height: 8, borderRadius: 4 }}
        />
      </View>
    </LinearGradient>
  );

  const renderQuickActions = () => (
    <View style={{ padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
        Quick Actions ⚡
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => Alert.alert('🚀 Feature Coming Soon!', 'Daily challenge feature is being developed!')}
        >
          <Icon name="jump-rope" size={30} color={COLORS.primary} />
          <Text style={TEXT_STYLES.caption}>Daily Challenge</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => Alert.alert('🚀 Feature Coming Soon!', 'Progress tracking feature is being developed!')}
        >
          <Icon name="trending-up" size={30} color={COLORS.success} />
          <Text style={TEXT_STYLES.caption}>My Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => Alert.alert('🚀 Feature Coming Soon!', 'Friends feature is being developed!')}
        >
          <Icon name="people" size={30} color={COLORS.secondary} />
          <Text style={TEXT_STYLES.caption}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => Alert.alert('🚀 Feature Coming Soon!', 'Rewards shop feature is being developed!')}
        >
          <Icon name="card-giftcard" size={30} color={COLORS.error} />
          <Text style={TEXT_STYLES.caption}>Rewards</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderAchievements = () => (
    <View style={{ padding: SPACING.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
        <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>Achievements 🏆</Text>
        <Button 
          mode="text" 
          onPress={() => Alert.alert('🚀 Feature Coming Soon!', 'Achievement details coming soon!')}
        >
          View All
        </Button>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {achievements.map((achievement) => (
          <Card key={achievement.id} style={[
            styles.achievementCard,
            { opacity: achievement.unlocked ? 1 : 0.5 }
          ]}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 30, marginBottom: 4 }}>{achievement.icon}</Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
                {achievement.title}
              </Text>
              {achievement.unlocked && (
                <Icon name="check-circle" size={16} color={COLORS.success} style={{ marginTop: 4 }} />
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderActivityCard = (activity) => {
    const isCompleted = completedActivities.includes(activity.id);
    
    return (
      <TouchableOpacity
        key={activity.id}
        onPress={() => handleActivityPress(activity)}
        activeOpacity={0.7}
      >
        <Card style={[styles.activityCard, isCompleted && styles.completedCard]}>
          <LinearGradient
            colors={[activity.color, `${activity.color}CC`]}
            style={styles.cardGradient}
          >
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Icon name={activity.icon} size={32} color="white" />
                <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                  <Text style={[TEXT_STYLES.h4, { color: 'white' }]}>
                    {activity.title}
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
                    {activity.description}
                  </Text>
                </View>
                {isCompleted && (
                  <Icon name="check-circle" size={24} color="white" />
                )}
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Chip
                    mode="outlined"
                    textStyle={{ color: 'white', fontSize: 12 }}
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 8 }}
                  >
                    {activity.duration}
                  </Chip>
                  <Chip
                    mode="outlined"
                    textStyle={{ color: 'white', fontSize: 12 }}
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    {activity.difficulty}
                  </Chip>
                </View>
                <Text style={[TEXT_STYLES.body, { color: 'white', fontWeight: 'bold' }]}>
                  +{activity.points} pts
                </Text>
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderActivityModal = () => (
    <Portal>
      <Modal
        visible={showActivityModal}
        onDismiss={() => setShowActivityModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedActivity && (
          <View>
            <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
              <Surface style={styles.modalIconContainer}>
                <Icon 
                  name={selectedActivity.icon} 
                  size={48} 
                  color={selectedActivity.color} 
                />
              </Surface>
              <Text style={[TEXT_STYLES.h2, { marginTop: SPACING.md, textAlign: 'center' }]}>
                {selectedActivity.title}
              </Text>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: COLORS.textSecondary }]}>
                {selectedActivity.description}
              </Text>
            </View>

            <View style={{ marginBottom: SPACING.lg }}>
              <View style={styles.modalDetailRow}>
                <Icon name="schedule" size={20} color={COLORS.primary} />
                <Text style={TEXT_STYLES.body}>Duration: {selectedActivity.duration}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Icon name="fitness-center" size={20} color={COLORS.secondary} />
                <Text style={TEXT_STYLES.body}>Difficulty: {selectedActivity.difficulty}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Icon name="star" size={20} color={COLORS.success} />
                <Text style={TEXT_STYLES.body}>Points: +{selectedActivity.points}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <Button
                mode="outlined"
                onPress={() => setShowActivityModal(false)}
                style={{ flex: 1 }}
              >
                Maybe Later
              </Button>
              <Button
                mode="contained"
                onPress={startActivity}
                style={{ flex: 1 }}
                buttonColor={COLORS.primary}
              >
                Start Activity! 🚀
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <Animated.View 
        style={{ 
          flex: 1, 
          opacity: fadeAnim, 
          transform: [{ scale: scaleAnim }] 
        }}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.background}
            />
          }
        >
          {renderHeader()}
          {renderQuickActions()}
          {renderAchievements()}
          
          <View style={{ padding: SPACING.md }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              Fun Activities 🎮
            </Text>
            {funActivities.map(renderActivityCard)}
          </View>
        </ScrollView>

        <FAB
          icon="add"
          style={[styles.fab, { backgroundColor: COLORS.primary }]}
          onPress={() => Alert.alert('🚀 Feature Coming Soon!', 'Custom activity creation coming soon!')}
        />

        {renderActivityModal()}
      </Animated.View>
    </View>
  );
};

const styles = {
  statCard: {
    padding: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    minWidth: 80,
  },
  quickAction: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    minWidth: 80,
    elevation: 2,
  },
  achievementCard: {
    marginRight: SPACING.sm,
    minWidth: 80,
    elevation: 3,
  },
  activityCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  completedCard: {
    opacity: 0.8,
  },
  cardGradient: {
    borderRadius: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: 16,
    elevation: 5,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
};

export default FunActivities;