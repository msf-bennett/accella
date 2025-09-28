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

const MentorshipNetwork = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mentors, setMentors] = useState([]);
  const [connections, setConnections] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activeTab, setActiveTab] = useState('discover');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample data - would come from API
  const sampleMentors = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Elite Athletic Performance Coach',
      specializations: ['Strength Training', 'Olympic Lifting', 'Sports Psychology'],
      experience: '15+ years',
      rating: 4.9,
      reviewCount: 127,
      location: 'New York, NY',
      avatar: 'https://via.placeholder.com/100',
      verified: true,
      mentorshipType: 'Professional',
      price: '$150/session',
      badges: ['Top Mentor', 'Expert'],
      completedMentorships: 43,
      responseTime: '< 2 hours',
    },
    {
      id: 2,
      name: 'Marcus Williams',
      title: 'Functional Movement Specialist',
      specializations: ['Corrective Exercise', 'Injury Prevention', 'Movement Assessment'],
      experience: '12+ years',
      rating: 4.8,
      reviewCount: 89,
      location: 'Los Angeles, CA',
      avatar: 'https://via.placeholder.com/100',
      verified: true,
      mentorshipType: 'Technical',
      price: '$120/session',
      badges: ['Rising Star', 'Specialist'],
      completedMentorships: 28,
      responseTime: '< 4 hours',
    },
    {
      id: 3,
      name: 'Dr. Emily Chen',
      title: 'Sports Science & Nutrition Expert',
      specializations: ['Exercise Physiology', 'Nutrition Planning', 'Recovery Protocols'],
      experience: '18+ years',
      rating: 5.0,
      reviewCount: 156,
      location: 'San Francisco, CA',
      avatar: 'https://via.placeholder.com/100',
      verified: true,
      mentorshipType: 'Academic',
      price: '$200/session',
      badges: ['Top Mentor', 'PhD', 'Research Leader'],
      completedMentorships: 67,
      responseTime: '< 1 hour',
    },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: 'explore' },
    { id: 'strength', label: 'Strength', icon: 'fitness-center' },
    { id: 'cardio', label: 'Cardio', icon: 'directions-run' },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
    { id: 'psychology', label: 'Psychology', icon: 'psychology' },
    { id: 'business', label: 'Business', icon: 'business' },
  ];

  const sampleOpportunities = [
    {
      id: 1,
      title: 'Advanced Periodization Workshop',
      organizer: 'Elite Training Institute',
      date: '2024-09-15',
      type: 'Workshop',
      price: 'Free',
      participants: 45,
      maxParticipants: 50,
      difficulty: 'Advanced',
    },
    {
      id: 2,
      title: 'Mentorship Circle: Building Your Brand',
      organizer: 'Fitness Professionals Network',
      date: '2024-09-20',
      type: 'Mentorship Circle',
      price: '$25',
      participants: 12,
      maxParticipants: 15,
      difficulty: 'Intermediate',
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
        loadMentors(),
        loadConnections(),
        loadOpportunities(),
      ]);
    } catch (error) {
      console.error('Error initializing screen:', error);
      Alert.alert('Error', 'Failed to load mentorship network data');
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

  const loadMentors = async () => {
    // Simulate API call
    setTimeout(() => setMentors(sampleMentors), 1000);
  };

  const loadConnections = async () => {
    // Simulate API call - load existing connections
    const mockConnections = [
      { id: 1, name: 'John Trainer', lastActive: '2 hours ago', status: 'online' },
      { id: 2, name: 'Lisa Coach', lastActive: '1 day ago', status: 'offline' },
    ];
    setTimeout(() => setConnections(mockConnections), 1000);
  };

  const loadOpportunities = async () => {
    setTimeout(() => setOpportunities(sampleOpportunities), 1000);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeScreen();
    setRefreshing(false);
  }, []);

  const handleConnectRequest = (mentorId) => {
    Alert.alert(
      'Send Connection Request',
      'Would you like to send a connection request to this mentor?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: () => {
            Alert.alert('Success', 'Connection request sent successfully!');
            // Here you would dispatch an action to send the request
          },
        },
      ]
    );
  };

  const handleBookSession = (mentorId) => {
    Alert.alert(
      'Book Mentorship Session',
      'This feature will redirect you to the booking system.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => navigation.navigate('BookingSystem', { mentorId }),
        },
      ]
    );
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
          🤝 Mentorship Network
        </Text>
        <IconButton
          icon="notifications"
          iconColor="white"
          size={24}
          onPress={() => Alert.alert('Notifications', 'Feature coming soon!')}
        />
      </View>
      
      <Searchbar
        placeholder="Search mentors, skills, or locations..."
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
        { id: 'connections', label: 'My Network', icon: 'people' },
        { id: 'opportunities', label: 'Opportunities', icon: 'event' },
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

  const renderCategoryFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
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
  );

  const renderMentorCard = (mentor) => (
    <Animated.View
      key={mentor.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <Card style={{ marginHorizontal: SPACING.md, elevation: 3 }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ position: 'relative' }}>
              <Avatar.Image size={60} source={{ uri: mentor.avatar }} />
              {mentor.verified && (
                <View style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  backgroundColor: COLORS.success,
                  borderRadius: 10,
                  padding: 2,
                }}>
                  <Icon name="verified" size={12} color="white" />
                </View>
              )}
            </View>
            
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>{mentor.name}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 2 }]}>
                    {mentor.rating} ({mentor.reviewCount})
                  </Text>
                </View>
              </View>
              
              <Text style={[TEXT_STYLES.body2, { color: COLORS.primary, marginBottom: SPACING.xs }]}>
                {mentor.title}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                <Icon name="location-on" size={14} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
                  {mentor.location}
                </Text>
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.md, color: COLORS.textSecondary }]}>
                  {mentor.experience}
                </Text>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.sm }}>
                {mentor.specializations.map((spec, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    compact
                    style={{ marginRight: SPACING.xs }}
                    textStyle={{ fontSize: 10 }}
                  >
                    {spec}
                  </Chip>
                ))}
              </ScrollView>
              
              <View style={{ flexDirection: 'row', marginBottom: SPACING.sm }}>
                {mentor.badges.map((badge, index) => (
                  <Chip
                    key={index}
                    mode="flat"
                    compact
                    style={{
                      marginRight: SPACING.xs,
                      backgroundColor: COLORS.primary + '20',
                    }}
                    textStyle={{ fontSize: 10, color: COLORS.primary }}
                  >
                    {badge}
                  </Chip>
                ))}
              </View>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: SPACING.sm,
              }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  💼 {mentor.completedMentorships} mentorships completed
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                  ⚡ Responds in {mentor.responseTime}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                  {mentor.price}
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleConnectRequest(mentor.id)}
                    style={{ marginRight: SPACING.sm }}
                  >
                    Connect
                  </Button>
                  <Button
                    mode="contained"
                    compact
                    onPress={() => handleBookSession(mentor.id)}
                    buttonColor={COLORS.primary}
                  >
                    Book Session
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderDiscoverTab = () => (
    <View style={{ flex: 1 }}>
      {renderCategoryFilters()}
      
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
      }}>
        <Text style={TEXT_STYLES.h3}>✨ Top Mentors</Text>
        <TouchableOpacity onPress={() => Alert.alert('Filters', 'Advanced filters coming soon!')}>
          <Icon name="tune" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {mentors.map(renderMentorCard)}
    </View>
  );

  const renderConnectionsTab = () => (
    <View style={{ flex: 1, padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        👥 My Network ({connections.length})
      </Text>
      
      {connections.map((connection) => (
        <Card key={connection.id} style={{ marginBottom: SPACING.md, elevation: 2 }}>
          <Card.Content style={{ flexDirection: 'row', alignItems: 'center', padding: SPACING.md }}>
            <Avatar.Text size={50} label={connection.name.split(' ').map(n => n[0]).join('')} />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={TEXT_STYLES.body1}>{connection.name}</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Last active: {connection.lastActive}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: connection.status === 'online' ? COLORS.success : COLORS.textSecondary,
                marginBottom: SPACING.xs,
              }} />
              <IconButton
                icon="message"
                size={20}
                onPress={() => Alert.alert('Message', 'Chat feature coming soon!')}
              />
            </View>
          </Card.Content>
        </Card>
      ))}
      
      {connections.length === 0 && (
        <View style={{ alignItems: 'center', padding: SPACING.xl }}>
          <Icon name="people-outline" size={64} color={COLORS.textSecondary} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
            No connections yet
          </Text>
          <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary, textAlign: 'center' }]}>
            Start connecting with mentors to build your professional network
          </Text>
        </View>
      )}
    </View>
  );

  const renderOpportunitiesTab = () => (
    <View style={{ flex: 1, padding: SPACING.md }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        🎯 Learning Opportunities
      </Text>
      
      {opportunities.map((opportunity) => (
        <Card key={opportunity.id} style={{ marginBottom: SPACING.md, elevation: 2 }}>
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
              <Text style={TEXT_STYLES.h3}>{opportunity.title}</Text>
              <Chip mode="outlined" compact>
                {opportunity.type}
              </Chip>
            </View>
            
            <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary, marginBottom: SPACING.sm }]}>
              By {opportunity.organizer}
            </Text>
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.sm,
            }}>
              <Text style={[TEXT_STYLES.body2, { color: COLORS.primary }]}>
                📅 {opportunity.date}
              </Text>
              <Text style={[TEXT_STYLES.body2, { color: COLORS.success, fontWeight: '600' }]}>
                {opportunity.price}
              </Text>
            </View>
            
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
                {opportunity.participants}/{opportunity.maxParticipants} participants
              </Text>
              <ProgressBar
                progress={opportunity.participants / opportunity.maxParticipants}
                color={COLORS.primary}
                style={{ height: 6, borderRadius: 3 }}
              />
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip
                mode="outlined"
                compact
                icon="trending-up"
                textStyle={{ fontSize: 12 }}
              >
                {opportunity.difficulty}
              </Chip>
              <Button
                mode="contained"
                compact
                onPress={() => Alert.alert('Join Opportunity', 'Registration feature coming soon!')}
                buttonColor={COLORS.primary}
              >
                Join
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return renderDiscoverTab();
      case 'connections':
        return renderConnectionsTab();
      case 'opportunities':
        return renderOpportunitiesTab();
      default:
        return renderDiscoverTab();
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ProgressBar indeterminate color={COLORS.primary} style={{ width: 200 }} />
        <Text style={[TEXT_STYLES.body1, { marginTop: SPACING.md, color: COLORS.textSecondary }]}>
          Loading mentorship network...
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
        icon="add"
        onPress={() => Alert.alert('Become a Mentor', 'Mentor application feature coming soon!')}
      />
    </View>
  );
};

export default MentorshipNetwork;