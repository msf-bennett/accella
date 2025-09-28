import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
  Animated,
  Vibration,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  IconButton,
  Surface,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#F5F5F5',
  surface: '#FFFFFF',
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheader: {
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

const { width } = Dimensions.get('window');

const FormChecklist = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { sessionId, sessionData } = route.params || {};
  
  // Redux state
  const user = useSelector(state => state.auth.user);
  const trainingSession = useSelector(state => 
    state.training.sessions.find(s => s.id === sessionId)
  );
  
  // Local state
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [notes, setNotes] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [animatedValues] = useState({
    fadeIn: new Animated.Value(0),
    slideIn: new Animated.Value(50),
    progress: new Animated.Value(0),
  });

  // Sample training data structure
  const [trainingData] = useState({
    sessionTitle: "Upper Body Strength - Week 3 Day 2",
    date: new Date().toLocaleDateString(),
    exercises: [
      {
        id: '1',
        name: 'Push-ups',
        type: 'strength',
        sets: [
          { id: '1-1', reps: 12, weight: 'bodyweight', completed: false },
          { id: '1-2', reps: 10, weight: 'bodyweight', completed: false },
          { id: '1-3', reps: 8, weight: 'bodyweight', completed: false },
        ]
      },
      {
        id: '2',
        name: 'Dumbbell Bench Press',
        type: 'strength',
        sets: [
          { id: '2-1', reps: 12, weight: '25kg', completed: false },
          { id: '2-2', reps: 10, weight: '30kg', completed: false },
          { id: '2-3', reps: 8, weight: '32.5kg', completed: false },
        ]
      },
      {
        id: '3',
        name: 'Pull-ups',
        type: 'strength',
        sets: [
          { id: '3-1', reps: 8, weight: 'bodyweight', completed: false },
          { id: '3-2', reps: 6, weight: 'bodyweight', completed: false },
          { id: '3-3', reps: 4, weight: 'bodyweight', completed: false },
        ]
      },
      {
        id: '4',
        name: 'Warm-up Cardio',
        type: 'cardio',
        duration: '10 minutes',
        intensity: 'light',
        completed: false,
      },
      {
        id: '5',
        name: 'Cool-down Stretching',
        type: 'flexibility',
        duration: '15 minutes',
        completed: false,
      }
    ],
    preWorkoutChecks: [
      { id: 'hydration', label: '💧 Proper Hydration', completed: false },
      { id: 'warmup', label: '🏃‍♂️ Dynamic Warm-up', completed: false },
      { id: 'equipment', label: '🏋️‍♂️ Equipment Check', completed: false },
    ],
    postWorkoutChecks: [
      { id: 'cooldown', label: '🧘‍♂️ Cool-down Completed', completed: false },
      { id: 'nutrition', label: '🍎 Post-workout Nutrition', completed: false },
      { id: 'recovery', label: '😌 Recovery Plan Set', completed: false },
    ]
  });

  useEffect(() => {
    // Initialize animations
    Animated.parallel([
      Animated.timing(animatedValues.fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues.slideIn, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Update progress animation
    const totalItems = getTotalChecklistItems();
    const completedItems = checkedItems.size;
    const progressValue = totalItems > 0 ? completedItems / totalItems : 0;
    
    Animated.timing(animatedValues.progress, {
      toValue: progressValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Check if session is complete
    if (progressValue >= 0.8) {
      setSessionComplete(true);
    }
  }, [checkedItems]);

  const getTotalChecklistItems = () => {
    let total = 0;
    total += trainingData.preWorkoutChecks.length;
    total += trainingData.postWorkoutChecks.length;
    total += trainingData.exercises.reduce((sum, exercise) => {
      if (exercise.sets) {
        return sum + exercise.sets.length;
      }
      return sum + 1; // For cardio/flexibility exercises
    }, 0);
    return total;
  };

  const handleItemCheck = useCallback((itemId, itemType = 'exercise') => {
    Vibration.vibrate(50);
    
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });

    // Dispatch action to update training progress
    dispatch({
      type: 'UPDATE_TRAINING_PROGRESS',
      payload: {
        sessionId,
        itemId,
        itemType,
        completed: !checkedItems.has(itemId),
      }
    });
  }, [checkedItems, sessionId, dispatch]);

  const handleAddNote = (item) => {
    setSelectedItem(item);
    setShowNoteModal(true);
  };

  const saveNote = (noteText) => {
    setNotes(prev => ({
      ...prev,
      [selectedItem.id]: noteText,
    }));
    setShowNoteModal(false);
    setSelectedItem(null);
  };

  const handleCompleteSession = () => {
    const completionRate = (checkedItems.size / getTotalChecklistItems()) * 100;
    
    Alert.alert(
      "🎉 Session Complete!",
      `Great job! You completed ${completionRate.toFixed(0)}% of your training session.\n\nYour progress has been saved and your coach will be notified.`,
      [
        {
          text: "View Summary",
          onPress: () => navigation.navigate('SessionSummary', { 
            sessionId,
            completionRate,
            checkedItems: Array.from(checkedItems),
            notes 
          })
        },
        {
          text: "Continue Training",
          style: "cancel"
        }
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderExerciseSet = (exercise, set, index) => (
    <TouchableOpacity
      key={set.id}
      onPress={() => handleItemCheck(set.id)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        backgroundColor: checkedItems.has(set.id) ? COLORS.success + '20' : 'transparent',
        borderRadius: 8,
        marginVertical: SPACING.xs,
      }}
    >
      <Icon
        name={checkedItems.has(set.id) ? 'check-circle' : 'radio-button-unchecked'}
        size={24}
        color={checkedItems.has(set.id) ? COLORS.success : COLORS.textSecondary}
      />
      <View style={{ flex: 1, marginLeft: SPACING.sm }}>
        <Text style={[TEXT_STYLES.body, { textDecorationLine: checkedItems.has(set.id) ? 'line-through' : 'none' }]}>
          Set {index + 1}: {set.reps} reps @ {set.weight}
        </Text>
      </View>
      <IconButton
        icon="note-add"
        size={20}
        onPress={() => handleAddNote(set)}
        iconColor={notes[set.id] ? COLORS.primary : COLORS.textSecondary}
      />
    </TouchableOpacity>
  );

  const renderExercise = (exercise) => (
    <Card key={exercise.id} style={{ marginVertical: SPACING.sm, elevation: 2 }}>
      <View style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
          <Icon
            name={exercise.type === 'strength' ? 'fitness-center' : exercise.type === 'cardio' ? 'directions-run' : 'self-improvement'}
            size={24}
            color={COLORS.primary}
          />
          <Text style={[TEXT_STYLES.subheader, { marginLeft: SPACING.sm, flex: 1 }]}>
            {exercise.name}
          </Text>
          <Chip
            mode="outlined"
            textStyle={{ fontSize: 12 }}
          >
            {exercise.type}
          </Chip>
        </View>

        {exercise.sets ? (
          <View>
            {exercise.sets.map((set, index) => renderExerciseSet(exercise, set, index))}
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => handleItemCheck(exercise.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.sm,
              backgroundColor: checkedItems.has(exercise.id) ? COLORS.success + '20' : 'transparent',
              borderRadius: 8,
            }}
          >
            <Icon
              name={checkedItems.has(exercise.id) ? 'check-circle' : 'radio-button-unchecked'}
              size={24}
              color={checkedItems.has(exercise.id) ? COLORS.success : COLORS.textSecondary}
            />
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={[TEXT_STYLES.body, { textDecorationLine: checkedItems.has(exercise.id) ? 'line-through' : 'none' }]}>
                {exercise.duration && `Duration: ${exercise.duration}`}
                {exercise.intensity && ` • Intensity: ${exercise.intensity}`}
              </Text>
            </View>
            <IconButton
              icon="note-add"
              size={20}
              onPress={() => handleAddNote(exercise)}
              iconColor={notes[exercise.id] ? COLORS.primary : COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  const renderChecklistSection = (title, items, sectionType) => (
    <Card style={{ marginVertical: SPACING.sm, elevation: 2 }}>
      <View style={{ padding: SPACING.md }}>
        <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md, color: COLORS.primary }]}>
          {title}
        </Text>
        {items.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleItemCheck(item.id, sectionType)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.sm,
              backgroundColor: checkedItems.has(item.id) ? COLORS.success + '20' : 'transparent',
              borderRadius: 8,
              marginVertical: SPACING.xs,
            }}
          >
            <Icon
              name={checkedItems.has(item.id) ? 'check-circle' : 'radio-button-unchecked'}
              size={24}
              color={checkedItems.has(item.id) ? COLORS.success : COLORS.textSecondary}
            />
            <Text style={[
              TEXT_STYLES.body, 
              { 
                marginLeft: SPACING.sm, 
                flex: 1,
                textDecorationLine: checkedItems.has(item.id) ? 'line-through' : 'none' 
              }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={{
          paddingTop: 50,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <IconButton
            icon="arrow-back"
            size={24}
            onPress={() => navigation.goBack()}
            iconColor="white"
          />
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.header, { color: 'white' }]}>
              Training Checklist
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'white', opacity: 0.8 }]}>
              {trainingData.sessionTitle} • {trainingData.date}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ marginTop: SPACING.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
            <Text style={[TEXT_STYLES.caption, { color: 'white' }]}>
              Progress: {checkedItems.size}/{getTotalChecklistItems()} completed
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'white' }]}>
              {Math.round((checkedItems.size / getTotalChecklistItems()) * 100)}%
            </Text>
          </View>
          <Animated.View
            style={{
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                height: '100%',
                backgroundColor: 'white',
                borderRadius: 4,
                width: animatedValues.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </Animated.View>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md }}
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
        {/* Pre-workout Checklist */}
        {renderChecklistSection("🚀 Pre-Workout Checklist", trainingData.preWorkoutChecks, 'pre-workout')}

        {/* Exercises */}
        <Text style={[TEXT_STYLES.header, { marginVertical: SPACING.md, color: COLORS.primary }]}>
          💪 Training Exercises
        </Text>
        {trainingData.exercises.map(renderExercise)}

        {/* Post-workout Checklist */}
        {renderChecklistSection("✨ Post-Workout Checklist", trainingData.postWorkoutChecks, 'post-workout')}

        {/* Session Completion */}
        {sessionComplete && (
          <Card style={{ marginVertical: SPACING.lg, elevation: 4 }}>
            <LinearGradient
              colors={[COLORS.success, '#45a049']}
              style={{ padding: SPACING.lg, borderRadius: 12 }}
            >
              <View style={{ alignItems: 'center' }}>
                <Icon name="jump-rope" size={48} color="white" />
                <Text style={[TEXT_STYLES.header, { color: 'white', textAlign: 'center', marginVertical: SPACING.sm }]}>
                  🎉 Great Job!
                </Text>
                <Text style={[TEXT_STYLES.body, { color: 'white', textAlign: 'center', marginBottom: SPACING.md }]}>
                  You're almost done with this session!
                </Text>
                <Button
                  mode="contained"
                  onPress={handleCompleteSession}
                  buttonColor="white"
                  textColor={COLORS.success}
                  style={{ borderRadius: 25 }}
                >
                  Complete Session
                </Button>
              </View>
            </LinearGradient>
          </Card>
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Note Modal */}
      <Portal>
        <Modal
          visible={showNoteModal}
          onDismiss={() => setShowNoteModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.lg,
            borderRadius: 12,
            padding: SPACING.lg,
          }}
        >
          <Text style={[TEXT_STYLES.subheader, { marginBottom: SPACING.md }]}>
            Add Note for {selectedItem?.name || 'Exercise'}
          </Text>
          <View style={{
            backgroundColor: COLORS.background,
            borderRadius: 8,
            padding: SPACING.md,
            minHeight: 100,
            marginBottom: SPACING.lg,
          }}>
            <Text style={[TEXT_STYLES.caption, { fontStyle: 'italic' }]}>
              {notes[selectedItem?.id] || 'Tap to add notes about form, difficulty, or modifications...'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button
              mode="outlined"
              onPress={() => setShowNoteModal(false)}
              style={{ marginRight: SPACING.sm }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                Alert.alert(
                  "Note Feature",
                  "Full note editing functionality coming soon! This will allow you to add detailed feedback about your exercises.",
                  [{ text: "Got it!" }]
                );
                setShowNoteModal(false);
              }}
            >
              Save Note
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default FormChecklist;