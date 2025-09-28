import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Vibration,
  Dimensions,
} from 'react-native';
import { Card, IconButton, Chip, Surface } from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.xl * 3) / 2;

const QuickActions = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, stats } = useSelector(state => state.coach);
  const [animationValues] = useState(() =>
    Array.from({ length: 8 }, () => new Animated.Value(0))
  );

  const quickActionItems = [
    {
      id: 'create_session',
      title: 'Create Session',
      subtitle: 'New training session',
      icon: 'add-circle',
      color: COLORS.primary,
      gradient: ['#667eea', '#764ba2'],
      badge: null,
      action: () => handleCreateSession(),
    },
    {
      id: 'manage_players',
      title: 'My Players',
      subtitle: `${stats?.totalPlayers || 0} active players`,
      icon: 'group',
      color: COLORS.success,
      gradient: ['#11998e', '#38ef7d'],
      badge: stats?.newPlayerRequests || null,
      action: () => handleManagePlayers(),
    },
    {
      id: 'schedule',
      title: 'Schedule',
      subtitle: 'Upcoming sessions',
      icon: 'schedule',
      color: COLORS.warning,
      gradient: ['#f093fb', '#f5576c'],
      badge: stats?.todaySessions || null,
      action: () => handleSchedule(),
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'Performance insights',
      icon: 'analytics',
      color: COLORS.info,
      gradient: ['#4facfe', '#00f2fe'],
      badge: null,
      action: () => handleAnalytics(),
    },
    {
      id: 'messages',
      title: 'Messages',
      subtitle: 'Chat with players',
      icon: 'message',
      color: COLORS.secondary,
      gradient: ['#a8edea', '#fed6e3'],
      badge: stats?.unreadMessages || null,
      action: () => handleMessages(),
    },
    {
      id: 'drill_library',
      title: 'Drill Library',
      subtitle: 'Training exercises',
      icon: 'sports-football',
      color: COLORS.primary,
      gradient: ['#667eea', '#764ba2'],
      badge: null,
      action: () => handleDrillLibrary(),
    },
    {
      id: 'nutrition',
      title: 'Nutrition',
      subtitle: 'Meal plans & tips',
      icon: 'restaurant',
      color: COLORS.success,
      gradient: ['#56ab2f', '#a8e6cf'],
      badge: null,
      action: () => handleNutrition(),
    },
    {
      id: 'revenue',
      title: 'Revenue',
      subtitle: `$${stats?.monthlyRevenue || 0} this month`,
      icon: 'attach-money',
      color: COLORS.warning,
      gradient: ['#f7971e', '#ffd200'],
      badge: stats?.pendingPayments ? '!' : null,
      action: () => handleRevenue(),
    },
  ];

  const animateCard = useCallback((index) => {
    Animated.sequence([
      Animated.timing(animationValues[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animationValues[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animationValues]);

  const handleCreateSession = () => {
    Vibration.vibrate(50);
    Alert.alert(
      '🚀 Feature Coming Soon',
      'Session creation feature is under development. Stay tuned for amazing training session management tools!',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleManagePlayers = () => {
    Vibration.vibrate(50);
    // navigation.navigate('PlayerManagement');
    Alert.alert(
      '👥 Feature Coming Soon',
      'Player management dashboard is being perfected. You\'ll soon be able to track all your players\' progress in one place!',
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  const handleSchedule = () => {
    Vibration.vibrate(50);
    Alert.alert(
      '📅 Feature Coming Soon',
      'Smart scheduling system is in development. Auto-schedule sessions, manage conflicts, and sync with calendars!',
      [{ text: 'Can\'t wait!', style: 'default' }]
    );
  };

  const handleAnalytics = () => {
    Vibration.vibrate(50);
    Alert.alert(
      '📊 Feature Coming Soon',
      'Advanced analytics dashboard is being built. Get detailed insights into player performance and training effectiveness!',
      [{ text: 'Exciting!', style: 'default' }]
    );
  };

  const handleMessages = () => {
    Vibration.vibrate(50);
    Alert.alert(
      '💬 Feature Coming Soon',
      'Real-time messaging system is under development. Chat with players, share feedback, and build stronger connections!',
      [{ text: 'Great!', style: 'default' }]
    );
  };

  const handleDrillLibrary = () => {
    Vibration.vibrate(50);
    Alert.alert(
      '🏃‍♂️ Feature Coming Soon',
      'Comprehensive drill library is being created. Access hundreds of exercises with video demonstrations!',
      [{ text: 'Perfect!', style: 'default' }]
    );
  };

  const handleNutrition = () => {
    Vibration.vibrate(50);
    Alert.alert(
      '🥗 Feature Coming Soon',
      'Nutrition planning tools are in development. Create meal plans and provide dietary guidance to your athletes!',
      [{ text: 'Sounds good!', style: 'default' }]
    );
  };

  const handleRevenue = () => {
    Vibration.vibrate(50);
    Alert.alert(
      '💰 Feature Coming Soon',
      'Revenue tracking and payment management system is being finalized. Monitor earnings and manage transactions effortlessly!',
      [{ text: 'Fantastic!', style: 'default' }]
    );
  };

  const renderQuickActionCard = (item, index) => {
    const animatedStyle = {
      transform: [
        {
          scale: animationValues[index],
        },
      ],
    };

    return (
      <Animated.View key={item.id} style={[animatedStyle, { marginBottom: SPACING.md }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            animateCard(index);
            setTimeout(() => item.action(), 150);
          }}
        >
          <Card
            style={{
              width: CARD_WIDTH,
              height: 120,
              marginHorizontal: SPACING.xs,
              elevation: 6,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={item.gradient}
              style={{
                flex: 1,
                padding: SPACING.md,
                justifyContent: 'space-between',
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Surface
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 12,
                    padding: SPACING.xs,
                    elevation: 0,
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={24}
                    color="white"
                  />
                </Surface>
                {item.badge && (
                  <Surface
                    style={{
                      backgroundColor: COLORS.error,
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      elevation: 4,
                    }}
                  >
                    <Text style={[TEXT_STYLES.caption, { color: 'white', fontWeight: 'bold' }]}>
                      {item.badge}
                    </Text>
                  </Surface>
                )}
              </View>
              <View>
                <Text
                  style={[
                    TEXT_STYLES.subtitle2,
                    {
                      color: 'white',
                      fontWeight: 'bold',
                      marginBottom: 2,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    TEXT_STYLES.caption,
                    {
                      color: 'rgba(255, 255, 255, 0.8)',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.subtitle}
                </Text>
              </View>
            </LinearGradient>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: SPACING.md }}>
      {/* Section Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: SPACING.md,
          marginTop: SPACING.sm,
        }}
      >
        <Text style={[TEXT_STYLES.h6, { color: COLORS.text, fontWeight: 'bold' }]}>
          Quick Actions ⚡
        </Text>
        <Chip
          mode="outlined"
          compact
          textStyle={{ fontSize: 12, color: COLORS.primary }}
          style={{
            borderColor: COLORS.primary,
            backgroundColor: 'transparent',
          }}
        >
          {quickActionItems.length} Tools
        </Chip>
      </View>

      {/* Quick Actions Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: SPACING.lg,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {quickActionItems.map((item, index) => renderQuickActionCard(item, index))}
        </View>

        {/* Motivational Footer */}
        <Surface
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            padding: SPACING.md,
            marginTop: SPACING.md,
            elevation: 2,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Icon
              name="jump-rope"
              size={32}
              color={COLORS.warning}
              style={{ marginBottom: SPACING.xs }}
            />
            <Text
              style={[
                TEXT_STYLES.subtitle2,
                {
                  color: COLORS.text,
                  textAlign: 'center',
                  fontWeight: '600',
                  marginBottom: SPACING.xs,
                },
              ]}
            >
              Keep Building Champions! 🏆
            </Text>
            <Text
              style={[
                TEXT_STYLES.caption,
                {
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                  lineHeight: 16,
                },
              ]}
            >
              Every great coach starts with great tools. Use these quick actions to streamline your coaching workflow.
            </Text>
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
};

export default QuickActions;