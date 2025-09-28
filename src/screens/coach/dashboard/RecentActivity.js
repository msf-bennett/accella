import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  Dimensions,
} from 'react-native';
import { Card, Avatar, Chip, IconButton, Surface, ProgressBar } from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import LinearGradient from '../../../components/shared/LinearGradient';
import Icon from '../../../components/shared/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const RecentActivity = ({ navigation }) => {
  const dispatch = useDispatch();
  const { activities, isLoading } = useSelector(state => ({
  activities: state.activities?.list || [],
  isLoading: state.activities?.isLoading || false,}));

  const [refreshing, setRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock activity data - replace with actual Redux data
  const mockActivities = [
    {
      id: '1',
      type: 'session_completed',
      title: 'Training Session Completed',
      description: 'Football Practice - Advanced Drills',
      player: { name: 'Alex Johnson', avatar: null, rating: 4.8 },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'completed',
      metadata: { duration: '90 min', attendance: 15, satisfaction: 4.5 },
      icon: 'sports-football',
      color: COLORS.success,
      priority: 'high',
    },
    {
      id: '2',
      type: 'player_feedback',
      title: 'Player Feedback Received',
      description: 'Great session today! Learned new techniques',
      player: { name: 'Emma Davis', avatar: null, rating: 4.9 },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: 'new',
      metadata: { rating: 5, category: 'technique' },
      icon: 'star',
      color: COLORS.warning,
      priority: 'medium',
    },
    {
      id: '3',
      type: 'payment_received',
      title: 'Payment Received',
      description: 'Monthly training package payment',
      player: { name: 'Mike Wilson', avatar: null, rating: 4.6 },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      status: 'processed',
      metadata: { amount: '$150', method: 'card' },
      icon: 'payment',
      color: COLORS.primary,
      priority: 'low',
    },
    {
      id: '4',
      type: 'session_scheduled',
      title: 'New Session Scheduled',
      description: 'Individual training - Goalkeeper skills',
      player: { name: 'Sarah Martinez', avatar: null, rating: 4.7 },
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      status: 'upcoming',
      metadata: { date: 'Tomorrow 3:00 PM', type: 'individual' },
      icon: 'schedule',
      color: COLORS.info,
      priority: 'medium',
    },
    {
      id: '5',
      type: 'achievement_unlocked',
      title: 'Player Achievement',
      description: 'Completed 10 training sessions streak',
      player: { name: 'Tom Rodriguez', avatar: null, rating: 4.8 },
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      status: 'celebrated',
      metadata: { streak: 10, badge: 'consistent_trainee' },
      icon: 'jump-rope',
      color: COLORS.warning,
      priority: 'high',
    },
    {
      id: '6',
      type: 'message_received',
      title: 'New Message',
      description: 'Question about training schedule',
      player: { name: 'Lisa Chen', avatar: null, rating: 4.9 },
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: 'unread',
      metadata: { messageCount: 2, urgent: false },
      icon: 'message',
      color: COLORS.secondary,
      priority: 'medium',
    },
  ];

  const recentActivities = activities || mockActivities;

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
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'new': return COLORS.primary;
      case 'processed': return COLORS.info;
      case 'upcoming': return COLORS.warning;
      case 'celebrated': return COLORS.warning;
      case 'unread': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'keyboard-arrow-up';
      case 'medium': return 'remove';
      case 'low': return 'keyboard-arrow-down';
      default: return 'remove';
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🔄 Refreshed!', 'Activity feed updated successfully');
    }, 1500);
  }, []);

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
    Vibration.vibrate(30);
  };

  const handleActivityPress = (activity) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🚀 Feature Coming Soon',
      `Activity details for "${activity.title}" will open here. You'll be able to view full details, take actions, and manage follow-ups!`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const renderActivityItem = (activity, index) => {
    const isExpanded = expandedItems.has(activity.id);
    const animationDelay = index * 100;

    return (
      <Animated.View
        key={activity.id}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: SPACING.md,
        }}
      >
        <Card
          style={{
            borderRadius: 16,
            elevation: 4,
            backgroundColor: COLORS.surface,
            borderLeftWidth: 4,
            borderLeftColor: activity.color,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleExpanded(activity.id)}
          >
            <View style={{ padding: SPACING.md }}>
              {/* Header Row */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: SPACING.sm 
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Surface
                    style={{
                      backgroundColor: activity.color,
                      borderRadius: 20,
                      padding: SPACING.xs,
                      marginRight: SPACING.sm,
                      elevation: 2,
                    }}
                  >
                    <Icon
                      name={activity.icon}
                      size={20}
                      color="white"
                    />
                  </Surface>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        TEXT_STYLES.subtitle2,
                        { color: COLORS.text, fontWeight: '600' }
                      ]}
                      numberOfLines={1}
                    >
                      {activity.title}
                    </Text>
                    <Text
                      style={[
                        TEXT_STYLES.caption,
                        { color: COLORS.textSecondary }
                      ]}
                    >
                      {formatTimeAgo(activity.timestamp)}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    name={getPriorityIcon(activity.priority)}
                    size={16}
                    color={activity.priority === 'high' ? COLORS.error : COLORS.textSecondary}
                  />
                  <Chip
                    mode="flat"
                    compact
                    textStyle={{ 
                      fontSize: 10, 
                      color: getStatusChipColor(activity.status),
                      fontWeight: '600'
                    }}
                    style={{
                      backgroundColor: `${getStatusChipColor(activity.status)}20`,
                      marginLeft: SPACING.xs,
                      height: 24,
                    }}
                  >
                    {activity.status.toUpperCase()}
                  </Chip>
                </View>
              </View>

              {/* Description */}
              <Text
                style={[
                  TEXT_STYLES.body2,
                  { color: COLORS.text, marginBottom: SPACING.sm }
                ]}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {activity.description}
              </Text>

              {/* Player Info */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Avatar.Text
                    size={32}
                    label={activity.player.name.substring(0, 2)}
                    style={{ backgroundColor: activity.color, marginRight: SPACING.sm }}
                    labelStyle={{ fontSize: 12, fontWeight: 'bold', color: 'white' }}
                  />
                  <View>
                    <Text
                      style={[
                        TEXT_STYLES.caption,
                        { color: COLORS.text, fontWeight: '500' }
                      ]}
                    >
                      {activity.player.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="star" size={12} color={COLORS.warning} />
                      <Text
                        style={[
                          TEXT_STYLES.caption,
                          { color: COLORS.textSecondary, marginLeft: 2 }
                        ]}
                      >
                        {activity.player.rating}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleActivityPress(activity)}
                  style={{
                    backgroundColor: `${activity.color}15`,
                    borderRadius: 16,
                    padding: SPACING.xs,
                  }}
                >
                  <Icon
                    name="arrow-forward"
                    size={16}
                    color={activity.color}
                  />
                </TouchableOpacity>
              </View>

              {/* Expanded Metadata */}
              {isExpanded && (
                <View style={{
                  marginTop: SPACING.sm,
                  paddingTop: SPACING.sm,
                  borderTopWidth: 1,
                  borderTopColor: COLORS.border,
                }}>
                  <Text
                    style={[
                      TEXT_STYLES.caption,
                      { color: COLORS.textSecondary, fontWeight: '600', marginBottom: SPACING.xs }
                    ]}
                  >
                    Details:
                  </Text>
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <View key={key} style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between',
                      marginBottom: 4 
                    }}>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                        {key.replace(/_/g, ' ').toUpperCase()}:
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.text, fontWeight: '500' }]}>
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: SPACING.md }}>
      {/* Section Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
      }}>
        <Text style={[TEXT_STYLES.h6, { color: COLORS.text, fontWeight: 'bold' }]}>
          Recent Activity 📋
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Chip
            mode="outlined"
            compact
            textStyle={{ fontSize: 12, color: COLORS.primary }}
            style={{
              borderColor: COLORS.primary,
              backgroundColor: 'transparent',
              marginRight: SPACING.xs,
            }}
          >
            {recentActivities.length} Items
          </Chip>
          <IconButton
            icon="filter-list"
            size={20}
            iconColor={COLORS.textSecondary}
            onPress={() => Alert.alert('🔄 Feature Coming Soon', 'Activity filtering options will be available soon!')}
          />
        </View>
      </View>

      {/* Activities List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Pull to refresh activities..."
            titleColor={COLORS.textSecondary}
          />
        }
        contentContainerStyle={{ paddingBottom: SPACING.xl }}
      >
        {recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => renderActivityItem(activity, index))
        ) : (
          <Surface
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              padding: SPACING.xl,
              alignItems: 'center',
              elevation: 2,
            }}
          >
            <Icon
              name="timeline"
              size={48}
              color={COLORS.textSecondary}
              style={{ marginBottom: SPACING.md }}
            />
            <Text
              style={[
                TEXT_STYLES.subtitle1,
                { color: COLORS.text, fontWeight: '600', textAlign: 'center', marginBottom: SPACING.sm }
              ]}
            >
              No Recent Activity
            </Text>
            <Text
              style={[
                TEXT_STYLES.body2,
                { color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }
              ]}
            >
              Your coaching activities will appear here. Start by creating sessions or connecting with players!
            </Text>
          </Surface>
        )}

        {/* View All Activities Footer */}
        {recentActivities.length > 0 && (
          <TouchableOpacity
            onPress={() => Alert.alert('📱 Feature Coming Soon', 'Full activity history will be available soon!')}
            style={{
              marginTop: SPACING.md,
            }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={{
                borderRadius: 12,
                padding: SPACING.md,
                alignItems: 'center',
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={[
                    TEXT_STYLES.subtitle2,
                    { color: 'white', fontWeight: '600', marginRight: SPACING.xs }
                  ]}
                >
                  View All Activities
                </Text>
                <Icon name="arrow-forward" size={20} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default RecentActivity;