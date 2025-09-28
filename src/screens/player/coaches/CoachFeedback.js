import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  Alert,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Vibration,
} from 'react-native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
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
  ProgressBar,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CoachFeedback = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { feedbackHistory, loading } = useSelector(state => state.feedback);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Feedback form state
  const [overallRating, setOverallRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [knowledgeRating, setKnowledgeRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [adaptabilityRating, setAdaptabilityRating] = useState(0);
  const [writtenFeedback, setWrittenFeedback] = useState('');
  const [recommendToOthers, setRecommendToOthers] = useState(null);
  const [submissionGoals, setSubmissionGoals] = useState([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Mock data - replace with Redux actions
  const mockSessions = [
    {
      id: '1',
      coach: {
        id: 'c1',
        name: 'Sarah Johnson',
        sport: 'Football',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      },
      date: '2025-08-15',
      time: '16:00',
      duration: 90,
      type: '1-on-1 Training',
      location: 'Nairobi Sports Center',
      status: 'completed',
      feedbackGiven: false,
      sessionGoals: ['Improve ball control', 'Work on shooting technique'],
      notes: 'Great session focused on technical skills',
    },
    {
      id: '2',
      coach: {
        id: 'c2',
        name: 'Michael Ochieng',
        sport: 'Basketball',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      date: '2025-08-12',
      time: '18:00',
      duration: 60,
      type: 'Group Session',
      location: 'Westlands Court',
      status: 'completed',
      feedbackGiven: true,
      rating: 4.5,
      feedback: 'Excellent coaching, very motivational and knowledgeable.',
      sessionGoals: ['Team coordination', 'Defensive strategies'],
    },
    {
      id: '3',
      coach: {
        id: 'c3',
        name: 'Grace Wanjiku',
        sport: 'Tennis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      },
      date: '2025-08-10',
      time: '10:00',
      duration: 75,
      type: 'Assessment Session',
      location: 'Karen Tennis Club',
      status: 'completed',
      feedbackGiven: true,
      rating: 4.8,
      feedback: 'Amazing technical assessment, very detailed feedback provided.',
      sessionGoals: ['Skill assessment', 'Training plan development'],
    },
  ];

  const feedbackCategories = [
    { key: 'communication', label: 'Communication', icon: 'chat' },
    { key: 'knowledge', label: 'Knowledge', icon: 'school' },
    { key: 'punctuality', label: 'Punctuality', icon: 'schedule' },
    { key: 'adaptability', label: 'Adaptability', icon: 'tune' },
  ];

  const goalOptions = [
    'Session goals were achieved',
    'Learned new techniques',
    'Improved confidence',
    'Better understanding of fundamentals',
    'Motivation increased',
    'Clear next steps provided',
  ];

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch action to fetch feedback history
      Alert.alert('Success', 'Feedback history updated! ⭐');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh feedback history');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Star rating component
  const StarRating = ({ rating, setRating, size = 24, editable = true }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => {
            if (editable) {
              setRating(star);
              Vibration.vibrate(50);
            }
          }}
          disabled={!editable}
        >
          <Icon
            name={star <= rating ? 'star' : 'star-border'}
            size={size}
            color={star <= rating ? '#FFD700' : COLORS.textSecondary}
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  // Submit feedback
  const handleSubmitFeedback = useCallback(async () => {
    if (overallRating === 0) {
      Alert.alert('Required', 'Please provide an overall rating');
      return;
    }

    try {
      const feedbackData = {
        sessionId: selectedSession.id,
        coachId: selectedSession.coach.id,
        ratings: {
          overall: overallRating,
          communication: communicationRating,
          knowledge: knowledgeRating,
          punctuality: punctualityRating,
          adaptability: adaptabilityRating,
        },
        writtenFeedback,
        recommendToOthers,
        submissionGoals,
        timestamp: new Date().toISOString(),
      };

      // Dispatch feedback submission action
      // await dispatch(submitCoachFeedback(feedbackData));

      setFeedbackModalVisible(false);
      resetFeedbackForm();
      
      Alert.alert(
        'Feedback Submitted! 🎉',
        'Thank you for your feedback. It helps coaches improve and helps other players make better choices.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  }, [overallRating, communicationRating, knowledgeRating, punctualityRating, adaptabilityRating, writtenFeedback, recommendToOthers, submissionGoals, selectedSession]);

  // Reset feedback form
  const resetFeedbackForm = () => {
    setOverallRating(0);
    setCommunicationRating(0);
    setKnowledgeRating(0);
    setPunctualityRating(0);
    setAdaptabilityRating(0);
    setWrittenFeedback('');
    setRecommendToOthers(null);
    setSubmissionGoals([]);
  };

  // Open feedback modal
  const openFeedbackModal = (session) => {
    setSelectedSession(session);
    setFeedbackModalVisible(true);
  };

  // Filter sessions
  const filteredSessions = mockSessions.filter(session => {
    const matchesSearch = !searchQuery || 
      session.coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.coach.sport.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'pending' && !session.feedbackGiven) ||
      (filterBy === 'completed' && session.feedbackGiven);

    return matchesSearch && matchesFilter;
  });

  // Render session card
  const renderSessionCard = (session, index) => (
    <Animated.View
      key={session.id}
      style={{
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim }
        ],
      }}
    >
      <Card
        style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          elevation: 4,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: session.feedbackGiven ? COLORS.success : COLORS.warning,
        }}
      >
        <Card.Content style={{ padding: SPACING.md }}>
          {/* Session Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Avatar.Image
              size={50}
              source={{ uri: session.coach.avatar }}
              style={{ marginRight: SPACING.md }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
                {session.coach.name}
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                {session.coach.sport} • {session.type}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Icon name="event" size={14} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.textSecondary }]}>
                  {new Date(session.date).toLocaleDateString()} at {session.time}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              {session.feedbackGiven ? (
                <View style={{ alignItems: 'center' }}>
                  <Icon name="check-circle" size={24} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.success, marginTop: 2 }]}>
                    Reviewed
                  </Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Icon name="rate-review" size={24} color={COLORS.warning} />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.warning, marginTop: 2 }]}>
                    Pending
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Session Details */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginBottom: SPACING.md,
            paddingVertical: SPACING.sm,
            backgroundColor: COLORS.background,
            borderRadius: 8,
            paddingHorizontal: SPACING.sm,
          }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 2 }]}>
                {session.duration} min
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' }]}>
                {session.location}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="fitness-center" size={16} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 2 }]}>
                {session.type}
              </Text>
            </View>
          </View>

          {/* Session Goals */}
          {session.sessionGoals && (
            <View style={{ marginBottom: SPACING.md }}>
              <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.xs, color: COLORS.text }]}>
                Session Goals:
              </Text>
              {session.sessionGoals.map((goal, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Icon name="check-circle-outline" size={16} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.xs, color: COLORS.textSecondary }]}>
                    {goal}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Feedback Display or Action */}
          {session.feedbackGiven ? (
            <View>
              <Divider style={{ marginBottom: SPACING.md }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Text style={[TEXT_STYLES.subtitle, { color: COLORS.text, marginRight: SPACING.sm }]}>
                  Your Rating:
                </Text>
                <StarRating rating={session.rating} setRating={() => {}} editable={false} size={16} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: COLORS.textSecondary }]}>
                  ({session.rating}/5)
                </Text>
              </View>
              {session.feedback && (
                <View style={{ 
                  backgroundColor: COLORS.background, 
                  padding: SPACING.sm, 
                  borderRadius: 8,
                  marginBottom: SPACING.sm,
                }}>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.text, fontStyle: 'italic' }]}>
                    "{session.feedback}"
                  </Text>
                </View>
              )}
              <Button
                mode="outlined"
                onPress={() => openFeedbackModal(session)}
                style={{ borderColor: COLORS.primary }}
                icon="edit"
              >
                Edit Feedback
              </Button>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={() => openFeedbackModal(session)}
              style={{ backgroundColor: COLORS.primary }}
              icon="rate-review"
            >
              Leave Feedback
            </Button>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // Render feedback modal
  const renderFeedbackModal = () => (
    <Portal>
      <Modal
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedSession && (
          <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={{ paddingTop: 50, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>Rate Your Session</Text>
                  <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
                    with {selectedSession.coach.name}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  iconColor="white"
                  onPress={() => setFeedbackModalVisible(false)}
                />
              </View>
            </LinearGradient>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {/* Overall Rating */}
              <Surface style={{ margin: SPACING.md, padding: SPACING.lg, borderRadius: 12 }}>
                <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginBottom: SPACING.md }]}>
                  Overall Experience
                </Text>
                <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
                  <StarRating rating={overallRating} setRating={setOverallRating} size={32} />
                  <Text style={[TEXT_STYLES.body, { marginTop: SPACING.sm, color: COLORS.textSecondary }]}>
                    {overallRating > 0 ? `${overallRating}/5 stars` : 'Tap to rate'}
                  </Text>
                </View>
              </Surface>

              {/* Detailed Ratings */}
              <Surface style={{ margin: SPACING.md, padding: SPACING.md, borderRadius: 12 }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                  Detailed Feedback
                </Text>
                
                {feedbackCategories.map((category) => {
                  const ratingValue = {
                    communication: communicationRating,
                    knowledge: knowledgeRating,
                    punctuality: punctualityRating,
                    adaptability: adaptabilityRating,
                  }[category.key];

                  const setRatingValue = {
                    communication: setCommunicationRating,
                    knowledge: setKnowledgeRating,
                    punctuality: setPunctualityRating,
                    adaptability: setAdaptabilityRating,
                  }[category.key];

                  return (
                    <View key={category.key} style={{ marginBottom: SPACING.md }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                        <Icon name={category.icon} size={20} color={COLORS.primary} />
                        <Text style={[TEXT_STYLES.subtitle, { marginLeft: SPACING.sm, flex: 1 }]}>
                          {category.label}
                        </Text>
                        <StarRating rating={ratingValue} setRating={setRatingValue} size={20} />
                      </View>
                    </View>
                  );
                })}
              </Surface>

              {/* Written Feedback */}
              <Surface style={{ margin: SPACING.md, padding: SPACING.md, borderRadius: 12 }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                  Additional Comments
                </Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  placeholder="Share your thoughts about the session, what went well, and areas for improvement..."
                  value={writtenFeedback}
                  onChangeText={setWrittenFeedback}
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 8,
                    padding: SPACING.md,
                    textAlignVertical: 'top',
                    fontSize: 16,
                    color: COLORS.text,
                    backgroundColor: 'white',
                  }}
                  maxLength={500}
                />
                <Text style={[TEXT_STYLES.caption, { 
                  textAlign: 'right', 
                  marginTop: SPACING.xs,
                  color: COLORS.textSecondary 
                }]}>
                  {writtenFeedback.length}/500
                </Text>
              </Surface>

              {/* Session Goals Achievement */}
              <Surface style={{ margin: SPACING.md, padding: SPACING.md, borderRadius: 12 }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                  What did you achieve? 🎯
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {goalOptions.map((goal) => (
                    <Chip
                      key={goal}
                      selected={submissionGoals.includes(goal)}
                      onPress={() => {
                        setSubmissionGoals(prev => 
                          prev.includes(goal) 
                            ? prev.filter(g => g !== goal)
                            : [...prev, goal]
                        );
                        Vibration.vibrate(30);
                      }}
                      style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                      selectedColor={COLORS.success}
                    >
                      {goal}
                    </Chip>
                  ))}
                </View>
              </Surface>

              {/* Recommendation */}
              <Surface style={{ margin: SPACING.md, padding: SPACING.md, borderRadius: 12 }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                  Would you recommend this coach?
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <TouchableOpacity
                    onPress={() => {
                      setRecommendToOthers(true);
                      Vibration.vibrate(50);
                    }}
                    style={{
                      alignItems: 'center',
                      padding: SPACING.md,
                      borderRadius: 12,
                      backgroundColor: recommendToOthers === true ? COLORS.success : COLORS.background,
                      flex: 1,
                      marginRight: SPACING.sm,
                    }}
                  >
                    <Icon 
                      name="thumb-up" 
                      size={24} 
                      color={recommendToOthers === true ? 'white' : COLORS.success} 
                    />
                    <Text style={[
                      TEXT_STYLES.body, 
                      { 
                        marginTop: SPACING.xs,
                        color: recommendToOthers === true ? 'white' : COLORS.success,
                        fontWeight: 'bold',
                      }
                    ]}>
                      Yes
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => {
                      setRecommendToOthers(false);
                      Vibration.vibrate(50);
                    }}
                    style={{
                      alignItems: 'center',
                      padding: SPACING.md,
                      borderRadius: 12,
                      backgroundColor: recommendToOthers === false ? COLORS.error : COLORS.background,
                      flex: 1,
                      marginLeft: SPACING.sm,
                    }}
                  >
                    <Icon 
                      name="thumb-down" 
                      size={24} 
                      color={recommendToOthers === false ? 'white' : COLORS.error} 
                    />
                    <Text style={[
                      TEXT_STYLES.body, 
                      { 
                        marginTop: SPACING.xs,
                        color: recommendToOthers === false ? 'white' : COLORS.error,
                        fontWeight: 'bold',
                      }
                    ]}>
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </Surface>

              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Submit Button */}
            <View style={{ 
              padding: SPACING.md,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              backgroundColor: 'white',
            }}>
              <Button
                mode="contained"
                onPress={handleSubmitFeedback}
                style={{ 
                  backgroundColor: overallRating > 0 ? COLORS.success : COLORS.textSecondary,
                }}
                disabled={overallRating === 0}
                icon="send"
              >
                {selectedSession.feedbackGiven ? 'Update Feedback' : 'Submit Feedback'}
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );

  // Render filter bar
  const renderFilterBar = () => (
    <View style={{ 
      flexDirection: 'row', 
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.md,
      alignItems: 'center',
    }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
        {['all', 'pending', 'completed'].map((filter) => (
          <Chip
            key={filter}
            selected={filterBy === filter}
            onPress={() => setFilterBy(filter)}
            style={{ marginRight: SPACING.sm }}
            selectedColor={COLORS.primary}
          >
            {filter === 'all' ? 'All Sessions' : 
             filter === 'pending' ? 'Pending Feedback' : 'Completed Reviews'}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  // Render stats card
  const renderStatsCard = () => {
    const totalSessions = mockSessions.length;
    const pendingFeedback = mockSessions.filter(s => !s.feedbackGiven).length;
    const averageRating = mockSessions
      .filter(s => s.feedbackGiven && s.rating)
      .reduce((acc, s) => acc + s.rating, 0) / mockSessions.filter(s => s.feedbackGiven).length || 0;

    return (
      <Card style={{ margin: SPACING.md, borderRadius: 12 }}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{ padding: SPACING.md, borderRadius: 12 }}
        >
          <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: SPACING.md }]}>
            Your Feedback Summary 📊
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>{totalSessions}</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                Total Sessions
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h2, { color: '#FFD700' }]}>{pendingFeedback}</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                Pending Reviews
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
                {averageRating > 0 ? averageRating.toFixed(1) : '--'}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                Avg. Rating Given
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: 50, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.md }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>Coach Feedback</Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
              Rate your coaching sessions ⭐
            </Text>
          </View>
          <IconButton
            icon="history"
            iconColor="white"
            onPress={() => Alert.alert('Feature Coming Soon', 'Detailed feedback analytics coming soon! 📈')}
          />
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search by coach name or sport..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            marginTop: SPACING.md,
            elevation: 4,
            borderRadius: 25,
          }}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.text }}
        />
      </LinearGradient>

      {/* Stats Card */}
      {renderStatsCard()}

      {/* Filter Bar */}
      {renderFilterBar()}

      {/* Results Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm 
      }}>
        <Text style={[TEXT_STYLES.h3, { color: COLORS.text }]}>
          {filteredSessions.length} Sessions
        </Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Sort Options',
              'Choose how to sort your sessions',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Most Recent', onPress: () => setSortBy('recent') },
                { text: 'Oldest First', onPress: () => setSortBy('oldest') },
                { text: 'Highest Rated', onPress: () => setSortBy('rating') },
                { text: 'Pending First', onPress: () => setSortBy('pending') },
              ]
            );
          }}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Icon name="sort" size={16} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginLeft: 4 }]}>
            Sort
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sessions List */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {loading ? (
          <View style={{ padding: SPACING.md }}>
            {[1, 2, 3].map((_, index) => (
              <Card key={index} style={{ marginBottom: SPACING.md }}>
                <Card.Content style={{ padding: SPACING.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                    <Surface style={{ width: 50, height: 50, borderRadius: 25, marginRight: SPACING.md }} />
                    <View style={{ flex: 1 }}>
                      <Surface style={{ height: 20, borderRadius: 4, marginBottom: SPACING.xs }} />
                      <Surface style={{ height: 16, borderRadius: 4, width: '70%' }} />
                    </View>
                  </View>
                  <ProgressBar indeterminate color={COLORS.primary} />
                </Card.Content>
              </Card>
            ))}
          </View>
        ) : filteredSessions.length > 0 ? (
          <View style={{ paddingBottom: 100 }}>
            {filteredSessions.map((session, index) => renderSessionCard(session, index))}
          </View>
        ) : (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingHorizontal: SPACING.lg,
            paddingVertical: 100,
          }}>
            <Icon name="rate-review" size={80} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h2, { marginTop: SPACING.md, textAlign: 'center' }]}>
              No Sessions Found
            </Text>
            <Text style={[TEXT_STYLES.body, { 
              color: COLORS.textSecondary, 
              textAlign: 'center',
              marginTop: SPACING.sm,
              marginBottom: SPACING.lg,
            }]}>
              {searchQuery ? 
                'No sessions match your search criteria' : 
                'You haven\'t completed any coaching sessions yet'
              }
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('CoachDirectory')}
              style={{ backgroundColor: COLORS.primary }}
              icon="search"
            >
              Find Coaches
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Quick Action FAB */}
      <FAB
        icon="rate-review"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          const pendingSessions = mockSessions.filter(s => !s.feedbackGiven);
          if (pendingSessions.length > 0) {
            openFeedbackModal(pendingSessions[0]);
          } else {
            Alert.alert(
              'All Caught Up! 🎉',
              'You\'ve provided feedback for all your sessions. Book more sessions to continue your training journey!',
              [
                { text: 'OK', style: 'cancel' },
                { text: 'Find Coaches', onPress: () => navigation.navigate('CoachDirectory') },
              ]
            );
          }
        }}
      />

      {/* Feedback Modal */}
      {renderFeedbackModal()}
    </View>
  );
};

// Screen options for navigation
CoachFeedback.options = {
  title: 'Coach Feedback',
  headerShown: false,
};

export default CoachFeedback;