import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Vibration,
  StatusBar,
  Dimensions,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  Searchbar,
  Divider,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  lightGray: '#F5F5F5',
  gold: '#FFD700',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text, lineHeight: 22 },
  caption: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const CoachBookings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { bookings, loading } = useSelector(state => state.bookings);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewMode, setViewMode] = useState('today'); // 'today', 'week', 'month'
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample data (replace with Redux data)
  const [bookingsData] = useState([
    {
      id: 1,
      clientName: 'John Smith',
      clientAvatar: 'https://via.placeholder.com/100',
      sessionType: 'Personal Training',
      date: new Date(2024, 11, 25, 9, 0),
      duration: 60,
      location: 'Gym A',
      status: 'confirmed',
      price: 80,
      notes: 'Focus on upper body strength',
      clientLevel: 'intermediate',
      sessionNumber: 5,
      totalSessions: 10,
      paymentStatus: 'paid',
      recurring: true,
    },
    {
      id: 2,
      clientName: 'Sarah Johnson',
      clientAvatar: 'https://via.placeholder.com/100',
      sessionType: 'Group Training',
      date: new Date(2024, 11, 25, 10, 30),
      duration: 45,
      location: 'Studio B',
      status: 'pending',
      price: 45,
      notes: 'First session - assessment needed',
      clientLevel: 'beginner',
      sessionNumber: 1,
      totalSessions: 1,
      paymentStatus: 'pending',
      recurring: false,
    },
    {
      id: 3,
      clientName: 'Mike Davis',
      clientAvatar: 'https://via.placeholder.com/100',
      sessionType: 'Football Training',
      date: new Date(2024, 11, 25, 14, 0),
      duration: 90,
      location: 'Field 1',
      status: 'confirmed',
      price: 100,
      notes: 'Work on ball control and passing',
      clientLevel: 'advanced',
      sessionNumber: 12,
      totalSessions: 20,
      paymentStatus: 'paid',
      recurring: true,
    },
    {
      id: 4,
      clientName: 'Emma Wilson',
      clientAvatar: 'https://via.placeholder.com/100',
      sessionType: 'Fitness Assessment',
      date: new Date(2024, 11, 25, 16, 0),
      duration: 30,
      location: 'Office',
      status: 'confirmed',
      price: 50,
      notes: 'Initial consultation and goal setting',
      clientLevel: 'beginner',
      sessionNumber: 1,
      totalSessions: 1,
      paymentStatus: 'paid',
      recurring: false,
    },
    {
      id: 5,
      clientName: 'Alex Thompson',
      clientAvatar: 'https://via.placeholder.com/100',
      sessionType: 'Recovery Session',
      date: new Date(2024, 11, 25, 18, 0),
      duration: 60,
      location: 'Recovery Room',
      status: 'cancelled',
      price: 70,
      notes: 'Massage and stretching',
      clientLevel: 'intermediate',
      sessionNumber: 3,
      totalSessions: 6,
      paymentStatus: 'refunded',
      recurring: true,
    },
  ]);

  const filters = [
    { id: 'all', label: 'All', icon: 'list', count: bookingsData.length },
    { id: 'confirmed', label: 'Confirmed', icon: 'check-circle', count: bookingsData.filter(b => b.status === 'confirmed').length },
    { id: 'pending', label: 'Pending', icon: 'schedule', count: bookingsData.filter(b => b.status === 'pending').length },
    { id: 'cancelled', label: 'Cancelled', icon: 'cancel', count: bookingsData.filter(b => b.status === 'cancelled').length },
    { id: 'completed', label: 'Completed', icon: 'done-all', count: 0 },
  ];

  // Statistics data
  const stats = {
    todayBookings: bookingsData.filter(b => b.date.toDateString() === new Date().toDateString()).length,
    weeklyRevenue: bookingsData.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? b.price : 0), 0),
    clientsToday: new Set(bookingsData.filter(b => b.date.toDateString() === new Date().toDateString()).map(b => b.clientName)).size,
    completionRate: 85,
    avgSessionDuration: 65,
    monthlyBookings: 124,
  };

  // Component mount animation
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
      // Dispatch refresh bookings action
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh bookings');
    }
    setRefreshing(false);
  }, [dispatch]);

  // Filter bookings based on selected filter
  const getFilteredBookings = () => {
    let filtered = bookingsData;
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === selectedFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(booking => 
        booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.sessionType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => a.date - b.date);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'cancelled': return COLORS.error;
      case 'completed': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  // Get client level color
  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  // Handle booking action
  const handleBookingAction = (action, booking) => {
    Vibration.vibrate(20);
    
    Alert.alert(
      `${action} Session`,
      `Are you sure you want to ${action.toLowerCase()} the session with ${booking.clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Success', `Session ${action.toLowerCase()}ed successfully!`);
            setShowBookingModal(false);
          },
        },
      ]
    );
  };

  // Handle client contact
  const handleClientContact = (method, booking) => {
    Vibration.vibrate(10);
    setShowBookingModal(false);
    
    switch (method) {
      case 'call':
        Alert.alert('Call Client', `Calling ${booking.clientName}...`);
        break;
      case 'message':
        navigation.navigate('Chat', { clientId: booking.id, clientName: booking.clientName });
        break;
      case 'email':
        Alert.alert('Email Client', `Opening email to ${booking.clientName}...`);
        break;
    }
  };

  // Header component
  const BookingsHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.lg,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
          My Bookings 📅
        </Text>

        <TouchableOpacity
          onPress={() => {
            setShowStatsModal(true);
            Vibration.vibrate(10);
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name="analytics" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Quick stats */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
            {stats.todayBookings}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
            Today
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
            ${stats.weeklyRevenue}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
            Revenue
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
            {stats.clientsToday}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
            Clients
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
            {stats.completionRate}%
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.white, opacity: 0.8 }]}>
            Complete
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  // Filter chips component
  const FilterChips = () => (
    <View style={{ paddingVertical: SPACING.md }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => {
              setSelectedFilter(filter.id);
              Vibration.vibrate(10);
            }}
            style={{ marginRight: SPACING.sm }}
          >
            <Surface
              style={{
                padding: SPACING.md,
                borderRadius: 20,
                backgroundColor: selectedFilter === filter.id ? COLORS.primary : COLORS.white,
                elevation: selectedFilter === filter.id ? 4 : 2,
                flexDirection: 'row',
                alignItems: 'center',
                minWidth: 80,
              }}
            >
              <Icon
                name={filter.icon}
                size={18}
                color={selectedFilter === filter.id ? COLORS.white : COLORS.primary}
              />
              <Text style={[
                TEXT_STYLES.caption,
                {
                  color: selectedFilter === filter.id ? COLORS.white : COLORS.text,
                  fontWeight: selectedFilter === filter.id ? '600' : 'normal',
                  marginLeft: SPACING.xs,
                }
              ]}>
                {filter.label}
              </Text>
              {filter.count > 0 && (
                <Badge
                  size={16}
                  style={{
                    backgroundColor: selectedFilter === filter.id ? COLORS.white : COLORS.primary,
                    marginLeft: SPACING.xs,
                  }}
                >
                  <Text style={{
                    fontSize: 10,
                    color: selectedFilter === filter.id ? COLORS.primary : COLORS.white,
                  }}>
                    {filter.count}
                  </Text>
                </Badge>
              )}
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Booking card component
  const BookingCard = ({ booking, onPress }) => (
    <TouchableOpacity onPress={() => onPress(booking)}>
      <Card style={{
        margin: SPACING.sm,
        marginHorizontal: SPACING.md,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: getStatusColor(booking.status),
      }}>
        <View style={{ padding: SPACING.md }}>
          {/* Header row */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: SPACING.md,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Avatar.Image
                size={50}
                source={{ uri: booking.clientAvatar }}
                style={{ marginRight: SPACING.md }}
              />
              
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.h3]} numberOfLines={1}>
                  {booking.clientName}
                </Text>
                <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
                  {booking.sessionType}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Chip
                    compact
                    mode="outlined"
                    textStyle={{ fontSize: 10 }}
                    style={{
                      backgroundColor: getLevelColor(booking.clientLevel) + '20',
                      borderColor: getLevelColor(booking.clientLevel),
                      height: 24,
                    }}
                  >
                    {booking.clientLevel}
                  </Chip>
                  
                  {booking.recurring && (
                    <Icon
                      name="repeat"
                      size={16}
                      color={COLORS.primary}
                      style={{ marginLeft: SPACING.sm }}
                    />
                  )}
                </View>
              </View>
            </View>
            
            <View style={{ alignItems: 'flex-end' }}>
              <Chip
                mode="outlined"
                compact
                textStyle={{ fontSize: 10, fontWeight: '600' }}
                style={{
                  backgroundColor: getStatusColor(booking.status) + '20',
                  borderColor: getStatusColor(booking.status),
                  marginBottom: SPACING.xs,
                }}
              >
                {booking.status}
              </Chip>
              
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                ${booking.price}
              </Text>
            </View>
          </View>

          {/* Session details */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: SPACING.sm,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Icon name="access-time" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                {booking.date.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })} • {booking.duration} min
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="location-on" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                {booking.location}
              </Text>
            </View>
          </View>

          {/* Progress bar for package sessions */}
          {booking.totalSessions > 1 && (
            <View style={{ marginBottom: SPACING.sm }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: SPACING.xs,
              }}>
                <Text style={[TEXT_STYLES.caption]}>
                  Session Progress
                </Text>
                <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>
                  {booking.sessionNumber}/{booking.totalSessions}
                </Text>
              </View>
              <ProgressBar
                progress={booking.sessionNumber / booking.totalSessions}
                color={COLORS.primary}
                style={{ height: 6, borderRadius: 3 }}
              />
            </View>
          )}

          {/* Payment status */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                name={booking.paymentStatus === 'paid' ? 'payment' : 
                      booking.paymentStatus === 'pending' ? 'schedule' : 'money-off'}
                size={16}
                color={booking.paymentStatus === 'paid' ? COLORS.success :
                      booking.paymentStatus === 'pending' ? COLORS.warning : COLORS.error}
              />
              <Text style={[
                TEXT_STYLES.caption,
                {
                  marginLeft: SPACING.xs,
                  color: booking.paymentStatus === 'paid' ? COLORS.success :
                        booking.paymentStatus === 'pending' ? COLORS.warning : COLORS.error,
                  fontWeight: '600',
                }
              ]}>
                {booking.paymentStatus}
              </Text>
            </View>
            
            {booking.notes && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="note" size={16} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, fontStyle: 'italic' }]} numberOfLines={1}>
                  {booking.notes}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  // Booking detail modal
  const BookingDetailModal = () => (
    <Portal>
      <Modal
        visible={showBookingModal}
        onDismiss={() => setShowBookingModal(false)}
        contentContainerStyle={{ margin: SPACING.lg }}
      >
        <BlurView intensity={100} style={{ borderRadius: 12 }}>
          <Card style={{ elevation: 8, maxHeight: '90%' }}>
            {selectedBooking && (
              <>
                <LinearGradient
                  colors={[getStatusColor(selectedBooking.status), getStatusColor(selectedBooking.status) + 'CC']}
                  style={{
                    padding: SPACING.lg,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  }}
                >
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: SPACING.md,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Avatar.Image
                        size={60}
                        source={{ uri: selectedBooking.clientAvatar }}
                        style={{ marginRight: SPACING.md }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
                          {selectedBooking.clientName}
                        </Text>
                        <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
                          {selectedBooking.sessionType}
                        </Text>
                      </View>
                    </View>
                    
                    <IconButton
                      icon="close"
                      size={24}
                      iconColor={COLORS.white}
                      onPress={() => setShowBookingModal(false)}
                    />
                  </View>
                  
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
                      ${selectedBooking.price}
                    </Text>
                    <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
                      {selectedBooking.date.toLocaleDateString()} at {selectedBooking.date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                  </View>
                </LinearGradient>
                
                <ScrollView style={{ maxHeight: 300 }}>
                  <View style={{ padding: SPACING.lg }}>
                    {/* Session details */}
                    <View style={{ marginBottom: SPACING.lg }}>
                      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                        Session Details
                      </Text>
                      
                      <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
                        <Icon name="schedule" size={20} color={COLORS.primary} />
                        <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                          Duration: {selectedBooking.duration} minutes
                        </Text>
                      </View>
                      
                      <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
                        <Icon name="location-on" size={20} color={COLORS.primary} />
                        <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                          Location: {selectedBooking.location}
                        </Text>
                      </View>
                      
                      <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
                        <Icon name="trending-up" size={20} color={COLORS.primary} />
                        <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                          Level: {selectedBooking.clientLevel}
                        </Text>
                      </View>
                      
                      {selectedBooking.notes && (
                        <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
                          <Icon name="note" size={20} color={COLORS.primary} />
                          <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>
                            Notes: {selectedBooking.notes}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Contact options */}
                    <View style={{ marginBottom: SPACING.lg }}>
                      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                        Contact Client
                      </Text>
                      
                      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <TouchableOpacity
                          onPress={() => handleClientContact('call', selectedBooking)}
                          style={{
                            alignItems: 'center',
                            padding: SPACING.md,
                            borderRadius: 8,
                            backgroundColor: COLORS.success + '20',
                            flex: 1,
                            marginRight: SPACING.sm,
                          }}
                        >
                          <Icon name="call" size={24} color={COLORS.success} />
                          <Text style={[TEXT_STYLES.caption, { color: COLORS.success, fontWeight: '600', marginTop: SPACING.xs }]}>
                            Call
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={() => handleClientContact('message', selectedBooking)}
                          style={{
                            alignItems: 'center',
                            padding: SPACING.md,
                            borderRadius: 8,
                            backgroundColor: COLORS.primary + '20',
                            flex: 1,
                            marginHorizontal: SPACING.sm,
                          }}
                        >
                          <Icon name="message" size={24} color={COLORS.primary} />
                          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: '600', marginTop: SPACING.xs }]}>
                            Message
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={() => handleClientContact('email', selectedBooking)}
                          style={{
                            alignItems: 'center',
                            padding: SPACING.md,
                            borderRadius: 8,
                            backgroundColor: COLORS.warning + '20',
                            flex: 1,
                            marginLeft: SPACING.sm,
                          }}
                        >
                          <Icon name="email" size={24} color={COLORS.warning} />
                          <Text style={[TEXT_STYLES.caption, { color: COLORS.warning, fontWeight: '600', marginTop: SPACING.xs }]}>
                            Email
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Action buttons */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {selectedBooking.status === 'pending' && (
                        <>
                          <Button
                            mode="outlined"
                            onPress={() => handleBookingAction('Decline', selectedBooking)}
                            style={{ flex: 1, marginRight: SPACING.sm }}
                            buttonColor={COLORS.error}
                            textColor={COLORS.error}
                            icon="close"
                          >
                            Decline
                          </Button>
                          <Button
                            mode="contained"
                            onPress={() => handleBookingAction('Accept', selectedBooking)}
                            style={{ flex: 1, marginLeft: SPACING.sm }}
                            buttonColor={COLORS.success}
                            icon="check"
                          >
                            Accept
                          </Button>
                        </>
                      )}
                      
                      {selectedBooking.status === 'confirmed' && (
                        <>
                          <Button
                            mode="outlined"
                            onPress={() => handleBookingAction('Reschedule', selectedBooking)}
                            style={{ flex: 1, marginRight: SPACING.sm }}
                            icon="schedule"
                          >
                            Reschedule
                          </Button>
                          <Button
                            mode="contained"
                            onPress={() => handleBookingAction('Complete', selectedBooking)}
                            style={{ flex: 1, marginLeft: SPACING.sm }}
                            buttonColor={COLORS.primary}
                            icon="check-circle"
                          >
                            Complete
                          </Button>
                        </>
                      )}
                      
                      {selectedBooking.status === 'cancelled' && (
                        <Button
                          mode="contained"
                          onPress={() => handleBookingAction('Rebook', selectedBooking)}
                          style={{ flex: 1 }}
                          buttonColor={COLORS.primary}
                          icon="refresh"
                        >
                          Rebook Session
                        </Button>
                      )}
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  // Stats modal component
  const StatsModal = () => (
    <Portal>
      <Modal
        visible={showStatsModal}
        onDismiss={() => setShowStatsModal(false)}
        contentContainerStyle={{ margin: SPACING.lg }}
      >
        <BlurView intensity={100} style={{ borderRadius: 12 }}>
          <Card style={{ elevation: 8 }}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={{
                padding: SPACING.lg,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
            >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Text style={[TEXT_STYLES.h2, { color: COLORS.white }]}>
                  Performance Stats 📊
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  iconColor={COLORS.white}
                  onPress={() => setShowStatsModal(false)}
                />
              </View>
            </LinearGradient>
            
            <View style={{ padding: SPACING.lg }}>
              {/* Revenue stats */}
              <View style={{ marginBottom: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                  Revenue Overview
                </Text>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: SPACING.md,
                }}>
                  <View style={{
                    alignItems: 'center',
                    padding: SPACING.md,
                    borderRadius: 8,
                    backgroundColor: COLORS.success + '20',
                    flex: 1,
                    marginRight: SPACING.sm,
                  }}>
                    <Icon name="trending-up" size={24} color={COLORS.success} />
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.success, marginTop: SPACING.xs }]}>
                      ${stats.weeklyRevenue}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
                      This Week
                    </Text>
                  </View>
                  
                  <View style={{
                    alignItems: 'center',
                    padding: SPACING.md,
                    borderRadius: 8,
                    backgroundColor: COLORS.primary + '20',
                    flex: 1,
                    marginLeft: SPACING.sm,
                  }}>
                    <Icon name="calendar-month" size={24} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, marginTop: SPACING.xs }]}>
                      {stats.monthlyBookings}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
                      This Month
                    </Text>
                  </View>
                </View>
              </View>

              {/* Performance metrics */}
              <View style={{ marginBottom: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                  Performance Metrics
                </Text>
                
                <View style={{ marginBottom: SPACING.md }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: SPACING.xs,
                  }}>
                    <Text style={TEXT_STYLES.body}>Completion Rate</Text>
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.primary }]}>
                      {stats.completionRate}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={stats.completionRate / 100}
                    color={COLORS.primary}
                    style={{ height: 8, borderRadius: 4 }}
                  />
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: SPACING.md,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="schedule" size={20} color={COLORS.textSecondary} />
                    <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                      Avg Session Duration
                    </Text>
                  </View>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.primary }]}>
                    {stats.avgSessionDuration} min
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="group" size={20} color={COLORS.textSecondary} />
                    <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                      Active Clients
                    </Text>
                  </View>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.primary }]}>
                    {new Set(bookingsData.map(b => b.clientName)).size}
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowStatsModal(false);
                    navigation.navigate('Analytics');
                  }}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                  icon="analytics"
                >
                  Full Analytics
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowStatsModal(false);
                    navigation.navigate('Revenue');
                  }}
                  style={{ flex: 1, marginLeft: SPACING.sm }}
                  buttonColor={COLORS.primary}
                  icon="receipt"
                >
                  Revenue Report
                </Button>
              </View>
            </View>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const filteredBookings = getFilteredBookings();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      
      <BookingsHeader />
      
      <Animated.View style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}>
        {/* Search bar */}
        <View style={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
          <Searchbar
            placeholder="Search bookings..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ elevation: 2 }}
            iconColor={COLORS.primary}
          />
        </View>

        <FilterChips />

        {/* Bookings list */}
        <FlatList
          data={filteredBookings}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onPress={(booking) => {
                setSelectedBooking(booking);
                setShowBookingModal(true);
                Vibration.vibrate(10);
              }}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.white}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={() => (
            <Card style={{
              margin: SPACING.lg,
              padding: SPACING.xl,
              alignItems: 'center',
              elevation: 2,
            }}>
              <Icon name="event-busy" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginTop: SPACING.md }]}>
                No bookings found
              </Text>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
                {selectedFilter === 'all' 
                  ? 'You don\'t have any bookings yet'
                  : `No ${selectedFilter} bookings found`
                }
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Schedule')}
                style={{ marginTop: SPACING.lg }}
                buttonColor={COLORS.primary}
                icon="add"
              >
                Create Availability
              </Button>
            </Card>
          )}
        />
      </Animated.View>

      {/* Add booking FAB */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          bottom: SPACING.lg,
          right: SPACING.lg,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Vibration.vibrate(10);
          navigation.navigate('CreateBooking');
        }}
      />

      <BookingDetailModal />
      <StatsModal />
    </View>
  );
};

export default CoachBookings;
