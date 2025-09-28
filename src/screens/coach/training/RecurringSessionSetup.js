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
  Switch,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  TextInput,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar,
  RadioButton,
  Checkbox,
  Divider,
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

const RECURRENCE_PATTERNS = [
  { value: 'daily', label: 'Daily', icon: 'today' },
  { value: 'weekly', label: 'Weekly', icon: 'date-range' },
  { value: 'biweekly', label: 'Bi-weekly', icon: 'calendar-today' },
  { value: 'monthly', label: 'Monthly', icon: 'event' },
  { value: 'custom', label: 'Custom', icon: 'settings' },
];

const DAYS_OF_WEEK = [
  { short: 'Sun', full: 'Sunday', value: 0 },
  { short: 'Mon', full: 'Monday', value: 1 },
  { short: 'Tue', full: 'Tuesday', value: 2 },
  { short: 'Wed', full: 'Wednesday', value: 3 },
  { short: 'Thu', full: 'Thursday', value: 4 },
  { short: 'Fri', full: 'Friday', value: 5 },
  { short: 'Sat', full: 'Saturday', value: 6 },
];

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
];

const RecurringSessionSetup = ({ navigation, route }) => {
  // Redux state
  const { user, teams, players } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Route params
  const editingSession = route?.params?.session;
  const isEditing = !!editingSession;

  // Form state
  const [sessionName, setSessionName] = useState(editingSession?.name || '');
  const [sessionDescription, setSessionDescription] = useState(editingSession?.description || '');
  const [selectedTeam, setSelectedTeam] = useState(editingSession?.teamId || null);
  const [selectedPlayers, setSelectedPlayers] = useState(editingSession?.playerIds || []);
  const [recurrencePattern, setRecurrencePattern] = useState(editingSession?.pattern || 'weekly');
  const [selectedDays, setSelectedDays] = useState(editingSession?.days || [1, 3, 5]); // Mon, Wed, Fri
  const [startTime, setStartTime] = useState(editingSession?.startTime || '16:00');
  const [duration, setDuration] = useState(editingSession?.duration || '90');
  const [startDate, setStartDate] = useState(editingSession?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(editingSession?.endDate || '');
  const [location, setLocation] = useState(editingSession?.location || '');
  const [autoNotifications, setAutoNotifications] = useState(editingSession?.notifications ?? true);
  const [reminderTime, setReminderTime] = useState(editingSession?.reminderTime || '24'); // hours
  
  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showSchedulePreview, setShowSchedulePreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Mock data
  const [mockTeams] = useState([
    { id: 'team_1', name: 'U-16 Eagles', players: 18, color: '#FF5722' },
    { id: 'team_2', name: 'U-18 Hawks', players: 22, color: '#2196F3' },
    { id: 'team_3', name: 'Senior Tigers', players: 25, color: '#4CAF50' },
  ]);

  const [mockPlayers] = useState([
    { id: '1', name: 'John Smith', position: 'Forward', teamId: 'team_1' },
    { id: '2', name: 'Mike Johnson', position: 'Midfielder', teamId: 'team_1' },
    { id: '3', name: 'Alex Wilson', position: 'Defender', teamId: 'team_2' },
    { id: '4', name: 'Chris Brown', position: 'Goalkeeper', teamId: 'team_2' },
    { id: '5', name: 'David Lee', position: 'Forward', teamId: 'team_3' },
  ]);

  const steps = [
    { title: 'Basic Info', icon: 'info' },
    { title: 'Schedule', icon: 'schedule' },
    { title: 'Players', icon: 'group' },
    { title: 'Settings', icon: 'settings' },
    { title: 'Review', icon: 'preview' },
  ];

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
  }, []);

  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep / (steps.length - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Handlers
  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handlePlayerToggle = useCallback((playerId) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  }, []);

  const handleDayToggle = useCallback((dayValue) => {
    setSelectedDays(prev => 
      prev.includes(dayValue)
        ? prev.filter(day => day !== dayValue)
        : [...prev, dayValue].sort()
    );
  }, []);

  const handleSaveSession = useCallback(async () => {
    setIsLoading(true);
    
    // Validation
    if (!sessionName.trim()) {
      Alert.alert('Error', 'Please enter a session name');
      setIsLoading(false);
      return;
    }
    
    if (selectedPlayers.length === 0) {
      Alert.alert('Error', 'Please select at least one player');
      setIsLoading(false);
      return;
    }
    
    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success! 🎉',
        `Recurring session "${sessionName}" has been ${isEditing ? 'updated' : 'created'} successfully`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionName, selectedPlayers, selectedDays, isEditing, navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  // Generate schedule preview
  const generateSchedulePreview = () => {
    const sessions = [];
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    let current = new Date(start);
    let sessionCount = 0;
    
    while (current <= end && sessionCount < 10) { // Show max 10 sessions
      if (selectedDays.includes(current.getDay())) {
        sessions.push({
          date: new Date(current),
          time: startTime,
          duration: duration,
        });
        sessionCount++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return sessions;
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <View style={styles.stepContent}>
            <Text style={TEXT_STYLES.h3}>Session Details 📝</Text>
            
            <TextInput
              label="Session Name"
              value={sessionName}
              onChangeText={setSessionName}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Weekly Training Session"
            />
            
            <TextInput
              label="Description"
              value={sessionDescription}
              onChangeText={setSessionDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Describe what this session will cover..."
            />
            
            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              mode="outlined"
              placeholder="Training ground, gym, field..."
            />
          </View>
        );
        
      case 1: // Schedule
        return (
          <View style={styles.stepContent}>
            <Text style={TEXT_STYLES.h3}>Schedule Setup 📅</Text>
            
            <Text style={styles.sectionTitle}>Recurrence Pattern</Text>
            <View style={styles.patternContainer}>
              {RECURRENCE_PATTERNS.map((pattern) => (
                <TouchableOpacity
                  key={pattern.value}
                  onPress={() => setRecurrencePattern(pattern.value)}
                  style={[
                    styles.patternCard,
                    recurrencePattern === pattern.value && styles.patternCardSelected
                  ]}
                >
                  <Icon name={pattern.icon} size={24} color={
                    recurrencePattern === pattern.value ? COLORS.white : COLORS.primary
                  } />
                  <Text style={[
                    styles.patternText,
                    recurrencePattern === pattern.value && styles.patternTextSelected
                  ]}>
                    {pattern.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Select Days</Text>
            <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  onPress={() => handleDayToggle(day.value)}
                  style={[
                    styles.dayChip,
                    selectedDays.includes(day.value) && styles.dayChipSelected
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    selectedDays.includes(day.value) && styles.dayTextSelected
                  ]}>
                    {day.short}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.sectionTitle}>Start Time</Text>
                <TouchableOpacity
                  onPress={() => setShowTimeModal(true)}
                  style={styles.timeButton}
                >
                  <Text style={styles.timeButtonText}>{startTime}</Text>
                  <Icon name="access-time" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeInput}>
                <Text style={styles.sectionTitle}>Duration (min)</Text>
                <TextInput
                  value={duration}
                  onChangeText={setDuration}
                  style={styles.durationInput}
                  mode="outlined"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.dateRow}>
              <TextInput
                label="Start Date"
                value={startDate}
                onChangeText={setStartDate}
                style={styles.dateInput}
                mode="outlined"
                placeholder="YYYY-MM-DD"
              />
              
              <TextInput
                label="End Date (Optional)"
                value={endDate}
                onChangeText={setEndDate}
                style={styles.dateInput}
                mode="outlined"
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
        );
        
      case 2: // Players
        return (
          <View style={styles.stepContent}>
            <Text style={TEXT_STYLES.h3}>Select Players 👥</Text>
            
            <Text style={styles.sectionTitle}>Select Team (Optional)</Text>
            <View style={styles.teamsContainer}>
              {mockTeams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  onPress={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
                  style={[
                    styles.teamCard,
                    selectedTeam === team.id && styles.teamCardSelected
                  ]}
                >
                  <View style={[styles.teamColor, { backgroundColor: team.color }]} />
                  <View style={styles.teamInfo}>
                    <Text style={TEXT_STYLES.body}>{team.name}</Text>
                    <Text style={TEXT_STYLES.caption}>{team.players} players</Text>
                  </View>
                  {selectedTeam === team.id && (
                    <Icon name="check-circle" size={24} color={COLORS.success} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>
              Individual Players ({selectedPlayers.length} selected)
            </Text>
            
            <Searchbar
              placeholder="Search players..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            
            <ScrollView style={styles.playersScrollView}>
              {mockPlayers
                .filter(player => 
                  player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  player.position.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    onPress={() => handlePlayerToggle(player.id)}
                    style={styles.playerItem}
                  >
                    <Avatar.Text
                      size={40}
                      label={player.name.split(' ').map(n => n[0]).join('')}
                      style={styles.playerAvatar}
                    />
                    <View style={styles.playerInfo}>
                      <Text style={TEXT_STYLES.body}>{player.name}</Text>
                      <Text style={TEXT_STYLES.caption}>{player.position}</Text>
                    </View>
                    <Checkbox
                      status={selectedPlayers.includes(player.id) ? 'checked' : 'unchecked'}
                      onPress={() => handlePlayerToggle(player.id)}
                    />
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        );
        
      case 3: // Settings
        return (
          <View style={styles.stepContent}>
            <Text style={TEXT_STYLES.h3}>Notification Settings 🔔</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={TEXT_STYLES.body}>Auto Notifications</Text>
                <Text style={TEXT_STYLES.caption}>Send automatic reminders to players</Text>
              </View>
              <Switch
                value={autoNotifications}
                onValueChange={setAutoNotifications}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
            
            {autoNotifications && (
              <View style={styles.reminderSection}>
                <Text style={styles.sectionTitle}>Reminder Time</Text>
                <View style={styles.reminderOptions}>
                  {['1', '6', '24', '48'].map((hours) => (
                    <TouchableOpacity
                      key={hours}
                      onPress={() => setReminderTime(hours)}
                      style={[
                        styles.reminderChip,
                        reminderTime === hours && styles.reminderChipSelected
                      ]}
                    >
                      <Text style={[
                        styles.reminderText,
                        reminderTime === hours && styles.reminderTextSelected
                      ]}>
                        {hours}h before
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            <Divider style={styles.divider} />
            
            <Text style={TEXT_STYLES.h3}>Advanced Options ⚙️</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={TEXT_STYLES.body}>Allow Player Cancellation</Text>
                <Text style={TEXT_STYLES.caption}>Players can cancel their attendance</Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => Alert.alert('Feature Coming Soon! 🚀')}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={TEXT_STYLES.body}>Waitlist</Text>
                <Text style={TEXT_STYLES.caption}>Allow players to join waitlist if session is full</Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => Alert.alert('Feature Coming Soon! 🚀')}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>
          </View>
        );
        
      case 4: // Review
        return (
          <View style={styles.stepContent}>
            <Text style={TEXT_STYLES.h3}>Review & Confirm 📋</Text>
            
            <Card style={styles.reviewCard}>
              <Card.Content>
                <Text style={TEXT_STYLES.h3}>{sessionName}</Text>
                {sessionDescription ? (
                  <Text style={styles.reviewDescription}>{sessionDescription}</Text>
                ) : null}
                
                <View style={styles.reviewRow}>
                  <Icon name="schedule" size={20} color={COLORS.primary} />
                  <Text style={styles.reviewText}>
                    {selectedDays.map(day => DAYS_OF_WEEK[day].short).join(', ')} at {startTime}
                  </Text>
                </View>
                
                <View style={styles.reviewRow}>
                  <Icon name="access-time" size={20} color={COLORS.primary} />
                  <Text style={styles.reviewText}>{duration} minutes</Text>
                </View>
                
                <View style={styles.reviewRow}>
                  <Icon name="group" size={20} color={COLORS.primary} />
                  <Text style={styles.reviewText}>{selectedPlayers.length} players selected</Text>
                </View>
                
                {location ? (
                  <View style={styles.reviewRow}>
                    <Icon name="location-on" size={20} color={COLORS.primary} />
                    <Text style={styles.reviewText}>{location}</Text>
                  </View>
                ) : null}
                
                <View style={styles.reviewRow}>
                  <Icon name="notifications" size={20} color={COLORS.primary} />
                  <Text style={styles.reviewText}>
                    {autoNotifications ? `Reminders ${reminderTime}h before` : 'No reminders'}
                  </Text>
                </View>
              </Card.Content>
            </Card>
            
            <Button
              mode="outlined"
              onPress={() => setShowSchedulePreview(true)}
              style={styles.previewButton}
              icon="preview"
            >
              Preview Schedule
            </Button>
            
            <Text style={styles.warningText}>
              ⚠️ This will create recurring sessions based on your schedule. You can modify or cancel individual sessions later.
            </Text>
          </View>
        );
        
      default:
        return null;
    }
  };

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
          <IconButton
            icon="arrow-back"
            size={24}
            iconColor={COLORS.white}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Recurring Session' : 'Create Recurring Session'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </Text>
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
          <Card style={styles.stepCard}>
            <Card.Content>
              {renderStepContent()}
            </Card.Content>
          </Card>
        </ScrollView>
        
        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <Button
              mode="outlined"
              onPress={handlePrevious}
              style={styles.navButton}
              icon="chevron-left"
            >
              Previous
            </Button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button
              mode="contained"
              onPress={handleNext}
              style={[styles.navButton, { marginLeft: currentStep > 0 ? SPACING.sm : 0 }]}
              icon="chevron-right"
              contentStyle={styles.buttonContent}
            >
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleSaveSession}
              style={[styles.navButton, styles.saveButton]}
              loading={isLoading}
              icon="save"
            >
              {isEditing ? 'Update Session' : 'Create Session'}
            </Button>
          )}
        </View>
      </Animated.View>

      {/* Time Selection Modal */}
      <Portal>
        <Modal
          visible={showTimeModal}
          onDismiss={() => setShowTimeModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={80} style={styles.modalBlur}>
            <Card style={styles.timeModal}>
              <Card.Content>
                <Text style={TEXT_STYLES.h2}>Select Time</Text>
                <ScrollView style={styles.timeScrollView}>
                  {TIME_SLOTS.map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => {
                        setStartTime(time);
                        setShowTimeModal(false);
                      }}
                      style={[
                        styles.timeSlot,
                        startTime === time && styles.timeSlotSelected
                      ]}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        startTime === time && styles.timeSlotTextSelected
                      ]}>
                        {time}
                      </Text>
                      {startTime === time && (
                        <Icon name="check" size={20} color={COLORS.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Button
                  mode="outlined"
                  onPress={() => setShowTimeModal(false)}
                  style={styles.modalCloseButton}
                >
                  Close
                </Button>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>

      {/* Schedule Preview Modal */}
      <Portal>
        <Modal
          visible={showSchedulePreview}
          onDismiss={() => setShowSchedulePreview(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={80} style={styles.modalBlur}>
            <Card style={styles.previewModal}>
              <Card.Content>
                <Text style={TEXT_STYLES.h2}>Schedule Preview</Text>
                <ScrollView style={styles.previewScrollView}>
                  {generateSchedulePreview().map((session, index) => (
                    <View key={index} style={styles.previewSession}>
                      <Icon name="event" size={20} color={COLORS.primary} />
                      <View style={styles.previewSessionInfo}>
                        <Text style={TEXT_STYLES.body}>
                          {session.date.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                        <Text style={TEXT_STYLES.caption}>
                          {session.time} ({session.duration} min)
                        </Text>
                      </View>
                    </View>
                  ))}
                  {generateSchedulePreview().length === 10 && (
                    <Text style={styles.previewNote}>
                      ... and more sessions as per schedule
                    </Text>
                  )}
                </ScrollView>
                <Button
                  mode="outlined"
                  onPress={() => setShowSchedulePreview(false)}
                  style={styles.modalCloseButton}
                >
                  Close
                </Button>
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  stepCard: {
    borderRadius: 12,
    marginBottom: 100, // Space for navigation buttons
  },
  stepContent: {
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  
  // Schedule Step Styles
  patternContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  patternCard: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  patternCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  patternText: {
    marginTop: SPACING.xs,
    color: COLORS.text,
    fontWeight: '500',
  },
  patternTextSelected: {
    color: COLORS.white,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  dayTextSelected: {
    color: COLORS.white,
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  timeInput: {
    flex: 1,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  durationInput: {
    backgroundColor: COLORS.white,
  },
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  dateInput: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  // Players Step Styles
  teamsContainer: {
    marginBottom: SPACING.lg,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  teamCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  teamColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  teamInfo: {
    flex: 1,
  },
  searchBar: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  playersScrollView: {
    maxHeight: 300,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playerAvatar: {
    marginRight: SPACING.md,
  },
  playerInfo: {
    flex: 1,
  },
  
  // Settings Step Styles
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  reminderSection: {
    marginTop: SPACING.md,
  },
  reminderOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  reminderChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reminderChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  reminderText: {
    fontSize: 14,
    color: COLORS.text,
  },
  reminderTextSelected: {
    color: COLORS.white,
  },
  divider: {
    marginVertical: SPACING.lg,
  },
  
  // Review Step Styles
  reviewCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  reviewDescription: {
    ...TEXT_STYLES.caption,
    marginVertical: SPACING.sm,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  reviewText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
  },
  previewButton: {
    marginBottom: SPACING.md,
  },
  warningText: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  
  // Navigation Buttons
  navigationButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flex: 1,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
  },
  saveButton: {
    backgroundColor: COLORS.success,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  timeModal: {
    margin: SPACING.md,
    borderRadius: 12,
    maxHeight: '70%',
  },
  timeScrollView: {
    maxHeight: 300,
    marginVertical: SPACING.md,
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  timeSlotSelected: {
    backgroundColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: 16,
    color: COLORS.text,
  },
  timeSlotTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: SPACING.md,
  },
  previewModal: {
    margin: SPACING.md,
    borderRadius: 12,
    maxHeight: '70%',
  },
  previewScrollView: {
    maxHeight: 300,
    marginVertical: SPACING.md,
  },
  previewSession: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  previewSessionInfo: {
    marginLeft: SPACING.sm,
  },
  previewNote: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
});

export default RecurringSessionSetup;