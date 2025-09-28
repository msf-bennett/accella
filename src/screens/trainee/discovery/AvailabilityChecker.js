import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Searchbar,
  Button,
  Chip,
  Avatar,
  Surface,
  IconButton,
  FAB,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const AvailabilityChecker = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { availability, loading } = useSelector(state => state.availability || {});

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGym, setSelectedGym] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); // calendar, list, gym
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Time slots for gym availability
  const timeSlots = [
    { id: 'early-morning', label: 'Early Morning', time: '5:00 - 8:00 AM', icon: 'wb-sunny', busy: 30 },
    { id: 'morning', label: 'Morning', time: '8:00 - 11:00 AM', icon: 'wb-sunny', busy: 60 },
    { id: 'midday', label: 'Midday', time: '11:00 AM - 2:00 PM', icon: 'wb-sunny', busy: 40 },
    { id: 'afternoon', label: 'Afternoon', time: '2:00 - 5:00 PM', icon: 'wb-cloudy', busy: 70 },
    { id: 'evening', label: 'Evening', time: '5:00 - 8:00 PM', icon: 'wb-twilight', busy: 90 },
    { id: 'night', label: 'Night', time: '8:00 - 11:00 PM', icon: 'brightness-3', busy: 45 },
  ];

  // Mock gym data with availability
  const [gymsData] = useState([
    {
      id: '1',
      name: 'Iron Paradise Gym',
      location: 'Westlands, Nairobi',
      image: 'https://via.placeholder.com/100x100',
      rating: 4.8,
      capacity: 80,
      currentOccupancy: 24,
      facilities: ['Free Weights', 'Cardio', 'Sauna'],
      openHours: '5:00 AM - 11:00 PM',
      peakHours: ['5:00-8:00 PM'],
      classes: [
        { time: '6:00 AM', name: 'Morning Strength', spots: 12, booked: 8 },
        { time: '7:00 PM', name: 'Evening HIIT', spots: 15, booked: 15 },
        { time: '8:00 PM', name: 'Powerlifting', spots: 10, booked: 6 },
      ],
    },
    {
      id: '2',
      name: 'FitZone 24/7',
      location: 'Karen, Nairobi',
      image: 'https://via.placeholder.com/100x100',
      rating: 4.6,
      capacity: 60,
      currentOccupancy: 15,
      facilities: ['Cardio Machines', 'Weight Machines'],
      openHours: '24/7',
      peakHours: ['6:00-9:00 AM', '5:00-8:00 PM'],
      classes: [
        { time: '7:00 AM', name: 'Morning Cardio', spots: 20, booked: 12 },
        { time: '6:00 PM', name: 'Circuit Training', spots: 16, booked: 14 },
      ],
    },
    {
      id: '3',
      name: 'CrossFit Warriors Box',
      location: 'Kilimani, Nairobi',
      image: 'https://via.placeholder.com/100x100',
      rating: 4.9,
      capacity: 25,
      currentOccupancy: 8,
      facilities: ['CrossFit Equipment', 'Olympic Weights'],
      openHours: '5:30 AM - 10:00 PM',
      peakHours: ['6:00-8:00 AM', '6:00-8:00 PM'],
      classes: [
        { time: '6:00 AM', name: 'WOD Morning', spots: 12, booked: 10 },
        { time: '12:00 PM', name: 'Lunch WOD', spots: 8, booked: 3 },
        { time: '7:00 PM', name: 'WOD Evening', spots: 15, booked: 12 },
      ],
    },
  ]);

  const [filteredGyms, setFilteredGyms] = useState(gymsData);

  // Calendar marked dates
  const getMarkedDates = () => {
    const marked = {};
    // Mark today
    const today = new Date().toISOString().split('T')[0];
    marked[today] = { 
      selected: false, 
      marked: true, 
      dotColor: COLORS.success,
      customStyles: {
        text: { color: COLORS.primary, fontWeight: 'bold' }
      }
    };
    
    // Mark selected date
    marked[selectedDate] = {
      selected: true,
      selectedColor: COLORS.primary,
      selectedTextColor: '#FFFFFF'
    };
    
    return marked;
  };

  useEffect(() => {
    filterGyms();
  }, [searchQuery]);

  const filterGyms = useCallback(() => {
    let filtered = gymsData;
    if (searchQuery) {
      filtered = filtered.filter(gym =>
        gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredGyms(filtered);
  }, [searchQuery, gymsData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Availability data updated! 📅');
    }, 2000);
  }, []);

  const getBusyLevel = (percentage) => {
    if (percentage <= 40) return { color: COLORS.success, label: 'Low' };
    if (percentage <= 70) return { color: '#FFC107', label: 'Medium' };
    return { color: COLORS.error, label: 'High' };
  };

  const getOccupancyLevel = (current, capacity) => {
    const percentage = (current / capacity) * 100;
    return getBusyLevel(percentage);
  };

  const handleBookSlot = (gym, timeSlot) => {
    Alert.alert(
      'Book Time Slot',
      `Book ${timeSlot.label} slot at ${gym.name}?\n\nBooking system coming soon! 🎯`,
      [{ text: 'Cancel' }, { text: 'Book' }]
    );
  };

  const handleJoinClass = (gym, classItem) => {
    if (classItem.booked >= classItem.spots) {
      Alert.alert(
        'Class Full',
        `${classItem.name} is fully booked.\n\nWould you like to join the waitlist?`,
        [{ text: 'Cancel' }, { text: 'Join Waitlist' }]
      );
    } else {
      Alert.alert(
        'Join Class',
        `Join ${classItem.name} at ${gym.name}?\n\nClass booking coming soon! 💪`,
        [{ text: 'Cancel' }, { text: 'Join Class' }]
      );
    }
  };

  const renderViewModeButtons = () => (
    <View style={styles.viewModeContainer}>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'calendar' && styles.activeViewMode]}
        onPress={() => setViewMode('calendar')}
      >
        <Icon name="calendar-today" size={20} color={viewMode === 'calendar' ? '#FFFFFF' : COLORS.primary} />
        <Text style={[styles.viewModeText, viewMode === 'calendar' && styles.activeViewModeText]}>
          Calendar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
        onPress={() => setViewMode('list')}
      >
        <Icon name="view-list" size={20} color={viewMode === 'list' ? '#FFFFFF' : COLORS.primary} />
        <Text style={[styles.viewModeText, viewMode === 'list' && styles.activeViewModeText]}>
          Time Slots
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'gym' && styles.activeViewMode]}
        onPress={() => setViewMode('gym')}
      >
        <Icon name="fitness-center" size={20} color={viewMode === 'gym' ? '#FFFFFF' : COLORS.primary} />
        <Text style={[styles.viewModeText, viewMode === 'gym' && styles.activeViewModeText]}>
          Gyms
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimeSlot = ({ item }) => {
    const busyLevel = getBusyLevel(item.busy);
    return (
      <Card style={styles.timeSlotCard}>
        <Card.Content style={styles.timeSlotContent}>
          <View style={styles.timeSlotHeader}>
            <View style={styles.timeSlotInfo}>
              <Icon name={item.icon} size={24} color={COLORS.primary} />
              <View style={styles.timeSlotDetails}>
                <Text style={styles.timeSlotLabel}>{item.label}</Text>
                <Text style={styles.timeSlotTime}>{item.time}</Text>
              </View>
            </View>
            <View style={styles.busyIndicator}>
              <Text style={[styles.busyLevel, { color: busyLevel.color }]}>
                {busyLevel.label}
              </Text>
              <ProgressBar
                progress={item.busy / 100}
                color={busyLevel.color}
                style={styles.busyProgress}
              />
            </View>
          </View>
          <Button
            mode="contained"
            onPress={() => handleBookSlot({ name: 'Selected Gym' }, item)}
            style={[styles.bookSlotButton, { backgroundColor: busyLevel.color }]}
            disabled={item.busy > 90}
          >
            {item.busy > 90 ? 'Fully Booked' : 'Book Slot'}
          </Button>
        </Card.Content>
      </Card>
    );
  };

  const renderGymCard = ({ item }) => {
    const occupancyLevel = getOccupancyLevel(item.currentOccupancy, item.capacity);
    const occupancyPercentage = (item.currentOccupancy / item.capacity) * 100;

    return (
      <Card style={styles.gymCard}>
        <Card.Content style={styles.gymContent}>
          <View style={styles.gymHeader}>
            <Avatar.Image source={{ uri: item.image }} size={50} />
            <View style={styles.gymInfo}>
              <Text style={styles.gymName}>{item.name}</Text>
              <Text style={styles.gymLocation}>{item.location}</Text>
              <View style={styles.gymRating}>
                <Icon name="star" size={16} color="#FFC107" />
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
            </View>
            <View style={styles.occupancyBadge}>
              <Badge style={[styles.badge, { backgroundColor: occupancyLevel.color }]}>
                {item.currentOccupancy}/{item.capacity}
              </Badge>
            </View>
          </View>

          <View style={styles.occupancySection}>
            <Text style={styles.occupancyLabel}>Current Occupancy</Text>
            <ProgressBar
              progress={occupancyPercentage / 100}
              color={occupancyLevel.color}
              style={styles.occupancyProgress}
            />
            <Text style={[styles.occupancyText, { color: occupancyLevel.color }]}>
              {Math.round(occupancyPercentage)}% - {occupancyLevel.label} Traffic
            </Text>
          </View>

          <View style={styles.facilitiesSection}>
            <Text style={styles.facilitiesLabel}>Available Facilities</Text>
            <View style={styles.facilitiesRow}>
              {item.facilities.map((facility, index) => (
                <Chip key={index} compact style={styles.facilityChip}>
                  {facility}
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.classesSection}>
            <Text style={styles.classesLabel}>Today's Classes</Text>
            {item.classes.map((classItem, index) => (
              <TouchableOpacity
                key={index}
                style={styles.classItem}
                onPress={() => handleJoinClass(item, classItem)}
              >
                <View style={styles.classInfo}>
                  <Text style={styles.classTime}>{classItem.time}</Text>
                  <Text style={styles.className}>{classItem.name}</Text>
                </View>
                <View style={styles.classAvailability}>
                  <Text style={[
                    styles.spotsText,
                    classItem.booked >= classItem.spots && { color: COLORS.error }
                  ]}>
                    {classItem.booked}/{classItem.spots} spots
                  </Text>
                  {classItem.booked >= classItem.spots && (
                    <Icon name="people" size={16} color={COLORS.error} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderCalendarView = () => (
    <View style={styles.calendarSection}>
      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates()}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: COLORS.textSecondary,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: COLORS.primary,
          dayTextColor: COLORS.textPrimary,
          textDisabledColor: COLORS.textSecondary,
          dotColor: COLORS.primary,
          selectedDotColor: '#ffffff',
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.textPrimary,
          indicatorColor: COLORS.primary,
        }}
        style={styles.calendar}
      />
      <Text style={styles.selectedDateText}>
        Selected Date: {new Date(selectedDate).toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Check Availability</Text>
        <Text style={styles.headerSubtitle}>
          Find the perfect time for your workout 📅
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search gyms or classes..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            icon="search"
          />
        </View>

        {/* View Mode Buttons */}
        {renderViewModeButtons()}

        {/* Calendar View */}
        {viewMode === 'calendar' && renderCalendarView()}

        {/* Time Slots View */}
        {viewMode === 'list' && (
          <View style={styles.timeSlotsSection}>
            <Text style={styles.sectionTitle}>Available Time Slots</Text>
            <FlatList
              data={timeSlots}
              renderItem={renderTimeSlot}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Gyms View */}
        {viewMode === 'gym' && (
          <View style={styles.gymsSection}>
            <Text style={styles.sectionTitle}>Gym Availability</Text>
            <FlatList
              data={filteredGyms}
              renderItem={renderGymCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.gymsList}
            />
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Text style={styles.statsTitle}>Quick Stats 📊</Text>
          <View style={styles.statsGrid}>
            <Surface style={styles.statCard} elevation={2}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Gyms Available</Text>
            </Surface>
            <Surface style={styles.statCard} elevation={2}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Classes Today</Text>
            </Surface>
            <Surface style={styles.statCard} elevation={2}>
              <Text style={styles.statNumber}>45%</Text>
              <Text style={styles.statLabel}>Avg Occupancy</Text>
            </Surface>
            <Surface style={styles.statCard} elevation={2}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Open Spots</Text>
            </Surface>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="bookmark"
        style={styles.fab}
        onPress={() => Alert.alert('My Bookings', 'View your bookings feature coming soon!')}
        label="My Bookings"
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    justifyContent: 'space-around',
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  activeViewMode: {
    backgroundColor: COLORS.primary,
  },
  viewModeText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  activeViewModeText: {
    color: '#FFFFFF',
  },
  calendarSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  calendar: {
    borderRadius: 12,
    elevation: 3,
    marginBottom: SPACING.md,
  },
  selectedDateText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  timeSlotsSection: {
    paddingBottom: SPACING.lg,
  },
  timeSlotCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  timeSlotContent: {
    padding: SPACING.md,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  timeSlotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeSlotDetails: {
    marginLeft: SPACING.sm,
  },
  timeSlotLabel: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
  },
  timeSlotTime: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  busyIndicator: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  busyLevel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  busyProgress: {
    width: 60,
    height: 4,
  },
  bookSlotButton: {
    borderRadius: 20,
  },
  gymsSection: {
    paddingBottom: SPACING.lg,
  },
  gymsList: {
    paddingHorizontal: SPACING.md,
  },
  gymCard: {
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  gymContent: {
    padding: SPACING.md,
  },
  gymHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  gymInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  gymName: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
  },
  gymLocation: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  gymRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  rating: {
    ...TEXT_STYLES.body,
    marginLeft: 4,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  occupancyBadge: {
    alignItems: 'flex-end',
  },
  badge: {
    color: '#FFFFFF',
  },
  occupancySection: {
    marginBottom: SPACING.md,
  },
  occupancyLabel: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  occupancyProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  occupancyText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  facilitiesSection: {
    marginBottom: SPACING.md,
  },
  facilitiesLabel: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primary + '20',
  },
  classesSection: {
    marginTop: SPACING.sm,
  },
  classesLabel: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  classInfo: {
    flex: 1,
  },
  classTime: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  className: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
  },
  classAvailability: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  quickStats: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
    marginTop: SPACING.lg,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - SPACING.md * 3) / 2,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default AvailabilityChecker;
