import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  Vibration,
  TextInput,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
  ProgressBar,
  Badge,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

const { width } = Dimensions.get('window');

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const GroupSessions = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('upcoming');
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    type: 'fitness',
    duration: 60,
    maxParticipants: 12,
    location: '',
    date: '',
    time: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const sessionTypes = [
    { id: 'fitness', label: 'Fitness', icon: 'fitness-center', color: COLORS.primary },
    { id: 'yoga', label: 'Yoga', icon: 'self-improvement', color: COLORS.success },
    { id: 'hiit', label: 'HIIT', icon: 'flash-on', color: COLORS.error },
    { id: 'strength', label: 'Strength', icon: 'fitness-center', color: COLORS.secondary },
    { id: 'cardio', label: 'Cardio', icon: 'directions-run', color: COLORS.warning },
    { id: 'sports', label: 'Sports', icon: 'sports-soccer', color: COLORS.primary },
  ];

  const filters = [
    { id: 'upcoming', label: 'Upcoming', icon: 'schedule' },
    { id: 'today', label: 'Today', icon: 'today' },
    { id: 'completed', label: 'Completed', icon: 'check-circle' },
    { id: 'cancelled', label: 'Cancelled', icon: 'cancel' },
  ];

  // Mock data - replace with Redux state
  useEffect(() => {
    loadSessions();
    animateEntrance();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [searchQuery, selectedFilter, sessions]);

  const loadSessions = () => {
    // Mock sessions data
    const mockSessions = [
      {
        id: 1,
        title: 'Morning HIIT Blast',
        description: 'High-intensity interval training for all fitness levels',
        type: 'hiit',
        duration: 45,
        maxParticipants: 15,
        currentParticipants: 12,
        location: 'Studio A',
        date: '2024-02-25',
        time: '07:00',
        status: 'upcoming',
        participants: [
          { id: 1, name: 'John Doe', status: 'confirmed', avatar: null },
          { id: 2, name: 'Sarah Wilson', status: 'confirmed', avatar: null },
          { id: 3, name: 'Mike Johnson', status: 'waitlist', avatar: null },
        ],
        recurring: true,
        recurringPattern: 'weekly',
        createdAt: '2024-02-20T09:00:00Z',
      },
      {
        id: 2,
        title: 'Strength & Conditioning',
        description: 'Build strength and improve conditioning with compound movements',
        type: 'strength',
        duration: 75,
        maxParticipants: 10,
        currentParticipants: 8,
        location: 'Gym Floor',
        date: '2024-02-24',
        time: '18:30',
        status: 'upcoming',
        participants: [
          { id: 4, name: 'Emma Davis', status: 'confirmed', avatar: null },
          { id: 5, name: 'Alex Brown', status: 'confirmed', avatar: null },
        ],
        recurring: false,
        createdAt: '2024-02-21T14:30:00Z',
      },
      {
        id: 3,
        title: 'Yoga Flow',
        description: 'Relaxing vinyasa flow for flexibility and mindfulness',
        type: 'yoga',
        duration: 60,
        maxParticipants: 20,
        currentParticipants: 16,
        location: 'Studio B',
        date: '2024-02-23',
        time: '19:00',
        status: 'completed',
        participants: [
          { id: 6, name: 'Lisa Garcia', status: 'attended', avatar: null },
          { id: 7, name: 'Tom Anderson', status: 'attended', avatar: null },
          { id: 8, name: 'Kate Miller', status: 'no-show', avatar: null },
        ],
        recurring: true,
        recurringPattern: 'weekly',
        rating: 4.8,
        feedback: 'Great session! More balance poses next time.',
        createdAt: '2024-02-18T16:00:00Z',
      },
    ];
    setSessions(mockSessions);
  };

  const filterSessions = useCallback(() => {
    let filtered = sessions;

    // Filter by status
    if (selectedFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(session => session.date === today);
    } else if (selectedFilter !== 'upcoming') {
      filtered = filtered.filter(session => session.status === selectedFilter);
    } else {
      filtered = filtered.filter(session => 
        session.status === 'upcoming' || session.status === 'confirmed'
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA - dateTimeB;
    });

    setFilteredSessions(filtered);
  }, [sessions, searchQuery, selectedFilter]);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    setTimeout(() => {
      loadSessions();
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleCreateSession = () => {
    if (!newSession.title.trim() || !newSession.date || !newSession.time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const session = {
      id: Date.now(),
      ...newSession,
      currentParticipants: 0,
      participants: [],
      status: 'upcoming',
      recurring: false,
      createdAt: new Date().toISOString(),
    };

    setSessions(prev => [session, ...prev]);
    setNewSession({
      title: '',
      description: '',
      type: 'fitness',
      duration: 60,
      maxParticipants: 12,
      location: '',
      date: '',
      time: '',
    });
    setShowCreateModal(false);
    Vibration.vibrate([50, 50, 100]);

    setTimeout(() => {
      Alert.alert('Success! 🎉', 'Group session created successfully');
    }, 300);
  };

  const handleAttendance = (session) => {
    setSelectedSession(session);
    setShowAttendanceModal(true);
  };

  const handleCancelSession = (sessionId) => {
    Alert.alert(
      'Cancel Session',
      'Are you sure you want to cancel this session? Participants will be notified.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setSessions(prev => 
              prev.map(session => 
                session.id === sessionId 
                  ? { ...session, status: 'cancelled' }
                  : session
              )
            );
            Vibration.vibrate(100);
            Alert.alert('Session Cancelled', 'Participants have been notified');
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) return 'Today';
    if (dateString === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getSessionTypeData = (type) => {
    return sessionTypes.find(st => st.id === type) || sessionTypes[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const calculateStats = () => {
    const upcoming = sessions.filter(s => s.status === 'upcoming').length;
    const today = sessions.filter(s => 
      s.date === new Date().toISOString().split('T')[0]
    ).length;
    const totalParticipants = sessions.reduce((sum, s) => sum + s.currentParticipants, 0);
    
    return { upcoming, today, totalParticipants };
  };

  const renderHeader = () => {
    const stats = calculateStats();
    
    return (
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Group Sessions 👥</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.upcoming}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.today}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalParticipants}</Text>
              <Text style={styles.statLabel}>Active Members</Text>
            </Surface>
          </View>
          
          <Searchbar
            placeholder="Search sessions, locations..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
          />
        </View>
      </LinearGradient>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => {
              setSelectedFilter(filter.id);
              Vibration.vibrate(30);
            }}
          >
            <Chip
              mode={selectedFilter === filter.id ? 'flat' : 'outlined'}
              selected={selectedFilter === filter.id}
              onPress={() => setSelectedFilter(filter.id)}
              icon={filter.icon}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && {
                  backgroundColor: COLORS.primary + '20',
                  borderColor: COLORS.primary,
                }
              ]}
              textStyle={[
                styles.filterChipText,
                selectedFilter === filter.id && { color: COLORS.primary }
              ]}
            >
              {filter.label}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSessionCard = (session, index) => {
    const typeData = getSessionTypeData(session.type);
    const occupancyRate = session.currentParticipants / session.maxParticipants;
    
    return (
      <Animated.View
        key={session.id}
        style={[
          styles.sessionCardContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Card style={styles.sessionCard}>
          <Card.Content style={styles.sessionCardContent}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionHeaderLeft}>
                <Surface style={[styles.typeIconContainer, { backgroundColor: typeData.color + '20' }]}>
                  <Icon name={typeData.icon} size={24} color={typeData.color} />
                </Surface>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle} numberOfLines={1}>
                    {session.title}
                  </Text>
                  <Text style={styles.sessionSubtitle}>
                    {formatDate(session.date)} • {formatTime(session.time)} • {session.duration}min
                  </Text>
                </View>
              </View>
              
              <View style={styles.sessionHeaderRight}>
                <Badge
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(session.status) }
                  ]}
                >
                  {session.status}
                </Badge>
              </View>
            </View>

            <Text style={styles.sessionDescription} numberOfLines={2}>
              {session.description}
            </Text>

            <View style={styles.sessionDetails}>
              <View style={styles.locationContainer}>
                <Icon name="location-on" size={16} color={COLORS.textSecondary} />
                <Text style={styles.locationText}>{session.location}</Text>
              </View>
              
              {session.recurring && (
                <Chip
                  mode="outlined"
                  compact
                  icon="repeat"
                  style={styles.recurringChip}
                  textStyle={styles.recurringChipText}
                >
                  {session.recurringPattern}
                </Chip>
              )}
            </View>

            <View style={styles.participantsSection}>
              <View style={styles.participantsHeader}>
                <Text style={styles.participantsTitle}>
                  Participants ({session.currentParticipants}/{session.maxParticipants})
                </Text>
                <Text style={[
                  styles.occupancyText,
                  { color: occupancyRate > 0.8 ? COLORS.error : COLORS.success }
                ]}>
                  {Math.round(occupancyRate * 100)}% full
                </Text>
              </View>
              
              <ProgressBar
                progress={occupancyRate}
                color={occupancyRate > 0.8 ? COLORS.error : COLORS.primary}
                style={styles.occupancyBar}
              />

              <View style={styles.participantAvatars}>
                {session.participants.slice(0, 5).map((participant, idx) => (
                  <Avatar.Text
                    key={participant.id}
                    size={32}
                    label={participant.name.split(' ').map(n => n[0]).join('')}
                    style={[styles.participantAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                  />
                ))}
                {session.participants.length > 5 && (
                  <Surface style={styles.moreParticipants}>
                    <Text style={styles.moreParticipantsText}>
                      +{session.participants.length - 5}
                    </Text>
                  </Surface>
                )}
              </View>
            </View>

            {session.status === 'completed' && session.rating && (
              <View style={styles.feedbackSection}>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.ratingText}>{session.rating}/5.0</Text>
                </View>
                {session.feedback && (
                  <Text style={styles.feedbackText} numberOfLines={2}>
                    "{session.feedback}"
                  </Text>
                )}
              </View>
            )}

            <View style={styles.sessionActions}>
              {session.status === 'upcoming' && (
                <>
                  <Button
                    mode="outlined"
                    onPress={() => handleAttendance(session)}
                    style={styles.actionButton}
                    icon="how-to-reg"
                    compact
                  >
                    Attendance
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      Alert.alert('Edit Session', 'Edit functionality coming soon! ✏️');
                    }}
                    style={styles.actionButton}
                    icon="edit"
                    compact
                  >
                    Edit
                  </Button>
                  <IconButton
                    icon="cancel"
                    size={20}
                    iconColor={COLORS.error}
                    onPress={() => handleCancelSession(session.id)}
                  />
                </>
              )}
              
              {session.status === 'completed' && (
                <Button
                  mode="outlined"
                  onPress={() => {
                    Alert.alert('Session Report', 'Report functionality coming soon! 📊');
                  }}
                  style={styles.actionButton}
                  icon="assessment"
                  compact
                >
                  View Report
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderCreateSessionModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Group Session</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowCreateModal(false)}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Session Title *</Text>
              <TextInput
                style={styles.textInput}
                value={newSession.title}
                onChangeText={(text) => setNewSession(prev => ({ ...prev, title: text }))}
                placeholder="e.g., Morning HIIT Blast"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newSession.description}
                onChangeText={(text) => setNewSession(prev => ({ ...prev, description: text }))}
                placeholder="Describe the session..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Session Type</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.typeSelector}
              >
                {sessionTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => setNewSession(prev => ({ ...prev, type: type.id }))}
                  >
                    <Chip
                      mode={newSession.type === type.id ? 'flat' : 'outlined'}
                      selected={newSession.type === type.id}
                      icon={type.icon}
                      style={[
                        styles.modalTypeChip,
                        newSession.type === type.id && {
                          backgroundColor: type.color + '20',
                          borderColor: type.color,
                        }
                      ]}
                    >
                      {type.label}
                    </Chip>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Duration (min) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newSession.duration.toString()}
                  onChangeText={(text) => setNewSession(prev => ({ ...prev, duration: parseInt(text) || 60 }))}
                  placeholder="60"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Max Participants *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newSession.maxParticipants.toString()}
                  onChangeText={(text) => setNewSession(prev => ({ ...prev, maxParticipants: parseInt(text) || 12 }))}
                  placeholder="12"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.textInput}
                value={newSession.location}
                onChangeText={(text) => setNewSession(prev => ({ ...prev, location: text }))}
                placeholder="e.g., Studio A, Gym Floor"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Date *</Text>
                <TouchableOpacity
                  style={styles.textInput}
                  onPress={() => Alert.alert('Date Picker', 'Date picker coming soon! 📅')}
                >
                  <Text style={[styles.dateTimeText, !newSession.date && styles.placeholder]}>
                    {newSession.date || 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Time *</Text>
                <TouchableOpacity
                  style={styles.textInput}
                  onPress={() => Alert.alert('Time Picker', 'Time picker coming soon! 🕐')}
                >
                  <Text style={[styles.dateTimeText, !newSession.time && styles.placeholder]}>
                    {newSession.time || 'Select time'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowCreateModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateSession}
              style={[styles.modalButton, styles.primaryButton]}
              buttonColor={COLORS.primary}
            >
              Create Session
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  const renderAttendanceModal = () => (
    <Portal>
      <Modal
        visible={showAttendanceModal}
        onDismiss={() => setShowAttendanceModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedSession?.title} - Attendance
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowAttendanceModal(false)}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.attendanceInfo}>
              Track attendance for {selectedSession?.currentParticipants} participants
            </Text>
            
            <View style={styles.attendanceList}>
              {selectedSession?.participants.map((participant) => (
                <View key={participant.id} style={styles.attendanceItem}>
                  <Avatar.Text
                    size={40}
                    label={participant.name.split(' ').map(n => n[0]).join('')}
                    style={styles.attendanceAvatar}
                  />
                  <View style={styles.attendanceDetails}>
                    <Text style={styles.attendanceName}>{participant.name}</Text>
                    <Text style={styles.attendanceStatus}>
                      Status: {participant.status}
                    </Text>
                  </View>
                  <View style={styles.attendanceActions}>
                    <IconButton
                      icon="check"
                      size={20}
                      iconColor={COLORS.success}
                      onPress={() => {
                        Alert.alert('Mark Attended', 'Attendance marked! ✅');
                      }}
                    />
                    <IconButton
                      icon="close"
                      size={20}
                      iconColor={COLORS.error}
                      onPress={() => {
                        Alert.alert('Mark Absent', 'Marked as no-show ❌');
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="contained"
              onPress={() => setShowAttendanceModal(false)}
              style={[styles.modalButton, styles.primaryButton]}
              buttonColor={COLORS.success}
              icon="save"
            >
              Save Attendance
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="group-add" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Group Sessions</Text>
      <Text style={styles.emptyStateText}>
        Create your first group session to start building your community of trainees
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowCreateModal(true)}
        style={styles.emptyStateButton}
        buttonColor={COLORS.primary}
        icon="add"
      >
        Create Group Session
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {renderHeader()}
      {renderFilters()}

      <ScrollView
        style={styles.content}
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
        {filteredSessions.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.sessionsList}>
            {filteredSessions.map((session, index) => renderSessionCard(session, index))}
            <View style={styles.bottomPadding} />
          </View>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setShowCreateModal(true)}
        color="white"
        customSize={56}
      />

      {renderCreateSessionModal()}
      {renderAttendanceModal()}
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
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    marginHorizontal: SPACING.xs,
  },
  statNumber: {
    ...TEXT_STYLES.subheading,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.sm,
    elevation: 2,
  },
  filtersScroll: {
    paddingHorizontal: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  filterChipText: {
    ...TEXT_STYLES.caption,
  },
  content: {
    flex: 1,
  },
  sessionsList: {
    padding: SPACING.md,
  },
  sessionCardContainer: {
    marginBottom: SPACING.md,
  },
  sessionCard: {
    elevation: 3,
    borderRadius: 12,
  },
  sessionCardContent: {
    padding: SPACING.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  sessionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    elevation: 2,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...TEXT_STYLES.subheading,
    fontSize: 16,
    marginBottom: 2,
  },
  sessionSubtitle: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  sessionHeaderRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  sessionDescription: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  recurringChip: {
    height: 24,
  },
  recurringChipText: {
    fontSize: 10,
  },
  participantsSection: {
    marginBottom: SPACING.md,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  participantsTitle: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    fontWeight: '500',
  },
  occupancyText: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    fontWeight: '500',
  },
  occupancyBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  participantAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: COLORS.primary + '20',
  },
  moreParticipants: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.textSecondary + '20',
    marginLeft: -8,
  },
  moreParticipantsText: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    fontWeight: '500',
  },
  feedbackSection: {
    marginBottom: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  feedbackText: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    marginRight: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.heading,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
    elevation: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalSurface: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: '90%',
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.subheading,
    flex: 1,
  },
  modalContent: {
    maxHeight: 500,
  },
  inputContainer: {
    padding: SPACING.md,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    ...TEXT_STYLES.body,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  typeSelector: {
    flexDirection: 'row',
  },
  modalTypeChip: {
    marginRight: SPACING.sm,
  },
  dateTimeText: {
    ...TEXT_STYLES.body,
  },
  placeholder: {
    color: COLORS.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  attendanceInfo: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  attendanceList: {
    paddingHorizontal: SPACING.md,
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  attendanceAvatar: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.primary + '20',
  },
  attendanceDetails: {
    flex: 1,
  },
  attendanceName: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  attendanceStatus: {
    ...TEXT_STYLES.caption,
    textTransform: 'capitalize',
  },
  attendanceActions: {
    flexDirection: 'row',
  },
  bottomPadding: {
    height: 80,
  },
});

export default GroupSessions;