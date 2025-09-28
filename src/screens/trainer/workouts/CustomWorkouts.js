import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  TextInput,
  Modal,
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
  Searchbar,
  Portal,
  Dialog,
  RadioButton,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const CustomWorkouts = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { workouts, isLoading } = useSelector(state => state.workouts);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    description: '',
    category: 'strength',
    difficulty: 'beginner',
    duration: '30',
    targetMuscles: [],
    equipment: [],
  });

  // Mock data for development
  const [customWorkouts, setCustomWorkouts] = useState([
    {
      id: 1,
      name: 'HIIT Cardio Blast',
      category: 'cardio',
      difficulty: 'intermediate',
      duration: '30 min',
      exercises: 8,
      clients: 12,
      rating: 4.8,
      isPublic: true,
      lastModified: '2 days ago',
      targetMuscles: ['Full Body'],
      equipment: ['None'],
      description: 'High-intensity interval training for maximum calorie burn',
    },
    {
      id: 2,
      name: 'Strength Builder',
      category: 'strength',
      difficulty: 'advanced',
      duration: '45 min',
      exercises: 12,
      clients: 8,
      rating: 4.9,
      isPublic: false,
      lastModified: '1 week ago',
      targetMuscles: ['Chest', 'Arms', 'Core'],
      equipment: ['Dumbbells', 'Barbell'],
      description: 'Progressive overload workout for muscle building',
    },
    {
      id: 3,
      name: 'Flexibility Flow',
      category: 'flexibility',
      difficulty: 'beginner',
      duration: '20 min',
      exercises: 6,
      clients: 15,
      rating: 4.7,
      isPublic: true,
      lastModified: '3 days ago',
      targetMuscles: ['Full Body'],
      equipment: ['Yoga Mat'],
      description: 'Gentle stretching routine for improved mobility',
    },
  ]);

  const categories = ['all', 'strength', 'cardio', 'flexibility', 'sports', 'recovery'];
  const difficultyColors = {
    beginner: COLORS.success,
    intermediate: '#FF9500',
    advanced: COLORS.error,
  };

  // Animation setup
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

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchCustomWorkouts());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh workouts');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter workouts
  const filteredWorkouts = customWorkouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || workout.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Create new workout
  const handleCreateWorkout = () => {
    if (!newWorkout.name.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    const workout = {
      id: Date.now(),
      ...newWorkout,
      exercises: 0,
      clients: 0,
      rating: 0,
      isPublic: false,
      lastModified: 'Just now',
    };

    setCustomWorkouts(prev => [workout, ...prev]);
    setNewWorkout({
      name: '',
      description: '',
      category: 'strength',
      difficulty: 'beginner',
      duration: '30',
      targetMuscles: [],
      equipment: [],
    });
    setShowCreateModal(false);
    Alert.alert('Success', 'Workout created successfully! 🎉');
  };

  // Render workout card
  const renderWorkoutCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <Card style={styles.workoutCard} elevation={4}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.cardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.cardHeaderContent}>
            <Text style={styles.workoutName}>{item.name}</Text>
            <View style={styles.headerActions}>
              <IconButton
                icon={item.isPublic ? "public" : "lock"}
                iconColor="white"
                size={20}
                onPress={() => Alert.alert('Feature Coming Soon', 'Visibility settings will be available in the next update! 🚀')}
              />
              <IconButton
                icon="dots-vertical"
                iconColor="white"
                size={20}
                onPress={() => Alert.alert('Feature Coming Soon', 'More options will be available in the next update! 🚀')}
              />
            </View>
          </View>
          <Text style={styles.workoutDescription}>{item.description}</Text>
        </LinearGradient>

        <View style={styles.cardContent}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="fitness-center" size={20} color={COLORS.primary} />
              <Text style={styles.statText}>{item.exercises} exercises</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="schedule" size={20} color={COLORS.primary} />
              <Text style={styles.statText}>{item.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="people" size={20} color={COLORS.primary} />
              <Text style={styles.statText}>{item.clients} clients</Text>
            </View>
          </View>

          <View style={styles.tagsRow}>
            <Chip
              style={[styles.difficultyChip, { backgroundColor: difficultyColors[item.difficulty] }]}
              textStyle={styles.chipText}
            >
              {item.difficulty.toUpperCase()}
            </Chip>
            <Chip style={styles.categoryChip} textStyle={styles.categoryChipText}>
              {item.category.toUpperCase()}
            </Chip>
            {item.rating > 0 && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>

          <View style={styles.targetMuscles}>
            <Text style={styles.sectionLabel}>Target Muscles:</Text>
            <View style={styles.musclesRow}>
              {item.targetMuscles.map((muscle, idx) => (
                <Chip key={idx} style={styles.muscleChip} textStyle={styles.muscleChipText}>
                  {muscle}
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('WorkoutBuilder', { workoutId: item.id })}
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
            >
              <Icon name="edit" size={16} /> Edit
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('WorkoutPreview', { workout: item })}
              style={[styles.actionButton, styles.primaryButton]}
              labelStyle={styles.buttonLabel}
            >
              <Icon name="visibility" size={16} /> Preview
            </Button>
          </View>

          <Text style={styles.lastModified}>Last modified: {item.lastModified}</Text>
        </View>
      </Card>
    </Animated.View>
  );

  // Render create workout modal
  const renderCreateModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <IconButton
                icon="close"
                iconColor="white"
                onPress={() => setShowCreateModal(false)}
              />
              <Text style={styles.modalTitle}>Create New Workout</Text>
              <IconButton
                icon="check"
                iconColor="white"
                onPress={handleCreateWorkout}
              />
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Workout Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newWorkout.name}
                onChangeText={(text) => setNewWorkout(prev => ({ ...prev, name: text }))}
                placeholder="Enter workout name..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newWorkout.description}
                onChangeText={(text) => setNewWorkout(prev => ({ ...prev, description: text }))}
                placeholder="Brief description of the workout..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.radioGroup}>
                {['strength', 'cardio', 'flexibility', 'sports'].map(category => (
                  <TouchableOpacity
                    key={category}
                    style={styles.radioOption}
                    onPress={() => setNewWorkout(prev => ({ ...prev, category }))}
                  >
                    <RadioButton
                      value={category}
                      status={newWorkout.category === category ? 'checked' : 'unchecked'}
                      color={COLORS.primary}
                    />
                    <Text style={styles.radioText}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Difficulty Level</Text>
              <View style={styles.radioGroup}>
                {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                  <TouchableOpacity
                    key={difficulty}
                    style={styles.radioOption}
                    onPress={() => setNewWorkout(prev => ({ ...prev, difficulty }))}
                  >
                    <RadioButton
                      value={difficulty}
                      status={newWorkout.difficulty === difficulty ? 'checked' : 'unchecked'}
                      color={COLORS.primary}
                    />
                    <Text style={styles.radioText}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.textInput}
                value={newWorkout.duration}
                onChangeText={(text) => setNewWorkout(prev => ({ ...prev, duration: text }))}
                placeholder="30"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Custom Workouts 💪</Text>
          <Text style={styles.headerSubtitle}>Create & manage your training programs</Text>
        </View>
        
        {/* Search Bar */}
        <Searchbar
          placeholder="Search workouts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map(category => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryFilter,
                selectedCategory === category && styles.selectedCategoryFilter
              ]}
              textStyle={[
                styles.categoryFilterText,
                selectedCategory === category && styles.selectedCategoryFilterText
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Chip>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Stats Card */}
      <Surface style={styles.statsCard} elevation={2}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{customWorkouts.length}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{customWorkouts.reduce((acc, w) => acc + w.clients, 0)}</Text>
            <Text style={styles.statLabel}>Active Clients</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{customWorkouts.filter(w => w.isPublic).length}</Text>
            <Text style={styles.statLabel}>Public</Text>
          </View>
        </View>
      </Surface>

      {/* Workouts List */}
      <FlatList
        data={filteredWorkouts}
        renderItem={renderWorkoutCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
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
          <View style={styles.emptyState}>
            <Icon name="fitness-center" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No workouts found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Create your first custom workout'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        color="white"
      />

      {/* Create Modal */}
      {renderCreateModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  categoryScroll: {
    marginHorizontal: -SPACING.lg,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.lg,
  },
  categoryFilter: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedCategoryFilter: {
    backgroundColor: 'white',
  },
  categoryFilterText: {
    color: 'white',
    fontSize: 12,
  },
  selectedCategoryFilterText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statsCard: {
    margin: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: SPACING.md,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  workoutCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workoutName: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    marginRight: SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
  },
  workoutDescription: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.sm,
  },
  cardContent: {
    padding: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginLeft: SPACING.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  difficultyChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  chipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  categoryChipText: {
    color: '#666',
    fontSize: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginLeft: SPACING.xs,
  },
  targetMuscles: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: SPACING.xs,
  },
  musclesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleChip: {
    backgroundColor: '#e8f2ff',
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  muscleChipText: {
    color: COLORS.primary,
    fontSize: 10,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  actionButton: {
    flex: 0.48,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  buttonLabel: {
    fontSize: 12,
  },
  lastModified: {
    ...TEXT_STYLES.caption,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: '#666',
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: '#999',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  formLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  radioText: {
    ...TEXT_STYLES.body,
    color: '#333',
    marginLeft: SPACING.xs,
  },
};