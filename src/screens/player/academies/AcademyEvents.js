import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Image,
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
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  border: '#e1e8ed',
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
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textLight },
  small: { fontSize: 12, color: COLORS.textLight },
};

const { width: screenWidth } = Dimensions.get('window');

const AcademyEvents = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { academy } = route.params || {};
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  
  // State
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [favoriteEvents, setFavoriteEvents] = useState(new Set());

  // Mock data for events
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Youth Football Tournament 2025',
      type: 'tournament',
      date: '2025-09-15',
      time: '09:00 AM',
      duration: '3 days',
      location: 'Main Stadium',
      description: 'Annual youth football tournament for all age groups. Great opportunity to showcase skills and compete with other academies.',
      price: 'Free',
      maxParticipants: 120,
      currentParticipants: 87,
      ageGroup: '8-18 years',
      skillLevel: 'All levels',
      image: null,
      organizer: 'Elite Sports Academy',
      tags: ['tournament', 'football', 'youth'],
      requirements: ['Valid medical certificate', 'Registration form', 'Sports equipment'],
      prizes: ['Trophies for top 3 teams', 'Individual awards', 'Certificates'],
      status: 'upcoming',
    },
    {
      id: 2,
      title: 'Summer Training Camp',
      type: 'camp',
      date: '2025-08-20',
      time: '08:00 AM',
      duration: '5 days',
      location: 'Training Complex',
      description: 'Intensive 5-day training camp focusing on technical skills, fitness, and teamwork. Led by professional coaches.',
      price: '$299',
      maxParticipants: 50,
      currentParticipants: 32,
      ageGroup: '12-16 years',
      skillLevel: 'Intermediate to Advanced',
      image: null,
      organizer: 'Elite Sports Academy',
      tags: ['camp', 'training', 'skills'],
      requirements: ['Intermediate skill level', 'Own equipment', 'Lunch included'],
      prizes: ['Completion certificate', 'Skill assessment report'],
      status: 'registration_open',
    },
    {
      id: 3,
      title: 'Coach Development Workshop',
      type: 'workshop',
      date: '2025-08-25',
      time: '02:00 PM',
      duration: '4 hours',
      location: 'Conference Room A',
      description: 'Professional development workshop for coaches focusing on modern training methodologies and sports psychology.',
      price: '$150',
      maxParticipants: 30,
      currentParticipants: 18,
      ageGroup: 'Coaches only',
      skillLevel: 'All levels',
      image: null,
      organizer: 'Sports Education Institute',
      tags: ['workshop', 'coaching', 'professional development'],
      requirements: ['Coaching license preferred', 'Notebook and pen'],
      prizes: ['CPD certificate', 'Resource materials'],
      status: 'upcoming',
    },
    {
      id: 4,
      title: 'Parent-Child Skills Session',
      type: 'special',
      date: '2025-08-22',
      time: '10:00 AM',
      duration: '2 hours',
      location: 'Practice Field 1',
      description: 'Fun training session where parents and children can learn and play together. Great for family bonding.',
      price: '$50 per pair',
      maxParticipants: 40,
      currentParticipants: 24,
      ageGroup: '6-12 years + parent',
      skillLevel: 'Beginner friendly',
      image: null,
      organizer: 'Elite Sports Academy',
      tags: ['family', 'fun', 'beginner'],
      requirements: ['Comfortable clothing', 'Water bottle', 'Positive attitude'],
      prizes: ['Family photos', 'Participation medals'],
      status: 'registration_open',
    },
    {
      id: 5,
      title: 'Scholarship Tryouts',
      type: 'tryout',
      date: '2025-09-01',
      time: '09:00 AM',
      duration: 'Full day',
      location: 'Main Stadium',
      description: 'Annual scholarship tryouts for talented young athletes. Winners receive full academy scholarships.',
      price: '$75',
      maxParticipants: 100,
      currentParticipants: 89,
      ageGroup: '14-18 years',
      skillLevel: 'Advanced',
      image: null,
      organizer: 'Elite Sports Academy',
      tags: ['scholarship', 'tryout', 'advanced'],
      requirements: ['High skill level', 'Academic transcripts', 'Reference letters'],
      prizes: ['Full scholarships', 'Partial scholarships', 'Academy spots'],
      status: 'almost_full',
    },
  ]);

  const eventTypes = [
    { key: 'all', label: 'All Events', icon: 'event' },
    { key: 'tournament', label: 'Tournaments', icon: 'jump-rope' },
    { key: 'camp', label: 'Training Camps', icon: 'outdoor-grill' },
    { key: 'workshop', label: 'Workshops', icon: 'school' },
    { key: 'special', label: 'Special Events', icon: 'celebration' },
    { key: 'tryout', label: 'Tryouts', icon: 'sports' },
  ];

  useEffect(() => {
    // Entrance animations
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
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = activeFilter === 'all' || event.type === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleRegisterEvent = (eventId) => {
    const event = events.find(e => e.id === eventId);
    
    if (registeredEvents.has(eventId)) {
      Alert.alert(
        '✅ Already Registered',
        'You are already registered for this event. Check your email for confirmation details.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (event.currentParticipants >= event.maxParticipants) {
      Alert.alert(
        '😔 Event Full',
        'This event has reached maximum capacity. You can join the waitlist to be notified if spots become available.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Join Waitlist', onPress: () => handleJoinWaitlist(eventId) }
        ]
      );
      return;
    }

    Alert.alert(
      '🎉 Register for Event',
      `Are you sure you want to register for "${event.title}"?${event.price !== 'Free' ? `\n\nPrice: ${event.price}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Register', 
          onPress: () => {
            setRegisteredEvents(prev => new Set([...prev, eventId]));
            setEvents(prev => prev.map(e => 
              e.id === eventId 
                ? { ...e, currentParticipants: e.currentParticipants + 1 }
                : e
            ));
            Alert.alert(
              '🎊 Registration Successful!',
              'You have been successfully registered for this event. Check your email for confirmation and further details.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleJoinWaitlist = (eventId) => {
    Alert.alert(
      '📋 Joined Waitlist',
      'You have been added to the waitlist. We will notify you if a spot becomes available.',
      [{ text: 'OK' }]
    );
  };

  const handleToggleFavorite = (eventId) => {
    setFavoriteEvents(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  };

  const getEventStatusColor = (status) => {
    switch (status) {
      case 'registration_open': return COLORS.success;
      case 'almost_full': return COLORS.warning;
      case 'upcoming': return COLORS.primary;
      case 'full': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const getEventStatusText = (status) => {
    switch (status) {
      case 'registration_open': return 'Open';
      case 'almost_full': return 'Almost Full';
      case 'upcoming': return 'Upcoming';
      case 'full': return 'Full';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const animateFAB = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderEventCard = ({ item, index }) => {
    const isRegistered = registeredEvents.has(item.id);
    const isFavorite = favoriteEvents.has(item.id);
    const progressPercentage = (item.currentParticipants / item.maxParticipants) * 100;

    return (
      <Animated.View
        style={[
          styles.eventCard,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50 * (index + 1) * 0.1],
              })
            }]
          }
        ]}
      >
        <Card style={styles.card}>
          <TouchableOpacity
            onPress={() => {
              setSelectedEvent(item);
              setShowEventModal(true);
            }}
            activeOpacity={0.9}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.cardHeaderGradient}
              >
                <View style={styles.cardHeaderContent}>
                  <View style={styles.eventTypeContainer}>
                    <Chip 
                      icon={eventTypes.find(t => t.key === item.type)?.icon || 'event'}
                      style={styles.eventTypeChip}
                      textStyle={styles.chipText}
                    >
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Chip>
                    <TouchableOpacity
                      onPress={() => handleToggleFavorite(item.id)}
                      style={styles.favoriteButton}
                    >
                      <Icon 
                        name={isFavorite ? 'favorite' : 'favorite-border'} 
                        size={24} 
                        color={isFavorite ? '#ff6b6b' : '#ffffff'}
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={[TEXT_STYLES.h3, { color: '#ffffff', marginTop: SPACING.sm }]}>
                    {item.title}
                  </Text>
                  
                  <View style={styles.eventMetaContainer}>
                    <View style={styles.eventMeta}>
                      <Icon name="schedule" size={16} color="#ffffff" />
                      <Text style={styles.eventMetaText}>
                        {formatDate(item.date)} • {item.time}
                      </Text>
                    </View>
                    <View style={styles.eventMeta}>
                      <Icon name="location-on" size={16} color="#ffffff" />
                      <Text style={styles.eventMetaText}>{item.location}</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Card Content */}
            <View style={styles.cardContent}>
              <Text style={[TEXT_STYLES.caption, styles.description]} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Icon name="access-time" size={18} color={COLORS.primary} />
                    <Text style={styles.detailText}>{item.duration}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="people" size={18} color={COLORS.primary} />
                    <Text style={styles.detailText}>{item.ageGroup}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Icon name="attach-money" size={18} color={COLORS.success} />
                    <Text style={[styles.detailText, { color: COLORS.success, fontWeight: '600' }]}>
                      {item.price}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="star" size={18} color={COLORS.warning} />
                    <Text style={styles.detailText}>{item.skillLevel}</Text>
                  </View>
                </View>
              </View>

              {/* Participation Progress */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>
                    {item.currentParticipants}/{item.maxParticipants} participants
                  </Text>
                  <Chip 
                    style={[styles.statusChip, { backgroundColor: getEventStatusColor(item.status) + '20' }]}
                    textStyle={[styles.statusChipText, { color: getEventStatusColor(item.status) }]}
                  >
                    {getEventStatusText(item.status)}
                  </Chip>
                </View>
                <ProgressBar 
                  progress={progressPercentage / 100}
                  color={getEventStatusColor(item.status)}
                  style={styles.progressBar}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  onPress={() => handleRegisterEvent(item.id)}
                  style={[
                    styles.registerButton,
                    isRegistered && styles.registeredButton
                  ]}
                  labelStyle={styles.buttonLabel}
                  disabled={isRegistered}
                  icon={isRegistered ? 'check-circle' : 'person-add'}
                >
                  {isRegistered ? 'Registered ✅' : 'Register Now'}
                </Button>
                
                <IconButton
                  icon="share"
                  size={24}
                  iconColor={COLORS.primary}
                  style={styles.shareButton}
                  onPress={() => Alert.alert('Share', 'Sharing functionality coming soon!')}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      {eventTypes.map((type) => (
        <Chip
          key={type.key}
          selected={activeFilter === type.key}
          onPress={() => setActiveFilter(type.key)}
          style={[
            styles.filterChip,
            activeFilter === type.key && styles.selectedFilterChip
          ]}
          textStyle={[
            styles.filterChipText,
            activeFilter === type.key && styles.selectedFilterChipText
          ]}
          icon={type.icon}
        >
          {type.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderEventModal = () => {
    if (!selectedEvent) return null;

    return (
      <Portal>
        <Modal
          visible={showEventModal}
          onDismiss={() => setShowEventModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Modal Header */}
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity
                  onPress={() => setShowEventModal(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={[TEXT_STYLES.h2, { color: '#ffffff', flex: 1, textAlign: 'center' }]}>
                  Event Details
                </Text>
                <View style={{ width: 40 }} />
              </View>
            </LinearGradient>

            {/* Modal Content */}
            <View style={styles.modalBody}>
              <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
                {selectedEvent.title}
              </Text>

              <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
                {selectedEvent.description}
              </Text>

              {/* Event Info Grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Icon name="schedule" size={24} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Date & Time</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(selectedEvent.date)}{'\n'}{selectedEvent.time}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Icon name="access-time" size={24} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>{selectedEvent.duration}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Icon name="location-on" size={24} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{selectedEvent.location}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Icon name="attach-money" size={24} color={COLORS.success} />
                  <Text style={styles.infoLabel}>Price</Text>
                  <Text style={[styles.infoValue, { color: COLORS.success, fontWeight: '600' }]}>
                    {selectedEvent.price}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Icon name="people" size={24} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Age Group</Text>
                  <Text style={styles.infoValue}>{selectedEvent.ageGroup}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Icon name="star" size={24} color={COLORS.warning} />
                  <Text style={styles.infoLabel}>Skill Level</Text>
                  <Text style={styles.infoValue}>{selectedEvent.skillLevel}</Text>
                </View>
              </View>

              {/* Requirements Section */}
              {selectedEvent.requirements && selectedEvent.requirements.length > 0 && (
                <View style={styles.section}>
                  <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                    📋 Requirements
                  </Text>
                  {selectedEvent.requirements.map((req, index) => (
                    <View key={index} style={styles.requirementItem}>
                      <Icon name="check-circle" size={16} color={COLORS.success} />
                      <Text style={styles.requirementText}>{req}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Prizes Section */}
              {selectedEvent.prizes && selectedEvent.prizes.length > 0 && (
                <View style={styles.section}>
                  <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                    🏆 Prizes & Rewards
                  </Text>
                  {selectedEvent.prizes.map((prize, index) => (
                    <View key={index} style={styles.prizeItem}>
                      <Icon name="jump-rope" size={16} color={COLORS.warning} />
                      <Text style={styles.prizeText}>{prize}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Organizer Info */}
              <View style={styles.organizerSection}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                  🏢 Organized by
                </Text>
                <View style={styles.organizerInfo}>
                  <Avatar.Icon size={48} icon="business" style={{ backgroundColor: COLORS.primary }} />
                  <View style={styles.organizerDetails}>
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                      {selectedEvent.organizer}
                    </Text>
                    <Text style={TEXT_STYLES.caption}>Event Organizer</Text>
                  </View>
                </View>
              </View>

              {/* Action Button */}
              <Button
                mode="contained"
                onPress={() => {
                  setShowEventModal(false);
                  handleRegisterEvent(selectedEvent.id);
                }}
                style={[
                  styles.modalRegisterButton,
                  registeredEvents.has(selectedEvent.id) && styles.registeredButton
                ]}
                labelStyle={styles.modalButtonLabel}
                disabled={registeredEvents.has(selectedEvent.id)}
                icon={registeredEvents.has(selectedEvent.id) ? 'check-circle' : 'person-add'}
              >
                {registeredEvents.has(selectedEvent.id) ? 'Already Registered ✅' : 'Register for Event 🚀'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            size={24}
            iconColor="#ffffff"
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerText}>
            <Text style={[TEXT_STYLES.h2, { color: '#ffffff' }]}>
              Academy Events
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: '#ffffff', opacity: 0.9 }]}>
              {academy?.name || 'Elite Sports Academy'}
            </Text>
          </View>
          <IconButton
            icon="filter-list"
            size={24}
            iconColor="#ffffff"
            onPress={() => setShowFilterModal(true)}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
            placeholderTextColor={COLORS.textLight}
          />
        </View>
      </LinearGradient>

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Events List */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {filteredEvents.length > 0 ? (
          <FlatList
            data={filteredEvents}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
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
          <View style={styles.emptyContainer}>
            <Icon name="event-busy" size={80} color={COLORS.textLight} />
            <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>No Events Found</Text>
            <Text style={[TEXT_STYLES.caption, styles.emptySubtitle]}>
              {searchQuery ? 
                'Try adjusting your search or filter criteria' : 
                'No events available at the moment'
              }
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
        <FAB
          icon="add"
          style={styles.fab}
          onPress={() => {
            animateFAB();
            Alert.alert(
              '🚀 Feature Coming Soon!',
              'Event creation functionality will be available in a future update.'
            );
          }}
          label="Create Event"
        />
      </Animated.View>

      {/* Event Detail Modal */}
      {renderEventModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: SPACING.md,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 0,
    borderRadius: 25,
  },
  searchInput: {
    color: COLORS.text,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.text,
  },
  selectedFilterChipText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100, // Space for FAB
  },
  eventCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    overflow: 'hidden',
  },
  cardHeaderGradient: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flex: 1,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTypeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  eventMetaContainer: {
    marginTop: SPACING.sm,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  eventMetaText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: SPACING.xs,
    opacity: 0.9,
  },
  cardContent: {
    padding: SPACING.md,
  },
  description: {
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  eventDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  registerButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  registeredButton: {
    backgroundColor: COLORS.success,
  },
  buttonLabel: {
    fontSize: 14,
    paddingVertical: SPACING.xs,
  },
  shareButton: {
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.md,
  },
  fab: {
    backgroundColor: COLORS.primary,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    margin: SPACING.sm,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  modalHeader: {
    paddingVertical: SPACING.md,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalDescription: {
    lineHeight: 22,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  infoItem: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  infoValue: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  requirementText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
  },
  prizeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  prizeText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
    color: COLORS.warning,
    fontWeight: '600',
  },
  organizerSection: {
    marginBottom: SPACING.lg,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  organizerDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  modalRegisterButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
  },
  modalButtonLabel: {
    fontSize: 16,
    paddingVertical: SPACING.xs,
  },
});

export default AcademyEvents;