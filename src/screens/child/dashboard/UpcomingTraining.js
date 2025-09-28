import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  StatusBar,
  Animated,
  TouchableOpacity,
  Alert,
  Vibration,
  FlatList,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/styles';

const UpcomingTraining = ({ navigation, route }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const upcomingTrainings = useSelector(state => state.trainings.upcoming || []);
  const loading = useSelector(state => state.trainings.loading);

  // Mock data for demonstration (replace with Redux store data)
  const mockTrainings = [
    {
      id: 1,
      title: '⚽ Soccer Skills & Drills',
      sport: 'soccer',
      coach: 'Coach Sarah',
      coachAvatar: 'S',
      date: '2025-08-29',
      time: '16:00',
      duration: '60 min',
      location: 'Main Field A',
      difficulty: 'Beginner',
      focus: ['Ball Control', 'Passing', 'Dribbling'],
      participants: 12,
      maxParticipants: 15,
      status: 'confirmed',
      equipment: ['Soccer Ball', 'Cones', 'Water Bottle'],
      description: 'Focus on fundamental soccer skills with fun drills and mini-games!',
      points: 30,
      streak: 3,
      isNext: true,
      weatherFriendly: true,
    },
    {
      id: 2,
      title: '🏃‍♂️ Speed & Agility Training',
      sport: 'fitness',
      coach: 'Coach Mike',
      coachAvatar: 'M',
      date: '2025-08-30',
      time: '15:30',
      duration: '45 min',
      location: 'Indoor Gym',
      difficulty: 'Intermediate',
      focus: ['Speed', 'Agility', 'Coordination'],
      participants: 8,
      maxParticipants: 10,
      status: 'confirmed',
      equipment: ['Running Shoes', 'Water Bottle'],
      description: 'Improve your speed and agility with ladder drills and sprint exercises!',
      points: 35,
      streak: 1,
      isNext: false,
      weatherFriendly: true,
    },
    {
      id: 3,
      title: '🏀 Basketball Fundamentals',
      sport: 'basketball',
      coach: 'Coach Lisa',
      coachAvatar: 'L',
      date: '2025-09-01',
      time: '17:00',
      duration: '90 min',
      location: 'Basketball Court',
      difficulty: 'Beginner',
      focus: ['Shooting', 'Dribbling', 'Defense'],
      participants: 10,
      maxParticipants: 12,
      status: 'waitlist',
      equipment: ['Basketball', 'Athletic Shoes', 'Water Bottle'],
      description: 'Learn basketball basics with shooting practice and team drills!',
      points: 40,
      streak: 0,
      isNext: false,
      weatherFriendly: true,
    },
    {
      id: 4,
      title: '🏊‍♂️ Swimming Technique',
      sport: 'swimming',
      coach: 'Coach Alex',
      coachAvatar: 'A',
      date: '2025-09-02',
      time: '14:00',
      duration: '75 min',
      location: 'Swimming Pool',
      difficulty: 'Intermediate',
      focus: ['Freestyle', 'Breathing', 'Endurance'],
      participants: 6,
      maxParticipants: 8,
      status: 'confirmed',
      equipment: ['Swimwear', 'Goggles', 'Towel'],
      description: 'Perfect your swimming technique with personalized coaching!',
      points: 45,
      streak: 2,
      isNext: false,
      weatherFriendly: false,
    },
    {
      id: 5,
      title: '🥋 Martial Arts Basics',
      sport: 'martial_arts',
      coach: 'Sensei Kim',
      coachAvatar: 'K',
      date: '2025-09-03',
      time: '16:30',
      duration: '60 min',
      location: 'Dojo',
      difficulty: 'Beginner',
      focus: ['Forms', 'Balance', 'Discipline'],
      participants: 15,
      maxParticipants: 16,
      status: 'confirmed',
      equipment: ['Uniform', 'Water Bottle'],
      description: 'Learn martial arts fundamentals with focus on respect and discipline!',
      points: 35,
      streak: 4,
      isNext: false,
      weatherFriendly: true,
    },
  ];

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All', icon: 'view-list' },
    { key: 'today', label: 'Today', icon: 'today' },
    { key: 'tomorrow', label: 'Tomorrow', icon: 'schedule' },
    { key: 'this_week', label: 'This Week', icon: 'date-range' },
  ];

  // Animation setup
  useEffect(() => {
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
  }, [fadeAnim, slideAnim]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Training press handler
  const handleTrainingPress = useCallback((training) => {
    Vibration.vibrate(30);
    setSelectedTraining(training);
    setShowDetails(true);
  }, []);

  // Join training handler
  const handleJoinTraining = useCallback((training) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🎉 Join Training',
      `Would you like to join "${training.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join Now!', 
          onPress: () => {
            Alert.alert('Success! 🌟', 'You have been added to the training session!');
          }
        },
      ]
    );
  }, []);

  // Get sport icon
  const getSportIcon = (sport) => {
    const icons = {
      soccer: 'sports-soccer',
      basketball: 'sports-basketball',
      swimming: 'pool',
      martial_arts: 'sports-mma',
      fitness: 'fitness-center',
    };
    return icons[sport] || 'sports';
  };

  // Get sport color
  const getSportColor = (sport) => {
    const colors = {
      soccer: '#4CAF50',
      basketball: '#FF9800',
      swimming: '#2196F3',
      martial_arts: '#9C27B0',
      fitness: '#F44336',
    };
    return colors[sport] || COLORS.primary;
  };

  // Get status color and text
  const getStatusInfo = (status) => {
    switch (status) {
      case 'confirmed':
        return { color: COLORS.success, text: 'Confirmed', icon: 'check-circle' };
      case 'waitlist':
        return { color: '#FF9800', text: 'Waitlist', icon: 'schedule' };
      case 'cancelled':
        return { color: COLORS.error, text: 'Cancelled', icon: 'cancel' };
      default:
        return { color: COLORS.primary, text: 'Pending', icon: 'help' };
    }
  };

  // Format date and time
  const formatDateTime = (date, time) => {
    const today = new Date();
    const trainingDate = new Date(date);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let dateText = '';
    if (trainingDate.toDateString() === today.toDateString()) {
      dateText = 'Today';
    } else if (trainingDate.toDateString() === tomorrow.toDateString()) {
      dateText = 'Tomorrow';
    } else {
      dateText = trainingDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }

    const timeText = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return { dateText, timeText };
  };

  // Filter trainings based on search and filter type
  const filteredTrainings = mockTrainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         training.coach.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         training.sport.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    const today = new Date();
    const trainingDate = new Date(training.date);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);

    switch (filterType) {
      case 'today':
        return trainingDate.toDateString() === today.toDateString();
      case 'tomorrow':
        return trainingDate.toDateString() === tomorrow.toDateString();
      case 'this_week':
        return trainingDate >= today && trainingDate <= weekEnd;
      default:
        return true;
    }
  });

  // Sort trainings - next training first, then by date/time
  const sortedTrainings = filteredTrainings.sort((a, b) => {
    if (a.isNext && !b.isNext) return -1;
    if (!a.isNext && b.isNext) return 1;
    return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
  });

  // Render training item
  const renderTrainingItem = ({ item: training, index }) => {
    const { dateText, timeText } = formatDateTime(training.date, training.time);
    const statusInfo = getStatusInfo(training.status);
    const sportColor = getSportColor(training.sport);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: SPACING.medium,
        }}
      >
        <TouchableOpacity
          onPress={() => handleTrainingPress(training)}
          activeOpacity={0.7}
        >
          <Card style={[
            styles.trainingCard,
            training.isNext && styles.nextTrainingCard
          ]}>
            {training.isNext && (
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.nextBadge}
              >
                <Text style={styles.nextBadgeText}>🔥 UP NEXT</Text>
              </LinearGradient>
            )}
            
            <Card.Content style={styles.cardContent}>
              {/* Header */}
              <View style={styles.trainingHeader}>
                <Surface style={[styles.sportIcon, { backgroundColor: sportColor + '20' }]}>
                  <Icon
                    name={getSportIcon(training.sport)}
                    size={28}
                    color={sportColor}
                  />
                </Surface>
                
                <View style={styles.trainingInfo}>
                  <Text style={styles.trainingTitle}>{training.title}</Text>
                  <View style={styles.coachInfo}>
                    <Avatar.Text 
                      size={24} 
                      label={training.coachAvatar}
                      style={{ backgroundColor: COLORS.primary }}
                    />
                    <Text style={styles.coachName}>{training.coach}</Text>
                  </View>
                </View>
                
                <View style={styles.trainingMeta}>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: statusInfo.color + '20' }]}
                    textStyle={[styles.statusText, { color: statusInfo.color }]}
                    icon={statusInfo.icon}
                    compact
                  >
                    {statusInfo.text}
                  </Chip>
                </View>
              </View>
              
              {/* Date & Time */}
              <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimeItem}>
                  <Icon name="event" size={16} color={COLORS.primary} />
                  <Text style={styles.dateTimeText}>{dateText}</Text>
                </View>
                <View style={styles.dateTimeItem}>
                  <Icon name="schedule" size={16} color={COLORS.primary} />
                  <Text style={styles.dateTimeText}>{timeText}</Text>
                </View>
                <View style={styles.dateTimeItem}>
                  <Icon name="timer" size={16} color={COLORS.primary} />
                  <Text style={styles.dateTimeText}>{training.duration}</Text>
                </View>
              </View>
              
              {/* Location & Difficulty */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <Icon name="place" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{training.location}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="trending-up" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{training.difficulty}</Text>
                </View>
              </View>
              
              {/* Focus Areas */}
              <View style={styles.focusContainer}>
                <Text style={styles.focusLabel}>Focus Areas:</Text>
                <View style={styles.focusChips}>
                  {training.focus.slice(0, 3).map((focus, idx) => (
                    <Chip
                      key={idx}
                      style={styles.focusChip}
                      textStyle={styles.focusChipText}
                      compact
                    >
                      {focus}
                    </Chip>
                  ))}
                </View>
              </View>
              
              {/* Participants & Points */}
              <View style={styles.bottomContainer}>
                <View style={styles.participantsContainer}>
                  <Icon name="group" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.participantsText}>
                    {training.participants}/{training.maxParticipants} joined
                  </Text>
                  <ProgressBar
                    progress={training.participants / training.maxParticipants}
                    color={sportColor}
                    style={styles.participantsProgress}
                  />
                </View>
                
                <View style={styles.pointsContainer}>
                  <Icon name="stars" size={16} color="#FFD700" />
                  <Text style={styles.pointsText}>+{training.points} pts</Text>
                  {training.streak > 0 && (
                    <Chip
                      style={styles.streakChip}
                      textStyle={styles.streakText}
                      compact
                    >
                      🔥 {training.streak}
                    </Chip>
                  )}
                </View>
              </View>
              
              {/* Action Button */}
              {training.status === 'confirmed' && (
                <Button
                  mode="contained"
                  onPress={() => handleJoinTraining(training)}
                  style={[styles.joinButton, { backgroundColor: sportColor }]}
                  contentStyle={styles.joinButtonContent}
                  labelStyle={styles.joinButtonText}
                >
                  Join Training 🚀
                </Button>
              )}
              
              {training.status === 'waitlist' && (
                <Button
                  mode="outlined"
                  onPress={() => handleJoinTraining(training)}
                  style={styles.waitlistButton}
                  contentStyle={styles.joinButtonContent}
                  labelStyle={styles.waitlistButtonText}
                >
                  Join Waitlist 📝
                </Button>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event-available" size={80} color={COLORS.primary + '40'} />
      <Text style={styles.emptyTitle}>No Upcoming Training</Text>
      <Text style={styles.emptyDescription}>
        New training sessions will appear here. Check back soon! 🏃‍♂️
      </Text>
    </View>
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
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Upcoming Training 🎯</Text>
          <Text style={styles.headerSubtitle}>
            Get ready for your next adventure!
          </Text>
        </View>
      </LinearGradient>
      
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search trainings..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filterOptions.map(filter => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setFilterType(filter.key)}
              activeOpacity={0.7}
            >
              <Chip
                selected={filterType === filter.key}
                style={[
                  styles.filterChip,
                  filterType === filter.key && styles.selectedFilterChip
                ]}
                textStyle={[
                  styles.filterChipText,
                  filterType === filter.key && styles.selectedFilterChipText
                ]}
                icon={filter.icon}
                compact
              >
                {filter.label}
              </Chip>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Content */}
      <FlatList
        data={sortedTrainings}
        renderItem={renderTrainingItem}
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
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
      />
      
      {/* Floating Action Button */}
      <FAB
        icon="search"
        label="Find More"
        style={styles.fab}
        onPress={() => {
          Alert.alert('Coming Soon! 🔍', 'Training search feature is in development.');
        }}
      />
      
      {/* Training Details Modal */}
      <Portal>
        {showDetails && selectedTraining && (
          <View style={styles.modalOverlay}>
            <BlurView
              style={styles.blurView}
              blurType="light"
              blurAmount={10}
            />
            <View style={styles.modalContent}>
              <Surface style={styles.modal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Training Details</Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowDetails(false)}
                  />
                </View>
                
                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalTrainingHeader}>
                    <Surface style={[
                      styles.sportIcon, 
                      { backgroundColor: getSportColor(selectedTraining.sport) + '20' }
                    ]}>
                      <Icon
                        name={getSportIcon(selectedTraining.sport)}
                        size={32}
                        color={getSportColor(selectedTraining.sport)}
                      />
                    </Surface>
                    <Text style={styles.modalTrainingTitle}>
                      {selectedTraining.title}
                    </Text>
                  </View>
                  
                  <Text style={styles.modalDescription}>
                    {selectedTraining.description}
                  </Text>
                  
                  <View style={styles.modalDetails}>
                    <View style={styles.modalDetailRow}>
                      <Icon name="person" size={20} color={COLORS.primary} />
                      <Text style={styles.modalDetailText}>
                        Coach: {selectedTraining.coach}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Icon name="event" size={20} color={COLORS.primary} />
                      <Text style={styles.modalDetailText}>
                        {formatDateTime(selectedTraining.date, selectedTraining.time).dateText} at{' '}
                        {formatDateTime(selectedTraining.date, selectedTraining.time).timeText}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Icon name="place" size={20} color={COLORS.primary} />
                      <Text style={styles.modalDetailText}>
                        {selectedTraining.location}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Icon name="timer" size={20} color={COLORS.primary} />
                      <Text style={styles.modalDetailText}>
                        Duration: {selectedTraining.duration}
                      </Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Icon name="trending-up" size={20} color={COLORS.primary} />
                      <Text style={styles.modalDetailText}>
                        Level: {selectedTraining.difficulty}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.equipmentTitle}>Required Equipment:</Text>
                  <View style={styles.equipmentList}>
                    {selectedTraining.equipment.map((item, idx) => (
                      <View key={idx} style={styles.equipmentItem}>
                        <Icon name="check-circle" size={16} color={COLORS.success} />
                        <Text style={styles.equipmentText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </Surface>
            </View>
          </View>
        )}
      </Portal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.large,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.large,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: 'white',
    marginBottom: SPACING.small,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    backgroundColor: 'white',
    elevation: 2,
  },
  searchBar: {
    backgroundColor: COLORS.background,
    elevation: 0,
    marginBottom: SPACING.medium,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filtersContainer: {
    marginTop: SPACING.small,
  },
  filtersContent: {
    paddingRight: SPACING.medium,
  },
  filterChip: {
    marginRight: SPACING.small,
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary + '20',
  },
  filterChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  selectedFilterChipText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: SPACING.medium,
    paddingBottom: 100, // Account for FAB
  },
  trainingCard: {
    backgroundColor: 'white',
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextTrainingCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  nextBadge: {
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    alignItems: 'center',
  },
  nextBadgeText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
  },
  cardContent: {
    padding: SPACING.medium,
  },
  trainingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  sportIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  trainingInfo: {
    flex: 1,
  },
  trainingTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachName: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.small,
  },
  trainingMeta: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: SPACING.small,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
    paddingVertical: SPACING.small,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.medium,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  dateTimeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    marginLeft: SPACING.tiny,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.tiny,
  },
  focusContainer: {
    marginBottom: SPACING.medium,
  },
  focusLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
  },
  focusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  focusChip: {
    marginRight: SPACING.small,
    marginBottom: SPACING.tiny,
    backgroundColor: COLORS.primary + '10',
  },
  focusChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontSize: 11,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  participantsContainer: {
    flex: 1,
    marginRight: SPACING.medium,
  },
  participantsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.tiny,
    marginBottom: SPACING.tiny,
  },
  participantsProgress: {
    height: 4,
    borderRadius: 2,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    marginLeft: SPACING.tiny,
    fontWeight: 'bold',
  },
  streakChip: {
    marginLeft: SPACING.small,
    backgroundColor: '#FF9800' + '20',
  },
  streakText: {
    ...TEXT_STYLES.caption,
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 11,
  },
  joinButton: {
    borderRadius: 8,
    elevation: 0,
  },
  joinButtonContent: {
    paddingVertical: SPACING.tiny,
  },
  joinButtonText: {
    ...TEXT_STYLES.button,
    color: 'white',
  },
  waitlistButton: {
    borderRadius: 8,
    borderColor: '#FF9800',
  },
  waitlistButtonText: {
    ...TEXT_STYLES.button,
    color: '#FF9800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.large * 3,
  },
  emptyTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
  emptyDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.large,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  modalBody: {
    maxHeight: 400,
  },
  modalTrainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTrainingTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginLeft: SPACING.medium,
    flex: 1,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    padding: SPACING.medium,
    lineHeight: 22,
  },
  modalDetails: {
    paddingHorizontal: SPACING.medium,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  modalDetailText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.small,
    flex: 1,
  },
  equipmentTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    paddingHorizontal: SPACING.medium,
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
  equipmentList: {
    paddingHorizontal: SPACING.medium,
    paddingBottom: SPACING.medium,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  equipmentText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.small,
  },
};

export default UpcomingTraining;