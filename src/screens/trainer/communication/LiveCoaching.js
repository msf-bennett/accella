import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  RefreshControl,
  Vibration,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
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
  Badge,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LiveCoaching = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Redux state
  const user = useSelector(state => state.auth.user);
  const activeClients = useSelector(state => state.coaching.activeClients);
  const liveSession = useSelector(state => state.coaching.liveSession);
  
  // Local state
  const [isLive, setIsLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [heartRate, setHeartRate] = useState(128);
  const [currentExercise, setCurrentExercise] = useState('Push-ups');
  const [repsCount, setRepsCount] = useState(15);
  const [setCount, setSetCount] = useState(2);
  const [restTimer, setRestTimer] = useState(60);
  const [clientMessages, setClientMessages] = useState([]);
  const [showVitalStats, setShowVitalStats] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Mock data for demonstration
  const mockActiveClients = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      currentWorkout: 'Upper Body Strength',
      progress: 0.65,
      heartRate: 142,
      status: 'active',
      lastActivity: '2 mins ago'
    },
    {
      id: '2',
      name: 'Mike Davis',
      avatar: 'https://i.pravatar.cc/150?img=2',
      currentWorkout: 'HIIT Cardio',
      progress: 0.40,
      heartRate: 156,
      status: 'active',
      lastActivity: 'Just now'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?img=3',
      currentWorkout: 'Core & Flexibility',
      progress: 0.80,
      heartRate: 118,
      status: 'resting',
      lastActivity: '5 mins ago'
    }
  ];

  const mockMessages = [
    { id: '1', client: 'Sarah', message: 'Feeling great! 💪', time: '12:45' },
    { id: '2', client: 'Mike', message: 'Need 30 sec break', time: '12:44' },
    { id: '3', client: 'Emma', message: 'Ready for next set!', time: '12:43' },
  ];

  // Effects
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isLive) {
      const timer = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLive]);

  useEffect(() => {
    const pulseTimer = setInterval(() => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    }, 2000);

    return () => clearInterval(pulseTimer);
  }, []);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const startLiveSession = () => {
    setIsLive(true);
    Vibration.vibrate(100);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
    Alert.alert('🎯 Live Session Started!', 'You are now live with your clients');
  };

  const endLiveSession = () => {
    Alert.alert(
      '🛑 End Live Session',
      'Are you sure you want to end the current live session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            setIsLive(false);
            setSessionTimer(0);
            Animated.timing(slideAnim, {
              toValue: screenHeight,
              duration: 500,
              useNativeDriver: true,
            }).start();
            Alert.alert('✅ Session Ended', 'Live session has been completed successfully!');
          }
        }
      ]
    );
  };

  const sendQuickMessage = (message) => {
    Alert.alert('📱 Message Sent', `Quick message "${message}" sent to active clients`);
    Vibration.vibrate(50);
  };

  const adjustExercise = (type) => {
    Alert.alert('🏋️ Exercise Updated', `${type} adjustment sent to clients`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderClientCard = (client) => (
    <Card key={client.id} style={styles.clientCard}>
      <View style={styles.clientHeader}>
        <Avatar.Image size={50} source={{ uri: client.avatar }} />
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.clientWorkout}>{client.currentWorkout}</Text>
          <View style={styles.clientStatus}>
            <View style={[styles.statusDot, { backgroundColor: client.status === 'active' ? COLORS.success : COLORS.warning }]} />
            <Text style={styles.lastActivity}>{client.lastActivity}</Text>
          </View>
        </View>
        <View style={styles.clientStats}>
          <Text style={styles.heartRateText}>❤️ {client.heartRate}</Text>
          <Text style={styles.progressText}>{Math.round(client.progress * 100)}%</Text>
        </View>
      </View>
      <ProgressBar progress={client.progress} color={COLORS.primary} style={styles.progressBar} />
      <View style={styles.clientActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('📞 Calling', `Calling ${client.name}...`)}>
          <Icon name="call" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('💬 Messaging', `Opening chat with ${client.name}`)}>
          <Icon name="chat" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowVitalStats(true)}>
          <Icon name="monitor-heart" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderLiveControls = () => (
    <Animated.View style={[styles.liveControls, { transform: [{ translateY: slideAnim }] }]}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.liveHeader}>
        <View style={styles.liveStatus}>
          <Animated.View style={[styles.liveIndicator, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.liveText}>LIVE</Text>
          <Text style={styles.sessionTime}>{formatTime(sessionTimer)}</Text>
        </View>
        <TouchableOpacity onPress={endLiveSession} style={styles.endButton}>
          <Icon name="stop" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.liveContent} showsVerticalScrollIndicator={false}>
        <View style={styles.currentExerciseSection}>
          <Text style={styles.sectionTitle}>🏋️ Current Exercise</Text>
          <Card style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{currentExercise}</Text>
              <Chip icon="timer" mode="outlined">Set {setCount}/4</Chip>
            </View>
            <View style={styles.exerciseStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{repsCount}</Text>
                <Text style={styles.statLabel}>Reps</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{restTimer}s</Text>
                <Text style={styles.statLabel}>Rest</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>⚡</Text>
                <Text style={styles.statLabel}>Intensity</Text>
              </View>
            </View>
            <View style={styles.exerciseActions}>
              <Button mode="outlined" onPress={() => adjustExercise('Decrease Reps')} compact>-</Button>
              <Button mode="contained" onPress={() => Alert.alert('⏭️ Next Exercise', 'Moving to next exercise...')} compact>Next</Button>
              <Button mode="outlined" onPress={() => adjustExercise('Increase Reps')} compact>+</Button>
            </View>
          </Card>
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickAction} onPress={() => sendQuickMessage('Take a 30 second break')}>
              <Icon name="pause" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Break</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => sendQuickMessage('Great form! Keep it up!')}>
              <Icon name="thumb-up" size={24} color={COLORS.success} />
              <Text style={styles.quickActionText}>Encourage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => sendQuickMessage('Focus on your breathing')}>
              <Icon name="air" size={24} color={COLORS.secondary} />
              <Text style={styles.quickActionText}>Breathe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => sendQuickMessage('Increase intensity!')}>
              <Icon name="trending-up" size={24} color={COLORS.error} />
              <Text style={styles.quickActionText}>Intensify</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.messagesSection}>
          <Text style={styles.sectionTitle}>💬 Recent Messages</Text>
          {mockMessages.map((message) => (
            <Card key={message.id} style={styles.messageCard}>
              <View style={styles.messageContent}>
                <View>
                  <Text style={styles.messageName}>{message.client}</Text>
                  <Text style={styles.messageText}>{message.message}</Text>
                </View>
                <Text style={styles.messageTime}>{message.time}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Live Coaching</Text>
            <Text style={styles.subtitle}>Real-time Training Sessions</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton icon="notifications" iconColor="#fff" size={24} onPress={() => Alert.alert('📱 Notifications', 'Opening notifications...')} />
            {mockActiveClients.length > 0 && <Badge size={16} style={styles.notificationBadge}>{mockActiveClients.length}</Badge>}
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
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
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👥 Active Clients</Text>
              <Searchbar
                placeholder="Search clients..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                inputStyle={styles.searchInput}
              />
            </View>
            
            {mockActiveClients.length === 0 ? (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyContent}>
                  <Icon name="people-outline" size={64} color={COLORS.textSecondary} />
                  <Text style={styles.emptyTitle}>No Active Clients</Text>
                  <Text style={styles.emptySubtitle}>Your clients will appear here when they join live sessions</Text>
                </View>
              </Card>
            ) : (
              <View style={styles.clientsList}>
                {mockActiveClients.map(renderClientCard)}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Session Overview</Text>
            <Card style={styles.overviewCard}>
              <View style={styles.overviewStats}>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewNumber}>3</Text>
                  <Text style={styles.overviewLabel}>Active Clients</Text>
                </View>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewNumber}>142</Text>
                  <Text style={styles.overviewLabel}>Avg Heart Rate</Text>
                </View>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewNumber}>65%</Text>
                  <Text style={styles.overviewLabel}>Avg Progress</Text>
                </View>
              </View>
            </Card>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Training Programs</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.programsScroll}>
              {['HIIT Cardio', 'Strength Training', 'Yoga Flow', 'Core Blast'].map((program, index) => (
                <Card key={index} style={styles.programCard}>
                  <Text style={styles.programName}>{program}</Text>
                  <Text style={styles.programDuration}>45 mins</Text>
                  <Button mode="outlined" compact onPress={() => Alert.alert('🏋️ Program', `Loading ${program} session...`)}>
                    Start
                  </Button>
                </Card>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </Animated.View>

      {!isLive && (
        <FAB
          style={styles.fab}
          icon="play"
          label="Start Live Session"
          onPress={startLiveSession}
          color="#fff"
        />
      )}

      {isLive && renderLiveControls()}

      {showVitalStats && (
        <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
          <View style={styles.vitalStatsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📊 Vital Statistics</Text>
              <TouchableOpacity onPress={() => setShowVitalStats(false)}>
                <Icon name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.vitalStats}>
              <View style={styles.vitalStat}>
                <Text style={styles.vitalNumber}>❤️ 142</Text>
                <Text style={styles.vitalLabel}>Heart Rate</Text>
              </View>
              <View style={styles.vitalStat}>
                <Text style={styles.vitalNumber}>🔥 320</Text>
                <Text style={styles.vitalLabel}>Calories</Text>
              </View>
              <View style={styles.vitalStat}>
                <Text style={styles.vitalNumber}>⏱️ 28:45</Text>
                <Text style={styles.vitalLabel}>Duration</Text>
              </View>
            </View>
          </View>
        </BlurView>
      )}
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  searchBar: {
    backgroundColor: '#f5f5f5',
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  clientsList: {
    gap: SPACING.sm,
  },
  clientCard: {
    padding: SPACING.md,
    backgroundColor: '#fff',
    elevation: 2,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clientInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  clientName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  clientWorkout: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  clientStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  lastActivity: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  clientStats: {
    alignItems: 'flex-end',
  },
  heartRateText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  clientActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  emptyCard: {
    padding: SPACING.xl,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  overviewCard: {
    padding: SPACING.md,
    backgroundColor: '#fff',
    elevation: 2,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewNumber: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  overviewLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  programsScroll: {
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  programCard: {
    width: 120,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  programName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  programDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  liveControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  liveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff4444',
    marginRight: SPACING.sm,
  },
  liveText: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: SPACING.md,
  },
  sessionTime: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
  },
  endButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  liveContent: {
    flex: 1,
    padding: SPACING.md,
  },
  currentExerciseSection: {
    marginBottom: SPACING.lg,
  },
  exerciseCard: {
    padding: SPACING.md,
    backgroundColor: '#fff',
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  exerciseName: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  exerciseActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionsSection: {
    marginBottom: SPACING.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (screenWidth - SPACING.md * 2 - SPACING.sm) / 2,
    aspectRatio: 1.5,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontWeight: 'bold',
  },
  messagesSection: {
    marginBottom: SPACING.xl,
  },
  messageCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: '#fff',
    elevation: 1,
  },
  messageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageName: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  messageText: {
    ...TEXT_STYLES.body,
  },
  messageTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vitalStatsModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.lg,
    margin: SPACING.md,
    width: screenWidth * 0.8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  vitalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  vitalStat: {
    alignItems: 'center',
  },
  vitalNumber: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
  },
  vitalLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
};

export default LiveCoaching;