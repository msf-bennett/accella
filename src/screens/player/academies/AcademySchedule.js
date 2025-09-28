import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Portal,
  Modal,
  Text,
  ProgressBar,
  FAB,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants';

const { width } = Dimensions.get('window');

const AcademySchedule = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, schedules, bookings } = useSelector(state => ({
    user: state.auth.user,
    schedules: state.schedules.academySchedules || [],
    bookings: state.bookings.userBookings || []
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAcademy, setSelectedAcademy] = useState('All');
  const [selectedSport, setSelectedSport] = useState('All');
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const academies = ['All', 'Elite Football Academy', 'Champions Basketball Camp', 'Aquatic Sports Center', 'Tennis Excellence Academy'];
  const sports = ['All', 'Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics'];

  // Generate dates for the week/month view
  const generateDates = useCallback((mode, currentDate) => {
    const dates = [];
    const today = new Date(currentDate);
    
    if (mode === 'week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        dates.push(date);
      }
    } else if (mode === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      for (let i = 1; i <= endOfMonth.getDate(); i++) {
        dates.push(new Date(today.getFullYear(), today.getMonth(), i));
      }
    }
    
    return dates;
  }, []);

  // Sample schedule data - replace with actual data from Redux
  const scheduleData = [
    {
      id: '1',
      academyId: 'academy_1',
      academyName: 'Elite Football Academy',
      academyLogo: null,
      title: 'Youth Training Session',
      sport: 'Football',
      level: 'Beginner',
      coach: 'Coach Martinez',
      date: '2025-08-17',
      startTime: '16:00',
      endTime: '18:00',
      duration: 120,
      maxParticipants: 20,
      currentParticipants: 15,
      price: 25,
      currency: 'USD',
      location: 'Main Field',
      equipment: 'Provided',
      description: 'Fundamental football skills training for young players aged 8-14.',
      requirements: ['Football boots', 'Water bottle', 'Comfortable clothing'],
      isBooked: false,
      isWaitlist: false,
      status: 'available'
    },
    {
      id: '2',
      academyId: 'academy_2',
      academyName: 'Champions Basketball Camp',
      academyLogo: null,
      title: 'Advanced Skills Workshop',
      sport: 'Basketball',
      level: 'Advanced',
      coach: 'Coach Johnson',
      date: '2025-08-17',
      startTime: '17:00',
      endTime: '19:00',
      duration: 120,
      maxParticipants: 15,
      currentParticipants: 15,
      price: 35,
      currency: 'USD',
      location: 'Court A',
      equipment: 'Provided',
      description: 'Advanced basketball techniques and game strategies.',
      requirements: ['Basketball shoes', 'Sports attire', 'Towel'],
      isBooked: true,
      isWaitlist: false,
      status: 'full'
    },
    {
      id: '3',
      academyId: 'academy_3',
      academyName: 'Aquatic Sports Center',
      academyLogo: null,
      title: 'Swimming Fundamentals',
      sport: 'Swimming',
      level: 'Beginner',
      coach: 'Coach Waters',
      date: '2025-08-17',
      startTime: '18:00',
      endTime: '19:00',
      duration: 60,
      maxParticipants: 12,
      currentParticipants: 8,
      price: 20,
      currency: 'USD',
      location: 'Pool 1',
      equipment: 'Some provided',
      description: 'Basic swimming techniques and water safety.',
      requirements: ['Swimwear', 'Goggles', 'Towel'],
      isBooked: false,
      isWaitlist: false,
      status: 'available'
    },
    {
      id: '4',
      academyId: 'academy_1',
      academyName: 'Elite Football Academy',
      academyLogo: null,
      title: 'Goalkeeper Training',
      sport: 'Football',
      level: 'Intermediate',
      coach: 'Coach Rodriguez',
      date: '2025-08-18',
      startTime: '15:00',
      endTime: '16:30',
      duration: 90,
      maxParticipants: 8,
      currentParticipants: 6,
      price: 30,
      currency: 'USD',
      location: 'Training Ground B',
      equipment: 'Specialized gear provided',
      description: 'Specialized goalkeeper training focusing on positioning and reflexes.',
      requirements: ['Goalkeeper gloves', 'Knee pads (recommended)', 'Water bottle'],
      isBooked: false,
      isWaitlist: false,
      status: 'available'
    },
    {
      id: '5',
      academyId: 'academy_4',
      academyName: 'Tennis Excellence Academy',
      academyLogo: null,
      title: 'Junior Tennis Clinic',
      sport: 'Tennis',
      level: 'Beginner',
      coach: 'Coach Anderson',
      date: '2025-08-18',
      startTime: '16:00',
      endTime: '17:30',
      duration: 90,
      maxParticipants: 10,
      currentParticipants: 9,
      price: 28,
      currency: 'USD',
      location: 'Court 1-2',
      equipment: 'Rackets available',
      description: 'Introduction to tennis fundamentals for junior players.',
      requirements: ['Tennis shoes', 'Comfortable clothing', 'Hat (recommended)'],
      isBooked: false,
      isWaitlist: false,
      status: 'available'
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadSchedules();
  }, [selectedDate, viewMode]);

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      // dispatch(loadAcademySchedulesAction(selectedDate, viewMode));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading schedules:', error);
      Alert.alert('Error', 'Failed to load academy schedules');
    } finally {
      setLoading(false);
    }
  }, [dispatch, selectedDate, viewMode]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSchedules();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadSchedules]);

  const handleBookSession = useCallback((session) => {
    Vibration.vibrate(30);
    if (session.isBooked) {
      Alert.alert(
        'Cancel Booking',
        `Would you like to cancel your booking for "${session.title}"?`,
        [
          { text: 'Keep Booking', style: 'cancel' },
          { 
            text: 'Cancel Booking', 
            style: 'destructive',
            onPress: () => {
              // dispatch(cancelBookingAction(session.id));
              Alert.alert('Feature Coming Soon', 'Booking cancellation will be available in the next update! 📅');
            }
          }
        ]
      );
    } else if (session.status === 'full') {
      Alert.alert(
        'Join Waitlist',
        `This session is full. Would you like to join the waitlist for "${session.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Join Waitlist', 
            onPress: () => {
              // dispatch(joinWaitlistAction(session.id));
              Alert.alert('Feature Coming Soon', 'Waitlist functionality will be available in the next update! ⏳');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Book Session',
        `Would you like to book "${session.title}" for $${session.price}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Book Now', 
            onPress: () => {
              // dispatch(bookSessionAction(session.id));
              Alert.alert('Feature Coming Soon', 'Session booking will be available in the next update! 🚀');
            }
          }
        ]
      );
    }
  }, []);

  const handleViewSession = useCallback((session) => {
    setSelectedSession(session);
    setModalVisible(true);
    Vibration.vibrate(30);
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return COLORS.success;
      case 'full': return COLORS.error;
      case 'cancelled': return COLORS.textSecondary;
      default: return COLORS.primary;
    }
  };

  const getAvailabilityText = (session) => {
    const remaining = session.maxParticipants - session.currentParticipants;
    if (session.status === 'full') return 'Full';
    if (remaining === 1) return '1 spot left';
    return `${remaining} spots left`;
  };

  const filteredSessions = scheduleData.filter(session => {
    const sessionDate = new Date(session.date);
    const matchesDate = viewMode === 'day' ? 
      sessionDate.toDateString() === selectedDate.toDateString() :
      true; // For week/month view, show all sessions
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.coach.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAcademy = selectedAcademy === 'All' || session.academyName === selectedAcademy;
    const matchesSport = selectedSport === 'All' || session.sport === selectedSport;
    return matchesDate && matchesSearch && matchesAcademy && matchesSport;
  }).sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.startTime}`);
    const timeB = new Date(`${b.date}T${b.startTime}`);
    return timeA - timeB;
  });

  const renderDateSelector = () => (
    <View style={styles.dateSelectorContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateScrollContent}
      >
        {generateDates('week', selectedDate).map((date, index) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const today = isToday(date);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateItem,
                isSelected && styles.selectedDateItem,
                today && styles.todayDateItem
              ]}
              onPress={() => {
                setSelectedDate(date);
                Vibration.vibrate(30);
              }}
            >
              <Text style={[
                styles.dateDay,
                isSelected && styles.selectedDateText,
                today && styles.todayDateText
              ]}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={[
                styles.dateNumber,
                isSelected && styles.selectedDateText,
                today && styles.todayDateText
              ]}>
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderSessionCard = ({ item: session, index }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <Card style={styles.sessionCard} elevation={3}>
        <TouchableOpacity onPress={() => handleViewSession(session)}>
          <LinearGradient
            colors={session.isBooked ? ['#4CAF50', '#66BB6A'] : ['#667eea', '#764ba2']}
            style={styles.cardHeader}
          >
            <View style={styles.sessionTime}>
              <Icon name="schedule" size={16} color="white" />
              <Text style={styles.timeText}>
                {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </Text>
            </View>
            <View style={styles.sessionMeta}>
              <Chip
                mode="flat"
                textStyle={styles.levelChipText}
                style={styles.levelChip}
              >
                {session.level}
              </Chip>
              {session.isBooked && (
                <Badge style={styles.bookedBadge}>
                  ✓ Booked
                </Badge>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Card.Content style={styles.cardContent}>
          <View style={styles.sessionHeader}>
            <View style={styles.academyInfo}>
              <Avatar.Text
                size={32}
                label={session.academyName.charAt(0)}
                style={styles.academyAvatar}
              />
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.academyName}>{session.academyName}</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${session.price}</Text>
              <Text style={styles.duration}>{session.duration}min</Text>
            </View>
          </View>

          <View style={styles.sessionInfo}>
            <View style={styles.infoRow}>
              <Icon name="person" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>{session.coach}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>{session.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="sports" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>{session.sport} • {session.equipment}</Text>
            </View>
          </View>

          <View style={styles.availabilityContainer}>
            <View style={styles.availabilityInfo}>
              <Text style={[styles.availabilityText, { color: getStatusColor(session.status) }]}>
                {getAvailabilityText(session)}
              </Text>
              <ProgressBar
                progress={session.currentParticipants / session.maxParticipants}
                color={getStatusColor(session.status)}
                style={styles.availabilityProgress}
              />
            </View>
            <Text style={styles.participantCount}>
              {session.currentParticipants}/{session.maxParticipants}
            </Text>
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handleViewSession(session)}
            style={styles.detailsButton}
            labelStyle={styles.detailsButtonText}
          >
            Details
          </Button>
          <Button
            mode="contained"
            onPress={() => handleBookSession(session)}
            style={[
              styles.bookButton,
              session.isBooked && styles.bookedButton,
              session.status === 'full' && styles.fullButton
            ]}
            disabled={session.status === 'cancelled'}
          >
            {session.isBooked ? 'Cancel' : 
             session.status === 'full' ? 'Waitlist' : 
             session.status === 'cancelled' ? 'Cancelled' : 'Book'}
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderFilterChips = (items, selectedItem, onSelect, title) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        {items.map((item) => (
          <Chip
            key={item}
            mode={selectedItem === item ? 'flat' : 'outlined'}
            selected={selectedItem === item}
            onPress={() => {
              onSelect(item);
              Vibration.vibrate(30);
            }}
            style={[
              styles.filterChip,
              selectedItem === item && styles.selectedFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              selectedItem === item && styles.selectedFilterChipText
            ]}
          >
            {item.length > 15 ? `${item.substring(0, 15)}...` : item}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Academy Schedule 📅</Text>
          <Text style={styles.headerSubtitle}>
            Book your training sessions
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon={viewMode === 'day' ? 'view-week' : 'view-day'}
            size={24}
            onPress={() => {
              setViewMode(viewMode === 'day' ? 'week' : 'day');
              Vibration.vibrate(30);
            }}
            iconColor="white"
          />
        </View>
      </LinearGradient>

      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search sessions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={TEXT_STYLES.body}
        />
      </Surface>

      {renderDateSelector()}

      <View style={styles.filtersContainer}>
        {renderFilterChips(academies, selectedAcademy, setSelectedAcademy, 'Academy')}
        {renderFilterChips(sports, selectedSport, setSelectedSport, 'Sport')}
      </View>

      <View style={styles.content}>
        {filteredSessions.length > 0 ? (
          <FlatList
            data={filteredSessions}
            renderItem={renderSessionCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Icon name="event-busy" size={64} color={COLORS.primary} />
            <Text style={styles.emptyStateTitle}>No Sessions Found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || selectedAcademy !== 'All' || selectedSport !== 'All'
                ? 'Try adjusting your search or filters'
                : 'No training sessions available for this date'}
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                setSearchQuery('');
                setSelectedAcademy('All');
                setSelectedSport('All');
              }}
              style={styles.resetButton}
            >
              Reset Filters
            </Button>
          </View>
        )}
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
          >
            <ScrollView style={styles.modalScrollView}>
              <Card style={styles.modalCard}>
                <Card.Title
                  title={selectedSession?.title}
                  subtitle={`${selectedSession?.academyName} • ${selectedSession?.sport}`}
                  left={(props) => (
                    <Avatar.Text
                      {...props}
                      label={selectedSession?.academyName?.charAt(0)}
                    />
                  )}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="close"
                      onPress={() => setModalVisible(false)}
                    />
                  )}
                />
                
                <Card.Content style={styles.modalContent}>
                  <View style={styles.sessionTimeInfo}>
                    <LinearGradient
                      colors={selectedSession?.isBooked ? ['#4CAF50', '#66BB6A'] : ['#667eea', '#764ba2']}
                      style={styles.timeInfoCard}
                    >
                      <View style={styles.timeDetails}>
                        <Icon name="schedule" size={24} color="white" />
                        <View style={styles.timeText}>
                          <Text style={styles.sessionDate}>
                            {selectedSession && formatDate(new Date(selectedSession.date))}
                          </Text>
                          <Text style={styles.sessionTime}>
                            {selectedSession && formatTime(selectedSession.startTime)} - {selectedSession && formatTime(selectedSession.endTime)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.durationText}>{selectedSession?.duration} min</Text>
                    </LinearGradient>
                  </View>

                  <Text style={styles.description}>{selectedSession?.description}</Text>

                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Session Details</Text>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Icon name="person" size={20} color={COLORS.primary} />
                        <Text style={styles.detailLabel}>Coach</Text>
                        <Text style={styles.detailValue}>{selectedSession?.coach}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Icon name="location-on" size={20} color={COLORS.primary} />
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailValue}>{selectedSession?.location}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Icon name="fitness-center" size={20} color={COLORS.primary} />
                        <Text style={styles.detailLabel}>Equipment</Text>
                        <Text style={styles.detailValue}>{selectedSession?.equipment}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Icon name="attach-money" size={20} color={COLORS.primary} />
                        <Text style={styles.detailLabel}>Price</Text>
                        <Text style={styles.detailValue}>${selectedSession?.price}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.requirementsSection}>
                    <Text style={styles.sectionTitle}>What to Bring</Text>
                    <View style={styles.requirementsList}>
                      {selectedSession?.requirements.map((requirement, index) => (
                        <View key={index} style={styles.requirementItem}>
                          <Icon name="check-circle" size={16} color={COLORS.success} />
                          <Text style={styles.requirementText}>{requirement}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.availabilitySection}>
                    <Text style={styles.sectionTitle}>Availability</Text>
                    <View style={styles.availabilityCard}>
                      <View style={styles.availabilityStats}>
                        <Text style={styles.participantNumbers}>
                          {selectedSession?.currentParticipants}/{selectedSession?.maxParticipants}
                        </Text>
                        <Text style={styles.participantLabel}>Participants</Text>
                      </View>
                      <View style={styles.progressContainer}>
                        <ProgressBar
                          progress={selectedSession ? selectedSession.currentParticipants / selectedSession.maxParticipants : 0}
                          color={selectedSession ? getStatusColor(selectedSession.status) : COLORS.primary}
                          style={styles.modalProgress}
                        />
                        <Text style={[
                          styles.statusText,
                          { color: selectedSession ? getStatusColor(selectedSession.status) : COLORS.primary }
                        ]}>
                          {selectedSession && getAvailabilityText(selectedSession)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card.Content>

                <Card.Actions style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalCancelButton}
                  >
                    Close
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setModalVisible(false);
                      handleBookSession(selectedSession);
                    }}
                    style={[
                      styles.modalBookButton,
                      selectedSession?.isBooked && styles.bookedButton,
                      selectedSession?.status === 'full' && styles.fullButton
                    ]}
                    disabled={selectedSession?.status === 'cancelled'}
                  >
                    {selectedSession?.isBooked ? 'Cancel Booking' : 
                     selectedSession?.status === 'full' ? 'Join Waitlist' : 
                     selectedSession?.status === 'cancelled' ? 'Cancelled' : 
                     `Book for $${selectedSession?.price}`}
                  </Button>
                </Card.Actions>
              </Card>
            </ScrollView>
          </BlurView>
        </Modal>
      </Portal>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(30);
          Alert.alert('Feature Coming Soon', 'Request custom sessions will be available in the next update! 📝');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchContainer: {
    elevation: 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 0,
    borderRadius: 12,
  },
  dateSelectorContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.md,
    elevation: 1,
  },
  dateScrollContent: {
    paddingHorizontal: SPACING.md,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 16,
    minWidth: 60,
  },
  selectedDateItem: {
    backgroundColor: COLORS.primary,
  },
  todayDateItem: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dateDay: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  dateNumber: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: 2,
  },
  selectedDateText: {
    color: 'white',
  },
  todayDateText: {
    color: COLORS.primary,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingBottom: SPACING.md,
    elevation: 1,
  },
  filterSection: {
    marginBottom: SPACING.sm,
  },
  filterTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
    fontSize: 14,
    fontWeight: '600',
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
  },
  filterChip: {
    marginHorizontal: SPACING.xs,
    backgroundColor: 'white',
    borderColor: COLORS.border,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: SPACING.xs,
  },
  levelChipText: {
    color: 'white',
    fontSize: 11,
  },
  bookedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: COLORS.success,
  },
  cardContent: {
    padding: SPACING.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  academyInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  academyAvatar: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  academyName: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  duration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  sessionInfo: {
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  infoText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontSize: 13,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  availabilityText: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  availabilityProgress: {
    height: 4,
    borderRadius: 2,
  },
  participantCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  cardActions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 1,
    marginRight: SPACING.xs,
    borderColor: COLORS.primary,
  },
  detailsButtonText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  bookButton: {
    flex: 1,
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.primary,
  },
  bookedButton: {
    backgroundColor: COLORS.success,
  },
  fullButton: {
    backgroundColor: COLORS.warning,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: SPACING.md,
  },
  blurView: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalScrollView: {
    flex: 1,
  },
  modalCard: {
    margin: 0,
    backgroundColor: 'white',
  },
  modalContent: {
    paddingTop: 0,
  },
  sessionTimeInfo: {
    marginBottom: SPACING.lg,
  },
  timeInfoCard: {
    padding: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    marginLeft: SPACING.sm,
  },
  sessionDate: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionTime: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  durationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  detailsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  detailLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  detailValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  requirementsSection: {
    marginBottom: SPACING.lg,
  },
  requirementsList: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  requirementText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    fontSize: 13,
  },
  availabilitySection: {
    marginBottom: SPACING.md,
  },
  availabilityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityStats: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  participantNumbers: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  participantLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  progressContainer: {
    flex: 1,
  },
  modalProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  modalActions: {
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    marginRight: SPACING.xs,
    borderColor: COLORS.textSecondary,
  },
  modalBookButton: {
    flex: 2,
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default AcademySchedule;