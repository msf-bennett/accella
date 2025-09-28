import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  FlatList,
  Modal,
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
  ProgressBar,
  Portal,
  Dialog,
  Checkbox,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const AssignmentManager = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players, trainingPlans, assignments } = useSelector(state => state.coach);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filterOptions = [
    { key: 'all', label: 'All Assignments', icon: 'assignment' },
    { key: 'active', label: 'Active', icon: 'play-circle-filled' },
    { key: 'completed', label: 'Completed', icon: 'check-circle' },
    { key: 'overdue', label: 'Overdue', icon: 'warning' },
  ];

  const mockPlayers = [
    { id: 1, name: 'John Smith', avatar: null, position: 'Forward', level: 'Intermediate', activeAssignments: 3 },
    { id: 2, name: 'Sarah Johnson', avatar: null, position: 'Midfielder', level: 'Advanced', activeAssignments: 2 },
    { id: 3, name: 'Mike Davis', avatar: null, position: 'Defender', level: 'Beginner', activeAssignments: 4 },
    { id: 4, name: 'Emma Wilson', avatar: null, position: 'Goalkeeper', level: 'Intermediate', activeAssignments: 1 },
    { id: 5, name: 'Alex Brown', avatar: null, position: 'Forward', level: 'Advanced', activeAssignments: 3 },
  ];

  const mockTrainingPlans = [
    { id: 1, title: 'Beginner Football Basics', duration: '4 weeks', sessions: 16, difficulty: 'Beginner' },
    { id: 2, title: 'Advanced Shooting Drills', duration: '6 weeks', sessions: 24, difficulty: 'Advanced' },
    { id: 3, title: 'Defensive Tactics', duration: '8 weeks', sessions: 32, difficulty: 'Intermediate' },
    { id: 4, title: 'Goalkeeper Training', duration: '10 weeks', sessions: 40, difficulty: 'All Levels' },
  ];

  const mockAssignments = [
    {
      id: 1,
      playerId: 1,
      playerName: 'John Smith',
      planTitle: 'Beginner Football Basics',
      progress: 75,
      status: 'active',
      dueDate: '2024-09-15',
      completedSessions: 12,
      totalSessions: 16,
    },
    {
      id: 2,
      playerId: 2,
      playerName: 'Sarah Johnson',
      planTitle: 'Advanced Shooting Drills',
      progress: 100,
      status: 'completed',
      dueDate: '2024-08-30',
      completedSessions: 24,
      totalSessions: 24,
    },
    {
      id: 3,
      playerId: 3,
      playerName: 'Mike Davis',
      planTitle: 'Defensive Tactics',
      progress: 45,
      status: 'overdue',
      dueDate: '2024-08-20',
      completedSessions: 14,
      totalSessions: 32,
    },
  ];

  const filteredAssignments = mockAssignments.filter(assignment => {
    const matchesFilter = selectedFilter === 'all' || assignment.status === selectedFilter;
    const matchesSearch = assignment.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.planTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'overdue': return COLORS.error;
      default: return COLORS.text;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'play-circle-filled';
      case 'completed': return 'check-circle';
      case 'overdue': return 'warning';
      default: return 'help';
    }
  };

  const handleAssignTraining = () => {
    if (selectedPlayers.length === 0) {
      Alert.alert('No Players Selected', 'Please select at least one player to assign training.');
      return;
    }
    if (!selectedPlan) {
      Alert.alert('No Plan Selected', 'Please select a training plan to assign.');
      return;
    }

    Alert.alert(
      'Assignment Created! 🎯',
      `Training plan "${selectedPlan.title}" has been assigned to ${selectedPlayers.length} player(s).`,
      [{ text: 'OK', onPress: () => setShowAssignModal(false) }]
    );
    
    setSelectedPlayers([]);
    setSelectedPlan(null);
  };

  const togglePlayerSelection = (playerId) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Assignment Manager</Text>
            <Text style={styles.headerSubtitle}>Manage training assignments</Text>
          </View>
          <Avatar.Text 
            size={40} 
            label={user?.name?.charAt(0) || 'C'} 
            style={styles.avatar}
          />
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockAssignments.length}</Text>
            <Text style={styles.statLabel}>Total Assignments</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {mockAssignments.filter(a => a.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {mockAssignments.filter(a => a.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      {filterOptions.map((filter) => (
        <Chip
          key={filter.key}
          mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
          selected={selectedFilter === filter.key}
          onPress={() => setSelectedFilter(filter.key)}
          icon={filter.icon}
          style={[
            styles.filterChip,
            selectedFilter === filter.key && { backgroundColor: COLORS.primary }
          ]}
          textStyle={selectedFilter === filter.key && { color: 'white' }}
        >
          {filter.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderAssignmentCard = ({ item }) => (
    <Card style={styles.assignmentCard}>
      <Card.Content>
        <View style={styles.assignmentHeader}>
          <View style={styles.playerInfo}>
            <Avatar.Text 
              size={40} 
              label={item.playerName.charAt(0)} 
              style={styles.playerAvatar}
            />
            <View>
              <Text style={styles.playerName}>{item.playerName}</Text>
              <Text style={styles.planTitle}>{item.planTitle}</Text>
            </View>
          </View>
          <Chip
            icon={getStatusIcon(item.status)}
            style={{ backgroundColor: getStatusColor(item.status) }}
            textStyle={{ color: 'white', fontSize: 12 }}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Progress: {item.completedSessions}/{item.totalSessions} sessions
            </Text>
            <Text style={styles.progressPercentage}>{item.progress}%</Text>
          </View>
          <ProgressBar 
            progress={item.progress / 100} 
            color={getStatusColor(item.status)}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.assignmentFooter}>
          <View style={styles.dueDateContainer}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} />
            <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
          </View>
          <View style={styles.actionButtons}>
            <IconButton
              icon="visibility"
              size={20}
              onPress={() => Alert.alert('View Details', 'Assignment details feature coming soon!')}
            />
            <IconButton
              icon="edit"
              size={20}
              onPress={() => Alert.alert('Edit Assignment', 'Edit assignment feature coming soon!')}
            />
            <IconButton
              icon="message"
              size={20}
              onPress={() => Alert.alert('Message Player', 'Messaging feature coming soon!')}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAssignModal = () => (
    <Portal>
      <Modal
        visible={showAssignModal}
        onRequestClose={() => setShowAssignModal(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>Assign Training Plan</Text>
              <IconButton
                icon="close"
                iconColor="white"
                size={24}
                onPress={() => setShowAssignModal(false)}
              />
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Select Training Plan</Text>
            {mockTrainingPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                onPress={() => setSelectedPlan(plan)}
              >
                <Card style={[
                  styles.planCard,
                  selectedPlan?.id === plan.id && styles.selectedCard
                ]}>
                  <Card.Content>
                    <View style={styles.planHeader}>
                      <Text style={styles.planTitle}>{plan.title}</Text>
                      {selectedPlan?.id === plan.id && (
                        <Icon name="check-circle" size={24} color={COLORS.success} />
                      )}
                    </View>
                    <Text style={styles.planDetails}>
                      {plan.duration} • {plan.sessions} sessions • {plan.difficulty}
                    </Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>Select Players</Text>
            {mockPlayers.map((player) => (
              <TouchableOpacity
                key={player.id}
                onPress={() => togglePlayerSelection(player.id)}
              >
                <Card style={[
                  styles.playerCard,
                  selectedPlayers.includes(player.id) && styles.selectedCard
                ]}>
                  <Card.Content>
                    <View style={styles.playerRow}>
                      <View style={styles.playerInfo}>
                        <Avatar.Text 
                          size={32} 
                          label={player.name.charAt(0)} 
                          style={styles.smallAvatar}
                        />
                        <View>
                          <Text style={styles.playerName}>{player.name}</Text>
                          <Text style={styles.playerDetails}>
                            {player.position} • {player.level} • {player.activeAssignments} active
                          </Text>
                        </View>
                      </View>
                      <Checkbox
                        status={selectedPlayers.includes(player.id) ? 'checked' : 'unchecked'}
                        onPress={() => togglePlayerSelection(player.id)}
                      />
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              mode="contained"
              onPress={handleAssignTraining}
              style={styles.assignButton}
              disabled={!selectedPlan || selectedPlayers.length === 0}
            >
              Assign Training ({selectedPlayers.length} players)
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {renderHeader()}

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search assignments..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
          />
        </View>

        {renderFilterChips()}

        <FlatList
          data={filteredAssignments}
          renderItem={renderAssignmentCard}
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
              <Icon name="assignment" size={80} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No Assignments Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search' : 'Create your first assignment!'}
              </Text>
            </View>
          }
        />
      </Animated.View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowAssignModal(true)}
        label="Assign Training"
        extended
      />

      {renderAssignModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: SPACING.md,
    paddingVertical: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: 'white',
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.xs,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  assignmentCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  playerName: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  planTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dueDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  planCard: {
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  selectedCard: {
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planDetails: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  playerCard: {
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallAvatar: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.secondary,
  },
  playerDetails: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modalFooter: {
    padding: SPACING.md,
    backgroundColor: 'white',
    elevation: 8,
  },
  assignButton: {
    backgroundColor: COLORS.primary,
  },
});

export default AssignmentManager;