import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
  Animated,
  Platform,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Searchbar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System Imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SportsEvents = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading, events } = useSelector((state) => ({
    user: state.auth.user,
    isLoading: state.events.isLoading,
    events: state.events.sportsEvents || [],
  }));

  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for sports events
  const mockEvents = [
    {
      id: '1',
      title: 'City Marathon Championship',
      sport: 'Running',
      type: 'Competition',
      level: 'Open',
      date: '2024-03-15',
      time: '06:00 AM',
      location: 'Central Park, New York',
      distance: '2.5 km',
      participants: 1250,
      maxParticipants: 2000,
      entryFee: '$45',
      organizer: 'NYC Running Club',
      description: 'Annual city marathon with prizes for top finishers',
      image: 'https://via.placeholder.com/300x200',
      tags: ['Marathon', 'Competitive', 'Prizes'],
      registrationDeadline: '2024-03-10',
      difficulty: 'Intermediate',
      rating: 4.8,
      reviews: 234,
    },
    {
      id: '2',
      title: 'Youth Football Tournament',
      sport: 'Football',
      type: 'Tournament',
      level: 'U-18',
      date: '2024-03-20',
      time: '10:00 AM',
      location: 'Sports Complex, Miami',
      distance: '1.2 km',
      participants: 32,
      maxParticipants: 64,
      entryFee: '$120',
      organizer: 'Miami Youth Sports',
      description: 'Inter-school football tournament for under-18 players',
      image: 'https://via.placeholder.com/300x200',
      tags: ['Youth', 'Tournament', 'Schools'],
      registrationDeadline: '2024-03-15',
      difficulty: 'Beginner',
      rating: 4.6,
      reviews: 89,
    },
    {
      id: '3',
      title: 'Swimming Championship',
      sport: 'Swimming',
      type: 'Championship',
      level: 'Professional',
      date: '2024-03-25',
      time: '02:00 PM',
      location: 'Olympic Pool, Los Angeles',
      distance: '0.8 km',
      participants: 150,
      maxParticipants: 200,
      entryFee: '$80',
      organizer: 'California Swimming Federation',
      description: 'State-level swimming championship with Olympic standards',
      image: 'https://via.placeholder.com/300x200',
      tags: ['Professional', 'Championship', 'Olympics'],
      registrationDeadline: '2024-03-18',
      difficulty: 'Advanced',
      rating: 4.9,
      reviews: 156,
    },
    {
      id: '4',
      title: 'Basketball Skills Camp',
      sport: 'Basketball',
      type: 'Training',
      level: 'Youth',
      date: '2024-03-30',
      time: '09:00 AM',
      location: 'Indoor Arena, Chicago',
      distance: '0.5 km',
      participants: 45,
      maxParticipants: 60,
      entryFee: '$200',
      organizer: 'Elite Basketball Academy',
      description: '3-day intensive basketball skills development camp',
      image: 'https://via.placeholder.com/300x200',
      tags: ['Training', 'Skills', '3-Day Camp'],
      registrationDeadline: '2024-03-22',
      difficulty: 'Beginner',
      rating: 4.7,
      reviews: 78,
    },
  ];

  const sportsCategories = ['All', 'Running', 'Football', 'Basketball', 'Swimming', 'Tennis', 'Cycling'];
  const levelCategories = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Professional', 'Youth', 'Open', 'U-18'];
  const eventTypes = ['All', 'Competition', 'Tournament', 'Championship', 'Training', 'Workshop'];

  // Initialize animations
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

    setFilteredEvents(mockEvents);
  }, []);

  // Filter events
  useEffect(() => {
    let filtered = mockEvents;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSport !== 'All') {
      filtered = filtered.filter(event => event.sport === selectedSport);
    }

    if (selectedLevel !== 'All') {
      filtered = filtered.filter(event => event.level === selectedLevel);
    }

    if (selectedEventType !== 'All') {
      filtered = filtered.filter(event => event.type === selectedEventType);
    }

    setFilteredEvents(filtered);
  }, [searchQuery, selectedSport, selectedLevel, selectedEventType]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🔄 Events Updated', 'Latest sports events have been loaded!');
    }, 2000);
  }, []);

  const handleEventPress = (event) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🏆 Event Details',
      `Feature coming soon! You selected:\n${event.title}\n\nThis will show detailed event information, registration options, and connect with other participants.`
    );
  };

  const handleRegisterEvent = (event) => {
    Vibration.vibrate(100);
    Alert.alert(
      '📝 Event Registration',
      `Register for "${event.title}"?\n\nEntry Fee: ${event.entryFee}\nDeadline: ${event.registrationDeadline}\n\nThis feature is coming soon!`
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.primary;
      case 'Advanced': return COLORS.secondary;
      case 'Professional': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const renderFilterChip = (items, selected, onSelect) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: SPACING.sm }}>
      {items.map((item) => (
        <Chip
          key={item}
          selected={selected === item}
          onPress={() => onSelect(item)}
          style={{
            marginRight: SPACING.sm,
            backgroundColor: selected === item ? COLORS.primary : COLORS.background,
          }}
          textStyle={{
            color: selected === item ? '#fff' : COLORS.text,
            fontWeight: selected === item ? 'bold' : 'normal',
          }}
        >
          {item}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderEventCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <TouchableOpacity onPress={() => handleEventPress(item)} activeOpacity={0.8}>
        <Card style={{ margin: SPACING.xs, elevation: 4 }}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={{
              padding: SPACING.md,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.heading, { color: '#fff', fontSize: 18 }]}>
                  {item.title}
                </Text>
                <Text style={[TEXT_STYLES.body, { color: '#fff', opacity: 0.9, marginTop: 4 }]}>
                  {item.sport} • {item.type}
                </Text>
              </View>
              <Badge
                style={{
                  backgroundColor: getDifficultyColor(item.difficulty),
                  color: '#fff',
                }}
              >
                {item.level}
              </Badge>
            </View>
          </LinearGradient>

          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.xs, flex: 1 }]}>
                {item.date} at {item.time}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {item.rating} ({item.reviews})
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Icon name="location-on" size={16} color={COLORS.error} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.xs, flex: 1 }]}>
                {item.location}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: 'bold' }]}>
                {item.entryFee}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <Icon name="group" size={16} color={COLORS.secondary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                {item.participants}/{item.maxParticipants} participants
              </Text>
            </View>

            <ProgressBar
              progress={item.participants / item.maxParticipants}
              color={COLORS.primary}
              style={{ marginBottom: SPACING.sm, height: 4 }}
            />

            <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.sm, color: COLORS.textSecondary }]}>
              {item.description}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {item.tags.map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  compact
                  style={{
                    marginRight: SPACING.xs,
                    backgroundColor: COLORS.background,
                    height: 24,
                  }}
                  textStyle={{ fontSize: 10 }}
                >
                  {tag}
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>

          <Card.Actions style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.md }}>
            <Button
              mode="outlined"
              onPress={() => handleEventPress(item)}
              style={{ flex: 1, marginRight: SPACING.sm }}
            >
              Details
            </Button>
            <Button
              mode="contained"
              onPress={() => handleRegisterEvent(item)}
              style={{ flex: 1 }}
              buttonColor={COLORS.primary}
            >
              Register
            </Button>
          </Card.Actions>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFiltersModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 12,
          padding: SPACING.lg,
        }}
      >
        <Text style={[TEXT_STYLES.heading, { marginBottom: SPACING.md }]}>
          🎯 Filter Events
        </Text>

        <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.sm }]}>
          Sport Category
        </Text>
        {renderFilterChip(sportsCategories, selectedSport, setSelectedSport)}

        <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.sm, marginTop: SPACING.md }]}>
          Skill Level
        </Text>
        {renderFilterChip(levelCategories, selectedLevel, setSelectedLevel)}

        <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.sm, marginTop: SPACING.md }]}>
          Event Type
        </Text>
        {renderFilterChip(eventTypes, selectedEventType, setSelectedEventType)}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.lg }}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedSport('All');
              setSelectedLevel('All');
              setSelectedEventType('All');
            }}
            style={{ flex: 1, marginRight: SPACING.sm }}
          >
            Clear All
          </Button>
          <Button
            mode="contained"
            onPress={() => setShowFilters(false)}
            style={{ flex: 1 }}
            buttonColor={COLORS.primary}
          >
            Apply Filters
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.heading, { color: '#fff', fontSize: 24, flex: 1 }]}>
            🏆 Sports Events
          </Text>
          <IconButton
            icon="tune"
            iconColor="#fff"
            size={24}
            onPress={() => setShowFilters(true)}
          />
          <IconButton
            icon={viewMode === 'list' ? 'view-module' : 'view-list'}
            iconColor="#fff"
            size={24}
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          />
        </View>

        <Searchbar
          placeholder="Search events, sports, locations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            elevation: 4,
          }}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.text }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: SPACING.md }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              marginRight: SPACING.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => Alert.alert('📍 Location', 'Location-based filtering coming soon!')}
          >
            <Icon name="near-me" size={16} color="#fff" />
            <Text style={[TEXT_STYLES.body, { color: '#fff', marginLeft: 4 }]}>
              Near Me
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              marginRight: SPACING.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => Alert.alert('📅 This Week', 'Date filtering coming soon!')}
          >
            <Icon name="event" size={16} color="#fff" />
            <Text style={[TEXT_STYLES.body, { color: '#fff', marginLeft: 4 }]}>
              This Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => Alert.alert('🆓 Free Events', 'Free events filtering coming soon!')}
          >
            <Icon name="money-off" size={16} color="#fff" />
            <Text style={[TEXT_STYLES.body, { color: '#fff', marginLeft: 4 }]}>
              Free
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      <View style={{ flex: 1, paddingHorizontal: SPACING.sm }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.md,
        }}>
          <Text style={[TEXT_STYLES.body, { flex: 1 }]}>
            {filteredEvents.length} events found
          </Text>
          {(selectedSport !== 'All' || selectedLevel !== 'All' || selectedEventType !== 'All') && (
            <Chip
              onPress={() => {
                setSelectedSport('All');
                setSelectedLevel('All');
                setSelectedEventType('All');
              }}
              style={{ backgroundColor: COLORS.primary }}
              textStyle={{ color: '#fff' }}
            >
              Clear Filters
            </Chip>
          )}
        </View>

        <FlatList
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: SPACING.xl,
            }}>
              <Icon name="event-busy" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.heading, {
                marginTop: SPACING.md,
                color: COLORS.textSecondary,
                textAlign: 'center',
              }]}>
                No Events Found
              </Text>
              <Text style={[TEXT_STYLES.body, {
                marginTop: SPACING.sm,
                color: COLORS.textSecondary,
                textAlign: 'center',
              }]}>
                Try adjusting your search or filters to find more events
              </Text>
            </View>
          }
        />
      </View>

      {renderFiltersModal()}

      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('➕ Create Event', 'Event creation feature coming soon! This will allow you to organize your own sports events.')}
      />
    </View>
  );
};

export default SportsEvents;