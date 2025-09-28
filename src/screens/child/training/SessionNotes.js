import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  TextInput,
  Vibration,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  ProgressBar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
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
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const SessionNotes = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [moodRating, setMoodRating] = useState(3);
  const [effortRating, setEffortRating] = useState(3);
  const [funRating, setFunRating] = useState(3);

  // Mock data - replace with actual data fetching
  const mockSessions = [
    {
      id: 1,
      date: '2024-08-29',
      title: 'Football Practice - Passing Drills 🏈',
      coach: 'Coach Smith',
      duration: '90 min',
      completed: true,
      hasNotes: true,
      myNote: 'Great practice today! I improved my passing accuracy and made some awesome shots! 😊',
      myMood: 4,
      myEffort: 5,
      myFun: 4,
      exercises: ['Passing drills', 'Shooting practice', 'Team scrimmage'],
      achievements: ['Perfect attendance streak: 5 days! 🔥', 'Improved passing accuracy by 15%'],
    },
    {
      id: 2,
      date: '2024-08-27',
      title: 'Strength Training 💪',
      coach: 'Coach Johnson',
      duration: '60 min',
      completed: true,
      hasNotes: false,
      exercises: ['Bodyweight squats', 'Push-ups', 'Core exercises'],
      achievements: ['First time doing 20 push-ups!'],
    },
    {
      id: 3,
      date: '2024-08-25',
      title: 'Speed & Agility Training 🏃‍♂️',
      coach: 'Coach Williams',
      duration: '75 min',
      completed: true,
      hasNotes: true,
      myNote: 'The cone drills were challenging but fun! I felt faster today.',
      myMood: 4,
      myEffort: 4,
      myFun: 5,
      exercises: ['Cone drills', 'Sprint intervals', 'Ladder drills'],
      achievements: ['New personal best in 40-yard dash! ⚡'],
    },
  ];

  // Effects
  useEffect(() => {
    setSessions(mockSessions);
    
    // Entrance animation
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setTranslucent(true);
      }
    }, [])
  );

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleAddNote = (session) => {
    setSelectedSession(session);
    setNoteText(session.myNote || '');
    setMoodRating(session.myMood || 3);
    setEffortRating(session.myEffort || 3);
    setFunRating(session.myFun || 3);
    setShowNoteModal(true);
    Vibration.vibrate(50);
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) {
      Alert.alert('Oops! 😊', 'Please add some notes about your training session!');
      return;
    }

    // Update session with note
    const updatedSessions = sessions.map(session =>
      session.id === selectedSession.id
        ? {
            ...session,
            hasNotes: true,
            myNote: noteText,
            myMood: moodRating,
            myEffort: effortRating,
            myFun: funRating,
          }
        : session
    );
    setSessions(updatedSessions);
    setShowNoteModal(false);
    setSelectedSession(null);
    setNoteText('');
    
    Vibration.vibrate([50, 100, 50]);
    Alert.alert('Awesome! 🎉', 'Your training notes have been saved!');
  };

  const getMoodEmoji = (rating) => {
    const emojis = ['😢', '😕', '😐', '😊', '🤩'];
    return emojis[rating - 1] || '😐';
  };

  const getEffortEmoji = (rating) => {
    const emojis = ['😴', '😐', '🙂', '💪', '🔥'];
    return emojis[rating - 1] || '🙂';
  };

  const getFunEmoji = (rating) => {
    const emojis = ['😴', '😐', '🙂', '😄', '🤩'];
    return emojis[rating - 1] || '🙂';
  };

  const RatingSelector = ({ label, value, onChange, getEmoji }) => (
    <View style={{ marginVertical: SPACING.md }}>
      <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, fontWeight: '600' }]}>
        {label} {getEmoji(value)}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            onPress={() => {
              onChange(rating);
              Vibration.vibrate(30);
            }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: value === rating ? COLORS.primary : COLORS.border,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 2,
            }}
          >
            <Text style={{
              fontSize: 20,
              color: value === rating ? 'white' : COLORS.textSecondary
            }}>
              {getEmoji(rating)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const SessionCard = ({ session, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card style={{
        marginHorizontal: SPACING.md,
        marginVertical: SPACING.sm,
        elevation: 4,
        borderRadius: 16,
      }}>
        <LinearGradient
          colors={session.completed ? [COLORS.success, '#66BB6A'] : [COLORS.primary, COLORS.secondary]}
          style={{
            padding: SPACING.md,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: SPACING.xs }]}>
                {session.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                {session.date} • {session.duration} • {session.coach}
              </Text>
            </View>
            {session.completed && (
              <Icon name="check-circle" size={32} color="white" />
            )}
          </View>
        </LinearGradient>

        <View style={{ padding: SPACING.md }}>
          {/* Achievements */}
          {session.achievements && session.achievements.length > 0 && (
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                🏆 Achievements
              </Text>
              {session.achievements.map((achievement, idx) => (
                <Chip
                  key={idx}
                  mode="outlined"
                  style={{ 
                    marginRight: SPACING.sm, 
                    marginBottom: SPACING.xs,
                    backgroundColor: COLORS.success + '20'
                  }}
                  textStyle={{ fontSize: 12, color: COLORS.success }}
                >
                  {achievement}
                </Chip>
              ))}
            </View>
          )}

          {/* Exercises */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
              📋 What We Did
            </Text>
            {session.exercises.map((exercise, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                <Icon name="fitness-center" size={16} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                  {exercise}
                </Text>
              </View>
            ))}
          </View>

          {/* My Notes Section */}
          <Surface style={{
            padding: SPACING.md,
            borderRadius: 12,
            backgroundColor: session.hasNotes ? COLORS.primary + '10' : COLORS.background,
            marginBottom: SPACING.md,
          }}>
            {session.hasNotes ? (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                    📝 My Notes
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ marginRight: SPACING.sm }}>
                      {getMoodEmoji(session.myMood)} {getEffortEmoji(session.myEffort)} {getFunEmoji(session.myFun)}
                    </Text>
                  </View>
                </View>
                <Text style={TEXT_STYLES.body}>
                  {session.myNote}
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Icon name="note-add" size={32} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
                  Add your thoughts about this training session! 📝
                </Text>
              </View>
            )}
          </Surface>

          {/* Action Button */}
          <Button
            mode={session.hasNotes ? "outlined" : "contained"}
            onPress={() => handleAddNote(session)}
            style={{
              borderRadius: 25,
              backgroundColor: session.hasNotes ? 'transparent' : COLORS.primary,
            }}
            contentStyle={{ paddingVertical: SPACING.sm }}
            labelStyle={{ fontSize: 16, fontWeight: '600' }}
          >
            {session.hasNotes ? '✏️ Edit My Notes' : '📝 Add My Notes'}
          </Button>
        </View>
      </Card>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: SPACING.xs }]}>
              📚 My Training Notes
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Track your progress and share your thoughts! 🌟
            </Text>
          </View>
          <Avatar.Text
            size={50}
            label={user?.name?.charAt(0) || 'A'}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
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
        {/* Stats Cards */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: SPACING.md,
          paddingTop: SPACING.lg,
          paddingBottom: SPACING.md,
        }}>
          <Surface style={{
            flex: 1,
            padding: SPACING.md,
            marginRight: SPACING.sm,
            borderRadius: 12,
            elevation: 2,
            alignItems: 'center',
          }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
              {sessions.filter(s => s.hasNotes).length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
              📝 Sessions with Notes
            </Text>
          </Surface>
          <Surface style={{
            flex: 1,
            padding: SPACING.md,
            marginLeft: SPACING.sm,
            borderRadius: 12,
            elevation: 2,
            alignItems: 'center',
          }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
              {sessions.filter(s => s.completed).length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
              ✅ Completed Sessions
            </Text>
          </Surface>
        </View>

        {/* Motivation Card */}
        <Card style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          elevation: 2,
          borderRadius: 16,
        }}>
          <LinearGradient
            colors={['#FFD54F', '#FFCA28']}
            style={{
              padding: SPACING.md,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 40, marginRight: SPACING.md }}>🌟</Text>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: '#333' }]}>
                Keep it up, champion! 
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: '#555' }]}>
                Writing notes helps you improve faster! 🚀
              </Text>
            </View>
          </LinearGradient>
        </Card>

        {/* Sessions List */}
        {sessions.map((session, index) => (
          <SessionCard key={session.id} session={session} index={index} />
        ))}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Add Note Modal */}
      <Portal>
        <Modal
          visible={showNoteModal}
          onDismiss={() => setShowNoteModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.md,
            borderRadius: 20,
            maxHeight: '80%',
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView style={{ flex: 1 }}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={{
                  padding: SPACING.lg,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              >
                <Text style={[TEXT_STYLES.h3, { color: 'white', textAlign: 'center' }]}>
                  📝 Add Your Training Notes
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: SPACING.xs }]}>
                  {selectedSession?.title}
                </Text>
              </LinearGradient>

              <View style={{ padding: SPACING.lg }}>
                {/* Note Input */}
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                    How did your training go? 💭
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 2,
                      borderColor: COLORS.border,
                      borderRadius: 12,
                      padding: SPACING.md,
                      minHeight: 100,
                      fontSize: 16,
                      textAlignVertical: 'top',
                    }}
                    placeholder="Tell us about your training! What did you learn? How did you feel? What was fun? 😊"
                    value={noteText}
                    onChangeText={setNoteText}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Rating Selectors */}
                <RatingSelector
                  label="How did you feel today?"
                  value={moodRating}
                  onChange={setMoodRating}
                  getEmoji={getMoodEmoji}
                />

                <RatingSelector
                  label="How hard did you try?"
                  value={effortRating}
                  onChange={setEffortRating}
                  getEmoji={getEffortEmoji}
                />

                <RatingSelector
                  label="How much fun was it?"
                  value={funRating}
                  onChange={setFunRating}
                  getEmoji={getFunEmoji}
                />

                {/* Action Buttons */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: SPACING.lg,
                }}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowNoteModal(false)}
                    style={{
                      flex: 1,
                      marginRight: SPACING.sm,
                      borderRadius: 25,
                    }}
                    contentStyle={{ paddingVertical: SPACING.sm }}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSaveNote}
                    style={{
                      flex: 1,
                      marginLeft: SPACING.sm,
                      borderRadius: 25,
                      backgroundColor: COLORS.primary,
                    }}
                    contentStyle={{ paddingVertical: SPACING.sm }}
                  >
                    🎉 Save Notes
                  </Button>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
    </View>
  );
};

export default SessionNotes;