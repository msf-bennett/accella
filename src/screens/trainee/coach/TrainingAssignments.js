import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  Vibration,
  FlatList,
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
  Modal,
  Badge,
  Divider,
  TextInput,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/styles';

const { width } = Dimensions.get('window');

const TrainingAssignments = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { assignments, trainingPlans } = useSelector(state => state.training);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'pending', label: 'Pending', icon: 'schedule' },
    { key: 'in-progress', label: 'In Progress', icon: 'play-circle' },
    { key: 'completed', label: 'Completed', icon: 'check-circle' },
    { key: 'overdue', label: 'Overdue', icon: 'error' },
  ];

  useEffect(() => {
    loadTrainingAssignments();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadTrainingAssignments = useCallback(async () => {
    try {
      // dispatch(loadUserAssignments(user.id));
    } catch (error) {
      console.error('Error loading training assignments:', error);
      Alert.alert('Error', 'Failed to load training assignments');
    }
  }, [dispatch, user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrainingAssignments();
    setRefreshing(false);
  }, [loadTrainingAssignments]);

  const handleAssignmentPress = (assignment) => {
    Vibration.vibrate(50);
    setSelectedAssignment(assignment);
    setShowAssignmentModal(true);
  };

  const handleStartAssignment = async (assignment) => {
    try {
      // dispatch(startTrainingAssignment(assignment.id));
      Alert.alert('Assignment Started', 'Good luck with your training! 💪');
      setShowAssignmentModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to start assignment');
    }
  };

  const handleCompleteAssignment = async (assignment) => {
    try {
      // dispatch(completeTrainingAssignment(assignment.id));
      Alert.alert('Congratulations! 🎉', 'Assignment completed successfully!');
      setShowAssignmentModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete assignment');
    }
  };

  const handleCreateAssignment = () => {
    if (user.role === 'coach' || user.role === 'trainer') {
      setShowCreateModal(true);
    } else {
      Alert.alert(
        "Access Restricted", 
        "Only coaches and trainers can create assignments."
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'in-progress':
        return COLORS.primary;
      case 'pending':
        return COLORS.warning;
      case 'overdue':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'in-progress':
        return 'play-circle';
      case 'pending':
        return 'schedule';
      case 'overdue':
        return 'error';
      default:
        return 'help-circle';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return COLORS.success;
      case 'medium':
        return COLORS.warning;
      case 'hard':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  // Mock training assignments data
  const mockAssignments = [
    {
      id: 1,
      title: "Cardio Endurance Training",
      description: "Build your cardiovascular endurance with this comprehensive workout",
      assignedBy: "Coach Martinez",
      assignedDate: "2024-08-22",
      dueDate: "2024-08-25",
      status: "pending",
      difficulty: "medium",
      duration: 45,
      exercises: 8,
      progress: 0,
      category: "Cardio",
      priority: "high",
      instructions: "Focus on maintaining steady heart rate throughout the session",
      equipment: ["Treadmill", "Jump Rope", "Timer"],
      targetMetrics: {
        heartRate: "150-170 bpm",
        duration: "45 minutes",
        calories: "400-500"
      }
    },
    {
      id: 2,
      title: "Strength Training - Upper Body",
      description: "Focused strength training for upper body development",
      assignedBy: "Trainer Johnson",
      assignedDate: "2024-08-20",
      dueDate: "2024-08-23",
      status: "in-progress",
      difficulty: "hard",
      duration: 60,
      exercises: 12,
      progress: 65,
      category: "Strength",
      priority: "medium",
      instructions: "Focus on proper form over speed. Rest 2-3 minutes between sets",
      equipment: ["Dumbbells", "Bench", "Pull-up Bar"],
      targetMetrics: {
        sets: "3-4 sets",
        reps: "8-12 reps",
        weight: "Progressive overload"
      }
    },
    {
      id: 3,
      title: "Soccer Drills - Ball Control",
      description: "Improve ball control and first touch with these drills",
      assignedBy: "Coach Martinez",
      assignedDate: "2024-08-19",
      dueDate: "2024-08-22",
      status: "completed",
      difficulty: "easy",
      duration: 30,
      exercises: 6,
      progress: 100,
      category: "Skills",
      priority: "high",
      instructions: "Practice with both feet, focus on clean first touches",
      equipment: ["Soccer Ball", "Cones", "Wall"],
      targetMetrics: {
        touches: "100 per foot",
        accuracy: "80%+",
        time: "30 minutes"
      },
      completedDate: "2024-08-21"
    },
    {
      id: 4,
      title: "Flexibility & Recovery",
      description: "Post-workout stretching and recovery routine",
      assignedBy: "Trainer Johnson",
      assignedDate: "2024-08-18",
      dueDate: "2024-08-20",
      status: "overdue",
      difficulty: "easy",
      duration: 20,
      exercises: 10,
      progress: 30,
      category: "Recovery",
      priority: "low",
      instructions: "Hold each stretch for 30-60 seconds, breathe deeply",
      equipment: ["Yoga Mat", "Foam Roller"],
      targetMetrics: {
        duration: "20 minutes",
        stretches: "10 different",
        hold: "30-60 seconds"
      }
    },
    {
      id: 5,
      title: "Speed & Agility Training",
      description: "Explosive speed and agility development session",
      assignedBy: "Coach Martinez",
      assignedDate: "2024-08-24",
      dueDate: "2024-08-27",
      status: "pending",
      difficulty: "hard",
      duration: 50,
      exercises: 7,
      progress: 0,
      category: "Speed",
      priority: "high",
      instructions: "Focus on explosive movements and quick direction changes",
      equipment: ["Cones", "Ladder", "Hurdles", "Stopwatch"],
      targetMetrics: {
        sprints: "10 x 40m",
        rest: "90 seconds",
        improvement: "5% speed increase"
      }
    }
  ];

  const filteredAssignments = mockAssignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.assignedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch && assignment.status === selectedFilter;
  });

  const renderAssignmentCard = ({ item }) => (
    <Animated.View
      style={[
        styles.assignmentCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleAssignmentPress(item)}
        style={styles.assignmentTouchable}
        activeOpacity={0.7}
      >
        <Surface style={styles.assignmentSurface}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
            style={styles.assignmentGradient}
          >
            {/* Header */}
            <View style={styles.assignmentHeader}>
              <View style={styles.assignmentTitleRow}>
                <Text style={styles.assignmentTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={styles.priorityBadge}>
                  {item.priority === 'high' && (
                    <Icon name="priority-high" size={16} color={COLORS.error} />
                  )}
                  {item.priority === 'medium' && (
                    <Icon name="remove" size={16} color={COLORS.warning} />
                  )}
                  {item.priority === 'low' && (
                    <Icon name="keyboard-arrow-down" size={16} color={COLORS.success} />
                  )}
                </View>
              </View>
              
              <Text style={styles.assignmentDescription} numberOfLines={2}>
                {item.description}
              </Text>
              
              <View style={styles.assignmentMetaRow}>
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
                  textStyle={{ color: getStatusColor(item.status) }}
                  icon={getStatusIcon(item.status)}
                >
                  {item.status.replace('-', ' ').toUpperCase()}
                </Chip>
                
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.difficultyChip, { borderColor: getDifficultyColor(item.difficulty) }]}
                  textStyle={{ color: getDifficultyColor(item.difficulty) }}
                >
                  {item.difficulty.toUpperCase()}
                </Chip>
              </View>
            </View>

            {/* Assignment Details */}
            <View style={styles.assignmentDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Icon name="person" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>By {item.assignedBy}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{formatDuration(item.duration)}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{item.exercises} exercises</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="event" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress */}
            {item.status !== 'pending' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>{item.progress}%</Text>
                </View>
                <ProgressBar
                  progress={item.progress / 100}
                  color={getStatusColor(item.status)}
                  style={styles.progressBar}
                />
              </View>
            )}

            {/* Category Badge */}
            <View style={styles.categoryContainer}>
              <Surface style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </Surface>
            </View>
          </LinearGradient>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderAssignmentModal = () => (
    <Portal>
      <Modal
        visible={showAssignmentModal}
        onDismiss={() => setShowAssignmentModal(false)}
        contentContainerStyle={styles.assignmentModal}
      >
        <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            {selectedAssignment && (
              <>
                {/* Modal Header */}
                <LinearGradient
                  colors={[COLORS.primary, '#764ba2']}
                  style={styles.modalHeader}
                >
                  <View style={styles.modalHeaderContent}>
                    <View style={styles.modalTitleContainer}>
                      <Text style={styles.modalTitle}>
                        {selectedAssignment.title}
                      </Text>
                      <Text style={styles.modalSubtitle}>
                        Assigned by {selectedAssignment.assignedBy}
                      </Text>
                    </View>
                    <IconButton
                      icon="close"
                      iconColor="white"
                      size={24}
                      onPress={() => setShowAssignmentModal(false)}
                    />
                  </View>
                  
                  <View style={styles.modalMetrics}>
                    <View style={styles.metricItem}>
                      <Icon name="schedule" size={20} color="white" />
                      <Text style={styles.metricText}>
                        {formatDuration(selectedAssignment.duration)}
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Icon name="fitness-center" size={20} color="white" />
                      <Text style={styles.metricText}>
                        {selectedAssignment.exercises} exercises
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Icon name="trending-up" size={20} color="white" />
                      <Text style={styles.metricText}>
                        {selectedAssignment.difficulty}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Assignment Content */}
                <ScrollView style={styles.modalScrollView}>
                  {/* Status and Progress */}
                  <View style={styles.modalSection}>
                    <View style={styles.statusRow}>
                      <Chip
                        mode="flat"
                        style={[styles.modalStatusChip, { backgroundColor: getStatusColor(selectedAssignment.status) }]}
                        textStyle={{ color: 'white' }}
                        icon={getStatusIcon(selectedAssignment.status)}
                      >
                        {selectedAssignment.status.replace('-', ' ').toUpperCase()}
                      </Chip>
                      
                      {selectedAssignment.status !== 'pending' && (
                        <View style={styles.progressDisplay}>
                          <Text style={styles.progressDisplayText}>
                            {selectedAssignment.progress}% Complete
                          </Text>
                          <ProgressBar
                            progress={selectedAssignment.progress / 100}
                            color={getStatusColor(selectedAssignment.status)}
                            style={styles.modalProgressBar}
                          />
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Description */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>
                      {selectedAssignment.description}
                    </Text>
                  </View>

                  {/* Instructions */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Instructions</Text>
                    <Text style={styles.instructionText}>
                      {selectedAssignment.instructions}
                    </Text>
                  </View>

                  {/* Target Metrics */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Target Metrics</Text>
                    <View style={styles.metricsGrid}>
                      {Object.entries(selectedAssignment.targetMetrics).map(([key, value]) => (
                        <Surface key={key} style={styles.metricCard}>
                          <Text style={styles.metricCardLabel}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Text>
                          <Text style={styles.metricCardValue}>{value}</Text>
                        </Surface>
                      ))}
                    </View>
                  </View>

                  {/* Equipment */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Required Equipment</Text>
                    <View style={styles.equipmentContainer}>
                      {selectedAssignment.equipment.map((item, index) => (
                        <Chip
                          key={index}
                          mode="outlined"
                          style={styles.equipmentChip}
                          icon="build"
                        >
                          {item}
                        </Chip>
                      ))}
                    </View>
                  </View>

                  {/* Due Date */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Timeline</Text>
                    <View style={styles.timelineContainer}>
                      <View style={styles.timelineItem}>
                        <Icon name="event-note" size={20} color={COLORS.primary} />
                        <Text style={styles.timelineText}>
                          Assigned: {new Date(selectedAssignment.assignedDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.timelineItem}>
                        <Icon name="event-available" size={20} color={selectedAssignment.status === 'overdue' ? COLORS.error : COLORS.success} />
                        <Text style={[styles.timelineText, selectedAssignment.status === 'overdue' && { color: COLORS.error }]}>
                          Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                        </Text>
                      </View>
                      {selectedAssignment.completedDate && (
                        <View style={styles.timelineItem}>
                          <Icon name="check-circle" size={20} color={COLORS.success} />
                          <Text style={styles.timelineText}>
                            Completed: {new Date(selectedAssignment.completedDate).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  {selectedAssignment.status === 'pending' && (
                    <Button
                      mode="contained"
                      onPress={() => handleStartAssignment(selectedAssignment)}
                      style={styles.actionButton}
                      icon="play-arrow"
                    >
                      Start Assignment
                    </Button>
                  )}
                  
                  {selectedAssignment.status === 'in-progress' && (
                    <View style={styles.actionRow}>
                      <Button
                        mode="outlined"
                        onPress={() => {
                          navigation.navigate('WorkoutSession', { 
                            assignmentId: selectedAssignment.id 
                          });
                          setShowAssignmentModal(false);
                        }}
                        style={[styles.actionButton, { flex: 1, marginRight: SPACING.sm }]}
                        icon="play-arrow"
                      >
                        Continue
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => handleCompleteAssignment(selectedAssignment)}
                        style={[styles.actionButton, { flex: 1 }]}
                        icon="check"
                      >
                        Complete
                      </Button>
                    </View>
                  )}
                  
                  {selectedAssignment.status === 'completed' && (
                    <Button
                      mode="outlined"
                      onPress={() => {
                        navigation.navigate('WorkoutHistory', { 
                          assignmentId: selectedAssignment.id 
                        });
                        setShowAssignmentModal(false);
                      }}
                      style={styles.actionButton}
                      icon="history"
                    >
                      View Results
                    </Button>
                  )}
                  
                  {selectedAssignment.status === 'overdue' && (
                    <Button
                      mode="contained"
                      onPress={() => handleStartAssignment(selectedAssignment)}
                      style={[styles.actionButton, { backgroundColor: COLORS.error }]}
                      icon="play-arrow"
                    >
                      Start Now
                    </Button>
                  )}
                </View>
              </>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Training Assignments</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon={viewMode === 'list' ? 'grid-view' : 'view-list'}
              iconColor="white"
              size={24}
              onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            />
            <IconButton
              icon="sort"
              iconColor="white"
              size={24}
              onPress={() => {
                Alert.alert('Sort Options', 'Feature coming soon!');
              }}
            />
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search assignments..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <Surface style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="assignment" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{mockAssignments.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="schedule" size={24} color={COLORS.warning} />
            <Text style={styles.statNumber}>
              {mockAssignments.filter(a => a.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="play-circle" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>
              {mockAssignments.filter(a => a.status === 'in-progress').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="check-circle" size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>
              {mockAssignments.filter(a => a.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>
      </Surface>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <Chip
            key={option.key}
            mode={selectedFilter === option.key ? 'flat' : 'outlined'}
            selected={selectedFilter === option.key}
            onPress={() => setSelectedFilter(option.key)}
            style={[
              styles.filterChip,
              selectedFilter === option.key && styles.selectedFilterChip,
            ]}
            icon={option.icon}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Assignments List */}
      <FlatList
        data={filteredAssignments}
        renderItem={renderAssignmentCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.assignmentsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="assignment-turned-in" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No assignments found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'New assignments will appear here'}
            </Text>
          </View>
        }
      />

      {/* FAB for Create Assignment */}
      {(user.role === 'coach' || user.role === 'trainer') && (
        <FAB
          icon="add"
          style={styles.fab}
          onPress={handleCreateAssignment}
          color="white"
        />
      )}

      {/* Assignment Detail Modal */}
      {renderAssignmentModal()}
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.header,
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchContainer: {
    marginTop: SPACING.sm,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 0,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  statsContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  filterContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  // Missing styles continuation from filterContent:
  filterContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginHorizontal: SPACING.xs,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  assignmentsList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 80, // Account for FAB
  },
  assignmentCard: {
    marginBottom: SPACING.md,
  },
  assignmentTouchable: {
    borderRadius: 12,
  },
  assignmentSurface: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  assignmentGradient: {
    padding: SPACING.md,
    borderRadius: 12,
  },
  assignmentHeader: {
    marginBottom: SPACING.sm,
  },
  assignmentTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  assignmentTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  priorityBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignmentDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  assignmentMetaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statusChip: {
    height: 28,
  },
  difficultyChip: {
    height: 28,
  },
  assignmentDetails: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  progressContainer: {
    marginTop: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  progressValue: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  categoryContainer: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    elevation: 1,
  },
  categoryText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  
  // Modal Styles
  assignmentModal: {
    flex: 1,
    margin: 0,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  modalHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  modalStatusChip: {
    marginRight: SPACING.sm,
  },
  progressDisplay: {
    flex: 1,
  },
  progressDisplayText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textAlign: 'right',
  },
  modalProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  descriptionText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  instructionText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    padding: SPACING.sm,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - SPACING.md * 4) / 2,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  metricCardLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  metricCardValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  equipmentChip: {
    marginBottom: SPACING.xs,
  },
  timelineContainer: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: SPACING.sm,
    borderRadius: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timelineText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  modalActions: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TrainingAssignments;