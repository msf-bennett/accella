import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  Vibration,
  FlatList,
  Modal,
  BackHandler,
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
  Portal,
  Badge,
  Divider,
  TextInput,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/styles';

const { width, height } = Dimensions.get('window');

const VideoConsultation = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { consultations, activeCall } = useSelector(state => state.consultation);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const callTimer = useRef(null);

  const filterOptions = [
    { key: 'upcoming', label: 'Upcoming', icon: 'schedule' },
    { key: 'completed', label: 'Completed', icon: 'check-circle' },
    { key: 'cancelled', label: 'Cancelled', icon: 'cancel' },
    { key: 'available', label: 'Book Session', icon: 'video-call' },
  ];

  useEffect(() => {
    loadConsultations();
    animateEntrance();
    
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => {
      backHandler.remove();
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (callStatus === 'connected') {
      callTimer.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimer.current) {
        clearInterval(callTimer.current);
        callTimer.current = null;
      }
    }

    return () => {
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
    };
  }, [callStatus]);

  const handleBackPress = () => {
    if (showCallInterface && callStatus === 'connected') {
      Alert.alert(
        "End Call?",
        "Are you sure you want to end the video consultation?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "End Call", onPress: handleEndCall, style: "destructive" }
        ]
      );
      return true;
    }
    return false;
  };

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadConsultations = useCallback(async () => {
    try {
      // dispatch(loadUserConsultations(user.id));
    } catch (error) {
      console.error('Error loading consultations:', error);
      Alert.alert('Error', 'Failed to load consultations');
    }
  }, [dispatch, user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConsultations();
    setRefreshing(false);
  }, [loadConsultations]);

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = (consultation) => {
    Vibration.vibrate(100);
    setCallStatus('connecting');
    setCallDuration(0);
    setShowCallInterface(true);
    
    // Simulate connection
    setTimeout(() => {
      setCallStatus('connected');
      Alert.alert('Connected! 🎥', 'Your video consultation has started');
    }, 2000);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setCallDuration(0);
    setShowCallInterface(false);
    setShowChat(false);
    setChatMessages([]);
    
    Alert.alert(
      'Call Ended',
      'Thank you for your consultation! Please leave feedback to help improve our service.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Leave Feedback', onPress: () => navigation.navigate('Feedback') }
      ]
    );
  };

  const handleBookConsultation = (coach) => {
    setSelectedCoach(coach);
    setShowBookingModal(true);
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      const newMessage = {
        id: Date.now(),
        text: chatInput.trim(),
        sender: user.name,
        timestamp: new Date().toLocaleTimeString(),
        isOwn: true,
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    Vibration.vibrate(50);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    Vibration.vibrate(50);
  };

  // Mock consultation data
  const mockConsultations = [
    {
      id: 1,
      coachName: "Sarah Johnson",
      coachTitle: "Certified Personal Trainer",
      coachAvatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=667eea&color=fff",
      date: "2024-08-25",
      time: "10:00 AM",
      duration: 60,
      status: "upcoming",
      type: "fitness-assessment",
      price: 75,
      rating: 4.9,
      specialties: ["Weight Loss", "Strength Training", "Nutrition"],
      description: "Initial fitness assessment and personalized workout plan creation",
    },
    {
      id: 2,
      coachName: "Mike Chen",
      coachTitle: "Sports Physiotherapist",
      coachAvatar: "https://ui-avatars.com/api/?name=Mike+Chen&background=764ba2&color=fff",
      date: "2024-08-24",
      time: "3:00 PM",
      duration: 45,
      status: "completed",
      type: "injury-recovery",
      price: 90,
      rating: 5.0,
      specialties: ["Injury Recovery", "Mobility", "Pain Management"],
      description: "Shoulder injury recovery session with exercise modifications",
    },
    {
      id: 3,
      coachName: "Emma Rodriguez",
      coachTitle: "Yoga & Mindfulness Coach",
      coachAvatar: "https://ui-avatars.com/api/?name=Emma+Rodriguez&background=28a745&color=fff",
      date: "2024-08-26",
      time: "7:00 AM",
      duration: 30,
      status: "upcoming",
      type: "wellness",
      price: 50,
      rating: 4.8,
      specialties: ["Yoga", "Meditation", "Stress Relief"],
      description: "Morning wellness session focusing on flexibility and mindfulness",
    }
  ];

  const mockAvailableCoaches = [
    {
      id: 4,
      name: "David Thompson",
      title: "Olympic Weightlifting Coach",
      avatar: "https://ui-avatars.com/api/?name=David+Thompson&background=dc3545&color=fff",
      rating: 4.9,
      reviews: 127,
      price: 120,
      specialties: ["Olympic Lifting", "Powerlifting", "Competition Prep"],
      available: "Today, 2:00 PM",
      experience: "15+ years",
    },
    {
      id: 5,
      name: "Lisa Park",
      title: "Nutrition Specialist",
      avatar: "https://ui-avatars.com/api/?name=Lisa+Park&background=ffc107&color=000",
      rating: 4.7,
      reviews: 89,
      price: 85,
      specialties: ["Sports Nutrition", "Meal Planning", "Weight Management"],
      available: "Tomorrow, 9:00 AM",
      experience: "8+ years",
    }
  ];

  const filteredConsultations = mockConsultations.filter(consultation => {
    const matchesSearch = consultation.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         consultation.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         consultation.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === 'available') {
      return false; // Show available coaches instead
    }
    
    return matchesSearch && consultation.status === selectedFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return COLORS.primary;
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return 'schedule';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help-circle';
    }
  };

  const renderConsultationCard = ({ item }) => (
    <Animated.View
      style={[
        styles.consultationCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          if (item.status === 'upcoming') {
            Alert.alert(
              "Join Consultation",
              `Ready to join your session with ${item.coachName}?`,
              [
                { text: "Cancel", style: "cancel" },
                { text: "Join Call", onPress: () => handleStartCall(item) }
              ]
            );
          }
        }}
        style={styles.consultationTouchable}
        activeOpacity={0.7}
      >
        <Surface style={styles.consultationSurface}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
            style={styles.consultationGradient}
          >
            {/* Header */}
            <View style={styles.consultationHeader}>
              <View style={styles.coachInfo}>
                <Avatar.Image
                  size={50}
                  source={{ uri: item.coachAvatar }}
                  style={styles.coachAvatar}
                />
                <View style={styles.coachDetails}>
                  <Text style={styles.coachName}>{item.coachName}</Text>
                  <Text style={styles.coachTitle}>{item.coachTitle}</Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={14} color={COLORS.warning} />
                    <Text style={styles.rating}>{item.rating}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.statusContainer}>
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
                  textStyle={{ color: getStatusColor(item.status) }}
                  icon={getStatusIcon(item.status)}
                >
                  {item.status.toUpperCase()}
                </Chip>
                <Text style={styles.price}>${item.price}</Text>
              </View>
            </View>

            {/* Session Details */}
            <View style={styles.sessionDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Icon name="event" size={16} color={COLORS.primary} />
                  <Text style={styles.detailText}>
                    {new Date(item.date).toLocaleDateString()} at {item.time}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Icon name="schedule" size={16} color={COLORS.primary} />
                  <Text style={styles.detailText}>{item.duration} minutes</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="category" size={16} color={COLORS.primary} />
                  <Text style={styles.detailText}>{item.type.replace('-', ' ')}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description}>{item.description}</Text>

            {/* Specialties */}
            <View style={styles.specialtiesContainer}>
              {item.specialties.slice(0, 3).map((specialty, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={styles.specialtyChip}
                >
                  {specialty}
                </Chip>
              ))}
            </View>

            {/* Action Buttons */}
            {item.status === 'upcoming' && (
              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  onPress={() => handleStartCall(item)}
                  style={styles.joinButton}
                  icon="video-call"
                >
                  Join Call
                </Button>
                <IconButton
                  icon="chat"
                  size={20}
                  onPress={() => Alert.alert('Chat', 'Pre-call messaging coming soon!')}
                />
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => Alert.alert('Options', 'Session options coming soon!')}
                />
              </View>
            )}

            {item.status === 'completed' && (
              <View style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('SessionNotes', { sessionId: item.id })}
                  style={styles.actionButton}
                  icon="note"
                >
                  View Notes
                </Button>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('Feedback', { sessionId: item.id })}
                  style={styles.actionButton}
                  icon="rate-review"
                >
                  Rate Session
                </Button>
              </View>
            )}
          </LinearGradient>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderAvailableCoach = ({ item }) => (
    <Animated.View
      style={[
        styles.coachCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Surface style={styles.coachSurface}>
        <View style={styles.coachCardContent}>
          <View style={styles.coachHeader}>
            <Avatar.Image
              size={60}
              source={{ uri: item.avatar }}
              style={styles.coachCardAvatar}
            />
            <View style={styles.coachInfo}>
              <Text style={styles.coachName}>{item.name}</Text>
              <Text style={styles.coachTitle}>{item.title}</Text>
              <View style={styles.coachMeta}>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={14} color={COLORS.warning} />
                  <Text style={styles.rating}>{item.rating}</Text>
                  <Text style={styles.reviews}>({item.reviews})</Text>
                </View>
                <Text style={styles.experience}>{item.experience}</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${item.price}</Text>
              <Text style={styles.priceLabel}>per session</Text>
            </View>
          </View>

          <View style={styles.specialtiesContainer}>
            {item.specialties.map((specialty, index) => (
              <Chip
                key={index}
                mode="outlined"
                compact
                style={styles.specialtyChip}
              >
                {specialty}
              </Chip>
            ))}
          </View>

          <View style={styles.availabilityContainer}>
            <Icon name="schedule" size={16} color={COLORS.success} />
            <Text style={styles.availabilityText}>Available: {item.available}</Text>
          </View>

          <Button
            mode="contained"
            onPress={() => handleBookConsultation(item)}
            style={styles.bookButton}
            icon="video-call"
          >
            Book Consultation
          </Button>
        </View>
      </Surface>
    </Animated.View>
  );

  const renderCallInterface = () => (
    <Modal
      visible={showCallInterface}
      animationType="slide"
      onRequestClose={() => {
        if (callStatus === 'connected') {
          handleBackPress();
        } else {
          setShowCallInterface(false);
        }
      }}
    >
      <View style={styles.callContainer}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        
        {/* Call Header */}
        <View style={styles.callHeader}>
          <Text style={styles.callTitle}>
            {callStatus === 'connecting' ? 'Connecting...' : 'Video Consultation'}
          </Text>
          {callStatus === 'connected' && (
            <Text style={styles.callDuration}>{formatCallDuration(callDuration)}</Text>
          )}
        </View>

        {/* Video Area */}
        <View style={styles.videoContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.videoPlaceholder}
          >
            <Icon 
              name={isVideoEnabled ? 'videocam' : 'videocam-off'} 
              size={80} 
              color="white" 
            />
            <Text style={styles.videoPlaceholderText}>
              {callStatus === 'connecting' ? 'Connecting to coach...' : 'Coach Video Feed'}
            </Text>
          </LinearGradient>

          {/* Small Self Video */}
          <Surface style={styles.selfVideoContainer}>
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
              style={styles.selfVideo}
            >
              <Icon 
                name={isVideoEnabled ? 'account-circle' : 'videocam-off'} 
                size={40} 
                color="white" 
              />
            </LinearGradient>
          </Surface>
        </View>

        {/* Call Controls */}
        <View style={styles.callControls}>
          <TouchableOpacity
            style={[styles.controlButton, !isAudioEnabled && styles.controlButtonMuted]}
            onPress={toggleAudio}
          >
            <Icon 
              name={isAudioEnabled ? 'mic' : 'mic-off'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !isVideoEnabled && styles.controlButtonMuted]}
            onPress={toggleVideo}
          >
            <Icon 
              name={isVideoEnabled ? 'videocam' : 'videocam-off'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowChat(!showChat)}
          >
            <Icon name="chat" size={24} color="white" />
            {chatMessages.length > 0 && (
              <Badge style={styles.chatBadge}>{chatMessages.length}</Badge>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={handleEndCall}
          >
            <Icon name="call-end" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Chat Overlay */}
        {showChat && (
          <View style={styles.chatOverlay}>
            <Surface style={styles.chatContainer}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatTitle}>Session Chat</Text>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => setShowChat(false)}
                />
              </View>
              
              <ScrollView style={styles.chatMessages}>
                {chatMessages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.chatMessage,
                      message.isOwn && styles.ownChatMessage
                    ]}
                  >
                    <Text style={styles.chatMessageText}>{message.text}</Text>
                    <Text style={styles.chatMessageTime}>{message.timestamp}</Text>
                  </View>
                ))}
              </ScrollView>
              
              <View style={styles.chatInput}>
                <TextInput
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Type a message..."
                  style={styles.chatTextInput}
                  mode="outlined"
                  dense
                />
                <IconButton
                  icon="send"
                  onPress={handleSendMessage}
                  disabled={!chatInput.trim()}
                />
              </View>
            </Surface>
          </View>
        )}
      </View>
    </Modal>
  );

  const renderBookingModal = () => (
    <Portal>
      <Modal
        visible={showBookingModal}
        onDismiss={() => setShowBookingModal(false)}
        contentContainerStyle={styles.bookingModal}
      >
        <Surface style={styles.bookingContent}>
          <Text style={styles.bookingTitle}>Book Consultation</Text>
          {selectedCoach && (
            <>
              <View style={styles.selectedCoachInfo}>
                <Avatar.Image
                  size={50}
                  source={{ uri: selectedCoach.avatar }}
                />
                <View style={styles.selectedCoachDetails}>
                  <Text style={styles.selectedCoachName}>{selectedCoach.name}</Text>
                  <Text style={styles.selectedCoachTitle}>{selectedCoach.title}</Text>
                </View>
              </View>
              
              <Text style={styles.bookingPrice}>Session Fee: ${selectedCoach.price}</Text>
              
              <Button
                mode="contained"
                onPress={() => {
                  Alert.alert(
                    'Booking Confirmed! 🎉',
                    `Your consultation with ${selectedCoach.name} has been scheduled.`,
                    [{ text: 'OK', onPress: () => setShowBookingModal(false) }]
                  );
                }}
                style={styles.confirmBookingButton}
                icon="check"
              >
                Confirm Booking
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => setShowBookingModal(false)}
                style={styles.cancelBookingButton}
              >
                Cancel
              </Button>
            </>
          )}
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Video Consultations</Text>
          <IconButton
            icon="video-plus"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('Quick Book', 'Quick booking feature coming soon!')}
          />
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search coaches or specialties..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <Surface style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="video-call" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>
              {mockConsultations.filter(c => c.status === 'upcoming').length}
            </Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="check-circle" size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>
              {mockConsultations.filter(c => c.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="schedule" size={24} color={COLORS.warning} />
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="star" size={24} color={COLORS.warning} />
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      </Surface>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <Chip
            key={option.key}
            mode={selectedFilter === option.key ? 'flat' : 'outlined'}
            selected={selectedFilter === option.key}
            onPress={() => setSelectedFilter(option.key)}
            style={[
              styles.filterChip,
              selectedFilter === option.key && styles.selectedFilterChip,
            ]}
            icon={option.icon}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Content */}
      <FlatList
        data={selectedFilter === 'available' ? mockAvailableCoaches : filteredConsultations}
        renderItem={selectedFilter === 'available' ? renderAvailableCoach : renderConsultationCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.contentList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon 
              name={selectedFilter === 'available' ? 'video-call' : 'event-busy'} 
              size={64} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.emptyText}>
              {selectedFilter === 'available' ? 'No coaches available' : 'No consultations found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'available' 
                ? 'Try checking back later for available coaches'
                : searchQuery ? 'Try adjusting your search' : 'Book your first consultation to get started'
              }
            </Text>
          </View>
        }
      />

      {/* FAB for Quick Actions */}
      <FAB
        icon="video-plus"
        style={styles.fab}
        onPress={() => setSelectedFilter('available')}
        color="white"
      />

      {/* Call Interface */}
      {renderCallInterface()}

      {/* Booking Modal */}
      {renderBookingModal()}
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.header,
    color: 'white',
  },
  searchContainer: {
    marginTop: SPACING.sm,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 0,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  statsContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  filterContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginHorizontal: SPACING.xs,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  contentList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 80,
  },
  
  // Consultation Card Styles
  consultationCard: {
    marginBottom: SPACING.md,
  },
  consultationTouchable: {
    borderRadius: 12,
  },
  consultationSurface: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  consultationGradient: {
    padding: SPACING.md,
    borderRadius: 12,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  coachInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  coachAvatar: {
    marginRight: SPACING.sm,
  },
  coachDetails: {
    flex: 1,
  },
  coachName: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  coachTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  reviews: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 28,
    marginBottom: SPACING.xs,
  },
  price: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  priceLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  sessionDetails: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  specialtyChip: {
    height: 28,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  joinButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  
  // Coach Card Styles (for available coaches)
  coachCard: {
    marginBottom: SPACING.md,
  },
  coachSurface: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  coachCardContent: {
    padding: SPACING.md,
  },
  coachHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  coachCardAvatar: {
    marginRight: SPACING.sm,
  },
  coachMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  experience: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginLeft: SPACING.sm,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    padding: SPACING.xs,
    borderRadius: 8,
  },
  availabilityText: {
    ...TEXT_STYLES.body,
    color: COLORS.success,
    marginLeft: SPACING.xs,
  },
  bookButton: {
    marginTop: SPACING.sm,
  },
  
  // Call Interface Styles
  callContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  callHeader: {
    padding: SPACING.md,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  callTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  callDuration: {
    ...TEXT_STYLES.body,
    color: 'white',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginTop: SPACING.sm,
  },
  selfVideoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selfVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    position: 'relative',
  },
  controlButtonMuted: {
    backgroundColor: COLORS.error,
  },
  endCallButton: {
    backgroundColor: COLORS.error,
  },
  chatBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
  },
  
  // Chat Overlay Styles
  chatOverlay: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 300,
    height: 400,
  },
  chatContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  chatTitle: {
    ...TEXT_STYLES.h4,
    color: 'white',
  },
  chatMessages: {
    flex: 1,
    padding: SPACING.sm,
  },
  chatMessage: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.xs,
    maxWidth: '80%',
  },
  ownChatMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
  },
  chatMessageText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
  },
  chatMessageTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  chatTextInput: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  
  // Booking Modal Styles
  bookingModal: {
    margin: SPACING.lg,
    justifyContent: 'center',
  },
  bookingContent: {
    padding: SPACING.lg,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  bookingTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  selectedCoachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  selectedCoachDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  selectedCoachName: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
  },
  selectedCoachTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  bookingPrice: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  confirmBookingButton: {
    marginBottom: SPACING.sm,
  },
  cancelBookingButton: {
    marginBottom: 0,
  },
  
  // Empty State Styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  
  // FAB Styles
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default VideoConsultation;