import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Vibration,
  Alert,
} from 'react-native';
import { Card, Avatar, Chip, Surface, ProgressBar } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  gold: '#ffd700',
  silver: '#c0c0c0',
  bronze: '#cd7f32',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  body: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  caption: {
    fontSize: 10,
    color: COLORS.textLight,
  },
};

// Achievement types and configurations
const ACHIEVEMENT_TYPES = {
  STREAK: {
    icon: 'local-fire-department',
    color: '#ff6b35',
    gradients: ['#ff6b35', '#f7931e'],
  },
  CONSISTENCY: {
    icon: 'trending-up',
    color: COLORS.success,
    gradients: [COLORS.success, '#8bc34a'],
  },
  MILESTONE: {
    icon: 'jump-rope',
    color: COLORS.gold,
    gradients: [COLORS.gold, '#ffeb3b'],
  },
  IMPROVEMENT: {
    icon: 'show-chart',
    color: COLORS.primary,
    gradients: [COLORS.primary, COLORS.secondary],
  },
  DEDICATION: {
    icon: 'favorite',
    color: '#e91e63',
    gradients: ['#e91e63', '#f06292'],
  },
  COMPLETION: {
    icon: 'check-circle',
    color: COLORS.success,
    gradients: [COLORS.success, '#66bb6a'],
  },
};

const BADGE_TIERS = {
  BRONZE: { color: COLORS.bronze, multiplier: 1 },
  SILVER: { color: COLORS.silver, multiplier: 1.5 },
  GOLD: { color: COLORS.gold, multiplier: 2 },
  PLATINUM: { color: '#e5e4e2', multiplier: 3 },
};

const AchievementBadge = ({
  achievement = {},
  size = 'medium',
  showProgress = true,
  onPress = null,
  animated = true,
  style = {},
}) => {
  const dispatch = useDispatch();
  const userProgress = useSelector(state => state.user?.progress || {});
  const achievements = useSelector(state => state.achievements?.badges || []);
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  // Component state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  // Default achievement structure
  const defaultAchievement = {
    id: 'sample_badge',
    name: '🏃‍♂️ Consistency Champion',
    description: 'Complete 7 days in a row',
    type: 'CONSISTENCY',
    tier: 'GOLD',
    currentValue: 5,
    targetValue: 7,
    points: 100,
    unlockedAt: null,
    category: 'training',
    rarity: 'common',
    ...achievement,
  };

  const badgeData = defaultAchievement;
  const typeConfig = ACHIEVEMENT_TYPES[badgeData.type] || ACHIEVEMENT_TYPES.MILESTONE;
  const tierConfig = BADGE_TIERS[badgeData.tier] || BADGE_TIERS.BRONZE;

  // Size configurations
  const sizeConfig = {
    small: { cardSize: 80, iconSize: 24, titleSize: 10 },
    medium: { cardSize: 120, iconSize: 32, titleSize: 12 },
    large: { cardSize: 160, iconSize: 40, titleSize: 14 },
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  useEffect(() => {
    // Calculate progress
    const progress = Math.min(badgeData.currentValue / badgeData.targetValue, 1);
    setProgressValue(progress);
    setIsUnlocked(progress >= 1 || badgeData.unlockedAt !== null);

    if (animated) {
      // Entrance animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Continuous shimmer for unlocked badges
      if (isUnlocked) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(shimmerAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(shimmerAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, [badgeData.currentValue, badgeData.targetValue, animated, isUnlocked]);

  const handlePress = () => {
    if (onPress) {
      Vibration.vibrate(50);
      
      // Pulse animation on press
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onPress(badgeData);
    } else {
      // Default behavior - show achievement details
      Alert.alert(
        `${badgeData.name} ${isUnlocked ? '🎉' : '🔒'}`,
        `${badgeData.description}\n\nProgress: ${badgeData.currentValue}/${badgeData.targetValue}\nPoints: ${badgeData.points} pts\nTier: ${badgeData.tier}`,
        [{ text: 'Awesome! 💪', onPress: () => {} }]
      );
    }
  };

  const getBadgeStyle = () => {
    if (isUnlocked) {
      return {
        opacity: 1,
        transform: [
          { scale: scaleAnim },
          { scale: pulseAnim },
        ],
      };
    }
    return {
      opacity: 0.5,
      transform: [{ scale: scaleAnim }],
    };
  };

  const getProgressColor = () => {
    if (progressValue >= 1) return COLORS.success;
    if (progressValue >= 0.7) return COLORS.warning;
    return COLORS.primary;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <Animated.View style={getBadgeStyle()}>
        <Surface style={[styles.badgeContainer, { 
          width: currentSize.cardSize, 
          height: currentSize.cardSize + (showProgress ? 20 : 0) 
        }]}>
          {/* Background gradient */}
          <LinearGradient
            colors={isUnlocked ? typeConfig.gradients : ['#e0e0e0', '#bdbdbd']}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Shimmer effect for unlocked badges */}
            {isUnlocked && animated && (
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  {
                    opacity: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.3],
                    }),
                  },
                ]}
              />
            )}

            {/* Main badge content */}
            <View style={styles.badgeContent}>
              {/* Tier indicator */}
              <View style={[styles.tierIndicator, { backgroundColor: tierConfig.color }]}>
                <Text style={styles.tierText}>{badgeData.tier[0]}</Text>
              </View>

              {/* Main icon */}
              <Icon
                name={typeConfig.icon}
                size={currentSize.iconSize}
                color={isUnlocked ? COLORS.white : COLORS.textLight}
                style={styles.mainIcon}
              />

              {/* Badge name */}
              <Text
                style={[
                  TEXT_STYLES.caption,
                  { 
                    fontSize: currentSize.titleSize,
                    color: isUnlocked ? COLORS.white : COLORS.textLight,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }
                ]}
                numberOfLines={2}
              >
                {badgeData.name}
              </Text>

              {/* Points indicator */}
              <Chip
                mode="flat"
                style={[styles.pointsChip, { opacity: isUnlocked ? 1 : 0.7 }]}
                textStyle={styles.pointsText}
              >
                {badgeData.points} pts
              </Chip>

              {/* Lock overlay for locked badges */}
              {!isUnlocked && (
                <View style={styles.lockOverlay}>
                  <Icon name="lock" size={20} color={COLORS.textLight} />
                </View>
              )}
            </View>
          </LinearGradient>

          {/* Progress bar */}
          {showProgress && (
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={progressValue}
                color={getProgressColor()}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {badgeData.currentValue}/{badgeData.targetValue}
              </Text>
            </View>
          )}
        </Surface>
      </Animated.View>

      {/* New badge indicator */}
      {isUnlocked && badgeData.isNew && (
        <View style={styles.newBadgeIndicator}>
          <Text style={styles.newBadgeText}>NEW!</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SPACING.xs,
  },
  badgeContainer: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    padding: SPACING.sm,
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
  },
  badgeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tierIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  tierText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  mainIcon: {
    marginBottom: SPACING.xs,
  },
  pointsChip: {
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 24,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  progressContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: 'bold',
  },
  newBadgeIndicator: {
    position: 'absolute',
    top: -5,
    left: -5,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    elevation: 6,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default AchievementBadge;