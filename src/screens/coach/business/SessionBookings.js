import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Dimensions,
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
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';
//import PlaceholderScreen from '../components/PlaceholderScreen';
//import { Text } from '../components/StyledText';

const { width } = Dimensions.get('window');

const SessionBookings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { bookings, loading } = useSelector(state => state.bookings);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [availableSessions, setAvailableSessions] = useState([]);

  // Mock data for demonstration
  const mockBookings = [
    {
      id: '1',
      sessionTitle: 'Football Training Session',
      coachName: 'John Smith',
      coachImage: 'https://i.pravatar.cc/150?img=1',
      date: '2024-12-20',
      time: '10:00 AM',
      duration: 90,
      location: 'Sports Complex A',
      price: 50,
      status: 'confirmed',
      sport: 'Football',
      level: 'Intermediate',
      rating: 4.8,
    },
    {
      id: '2',
      sessionTitle: 'Basketball Skills Training',
      coachName: 'Sarah Johnson',
      coachImage: 'https://i.pravatar.cc/150?img=2',
      date: '2024-12-22',
      time: '2:00 PM',
      duration: 60,
      location: 'Indoor Court B',
      price: 40,
      status: 'pending',
      sport: 'Basketball',
      level: 'Beginner',
      rating: 4.9,
    },
    {
      id: '3',
      sessionTitle: 'Tennis Coaching',
      coachName: 'Mike Wilson',
      coachImage: 'https://i.pravatar.cc/150?img=3',
      date: '2024-12-18',
      time: '4:00 PM',
      duration: 120,
      location: 'Tennis Club',
      price: 75,
      status: 'completed',
      sport: 'Tennis',
      level: 'Advanced',
      rating: 4.7,
    },
  ];

  const mockAvailableSessions = [
    {
      id: '4',
      sessionTitle: 'Swimming Technique Class',
      coachName: 'Emma Davis',
      coachImage: 'https://i.pravatar.cc/150?img=4',
      date: '2024-12-25',
      time: '9:00 AM',
      duration: 75,
      location: 'Aquatic Center',
      price: 60,
      sport: 'Swimming',
      level: 'All Levels',
      rating: 4.8,
      spotsLeft: 3,
    },
    {
      id: '5',
      sessionTitle: 'Yoga & Flexibility',
      coachName: 'Lisa Brown',
      coachImage: 'https://i.pravatar.cc/150?img=5',
      date: '2024-12-26',
      time: '7:00 AM',
      duration: 60,
      location: 'Wellness Studio',
      price: 35,
      sport: 'Yoga',
      level: 'Beginner',
      rating: 4.9,
      spotsLeft: 8,
    },
  ];

  useEffect(() => {
    setAvailableSessions(mockAvailableSessions);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filters = [
    { key: 'all', label: 'All', count: mockBookings.length },
    { key: 'upcoming', label: 'Upcoming', count: 2 },
    { key: 'completed', label: 'Completed', count: 1 },
    { key: 'pending', label: 'Pending', count: 1 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'completed': return COLORS.primary;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const handleBookSession = (session) => {
    setSelectedSession(session);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    Alert.alert(
      '✅ Booking Confirmed!',
      `Your session "${selectedSession?.sessionTitle}" has been booked successfully. You'll receive a confirmation email shortly.`,
      [{ text: 'OK', onPress: () => setShowBookingModal(false) }]
    );
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            Alert.alert('🔄 Feature in Development', 'Booking cancellation will be available soon!');
          },
        },
      ]
    );
  };

  const handleContactCoach = (coachName) => {
    Alert.alert('🔄 Feature in Development', `Direct messaging with ${coachName} will be available soon!`);
  };

  const filteredBookings = mockBookings.filter(booking => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'upcoming') return ['confirmed', 'pending'].includes(booking.status);
    return booking.status === selectedFilter;
  });

  const searchedBookings = filteredBookings.filter(booking =>
    booking.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBookingCard = ({ item }) => (
    <Card style={styles.bookingCard} elevation={2}>
      <View style={styles.cardHeader}>
        <View style={styles.coachInfo}>
          <Avatar.Image source={{ uri: item.coachImage }} size={50} />
          <View style={styles.coachDetails}>
            <Text style={styles.sessionTitle} numberOfLines={1}>
              {item.sessionTitle}
            </Text>
            <Text style={styles.coachName}>Coach {item.coachName}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color={COLORS.warning} />
              <Text style={styles.rating}>{item.rating}</Text>
              <Chip
                mode="outlined"
                style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
                textStyle={[styles.statusText, { color: getStatusColor(item.status) }]}
              >
                {item.status.toUpperCase()}
              </Chip>
            </View>
          </View>
        </View>
        <IconButton
          icon="dots-vertical"
          size={20}
          onPress={() => Alert.alert('🔄 Feature in Development', 'More options coming soon!')}
        />
      </View>

      <View style={styles.sessionDetails}>
        <View style={styles.detailRow}>
          <Icon name="event" size={18} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {new Date(item.date).toLocaleDateString()} at {item.time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="schedule" size={18} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.duration} minutes</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={18} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="sports" size={18} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.sport} • {item.level}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Button
          mode="outlined"
          onPress={() => handleContactCoach(item.coachName)}
          style={styles.actionButton}
          icon="message"
        >
          Contact
        </Button>
        {item.status === 'confirmed' || item.status === 'pending' ? (
          <Button
            mode="contained"
            onPress={() => handleCancelBooking(item.id)}
            style={[styles.actionButton, { backgroundColor: COLORS.error }]}
            icon="cancel"
          >
            Cancel
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={() => Alert.alert('🔄 Feature in Development', 'Session details view coming soon!')}
            style={styles.actionButton}
            icon="visibility"
          >
            View
          </Button>
        )}
      </View>
    </Card>
  );

  const renderAvailableSession = ({ item }) => (
    <Card style={styles.availableCard} elevation={2}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.availableHeader}
      >
        <View style={styles.availableInfo}>
          <Text style={styles.availableTitle}>{item.sessionTitle}</Text>
          <Text style={styles.availableCoach}>with {item.coachName}</Text>
          <View style={styles.availableRating}>
            <Icon name="star" size={14} color="#fff" />
            <Text style={styles.availableRatingText}>{item.rating}</Text>
          </View>
        </View>
        <Avatar.Image source={{ uri: item.coachImage }} size={40} />
      </LinearGradient>

      <View style={styles.availableDetails}>
        <View style={styles.availableRow}>
          <Icon name="event" size={16} color={COLORS.primary} />
          <Text style={styles.availableText}>
            {new Date(item.date).toLocaleDateString()} • {item.time}
          </Text>
        </View>
        <View style={styles.availableRow}>
          <Icon name="location-on" size={16} color={COLORS.primary} />
          <Text style={styles.availableText}>{item.location}</Text>
        </View>
        <View style={styles.availableRow}>
          <Icon name="people" size={16} color={COLORS.success} />
          <Text style={styles.availableText}>{item.spotsLeft} spots left</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>${item.price}</Text>
          <Button
            mode="contained"
            onPress={() => handleBookSession(item)}
            style={styles.bookButton}
            compact
          >
            Book Now
          </Button>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Session Bookings</Text>
        <Text style={styles.headerSubtitle}>
          {user?.role === 'coach' ? 'Manage your coaching sessions' : 'Book & track your training sessions'}
        </Text>
      </LinearGradient>

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
        {/* Search Bar */}
        <Surface style={styles.searchContainer} elevation={1}>
          <Searchbar
            placeholder="Search sessions, coaches, or sports..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
        </Surface>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((filter) => (
            <Chip
              key={filter.key}
              selected={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.selectedFilterChip,
              ]}
              textStyle={[
                styles.filterText,
                selectedFilter === filter.key && styles.selectedFilterText,
              ]}
            >
              {filter.label} ({filter.count})
            </Chip>
          ))}
        </ScrollView>

        {/* My Bookings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Bookings 📅</Text>
            <Text style={styles.sectionCount}>{searchedBookings.length} sessions</Text>
          </View>

          {searchedBookings.length > 0 ? (
            <FlatList
              data={searchedBookings}
              renderItem={renderBookingCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Card style={styles.emptyCard} elevation={1}>
              <View style={styles.emptyContainer}>
                <Icon name="event-busy" size={60} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No bookings found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Try adjusting your search' : 'Book your first training session!'}
                </Text>
              </View>
            </Card>
          )}
        </View>

        {/* Available Sessions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Sessions ⚡</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('🔄 Feature in Development', 'View all sessions coming soon!')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.availableContainer}
          >
            {availableSessions.map((session) => (
              <View key={session.id} style={styles.availableSessionWrapper}>
                {renderAvailableSession({ item: session })}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Stats Section */}
        <Card style={styles.statsCard} elevation={2}>
          <Text style={styles.statsTitle}>Your Training Progress 🎯</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Sessions Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>85%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
          </View>
          <ProgressBar
            progress={0.85}
            color={COLORS.success}
            style={styles.progressBar}
          />
        </Card>
      </ScrollView>

      {/* Booking Confirmation Modal */}
      <Portal>
        <Modal
          visible={showBookingModal}
          onDismiss={() => setShowBookingModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedSession && (
            <Card style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirm Booking</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowBookingModal(false)}
                />
              </View>

              <View style={styles.modalContent}>
                <Text style={styles.modalSessionTitle}>{selectedSession.sessionTitle}</Text>
                <Text style={styles.modalCoachName}>with {selectedSession.coachName}</Text>
                
                <View style={styles.modalDetails}>
                  <View style={styles.modalDetailRow}>
                    <Icon name="event" size={18} color={COLORS.primary} />
                    <Text style={styles.modalDetailText}>
                      {new Date(selectedSession.date).toLocaleDateString()} at {selectedSession.time}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Icon name="location-on" size={18} color={COLORS.primary} />
                    <Text style={styles.modalDetailText}>{selectedSession.location}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Icon name="schedule" size={18} color={COLORS.primary} />
                    <Text style={styles.modalDetailText}>{selectedSession.duration} minutes</Text>
                  </View>
                </View>

                <View style={styles.modalPriceContainer}>
                  <Text style={styles.modalPriceLabel}>Total Cost:</Text>
                  <Text style={styles.modalPrice}>${selectedSession.price}</Text>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowBookingModal(false)}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={confirmBooking}
                    style={styles.modalButton}
                    icon="check"
                  >
                    Confirm Booking
                  </Button>
                </View>
              </View>
            </Card>
          )}
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('🔄 Feature in Development', 'Quick booking feature coming soon!')}
        color="#fff"
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchContainer: {
    marginVertical: SPACING.md,
    borderRadius: 12,
  },
  searchbar: {
    backgroundColor: '#fff',
    elevation: 0,
  },
  filterContainer: {
    marginBottom: SPACING.lg,
  },
  filterContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: '#fff',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textPrimary,
  },
  selectedFilterText: {
    color: '#fff',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  sectionCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  seeAllText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bookingCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
    paddingBottom: 0,
  },
  coachInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  coachDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  sessionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  coachName: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: 2,
    marginRight: SPACING.sm,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  sessionDetails: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  cardActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingTop: 0,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  availableContainer: {
    paddingRight: SPACING.md,
  },
  availableSessionWrapper: {
    marginRight: SPACING.md,
    width: width * 0.7,
  },
  availableCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  availableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  availableInfo: {
    flex: 1,
  },
  availableTitle: {
    ...TEXT_STYLES.h4,
    color: '#fff',
    marginBottom: 2,
  },
  availableCoach: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.xs,
  },
  availableRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableRatingText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginLeft: 2,
  },
  availableDetails: {
    padding: SPACING.md,
  },
  availableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  availableText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  priceText: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
  },
  bookButton: {
    paddingHorizontal: SPACING.sm,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statsTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: 0,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalSessionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  modalCoachName: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalDetails: {
    marginBottom: SPACING.lg,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalDetailText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  modalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  modalPriceLabel: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
  },
  modalPrice: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default SessionBookings;