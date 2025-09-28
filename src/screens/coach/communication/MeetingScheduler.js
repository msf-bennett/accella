import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Searchbar,
  Avatar,
  Chip,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  ProgressBar,
  Menu,
  Divider,
  RadioButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
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

const MeetingScheduler = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [viewMode, setViewMode] = useState('upcoming'); // upcoming, today, past
  const [menuVisible, setMenuVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Mock data - replace with real data from Redux store
  const [meetings, setMeetings] = useState([
    {
      id: '1',
      title: 'Performance Review - Alex Johnson',
      description: 'Quarterly performance discussion and goal setting',
      type: 'individual',
      participants: [
        { id: 'p1', name: 'Alex Johnson', type: 'player', avatar: 'https://i.pravatar.cc/100?img=1' },
        { id: 'p2', name: 'Sarah Johnson', type: 'parent', avatar: 'https://i.pravatar.cc/100?img=11' },
      ],
      date: '2025-08-20',
      time: '10:00',
      duration: 30,
      location: 'Coach Office',
      meetingType: 'in-person',
      status: 'scheduled',
      priority: 'medium',
      agenda: [
        'Review current performance',
        'Discuss training progress',
        'Set next quarter goals',
      ],
      createdAt: '2025-08-15T09:00:00Z',
    },
    {
      id: '2',
      title: 'Team Strategy Meeting',
      description: 'Discuss upcoming tournament strategy with coaching staff',
      type: 'team',
      participants: [
        { id: 'c1', name: 'Assistant Coach Mike', type: 'staff', avatar: 'https://i.pravatar.cc/100?img=3' },
        { id: 'c2', name: 'Fitness Trainer Lisa', type: 'staff', avatar: 'https://i.pravatar.cc/100?img=4' },
      ],
      date: '2025-08-16',
      time: '15:00',
      duration: 60,
      location: 'Conference Room',
      meetingType: 'in-person',
      status: 'scheduled',
      priority: 'high',
      agenda: [
        'Review opponent analysis',
        'Tactical formation discussion',
        'Player rotation strategy',
        'Recovery protocols',
      ],
      createdAt: '2025-08-14T14:00:00Z',
    },
    {
      id: '3',
      title: 'Parent-Coach Check-in',
      description: 'Monthly update with parents group',
      type: 'group',
      participants: [
        { id: 'p3', name: 'Jennifer Davis', type: 'parent', avatar: 'https://i.pravatar.cc/100?img=5' },
        { id: 'p4', name: 'Robert Wilson', type: 'parent', avatar: 'https://i.pravatar.cc/100?img=6' },
        { id: 'p5', name: 'Maria Garcia', type: 'parent', avatar: 'https://i.pravatar.cc/100?img=7' },
      ],
      date: '2025-08-17',
      time: '19:00',
      duration: 45,
      location: 'Virtual Meeting',
      meetingType: 'virtual',
      status: 'scheduled',
      priority: 'medium',
      agenda: [
        'Season progress update',
        'Upcoming events and tournaments',
        'Feedback and Q&A',
      ],
      createdAt: '2025-08-13T16:00:00Z',
    },
    {
      id: '4',
      title: 'Emergency Team Discussion',
      description: 'Address recent training concerns',
      type: 'urgent',
      participants: [
        { id: 'p6', name: 'Emma Davis', type: 'player', avatar: 'https://i.pravatar.cc/100?img=2' },
        { id: 'p7', name: 'Team Captain Tom', type: 'player', avatar: 'https://i.pravatar.cc/100?img=8' },
      ],
      date: '2025-08-16',
      time: '09:00',
      duration: 20,
      location: 'Training Ground',
      meetingType: 'in-person',
      status: 'scheduled',
      priority: 'high',
      agenda: [
        'Address training intensity concerns',
        'Team communication improvement',
        'Next steps action plan',
      ],
      createdAt: '2025-08-15T20:00:00Z',
    },
  ]);

  const [availableParticipants] = useState([
    { id: 'p1', name: 'Alex Johnson', type: 'player', avatar: 'https://i.pravatar.cc/100?img=1' },
    { id: 'p2', name: 'Emma Davis', type: 'player', avatar: 'https://i.pravatar.cc/100?img=2' },
    { id: 'p3', name: 'Sarah Johnson', type: 'parent', avatar: 'https://i.pravatar.cc/100?img=11' },
    { id: 'p4', name: 'Jennifer Davis', type: 'parent', avatar: 'https://i.pravatar.cc/100?img=12' },
    { id: 'c1', name: 'Assistant Coach Mike', type: 'staff', avatar: 'https://i.pravatar.cc/100?img=3' },
    { id: 'c2', name: 'Fitness Trainer Lisa', type: 'staff', avatar: 'https://i.pravatar.cc/100?img=4' },
  ]);

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    type: 'individual',
    participants: [],
    date: '',
    time: '',
    duration: 30,
    location: '',
    meetingType: 'in-person',
    priority: 'medium',
    agenda: [''],
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return COLORS.primary;
      case 'in-progress':
        return COLORS.success;
      case 'completed':
        return COLORS.textSecondary;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case 'virtual':
        return 'video-call';
      case 'in-person':
        return 'location-on';
      case 'phone':
        return 'phone';
      default:
        return 'meeting-room';
    }
  };

  const getParticipantTypeIcon = (type) => {
    switch (type) {
      case 'player':
        return 'sports';
      case 'parent':
        return 'family-restroom';
      case 'staff':
        return 'work';
      default:
        return 'person';
    }
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const isToday = (date) => {
    return date === getCurrentDate();
  };

  const isPast = (date) => {
    return new Date(date) < new Date(getCurrentDate());
  };

  const filteredMeetings = meetings
    .filter(meeting => {
      const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           meeting.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      switch (viewMode) {
        case 'today':
          return matchesSearch && isToday(meeting.date);
        case 'past':
          return matchesSearch && isPast(meeting.date);
        case 'upcoming':
        default:
          return matchesSearch && !isPast(meeting.date);
      }
    })
    .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

  const handleCreateMeeting = () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) {
      Alert.alert('Required Fields', 'Please fill in title, date, and time');
      return;
    }

    const meeting = {
      ...newMeeting,
      id: Date.now().toString(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      agenda: newMeeting.agenda.filter(item => item.trim() !== ''),
    };

    setMeetings(prev => [meeting, ...prev]);
    resetNewMeeting();
    setShowCreateModal(false);
    Vibration.vibrate([10, 50, 10]);
  };

  const resetNewMeeting = () => {
    setNewMeeting({
      title: '',
      description: '',
      type: 'individual',
      participants: [],
      date: '',
      time: '',
      duration: 30,
      location: '',
      meetingType: 'in-person',
      priority: 'medium',
      agenda: [''],
    });
  };

  const addAgendaItem = () => {
    setNewMeeting(prev => ({
      ...prev,
      agenda: [...prev.agenda, '']
    }));
  };

  const removeAgendaItem = (index) => {
    setNewMeeting(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const updateAgendaItem = (index, value) => {
    setNewMeeting(prev => ({
      ...prev,
      agenda: prev.agenda.map((item, i) => i === index ? value : item)
    }));
  };

  const toggleParticipant = (participant) => {
    setNewMeeting(prev => {
      const exists = prev.participants.find(p => p.id === participant.id);
      if (exists) {
        return {
          ...prev,
          participants: prev.participants.filter(p => p.id !== participant.id)
        };
      } else {
        return {
          ...prev,
          participants: [...prev.participants, participant]
        };
      }
    });
  };

  const cancelMeeting = (meetingId) => {
    Alert.alert(
      'Cancel Meeting',
      'Are you sure you want to cancel this meeting?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setMeetings(prev =>
              prev.map(meeting =>
                meeting.id === meetingId
                  ? { ...meeting, status: 'cancelled' }
                  : meeting
              )
            );
            Vibration.vibrate(10);
          },
        },
      ]
    );
  };

  const completeMeeting = (meetingId) => {
    setMeetings(prev =>
      prev.map(meeting =>
        meeting.id === meetingId
          ? { ...meeting, status: 'completed' }
          : meeting
      )
    );
    Vibration.vibrate([10, 50, 10]);
  };

  const renderMeetingCard = ({ item: meeting }) => (
    <Card style={styles.meetingCard}>
      <TouchableOpacity onPress={() => {
        setSelectedMeeting(meeting);
        setShowDetailsModal(true);
      }}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.meetingInfo}>
              <Text style={TEXT_STYLES.h3} numberOfLines={1}>
                {meeting.title}
              </Text>
              <Text style={TEXT_STYLES.caption} numberOfLines={2}>
                {meeting.description}
              </Text>
            </View>
            <View style={styles.cardBadges}>
              <Chip
                mode="outlined"
                textStyle={[styles.priorityChip, { color: getPriorityColor(meeting.priority) }]}
                style={{ borderColor: getPriorityColor(meeting.priority) }}
                compact
              >
                {meeting.priority}
              </Chip>
            </View>
          </View>

          <View style={styles.cardMeta}>
            <View style={styles.metaRow}>
              <Icon name="schedule" size={16} color={COLORS.textSecondary} />
              <Text style={TEXT_STYLES.small}>
                {new Date(meeting.date).toLocaleDateString()} • {meeting.time}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Icon name="timer" size={16} color={COLORS.textSecondary} />
              <Text style={TEXT_STYLES.small}>{meeting.duration} min</Text>
            </View>
            <View style={styles.metaRow}>
              <Icon name={getMeetingTypeIcon(meeting.meetingType)} size={16} color={COLORS.textSecondary} />
              <Text style={TEXT_STYLES.small}>{meeting.location}</Text>
            </View>
          </View>

          <View style={styles.participantsRow}>
            <Text style={TEXT_STYLES.caption}>Participants:</Text>
            <View style={styles.avatarGroup}>
              {meeting.participants.slice(0, 3).map((participant, index) => (
                <View key={participant.id} style={[styles.avatarContainer, { marginLeft: index > 0 ? -8 : 0 }]}>
                  <Avatar.Image 
                    size={24} 
                    source={{ uri: participant.avatar }} 
                    style={styles.participantAvatar}
                  />
                </View>
              ))}
              {meeting.participants.length > 3 && (
                <View style={[styles.avatarContainer, { marginLeft: -8 }]}>
                  <Avatar.Text
                    size={24}
                    label={`+${meeting.participants.length - 3}`}
                    style={styles.moreAvatar}
                    labelStyle={styles.moreAvatarLabel}
                  />
                </View>
              )}
            </View>
          </View>

          <View style={styles.cardActions}>
            {meeting.status === 'scheduled' && !isPast(meeting.date) && (
              <>
                <Button
                  mode="outlined"
                  onPress={() => cancelMeeting(meeting.id)}
                  style={styles.actionButton}
                  textColor={COLORS.error}
                >
                  Cancel
                </Button>
                {isToday(meeting.date) && (
                  <Button
                    mode="contained"
                    onPress={() => completeMeeting(meeting.id)}
                    style={styles.actionButton}
                    buttonColor={COLORS.success}
                  >
                    Complete
                  </Button>
                )}
              </>
            )}
            {meeting.status === 'cancelled' && (
              <Chip mode="outlined" textStyle={{ color: COLORS.error }}>
                Cancelled
              </Chip>
            )}
            {meeting.status === 'completed' && (
              <Chip mode="outlined" textStyle={{ color: COLORS.success }}>
                ✓ Completed
              </Chip>
            )}
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const CreateMeetingModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.modal}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.lg }]}>
                Schedule Meeting 📅
              </Text>

              <TextInput
                label="Meeting Title *"
                value={newMeeting.title}
                onChangeText={(text) => setNewMeeting(prev => ({ ...prev, title: text }))}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Description"
                value={newMeeting.description}
                onChangeText={(text) => setNewMeeting(prev => ({ ...prev, description: text }))}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
              />

              <View style={styles.inputRow}>
                <TextInput
                  label="Date *"
                  value={newMeeting.date}
                  onChangeText={(text) => setNewMeeting(prev => ({ ...prev, date: text }))}
                  style={[styles.input, { flex: 1, marginRight: SPACING.sm }]}
                  mode="outlined"
                  placeholder="YYYY-MM-DD"
                />
                <TextInput
                  label="Time *"
                  value={newMeeting.time}
                  onChangeText={(text) => setNewMeeting(prev => ({ ...prev, time: text }))}
                  style={[styles.input, { flex: 1 }]}
                  mode="outlined"
                  placeholder="HH:MM"
                />
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  label="Duration (minutes)"
                  value={newMeeting.duration.toString()}
                  onChangeText={(text) => setNewMeeting(prev => ({ ...prev, duration: parseInt(text) || 30 }))}
                  style={[styles.input, { flex: 1, marginRight: SPACING.sm }]}
                  mode="outlined"
                  keyboardType="numeric"
                />
                <TextInput
                  label="Location"
                  value={newMeeting.location}
                  onChangeText={(text) => setNewMeeting(prev => ({ ...prev, location: text }))}
                  style={[styles.input, { flex: 1 }]}
                  mode="outlined"
                />
              </View>

              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Meeting Type</Text>
              <RadioButton.Group
                onValueChange={(value) => setNewMeeting(prev => ({ ...prev, meetingType: value }))}
                value={newMeeting.meetingType}
              >
                <View style={styles.radioRow}>
                  <RadioButton value="in-person" />
                  <Text style={TEXT_STYLES.body}>In-Person</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton value="virtual" />
                  <Text style={TEXT_STYLES.body}>Virtual</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton value="phone" />
                  <Text style={TEXT_STYLES.body}>Phone Call</Text>
                </View>
              </RadioButton.Group>

              <Text style={[TEXT_STYLES.body, { marginTop: SPACING.lg, marginBottom: SPACING.sm }]}>
                Priority Level
              </Text>
              <RadioButton.Group
                onValueChange={(value) => setNewMeeting(prev => ({ ...prev, priority: value }))}
                value={newMeeting.priority}
              >
                <View style={styles.radioRow}>
                  <RadioButton value="high" />
                  <Text style={TEXT_STYLES.body}>High Priority</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton value="medium" />
                  <Text style={TEXT_STYLES.body}>Medium Priority</Text>
                </View>
                <View style={styles.radioRow}>
                  <RadioButton value="low" />
                  <Text style={TEXT_STYLES.body}>Low Priority</Text>
                </View>
              </RadioButton.Group>

              <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.lg, marginBottom: SPACING.md }]}>
                Select Participants
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.participantScroll}>
                {availableParticipants.map((participant) => (
                  <TouchableOpacity
                    key={participant.id}
                    style={[
                      styles.participantOption,
                      newMeeting.participants.find(p => p.id === participant.id) && styles.selectedParticipant
                    ]}
                    onPress={() => toggleParticipant(participant)}
                  >
                    <Avatar.Image size={40} source={{ uri: participant.avatar }} />
                    <Text style={[TEXT_STYLES.small, { textAlign: 'center', marginTop: SPACING.xs }]}>
                      {participant.name.split(' ')[0]}
                    </Text>
                    <Icon
                      name={getParticipantTypeIcon(participant.type)}
                      size={12}
                      color={COLORS.textSecondary}
                      style={{ alignSelf: 'center' }}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.lg, marginBottom: SPACING.md }]}>
                Agenda Items
              </Text>
              {newMeeting.agenda.map((item, index) => (
                <View key={index} style={styles.agendaRow}>
                  <TextInput
                    label={`Item ${index + 1}`}
                    value={item}
                    onChangeText={(text) => updateAgendaItem(index, text)}
                    style={[styles.input, { flex: 1, marginRight: SPACING.sm }]}
                    mode="outlined"
                  />
                  {newMeeting.agenda.length > 1 && (
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor={COLORS.error}
                      onPress={() => removeAgendaItem(index)}
                    />
                  )}
                </View>
              ))}

              <Button
                mode="outlined"
                onPress={addAgendaItem}
                style={styles.addButton}
                icon="add"
              >
                Add Agenda Item
              </Button>

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
                  onPress={handleCreateMeeting}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                >
                  Schedule Meeting
                </Button>
              </View>
            </ScrollView>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const MeetingDetailsModal = () => (
    <Portal>
      <Modal
        visible={showDetailsModal}
        onDismiss={() => setShowDetailsModal(false)}
        contentContainerStyle={styles.modal}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            {selectedMeeting && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.lg }]}>
                  Meeting Details 📋
                </Text>

                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                  {selectedMeeting.title}
                </Text>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg }]}>
                  {selectedMeeting.description}
                </Text>

                <View style={styles.detailsGrid}>
                  <Surface style={styles.detailCard}>
                    <Icon name="schedule" size={24} color={COLORS.primary} />
                    <Text style={TEXT_STYLES.caption}>Date & Time</Text>
                    <Text style={TEXT_STYLES.body}>
                      {new Date(selectedMeeting.date).toLocaleDateString()}
                    </Text>
                    <Text style={TEXT_STYLES.body}>{selectedMeeting.time}</Text>
                  </Surface>

                  <Surface style={styles.detailCard}>
                    <Icon name="timer" size={24} color={COLORS.secondary} />
                    <Text style={TEXT_STYLES.caption}>Duration</Text>
                    <Text style={TEXT_STYLES.body}>{selectedMeeting.duration} min</Text>
                  </Surface>

                  <Surface style={styles.detailCard}>
                    <Icon name={getMeetingTypeIcon(selectedMeeting.meetingType)} size={24} color={COLORS.success} />
                    <Text style={TEXT_STYLES.caption}>Location</Text>
                    <Text style={TEXT_STYLES.body} numberOfLines={2}>
                      {selectedMeeting.location}
                    </Text>
                  </Surface>

                  <Surface style={styles.detailCard}>
                    <Icon name="priority-high" size={24} color={getPriorityColor(selectedMeeting.priority)} />
                    <Text style={TEXT_STYLES.caption}>Priority</Text>
                    <Text style={[TEXT_STYLES.body, { textTransform: 'capitalize' }]}>
                      {selectedMeeting.priority}
                    </Text>
                  </Surface>
                </View>

                <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.lg, marginBottom: SPACING.md }]}>
                  Participants ({selectedMeeting.participants.length})
                </Text>
                {selectedMeeting.participants.map((participant) => (
                  <Surface key={participant.id} style={styles.participantCard}>
                    <Avatar.Image size={40} source={{ uri: participant.avatar }} />
                    <View style={styles.participantInfo}>
                      <Text style={TEXT_STYLES.body}>{participant.name}</Text>
                      <View style={styles.participantType}>
                        <Icon name={getParticipantTypeIcon(participant.type)} size={16} color={COLORS.textSecondary} />
                        <Text style={[TEXT_STYLES.caption, { textTransform: 'capitalize' }]}>
                          {participant.type}
                        </Text>
                      </View>
                    </View>
                  </Surface>
                ))}

                {selectedMeeting.agenda.length > 0 && (
                  <>
                    <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.lg, marginBottom: SPACING.md }]}>
                      Agenda
                    </Text>
                    {selectedMeeting.agenda.map((item, index) => (
                      <View key={index} style={styles.agendaItem}>
                        <Text style={TEXT_STYLES.caption}>
                          {index + 1}.
                        </Text>
                        <Text style={[TEXT_STYLES.body, { flex: 1, marginLeft: SPACING.sm }]}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </>
                )}

                <Button
                  mode="contained"
                  onPress={() => setShowDetailsModal(false)}
                  style={styles.closeButton}
                  buttonColor={COLORS.primary}
                >
                  Close
                </Button>
              </ScrollView>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>Meeting Scheduler 📅</Text>
        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
          Schedule and manage meetings with players, parents & staff
        </Text>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.searchRow}>
          <Searchbar
            placeholder="Search meetings..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="filter-list"
                size={24}
                iconColor={COLORS.primary}
                onPress={() => setMenuVisible(true)}
                style={styles.filterButton}
              />
            }
          >
            <Menu.Item 
              onPress={() => { setViewMode('upcoming'); setMenuVisible(false); }} 
              title="Upcoming" 
              leadingIcon="event"
            />
            <Menu.Item 
              onPress={() => { setViewMode('today'); setMenuVisible(false); }} 
              title="Today" 
              leadingIcon="today"
            />
            <Menu.Item 
              onPress={() => { setViewMode('past'); setMenuVisible(false); }} 
              title="Past" 
              leadingIcon="history"
            />
          </Menu>
        </View>

        <View style={styles.viewModeChips}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['upcoming', 'today', 'past'].map((mode) => (
              <Chip
                key={mode}
                mode={viewMode === mode ? 'flat' : 'outlined'}
                selected={viewMode === mode}
                onPress={() => setViewMode(mode)}
                style={[styles.modeChip, viewMode === mode && { backgroundColor: COLORS.primary }]}
                textStyle={viewMode === mode ? { color: 'white' } : { color: COLORS.primary }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsRow}>
          <Surface style={styles.statCard}>
            <Text style={TEXT_STYLES.h2}>
              {meetings.filter(m => m.status === 'scheduled' && !isPast(m.date)).length}
            </Text>
            <Text style={TEXT_STYLES.caption}>Upcoming</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={TEXT_STYLES.h2}>
              {meetings.filter(m => isToday(m.date)).length}
            </Text>
            <Text style={TEXT_STYLES.caption}>Today</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={TEXT_STYLES.h2}>
              {meetings.filter(m => m.status === 'completed').length}
            </Text>
            <Text style={TEXT_STYLES.caption}>Completed</Text>
          </Surface>
        </View>

        <FlatList
          data={filteredMeetings}
          renderItem={renderMeetingCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <Surface style={styles.emptyState}>
              <Icon name="event-available" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginTop: SPACING.md }]}>
                No meetings found
              </Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
                {viewMode === 'today' 
                  ? 'No meetings scheduled for today' 
                  : viewMode === 'past'
                    ? 'No past meetings to show'
                    : 'Schedule your first meeting to get started'
                }
              </Text>
            </Surface>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </Animated.View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        color="white"
      />

      <CreateMeetingModal />
      <MeetingDetailsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchbar: {
    flex: 1,
    elevation: 2,
  },
  filterButton: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  viewModeChips: {
    marginBottom: SPACING.md,
  },
  modeChip: {
    marginRight: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  meetingCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  meetingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  cardBadges: {
    alignItems: 'flex-end',
  },
  priorityChip: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  participantAvatar: {
    backgroundColor: COLORS.primary,
  },
  moreAvatar: {
    backgroundColor: COLORS.textSecondary,
  },
  moreAvatarLabel: {
    fontSize: 10,
    color: 'white',
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 12,
    elevation: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    padding: SPACING.lg,
    borderRadius: 16,
    maxHeight: '90%',
  },
  input: {
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  participantScroll: {
    marginBottom: SPACING.lg,
  },
  participantOption: {
    alignItems: 'center',
    padding: SPACING.sm,
    marginRight: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    width: 80,
  },
  selectedParticipant: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addButton: {
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
  closeButton: {
    marginTop: SPACING.lg,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  detailCard: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 1,
  },
  participantInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  participantType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
});

export default MeetingScheduler;