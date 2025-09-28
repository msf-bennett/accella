import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Vibration,
  StatusBar,
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
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const UpcomingSessions = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, sessions, isLoading } = useSelector(state => ({
    user: state.auth.user,
    sessions: state.sessions.upcomingSessions,
    isLoading: state.sessions.loading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedSession, setSelectedSession] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookedSessions, setBookedSessions] = useState(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const filterScrollRef = useRef(null);

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
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

  const bookSession = (session) => {
    Vibration.vibrate([50, 100, 50]);
    setBookedSessions(new Set([...bookedSessions, session.id]));
    setSelectedSession(session);
    setShowBookingModal(true);
    
    // Dispatch booking action
    dispatch({
      type: 'BOOK_SESSION',
      payload: { sessionId: session.id, bookedAt: new Date().toISOString() }
    });
  };

  const cancelBooking = (sessionId) => {
    Alert.alert(
      '❌ Cancel Booking',
      'Are you sure you want to cancel this session booking?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        { 
          text: 'Cancel Booking', 
          style: 'destructive',
          onPress: () => {
            const newBooked = new Set(bookedSessions);
            newBooked.delete(sessionId);
            setBookedSessions(newBooked);
            Vibration.vibrate(100);
          }
        }
      ]
    );
  };

  // Mock data - in real app this would come from Redux store
  const mockSessions = [
    {
      id: 1,
      title: 'Advanced Soccer Training ⚽',
      coach: 'Coach Martinez',
      date: '2024-08-26',
      time: '09:00 AM',
      duration: 90,
      location: 'Main Field',
      type: 'Group Training',
      sport: 'Soccer',
      difficulty: 'Advanced',
      maxParticipants: 20,
      currentParticipants: 15,
      price: 25,
      description: 'Intensive training focusing on ball control, passing accuracy, and tactical positioning.',
      equipment: ['Soccer boots', 'Shin guards', 'Water bottle'],
      status: 'available'
    },
    {
      id: 2,
      title: 'Personal Training Session 💪',
      coach: 'Coach Sarah',
      date: '2024-08-27',
      time: '02:00 PM',
      duration: 60,
      location: 'Gym A',
      type: 'Personal Training',
      sport: 'Fitness',
      difficulty: 'Medium',
      maxParticipants: 1,
      currentParticipants: 0,
      price: 75,
      description: 'One-on-one strength and conditioning session tailored to your goals.',
      equipment: ['Gym towel', 'Water bottle'],
      status: 'available'
    },
    {
      id: 3,
      title: 'Basketball Skills Workshop 🏀',
      coach: 'Coach Johnson',
      date: '2024-08-28',
      time: '11:00 AM',
      duration: 120,
      location: 'Indoor Court',
      type: 'Workshop',
      sport: 'Basketball',
      difficulty: 'Intermediate',
      maxParticipants: 16,
      currentParticipants: 12,
      price: 35,
      description: 'Comprehensive skills workshop covering shooting, dribbling, and defensive techniques.',
      equipment: ['Basketball shoes', 'Sports attire', 'Water bottle'],
      status: 'available'
    },
    {
      id: 4,
      title: 'Tennis Technique Clinic 🎾',
      coach: 'Coach Williams',
      date: '2024-08-29',
      time: '04:00 PM',
      duration: 75,
      location: 'Court 1',
      type: 'Clinic',
      sport: 'Tennis',
      difficulty: 'Beginner',
      maxParticipants: 8,
      currentParticipants: 8,
      price: 40,
      description: 'Focus on proper form and technique for forehand, backhand, and serve.',
      equipment: ['Tennis racket', 'Tennis shoes', 'Towel'],
      status: 'full'
    },
    {
      id: 5,
      title: 'Swimming Endurance Training 🏊‍♂️',
      coach: 'Coach Thompson',
      date: '2024-08-30',
      time: '07:00 AM',
      duration: 60,
      location: 'Pool',
      type: 'Group Training',
      sport: 'Swimming',
      difficulty: 'Hard',
      maxParticipants: 12,
      currentParticipants: 8,
      price: 30,
      description: 'Build swimming endurance with interval training and technique refinement.',
      equipment: ['Swimwear', 'Goggles', 'Towel'],
      status: 'available'
    }
  ];

  const currentSessions = sessions || mockSessions;
  
  const filterOptions = [
    { key: 'all', label: 'All Sessions', icon: 'view-list' },
    { key: 'available', label: 'Available', icon: 'event-available' },
    { key: 'booked', label: 'My Bookings', icon: 'bookmark' },
    { key: 'soccer', label: 'Soccer', icon: 'sports-soccer' },
    { key: 'fitness', label: 'Fitness', icon: 'fitness-center' },
    { key: 'basketball', label: 'Basketball', icon: 'sports-basketball' },
    { key: 'tennis', label: 'Tennis', icon: 'sports-tennis' },
    { key: 'swimming', label: 'Swimming', icon: 'pool' },
  ];

  const filteredSessions = currentSessions.filter(session => {
    // Search filter
    if (searchQuery && !session.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !session.coach.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !session.sport.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'available') return session.status === 'available';
    if (selectedFilter === 'booked') return bookedSessions.has(session.id);
    return session.sport.toLowerCase() === selectedFilter.toLowerCase();
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': 
      case 'medium': return '#FFA726';
      case 'advanced':
      case 'hard': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getSportIcon = (sport) => {
    switch (sport.toLowerCase()) {
      case 'soccer': return 'sports-soccer';
      case 'basketball': return 'sports-basketball';
      case 'tennis': return 'sports-tennis';
      case 'swimming': return 'pool';
      case 'fitness': return 'fitness-center';
      default: return 'sports';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return COLORS.success;
      case 'full': return COLORS.error;
      case 'cancelled': return COLORS.textSecondary;
      default: return COLORS.primary;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderFilterChip = (filter, index) => (
    <Chip
      key={filter.key}
      selected={selectedFilter === filter.key}
      onPress={() => setSelectedFilter(filter.key)}
      style={{
        marginRight: SPACING.sm,
        backgroundColor: selectedFilter === filter.key ? COLORS.primary : COLORS.background,
      }}
      textStyle={{
        color: selectedFilter === filter.key ? 'white' : COLORS.text,
        fontSize: 12,
      }}
      icon={filter.icon}
    >
      {filter.label}
    </Chip>
  );

  const renderSessionCard = ({ item: session, index }) => {
    const isBooked = bookedSessions.has(session.id);
    const availabilityPercentage = (session.currentParticipants / session.maxParticipants) * 100;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ 
            translateY: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 50 + (index * 10)],
            })
          }],
          marginBottom: SPACING.md,
        }}
      >
        <Card style={{
          marginHorizontal: SPACING.md,
          elevation: 4,
          opacity: session.status === 'full' ? 0.7 : 1,
        }}>
          <LinearGradient
            colors={isBooked ? ['#4CAF50', '#45a049'] : ['#667eea', '#764ba2']}
            style={{
              padding: SPACING.md,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                  {session.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
                  {session.coach}
                </Text>
              </View>
              <Avatar.Icon
                size={40}
                icon={getSportIcon(session.sport)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: SPACING.sm,
            }}>
              <MaterialIcons name="event" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)', marginLeft: 4 }]}>
                {formatDate(session.date)} • {session.time}
              </Text>
            </View>
          </LinearGradient>

          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.sm,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="access-time" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.body, { marginLeft: 4, color: COLORS.textSecondary }]}>
                  {session.duration} min
                </Text>
                <MaterialIcons name="location-on" size={16} color={COLORS.textSecondary} style={{ marginLeft: SPACING.sm }} />
                <Text style={[TEXT_STYLES.body, { marginLeft: 4, color: COLORS.textSecondary }]}>
                  {session.location}
                </Text>
              </View>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                ${session.price}
              </Text>
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: SPACING.sm,
            }}>
              <Chip
                mode="outlined"
                textStyle={{ fontSize: 12 }}
                style={{
                  backgroundColor: getDifficultyColor(session.difficulty) + '20',
                  borderColor: getDifficultyColor(session.difficulty),
                  marginRight: SPACING.sm,
                }}
              >
                {session.difficulty}
              </Chip>
              <Chip
                mode="outlined"
                textStyle={{ fontSize: 12 }}
                style={{
                  backgroundColor: getStatusColor(session.status) + '20',
                  borderColor: getStatusColor(session.status),
                }}
              >
                {session.type}
              </Chip>
            </View>

            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
              {session.description}
            </Text>

            {/* Availability Bar */}
            <View style={{ marginBottom: SPACING.sm }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Availability
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {session.currentParticipants}/{session.maxParticipants}
                </Text>
              </View>
              <View style={{
                height: 6,
                backgroundColor: COLORS.background,
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <View style={{
                  height: '100%',
                  width: `${availabilityPercentage}%`,
                  backgroundColor: availabilityPercentage > 80 ? COLORS.error : COLORS.success,
                }} />
              </View>
            </View>

            {/* Equipment */}
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: 4 }]}>
                Required Equipment:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {session.equipment.map((item, index) => (
                  <Surface
                    key={index}
                    style={{
                      paddingHorizontal: SPACING.sm,
                      paddingVertical: 2,
                      borderRadius: 12,
                      marginRight: SPACING.xs,
                      marginBottom: 4,
                      backgroundColor: COLORS.primary + '10',
                    }}
                  >
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                      {item}
                    </Text>
                  </Surface>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('SessionDetails', { session })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.sm,
                }}
              >
                <MaterialIcons name="info" size={20} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.body, { color: COLORS.primary, marginLeft: 4 }]}>
                  Details
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row' }}>
                {isBooked ? (
                  <Button
                    mode="outlined"
                    onPress={() => cancelBooking(session.id)}
                    style={{ marginRight: SPACING.sm }}
                    labelStyle={{ fontSize: 12 }}
                    textColor={COLORS.error}
                  >
                    Cancel
                  </Button>
                ) : session.status === 'full' ? (
                  <Button
                    mode="outlined"
                    disabled
                    style={{ marginRight: SPACING.sm }}
                    labelStyle={{ fontSize: 12 }}
                  >
                    Full
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    onPress={() => bookSession(session)}
                    buttonColor={COLORS.primary}
                    labelStyle={{ fontSize: 12 }}
                  >
                    Book Now
                  </Button>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: SPACING.md,
        }}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
              Upcoming Sessions 📅
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
              Book your next training session
            </Text>
          </View>
          <IconButton
            icon={viewMode === 'list' ? 'view-module' : 'view-list'}
            iconColor="white"
            size={24}
            onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          />
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search sessions, coaches, sports..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            elevation: 0,
          }}
          inputStyle={{ fontSize: 14 }}
          iconColor={COLORS.primary}
        />
      </LinearGradient>

      {/* Filter Chips */}
      <View style={{ paddingVertical: SPACING.md }}>
        <FlatList
          ref={filterScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item.key}
          renderItem={({ item, index }) => renderFilterChip(item, index)}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        />
      </View>

      {/* Session List */}
      <FlatList
        data={filteredSessions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSessionCard}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: SPACING.xl,
          }}>
            <MaterialIcons name="event-busy" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
              No sessions found
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' }]}>
              Try adjusting your filters or check back later
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Floating Action Button */}
      <FAB
        icon="filter-list"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Alert.alert(
            '🔍 Advanced Filters',
            'Feature Coming Soon!',
            [{ text: 'OK' }]
          );
        }}
      />

      {/* Booking Success Modal */}
      <Portal>
        {showBookingModal && (
          <BlurView
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            blurType="light"
            blurAmount={10}
          >
            <Surface style={{
              margin: SPACING.lg,
              padding: SPACING.xl,
              borderRadius: 16,
              alignItems: 'center',
              elevation: 8,
            }}>
              <MaterialIcons name="event-available" size={64} color={COLORS.success} />
              <Text style={[TEXT_STYLES.h2, { color: COLORS.success, marginTop: SPACING.md }]}>
                Booking Confirmed! 🎉
              </Text>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
                You've successfully booked:
              </Text>
              <Text style={[TEXT_STYLES.subtitle, { color: COLORS.primary, marginTop: SPACING.sm, textAlign: 'center' }]}>
                {selectedSession?.title}
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginTop: SPACING.xs, textAlign: 'center' }]}>
                {formatDate(selectedSession?.date)} at {selectedSession?.time}
              </Text>
              <Button
                mode="contained"
                onPress={() => setShowBookingModal(false)}
                style={{ marginTop: SPACING.lg }}
                buttonColor={COLORS.primary}
              >
                Got it!
              </Button>
            </Surface>
          </BlurView>
        )}
      </Portal>
    </View>
  );
};

export default UpcomingSessions;
