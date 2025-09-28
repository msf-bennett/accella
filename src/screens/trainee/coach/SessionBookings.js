import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  FlatList,
  Modal,
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
} from 'react-native-paper';
import { BlurView } from 'expo-blur';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
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
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const SessionBookings = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, bookings, coaches } = useSelector(state => ({
    user: state.auth.user,
    bookings: state.bookings.sessions || [],
    coaches: state.coaches.availableCoaches || [],
  }));

  const [activeTab, setActiveTab] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

    loadBookings();
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual Redux action
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchUserBookings());
    } catch (error) {
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }, [loadBookings]);

  const handleBookSession = useCallback(async (coach, timeSlot) => {
    try {
      setLoading(true);
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        '🎉 Session Booked!',
        `Your session with ${coach.name} has been confirmed for ${timeSlot.date} at ${timeSlot.time}`,
        [{ text: 'Great!', onPress: () => setShowBookingModal(false) }]
      );
      
      // dispatch(bookSession({ coachId: coach.id, timeSlot }));
      await loadBookings();
    } catch (error) {
      Alert.alert('Booking Failed', 'Please try again later');
    } finally {
      setLoading(false);
    }
  }, [loadBookings]);

  const filterBookings = useCallback((type) => {
    const now = new Date();
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      
      switch (type) {
        case 'upcoming':
          return bookingDate >= now && booking.status !== 'cancelled';
        case 'past':
          return bookingDate < now || booking.status === 'completed';
        case 'cancelled':
          return booking.status === 'cancelled';
        default:
          return true;
      }
    });
  }, [bookings]);

  const renderBookingCard = ({ item, index }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    const getStatusColor = (status) => {
      switch (status) {
        case 'confirmed': return COLORS.success;
        case 'pending': return COLORS.warning;
        case 'cancelled': return COLORS.error;
        case 'completed': return COLORS.primary;
        default: return COLORS.textSecondary;
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'confirmed': return 'check-circle';
        case 'pending': return 'schedule';
        case 'cancelled': return 'cancel';
        case 'completed': return 'star';
        default: return 'info';
      }
    };

    return (
      <Animated.View
        style={[
          styles.bookingCard,
          {
            opacity: cardAnim,
            transform: [{ translateY: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })}]
          }
        ]}
      >
        <Card style={styles.card} elevation={3}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.bookingHeader}>
              <View style={styles.coachInfo}>
                <Avatar.Image 
                  size={48} 
                  source={{ uri: item.coach.avatar || 'https://via.placeholder.com/100' }}
                  style={styles.avatar}
                />
                <View style={styles.coachDetails}>
                  <Text style={[TEXT_STYLES.h3, styles.coachName]}>
                    {item.coach.name}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, styles.specialization]}>
                    {item.coach.specialization} • ⭐ {item.coach.rating}
                  </Text>
                </View>
              </View>
              
              <Chip
                icon={getStatusIcon(item.status)}
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
                textStyle={{ color: getStatusColor(item.status), fontSize: 12 }}
                compact
              >
                {item.status.toUpperCase()}
              </Chip>
            </View>

            <Surface style={styles.sessionDetails}>
              <View style={styles.detailRow}>
                <Icon name="event" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="schedule" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{item.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="fitness-center" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{item.sessionType}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="attach-money" size={16} color={COLORS.success} />
                <Text style={[styles.detailText, { color: COLORS.success, fontWeight: '600' }]}>
                  ${item.price}
                </Text>
              </View>
            </Surface>

            <View style={styles.actionButtons}>
              {item.status === 'confirmed' && (
                <>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => Alert.alert('Feature Coming Soon', 'Chat functionality will be available in the next update')}
                    style={styles.actionButton}
                  >
                    💬 Chat
                  </Button>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => Alert.alert('Feature Coming Soon', 'Session details will be available soon')}
                    style={styles.actionButton}
                  >
                    📋 Details
                  </Button>
                </>
              )}
              
              {item.status === 'pending' && (
                <Button
                  mode="contained"
                  compact
                  onPress={() => Alert.alert('Confirm Payment', `Complete payment of $${item.price} to confirm your session?`)}
                  style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                >
                  💳 Pay Now
                </Button>
              )}
              
              {item.status === 'completed' && (
                <Button
                  mode="outlined"
                  compact
                  onPress={() => Alert.alert('Feature Coming Soon', 'Review system coming soon')}
                  style={styles.actionButton}
                >
                  ⭐ Rate Session
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderCoachCard = ({ item }) => (
    <TouchableOpacity
      style={styles.coachCard}
      onPress={() => {
        setSelectedCoach(item);
        setShowBookingModal(true);
      }}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.coachGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Avatar.Image 
          size={60} 
          source={{ uri: item.avatar || 'https://via.placeholder.com/100' }}
          style={styles.coachAvatar}
        />
        <Text style={styles.coachCardName}>{item.name}</Text>
        <Text style={styles.coachCardSpecialty}>{item.specialization}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
        </View>
        <Text style={styles.price}>${item.pricePerHour}/hr</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTimeSlot = (slot) => (
    <TouchableOpacity
      key={slot.id}
      style={[
        styles.timeSlot,
        selectedTimeSlot?.id === slot.id && styles.selectedTimeSlot
      ]}
      onPress={() => setSelectedTimeSlot(slot)}
    >
      <Text style={[
        styles.timeSlotText,
        selectedTimeSlot?.id === slot.id && styles.selectedTimeSlotText
      ]}>
        {slot.time}
      </Text>
      <Text style={[
        styles.timeSlotDate,
        selectedTimeSlot?.id === slot.id && styles.selectedTimeSlotDate
      ]}>
        {slot.date}
      </Text>
    </TouchableOpacity>
  );

  const mockBookings = [
    {
      id: '1',
      coach: { 
        name: 'Sarah Johnson', 
        specialization: 'HIIT Training',
        rating: '4.9',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c77e?w=150'
      },
      date: '2025-08-26',
      time: '09:00 AM',
      sessionType: 'Personal Training',
      status: 'confirmed',
      price: 75
    },
    {
      id: '2',
      coach: { 
        name: 'Mike Torres', 
        specialization: 'Strength Training',
        rating: '4.8',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      date: '2025-08-24',
      time: '02:00 PM',
      sessionType: 'Group Session',
      status: 'completed',
      price: 45
    },
    {
      id: '3',
      coach: { 
        name: 'Emma Davis', 
        specialization: 'Yoga & Flexibility',
        rating: '4.7',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
      },
      date: '2025-08-28',
      time: '06:30 PM',
      sessionType: 'Yoga Session',
      status: 'pending',
      price: 60
    }
  ];

  const mockCoaches = [
    {
      id: '1',
      name: 'Alex Rivera',
      specialization: 'CrossFit',
      rating: '4.9',
      pricePerHour: 80,
      avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150'
    },
    {
      id: '2',
      name: 'Lisa Chen',
      specialization: 'Pilates',
      rating: '4.8',
      pricePerHour: 70,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    },
    {
      id: '3',
      name: 'David Kim',
      specialization: 'Boxing',
      rating: '4.9',
      pricePerHour: 85,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  ];

  const mockTimeSlots = [
    { id: '1', time: '09:00 AM', date: 'Aug 26' },
    { id: '2', time: '11:00 AM', date: 'Aug 26' },
    { id: '3', time: '02:00 PM', date: 'Aug 26' },
    { id: '4', time: '04:00 PM', date: 'Aug 26' },
    { id: '5', time: '09:00 AM', date: 'Aug 27' },
    { id: '6', time: '03:00 PM', date: 'Aug 27' },
  ];

  const displayBookings = bookings.length > 0 ? filterBookings(activeTab) : mockBookings;
  const displayCoaches = coaches.length > 0 ? coaches : mockCoaches;

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Session Bookings 📅</Text>
              <Text style={styles.headerSubtitle}>
                Manage your training sessions
              </Text>
            </View>
            <IconButton
              icon="notifications"
              iconColor="#fff"
              size={24}
              onPress={() => Alert.alert('Feature Coming Soon', 'Notifications will be available soon')}
            />
          </View>
          
          <Searchbar
            placeholder="Search coaches or sessions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            placeholderTextColor={COLORS.textSecondary}
          />
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Quick Stats */}
        <Animated.View 
          style={[
            styles.statsContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.statsRow}>
            <Surface style={styles.statCard}>
              <Icon name="event" size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>
                {mockBookings.filter(b => b.status === 'confirmed').length}
              </Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </Surface>
            
            <Surface style={styles.statCard}>
              <Icon name="star" size={24} color={COLORS.warning} />
              <Text style={styles.statNumber}>
                {mockBookings.filter(b => b.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Surface>
            
            <Surface style={styles.statCard}>
              <Icon name="schedule" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>
                {mockBookings.filter(b => b.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Surface>
          </View>
        </Animated.View>

        {/* Available Coaches */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>
            🏃‍♂️ Available Coaches
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={displayCoaches}
            renderItem={renderCoachCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.coachesContainer}
          />
        </View>

        {/* Booking Tabs */}
        <View style={styles.tabContainer}>
          {['upcoming', 'past', 'cancelled'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bookings List */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {displayBookings.length > 0 ? (
            <FlatList
              data={displayBookings}
              renderItem={renderBookingCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="event-busy" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No sessions found</Text>
              <Text style={styles.emptySubtitle}>
                Book your first session with a coach!
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Booking Modal */}
      <Portal>
        <Modal
          visible={showBookingModal}
          animationType="slide"
          onRequestClose={() => setShowBookingModal(false)}
        >
          <BlurView style={styles.modalOverlay} blurType="dark" blurAmount={10}>
            <View style={styles.modalContainer}>
              <Surface style={styles.modalContent}>
                {selectedCoach && (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
                        Book with {selectedCoach.name}
                      </Text>
                      <IconButton
                        icon="close"
                        onPress={() => setShowBookingModal(false)}
                      />
                    </View>

                    <View style={styles.coachProfile}>
                      <Avatar.Image 
                        size={80} 
                        source={{ uri: selectedCoach.avatar }}
                      />
                      <View style={styles.profileInfo}>
                        <Text style={[TEXT_STYLES.h3]}>{selectedCoach.name}</Text>
                        <Text style={TEXT_STYLES.caption}>
                          {selectedCoach.specialization}
                        </Text>
                        <View style={styles.ratingRow}>
                          <Icon name="star" size={16} color="#FFD700" />
                          <Text style={styles.ratingText}>{selectedCoach.rating}</Text>
                        </View>
                      </View>
                    </View>

                    <Text style={[TEXT_STYLES.h3, styles.timeSlotsTitle]}>
                      Available Time Slots
                    </Text>
                    
                    <View style={styles.timeSlotsGrid}>
                      {mockTimeSlots.map(renderTimeSlot)}
                    </View>

                    {selectedTimeSlot && (
                      <View style={styles.bookingConfirmation}>
                        <Surface style={styles.confirmationCard}>
                          <Text style={styles.confirmationTitle}>
                            Booking Summary
                          </Text>
                          <Text style={styles.confirmationDetail}>
                            Coach: {selectedCoach.name}
                          </Text>
                          <Text style={styles.confirmationDetail}>
                            Time: {selectedTimeSlot.time} on {selectedTimeSlot.date}
                          </Text>
                          <Text style={[styles.confirmationDetail, { color: COLORS.success, fontWeight: '600' }]}>
                            Price: ${selectedCoach.pricePerHour}
                          </Text>
                        </Surface>
                        
                        <Button
                          mode="contained"
                          loading={loading}
                          disabled={loading}
                          onPress={() => handleBookSession(selectedCoach, selectedTimeSlot)}
                          style={styles.bookButton}
                          contentStyle={styles.bookButtonContent}
                        >
                          {loading ? 'Booking...' : `Book Session - $${selectedCoach.pricePerHour}`}
                        </Button>
                      </View>
                    )}
                  </>
                )}
              </Surface>
            </View>
          </BlurView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => setShowBookingModal(true)}
        label="Book Session"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
  },
  searchBar: {
    backgroundColor: '#fff',
    elevation: 0,
    borderRadius: 12,
  },
  statsContainer: {
    marginTop: -SPACING.xl,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginVertical: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  coachesContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  coachCard: {
    width: 140,
    height: 180,
    marginRight: SPACING.sm,
    borderRadius: 16,
    overflow: 'hidden',
  },
  coachGradient: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachAvatar: {
    marginBottom: SPACING.sm,
  },
  coachCardName: {
    ...TEXT_STYLES.body,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  coachCardSpecialty: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  rating: {
    color: '#fff',
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  price: {
    ...TEXT_STYLES.caption,
    color: '#FFD700',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xs,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  bookingCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
  },
  cardContent: {
    padding: SPACING.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  coachInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  coachDetails: {
    flex: 1,
  },
  coachName: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  specialization: {
    fontSize: 13,
  },
  statusChip: {
    height: 28,
  },
  sessionDetails: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    color: COLORS.text,
  },
  emptySubtitle: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    elevation: 8,
  },
  bottomSpacing: {
    height: 100,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
    flex: 1,
  },
  coachProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  ratingText: {
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  timeSlotsTitle: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
    color: COLORS.text,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  timeSlot: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    minWidth: '30%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedTimeSlotText: {
    color: COLORS.primary,
  },
  timeSlotDate: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontSize: 12,
  },
  selectedTimeSlotDate: {
    color: COLORS.primary,
  },
  bookingConfirmation: {
    padding: SPACING.lg,
  },
  confirmationCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    elevation: 0,
  },
  confirmationTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  confirmationDetail: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  bookButton: {
    borderRadius: 12,
    elevation: 4,
  },
  bookButtonContent: {
    paddingVertical: SPACING.sm,
  },
});

export default SessionBookings;