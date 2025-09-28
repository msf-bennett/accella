import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import {
  Card,
  ProgressBar,
  Chip,
  Surface,
  Avatar,
  IconButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants';

const { width } = Dimensions.get('window');

const MonthlyProgress = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { monthlyData, loading } = useSelector(state => state.progress);
  
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    loadMonthlyProgress();
  }, []);

  const loadMonthlyProgress = useCallback(async () => {
    try {
      // Simulate API call - replace with actual Redux action
      // dispatch(fetchMonthlyProgress());
    } catch (error) {
      Alert.alert('Error', 'Failed to load progress data');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMonthlyProgress();
    setRefreshing(false);
  }, [loadMonthlyProgress]);

  // Mock data - replace with actual data from Redux store
  const mockData = {
    currentMonth: 'December 2025',
    totalSessions: 24,
    completedSessions: 18,
    streak: 7,
    points: 2450,
    level: 'Bronze Champion',
    nextLevel: 'Silver Warrior',
    pointsToNext: 550,
    weeklyProgress: [85, 92, 78, 88], // Last 4 weeks
    achievements: [
      { id: 1, name: 'Perfect Week', icon: 'star', color: '#FFD700' },
      { id: 2, name: 'Early Bird', icon: 'wb-sunny', color: '#FF6B35' },
      { id: 3, name: 'Team Player', icon: 'group', color: '#4ECDC4' },
    ],
    skillProgress: [
      { skill: 'Speed', progress: 0.75, improvement: '+12%' },
      { skill: 'Strength', progress: 0.68, improvement: '+8%' },
      { skill: 'Agility', progress: 0.82, improvement: '+15%' },
      { skill: 'Endurance', progress: 0.71, improvement: '+10%' },
    ]
  };

  const completionPercentage = (mockData.completedSessions / mockData.totalSessions) * 100;
  const levelProgress = (mockData.points % 1000) / 1000; // Assuming 1000 points per level

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Progress 📈</Text>
          <Text style={styles.headerSubtitle}>{mockData.currentMonth}</Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
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
          {/* Overall Progress Card */}
          <Card style={styles.progressCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.cardGradient}
            >
              <View style={styles.progressHeader}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle}>Monthly Goal</Text>
                  <Text style={styles.progressStats}>
                    {mockData.completedSessions}/{mockData.totalSessions} Sessions
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(completionPercentage)}% Complete 🎯
                  </Text>
                </View>
                <View style={styles.streakContainer}>
                  <Icon name="local-fire-department" size={32} color="#FF6B35" />
                  <Text style={styles.streakText}>{mockData.streak}</Text>
                  <Text style={styles.streakLabel}>Day Streak</Text>
                </View>
              </View>
              <ProgressBar
                progress={completionPercentage / 100}
                color="#FFD700"
                style={styles.progressBar}
              />
            </LinearGradient>
          </Card>

          {/* Level Progress */}
          <Card style={styles.levelCard}>
            <View style={styles.levelContent}>
              <View style={styles.levelInfo}>
                <Avatar.Text
                  size={50}
                  label="🏆"
                  style={[styles.levelAvatar, { backgroundColor: COLORS.primary }]}
                />
                <View style={styles.levelDetails}>
                  <Text style={styles.currentLevel}>{mockData.level}</Text>
                  <Text style={styles.nextLevel}>Next: {mockData.nextLevel}</Text>
                  <Text style={styles.pointsInfo}>
                    {mockData.points} pts ({mockData.pointsToNext} to next level)
                  </Text>
                </View>
              </View>
              <ProgressBar
                progress={levelProgress}
                color={COLORS.primary}
                style={styles.levelProgressBar}
              />
            </View>
          </Card>

          {/* Weekly Progress Chart */}
          <Card style={styles.weeklyCard}>
            <Text style={styles.sectionTitle}>Weekly Progress 📊</Text>
            <View style={styles.weeklyChart}>
              {mockData.weeklyProgress.map((progress, index) => (
                <View key={index} style={styles.weekBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${progress}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.weekLabel}>W{index + 1}</Text>
                  <Text style={styles.weekPercent}>{progress}%</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Achievements */}
          <Card style={styles.achievementsCard}>
            <Text style={styles.sectionTitle}>This Month's Achievements 🏅</Text>
            <View style={styles.achievementsGrid}>
              {mockData.achievements.map((achievement) => (
                <Surface key={achievement.id} style={styles.achievementItem}>
                  <Icon
                    name={achievement.icon}
                    size={30}
                    color={achievement.color}
                  />
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                </Surface>
              ))}
            </View>
          </Card>

          {/* Skill Progress */}
          <Card style={styles.skillsCard}>
            <Text style={styles.sectionTitle}>Skill Development 💪</Text>
            <View style={styles.skillsList}>
              {mockData.skillProgress.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName}>{skill.skill}</Text>
                    <Chip
                      mode="outlined"
                      compact
                      textStyle={styles.improvementText}
                      style={styles.improvementChip}
                    >
                      {skill.improvement}
                    </Chip>
                  </View>
                  <ProgressBar
                    progress={skill.progress}
                    color={COLORS.success}
                    style={styles.skillProgressBar}
                  />
                  <Text style={styles.skillPercentage}>
                    {Math.round(skill.progress * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Motivational Message */}
          <Card style={styles.motivationCard}>
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.motivationGradient}
            >
              <Icon name="jump-rope" size={40} color="#FFD700" />
              <Text style={styles.motivationTitle}>
                You're Doing Amazing! 🌟
              </Text>
              <Text style={styles.motivationText}>
                Keep up the great work! You're {Math.round(completionPercentage)}% towards your monthly goal.
                Every session makes you stronger! 💪
              </Text>
            </LinearGradient>
          </Card>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  progressCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    ...TEXT_STYLES.h3,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  progressStats: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    color: '#FFD700',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.sm,
  },
  streakText: {
    ...TEXT_STYLES.h2,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  streakLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  levelCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  levelContent: {},
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  levelAvatar: {
    marginRight: SPACING.md,
  },
  levelDetails: {
    flex: 1,
  },
  currentLevel: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  nextLevel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  pointsInfo: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  levelProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  weeklyCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  weekBar: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  barContainer: {
    height: 80,
    width: 30,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  weekLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  weekPercent: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  achievementsCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  achievementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementItem: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    elevation: 2,
  },
  achievementName: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: 'bold',
  },
  skillsCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  skillsList: {},
  skillItem: {
    marginBottom: SPACING.lg,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  skillName: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  improvementChip: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  improvementText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  skillProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  skillPercentage: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  motivationCard: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderRadius: 12,
    elevation: 4,
  },
  motivationGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  motivationTitle: {
    ...TEXT_STYLES.h3,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  motivationText: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default MonthlyProgress;
