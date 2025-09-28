import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  StatusBar,
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
  Text,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#e91e63',
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
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const FitnessConference = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('upcoming');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Mock data for fitness conferences
  const [conferences, setConferences] = useState([
    {
      id: 1,
      title: 'ACSM Annual Meeting 2025',
      subtitle: 'American College of Sports Medicine',
      description: 'World\'s largest gathering of sports medicine and exercise professionals',
      location: 'Denver, Colorado',
      venue: 'Colorado Convention Center',
      date: '2025-09-15',
      endDate: '2025-09-18',
      time: '8:00 AM - 6:00 PM',
      price: '$599',
      earlyBird: '$499',
      type: 'Conference',
      category: 'Sports Medicine',
      attendees: 5200,
      speakers: 180,
      sessions: 400,
      ceCredits: 24,
      featured: true,
      virtual: false,
      hybrid: true,
      rating: 4.8,
      organizer: 'ACSM',
      organizerLogo: 'AS',
      saved: false,
      registered: false,
      tags: ['Nutrition', 'Exercise Science', 'Rehabilitation', 'Research'],
      image: 'conference1.jpg',
    },
    {
      id: 2,
      title: 'Functional Training Summit',
      subtitle: 'Advanced Movement Patterns & Training',
      description: 'Deep dive into functional movement, corrective exercise, and performance training',
      location: 'Miami, Florida',
      venue: 'Miami Beach Convention Center',
      date: '2025-10-22',
      endDate: '2025-10-24',
      time: '9:00 AM - 5:00 PM',
      price: '$399',
      earlyBird: '$329',
      type: 'Summit',
      category: 'Functional Training',
      attendees: 1200,
      speakers: 45,
      sessions: 120,
      ceCredits: 18,
      featured: false,
      virtual: true,
      hybrid: true,
      rating: 4.7,
      organizer: 'Functional Movement Institute',
      organizerLogo: 'FMI',
      saved: true,
      registered: false,
      tags: ['Movement', 'Corrective Exercise', 'Performance', 'Mobility'],
      image: 'summit1.jpg',
    },
    {
      id: 3,
      title: 'Nutrition & Fitness Expo',
      subtitle: 'Science-Based Nutrition for Athletes',
      description: 'Latest research in sports nutrition, supplementation, and metabolic health',
      location: 'Los Angeles, California',
      venue: 'LA Convention Center',
      date: '2025-11-08',
      endDate: '2025-11-10',
      time: '8:30 AM - 7:00 PM',
      price: '$299',
      earlyBird: '$249',
      type: 'Expo',
      category: 'Nutrition',
      attendees: 3500,
      speakers: 75,
      sessions: 200,
      ceCredits: 15,
      featured: true,
      virtual: false,
      hybrid: false,
      rating: 4.6,
      organizer: 'Sports Nutrition Society',
      organizerLogo: 'SNS',
      saved: false,
      registered: true,
      tags: ['Sports Nutrition', 'Supplements', 'Metabolic Health', 'Recovery'],
      image: 'expo1.jpg',
    },
    {
      id: 4,
      title: 'Youth Fitness Workshop',
      subtitle: 'Training the Next Generation',
      description: 'Specialized training techniques for youth athletes and active children',
      location: 'Austin, Texas',
      venue: 'Austin Sports Center',
      date: '2025-12-05',
      endDate: '2025-12-06',
      time: '9:00 AM - 4:00 PM',
      price: '$199',
      earlyBird: '$159',
      type: 'Workshop',
      category: 'Youth Training',
      attendees: 450,
      speakers: 12,
      sessions: 30,
      ceCredits: 12,
      featured: false,
      virtual: true,
      hybrid: true,
      rating: 4.9,
      organizer: 'Youth Fitness Association',
      organizerLogo: 'YFA',
      saved: true,
      registered: false,
      tags: ['Youth Training', 'Development', 'Safety', 'Fun Fitness'],
      image: 'workshop1.jpg',
    },
    {
      id: 5,
      title: 'Digital Fitness Innovation',
      subtitle: 'Technology in Modern Training',
      description: 'Explore the latest fitness apps, wearables, and digital training platforms',
      location: 'San Francisco, California',
      venue: 'Moscone Convention Center',
      date: '2026-01-15',
      endDate: '2026-01-17',
      time: '10:00 AM - 6:00 PM',
      price: '$449',
      earlyBird: '$379',
      type: 'Innovation Summit',
      category: 'Technology',
      attendees: 2100,
      speakers: 60,
      sessions: 150,
      ceCredits: 20,
      featured: true,
      virtual: true,
      hybrid: true,
      rating: 4.5,
      organizer: 'FitTech Alliance',
      organizerLogo: 'FTA',
      saved: false,
      registered: false,
      tags: ['Technology', 'Apps', 'Wearables', 'Virtual Training'],
      image: 'innovation1.jpg',
    },
  ]);

  const [registeredEvents, setRegisteredEvents] = useState([
    {
      id: 3,
      title: 'Nutrition & Fitness Expo',
      date: '2025-11-08',
      location: 'Los Angeles, CA',
      status: 'Confirmed',
      ticketNumber: 'NFE2025-789456',
    }
  ]);

  const filters = [
    { key: 'all', label: 'All Events', icon: 'event' },
    { key: 'conference', label: 'Conferences', icon: 'business-center' },
    { key: 'workshop', label: 'Workshops', icon: 'school' },
    { key: 'summit', label: 'Summits', icon: 'trending-up' },
    { key: 'expo', label: 'Expos', icon: 'storefront' },
  ];

  const timeFilters = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'this-month', label: 'This Month' },
    { key: 'next-month', label: 'Next Month' },
    { key: 'saved', label: 'Saved' },
    { key: 'registered', label: 'Registered' },
  ];

  const categories = [
    { key: 'sports-medicine', label: 'Sports Medicine', color: COLORS.primary },
    { key: 'functional-training', label: 'Functional Training', color: COLORS.success },
    { key: 'nutrition', label: 'Nutrition', color: COLORS.warning },
    { key: 'youth-training', label: 'Youth Training', color: COLORS.accent },
    { key: 'technology', label: 'Technology', color: COLORS.secondary },
  ];

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [fadeAnim, slideAnim]);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('✅ Events Updated', 'Latest conference listings loaded!');
    }, 1500);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleFilterSelect = useCallback((filter) => {
    setSelectedFilter(filter);
  }, []);

  const handleTimeFilterSelect = useCallback((filter) => {
    setSelectedTimeFilter(filter);
  }, []);

  const handleConferencePress = (conference) => {
    Alert.alert(
      '🎯 Conference Details',
      `View details for ${conference.title}?\n\n• ${conference.sessions} sessions\n• ${conference.speakers} speakers\n• ${conference.ceCredits} CE credits\n• ${conference.attendees} expected attendees`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Navigate to conference details') }
      ]
    );
  };

  const handleSaveEvent = (conference) => {
    const updatedConferences = conferences.map(conf => 
      conf.id === conference.id ? { ...conf, saved: !conf.saved } : conf
    );
    setConferences(updatedConferences);
    
    Alert.alert(
      conference.saved ? '💔 Removed from Saved' : '❤️ Event Saved',
      conference.saved 
        ? `${conference.title} removed from your saved events` 
        : `${conference.title} added to your saved events`
    );
  };

  const handleRegisterEvent = (conference) => {
    if (conference.registered) {
      Alert.alert(
        '✅ Already Registered',
        `You're already registered for ${conference.title}!\n\nTicket: ${conference.title.toUpperCase()}-${Math.random().toString(36).substr(2, 6)}`
      );
      return;
    }

    Alert.alert(
      '🎫 Register for Event',
      `Register for ${conference.title}?\n\nEarly Bird: ${conference.earlyBird}\nRegular: ${conference.price}\nCE Credits: ${conference.ceCredits}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Register Now', 
          onPress: () => {
            const updatedConferences = conferences.map(conf => 
              conf.id === conference.id ? { ...conf, registered: true } : conf
            );
            setConferences(updatedConferences);
            Alert.alert('🎉 Registration Successful!', 'Check your email for confirmation details.');
          }
        }
      ]
    );
  };

  const handleShareEvent = (conference) => {
    Alert.alert(
      '📱 Share Event',
      `Share ${conference.title} with other trainers?\n\nThis will open sharing options to spread the word about this event.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => console.log('Open share sheet') }
      ]
    );
  };

  const handleCreateEvent = () => {
    Alert.alert(
      '➕ Host Your Event',
      'Interested in hosting your own fitness conference or workshop?\n\nConnect with event organizers and promote your expertise to the fitness community.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Learn More', onPress: () => console.log('Navigate to event hosting') }
      ]
    );
  };

  // Filtered conferences
  const filteredConferences = conferences.filter(conf => {
    const matchesSearch = conf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conf.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conf.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         conf.type.toLowerCase().includes(selectedFilter.toLowerCase());
    
    let matchesTimeFilter = true;
    switch (selectedTimeFilter) {
      case 'saved':
        matchesTimeFilter = conf.saved;
        break;
      case 'registered':
        matchesTimeFilter = conf.registered;
        break;
      case 'this-month':
        matchesTimeFilter = new Date(conf.date).getMonth() === new Date().getMonth();
        break;
      case 'next-month':
        matchesTimeFilter = new Date(conf.date).getMonth() === new Date().getMonth() + 1;
        break;
      default:
        matchesTimeFilter = true;
    }
    
    return matchesSearch && matchesFilter && matchesTimeFilter;
  });

  // Format date
  const formatDate = (dateString, endDateString) => {
    const startDate = new Date(dateString);
    const endDate = new Date(endDateString);
    
    const options = { month: 'short', day: 'numeric' };
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.toLocaleDateString('en-US', { month: 'short' })} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
    }
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}, ${startDate.getFullYear()}`;
  };

  // Get days until event
  const getDaysUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past Event';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  // Render conference card
  const renderConferenceCard = (conference) => (
    <Card key={conference.id} style={[styles.conferenceCard, conference.featured && styles.featuredCard]}>
      <TouchableOpacity
        onPress={() => handleConferencePress(conference)}
        activeOpacity={0.8}
      >
        {conference.featured && (
          <View style={styles.featuredBanner}>
            <Icon name="star" size={14} color="white" />
            <Text style={styles.featuredText}>Featured Event</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <View style={styles.organizerInfo}>
            <Avatar.Text
              size={40}
              label={conference.organizerLogo}
              style={{ backgroundColor: COLORS.primary }}
            />
            <View style={styles.eventTitleSection}>
              <Text style={styles.eventTitle}>{conference.title}</Text>
              <Text style={styles.eventSubtitle}>{conference.subtitle}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSaveEvent(conference)}
            >
              <Icon 
                name={conference.saved ? 'favorite' : 'favorite-border'} 
                size={20} 
                color={conference.saved ? COLORS.error : COLORS.textSecondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => handleShareEvent(conference)}
            >
              <Icon name="share" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.eventDescription}>{conference.description}</Text>

          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{conference.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="event" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{formatDate(conference.date, conference.endDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{conference.time}</Text>
            </View>
          </View>

          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Icon name="people" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{conference.attendees.toLocaleString()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="mic" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{conference.speakers}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="school" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{conference.ceCredits} CE</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="star" size={16} color={COLORS.warning} />
              <Text style={styles.metaText}>{conference.rating}</Text>
            </View>
          </View>

          <View style={styles.eventFormat}>
            {conference.virtual && (
              <Chip style={styles.formatChip} textStyle={styles.formatChipText}>
                <Icon name="computer" size={12} /> Virtual
              </Chip>
            )}
            {conference.hybrid && (
              <Chip style={[styles.formatChip, styles.hybridChip]} textStyle={styles.formatChipText}>
                <Icon name="sync" size={12} /> Hybrid
              </Chip>
            )}
            <Chip style={[styles.formatChip, styles.typeChip]} textStyle={styles.formatChipText}>
              {conference.type}
            </Chip>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
          >
            {conference.tags.map((tag, index) => (
              <Chip
                key={index}
                style={styles.tagChip}
                textStyle={styles.tagText}
              >
                {tag}
              </Chip>
            ))}
          </ScrollView>

          <View style={styles.cardFooter}>
            <View style={styles.pricingSection}>
              <View style={styles.priceRow}>
                <Text style={styles.earlyBirdPrice}>{conference.earlyBird}</Text>
                <Text style={styles.earlyBirdLabel}>Early Bird</Text>
              </View>
              <Text style={styles.regularPrice}>Reg: {conference.price}</Text>
              <Text style={styles.daysUntil}>{getDaysUntil(conference.date)}</Text>
            </View>

            <Button
              mode={conference.registered ? "outlined" : "contained"}
              onPress={() => handleRegisterEvent(conference)}
              style={[
                styles.registerButton,
                conference.registered && styles.registeredButton
              ]}
              labelStyle={[
                styles.registerButtonText,
                conference.registered && styles.registeredButtonText
              ]}
              icon={conference.registered ? "check" : "card-membership"}
            >
              {conference.registered ? 'Registered' : 'Register'}
            </Button>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  // Render registered event card
  const renderRegisteredEventCard = (event) => (
    <Card key={event.id} style={styles.registeredCard}>
      <View style={styles.registeredHeader}>
        <Icon name="check-circle" size={20} color={COLORS.success} />
        <Text style={styles.registeredTitle}>{event.title}</Text>
      </View>
      <Text style={styles.registeredDate}>{formatDate(event.date, event.date)}</Text>
      <Text style={styles.registeredLocation}>{event.location}</Text>
      <View style={styles.ticketInfo}>
        <Text style={styles.ticketLabel}>Ticket #</Text>
        <Text style={styles.ticketNumber}>{event.ticketNumber}</Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.loadingGradient}>
          <Icon name="event" size={60} color="white" />
          <Text style={styles.loadingText}>Loading Conferences...</Text>
          <ProgressBar indeterminate color="white" style={styles.loadingProgress} />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Fitness Conferences</Text>
            <Text style={styles.headerSubtitle}>Expand your knowledge and network 🎯</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => console.log('Open conference calendar')}
          >
            <Icon name="calendar-today" size={24} color="white" />
            {registeredEvents.length > 0 && (
              <Badge style={styles.headerBadge}>{registeredEvents.length}</Badge>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search conferences, topics..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity key={filter.key} onPress={() => handleFilterSelect(filter.key)}>
            <Chip
              selected={selectedFilter === filter.key}
              onPress={() => handleFilterSelect(filter.key)}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.selectedFilterChip
              ]}
              textStyle={[
                styles.filterChipText,
                selectedFilter === filter.key && styles.selectedFilterChipText
              ]}
              icon={filter.icon}
            >
              {filter.label}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Time Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timeFiltersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {timeFilters.map((filter) => (
          <TouchableOpacity key={filter.key} onPress={() => handleTimeFilterSelect(filter.key)}>
            <Chip
              selected={selectedTimeFilter === filter.key}
              onPress={() => handleTimeFilterSelect(filter.key)}
              style={[
                styles.timeFilterChip,
                selectedTimeFilter === filter.key && styles.selectedTimeFilterChip
              ]}
              textStyle={[
                styles.timeFilterChipText,
                selectedTimeFilter === filter.key && styles.selectedTimeFilterChipText
              ]}
            >
              {filter.label}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
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
          {/* Registered Events Section */}
          {registeredEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Registered Events</Text>
                <TouchableOpacity onPress={() => console.log('View all registered')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {registeredEvents.map(renderRegisteredEventCard)}
              </ScrollView>
            </View>
          )}

          {/* Available Conferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Available Events ({filteredConferences.length})
            </Text>
            
            {filteredConferences.length === 0 ? (
              <Surface style={styles.emptyState}>
                <Icon name="event-busy" size={60} color={COLORS.textSecondary} />
                <Text style={styles.emptyStateTitle}>No Events Found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Try adjusting your search or filters
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedFilter('all');
                    setSelectedTimeFilter('upcoming');
                  }}
                  style={styles.clearFiltersButton}
                >
                  Clear Filters
                </Button>
              </Surface>
            ) : (
              filteredConferences.map(renderConferenceCard)
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="add"
        label="Host Event"
        onPress={handleCreateEvent}
        color="white"
      />
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
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  loadingProgress: {
    width: width * 0.6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  profileButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: COLORS.background,
    borderRadius: 25,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.sm,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  timeFiltersContainer: {
    backgroundColor: 'white',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeFilterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTimeFilterChip: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  timeFilterChipText: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  selectedTimeFilterChipText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
  },
  seeAllText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  horizontalScrollContent: {
    paddingRight: SPACING.md,
  },
  registeredCard: {
    width: 280,
    marginRight: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  registeredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  registeredTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  registeredDate: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  registeredLocation: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.sm,
  },
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  ticketLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  ticketNumber: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
  conferenceCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: COLORS.warning,
    elevation: 4,
  },
  featuredBanner: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  featuredText: {
    ...TEXT_STYLES.small,
    color: 'white',
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventTitleSection: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  eventTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
  },
  eventSubtitle: {
    ...TEXT_STYLES.caption,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    padding: SPACING.sm,
    marginRight: SPACING.xs,
  },
  shareButton: {
    padding: SPACING.sm,
  },
  cardContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  eventDescription: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  eventDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  eventFormat: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  formatChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primary,
  },
  hybridChip: {
    backgroundColor: COLORS.secondary,
  },
  typeChip: {
    backgroundColor: COLORS.accent,
  },
  formatChipText: {
    ...TEXT_STYLES.small,
    color: 'white',
    fontWeight: '600',
  },
  tagsContainer: {
    marginBottom: SPACING.md,
  },
  tagChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tagText: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pricingSection: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  earlyBirdPrice: {
    ...TEXT_STYLES.h3,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  earlyBirdLabel: {
    ...TEXT_STYLES.small,
    color: COLORS.success,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  regularPrice: {
    ...TEXT_STYLES.caption,
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  daysUntil: {
    ...TEXT_STYLES.small,
    color: COLORS.warning,
    fontWeight: '600',
  },
  registerButton: {
    borderRadius: 25,
    paddingHorizontal: SPACING.lg,
  },
  registeredButton: {
    borderColor: COLORS.success,
  },
  registerButtonText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  registeredButtonText: {
    color: COLORS.success,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginVertical: SPACING.lg,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    marginVertical: SPACING.md,
  },
  emptyStateSubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.textSecondary,
  },
  clearFiltersButton: {
    borderColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default FitnessConference;