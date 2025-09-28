import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Alert,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Card, FAB, Portal, Modal, Surface } from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const QuickActions = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, unreadMessages, pendingApprovals } = useSelector(state => state.trainer);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const quickActionItems = [
    {
      id: 'add_client',
      title: 'Add Client',
      subtitle: 'New trainee',
      icon: 'person-add',
      color: COLORS.primary,
      gradient: ['#667eea', '#764ba2'],
      action: () => handleQuickAction('AddClient'),
      badge: null,
    },
    {
      id: 'create_workout',
      title: 'Create Workout',
      subtitle: 'New session',
      icon: 'fitness-center',
      color: COLORS.success,
      gradient: ['#11998e', '#38ef7d'],
      action: () => handleQuickAction('CreateWorkout'),
      badge: null,
    },
    {
      id: 'schedule_session',
      title: 'Schedule',
      subtitle: 'Book session',
      icon: 'schedule',
      color: '#ff6b6b',
      gradient: ['#ff6b6b', '#ffa726'],
      action: () => handleQuickAction('ScheduleSession'),
      badge: null,
    },
    {
      id: 'messages',
      title: 'Messages',
      subtitle: 'Chat with clients',
      icon: 'message',
      color: '#4ecdc4',
      gradient: ['#4ecdc4', '#44a08d'],
      action: () => handleQuickAction('Messages'),
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    {
      id: 'progress_review',
      title: 'Review Progress',
      subtitle: 'Check client stats',
      icon: 'trending-up',
      color: '#9b59b6',
      gradient: ['#9b59b6', '#8e44ad'],
      action: () => handleQuickAction('ProgressReview'),
      badge: pendingApprovals > 0 ? pendingApprovals : null,
    },
    {
      id: 'ai_assistant',
      title: 'AI Assistant',
      subtitle: 'Generate plans',
      icon: 'auto-awesome',
      color: '#f39c12',
      gradient: ['#f39c12', '#e67e22'],
      action: () => handleQuickAction('AIAssistant'),
      badge: null,
    },
  ];

  const moreActions = [
    {
      id: 'nutrition_plans',
      title: 'Nutrition Plans',
      icon: 'restaurant',
      action: () => handleQuickAction('NutritionPlans'),
    },
    {
      id: 'video_analysis',
      title: 'Video Analysis',
      icon: 'video-library',
      action: () => handleQuickAction('VideoAnalysis'),
    },
    {
      id: 'payment_history',
      title: 'Payments',
      icon: 'payment',
      action: () => handleQuickAction('PaymentHistory'),
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'analytics',
      action: () => handleQuickAction('Analytics'),
    },
    {
      id: 'certifications',
      title: 'Certifications',
      icon: 'verified',
      action: () => handleQuickAction('Certifications'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      action: () => handleQuickAction('Settings'),
    },
  ];

  const handleQuickAction = useCallback((screenName) => {
    Vibration.vibrate(50);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate or show development alert
    switch (screenName) {
      case 'AddClient':
        navigation.navigate('AddClient');
        break;
      case 'CreateWorkout':
        navigation.navigate('CreateWorkout');
        break;
      case 'ScheduleSession':
        navigation.navigate('ScheduleSession');
        break;
      case 'Messages':
        navigation.navigate('Messages');
        break;
      case 'ProgressReview':
        navigation.navigate('ProgressReview');
        break;
      default:
        Alert.alert(
          'Feature Development',
          `${screenName} feature is currently under development and will be available in the next update! 🚀`,
          [{ text: 'Got it!', style: 'default' }]
        );
    }
  }, [navigation, animatedValue]);

  const toggleMoreActions = useCallback(() => {
    setShowMoreActions(!showMoreActions);
    Vibration.vibrate(30);
  }, [showMoreActions]);

  const renderQuickActionCard = ({ item, index }) => {
    const animatedScale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.95],
    });

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.actionCard,
          { transform: [{ scale: animatedScale }] }
        ]}
      >
        <TouchableOpacity
          onPress={item.action}
          activeOpacity={0.8}
          style={styles.actionTouchable}
        >
          <LinearGradient
            colors={item.gradient}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionHeader}>
                <Icon name={item.icon} size={28} color="white" />
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.actionTitle}>{item.title}</Text>
              <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderMoreActionItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.moreActionItem}
      onPress={item.action}
      activeOpacity={0.7}
    >
      <Surface style={styles.moreActionSurface}>
        <Icon name={item.icon} size={24} color={COLORS.primary} />
        <Text style={styles.moreActionText}>{item.title}</Text>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.sectionSubtitle}>
          Fast access to your most used features ⚡
        </Text>
      </View>

      {/* Main Quick Actions Grid */}
      <View style={styles.actionsGrid}>
        {quickActionItems.map((item, index) => 
          renderQuickActionCard({ item, index })
        )}
      </View>

      {/* More Actions Button */}
      <TouchableOpacity
        style={styles.moreActionsButton}
        onPress={toggleMoreActions}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.moreActionsGradient}
        >
          <Icon name="more-horiz" size={24} color="white" />
          <Text style={styles.moreActionsText}>More Actions</Text>
          <Icon 
            name={showMoreActions ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={20} 
            color="white" 
          />
        </LinearGradient>
      </TouchableOpacity>

      {/* More Actions Modal */}
      <Portal>
        <Modal
          visible={showMoreActions}
          onDismiss={toggleMoreActions}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalSurface}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>More Actions</Text>
              <TouchableOpacity onPress={toggleMoreActions}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.moreActionsGrid}>
              {moreActions.map((item) => renderMoreActionItem({ item }))}
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* Emergency Quick Action FAB */}
      <FAB
        icon="add"
        style={styles.fab}
        color="white"
        onPress={() => handleQuickAction('CreateWorkout')}
        animated={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    opacity: 0.8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  actionCard: {
    width: (width - SPACING.md * 2 - SPACING.sm) / 2,
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: SPACING.md,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  actionContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '400',
  },
  moreActionsButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moreActionsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  moreActionsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  modalSurface: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  moreActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moreActionItem: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  moreActionSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 2,
  },
  moreActionText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    elevation: 8,
  },
});

export default QuickActions;