import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
  Vibration,
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
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  white: '#ffffff',
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
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const SessionBookings = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Redux state
  const user = useSelector(state => state.user);
  const bookings = useSelector(state => state.bookings?.athleteBookings || []);
  const coaches = useSelector(state => state.coaches?.list || []);

  // Mock data for development
  const mockBookings = [
    {
      id: '1',
      coachId: 'coach1',
      coachName: 'Sarah Johnson',
      coachImage: 'https://via.placeholder.com/50',
      sessionType: 'Personal Training',
      sport: 'Football',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: 60,
      status: 'confirmed',
      location: 'City Sports Complex',
      price: 50,
      notes: 'Focus on agility and speed training',
      rating: 4.8,
      specialization: ['Speed Training', 'Agility'],
    },
    {
      id: '2',
      coachId: 'coach2',
      coachName: 'Mike Rodriguez',
      coachImage: 'https://via.placeholder.com/50',
      sessionType: 'Group Session',
      sport: 'Basketball',
      date: '2024-01-16',
      time: '2:00 PM',
      duration: 90,
      status: 'pending',
      location: 'Downtown Basketball Court',
      price: 30,
      notes: 'Shooting and defensive drills',
      rating: 4.9,
      specialization: ['Shooting', 'Defense'],
    },
    {
      id: '3',
      coachId: 'coach3',
      coachName: 'Emma Thompson',
      coachImage: 'https://via.placeholder.com/50',
      sessionType: 'Online Coaching',
      sport: 'Tennis',
      date: '2024-01-14',
      time: '4:00 PM',
      duration: 45,
      status: 'completed',
      location: 'Video Call',
      price: 40,
      notes: 'Technique analysis and strategy',
      rating: 4.7,
      specialization: ['Technique', 'Strategy'],
    },
    {
      id: '4',
      coachId: 'coach4',
      coachName: 'David Chen',
      coachImage: 'https://via.placeholder.com/50',
      sessionType: 'Personal Training',
      sport: 'Swimming',
      date: '2024-01-18',
      time: '8:00 AM',
      duration: 60,
      status: 'cancelled',
      location: 'Aquatic Center',
      price: 55,
      notes: 'Stroke improvement and endurance',
      rating: 4.6,
      specialization: ['Technique', 'Endurance'],
    },
  ];

  const filters = [
    { key: 'all', label: 'All Bookings', count: mockBookings.length },
    { key: 'upcoming', label: 'Upcoming', count: mockBookings.filter(b => ['confirmed', 'pending'].includes(b.status)).length },
    { key: 'completed', label: 'Completed', count: mockBookings.filter(b => b.status === 'completed').length },
    { key: 'cancelled', label: 'Cancelled', count: mockBookings.filter(b => b.status === 'cancelled').length },
  ];

  // Animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Focus effect
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      // Simulate loading
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, [])
  );

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleBookingPress = useCallback((booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
    Vibration.vibrate(30);
  }, []);

  const handleCancelBooking = useCallback((bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
            Vibration.vibrate(100);
          },
        },
      ]
    );
  }, []);

  const handleRescheduleBooking = useCallback((bookingId) => {
    Alert.alert(
      'Feature Coming Soon! 🚀',
      'Booking rescheduling functionality is currently under development. Stay tuned for updates!',
      [{ text: 'Got it!' }]
    );
  }, []);

  const handleContactCoach = useCallback((coachId) => {
    Alert.alert(
      'Feature Coming Soon! 💬',
      'Direct messaging with coaches is currently under development. Stay tuned for updates!',
      [{ text: 'Got it!' }]
    );
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'completed': return COLORS.primary;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return 'check-circle';
      case 'pending': return 'schedule';
      case 'completed': return 'done-all';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.sessionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.sport.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'upcoming' && ['confirmed', 'pending'].includes(booking.status)) ||
                         booking.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const renderBookingCard = ({ item: booking, index }) => (
    <Animated.View
      style={[
        styles.bookingCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      key={booking.id}
    >
      <Card
        style={[
          styles.card,
          { borderLeftColor: getStatusColor(booking.status), borderLeftWidth: 4 }
        ]}
        elevation={3}
        onPress={() => handleBookingPress(booking)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.coachInfo}>
            <Avatar.Image
              source={{ uri: booking.coachImage }}
              size={50}
              style={styles.avatar}
            />
            <View style={styles.coachDetails}>
              <Text style={TEXT_STYLES.h3}>{booking.coachName}</Text>
              <View style={styles.ratingRow}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.rating}>{booking.rating}</Text>
                <Text style={styles.sport}> • {booking.sport}</Text>
              </View>
            </View>
          </View>
          <Chip
            mode="outlined"
            icon={() => <Icon name={getStatusIcon(booking.status)} size={16} color={getStatusColor(booking.status)} />}
            style={[styles.statusChip, { borderColor: getStatusColor(booking.status) }]}
            textStyle={{ color: getStatusColor(booking.status), fontSize: 12 }}
          >
            {booking.status.toUpperCase()}
          </Chip>
        </View>

        <View style={styles.sessionDetails}>
          <Surface style={styles.sessionType}>
            <Text style={styles.sessionTypeText}>{booking.sessionType}</Text>
          </Surface>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Icon name="event" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{booking.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="access-time" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{booking.time} ({booking.duration}min)</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{booking.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="attach-money" size={16} color={COLORS.success} />
              <Text style={[styles.detailText, { color: COLORS.success, fontWeight: '600' }]}>
                ${booking.price}
              </Text>
            </View>
          </View>

          {booking.notes && (
            <View style={styles.notesContainer}>
              <Icon name="note" size={14} color={COLORS.textSecondary} />
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          {booking.status === 'confirmed' && (
            <>
              <Button
                mode="outlined"
                icon="schedule"
                onPress={() => handleRescheduleBooking(booking.id)}
                style={styles.actionButton}
                compact
              >
                Reschedule
              </Button>
              <Button
                mode="outlined"
                icon="cancel"
                onPress={() => handleCancelBooking(booking.id)}
                style={[styles.actionButton, { borderColor: COLORS.error }]}
                textColor={COLORS.error}
                compact
              >
                Cancel
              </Button>
            </>
          )}
          
          {booking.status === 'pending' && (
            <Button
              mode="outlined"
              icon="cancel"
              onPress={() => handleCancelBooking(booking.id)}
              style={[styles.actionButton, { borderColor: COLORS.error }]}
              textColor={COLORS.error}
              compact
            >
              Cancel Request
            </Button>
          )}

          {booking.status === 'completed' && (
            <Button
              mode="outlined"
              icon="star"
              onPress={() => Alert.alert('Feature Coming Soon!', 'Rating functionality is under development.')}
              style={styles.actionButton}
              compact
            >
              Rate Session
            </Button>
          )}

          <IconButton
            icon="message"
            size={20}
            onPress={() => handleContactCoach(booking.coachId)}
            style={styles.messageButton}
          />
        </View>
      </Card>
    </Animated.View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Bookings</Text>
          
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterOption,
                selectedFilter === filter.key && styles.selectedFilterOption,
              ]}
              onPress={() => {
                setSelectedFilter(filter.key);
                setShowFilterModal(false);
                Vibration.vibrate(30);
              }}
            >
              <Text style={[
                styles.filterOptionText,
                selectedFilter === filter.key && styles.selectedFilterOptionText,
              ]}>
                {filter.label}
              </Text>
              <Chip
                mode="outlined"
                style={styles.countChip}
                textStyle={{ fontSize: 12 }}
              >
                {filter.count}
              </Chip>
            </TouchableOpacity>
          ))}
        </Surface>
      </Modal>
    </Portal>
  );

  const renderDetailsModal = () => (
    <Portal>
      <Modal
        visible={showDetailsModal}
        onDismiss={() => setShowDetailsModal(false)}
        contentContainerStyle={styles.detailsModalContainer}
      >
        {selectedBooking && (
          <Surface style={styles.detailsModalContent}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Booking Details</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowDetailsModal(false)}
              />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailsCoachSection}>
                <Avatar.Image
                  source={{ uri: selectedBooking.coachImage }}
                  size={80}
                  style={styles.detailsAvatar}
                />
                <View style={styles.detailsCoachInfo}>
                  <Text style={TEXT_STYLES.h2}>{selectedBooking.coachName}</Text>
                  <View style={styles.detailsRatingRow}>
                    <Icon name="star" size={20} color={COLORS.warning} />
                    <Text style={styles.detailsRating}>{selectedBooking.rating}</Text>
                  </View>
                  <View style={styles.specializationTags}>
                    {selectedBooking.specialization.map((spec, index) => (
                      <Chip key={index} mode="outlined" style={styles.specializationChip}>
                        {spec}
                      </Chip>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Session Information</Text>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailsGridItem}>
                    <Icon name="fitness-center" size={24} color={COLORS.primary} />
                    <Text style={styles.detailsGridLabel}>Type</Text>
                    <Text style={styles.detailsGridValue}>{selectedBooking.sessionType}</Text>
                  </View>
                  <View style={styles.detailsGridItem}>
                    <Icon name="sports" size={24} color={COLORS.primary} />
                    <Text style={styles.detailsGridLabel}>Sport</Text>
                    <Text style={styles.detailsGridValue}>{selectedBooking.sport}</Text>
                  </View>
                  <View style={styles.detailsGridItem}>
                    <Icon name="schedule" size={24} color={COLORS.primary} />
                    <Text style={styles.detailsGridLabel}>Duration</Text>
                    <Text style={styles.detailsGridValue}>{selectedBooking.duration} min</Text>
                  </View>
                  <View style={styles.detailsGridItem}>
                    <Icon name="attach-money" size={24} color={COLORS.success} />
                    <Text style={styles.detailsGridLabel}>Price</Text>
                    <Text style={[styles.detailsGridValue, { color: COLORS.success }]}>
                      ${selectedBooking.price}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Schedule & Location</Text>
                <View style={styles.scheduleInfo}>
                  <View style={styles.scheduleItem}>
                    <Icon name="event" size={20} color={COLORS.primary} />
                    <Text style={styles.scheduleText}>{selectedBooking.date}</Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <Icon name="access-time" size={20} color={COLORS.primary} />
                    <Text style={styles.scheduleText}>{selectedBooking.time}</Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <Icon name="location-on" size={20} color={COLORS.primary} />
                    <Text style={styles.scheduleText}>{selectedBooking.location}</Text>
                  </View>
                </View>
              </View>

              {selectedBooking.notes && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Session Notes</Text>
                  <Surface style={styles.notesSection}>
                    <Text style={styles.notesSectionText}>{selectedBooking.notes}</Text>
                  </Surface>
                </View>
              )}
            </ScrollView>

            <View style={styles.detailsActions}>
              <Button
                mode="contained"
                icon="message"
                onPress={() => handleContactCoach(selectedBooking.coachId)}
                style={styles.detailsActionButton}
              >
                Contact Coach
              </Button>
            </View>
          </Surface>
        )}
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event-busy" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Bookings Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? `No bookings match "${searchQuery}"`
          : selectedFilter === 'all'
          ? "You haven't made any bookings yet"
          : `No ${selectedFilter} bookings found`
        }
      </Text>
      <Button
        mode="contained"
        icon="search"
        onPress={() => navigation.navigate('CoachSearch')}
        style={styles.emptyStateButton}
      >
        Find Coaches
      </Button>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ProgressBar indeterminate color={COLORS.white} />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>My Bookings 📅</Text>
              <Text style={styles.headerSubtitle}>
                {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
              </Text>
            </View>
            <IconButton
              icon="filter-list"
              size={24}
              iconColor={COLORS.white}
              onPress={() => setShowFilterModal(true)}
              style={styles.filterButton}
            />
          </View>

          <Searchbar
            placeholder="Search bookings..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchbarInput}
            iconColor={COLORS.primary}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {filters.map((filter) => (
              <Chip
                key={filter.key}
                mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
                selected={selectedFilter === filter.key}
                onPress={() => {
                  setSelectedFilter(filter.key);
                  Vibration.vibrate(30);
                }}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.key && styles.selectedFilterChip,
                ]}
                textStyle={[
                  styles.filterChipText,
                  selectedFilter === filter.key && styles.selectedFilterChipText,
                ]}
              >
                {filter.label} ({filter.count})
              </Chip>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
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
        {filteredBookings.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map((booking, index) => 
              renderBookingCard({ item: booking, index })
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('CoachSearch')}
        label="Book Session"
      />

      {/* Modals */}
      {renderFilterModal()}
      {renderDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    fontSize: 28,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchbar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 25,
  },
  searchbarInput: {
    color: COLORS.text,
  },
  filtersContainer: {
    marginBottom: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.white,
  },
  filterChipText: {
    color: COLORS.white,
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  bookingsList: {
    padding: SPACING.md,
  },
  bookingCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  coachInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.sm,
  },
  coachDetails: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  rating: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  sport: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  statusChip: {
    height: 28,
  },
  sessionDetails: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sessionType: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    marginBottom: SPACING.sm,
  },
  sessionTypeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  detailsRow: {
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
    marginLeft: SPACING.xs,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  notesText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    flex: 1,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    marginRight: SPACING.sm,
  },
  messageButton: {
    marginLeft: 'auto',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    paddingHorizontal: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    width: width * 0.9,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  selectedFilterOption: {
    backgroundColor: COLORS.primary + '20',
  },
  filterOptionText: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  selectedFilterOptionText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  countChip: {
    height: 24,
  },
  detailsModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailsModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
    paddingBottom: SPACING.lg,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailsTitle: {
    ...TEXT_STYLES.h2,
  },
  detailsCoachSection: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  detailsAvatar: {
    marginRight: SPACING.md,
  },
  detailsCoachInfo: {
    flex: 1,
  },
  detailsRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  detailsRating: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  specializationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  specializationChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 28,
  },
  detailsSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  detailsSectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailsGridItem: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  detailsGridLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },
  detailsGridValue: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  scheduleInfo: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scheduleText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  notesSection: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
  },
  notesSectionText: {
    ...TEXT_STYLES.body,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  detailsActions: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailsActionButton: {
    borderRadius: 25,
  },
});

export default SessionBookings;