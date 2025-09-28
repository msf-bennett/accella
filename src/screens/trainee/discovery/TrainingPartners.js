import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  FlatList,
} from 'react-native';
import {
  Card,
  Searchbar,
  Chip,
  Button,
  Surface,
  Avatar,
  IconButton,
  Portal,
  Modal,
  Badge,
  FAB,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '@react-native-blur/blur';

import { COLORS, SPACING, TEXT_STYLES } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

const ACTIVITY_TYPES = [
  { id: 'all', name: 'All', icon: 'group' },
  { id: 'running', name: 'Running', icon: 'directions-run' },
  { id: 'gym', name: 'Gym', icon: 'fitness-center' },
  { id: 'cycling', name: 'Cycling', icon: 'directions-bike' },
  { id: 'swimming', name: 'Swimming', icon: 'pool' },
  { id: 'yoga', name: 'Yoga', icon: 'self-improvement' },
  { id: 'sports', name: 'Sports', icon: 'sports' },
  { id: 'hiking', name: 'Hiking', icon: 'terrain' },
];

const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const MOCK_PARTNERS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 28,
    location: 'Downtown, 0.5 km',
    avatar: 'https://via.placeholder.com/100x100',
    fitnessLevel: 'Intermediate',
    preferredActivities: ['Running', 'Yoga', 'Gym'],
    rating: 4.9,
    completedSessions: 45,
    bio: 'Love morning runs and weekend hiking! Looking for a consistent workout buddy 💪',
    availability: ['Morning', 'Evening'],
    goals: ['Weight Loss', 'Endurance'],
    badges: ['Early Bird', 'Consistency King'],
    isOnline: true,
    matchPercentage: 95,
    mutualConnections: 3,
  },
  {
    id: '2',
    name: 'Mike Chen',
    age: 32,
    location: 'Westside, 1.2 km',
    avatar: 'https://via.placeholder.com/100x100',
    fitnessLevel: 'Advanced',
    preferredActivities: ['Gym', 'Cycling', 'Swimming'],
    rating: 4.8,
    completedSessions: 78,
    bio: 'Powerlifter and triathlete. Always up for challenging workouts and pushing limits! 🏋️‍♂️',
    availability: ['Evening', 'Weekend'],
    goals: ['Strength', 'Competition Prep'],
    badges: ['Iron Will', 'Team Player'],
    isOnline: false,
    matchPercentage: 88,
    mutualConnections: 1,
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    age: 25,
    location: 'Uptown, 2.1 km',
    avatar: 'https://via.placeholder.com/100x100',
    fitnessLevel: 'Beginner',
    preferredActivities: ['Yoga', 'Hiking', 'Dancing'],
    rating: 4.7,
    completedSessions: 12,
    bio: 'New to fitness but super motivated! Looking for patient partners to grow with 🌱',
    availability: ['Morning', 'Weekend'],
    goals: ['General Fitness', 'Flexibility'],
    badges: ['Newcomer', 'Positive Vibes'],
    isOnline: true,
    matchPercentage: 82,
    mutualConnections: 0,
  },
  {
    id: '4',
    name: 'Alex Thompson',
    age: 29,
    location: 'Central, 0.8 km',
    avatar: 'https://via.placeholder.com/100x100',
    fitnessLevel: 'Expert',
    preferredActivities: ['Sports', 'Running', 'Gym'],
    rating: 5.0,
    completedSessions: 156,
    bio: 'Former athlete, now personal trainer. Love helping others achieve their goals! 🎯',
    availability: ['All Day'],
    goals: ['Training Others', 'Fitness Maintenance'],
    badges: ['Mentor', 'Achievement Hunter', 'Perfect Score'],
    isOnline: true,
    matchPercentage: 91,
    mutualConnections: 5,
  },
];

const TrainingPartner = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('all');
  const [partners, setPartners] = useState(MOCK_PARTNERS);
  const [filteredPartners, setFilteredPartners] = useState(MOCK_PARTNERS);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const filterPartners = useCallback(() => {
    let filtered = [...partners];

    // Filter by activity
    if (selectedActivity !== 'all') {
      const activityName = ACTIVITY_TYPES.find(a => a.id === selectedActivity)?.name;
      filtered = filtered.filter(partner => 
        partner.preferredActivities.some(activity => 
          activity.toLowerCase().includes(activityName.toLowerCase())
        )
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.preferredActivities.some(activity => 
          activity.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by fitness level
    if (selectedLevel) {
      filtered = filtered.filter(partner => partner.fitnessLevel === selectedLevel);
    }

    // Filter by availability
    if (selectedAvailability) {
      filtered = filtered.filter(partner => 
        partner.availability.includes(selectedAvailability)
      );
    }

    // Sort by match percentage (highest first)
    filtered.sort((a, b) => b.matchPercentage - a.matchPercentage);

    setFilteredPartners(filtered);
  }, [partners, selectedActivity, searchQuery, selectedLevel, selectedAvailability]);

  useEffect(() => {
    filterPartners();
  }, [filterPartners]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Training partners updated! 🤝');
    }, 1000);
  }, []);

  const handlePartnerPress = (partner) => {
    Alert.alert(
      'Profile View 👤',
      `Detailed profile for ${partner.name} will open here. You'll see their full workout history, preferences, reviews, and can start a conversation!`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleConnectPartner = (partner) => {
    Alert.alert(
      'Send Connection Request? 🤝',
      `Would you like to send a connection request to ${partner.name}? You can include a message about your training goals and preferred activities.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Request', 
          style: 'default',
          onPress: () => {
            Alert.alert('Request Sent! ✅', `Your connection request has been sent to ${partner.name}. They'll be notified and can accept to start planning workouts together!`);
          }
        }
      ]
    );
  };

  const handleChatPartner = (partner) => {
    Alert.alert(
      'Direct Message 💬',
      `Chat feature with ${partner.name} is coming soon! You'll be able to discuss workout plans, schedule sessions, and share fitness tips directly in the app.`,
      [{ text: 'Notify Me', style: 'default' }]
    );
  };

  const renderActivityChip = ({ item }) => (
    <Chip
      key={item.id}
      mode={selectedActivity === item.id ? 'flat' : 'outlined'}
      selected={selectedActivity === item.id}
      onPress={() => setSelectedActivity(item.id)}
      icon={item.icon}
      style={{
        marginRight: SPACING.sm,
        backgroundColor: selectedActivity === item.id ? COLORS.primary : 'transparent',
      }}
      textStyle={{
        color: selectedActivity === item.id ? '#fff' : COLORS.text.primary,
        fontSize: 12,
      }}
    >
      {item.name}
    </Chip>
  );

  const renderPartnerCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <Card
        style={{
          marginHorizontal: SPACING.md,
          elevation: 4,
          borderRadius: 16,
          overflow: 'hidden',
        }}
        onPress={() => handlePartnerPress(item)}
      >
        {/* Match Percentage Badge */}
        <View
          style={{
            position: 'absolute',
            top: SPACING.sm,
            right: SPACING.sm,
            zIndex: 1,
            backgroundColor: item.matchPercentage >= 90 ? COLORS.success : item.matchPercentage >= 80 ? COLORS.warning : COLORS.primary,
            paddingHorizontal: SPACING.sm,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text style={[TEXT_STYLES.caption, { color: '#fff', fontWeight: '600' }]}>
            {item.matchPercentage}% Match 🎯
          </Text>
        </View>

        <Card.Content style={{ padding: SPACING.md }}>
          {/* Profile Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <View style={{ position: 'relative' }}>
              <Avatar.Image
                size={60}
                source={{ uri: item.avatar }}
                style={{ backgroundColor: COLORS.primary }}
              />
              {item.isOnline && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: COLORS.success,
                    borderWidth: 2,
                    borderColor: '#fff',
                  }}
                />
              )}
            </View>
            
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>
                  {item.name}, {item.age}
                </Text>
                {item.mutualConnections > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="people" size={14} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginLeft: 2 }]}>
                      {item.mutualConnections}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, marginBottom: 4 }]}>
                📍 {item.location}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Chip
                  mode="outlined"
                  compact
                  style={{ height: 20, marginRight: SPACING.xs }}
                  textStyle={{ fontSize: 10 }}
                >
                  {item.fitnessLevel}
                </Chip>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="star" size={14} color={COLORS.warning} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 2, fontWeight: '600' }]}>
                    {item.rating}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, marginLeft: 4 }]}>
                    ({item.completedSessions} sessions)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bio */}
          <Text style={[TEXT_STYLES.body2, { marginBottom: SPACING.md, lineHeight: 20 }]}>
            {item.bio}
          </Text>

          {/* Preferred Activities */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, marginBottom: SPACING.xs }]}>
              Preferred Activities:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {item.preferredActivities.map((activity, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={{
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                    height: 24,
                  }}
                  textStyle={{ fontSize: 10 }}
                >
                  {activity}
                </Chip>
              ))}
            </View>
          </View>

          {/* Availability & Goals */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, marginBottom: 4 }]}>
                Available:
              </Text>
              <Text style={[TEXT_STYLES.body2, { fontSize: 12 }]}>
                {item.availability.join(', ')} ⏰
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, marginBottom: 4 }]}>
                Goals:
              </Text>
              <Text style={[TEXT_STYLES.body2, { fontSize: 12 }]}>
                {item.goals.join(', ')} 🎯
              </Text>
            </View>
          </View>

          {/* Badges */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, marginBottom: SPACING.xs }]}>
              Achievements:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {item.badges.map((badge, index) => (
                <Text
                  key={index}
                  style={[
                    TEXT_STYLES.caption,
                    {
                      backgroundColor: COLORS.primary + '20',
                      color: COLORS.primary,
                      paddingHorizontal: SPACING.xs,
                      paddingVertical: 2,
                      marginRight: SPACING.xs,
                      marginBottom: 4,
                      borderRadius: 8,
                      fontSize: 10,
                      fontWeight: '600',
                    }
                  ]}
                >
                  🏆 {badge}
                </Text>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="outlined"
              onPress={() => handleChatPartner(item)}
              style={{ flex: 1, marginRight: SPACING.xs }}
              labelStyle={{ fontSize: 12 }}
              icon="chat"
            >
              Message
            </Button>
            <Button
              mode="contained"
              onPress={() => handleConnectPartner(item)}
              style={{ flex: 1, marginLeft: SPACING.xs, backgroundColor: COLORS.primary }}
              labelStyle={{ fontSize: 12 }}
              icon="person-add"
            >
              Connect 🤝
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={{
          backgroundColor: '#fff',
          marginHorizontal: SPACING.lg,
          borderRadius: 12,
          padding: SPACING.lg,
          maxHeight: '80%',
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[TEXT_STYLES.h2, { marginBottom: SPACING.md, textAlign: 'center' }]}>
            Filter Partners 🎛️
          </Text>
          
          {/* Fitness Level Filter */}
          <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>Fitness Level:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
            <TouchableOpacity
              onPress={() => setSelectedLevel('')}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.xs,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: selectedLevel === '' ? COLORS.primary : COLORS.text.secondary,
                backgroundColor: selectedLevel === '' ? COLORS.primary + '20' : 'transparent',
                marginRight: SPACING.sm,
                marginBottom: SPACING.xs,
              }}
            >
              <Text style={{
                color: selectedLevel === '' ? COLORS.primary : COLORS.text.secondary,
                fontSize: 12,
              }}>
                Any Level
              </Text>
            </TouchableOpacity>
            {FITNESS_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setSelectedLevel(level)}
                style={{
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.xs,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: selectedLevel === level ? COLORS.primary : COLORS.text.secondary,
                  backgroundColor: selectedLevel === level ? COLORS.primary + '20' : 'transparent',
                  marginRight: SPACING.sm,
                  marginBottom: SPACING.xs,
                }}
              >
                <Text style={{
                  color: selectedLevel === level ? COLORS.primary : COLORS.text.secondary,
                  fontSize: 12,
                }}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Availability Filter */}
          <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>Availability:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
            {['', 'Morning', 'Evening', 'Weekend', 'All Day'].map((availability) => (
              <TouchableOpacity
                key={availability}
                onPress={() => setSelectedAvailability(availability)}
                style={{
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.xs,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: selectedAvailability === availability ? COLORS.primary : COLORS.text.secondary,
                  backgroundColor: selectedAvailability === availability ? COLORS.primary + '20' : 'transparent',
                  marginRight: SPACING.sm,
                  marginBottom: SPACING.xs,
                }}
              >
                <Text style={{
                  color: selectedAvailability === availability ? COLORS.primary : COLORS.text.secondary,
                  fontSize: 12,
                }}>
                  {availability || 'Any Time'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md }}>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedLevel('');
                setSelectedAvailability('');
              }}
              style={{ flex: 1, marginRight: SPACING.xs }}
            >
              Clear Filters
            </Button>
            <Button
              mode="contained"
              onPress={() => setShowFilterModal(false)}
              style={{ flex: 1, marginLeft: SPACING.xs, backgroundColor: COLORS.primary }}
            >
              Apply Filters ✨
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingBottom: SPACING.md,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h1, { color: '#fff' }]}>
            Training Partners 🤝
          </Text>
          <IconButton
            icon="tune"
            iconColor="#fff"
            size={24}
            onPress={() => setShowFilterModal(true)}
          />
        </View>

        <Searchbar
          placeholder="Search by name, interests, or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 25,
            elevation: 0,
          }}
          inputStyle={{ fontSize: 14 }}
          icon="search"
        />
      </LinearGradient>

      {/* Activity Filter Chips */}
      <View style={{ paddingVertical: SPACING.md }}>
        <FlatList
          horizontal
          data={ACTIVITY_TYPES}
          renderItem={renderActivityChip}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        />
      </View>

      {/* Results Count */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm 
      }}>
        <Text style={[TEXT_STYLES.body2, { color: COLORS.text.secondary }]}>
          {filteredPartners.length} training partners found
        </Text>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
          Sorted by match % 📊
        </Text>
      </View>

      {/* Partners List */}
      <FlatList
        data={filteredPartners}
        renderItem={renderPartnerCard}
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
        ListEmptyComponent={
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingVertical: SPACING.xxl 
          }}>
            <Icon name="group-off" size={64} color={COLORS.text.secondary} />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text.secondary, marginTop: SPACING.md }]}>
              No training partners found
            </Text>
            <Text style={[TEXT_STYLES.body2, { color: COLORS.text.secondary, textAlign: 'center', marginTop: SPACING.sm, paddingHorizontal: SPACING.lg }]}>
              Try adjusting your search or filters to find more compatible workout buddies 🔍
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: SPACING.xl }}
      />

      {/* Create Profile FAB */}
      <FAB
        icon="person-add"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Alert.alert(
            'Create Training Profile 📝',
            'Set up your training partner profile to let others find you! Include your fitness level, preferred activities, goals, and availability.',
            [{ text: 'Get Started', style: 'default' }]
          );
        }}
      />

      {renderFilterModal()}
    </View>
  );
};

export default TrainingPartner;