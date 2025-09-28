import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
  Alert,
  Vibration,
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
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9ff',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e1e8ed',
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
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

const MentalTraining = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSession, setActiveSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [weeklyStreak, setWeeklyStreak] = useState(5);
  const [completedSessions, setCompletedSessions] = useState(12);
  
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

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

  const mentalTrainingCategories = [
    { id: 'all', name: 'All', icon: 'psychology', color: COLORS.primary },
    { id: 'focus', name: 'Focus', icon: 'center-focus-strong', color: '#FF6B6B' },
    { id: 'confidence', name: 'Confidence', icon: 'emoji-emotions', color: '#4ECDC4' },
    { id: 'stress', name: 'Stress Relief', icon: 'self-improvement', color: '#45B7D1' },
    { id: 'motivation', name: 'Motivation', icon: 'local-fire-department', color: '#FFA07A' },
    { id: 'visualization', name: 'Visualization', icon: 'visibility', color: '#98D8C8' },
  ];

  const mentalTrainingSessions = [
    {
      id: 1,
      title: 'Pre-Game Focus Routine',
      description: 'Build concentration and mental clarity before competition',
      duration: '10 min',
      difficulty: 'Beginner',
      category: 'focus',
      completed: false,
      rating: 4.8,
      exercises: 5,
      icon: 'center-focus-strong',
      color: '#FF6B6B',
    },
    {
      id: 2,
      title: 'Confidence Building Meditation',
      description: 'Strengthen self-belief and positive mindset',
      duration: '15 min',
      difficulty: 'Intermediate',
      category: 'confidence',
      completed: true,
      rating: 4.9,
      exercises: 7,
      icon: 'emoji-emotions',
      color: '#4ECDC4',
    },
    {
      id: 3,
      title: 'Pressure Performance Training',
      description: 'Learn to thrive under pressure situations',
      duration: '20 min',
      difficulty: 'Advanced',
      category: 'stress',
      completed: false,
      rating: 4.7,
      exercises: 8,
      icon: 'fitness-center',
      color: '#45B7D1',
    },
    {
      id: 4,
      title: 'Victory Visualization',
      description: 'Mental rehearsal for peak performance',
      duration: '12 min',
      difficulty: 'Beginner',
      category: 'visualization',
      completed: false,
      rating: 4.6,
      exercises: 4,
      icon: 'visibility',
      color: '#98D8C8',
    },
    {
      id: 5,
      title: 'Motivation Booster',
      description: 'Reignite your passion and drive for excellence',
      duration: '8 min',
      difficulty: 'Beginner',
      category: 'motivation',
      completed: true,
      rating: 4.8,
      exercises: 3,
      icon: 'local-fire-department',
      color: '#FFA07A',
    },
  ];

  const quickActions = [
    { id: 1, title: 'Quick Focus', icon: 'timer', duration: '3 min', color: '#FF6B6B' },
    { id: 2, title: 'Breathing Exercise', icon: 'air', duration: '5 min', color: '#4ECDC4' },
    { id: 3, title: 'Positive Affirmations', icon: 'favorite', duration: '2 min', color: '#FFA07A' },
    { id: 4, title: 'Energy Reset', icon: 'refresh', duration: '4 min', color: '#98D8C8' },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filteredSessions = mentalTrainingSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || session.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const startSession = (session) => {
    Vibration.vibrate(50);
    setActiveSession(session);
    setShowSessionModal(true);
  };

  const completeQuickAction = (action) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🧠 Mental Training',
      `Starting ${action.title} - ${action.duration} session`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Begin', onPress: () => console.log('Quick action started') }
      ]
    );
  };

  const renderProgressHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        padding: SPACING.lg,
        borderRadius: 15,
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.lg,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
        <View>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white, marginBottom: SPACING.xs }]}>
            Mental Training Progress 🧠
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.9 }]}>
            Keep building your mental strength!
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>{weeklyStreak}</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.white, opacity: 0.9 }]}>day streak</Text>
        </View>
      </View>
      
      <View style={{ marginBottom: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>Today's Progress</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>{Math.round(dailyProgress * 100)}%</Text>
        </View>
        <ProgressBar 
          progress={dailyProgress} 
          color={COLORS.white}
          style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' }}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.body, { color: COLORS.white, fontWeight: 'bold' }]}>{completedSessions}</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.white, opacity: 0.9 }]}>Sessions</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.body, { color: COLORS.white, fontWeight: 'bold' }]}>4.8</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.white, opacity: 0.9 }]}>Avg Rating</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.body, { color: COLORS.white, fontWeight: 'bold' }]}>89</Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.white, opacity: 0.9 }]}>Minutes</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickActions = () => (
    <View style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.lg }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.text }]}>
        Quick Mental Boost ⚡
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => completeQuickAction(action)}
            style={{
              marginRight: SPACING.md,
              marginLeft: index === 0 ? 0 : 0,
            }}
          >
            <Surface
              style={{
                padding: SPACING.md,
                borderRadius: 12,
                width: 120,
                alignItems: 'center',
                backgroundColor: COLORS.white,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: action.color,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: SPACING.sm,
                }}
              >
                <Icon name={action.icon} size={24} color={COLORS.white} />
              </View>
              <Text style={[TEXT_STYLES.caption, { fontWeight: '600', textAlign: 'center', marginBottom: SPACING.xs }]}>
                {action.title}
              </Text>
              <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>
                {action.duration}
              </Text>
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCategories = () => (
    <View style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.lg }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, color: COLORS.text }]}>
        Training Categories 🎯
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {mentalTrainingCategories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={{ marginRight: SPACING.md, marginLeft: index === 0 ? 0 : 0 }}
          >
            <Chip
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={{
                backgroundColor: selectedCategory === category.id ? category.color : COLORS.white,
                borderWidth: 1,
                borderColor: category.color,
              }}
              textStyle={{
                color: selectedCategory === category.id ? COLORS.white : category.color,
                fontWeight: '600',
              }}
              icon={({ size, color }) => (
                <Icon 
                  name={category.icon} 
                  size={size} 
                  color={selectedCategory === category.id ? COLORS.white : category.color} 
                />
              )}
            >
              {category.name}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSessionCard = (session) => (
    <Card
      key={session.id}
      style={{
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        backgroundColor: COLORS.white,
        elevation: 3,
      }}
    >
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: session.color,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SPACING.md,
            }}
          >
            <Icon name={session.icon} size={24} color={COLORS.white} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600', flex: 1 }]}>
                {session.title}
              </Text>
              {session.completed && (
                <View style={{
                  backgroundColor: COLORS.success,
                  borderRadius: 10,
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: 2,
                }}>
                  <Text style={[TEXT_STYLES.small, { color: COLORS.white }]}>✓ Done</Text>
                </View>
              )}
            </View>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: SPACING.xs }]}>
              {session.description}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} style={{ marginRight: SPACING.xs }} />
            <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>{session.duration}</Text>
            <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary, marginLeft: SPACING.md }]}>
              {session.exercises} exercises
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="star" size={16} color={COLORS.warning} style={{ marginRight: SPACING.xs }} />
            <Text style={[TEXT_STYLES.small, { color: COLORS.textSecondary }]}>{session.rating}</Text>
          </View>
        </View>

        <Button
          mode={session.completed ? "outlined" : "contained"}
          onPress={() => startSession(session)}
          style={{ borderRadius: 25 }}
          buttonColor={session.completed ? COLORS.white : session.color}
          textColor={session.completed ? session.color : COLORS.white}
          icon={session.completed ? "replay" : "play-arrow"}
        >
          {session.completed ? "Practice Again" : "Start Session"}
        </Button>
      </Card.Content>
    </Card>
  );

  const renderSessionModal = () => (
    <Portal>
      <Modal
        visible={showSessionModal}
        onDismiss={() => setShowSessionModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.white,
          margin: SPACING.lg,
          borderRadius: 20,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {activeSession && (
          <View>
            <LinearGradient
              colors={[activeSession.color, activeSession.color + '99']}
              style={{ padding: SPACING.lg }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.white, marginBottom: SPACING.xs }]}>
                    {activeSession.title}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.9 }]}>
                    {activeSession.duration} • {activeSession.exercises} exercises
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  iconColor={COLORS.white}
                  size={24}
                  onPress={() => setShowSessionModal(false)}
                />
              </View>
            </LinearGradient>
            
            <View style={{ padding: SPACING.lg }}>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg, lineHeight: 22 }]}>
                {activeSession.description}
              </Text>
              
              <View style={{ flexDirection: 'row', marginBottom: SPACING.lg }}>
                <Chip
                  style={{ marginRight: SPACING.sm, backgroundColor: COLORS.background }}
                  textStyle={{ color: COLORS.text }}
                >
                  {activeSession.difficulty}
                </Chip>
                <Chip
                  style={{ backgroundColor: COLORS.background }}
                  textStyle={{ color: COLORS.text }}
                  icon="star"
                >
                  {activeSession.rating}
                </Chip>
              </View>

              <Button
                mode="contained"
                onPress={() => {
                  setShowSessionModal(false);
                  Alert.alert('🧠 Session Started', `Beginning ${activeSession.title}`, [
                    { text: 'OK', onPress: () => console.log('Session started') }
                  ]);
                }}
                style={{ borderRadius: 25, marginBottom: SPACING.sm }}
                buttonColor={activeSession.color}
                icon="play-arrow"
              >
                Begin Session
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => setShowSessionModal(false)}
                style={{ borderRadius: 25 }}
                textColor={activeSession.color}
              >
                Maybe Later
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={{ paddingTop: SPACING.lg, paddingBottom: 100 }}
        >
          {renderProgressHeader()}
          
          <Searchbar
            placeholder="Search mental training sessions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{
              marginHorizontal: SPACING.md,
              marginBottom: SPACING.lg,
              backgroundColor: COLORS.white,
              borderRadius: 25,
            }}
            iconColor={COLORS.primary}
          />

          {renderQuickActions()}
          {renderCategories()}

          <View style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
              Mental Training Sessions 💪
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.md }]}>
              {filteredSessions.length} sessions available
            </Text>
          </View>

          {filteredSessions.map(renderSessionCard)}
        </ScrollView>
      </Animated.View>

      {renderSessionModal()}

      <FAB
        icon="psychology"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('🧠 AI Coach', 'AI-powered mental training recommendations coming soon!', [
          { text: 'OK', onPress: () => console.log('AI Coach feature') }
        ])}
      />
    </View>
  );
};

export default MentalTraining;