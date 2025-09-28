import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  RefreshControl,
  Vibration,
  Dimensions,
  Platform
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
  TextInput,
  ProgressBar,
  Divider
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0'
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textLight },
  small: { fontSize: 12, color: COLORS.textLight }
};

const { width: screenWidth } = Dimensions.get('window');

const SupersetsBuilder = ({ navigation, route }) => {
  // Redux State
  const dispatch = useDispatch();
  const { user, exercises, workoutPlans } = useSelector(state => ({
    user: state.auth.user,
    exercises: state.exercises.list,
    workoutPlans: state.workouts.plans
  }));

  // Local State
  const [supersets, setSupersets] = useState([]);
  const [currentSuperset, setCurrentSuperset] = useState({
    id: null,
    name: '',
    exercises: [],
    restTime: 60,
    rounds: 3
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showSupersetModal, setShowSupersetModal] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSuperset, setExpandedSuperset] = useState(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample exercises data (would come from Redux/API)
  const sampleExercises = [
    { id: '1', name: 'Push-ups', category: 'Chest', difficulty: 'Beginner', equipment: 'Bodyweight' },
    { id: '2', name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', equipment: 'Pull-up bar' },
    { id: '3', name: 'Squats', category: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight' },
    { id: '4', name: 'Burpees', category: 'Full Body', difficulty: 'Advanced', equipment: 'Bodyweight' },
    { id: '5', name: 'Bench Press', category: 'Chest', difficulty: 'Intermediate', equipment: 'Barbell' },
    { id: '6', name: 'Deadlift', category: 'Back', difficulty: 'Advanced', equipment: 'Barbell' },
    { id: '7', name: 'Mountain Climbers', category: 'Core', difficulty: 'Intermediate', equipment: 'Bodyweight' },
    { id: '8', name: 'Plank', category: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight' },
  ];

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    
    // Initialize with sample data
    setFilteredExercises(sampleExercises);
    
    // Entrance animation
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

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredExercises(sampleExercises);
    } else {
      const filtered = sampleExercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExercises(filtered);
    }
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleAddExerciseToSuperset = (exercise) => {
    if (selectedExercises.find(ex => ex.id === exercise.id)) {
      setSelectedExercises(prev => prev.filter(ex => ex.id !== exercise.id));
    } else {
      setSelectedExercises(prev => [...prev, { ...exercise, reps: 12, duration: 30 }]);
    }
    Vibration.vibrate(30);
  };

  const handleCreateSuperset = () => {
    if (selectedExercises.length < 2) {
      Alert.alert('Insufficient Exercises', 'A superset must contain at least 2 exercises.');
      return;
    }

    if (!currentSuperset.name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for your superset.');
      return;
    }

    const newSuperset = {
      id: Date.now().toString(),
      name: currentSuperset.name,
      exercises: selectedExercises,
      restTime: currentSuperset.restTime,
      rounds: currentSuperset.rounds,
      createdAt: new Date().toISOString(),
      totalExercises: selectedExercises.length
    };

    setSupersets(prev => [...prev, newSuperset]);
    
    // Reset form
    setCurrentSuperset({
      id: null,
      name: '',
      exercises: [],
      restTime: 60,
      rounds: 3
    });
    setSelectedExercises([]);
    setShowSupersetModal(false);
    
    Vibration.vibrate([100, 50, 100]);
    Alert.alert('Success! 💪', 'Superset created successfully!');
  };

  const handleDeleteSuperset = (supersetId) => {
    Alert.alert(
      'Delete Superset',
      'Are you sure you want to delete this superset?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSupersets(prev => prev.filter(s => s.id !== supersetId));
            Vibration.vibrate(100);
          }
        }
      ]
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const renderExerciseCard = (exercise, isSelected = false) => (
    <TouchableOpacity
      key={exercise.id}
      onPress={() => handleAddExerciseToSuperset(exercise)}
      style={{ marginBottom: SPACING.sm }}
    >
      <Card style={[
        { elevation: 2 },
        isSelected && { borderColor: COLORS.primary, borderWidth: 2 }
      ]}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>{exercise.name}</Text>
              <Text style={TEXT_STYLES.caption}>{exercise.category} • {exercise.equipment}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
                <Chip 
                  mode="outlined" 
                  textStyle={{ fontSize: 10 }}
                  style={{ 
                    height: 24,
                    backgroundColor: getDifficultyColor(exercise.difficulty) + '20',
                    borderColor: getDifficultyColor(exercise.difficulty)
                  }}
                >
                  {exercise.difficulty}
                </Chip>
              </View>
            </View>
            <MaterialIcons 
              name={isSelected ? "check-circle" : "add-circle-outline"} 
              size={24} 
              color={isSelected ? COLORS.success : COLORS.primary} 
            />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderSupersetCard = (superset) => (
    <Card key={superset.id} style={{ marginBottom: SPACING.md, elevation: 3 }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
      >
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{superset.name}</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                {superset.exercises.length} exercises • {superset.rounds} rounds • {superset.restTime}s rest
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <IconButton
                icon="expand-more"
                iconColor="white"
                size={24}
                onPress={() => setExpandedSuperset(
                  expandedSuperset === superset.id ? null : superset.id
                )}
              />
              <IconButton
                icon="delete"
                iconColor="white"
                size={20}
                onPress={() => handleDeleteSuperset(superset.id)}
              />
            </View>
          </View>
        </Card.Content>
      </LinearGradient>
      
      {expandedSuperset === superset.id && (
        <Card.Content style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
            Exercises:
          </Text>
          {superset.exercises.map((exercise, index) => (
            <View key={exercise.id} style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              paddingVertical: SPACING.xs,
              borderBottomWidth: index < superset.exercises.length - 1 ? 1 : 0,
              borderBottomColor: COLORS.border
            }}>
              <Avatar.Text 
                size={32} 
                label={(index + 1).toString()} 
                style={{ backgroundColor: COLORS.primary }}
              />
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Text style={TEXT_STYLES.body}>{exercise.name}</Text>
                <Text style={TEXT_STYLES.caption}>
                  {exercise.reps ? `${exercise.reps} reps` : `${exercise.duration}s`}
                </Text>
              </View>
              <Chip mode="outlined" textStyle={{ fontSize: 10 }}>
                {exercise.category}
              </Chip>
            </View>
          ))}
        </Card.Content>
      )}
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ 
          paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginLeft: SPACING.sm }]}>
              Supersets Builder
            </Text>
          </View>
          <Avatar.Text 
            size={40} 
            label="💪" 
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </View>
        
        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginTop: SPACING.xs }]}>
          Create powerful exercise combinations
        </Text>
      </LinearGradient>

      <Animated.View 
        style={{ 
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
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
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Cards */}
          <View style={{ flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm }}>
            <Surface style={{ 
              flex: 1, 
              padding: SPACING.md, 
              borderRadius: 12,
              elevation: 2
            }}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>{supersets.length}</Text>
              <Text style={TEXT_STYLES.caption}>Supersets Created</Text>
            </Surface>
            
            <Surface style={{ 
              flex: 1, 
              padding: SPACING.md, 
              borderRadius: 12,
              elevation: 2
            }}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
                {supersets.reduce((acc, s) => acc + s.exercises.length, 0)}
              </Text>
              <Text style={TEXT_STYLES.caption}>Total Exercises</Text>
            </Surface>
          </View>

          {/* Quick Actions */}
          <View style={{ padding: SPACING.md }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>Quick Actions</Text>
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <Button
                mode="contained"
                icon="add"
                onPress={() => setShowSupersetModal(true)}
                style={{ 
                  flex: 1,
                  backgroundColor: COLORS.primary,
                  borderRadius: 8
                }}
                contentStyle={{ height: 48 }}
              >
                New Superset
              </Button>
              <Button
                mode="outlined"
                icon="fitness-center"
                onPress={() => setShowExerciseModal(true)}
                style={{ 
                  flex: 1,
                  borderColor: COLORS.primary,
                  borderRadius: 8
                }}
                contentStyle={{ height: 48 }}
              >
                Browse Exercises
              </Button>
            </View>
          </View>

          {/* Supersets List */}
          <View style={{ padding: SPACING.md }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
              My Supersets ({supersets.length})
            </Text>
            
            {supersets.length === 0 ? (
              <Card style={{ padding: SPACING.xl, alignItems: 'center' }}>
                <MaterialIcons name="fitness-center" size={64} color={COLORS.textLight} />
                <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.md }]}>
                  No supersets created yet
                </Text>
                <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.xs }]}>
                  Create your first superset to get started!
                </Text>
              </Card>
            ) : (
              supersets.map(renderSupersetCard)
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Exercise Browser Modal */}
      <Portal>
        <Modal
          visible={showExerciseModal}
          onDismiss={() => setShowExerciseModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.md,
            borderRadius: 12,
            maxHeight: '80%'
          }}
        >
          <View style={{ padding: SPACING.md }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Browse Exercises</Text>
            
            <Searchbar
              placeholder="Search exercises..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ marginBottom: SPACING.md }}
            />
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredExercises.map(exercise => renderExerciseCard(exercise))}
            </ScrollView>
          </View>
        </Modal>
      </Portal>

      {/* Create Superset Modal */}
      <Portal>
        <Modal
          visible={showSupersetModal}
          onDismiss={() => setShowSupersetModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.md,
            borderRadius: 12,
            maxHeight: '85%'
          }}
        >
          <ScrollView style={{ padding: SPACING.md }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Create New Superset</Text>
            
            <TextInput
              label="Superset Name"
              value={currentSuperset.name}
              onChangeText={(text) => setCurrentSuperset(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
            />
            
            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
              <TextInput
                label="Rounds"
                value={currentSuperset.rounds.toString()}
                onChangeText={(text) => setCurrentSuperset(prev => ({ 
                  ...prev, 
                  rounds: parseInt(text) || 1 
                }))}
                mode="outlined"
                keyboardType="numeric"
                style={{ flex: 1 }}
              />
              <TextInput
                label="Rest Time (s)"
                value={currentSuperset.restTime.toString()}
                onChangeText={(text) => setCurrentSuperset(prev => ({ 
                  ...prev, 
                  restTime: parseInt(text) || 0 
                }))}
                mode="outlined"
                keyboardType="numeric"
                style={{ flex: 1 }}
              />
            </View>
            
            <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
              Selected Exercises ({selectedExercises.length})
            </Text>
            
            <Searchbar
              placeholder="Search exercises to add..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ marginBottom: SPACING.md }}
            />
            
            {selectedExercises.length > 0 && (
              <View style={{ marginBottom: SPACING.md }}>
                <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.sm }]}>
                  Current Selection:
                </Text>
                {selectedExercises.map(exercise => (
                  <Chip
                    key={exercise.id}
                    mode="flat"
                    onClose={() => handleAddExerciseToSuperset(exercise)}
                    style={{ margin: 2 }}
                  >
                    {exercise.name}
                  </Chip>
                ))}
                <Divider style={{ marginVertical: SPACING.sm }} />
              </View>
            )}
            
            {filteredExercises.map(exercise => 
              renderExerciseCard(exercise, selectedExercises.some(ex => ex.id === exercise.id))
            )}
            
            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md }}>
              <Button
                mode="outlined"
                onPress={() => setShowSupersetModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateSuperset}
                style={{ flex: 1, backgroundColor: COLORS.primary }}
                disabled={selectedExercises.length < 2 || !currentSuperset.name.trim()}
              >
                Create Superset
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          bottom: SPACING.lg,
          right: SPACING.lg,
          backgroundColor: COLORS.primary
        }}
        onPress={() => setShowSupersetModal(true)}
      />
    </View>
  );
};

export default SupersetsBuilder;