import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System Imports
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const FacilityBookings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { bookings } = useSelector(state => state.bookings);

  // Component State
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, cancelled
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Sample booking data (replace with actual Redux data)
  const [bookingData] = useState([
    {
      id: '1',
      facilityName: 'Elite Sports Complex',
      facilityImage: 'https://via.placeholder.com/80',
      sport: 'Football',
      date: '2025-08-25',
      time: '18:00 - 19:30',
      duration: '1.5 hours',
      court: 'Field A',
      status: 'confirmed',
      price: '$45',
      bookingRef: 'ESC001',
      rating: 4.8,
      address: '123 Sports Avenue, Nairobi',
    },
    {
      id: '2',
      facilityName: 'Urban Basketball Courts',
      facilityImage: 'https://via.placeholder.com/80',
      sport: 'Basketball',
      date: '2025-08-23',
      time: '16:00 - 17:00',
      duration: '1 hour',
      court: 'Court 2',
      status: 'pending',
      price: '$25',
      bookingRef: 'UBC002',
      rating: 4.5,
      address: '456 City Center, Nairobi',
    },
    {
      id: '3',
      facilityName: 'Tennis Academy Pro',
      facilityImage: 'https://via.placeholder.com/80',
      sport: 'Tennis',
      date: '2025-08-20',
      time: '14:00 - 15:30',
      duration: '1.5 hours',
      court: 'Court 1',
      status: 'completed',
      price: '$60',
      bookingRef: 'TAP003',
      rating: 5.0,
      address: '789 Tennis Road, Nairobi',
    },
  ]);

  useEffect(() => {
    loadBookings();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to load bookings');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }, [loadBookings]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'cancelled': return COLORS.error;
      case 'completed': return COLORS.primary;
      default: return COLORS.secondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return 'check-circle';
      case 'pending': return 'schedule';
      case 'cancelled': return 'cancel';
      case 'completed': return 'done-all';
      default: return 'help';
    }
  };

  const filterBookings = () => {
    return bookingData.filter(booking => {
      const matchesSearch = booking.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           booking.sport.toLowerCase().includes(searchQuery.toLowerCase());
      
      const today = new Date();
      const bookingDate = new Date(booking.date);
      
      switch (activeTab) {
        case 'upcoming':
          return matchesSearch && (booking.status === 'confirmed' || booking.status === 'pending') && bookingDate >= today;
        case 'past':
          return matchesSearch && (booking.status === 'completed' || bookingDate < today);
        case 'cancelled':
          return matchesSearch && booking.status === 'cancelled';
        default:
          return matchesSearch;
      }
    });
  };

  const handleBookingAction = (booking, action) => {
    Alert.alert(
      'Feature Coming Soon! 🚀',
      `${action} booking functionality is being developed and will be available in the next update.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>My Bookings</Text>
            <Text style={[TEXT_STYLES.caption, styles.headerSubtitle]}>
              Manage your facility reservations 🏟️
            </Text>
          </View>
          <Avatar.Text
            size={40}
            label={user?.name?.charAt(0) || 'U'}
            style={{ backgroundColor: COLORS.surface }}
            color={COLORS.primary}
          />
        </View>
        
        <Searchbar
          placeholder="Search bookings..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.text }}
        />
      </View>
    </LinearGradient>
  );

  const renderTabs = () => (
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
          <View style={[
            styles.tabIndicator,
            activeTab === tab && styles.activeTabIndicator
          ]} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBookingCard = (booking) => (
    <Animated.View
      key={booking.id}
      style={[styles.cardContainer, { opacity: fadeAnim }]}
    >
      <Card style={styles.bookingCard} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.facilityInfo}>
              <Avatar.Image
                size={50}
                source={{ uri: booking.facilityImage }}
                style={styles.facilityAvatar}
              />
              <View style={styles.facilityDetails}>
                <Text style={[TEXT_STYLES.h4, styles.facilityName]}>
                  {booking.facilityName}
                </Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={[TEXT_STYLES.caption, styles.rating]}>
                    {booking.rating}
                  </Text>
                </View>
              </View>
            </View>
            
            <Chip
              icon={() => (
                <Icon
                  name={getStatusIcon(booking.status)}
                  size={16}
                  color={getStatusColor(booking.status)}
                />
              )}
              style={[styles.statusChip, { backgroundColor: `${getStatusColor(booking.status)}20` }]}
              textStyle={{ color: getStatusColor(booking.status), fontSize: 12 }}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Chip>
          </View>

          <Surface style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Icon name="sports" size={20} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.body, styles.detailText]}>
                {booking.sport} • {booking.court}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="event" size={20} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.body, styles.detailText]}>
                {booking.date} • {booking.time}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="access-time" size={20} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.body, styles.detailText]}>
                Duration: {booking.duration}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={20} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, styles.addressText]} numberOfLines={1}>
                {booking.address}
              </Text>
            </View>
          </Surface>

          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              <Text style={[TEXT_STYLES.caption, styles.priceLabel]}>Total</Text>
              <Text style={[TEXT_STYLES.h4, styles.price]}>{booking.price}</Text>
            </View>
            
            <View style={styles.actionButtons}>
              {booking.status === 'confirmed' && (
                <>
                  <Button
                    mode="outlined"
                    onPress={() => handleBookingAction(booking, 'Cancel')}
                    style={styles.actionButton}
                    labelStyle={{ fontSize: 12 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleBookingAction(booking, 'Reschedule')}
                    style={styles.actionButton}
                    labelStyle={{ fontSize: 12 }}
                  >
                    Reschedule
                  </Button>
                </>
              )}
              {booking.status === 'completed' && (
                <Button
                  mode="contained"
                  onPress={() => handleBookingAction(booking, 'Rate')}
                  style={styles.actionButton}
                  labelStyle={{ fontSize: 12 }}
                >
                  Rate & Review
                </Button>
              )}
              {booking.status === 'pending' && (
                <Button
                  mode="outlined"
                  onPress={() => handleBookingAction(booking, 'View details')}
                  style={styles.actionButton}
                  labelStyle={{ fontSize: 12 }}
                >
                  View Details
                </Button>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event-busy" size={64} color={COLORS.secondary} />
      <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>No bookings found</Text>
      <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
        {activeTab === 'upcoming' && "You don't have any upcoming bookings"}
        {activeTab === 'past' && "You don't have any past bookings"}
        {activeTab === 'cancelled' && "No cancelled bookings"}
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('FacilitySearch')}
        style={styles.emptyButton}
      >
        Find Facilities
      </Button>
    </View>
  );

  const renderStats = () => {
    const stats = [
      { label: 'Total Bookings', value: bookingData.length, icon: 'event' },
      { label: 'This Month', value: '5', icon: 'calendar-month' },
      { label: 'Spent', value: '$180', icon: 'payments' },
    ];

    return (
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <Surface key={index} style={styles.statCard}>
            <Icon name={stat.icon} size={24} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.h3, styles.statValue]}>{stat.value}</Text>
            <Text style={[TEXT_STYLES.caption, styles.statLabel]}>{stat.label}</Text>
          </Surface>
        ))}
      </View>
    );
  };

  const filteredBookings = filterBookings();

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ProgressBar indeterminate color={COLORS.primary} />
          <Text style={[TEXT_STYLES.body, styles.loadingText]}>Loading bookings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
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
        {renderStats()}
        {renderTabs()}
        
        {filteredBookings.length > 0 ? (
          filteredBookings.map(renderBookingCard)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('FacilitySearch')}
        color={COLORS.surface}
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
    paddingTop: SPACING.xl * 2,
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
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.surface,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    elevation: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    gap: SPACING.xs,
    elevation: 2,
  },
  statValue: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '100%',
    backgroundColor: 'transparent',
  },
  activeTabIndicator: {
    backgroundColor: COLORS.surface,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    elevation: 3,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  facilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  facilityAvatar: {
    marginRight: SPACING.sm,
  },
  facilityDetails: {
    flex: 1,
  },
  facilityName: {
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rating: {
    color: COLORS.textSecondary,
  },
  statusChip: {
    height: 28,
  },
  bookingDetails: {
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailText: {
    color: COLORS.text,
    flex: 1,
  },
  addressText: {
    color: COLORS.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceLabel: {
    color: COLORS.textSecondary,
  },
  price: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    minWidth: 80,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    marginTop: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default FacilityBookings;