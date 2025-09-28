import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Vibration,
  Dimensions,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Text,
  Avatar,
  Chip,
  IconButton,
  Searchbar,
  Surface,
  ProgressBar,
  Portal,
  Modal,
  Divider,
  FAB,
  Menu,
  Calendar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SessionBookings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showMenuId, setShowMenuId] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const fabScale = useState(new Animated.Value(0))[0];

  // Mock data - replace with actual Redux state
  const [bookings, setBookings] = useState([
    {
      id: '1',
      clientId: 'c1',
      clientName: 'Sarah Johnson',
      clientAvatar: 'https://i.pravatar.cc/150?img=1',
      clientPhone: '+1234567890',
      serviceName: 'Personal Training Session',
      serviceType: 'personal',
      date: '2024-08-20',
      time: '09:00',
      duration: 60,
      status: 'confirmed',
      location: 'Main Gym',
      price: 75,
      notes: 'Focus on core strength and posture correction',
      clientNotes: 'Lower back has been bothering me lately',
      isNewClient: false,
      reminderSent: true,
      equipment: ['Dumbbells', 'Resistance bands', 'Mat'],
      goals: ['Weight loss', 'Strength building'],
    },
    {
      id: '2',
      clientId: 'c2',
      clientName: 'Mike Chen',
      clientAvatar: 'https://i.pravatar.cc/150?img=2',
      clientPhone: '+1234567891',
      serviceName: 'Nutrition Consultation',
      serviceType: 'consultation',
      date: '2024-08-20',
      time: '11:30',
      duration: 90,
      status: 'pending',
      location: 'Online',
      price: 95,
      notes: '',
      clientNotes: 'Want to discuss meal prep strategies',
      isNewClient: true,
      reminderSent: false,
      equipment: [],
      goals: ['Nutrition planning', 'Meal prep'],
    },
    {
      id: '3',
      clientId: 'c3',
      clientName: 'Emma Wilson',
      clientAvatar: 'https://i.pravatar.cc/150?img=3',
      clientPhone: '+1234567892',
      serviceName: 'Group Fitness Class',
      serviceType: 'group',
      date: '2024-08-20',
      time: '14:00',
      duration: 45,
      status: 'confirmed',
      location: 'Studio A',
      price: 25,
      notes: 'High-intensity interval training session',
      clientNotes: '',
      isNewClient: false,
      reminderSent: true,
      equipment: ['Kettlebells', 'Battle ropes', 'Plyometric boxes'],
      goals: ['Cardio fitness', 'Fat burning'],
      groupSize: 8,
    },
    {
      id: '4',
      clientId: 'c4',
      clientName: 'David Park',
      clientAvatar: 'https://i.pravatar.cc/150?img=4',
      clientPhone: '+1234567893',
      serviceName: 'Personal Training Session',
      serviceType: 'personal',
      date: '2024-08-21',
      time: '10:00',
      duration: 60,
      status: 'completed',
      location: 'Main Gym',
      price: 75,
      notes: 'Great progress on deadlifts, form improving',
      clientNotes: 'Feeling much stronger!',
      isNewClient: false,
      reminderSent: true,
      equipment: ['Barbell', 'Weight plates', 'Bench'],
      goals: ['Strength building', 'Muscle gain'],
      sessionRating: 5,
      sessionFeedback: 'Excellent session, very motivating!',
    },
    {
      id: '5',
      clientId: 'c5',
      clientName: 'Lisa Anderson',
      clientAvatar: 'https://i.pravatar.cc/150?img=5',
      clientPhone: '+1234567894',
      serviceName: 'Personal Training Session',
      serviceType: 'personal',
      date: '2024-08-19',
      time: '16:00',
      duration: 60,
      status: 'cancelled',
      location: 'Main Gym',
      price: 75,
      notes: 'Client cancelled due to illness',
      clientNotes: 'Not feeling well today',
      isNewClient: false,
      reminderSent: true,
      equipment: [],
      goals: ['Rehabilitation', 'Flexibility'],
      cancellationReason: 'Client illness',
      cancellationTime: '2024-08-19T14:30:00Z',
    },
  ]);

  const filters = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'today', label: 'Today', count: bookings.filter(b => b.date === selectedDate).length },
    { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
    { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
  ];

  const bookingStats = {
    totalBookings: bookings.length,
    todayBookings: bookings.filter(b => b.date === selectedDate).length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    totalRevenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.price, 0),
    completionRate: Math.round((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100),
  };

  useEffect(() => {
    // Entrance animations
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
      Animated.spring(fabScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    loadBookings();
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app: dispatch(fetchBookings(user.id));
    } catch (error) {
      Alert.alert('Error', 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadBookings]);

  const handleBookingAction = (booking, action) => {
    setSelectedBooking(booking);
    setShowMenuId(null);
    
    switch (action) {
      case 'details':
        setShowDetailsModal(true);
        break;
      case 'confirm':
        confirmBooking(booking.id);
        break;
      case 'reschedule':
        setShowRescheduleModal(true);
        break;
      case 'cancel':
        cancelBooking(booking.id);
        break;
      case 'complete':
        completeSession(booking.id);
        break;
      case 'notes':
        setSessionNotes(booking.notes || '');
        setShowNotesModal(true);
        break;
      default:
        break;
    }
    Vibration.vibrate(50);
  };

  const confirmBooking = async (bookingId) => {
    try {
      setLoading(true);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'confirmed' }
          : booking
      ));
      Alert.alert('Success', 'Booking confirmed successfully! ✅');
      Vibration.vibrate([100, 50, 100]);
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm booking.');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              setBookings(prev => prev.map(booking => 
                booking.id === bookingId 
                  ? { 
                      ...booking, 
                      status: 'cancelled',
                      cancellationReason: 'Trainer cancellation',
                      cancellationTime: new Date().toISOString(),
                    }
                  : booking
              ));
              Alert.alert('Success', 'Booking cancelled successfully.');
              Vibration.vibrate([100, 50, 100]);
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const completeSession = async (bookingId) => {
    try {
      setLoading(true);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'completed' }
          : booking
      ));
      // Open notes modal for session completion
      const booking = bookings.find(b => b.id === bookingId);
      setSelectedBooking(booking);
      setSessionNotes(booking?.notes || '');
      setShowNotesModal(true);
      Vibration.vibrate([100, 50, 100]);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete session.');
    } finally {
      setLoading(false);
    }
  };

  const saveSessionNotes = async () => {
    if (!selectedBooking) return;
    
    try {
      setLoading(true);
      setBookings(prev => prev.map(booking => 
        booking.id === selectedBooking.id 
          ? { ...booking, notes: sessionNotes }
          : booking
      ));
      setShowNotesModal(false);
      Alert.alert('Success', 'Session notes saved! 📝');
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return COLORS.success;
      case 'pending': return '#FFA500';
      case 'completed': return COLORS.primary;
      case 'cancelled': return COLORS.error;
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return 'check-circle';
      case 'pending': return 'schedule';
      case 'completed': return 'task-alt';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    switch (selectedFilter) {
      case 'today':
        matchesFilter = booking.date === selectedDate;
        break;
      case 'pending':
      case 'confirmed':
      case 'completed':
        matchesFilter = booking.status === selectedFilter;
        break;
      case 'all':
      default:
        matchesFilter = true;
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  const renderBookingCard = (booking) => {
    const isToday = booking.date === selectedDate;
    const isPast = new Date(booking.date + 'T' + booking.time) < new Date();
    
    return (
      <Animated.View
        key={booking.id}
        style={{
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
          marginBottom: SPACING.md,
        }}
      >
        <Card style={{ 
          backgroundColor: 'white', 
          elevation: 3,
          borderLeftWidth: 4,
          borderLeftColor: getStatusColor(booking.status),
        }}>
          <Card.Content style={{ padding: SPACING.md }}>
            {/* Header Row */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: SPACING.sm 
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Avatar.Image 
                  size={50} 
                  source={{ uri: booking.clientAvatar }}
                />
                <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600', fontSize: 16 }]}>
                      {booking.clientName}
                    </Text>
                    {booking.isNewClient && (
                      <Chip
                        mode="flat"
                        compact
                        style={{ 
                          marginLeft: SPACING.xs,
                          backgroundColor: COLORS.success,
                        }}
                        textStyle={{ color: 'white', fontSize: 10 }}
                      >
                        New
                      </Chip>
                    )}
                  </View>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.primary, marginTop: 2 }]}>
                    {booking.serviceName}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: '#666', marginTop: 2 }]}>
                    📍 {booking.location}
                  </Text>
                </View>
              </View>
              
              <Menu
                visible={showMenuId === booking.id}
                onDismiss={() => setShowMenuId(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => setShowMenuId(booking.id)}
                  />
                }
              >
                <Menu.Item
                  leadingIcon="info"
                  title="View Details"
                  onPress={() => handleBookingAction(booking, 'details')}
                />
                {booking.status === 'pending' && (
                  <Menu.Item
                    leadingIcon="check"
                    title="Confirm"
                    onPress={() => handleBookingAction(booking, 'confirm')}
                  />
                )}
                {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                  <>
                    <Menu.Item
                      leadingIcon="schedule"
                      title="Reschedule"
                      onPress={() => handleBookingAction(booking, 'reschedule')}
                    />
                    <Menu.Item
                      leadingIcon="cancel"
                      title="Cancel"
                      titleStyle={{ color: COLORS.error }}
                      onPress={() => handleBookingAction(booking, 'cancel')}
                    />
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <Menu.Item
                    leadingIcon="task-alt"
                    title="Mark Complete"
                    onPress={() => handleBookingAction(booking, 'complete')}
                  />
                )}
                <Menu.Item
                  leadingIcon="note"
                  title="Session Notes"
                  onPress={() => handleBookingAction(booking, 'notes')}
                />
              </Menu>
            </View>

            {/* Time and Status Row */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.sm,
              paddingVertical: SPACING.xs,
              backgroundColor: isToday ? COLORS.primary + '10' : '#F8F8F8',
              paddingHorizontal: SPACING.sm,
              borderRadius: 8,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon 
                  name="access-time" 
                  size={16} 
                  color={isToday ? COLORS.primary : '#666'} 
                />
                <Text style={[
                  TEXT_STYLES.body, 
                  { 
                    marginLeft: 4,
                    fontWeight: '600',
                    color: isToday ? COLORS.primary : '#666'
                  }
                ]}>
                  {booking.date} at {booking.time}
                </Text>
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: '#666' }]}>
                  ({booking.duration}min)
                </Text>
              </View>
              
              <Chip
                mode="flat"
                compact
                icon={getStatusIcon(booking.status)}
                style={{ 
                  backgroundColor: getStatusColor(booking.status) + '20',
                }}
                textStyle={{ 
                  color: getStatusColor(booking.status),
                  fontSize: 12,
                  fontWeight: '600'
                }}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Chip>
            </View>

            {/* Additional Info */}
            {(booking.notes || booking.clientNotes) && (
              <View style={{ marginBottom: SPACING.sm }}>
                {booking.notes && (
                  <View style={{ 
                    backgroundColor: COLORS.primary + '10',
                    padding: SPACING.xs,
                    borderRadius: 6,
                    marginBottom: SPACING.xs,
                  }}>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: '600' }]}>
                      📝 Your Notes:
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: '#333', marginTop: 2 }]}>
                      {booking.notes}
                    </Text>
                  </View>
                )}
                
                {booking.clientNotes && (
                  <View style={{ 
                    backgroundColor: '#F0F0F0',
                    padding: SPACING.xs,
                    borderRadius: 6,
                  }}>
                    <Text style={[TEXT_STYLES.caption, { color: '#666', fontWeight: '600' }]}>
                      💬 Client Notes:
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: '#333', marginTop: 2 }]}>
                      {booking.clientNotes}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Action Buttons & Price */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: SPACING.sm,
              borderTopWidth: 1,
              borderTopColor: '#f0f0f0',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {booking.status === 'pending' && (
                  <Button
                    mode="contained"
                    compact
                    onPress={() => confirmBooking(booking.id)}
                    style={{ 
                      backgroundColor: COLORS.success,
                      marginRight: SPACING.sm,
                    }}
                  >
                    Confirm
                  </Button>
                )}
                
                {booking.status === 'confirmed' && !isPast && (
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleBookingAction(booking, 'reschedule')}
                    style={{ marginRight: SPACING.sm }}
                  >
                    Reschedule
                  </Button>
                )}

                {booking.status === 'completed' && booking.sessionRating && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="star" size={16} color="#FFD700" />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: 2, color: '#666' }]}>
                      {booking.sessionRating}/5
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={[TEXT_STYLES.heading, { color: COLORS.primary, fontSize: 18 }]}>
                ${booking.price}
              </Text>
            </View>

            {/* Reminder Status */}
            {!booking.reminderSent && booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <Surface style={{
                backgroundColor: '#FFF3CD',
                padding: SPACING.xs,
                borderRadius: 6,
                marginTop: SPACING.sm,
              }}>
                <Text style={[TEXT_STYLES.caption, { color: '#856404', textAlign: 'center' }]}>
                  ⚠️ Reminder not sent to client
                </Text>
              </Surface>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderDetailsModal = () => (
    <Portal>
      <Modal 
        visible={showDetailsModal} 
        onDismiss={() => setShowDetailsModal(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          padding: SPACING.lg,
          borderRadius: 12,
          maxHeight: '80%',
        }}
      >
        {selectedBooking && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[TEXT_STYLES.heading, { marginBottom: SPACING.md }]}>
              📋 Booking Details
            </Text>

            {/* Client Info */}
            <Surface style={{ padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                Client Information
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Avatar.Image size={60} source={{ uri: selectedBooking.clientAvatar }} />
                <View style={{ marginLeft: SPACING.md }}>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600', fontSize: 18 }]}>
                    {selectedBooking.clientName}
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: '#666' }]}>
                    📞 {selectedBooking.clientPhone}
                  </Text>
                  {selectedBooking.isNewClient && (
                    <Chip
                      mode="flat"
                      compact
                      style={{ 
                        backgroundColor: COLORS.success,
                        marginTop: 4,
                        alignSelf: 'flex-start',
                      }}
                      textStyle={{ color: 'white', fontSize: 10 }}
                    >
                      ✨ New Client
                    </Chip>
                  )}
                </View>
              </View>
              
              {selectedBooking.goals.length > 0 && (
                <>
                  <Text style={[TEXT_STYLES.caption, { fontWeight: '600', marginTop: SPACING.sm }]}>
                    Client Goals:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.xs }}>
                    {selectedBooking.goals.map((goal, index) => (
                      <Chip
                        key={index}
                        mode="outlined"
                        compact
                        style={{ marginRight: SPACING.xs, marginBottom: SPACING.xs }}
                      >
                        {goal}
                      </Chip>
                    ))}
                  </View>
                </>
              )}
            </Surface>

            {/* Session Details */}
            <Surface style={{ padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                Session Information
              </Text>
              
              <View style={{ marginBottom: SPACING.sm }}>
                <Text style={[TEXT_STYLES.body, { fontSize: 16, marginBottom: 4 }]}>
                  {selectedBooking.serviceName}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>
                  📅 {selectedBooking.date} at {selectedBooking.time}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>
                  ⏱️ {selectedBooking.duration} minutes
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>
                  📍 {selectedBooking.location}
                </Text>
                {selectedBooking.groupSize && (
                  <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>
                    👥 Group size: {selectedBooking.groupSize} participants
                  </Text>
                )}
              </View>

              <Chip
                mode="flat"
                icon={getStatusIcon(selectedBooking.status)}
                style={{ 
                  backgroundColor: getStatusColor(selectedBooking.status) + '20',
                  alignSelf: 'flex-start',
                }}
                textStyle={{ 
                  color: getStatusColor(selectedBooking.status),
                  fontWeight: '600'
                }}
              >
                {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
              </Chip>
            </Surface>

            {/* Equipment & Notes */}
            {(selectedBooking.equipment.length > 0 || selectedBooking.notes || selectedBooking.clientNotes) && (
              <Surface style={{ padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.md }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                  Additional Information
                </Text>
                
                {selectedBooking.equipment.length > 0 && (
                  <>
                    <Text style={[TEXT_STYLES.caption, { fontWeight: '600', marginBottom: SPACING.xs }]}>
                      Equipment Needed:
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
                      {selectedBooking.equipment.map((item, index) => (
                        <Chip
                          key={index}
                          mode="outlined"
                          compact
                          style={{ marginRight: SPACING.xs, marginBottom: SPACING.xs }}
                        >
                          {item}
                        </Chip>
                      ))}
                    </View>
                  </>
                )}

                {selectedBooking.notes && (
                  <View style={{ marginBottom: SPACING.sm }}>
                    <Text style={[TEXT_STYLES.caption, { fontWeight: '600', color: COLORS.primary }]}>
                      📝 Your Notes:
                    </Text>
                    <Text style={[TEXT_STYLES.body, { marginTop: 4 }]}>
                      {selectedBooking.notes}
                    </Text>
                  </View>
                )}

                {selectedBooking.clientNotes && (
                  <View>
                    <Text style={[TEXT_STYLES.caption, { fontWeight: '600', color: '#666' }]}>
                      💬 Client Notes:
                    </Text>
                    <Text style={[TEXT_STYLES.body, { marginTop: 4 }]}>
                      {selectedBooking.clientNotes}
                    </Text>
                  </View>
                )}
              </Surface>
            )}

            {/* Feedback (for completed sessions) */}
            {selectedBooking.status === 'completed' && (selectedBooking.sessionRating || selectedBooking.sessionFeedback) && (
              <Surface style={{ padding: SPACING.md, borderRadius: 8, marginBottom: SPACING.md }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                  Session Feedback
                </Text>
                
                {selectedBooking.sessionRating && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                    <Text style={[TEXT_STYLES.body, { marginRight: SPACING.sm }]}>Rating:</Text>
                    <View style={{ flexDirection: 'row' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          name="star"
                          size={20}
                          color={star <= selectedBooking.sessionRating ? '#FFD700' : '#E0E0E0'}
                        />
                      ))}
                    </View>
                    <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm }]}>
                      ({selectedBooking.sessionRating}/5)
                    </Text>
                  </View>
                )}

                {selectedBooking.sessionFeedback && (
                  <>
                    <Text style={[TEXT_STYLES.caption, { fontWeight: '600', marginBottom: SPACING.xs }]}>
                      Client Feedback:
                    </Text>
                    <Text style={[TEXT_STYLES.body, { fontStyle: 'italic' }]}>
                      "{selectedBooking.sessionFeedback}"
                    </Text>
                  </>
                )}
              </Surface>
            )}

            {/* Cancellation Info */}
            {selectedBooking.status === 'cancelled' && selectedBooking.cancellationReason && (
              <Surface style={{ 
                padding: SPACING.md, 
                borderRadius: 8, 
                backgroundColor: COLORS.error + '10',
                marginBottom: SPACING.md 
              }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.error, marginBottom: SPACING.sm }]}>
                  Cancellation Information
                </Text>
                <Text style={[TEXT_STYLES.body, { marginBottom: 4 }]}>
                  Reason: {selectedBooking.cancellationReason}
                </Text>
                {selectedBooking.cancellationTime && (
                  <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>
                    Cancelled on: {new Date(selectedBooking.cancellationTime).toLocaleString()}
                  </Text>
                )}
              </Surface>
            )}

            <Button
              mode="contained"
              onPress={() => setShowDetailsModal(false)}
              style={{ backgroundColor: COLORS.primary }}
            >
              Close
            </Button>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  const renderNotesModal = () => (
    <Portal>
      <Modal 
        visible={showNotesModal} 
        onDismiss={() => setShowNotesModal(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          padding: SPACING.lg,
          borderRadius: 12,
        }}
      >
        <Text style={[TEXT_STYLES.heading, { marginBottom: SPACING.md }]}>
          📝 Session Notes
        </Text>

        {selectedBooking && (
          <>
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.xs }]}>
                {selectedBooking.clientName} - {selectedBooking.serviceName}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>
                {selectedBooking.date} at {selectedBooking.time}
              </Text>
            </View>

            <Surface style={{
              borderWidth: 1,
              borderColor: '#E0E0E0',
              borderRadius: 8,
              padding: SPACING.sm,
              minHeight: 120,
              marginBottom: SPACING.md,
            }}>
              <TextInput
                multiline
                value={sessionNotes}
                onChangeText={setSessionNotes}
                placeholder="Add notes about this session... (progress, observations, next steps, etc.)"
                style={{
                  fontSize: 16,
                  textAlignVertical: 'top',
                  flex: 1,
                }}
              />
            </Surface>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => setShowNotesModal(false)}
                style={{ flex: 0.45 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={saveSessionNotes}
                loading={loading}
                style={{ flex: 0.45, backgroundColor: COLORS.primary }}
              >
                Save Notes
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );

  const renderRescheduleModal = () => (
    <Portal>
      <Modal 
        visible={showRescheduleModal} 
        onDismiss={() => setShowRescheduleModal(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          padding: SPACING.lg,
          borderRadius: 12,
        }}
      >
        <Text style={[TEXT_STYLES.heading, { marginBottom: SPACING.md }]}>
          📅 Reschedule Session
        </Text>

        {selectedBooking && (
          <>
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.xs }]}>
                {selectedBooking.clientName} - {selectedBooking.serviceName}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: '#666' }]}>
                Current: {selectedBooking.date} at {selectedBooking.time}
              </Text>
            </View>

            <Surface style={{
              padding: SPACING.md,
              borderRadius: 8,
              backgroundColor: '#F8F8F8',
              marginBottom: SPACING.md,
            }}>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', color: '#666' }]}>
                📅 Calendar integration coming soon!
              </Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', color: '#666', marginTop: SPACING.xs }]}>
                For now, please contact the client directly to reschedule.
              </Text>
            </Surface>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => setShowRescheduleModal(false)}
                style={{ flex: 0.45 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setShowRescheduleModal(false);
                  Alert.alert('Feature Coming Soon', 'Reschedule functionality will be available in the next update! 📅');
                }}
                style={{ flex: 0.45, backgroundColor: COLORS.primary }}
              >
                Contact Client
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: 50,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[TEXT_STYLES.heading, { color: 'white', fontSize: 24 }]}>
              Session Bookings
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'white', opacity: 0.9 }]}>
              📅 {bookingStats.todayBookings} today • {bookingStats.pendingBookings} pending
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon={viewMode === 'list' ? 'calendar-month' : 'list'}
              size={24}
              iconColor="white"
              onPress={() => {
                setViewMode(viewMode === 'list' ? 'calendar' : 'list');
                if (viewMode === 'calendar') {
                  Alert.alert('Feature Coming Soon', 'Calendar view will be available in the next update! 📅');
                }
              }}
            />
            <IconButton
              icon="analytics"
              size={24}
              iconColor="white"
              onPress={() => Alert.alert('Analytics', 'Booking analytics coming soon! 📊')}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        justifyContent: 'space-between',
      }}>
        <Surface style={{
          padding: SPACING.sm,
          borderRadius: 8,
          alignItems: 'center',
          flex: 1,
          marginRight: SPACING.xs,
          backgroundColor: COLORS.primary + '20',
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.primary }]}>
            {bookingStats.totalBookings}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>Total</Text>
        </Surface>
        
        <Surface style={{
          padding: SPACING.sm,
          borderRadius: 8,
          alignItems: 'center',
          flex: 1,
          marginHorizontal: SPACING.xs,
          backgroundColor: bookingStats.pendingBookings > 0 ? '#FFA500' + '20' : COLORS.success + '20',
        }}>
          <Text style={[TEXT_STYLES.body, { 
            fontWeight: '600', 
            color: bookingStats.pendingBookings > 0 ? '#FFA500' : COLORS.success 
          }]}>
            {bookingStats.pendingBookings}
          </Text>
          <Text style={[TEXT_STYLES.caption, { 
            color: bookingStats.pendingBookings > 0 ? '#FFA500' : COLORS.success 
          }]}>
            Pending
          </Text>
        </Surface>
        
        <Surface style={{
          padding: SPACING.sm,
          borderRadius: 8,
          alignItems: 'center',
          flex: 1,
          marginLeft: SPACING.xs,
          backgroundColor: COLORS.success + '20',
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.success }]}>
            ${bookingStats.totalRevenue}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>Revenue</Text>
        </Surface>
      </View>

      {/* Search and Filters */}
      <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
        <Searchbar
          placeholder="Search bookings..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ backgroundColor: 'white', elevation: 2, marginBottom: SPACING.sm }}
          iconColor={COLORS.primary}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: SPACING.lg }}
        >
          {filters.map((filter) => (
            <Chip
              key={filter.key}
              mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
              selected={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              style={{
                marginRight: SPACING.sm,
                backgroundColor: selectedFilter === filter.key ? COLORS.primary : 'white',
              }}
              textStyle={{
                color: selectedFilter === filter.key ? 'white' : COLORS.primary,
              }}
            >
              {filter.label} ({filter.count})
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingHorizontal: SPACING.lg,
          paddingBottom: 100 
        }}
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
        {loading && !refreshing ? (
          <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
            <ProgressBar 
              indeterminate 
              style={{ width: '60%' }} 
              color={COLORS.primary}
            />
            <Text style={[TEXT_STYLES.body, { marginTop: SPACING.sm, color: '#666' }]}>
              Loading bookings...
            </Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
            <Icon name="event-available" size={60} color="#CCC" />
            <Text style={[TEXT_STYLES.heading, { color: '#999', marginTop: SPACING.md }]}>
              No Bookings Found
            </Text>
            <Text style={[TEXT_STYLES.body, { color: '#666', textAlign: 'center', marginTop: SPACING.sm }]}>
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter' 
                : 'Your session bookings will appear here'}
            </Text>
          </View>
        ) : (
          <>
            {/* Today's Sessions Header */}
            {selectedFilter === 'all' && filteredBookings.some(b => b.date === selectedDate) && (
              <View style={{ marginBottom: SPACING.md }}>
                <Surface style={{
                  padding: SPACING.md,
                  borderRadius: 8,
                  backgroundColor: COLORS.primary + '10',
                }}>
                  <Text style={[TEXT_STYLES.body, { 
                    fontWeight: '600', 
                    color: COLORS.primary,
                    textAlign: 'center' 
                  }]}>
                    🗓️ Today's Sessions ({filteredBookings.filter(b => b.date === selectedDate).length})
                  </Text>
                </Surface>
              </View>
            )}
            
            {filteredBookings.map(renderBookingCard)}
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          transform: [{ scale: fabScale }],
        }}
      >
        <FAB
          icon="add"
          onPress={() => Alert.alert('Feature Coming Soon', 'Manual booking creation coming soon! ➕')}
          style={{ backgroundColor: COLORS.primary }}
        />
      </Animated.View>

      {/* Modals */}
      {renderDetailsModal()}
      {renderNotesModal()}
      {renderRescheduleModal()}
    </View>
  );
};

export default SessionBookings;