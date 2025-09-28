import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
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
  Text,
  ProgressBar,
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/typography';
import { SPACING } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';

const { width } = Dimensions.get('window');

const PersonalEvents = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'

  // Mock data for personal development events
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Leadership Excellence Summit 2025',
      organizer: 'International Coaching Institute',
      organizerLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
      type: 'Conference',
      format: 'In-Person',
      location: 'Manchester Convention Center, UK',
      date: '2025-09-15',
      endDate: '2025-09-17',
      time: '09:00 AM',
      price: 349,
      originalPrice: 449,
      currency: 'USD',
      capacity: 500,
      registered: 387,
      featured: true,
      rating: 4.8,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
      description: 'Transform your leadership approach with proven strategies from world-class coaches and business leaders.',
      highlights: [
        'Keynote from Olympic team coaches',
        '15+ interactive workshops',
        'Networking with 500+ professionals',
        'Digital resource library access'
      ],
      speakers: [
        { name: 'Sir Alex Ferguson', role: 'Legendary Football Manager' },
        { name: 'Dr. Carol Dweck', role: 'Stanford Psychology Professor' },
        { name: 'Phil Jackson', role: 'NBA Championship Coach' }
      ],
      agenda: [
        'Leadership Mindset Transformation',
        'Building High-Performance Teams',
        'Communication Under Pressure',
        'Strategic Decision Making'
      ],
      includes: [
        '3-day conference access',
        'All meals and refreshments',
        'Digital materials package',
        'Certificate of attendance'
      ],
      earlyBird: true,
      category: 'Leadership',
      difficulty: 'All Levels'
    },
    {
      id: '2',
      title: 'Mental Performance Mastery Workshop',
      organizer: 'Sports Psychology Academy',
      organizerLogo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
      type: 'Workshop',
      format: 'Hybrid',
      location: 'London Sports Complex + Online',
      date: '2025-08-28',
      endDate: '2025-08-29',
      time: '10:00 AM',
      price: 189,
      originalPrice: 229,
      currency: 'USD',
      capacity: 80,
      registered: 52,
      featured: false,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
      description: 'Master the psychological tools needed to help athletes achieve peak mental performance.',
      highlights: [
        'Hands-on mental training techniques',
        'Case study analysis',
        'Certification upon completion',
        'Ongoing community support'
      ],
      speakers: [
        { name: 'Dr. Michael Gervais', role: 'High Performance Psychologist' },
        { name: 'Kate Hays', role: 'Sports Psychology Consultant' }
      ],
      agenda: [
        'Cognitive Behavioral Strategies',
        'Visualization Techniques',
        'Stress Management Protocols',
        'Performance Anxiety Solutions'
      ],
      includes: [
        '2-day intensive training',
        'Digital toolkit',
        'Follow-up webinar access',
        'Professional certification'
      ],
      earlyBird: false,
      category: 'Psychology',
      difficulty: 'Intermediate'
    },
    {
      id: '3',
      title: 'Youth Development Symposium',
      organizer: 'Future Champions Foundation',
      organizerLogo: 'https://images.unsplash.com/photo-1494790108755-2616c65c17e9?w=100&h=100&fit=crop',
      type: 'Symposium',
      format: 'Online',
      location: 'Virtual Event',
      date: '2025-09-05',
      endDate: '2025-09-05',
      time: '02:00 PM',
      price: 79,
      originalPrice: 99,
      currency: 'USD',
      capacity: 1000,
      registered: 234,
      featured: false,
      rating: 4.7,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=200&fit=crop',
      description: 'Learn cutting-edge approaches to developing young talent in sports and life skills.',
      highlights: [
        'Age-appropriate training methods',
        'Parent engagement strategies',
        'Long-term athlete development',
        'Digital resource downloads'
      ],
      speakers: [
        { name: 'Istvan Balyi', role: 'LTAD Model Creator' },
        { name: 'Jean Côté', role: 'Youth Sports Researcher' }
      ],
      agenda: [
        'LTAD Principles and Application',
        'Multi-Sport Participation Benefits',
        'Avoiding Early Specialization',
        'Creating Positive Sport Experiences'
      ],
      includes: [
        'Full-day virtual access',
        'Recorded session replays',
        'Q&A with speakers',
        'Resource library access'
      ],
      earlyBird: true,
      category: 'Youth Development',
      difficulty: 'Beginner'
    },
    {
      id: '4',
      title: 'Technology in Coaching Bootcamp',
      organizer: 'SportsTech Innovation Hub',
      organizerLogo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      type: 'Bootcamp',
      format: 'In-Person',
      location: 'Silicon Valley Sports Center, CA',
      date: '2025-10-12',
      endDate: '2025-10-14',
      time: '09:30 AM',
      price: 599,
      originalPrice: 799,
      currency: 'USD',
      capacity: 150,
      registered: 98,
      featured: true,
      rating: 4.6,
      reviews: 43,
      image: 'https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?w=400&h=200&fit=crop',
      description: 'Integrate cutting-edge technology into your coaching practice for enhanced performance analysis.',
      highlights: [
        'Latest wearable technology demos',
        'AI-powered performance analysis',
        'Virtual reality training systems',
        'Tech vendor networking'
      ],
      speakers: [
        { name: 'John Doe', role: 'Sports Analytics Expert' },
        { name: 'Jane Smith', role: 'VR Training Specialist' }
      ],
      agenda: [
        'Wearable Technology Applications',
        'Data Analytics for Coaches',
        'Virtual Training Environments',
        'Future of Sports Technology'
      ],
      includes: [
        '3-day intensive bootcamp',
        'Technology trial licenses',
        'Industry networking events',
        'Advanced certification'
      ],
      earlyBird: false,
      category: 'Technology',
      difficulty: 'Advanced'
    }
  ]);

  const eventTypes = ['All', 'Conference', 'Workshop', 'Symposium', 'Bootcamp', 'Seminar'];
  const formats = ['All', 'In-Person', 'Online', 'Hybrid'];
  const timeframes = ['All', 'This Week', 'This Month', 'Next 3 Months', 'Later'];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent', true);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRegisterEvent = (event) => {
    Alert.alert(
      '🎟️ Event Registration',
      `Registration for "${event.title}" coming soon! This will include payment processing, calendar integration, and confirmation emails.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleEventDetails = (event) => {
    Alert.alert(
      '📋 Event Details',
      `Detailed information for "${event.title}" coming soon! This will show full agenda, speaker bios, venue details, and attendee reviews.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleShareEvent = (event) => {
    Alert.alert(
      '📤 Share Event',
      `Sharing "${event.title}" coming soon! This will include social media sharing, email invites, and calendar exports.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleAddToWishlist = (event) => {
    Alert.alert(
      '💖 Add to Wishlist',
      `Wishlist feature for "${event.title}" coming soon! Get notifications about similar events and early bird discounts.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEventTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'conference': return COLORS.primary;
      case 'workshop': return COLORS.success;
      case 'symposium': return '#FF9800';
      case 'bootcamp': return COLORS.error;
      case 'seminar': return '#9C27B0';
      default: return COLORS.secondary;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={14} color="#FFD700" />);
    }
    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half" size={14} color="#FFD700" />);
    }
    return stars;
  };

  const renderEventCard = ({ item: event }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={[styles.eventCard, event.featured && styles.featuredCard]} elevation={4}>
        {event.featured && (
          <View style={styles.featuredBadge}>
            <Icon name="star" size={16} color="white" />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        
        <View style={styles.eventImage}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          <View style={styles.eventHeader}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(event.date)}</Text>
              {event.endDate !== event.date && (
                <Text style={styles.dateRange}>- {formatDate(event.endDate)}</Text>
              )}
            </View>
            <View style={styles.typeContainer}>
              <Chip 
                mode="flat"
                style={[styles.typeChip, { backgroundColor: getEventTypeColor(event.type) }]}
                textStyle={styles.typeChipText}
              >
                {event.type}
              </Chip>
            </View>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.titleSection}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            {event.earlyBird && (
              <Badge style={styles.earlyBirdBadge}>Early Bird</Badge>
            )}
          </View>
          
          <View style={styles.organizerSection}>
            <Avatar.Image 
              source={{ uri: event.organizerLogo }} 
              size={32}
              style={styles.organizerAvatar}
            />
            <Text style={styles.organizerName}>{event.organizer}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {renderStars(event.rating)}
              </View>
              <Text style={styles.ratingText}>
                {event.rating} ({event.reviews})
              </Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>

          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Icon name="place" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{event.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{event.time} • {event.format}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="people" size={16} color={COLORS.success} />
              <Text style={styles.detailText}>
                {event.registered}/{event.capacity} registered
              </Text>
            </View>
          </View>

          <View style={styles.capacityContainer}>
            <Text style={styles.capacityLabel}>Event Capacity</Text>
            <ProgressBar 
              progress={event.registered / event.capacity}
              color={event.registered / event.capacity > 0.8 ? COLORS.error : COLORS.success}
              style={styles.capacityBar}
            />
            <Text style={styles.capacityText}>
              {event.capacity - event.registered} spots remaining
            </Text>
          </View>

          <View style={styles.highlightsSection}>
            <Text style={styles.sectionTitle}>Event Highlights</Text>
            {event.highlights.slice(0, 2).map((highlight, index) => (
              <View key={index} style={styles.highlightItem}>
                <Icon name="check-circle" size={14} color={COLORS.success} />
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
            {event.highlights.length > 2 && (
              <TouchableOpacity onPress={() => handleEventDetails(event)}>
                <Text style={styles.seeMoreText}>
                  +{event.highlights.length - 2} more highlights
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.priceSection}>
            <View style={styles.priceInfo}>
              {event.originalPrice > event.price && (
                <Text style={styles.originalPrice}>${event.originalPrice}</Text>
              )}
              <Text style={styles.currentPrice}>${event.price} {event.currency}</Text>
            </View>
            <View style={styles.actionButtons}>
              <IconButton
                icon="favorite-border"
                size={20}
                iconColor={COLORS.primary}
                style={styles.wishlistButton}
                onPress={() => handleAddToWishlist(event)}
              />
              <IconButton
                icon="share"
                size={20}
                iconColor={COLORS.primary}
                style={styles.shareButton}
                onPress={() => handleShareEvent(event)}
              />
              <Button
                mode="outlined"
                onPress={() => handleEventDetails(event)}
                style={styles.detailsButton}
                labelStyle={styles.buttonLabel}
              >
                Details
              </Button>
              <Button
                mode="contained"
                onPress={() => handleRegisterEvent(event)}
                style={styles.registerButton}
                labelStyle={styles.registerButtonLabel}
              >
                Register
              </Button>
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderTypeChip = ({ item: type }) => (
    <Chip
      selected={selectedEventType === type}
      onPress={() => setSelectedEventType(type)}
      style={[
        styles.categoryChip,
        selectedEventType === type && styles.selectedCategoryChip
      ]}
      textStyle={[
        styles.categoryChipText,
        selectedEventType === type && styles.selectedCategoryChipText
      ]}
    >
      {type}
    </Chip>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Personal Development Events 🌟</Text>
          <Text style={styles.headerSubtitle}>
            Expand your skills and network with industry professionals
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>25+</Text>
              <Text style={styles.statLabel}>Upcoming Events</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5000+</Text>
              <Text style={styles.statLabel}>Attendees</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>85%</Text>
              <Text style={styles.statLabel}>Return Rate</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search events, speakers, or topics..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
        <IconButton
          icon="tune"
          size={24}
          iconColor={COLORS.primary}
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        />
        <IconButton
          icon={viewMode === 'card' ? 'list' : 'view-agenda'}
          size={24}
          iconColor={COLORS.primary}
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
        />
      </View>

      {showFilters && (
        <Surface style={styles.filtersContainer} elevation={2}>
          <Text style={styles.filterTitle}>Event Type</Text>
          <FlatList
            data={eventTypes}
            renderItem={renderTypeChip}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryList}
          />
          
          <View style={styles.filterRow}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSubtitle}>Format</Text>
              <View style={styles.filterChips}>
                {formats.map((format) => (
                  <Chip
                    key={format}
                    selected={selectedFormat === format}
                    onPress={() => setSelectedFormat(format)}
                    style={[
                      styles.filterChip,
                      selectedFormat === format && styles.selectedFilterChip
                    ]}
                    textStyle={styles.filterChipText}
                  >
                    {format}
                  </Chip>
                ))}
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSubtitle}>Timeframe</Text>
              <View style={styles.filterChips}>
                {timeframes.map((timeframe) => (
                  <Chip
                    key={timeframe}
                    selected={selectedTimeframe === timeframe}
                    onPress={() => setSelectedTimeframe(timeframe)}
                    style={[
                      styles.filterChip,
                      selectedTimeframe === timeframe && styles.selectedFilterChip
                    ]}
                    textStyle={styles.filterChipText}
                  >
                    {timeframe}
                  </Chip>
                ))}
              </View>
            </View>
          </View>
        </Surface>
      )}

      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />

      <FAB
        icon="event"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            '📅 My Events',
            'View your registered events, saved events, and personal event calendar. Feature coming soon!',
            [{ text: 'Got it!', style: 'default' }]
          );
        }}
      />
    </View>
  );
};

const styles = {
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
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterButton: {
    marginLeft: SPACING.sm,
  },
  viewModeButton: {
    marginLeft: SPACING.xs,
  },
  filtersContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
  },
  filterTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  categoryList: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.text,
    fontSize: 12,
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterSection: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  filterSubtitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 10,
  },
  listContainer: {
    padding: SPACING.md,
  },
  eventCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    zIndex: 10,
  },
  featuredText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  eventImage: {
    height: 160,
    backgroundColor: COLORS.primary,
    position: 'relative',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  eventHeader: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  dateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  dateText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dateRange: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  typeContainer: {
    alignItems: 'flex-end',
  },
  typeChip: {
    height: 28,
  },
  typeChipText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
  },
  cardContent: {
    padding: SPACING.md,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  eventTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: 'bold',
    flex: 1,
    marginRight: SPACING.sm,
  },
  earlyBirdBadge: {
    backgroundColor: COLORS.success,
    color: 'white',
  },
  organizerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  organizerAvatar: {
    marginRight: SPACING.sm,
  },
  organizerName: {
    ...TEXT_STYLES.body,
    flex: 1,
    fontWeight: '600',
    color: COLORS.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: SPACING.xs,
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
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
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  capacityContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  capacityLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  capacityBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  capacityText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  highlightsSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  highlightText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  seeMoreText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    flex: 1,
  },
  originalPrice: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    ...TEXT_STYLES.heading,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wishlistButton: {
    marginRight: SPACING.xs,
  },
  shareButton: {
    marginRight: SPACING.sm,
  },
  detailsButton: {
    marginRight: SPACING.sm,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
  },
  buttonLabel: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
  },
  registerButtonLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontSize: 11,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default PersonalEvents;