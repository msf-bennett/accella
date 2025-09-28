import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
  Platform,
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
  Searchbar,
  ProgressBar,
  Badge,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import constants (these would be defined in your constants file)
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
  body1: { fontSize: 16 },
  body2: { fontSize: 14 },
  caption: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

const ProfessionalEvents = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [viewMode, setViewMode] = useState('card'); // card or list
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample events data
  const sampleEvents = [
    {
      id: 1,
      title: 'Advanced Strength & Conditioning Certification',
      organizer: 'International Sports Science Association',
      type: 'Certification',
      format: 'Hybrid',
      date: '2024-09-15',
      endDate: '2024-09-17',
      time: '9:00 AM - 5:00 PM',
      location: 'Las Vegas, NV + Online',
      price: 899,
      originalPrice: 1199,
      difficulty: 'Advanced',
      category: 'Strength Training',
      duration: '3 days',
      ceuCredits: 2.4,
      capacity: 150,
      registered: 127,
      rating: 4.9,
      reviewCount: 234,
      instructor: 'Dr. Michael Johnson',
      featured: true,
      earlyBird: true,
      description: 'Comprehensive certification covering advanced periodization, biomechanics, and programming strategies for elite athletes.',
      benefits: ['24 CEU Credits', 'Digital Certificate', 'Lifetime Access to Materials', '1-Year Support'],
      image: 'https://via.placeholder.com/400x200',
      tags: ['Popular', 'CEU Credits', 'Certificate'],
    },
    {
      id: 2,
      title: 'Functional Movement Workshop Series',
      organizer: 'Movement Excellence Institute',
      type: 'Workshop',
      format: 'In-Person',
      date: '2024-09-22',
      endDate: '2024-09-22',
      time: '10:00 AM - 4:00 PM',
      location: 'New York, NY',
      price: 299,
      difficulty: 'Intermediate',
      category: 'Functional Training',
      duration: '6 hours',
      ceuCredits: 0.6,
      capacity: 40,
      registered: 35,
      rating: 4.8,
      reviewCount: 89,
      instructor: 'Sarah Martinez',
      featured: false,
      earlyBird: false,
      description: 'Hands-on workshop focusing on movement assessment, corrective strategies, and functional exercise progressions.',
      benefits: ['Hands-on Practice', 'Assessment Tools', 'Exercise Library', 'Networking'],
      image: 'https://via.placeholder.com/400x200',
      tags: ['Hands-On', 'Small Group'],
    },
    {
      id: 3,
      title: 'Nutrition for Athletes Masterclass',
      organizer: 'Sports Nutrition Academy',
      type: 'Masterclass',
      format: 'Online',
      date: '2024-09-25',
      endDate: '2024-09-25',
      time: '2:00 PM - 6:00 PM',
      location: 'Online',
      price: 149,
      difficulty: 'Beginner',
      category: 'Nutrition',
      duration: '4 hours',
      ceuCredits: 0.4,
      capacity: 500,
      registered: 342,
      rating: 4.7,
      reviewCount: 156,
      instructor: 'Dr. Lisa Chen',
      featured: false,
      earlyBird: true,
      description: 'Complete guide to sports nutrition, meal planning, and supplementation strategies for athletic performance.',
      benefits: ['Recording Access', 'Meal Plans', 'Supplement Guide', 'Q&A Session'],
      image: 'https://via.placeholder.com/400x200',
      tags: ['Online', 'Recording Included'],
    },
    {
      id: 4,
      title: 'Business of Fitness Conference 2024',
      organizer: 'Fitness Business Summit',
      type: 'Conference',
      format: 'In-Person',
      date: '2024-10-05',
      endDate: '2024-10-07',
      time: 'All Day',
      location: 'Miami, FL',
      price: 599,
      difficulty: 'All Levels',
      category: 'Business',
      duration: '3 days',
      ceuCredits: 1.8,
      capacity: 800,
      registered: 654,
      rating: 4.9,
      reviewCount: 445,
      instructor: 'Multiple Speakers',
      featured: true,
      earlyBird: false,
      description: 'Premier conference for fitness professionals covering marketing, sales, technology, and business growth strategies.',
      benefits: ['20+ Speakers', 'Networking Events', 'Exhibition', 'Recording Access'],
      image: 'https://via.placeholder.com/400x200',
      tags: ['Multi-Day', 'Networking', 'Exhibition'],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Events', icon: 'event' },
    { id: 'strength', label: 'Strength', icon: 'fitness-center' },
    { id: 'functional', label: 'Functional', icon: 'accessibility' },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
    { id: 'business', label: 'Business', icon: 'business' },
    { id: 'rehabilitation', label: 'Rehab', icon: 'healing' },
  ];

  const formatTypes = [
    { id: 'all', label: 'All Formats', icon: 'view-module' },
    { id: 'online', label: 'Online', icon: 'computer' },
    { id: 'in-person', label: 'In-Person', icon: 'location-on' },
    { id: 'hybrid', label: 'Hybrid', icon: 'sync' },
  ];

  const sampleMyEvents = [
    {
      id: 101,
      title: 'Corrective Exercise Specialist',
      date: '2024-08-15',
      status: 'completed',
      certificate: true,
      rating: 5,
    },
    {
      id: 102,
      title: 'Youth Training Certification',
      date: '2024-09-30',
      status: 'registered',
      certificate: false,
    },
  ];

  const sampleCertificates = [
    {
      id: 1,
      title: 'Advanced Personal Training Certification',
      issuer: 'ACSM',
      issueDate: '2024-06-15',
      expiryDate: '2026-06-15',
      credentialId: 'ACSM-APT-2024-001234',
      status: 'active',
    },
    {
      id: 2,
      title: 'Functional Movement Screen Level 2',
      issuer: 'FMS',
      issueDate: '2024-05-20',
      expiryDate: '2025-05-20',
      credentialId: 'FMS-L2-2024-005678',
      status: 'expiring_soon',
    },
  ];

  useEffect(() => {
    initializeScreen();
    startAnimations();
  }, []);

  const initializeScreen = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await Promise.all([
        loadEvents(),
        loadMyEvents(),
        loadCertificates(),
      ]);
    } catch (error) {
      console.error('Error initializing screen:', error);
      Alert.alert('Error', 'Failed to load professional events data');
    } finally {
      setLoading(false);
    }
  };

  const startAnimations = () => {
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
  };

  const loadEvents = async () => {
    setTimeout(() => setEvents(sampleEvents), 1000);
  };

  const loadMyEvents = async () => {
    setTimeout(() => setMyEvents(sampleMyEvents), 800);
  };

  const loadCertificates = async () => {
    setTimeout(() => setCertificates(sampleCertificates), 600);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeScreen();
    setRefreshing(false);
  }, []);

  const handleEventRegistration = (eventId) => {
    const event = events.find(e => e.id === eventId);
    Alert.alert(
      'Register for Event',
      `Would you like to register for "${event.title}"?\n\nPrice: $${event.price}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: () => {
            Alert.alert('Success', 'Registration successful! Check your email for confirmation.');
            // Here you would dispatch registration action
          },
        },
      ]
    );
  };

  const handleEventBookmark = (eventId) => {
    Alert.alert('Bookmarked', 'Event added to your wishlist!');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.lg,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
        <IconButton
          icon="arrow-back"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, textAlign: 'center' }]}>
          🎓 Professional Events
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon={viewMode === 'card' ? 'view-list' : 'view-module'}
            iconColor="white"
            size={24}
            onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
          />
          <IconButton
            icon="filter-list"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('Filters', 'Advanced filters coming soon!')}
          />
        </View>
      </View>
      
      <Searchbar
        placeholder="Search events, certifications, locations..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          marginHorizontal: SPACING.sm,
        }}
        iconColor={COLORS.primary}
      />
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={{
      flexDirection: 'row',
      backgroundColor: COLORS.surface,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      elevation: 2,
    }}>
      {[
        { id: 'discover', label: 'Discover', icon: 'explore' },
        { id: 'myevents', label: 'My Events', icon: 'event-note' },
        { id: 'certificates', label: 'Certificates', icon: 'card-membership' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: SPACING.sm,
            backgroundColor: activeTab === tab.id ? COLORS.primary + '20' : 'transparent',
            borderRadius: SPACING.sm,
            marginHorizontal: SPACING.xs,
          }}
          onPress={() => setActiveTab(tab.id)}
        >
          <Icon
            name={tab.icon}
            size={20}
            color={activeTab === tab.id ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[
            TEXT_STYLES.body2,
            {
              marginLeft: SPACING.xs,
              color: activeTab === tab.id ? COLORS.primary : COLORS.textSecondary,
              fontWeight: activeTab === tab.id ? '600' : 'normal',
            }
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFilters = () => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
        }}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            mode={selectedCategory === category.id ? 'flat' : 'outlined'}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={{
              marginRight: SPACING.sm,
              backgroundColor: selectedCategory === category.id ? COLORS.primary : 'transparent',
            }}
            textStyle={{
              color: selectedCategory === category.id ? 'white' : COLORS.textSecondary,
            }}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.sm,
        }}
      >
        {formatTypes.map((format) => (
          <Chip
            key={format.id}
            mode={selectedFormat === format.id ? 'flat' : 'outlined'}
            selected={selectedFormat === format.id}
            onPress={() => setSelectedFormat(format.id)}
            style={{
              marginRight: SPACING.sm,
              backgroundColor: selectedFormat === format.id ? COLORS.secondary : 'transparent',
            }}
            textStyle={{
              color: selectedFormat === format.id ? 'white' : COLORS.textSecondary,
            }}
            icon={format.icon}
          >
            {format.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderEventCard = (event) => (
    <Animated.View
      key={event.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <Card style={{ marginHorizontal: SPACING.md, elevation: 4 }}>
        {event.featured && (
          <View style={{
            position: 'absolute',
            top: SPACING.sm,
            right: SPACING.sm,
            backgroundColor: COLORS.warning,
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.xs,
            borderRadius: SPACING.sm,
            zIndex: 1,
          }}>
            <Text style={[TEXT_STYLES.caption, { color: 'white', fontWeight: '600' }]}>
              ⭐ FEATURED
            </Text>
          </View>
        )}
        
        <View style={{
          height: 120,
          backgroundColor: COLORS.primary + '20',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Icon name="event" size={40} color={COLORS.primary} />
        </View>
        
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.xs }]}>
                {event.title}
              </Text>
              <Text style={[TEXT_STYLES.body2, { color: COLORS.primary, marginBottom: SPACING.xs }]}>
                {event.organizer}
              </Text>
            </View>
            <IconButton
              icon="bookmark-border"
              size={20}
              onPress={() => handleEventBookmark(event.id)}
            />
          </View>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
            {event.tags.map((tag, index) => (
              <Chip
                key={index}
                mode="outlined"
                compact
                style={{ marginRight: SPACING.xs, marginBottom: SPACING.xs }}
                textStyle={{ fontSize: 10 }}
              >
                {tag}
              </Chip>
            ))}
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.body2, { marginLeft: SPACING.xs, color: COLORS.textSecondary }]}>
              {event.date} • {event.duration}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Icon name="location-on" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.body2, { marginLeft: SPACING.xs, color: COLORS.textSecondary }]}>
              {event.location}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Icon name="school" size={16} color={COLORS.success} />
            <Text style={[TEXT_STYLES.body2, { marginLeft: SPACING.xs, color: COLORS.success }]}>
              {event.ceuCredits} CEU Credits • {event.difficulty}
            </Text>
          </View>
          
          <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary, marginBottom: SPACING.md }]}>
            {event.description}
          </Text>
          
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
              Registration Progress: {event.registered}/{event.capacity}
            </Text>
            <ProgressBar
              progress={event.registered / event.capacity}
              color={event.registered / event.capacity > 0.8 ? COLORS.warning : COLORS.success}
              style={{ height: 6, borderRadius: 3 }}
            />
          </View>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.sm,
          }}>
            <View>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                ${event.price}
              </Text>
              {event.originalPrice && event.originalPrice > event.price && (
                <Text style={[
                  TEXT_STYLES.caption,
                  { textDecorationLine: 'line-through', color: COLORS.textSecondary }
                ]}>
                  ${event.originalPrice}
                </Text>
              )}
              {event.earlyBird && (
                <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                  🎯 Early Bird Price
                </Text>
              )}
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="star" size={16} color={COLORS.warning} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 2, marginRight: SPACING.md }]}>
                {event.rating} ({event.reviewCount})
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Event Details', 'Detailed view coming soon!')}
              style={{ flex: 1, marginRight: SPACING.sm }}
            >
              View Details
            </Button>
            <Button
              mode="contained"
              onPress={() => handleEventRegistration(event.id)}
              buttonColor={COLORS.primary}
              style={{ flex: 1 }}
            >
              Register
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderDiscoverTab = () => (
    <View style={{ flex: 1 }}>
      {renderFilters()}
      
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
      }}>
        <Text style={TEXT_STYLES.h3}>🎯 Upcoming Events</Text>
        <TouchableOpacity onPress={() => Alert.alert('Sort', 'Sort options coming soon!')}>
          <Icon name="sort" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {events.map(renderEventCard)}
    </View>
  );

  const renderMyEventsTab = () => (
    <View style={{ flex: 1, padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        📅 My Registered Events ({myEvents.length})
      </Text>
      
      {myEvents.map((event) => (
        <Card key={event.id} style={{ marginBottom: SPACING.md, elevation: 2 }}>
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
              <Text style={[TEXT_STYLES.body1, { flex: 1 }]}>{event.title}</Text>
              <Chip
                mode="flat"
                compact
                style={{
                  backgroundColor: event.status === 'completed' ? COLORS.success + '20' : COLORS.primary + '20'
                }}
                textStyle={{
                  color: event.status === 'completed' ? COLORS.success : COLORS.primary
                }}
              >
                {event.status === 'completed' ? 'Completed' : 'Registered'}
              </Chip>
            </View>
            
            <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
              📅 {event.date}
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              {event.certificate && (
                <TouchableOpacity style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.success + '20',
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: SPACING.xs,
                  borderRadius: SPACING.sm,
                }}>
                  <Icon name="card-membership" size={16} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: COLORS.success }]}>
                    View Certificate
                  </Text>
                </TouchableOpacity>
              )}
              
              {event.status === 'completed' && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name="star"
                      size={16}
                      color={star <= (event.rating || 0) ? COLORS.warning : COLORS.textSecondary}
                    />
                  ))}
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      ))}
      
      {myEvents.length === 0 && (
        <View style={{ alignItems: 'center', padding: SPACING.xl }}>
          <Icon name="event-note" size={64} color={COLORS.textSecondary} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
            No events registered
          </Text>
          <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary, textAlign: 'center' }]}>
            Explore professional events to advance your career
          </Text>
        </View>
      )}
    </View>
  );

  const renderCertificatesTab = () => (
    <View style={{ flex: 1, padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        🏆 My Certificates ({certificates.length})
      </Text>
      
      {certificates.map((cert) => (
        <Card key={cert.id} style={{ marginBottom: SPACING.md, elevation: 2 }}>
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{
                width: 60,
                height: 60,
                backgroundColor: COLORS.primary + '20',
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SPACING.md,
              }}>
                <Icon name="card-membership" size={30} color={COLORS.primary} />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body1, { marginBottom: SPACING.xs }]}>
                  {cert.title}
                </Text>
                <Text style={[TEXT_STYLES.body2, { color: COLORS.primary, marginBottom: SPACING.xs }]}>
                  {cert.issuer}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
                  ID: {cert.credentialId}
                </Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      Issued: {cert.issueDate}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { 
                      color: cert.status === 'expiring_soon' ? COLORS.warning : COLORS.textSecondary 
                    }]}>
                      Expires: {cert.expiryDate}
                    </Text>
                  </View>
                  
                  <Chip
                    mode="flat"
                    compact
                    style={{
                      backgroundColor: cert.status === 'active' ? COLORS.success + '20' : COLORS.warning + '20'
                    }}
                    textStyle={{
                      color: cert.status === 'active' ? COLORS.success : COLORS.warning
                    }}
                  >
                    {cert.status === 'active' ? 'Active' : 'Expiring Soon'}
                  </Chip>
                </View>
              </View>
            </View>
            
            <View style={{
              flexDirection: 'row',
              marginTop: SPACING.md,
              justifyContent: 'space-between',
            }}>
              <Button
                mode="outlined"
                compact
                onPress={() => Alert.alert('Download', 'Certificate download coming soon!')}
                style={{ flex: 1, marginRight: SPACING.sm }}
              >
                Download PDF
              </Button>
              <Button
                mode="contained"
                compact
                onPress={() => Alert.alert('Share', 'Share certificate coming soon!')}
                buttonColor={COLORS.primary}
                style={{ flex: 1 }}
              >
                Share
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
      
      {certificates.length === 0 && (
        <View style={{ alignItems: 'center', padding: SPACING.xl }}>
          <Icon name="card-membership" size={64} color={COLORS.textSecondary} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
            No certificates yet
          </Text>
          <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary, textAlign: 'center' }]}>
            Complete certification events to earn your credentials
          </Text>
        </View>
      )}
    </View>
  );

  const renderFeaturedSection = () => {
    const featuredEvents = events.filter(event => event.featured).slice(0, 3);
    
    if (featuredEvents.length === 0) return null;
    
    return (
      <View style={{ marginBottom: SPACING.md }}>
        <Text style={[TEXT_STYLES.h3, { paddingHorizontal: SPACING.md, marginBottom: SPACING.md }]}>
          🌟 Featured Events
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: SPACING.md }}
        >
          {featuredEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={{
                width: width * 0.8,
                marginRight: SPACING.md,
              }}
              onPress={() => handleEventRegistration(event.id)}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={{
                  borderRadius: SPACING.md,
                  padding: SPACING.md,
                  minHeight: 160,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: SPACING.xs }]}>
                      {event.title}
                    </Text>
                    <Text style={[TEXT_STYLES.body2, { color: 'rgba(255,255,255,0.9)', marginBottom: SPACING.sm }]}>
                      {event.organizer}
                    </Text>
                  </View>
                  <Chip
                    mode="flat"
                    compact
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    textStyle={{ color: 'white', fontSize: 10 }}
                  >
                    {event.type}
                  </Chip>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                  <Icon name="schedule" size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)', marginLeft: SPACING.xs }]}>
                    {event.date} • {event.duration}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                  <Icon name="location-on" size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)', marginLeft: SPACING.xs }]}>
                    {event.location}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                      ${event.price}
                    </Text>
                    {event.earlyBird && (
                      <Text style={[TEXT_STYLES.caption, { color: '#FFD700' }]}>
                        🎯 Early Bird
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: 2 }]}>
                      {event.rating}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderQuickStats = () => (
    <View style={{
      flexDirection: 'row',
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.md,
    }}>
      <Surface style={{
        flex: 1,
        padding: SPACING.md,
        borderRadius: SPACING.md,
        marginRight: SPACING.sm,
        elevation: 2,
      }}>
        <Text style={[TEXT_STYLES.h2, { color: COLORS.primary, textAlign: 'center' }]}>
          {certificates.length}
        </Text>
        <Text style={[TEXT_STYLES.caption, { textAlign: 'center', color: COLORS.textSecondary }]}>
          Certificates
        </Text>
      </Surface>
      
      <Surface style={{
        flex: 1,
        padding: SPACING.md,
        borderRadius: SPACING.md,
        marginRight: SPACING.sm,
        elevation: 2,
      }}>
        <Text style={[TEXT_STYLES.h2, { color: COLORS.success, textAlign: 'center' }]}>
          {myEvents.filter(e => e.status === 'completed').length}
        </Text>
        <Text style={[TEXT_STYLES.caption, { textAlign: 'center', color: COLORS.textSecondary }]}>
          Completed
        </Text>
      </Surface>
      
      <Surface style={{
        flex: 1,
        padding: SPACING.md,
        borderRadius: SPACING.md,
        elevation: 2,
      }}>
        <Text style={[TEXT_STYLES.h2, { color: COLORS.warning, textAlign: 'center' }]}>
          {certificates.reduce((sum, cert) => {
            // Simulate CEU calculation from certificates
            return sum + (cert.title.includes('Advanced') ? 2.4 : 0.8);
          }, 0).toFixed(1)}
        </Text>
        <Text style={[TEXT_STYLES.caption, { textAlign: 'center', color: COLORS.textSecondary }]}>
          CEU Credits
        </Text>
      </Surface>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return (
          <View style={{ flex: 1 }}>
            {renderFeaturedSection()}
            {renderQuickStats()}
            {renderDiscoverTab()}
          </View>
        );
      case 'myevents':
        return renderMyEventsTab();
      case 'certificates':
        return renderCertificatesTab();
      default:
        return renderDiscoverTab();
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ProgressBar indeterminate color={COLORS.primary} style={{ width: 200 }} />
        <Text style={[TEXT_STYLES.body1, { marginTop: SPACING.md, color: COLORS.textSecondary }]}>
          Loading professional events...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      {renderTabBar()}
      
      <ScrollView
        style={{ flex: 1 }}
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
        {renderContent()}
      </ScrollView>
      
      <FAB
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        icon="add-alert"
        onPress={() => Alert.alert('Event Notifications', 'Set up event alerts and reminders coming soon!')}
      />
    </View>
  );
};

export default ProfessionalEvents;