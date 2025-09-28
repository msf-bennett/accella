import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Modal,
  RefreshControl,
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
  Searchbar,
} from 'react-native-paper';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { BlurView } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
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
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const LiveSessionTracking = ({ navigation }) => {
  // Redux state
  const { user, currentSession, players } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Local state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [currentDrill, setCurrentDrill] = useState(null);
  const [playerAttendance, setPlayerAttendance] = useState({});
  const [playerPerformance, setPlayerPerformance] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Mock data
  const [sessionData] = useState({
    id: 'session_001',
    title: 'Advanced Ball Control',
    date: new Date().toISOString(),
    duration: 90, // minutes
    players: [
      { id: '1', name: 'John Smith', avatar: null, status: 'present' },
      { id: '2', name: 'Mike Johnson', avatar: null, status: 'present' },
      { id: '3', name: 'Alex Wilson', avatar: null, status: 'late' },
      { id: '4', name: 'Chris Brown', avatar: null, status: 'absent' },
      { id: '5', name: 'David Lee', avatar: null, status: 'present' },
    ],
    drills: [
      { id: 'drill_1', name: 'Cone Dribbling', duration: 15, completed: true },
      { id: 'drill_2', name: 'Passing Accuracy', duration: 20, completed: true },
      { id: 'drill_3', name: '1v1 Practice', duration: 25, completed: false, active: true },
      { id: 'drill_4', name: 'Small-sided Game', duration: 30, completed: false },
    ]
  });

  // Initialize animations
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

    // Pulse animation for active session
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (sessionActive) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
    }

    return () => pulseAnimation.stop();
  }, [sessionActive]);

  // Session timer
  useEffect(() => {
    let interval;
    if (sessionActive) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  // Format timer display
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handlers
  const handleStartSession = useCallback(() => {
    setSessionActive(true);
    setSessionTimer(0);
    Alert.alert('Session Started! 🚀', 'Live tracking is now active');
  }, []);

  const handleStopSession = useCallback(() => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this training session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            setSessionActive(false);
            navigation.navigate('SessionSummary', { sessionId: sessionData.id });
          },
        },
      ]
    );
  }, [navigation, sessionData.id]);

  const handlePlayerCheck = useCallback((playerId, status) => {
    setPlayerAttendance(prev => ({
      ...prev,
      [playerId]: status,
    }));
  }, []);

  const handleDrillComplete = useCallback((drillId) => {
    Alert.alert('Drill Completed! ✅', 'Great progress! Moving to next activity.');
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  // Render player card
  const renderPlayerCard = (player) => (
    <TouchableOpacity
      key={player.id}
      onPress={() => {
        setSelectedPlayer(player);
        setShowPlayerModal(true);
      }}
      style={styles.playerCard}
    >
      <Surface style={styles.playerSurface} elevation={2}>
        <View style={styles.playerInfo}>
          <Avatar.Text
            size={40}
            label={player.name.split(' ').map(n => n[0]).join('')}
            style={[styles.playerAvatar, {
              backgroundColor: player.status === 'present' ? COLORS.success :
                               player.status === 'late' ? COLORS.warning : COLORS.error
            }]}
          />
          <View style={styles.playerDetails}>
            <Text style={TEXT_STYLES.body}>{player.name}</Text>
            <View style={styles.statusContainer}>
              <Chip
                mode="flat"
                style={[styles.statusChip, {
                  backgroundColor: player.status === 'present' ? COLORS.success :
                                  player.status === 'late' ? COLORS.warning : COLORS.error
                }]}
                textStyle={styles.statusText}
              >
                {player.status.toUpperCase()}
              </Chip>
            </View>
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => {
              setSelectedPlayer(player);
              setShowPlayerModal(true);
            }}
          />
        </View>
      </Surface>
    </TouchableOpacity>
  );

  // Render drill card
  const renderDrillCard = (drill) => (
    <Card key={drill.id} style={styles.drillCard}>
      <Card.Content>
        <View style={styles.drillHeader}>
          <View style={styles.drillInfo}>
            <Text style={TEXT_STYLES.h3}>{drill.name}</Text>
            <Text style={TEXT_STYLES.caption}>{drill.duration} minutes</Text>
          </View>
          <View style={styles.drillStatus}>
            {drill.completed ? (
              <Icon name="check-circle" size={24} color={COLORS.success} />
            ) : drill.active ? (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Icon name="play-circle-filled" size={24} color={COLORS.primary} />
              </Animated.View>
            ) : (
              <Icon name="radio-button-unchecked" size={24} color={COLORS.textSecondary} />
            )}
          </View>
        </View>
        
        {drill.active && (
          <View style={styles.activeDrillControls}>
            <Button
              mode="contained"
              onPress={() => handleDrillComplete(drill.id)}
              style={styles.completeButton}
            >
              Complete Drill
            </Button>
            <IconButton
              icon="pause"
              size={20}
              onPress={() => Alert.alert('Drill Paused', 'You can resume anytime')}
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Live Session</Text>
          <Text style={styles.headerSubtitle}>{sessionData.title}</Text>
          
          <View style={styles.sessionTimer}>
            <Icon name="timer" size={24} color={COLORS.white} />
            <Text style={styles.timerText}>{formatTime(sessionTimer)}</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
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
          {/* Session Controls */}
          <Card style={styles.controlCard}>
            <Card.Content>
              <Text style={TEXT_STYLES.h3}>Session Control 🎯</Text>
              <View style={styles.controlButtons}>
                {!sessionActive ? (
                  <Button
                    mode="contained"
                    onPress={handleStartSession}
                    style={styles.startButton}
                    icon="play-arrow"
                  >
                    Start Session
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    onPress={handleStopSession}
                    style={styles.stopButton}
                    icon="stop"
                  >
                    End Session
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Current Drill */}
          <Card style={styles.currentDrillCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.currentDrillGradient}
            >
              <Card.Content>
                <Text style={styles.currentDrillTitle}>Current Activity 🏃‍♂️</Text>
                {sessionData.drills.find(d => d.active) ? (
                  <View>
                    <Text style={styles.currentDrillName}>
                      {sessionData.drills.find(d => d.active).name}
                    </Text>
                    <ProgressBar
                      progress={0.6}
                      color={COLORS.white}
                      style={styles.progressBar}
                    />
                    <Text style={styles.progressText}>60% Complete</Text>
                  </View>
                ) : (
                  <Text style={styles.noDrillText}>No active drill</Text>
                )}
              </Card.Content>
            </LinearGradient>
          </Card>

          {/* Player Attendance */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text style={TEXT_STYLES.h3}>Players ({sessionData.players.length}) 👥</Text>
                <IconButton
                  icon="refresh"
                  size={20}
                  onPress={() => Alert.alert('Refreshed!', 'Player status updated')}
                />
              </View>
              
              <View style={styles.attendanceStats}>
                <Chip mode="flat" style={[styles.statChip, { backgroundColor: COLORS.success }]}>
                  Present: {sessionData.players.filter(p => p.status === 'present').length}
                </Chip>
                <Chip mode="flat" style={[styles.statChip, { backgroundColor: COLORS.warning }]}>
                  Late: {sessionData.players.filter(p => p.status === 'late').length}
                </Chip>
                <Chip mode="flat" style={[styles.statChip, { backgroundColor: COLORS.error }]}>
                  Absent: {sessionData.players.filter(p => p.status === 'absent').length}
                </Chip>
              </View>

              <Searchbar
                placeholder="Search players..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
              />

              <View style={styles.playersContainer}>
                {sessionData.players
                  .filter(player => 
                    player.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(renderPlayerCard)}
              </View>
            </Card.Content>
          </Card>

          {/* Training Drills */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={TEXT_STYLES.h3}>Training Plan 📋</Text>
              <View style={styles.drillsContainer}>
                {sessionData.drills.map(renderDrillCard)}
              </View>
            </Card.Content>
          </Card>

          {/* Session Notes */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={TEXT_STYLES.h3}>Quick Notes 📝</Text>
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Session notes will be available in the next update')}
                style={styles.notesButton}
                icon="note-add"
              >
                Add Session Notes
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowDrillModal(true)}
        color={COLORS.white}
      />

      {/* Player Modal */}
      <Portal>
        <Modal
          visible={showPlayerModal}
          onDismiss={() => setShowPlayerModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={80} style={styles.modalBlur}>
            <Card style={styles.playerModal}>
              <Card.Content>
                <Text style={TEXT_STYLES.h2}>Player Details</Text>
                {selectedPlayer && (
                  <View style={styles.playerModalContent}>
                    <Avatar.Text
                      size={60}
                      label={selectedPlayer.name.split(' ').map(n => n[0]).join('')}
                      style={styles.playerModalAvatar}
                    />
                    <Text style={TEXT_STYLES.h3}>{selectedPlayer.name}</Text>
                    <Text style={TEXT_STYLES.caption}>Status: {selectedPlayer.status}</Text>
                    
                    <View style={styles.playerModalActions}>
                      <Button
                        mode="outlined"
                        onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Player performance tracking will be available soon')}
                        style={styles.modalButton}
                      >
                        View Performance
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => setShowPlayerModal(false)}
                        style={styles.modalButton}
                      >
                        Close
                      </Button>
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.md,
  },
  sessionTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 25,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  controlCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  controlButtons: {
    marginTop: SPACING.md,
  },
  startButton: {
    backgroundColor: COLORS.success,
  },
  stopButton: {
    backgroundColor: COLORS.error,
  },
  currentDrillCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  currentDrillGradient: {
    padding: 0,
  },
  currentDrillTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  currentDrillName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressText: {
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontSize: 14,
  },
  noDrillText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  sectionCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statChip: {
    opacity: 0.9,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  playersContainer: {
    gap: SPACING.sm,
  },
  playerCard: {
    marginBottom: SPACING.sm,
  },
  playerSurface: {
    borderRadius: 8,
    padding: SPACING.md,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    marginRight: SPACING.md,
  },
  playerDetails: {
    flex: 1,
  },
  statusContainer: {
    marginTop: SPACING.xs,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  drillsContainer: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  drillCard: {
    borderRadius: 8,
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drillInfo: {
    flex: 1,
  },
  drillStatus: {
    marginLeft: SPACING.md,
  },
  activeDrillControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  completeButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  notesButton: {
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  playerModal: {
    margin: SPACING.md,
    borderRadius: 12,
  },
  playerModalContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  playerModalAvatar: {
    marginBottom: SPACING.md,
  },
  playerModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
});

export default LiveSessionTracking;