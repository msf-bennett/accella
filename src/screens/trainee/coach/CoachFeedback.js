import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Surface,
  IconButton,
  FAB,
  Portal,
  Modal,
  TextInput,
  Avatar,
  Badge,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const CoachFeedback = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, feedbackData, analytics } = useSelector(state => state.coach);
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('received');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [provideFeedbackModal, setProvideFeedbackModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('performance');
  const [loading, setLoading] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Mock data - replace with Redux/API data
  const mockReceivedFeedback = [
    {
      id: 1,
      from: 'Sarah Johnson',
      fromRole: 'Player',
      fromAvatar: 'SJ',
      rating: 5,
      category: 'session',
      title: 'Amazing training session!',
      message: 'Coach really helped me improve my technique. The drills were challenging but effective. Looking forward to more sessions! 💪',
      timestamp: '2 hours ago',
      session: 'Football Training #12',
      responded: false,
      tags: ['technique', 'improvement'],
    },
    {
      id: 2,
      from: 'Mike Wilson',
      fromRole: 'Parent',
      fromAvatar: 'MW',
      rating: 4,
      category: 'communication',
      title: 'Good communication',
      message: 'Coach keeps us well informed about Emma\'s progress. Would like to see more detailed reports.',
      timestamp: '1 day ago',
      session: 'Progress Review',
      responded: true,
      response: 'Thank you for the feedback! I\'ll provide more detailed progress reports.',
      tags: ['communication', 'progress'],
    },
    {
      id: 3,
      from: 'Team Alpha',
      fromRole: 'Group',
      fromAvatar: 'TA',
      rating: 5,
      category: 'motivation',
      title: 'Team motivation',
      message: 'Great job keeping the team motivated during tough training. Everyone feels more confident now!',
      timestamp: '2 days ago',
      session: 'Team Training Session',
      responded: false,
      tags: ['motivation', 'team'],
    },
  ];

  const mockProvidedFeedback = [
    {
      id: 1,
      to: 'Sarah Johnson',
      toRole: 'Player',
      toAvatar: 'SJ',
      rating: 4,
      category: 'performance',
      title: 'Great improvement in technique',
      message: 'Excellent progress in your footwork today! Keep practicing the drills we worked on. Next session we\'ll focus on ball control.',
      timestamp: '3 hours ago',
      session: 'Individual Training',
      read: true,
      tags: ['technique', 'improvement'],
    },
    {
      id: 2,
      to: 'Emma Davis',
      toRole: 'Player',
      toAvatar: 'ED',
      rating: 3,
      category: 'areas_for_improvement',
      title: 'Focus areas for next session',
      message: 'Good effort today, but we need to work on consistency. Practice the serve motion we discussed.',
      timestamp: '1 day ago',
      session: 'Tennis Coaching',
      read: false,
      tags: ['consistency', 'serve'],
    },
  ];

  const mockPlayers = [
    { id: 1, name: 'Sarah Johnson', avatar: 'SJ', sport: 'Football' },
    { id: 2, name: 'Emma Davis', avatar: 'ED', sport: 'Tennis' },
    { id: 3, name: 'Alex Brown', avatar: 'AB', sport: 'Basketball' },
  ];

  const tabs = [
    { key: 'received', label: 'Received', icon: 'inbox', badge: 2 },
    { key: 'provided', label: 'Given', icon: 'send', badge: 0 },
    { key: 'analytics', label: 'Analytics', icon: 'analytics', badge: 0 },
  ];

  const feedbackCategories = [
    { key: 'performance', label: 'Performance', emoji: '🏆' },
    { key: 'technique', label: 'Technique', emoji: '⚡' },
    { key: 'motivation', label: 'Motivation', emoji: '💪' },
    { key: 'areas_for_improvement', label: 'Areas to Improve', emoji: '📈' },
    { key: 'session_feedback', label: 'Session Review', emoji: '📝' },
  ];

  useEffect(() => {
    navigation.setOptions({
      title: 'Feedback Center',
      headerShown: true,
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        ...TEXT_STYLES.h2,
        color: '#fff',
      },
      headerRight: () => (
        <IconButton
          icon="filter-list"
          iconColor="#fff"
          onPress={() => Alert.alert('Feature Coming Soon', 'Feedback filters will be available soon!')}
        />
      ),
    });

    // Animation on mount
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    loadFeedbackData();
  }, []);

  const loadFeedbackData = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Dispatch actual data to Redux
      // dispatch(loadFeedback());
    } catch (error) {
      Alert.alert('Error', 'Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeedbackData();
    setRefreshing(false);
  }, [loadFeedbackData]);

  const handleTabPress = useCallback((tab) => {
    Vibration.vibrate(50);
    setActiveTab(tab.key);
  }, []);

  const handleFeedbackPress = useCallback((feedback) => {
    Vibration.vibrate(50);
    setSelectedFeedback(feedback);
    setModalVisible(true);
  }, []);

  const handleRespondToFeedback = useCallback(() => {
    if (!responseText.trim()) {
      Alert.alert('Validation Error', 'Please enter a response');
      return;
    }

    // TODO: Send response via API and update Redux
    Alert.alert('Success! 📩', 'Your response has been sent');
    setResponseText('');
    setModalVisible(false);
    Vibration.vibrate(100);
  }, [responseText]);

  const handleProvideFeedback = useCallback(() => {
    if (!newFeedbackText.trim()) {
      Alert.alert('Validation Error', 'Please enter feedback message');
      return;
    }

    if (!selectedPlayer) {
      Alert.alert('Validation Error', 'Please select a player');
      return;
    }

    // TODO: Submit feedback via API
    Alert.alert('Success! ⭐', 'Feedback sent to player successfully');
    setNewFeedbackText('');
    setSelectedPlayer(null);
    setFeedbackRating(5);
    setFeedbackCategory('performance');
    setProvideFeedbackModal(false);
    Vibration.vibrate(100);
  }, [newFeedbackText, selectedPlayer, feedbackRating, feedbackCategory]);

  const renderStarRating = (rating, size = 16, interactive = false, onPress = null) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onPress && onPress(star)}
            disabled={!interactive}
            style={{ marginRight: 2 }}
          >
            <Icon
              name="star"
              size={size}
              color={star <= rating ? '#FFD700' : '#E0E0E0'}
            />
          </TouchableOpacity>
        ))}
        <Text style={{
          ...TEXT_STYLES.caption,
          color: COLORS.text,
          marginLeft: SPACING.xs,
        }}>
          ({rating}/5)
        </Text>
      </View>
    );
  };

  const renderTabBar = () => (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, 0],
        })}],
        opacity: fadeAnim,
      }}
    >
      <Surface style={{
        flexDirection: 'row',
        marginHorizontal: SPACING.md,
        marginVertical: SPACING.sm,
        borderRadius: 12,
        elevation: 4,
      }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(tab)}
            style={{
              flex: 1,
              paddingVertical: SPACING.md,
              alignItems: 'center',
              backgroundColor: activeTab === tab.key ? COLORS.primary : 'transparent',
              borderRadius: 12,
            }}
            activeOpacity={0.8}
          >
            <View style={{ position: 'relative' }}>
              <Icon
                name={tab.icon}
                size={24}
                color={activeTab === tab.key ? '#fff' : COLORS.primary}
              />
              {tab.badge > 0 && (
                <Badge
                  size={16}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: COLORS.error,
                  }}
                >
                  {tab.badge}
                </Badge>
              )}
            </View>
            <Text style={{
              ...TEXT_STYLES.caption,
              color: activeTab === tab.key ? '#fff' : COLORS.primary,
              marginTop: SPACING.xs,
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Surface>
    </Animated.View>
  );

  const renderFeedbackItem = ({ item: feedback, isReceived = true }) => (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: fadeAnim,
      }}
    >
      <TouchableOpacity
        onPress={() => handleFeedbackPress(feedback)}
        activeOpacity={0.8}
      >
        <Card style={{
          margin: SPACING.xs,
          marginHorizontal: SPACING.md,
          elevation: 3,
          backgroundColor: feedback.responded === false && isReceived ? '#f8f9ff' : '#fff',
        }}>
          <View style={{ padding: SPACING.md }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: SPACING.md,
            }}>
              <Avatar.Text
                size={40}
                label={isReceived ? feedback.fromAvatar : feedback.toAvatar}
                style={{ backgroundColor: COLORS.primary }}
              />
              
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    ...TEXT_STYLES.h4,
                    color: COLORS.text,
                  }}>
                    {isReceived ? feedback.from : feedback.to}
                  </Text>
                  <Text style={{
                    ...TEXT_STYLES.caption,
                    color: COLORS.text,
                    opacity: 0.6,
                  }}>
                    {feedback.timestamp}
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: SPACING.xs,
                }}>
                  <Chip
                    mode="outlined"
                    style={{ height: 24, marginRight: SPACING.xs }}
                    textStyle={{ fontSize: 10 }}
                  >
                    {isReceived ? feedback.fromRole : feedback.toRole}
                  </Chip>
                  {renderStarRating(feedback.rating, 14)}
                </View>
              </View>

              {feedback.responded === false && isReceived && (
                <Surface style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: COLORS.primary,
                }} />
              )}
            </View>

            {/* Content */}
            <Text style={{
              ...TEXT_STYLES.h4,
              color: COLORS.primary,
              marginBottom: SPACING.xs,
            }}>
              {feedback.title}
            </Text>

            <Text style={{
              ...TEXT_STYLES.body,
              color: COLORS.text,
              opacity: 0.8,
              marginBottom: SPACING.md,
            }} numberOfLines={2}>
              {feedback.message}
            </Text>

            {/* Tags */}
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: SPACING.sm,
            }}>
              {feedback.tags?.map((tag, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  style={{
                    height: 20,
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                  }}
                  textStyle={{ fontSize: 8 }}
                >
                  {tag}
                </Chip>
              ))}
            </View>

            {/* Session Info */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Text style={{
                ...TEXT_STYLES.caption,
                color: COLORS.text,
                opacity: 0.6,
              }}>
                📋 {feedback.session}
              </Text>

              {isReceived ? (
                feedback.responded ? (
                  <Chip
                    mode="flat"
                    style={{
                      height: 24,
                      backgroundColor: COLORS.success,
                    }}
                    textStyle={{ color: '#fff', fontSize: 10 }}
                  >
                    ✓ Responded
                  </Chip>
                ) : (
                  <Chip
                    mode="flat"
                    style={{
                      height: 24,
                      backgroundColor: COLORS.error,
                    }}
                    textStyle={{ color: '#fff', fontSize: 10 }}
                  >
                    Pending Response
                  </Chip>
                )
              ) : (
                feedback.read ? (
                  <Chip
                    mode="outlined"
                    style={{ height: 24 }}
                    textStyle={{ fontSize: 10 }}
                  >
                    ✓ Read
                  </Chip>
                ) : (
                  <Chip
                    mode="outlined"
                    style={{ height: 24 }}
                    textStyle={{ fontSize: 10 }}
                  >
                    Unread
                  </Chip>
                )
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderReceivedTab = () => (
    <FlatList
      data={mockReceivedFeedback}
      renderItem={({ item }) => renderFeedbackItem({ item, isReceived: true })}
      keyExtractor={item => item.id.toString()}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
      ListHeaderComponent={
        <View style={{
          padding: SPACING.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Text style={{
            ...TEXT_STYLES.h3,
            color: COLORS.primary,
          }}>
            📥 Feedback Received
          </Text>
          <Text style={{
            ...TEXT_STYLES.caption,
            color: COLORS.text,
            opacity: 0.7,
          }}>
            2 pending responses
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: SPACING.xl,
        }}>
          <Icon name="inbox" size={64} color={COLORS.primary} />
          <Text style={{
            ...TEXT_STYLES.h4,
            color: COLORS.text,
            textAlign: 'center',
            marginTop: SPACING.md,
          }}>
            No feedback received yet
          </Text>
          <Text style={{
            ...TEXT_STYLES.body,
            color: COLORS.text,
            opacity: 0.7,
            textAlign: 'center',
            marginTop: SPACING.xs,
          }}>
            Feedback from players and parents will appear here
          </Text>
        </View>
      }
    />
  );

  const renderProvidedTab = () => (
    <FlatList
      data={mockProvidedFeedback}
      renderItem={({ item }) => renderFeedbackItem({ item, isReceived: false })}
      keyExtractor={item => item.id.toString()}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
      ListHeaderComponent={
        <View style={{
          padding: SPACING.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Text style={{
            ...TEXT_STYLES.h3,
            color: COLORS.primary,
          }}>
            📤 Feedback Given
          </Text>
          <Button
            mode="contained"
            onPress={() => setProvideFeedbackModal(true)}
            style={{ backgroundColor: COLORS.primary }}
            contentStyle={{ paddingHorizontal: SPACING.sm }}
          >
            Give Feedback
          </Button>
        </View>
      }
    />
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: SPACING.md }}>
        <Text style={{
          ...TEXT_STYLES.h3,
          color: COLORS.primary,
          marginBottom: SPACING.lg,
        }}>
          📊 Feedback Analytics
        </Text>

        {/* Overall Rating */}
        <Card style={{ padding: SPACING.lg, marginBottom: SPACING.md }}>
          <Text style={{
            ...TEXT_STYLES.h4,
            color: COLORS.primary,
            marginBottom: SPACING.md,
          }}>
            Overall Rating
          </Text>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: SPACING.md,
          }}>
            <Text style={{
              ...TEXT_STYLES.h1,
              color: COLORS.primary,
              marginRight: SPACING.md,
            }}>
              4.8
            </Text>
            {renderStarRating(5, 24)}
          </View>

          <Text style={{
            ...TEXT_STYLES.body,
            color: COLORS.text,
            opacity: 0.7,
            textAlign: 'center',
          }}>
            Based on 47 reviews this month
          </Text>
        </Card>

        {/* Rating Breakdown */}
        <Card style={{ padding: SPACING.lg, marginBottom: SPACING.md }}>
          <Text style={{
            ...TEXT_STYLES.h4,
            color: COLORS.primary,
            marginBottom: SPACING.md,
          }}>
            Rating Breakdown
          </Text>

          {[5, 4, 3, 2, 1].map((stars) => (
            <View key={stars} style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: SPACING.sm,
            }}>
              <Text style={{
                ...TEXT_STYLES.body,
                color: COLORS.text,
                width: 20,
              }}>
                {stars}
              </Text>
              <Icon
                name="star"
                size={16}
                color="#FFD700"
                style={{ marginHorizontal: SPACING.xs }}
              />
              <ProgressBar
                progress={stars === 5 ? 0.8 : stars === 4 ? 0.15 : 0.05}
                color={COLORS.primary}
                style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: SPACING.sm,
                }}
              />
              <Text style={{
                ...TEXT_STYLES.caption,
                color: COLORS.text,
                width: 30,
              }}>
                {stars === 5 ? '80%' : stars === 4 ? '15%' : '5%'}
              </Text>
            </View>
          ))}
        </Card>

        {/* Category Breakdown */}
        <Card style={{ padding: SPACING.lg, marginBottom: SPACING.md }}>
          <Text style={{
            ...TEXT_STYLES.h4,
            color: COLORS.primary,
            marginBottom: SPACING.md,
          }}>
            Feedback Categories
          </Text>

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            <Surface style={{
              width: '48%',
              padding: SPACING.md,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: SPACING.md,
            }}>
              <Text style={{ ...TEXT_STYLES.h2, color: COLORS.primary }}>
                🏆 4.9
              </Text>
              <Text style={{ ...TEXT_STYLES.caption, color: COLORS.text }}>
                Performance
              </Text>
            </Surface>

            <Surface style={{
              width: '48%',
              padding: SPACING.md,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: SPACING.md,
            }}>
              <Text style={{ ...TEXT_STYLES.h2, color: COLORS.primary }}>
                💬 4.7
              </Text>
              <Text style={{ ...TEXT_STYLES.caption, color: COLORS.text }}>
                Communication
              </Text>
            </Surface>

            <Surface style={{
              width: '48%',
              padding: SPACING.md,
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <Text style={{ ...TEXT_STYLES.h2, color: COLORS.primary }}>
                💪 4.8
              </Text>
              <Text style={{ ...TEXT_STYLES.caption, color: COLORS.text }}>
                Motivation
              </Text>
            </Surface>

            <Surface style={{
              width: '48%',
              padding: SPACING.md,
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <Text style={{ ...TEXT_STYLES.h2, color: COLORS.primary }}>
                ⚡ 4.6
              </Text>
              <Text style={{ ...TEXT_STYLES.caption, color: COLORS.text }}>
                Technique
              </Text>
            </Surface>
          </View>
        </Card>

        {/* Response Rate */}
        <Card style={{ padding: SPACING.lg }}>
          <Text style={{
            ...TEXT_STYLES.h4,
            color: COLORS.primary,
            marginBottom: SPACING.md,
          }}>
            Response Analytics
          </Text>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...TEXT_STYLES.h2, color: COLORS.success }}>
                95%
              </Text>
              <Text style={{ ...TEXT_STYLES.caption, color: COLORS.text }}>
                Response Rate
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...TEXT_STYLES.h2, color: COLORS.primary }}>
                2.3h
              </Text>
              <Text style={{ ...TEXT_STYLES.caption, color: COLORS.text }}>
                Avg Response Time
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...TEXT_STYLES.h2, color: COLORS.secondary }}>
                47
              </Text>
              <Text style={{ ...TEXT_STYLES.caption, color: COLORS.text }}>
                Total Reviews
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Stats Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          padding: SPACING.lg,
          paddingTop: SPACING.xl,
        }}
      >
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-30, 0],
            })}],
            opacity: fadeAnim,
          }}
        >
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...TEXT_STYLES.h2, color: '#fff' }}>4.8</Text>
              <Text style={{ ...TEXT_STYLES.caption, color: '#fff', opacity: 0.8 }}>
                Avg Rating
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...TEXT_STYLES.h2, color: '#fff' }}>47</Text>
              <Text style={{ ...TEXT_STYLES.caption, color: '#fff', opacity: 0.8 }}>
                Total Reviews
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...TEXT_STYLES.h2, color: '#fff' }}>95%</Text>
              <Text style={{ ...TEXT_STYLES.caption, color: '#fff', opacity: 0.8 }}>
                Response Rate
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'received' && renderReceivedTab()}
        {activeTab === 'provided' && renderProvidedTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </View>

      {/* Feedback Detail Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.md,
            borderRadius: 16,
            maxHeight: '80%',
          }}
        >
          {selectedFeedback && (
            <ScrollView style={{ padding: SPACING.lg }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: SPACING.lg,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Avatar.Text
                    size={50}
                    label={selectedFeedback.fromAvatar || selectedFeedback.toAvatar}
                    style={{ backgroundColor: COLORS.primary }}
                  />
                  <View style={{ marginLeft: SPACING.md }}>
                    <Text style={{ ...TEXT_STYLES.h4, color: COLORS.text }}>
                      {selectedFeedback.from || selectedFeedback.to}
                    </Text>
                    <Text style={{ ...TEXT_STYLES.caption, color: COLORS.text, opacity: 0.7 }}>
                      {selectedFeedback.fromRole || selectedFeedback.toRole}
                    </Text>
                  </View>
                </View>
                <IconButton
                  icon="close"
                  onPress={() => setModalVisible(false)}
                />
              </View>

              {/* Rating */}
              <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
                {renderStarRating(selectedFeedback.rating, 24)}
                <Text style={{
                  ...TEXT_STYLES.h3,
                  color: COLORS.primary,
                  marginTop: SPACING.sm,
                }}>
                  {selectedFeedback.title}
                </Text>
              </View>

              {/* Message */}
              <Card style={{ padding: SPACING.md, marginBottom: SPACING.lg }}>
                <Text style={{
                  ...TEXT_STYLES.body,
                  color: COLORS.text,
                  lineHeight: 24,
                }}>
                  {selectedFeedback.message}
                </Text>
              </Card>

              {/* Session Info */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SPACING.lg,
              }}>
                <Icon name="event" size={20} color={COLORS.primary} />
                <Text style={{
                  ...TEXT_STYLES.body,
                  color: COLORS.text,
                  marginLeft: SPACING.sm,
                }}>
                  {selectedFeedback.session}
                </Text>
              </View>

              {/* Previous Response (if exists) */}
              {selectedFeedback.response && (
                <Card style={{
                  padding: SPACING.md,
                  marginBottom: SPACING.lg,
                  backgroundColor: '#f8f9ff',
                }}>
                  <Text style={{
                    ...TEXT_STYLES.h4,
                    color: COLORS.primary,
                    marginBottom: SPACING.sm,
                  }}>
                    Your Response:
                  </Text>
                  <Text style={{
                    ...TEXT_STYLES.body,
                    color: COLORS.text,
                  }}>
                    {selectedFeedback.response}
                  </Text>
                </Card>
              )}

              {/* Response Section (only for received feedback) */}
              {selectedFeedback.from && !selectedFeedback.responded && (
                <View>
                  <Text style={{
                    ...TEXT_STYLES.h4,
                    color: COLORS.primary,
                    marginBottom: SPACING.md,
                  }}>
                    Send Response:
                  </Text>
                  
                  <TextInput
                    label="Your response..."
                    value={responseText}
                    onChangeText={setResponseText}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={{ marginBottom: SPACING.lg }}
                  />

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                    <Button
                      mode="outlined"
                      onPress={() => setModalVisible(false)}
                      style={{ width: '30%' }}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      mode="contained"
                      onPress={handleRespondToFeedback}
                      style={{ width: '65%', backgroundColor: COLORS.primary }}
                    >
                      Send Response
                    </Button>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </Modal>

        {/* Provide Feedback Modal */}
        <Modal
          visible={provideFeedbackModal}
          onDismiss={() => setProvideFeedbackModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.md,
            borderRadius: 16,
            maxHeight: '85%',
          }}
        >
          <ScrollView style={{ padding: SPACING.lg }}>
            <Text style={{
              ...TEXT_STYLES.h3,
              color: COLORS.primary,
              textAlign: 'center',
              marginBottom: SPACING.lg,
            }}>
              ⭐ Provide Feedback
            </Text>

            {/* Player Selection */}
            <Text style={{
              ...TEXT_STYLES.h4,
              color: COLORS.primary,
              marginBottom: SPACING.md,
            }}>
              Select Player:
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: SPACING.lg,
            }}>
              {mockPlayers.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  onPress={() => setSelectedPlayer(player)}
                  activeOpacity={0.8}
                >
                  <Card style={{
                    margin: SPACING.xs,
                    padding: SPACING.md,
                    backgroundColor: selectedPlayer?.id === player.id ? COLORS.primary : '#fff',
                    elevation: selectedPlayer?.id === player.id ? 4 : 2,
                  }}>
                    <View style={{ alignItems: 'center' }}>
                      <Avatar.Text
                        size={40}
                        label={player.avatar}
                        style={{
                          backgroundColor: selectedPlayer?.id === player.id ? '#fff' : COLORS.primary,
                        }}
                      />
                      <Text style={{
                        ...TEXT_STYLES.caption,
                        color: selectedPlayer?.id === player.id ? '#fff' : COLORS.text,
                        marginTop: SPACING.xs,
                        textAlign: 'center',
                      }}>
                        {player.name}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Selection */}
            <Text style={{
              ...TEXT_STYLES.h4,
              color: COLORS.primary,
              marginBottom: SPACING.md,
            }}>
              Feedback Category:
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: SPACING.lg,
            }}>
              {feedbackCategories.map((category) => (
                <Chip
                  key={category.key}
                  mode={feedbackCategory === category.key ? 'flat' : 'outlined'}
                  onPress={() => setFeedbackCategory(category.key)}
                  style={{
                    margin: SPACING.xs,
                    backgroundColor: feedbackCategory === category.key ? COLORS.primary : 'transparent',
                  }}
                  textStyle={{
                    color: feedbackCategory === category.key ? '#fff' : COLORS.primary,
                  }}
                >
                  {category.emoji} {category.label}
                </Chip>
              ))}
            </View>

            {/* Rating */}
            <Text style={{
              ...TEXT_STYLES.h4,
              color: COLORS.primary,
              marginBottom: SPACING.md,
            }}>
              Rating:
            </Text>
            
            <View style={{
              alignItems: 'center',
              marginBottom: SPACING.lg,
            }}>
              {renderStarRating(feedbackRating, 32, true, setFeedbackRating)}
            </View>

            {/* Feedback Message */}
            <TextInput
              label="Feedback message..."
              value={newFeedbackText}
              onChangeText={setNewFeedbackText}
              mode="outlined"
              multiline
              numberOfLines={5}
              style={{ marginBottom: SPACING.lg }}
              placeholder="Share your thoughts on the player's performance, areas of improvement, or positive reinforcement..."
            />

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <Button
                mode="outlined"
                onPress={() => setProvideFeedbackModal(false)}
                style={{ width: '30%' }}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={handleProvideFeedback}
                style={{ width: '65%', backgroundColor: COLORS.primary }}
              >
                Send Feedback
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="rate-review"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => setProvideFeedbackModal(true)}
      />
    </View>
  );
};

export default CoachFeedback;