import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {
  Card,
  Button,
  Avatar,
  Chip,
  ProgressBar,
  Badge,
  IconButton,
  Surface,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/styles';

const { width, height } = Dimensions.get('window');

const PersonalBest = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, personalBests, loading } = useSelector(state => state.child);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Load personal bests
    loadPersonalBests();
  }, []);

  const loadPersonalBests = useCallback(async () => {
    try {
      // Simulate API call for personal bests
      // dispatch(fetchPersonalBests(user.id));
      
      // For now, show development alert
      setTimeout(() => {
        Alert.alert(
          'Feature Development',
          'Personal Best tracking is currently being developed. This will showcase your child\'s achievements and record improvements over time.',
          [{ text: 'OK' }]
        );
      }, 1000);
    } catch (error) {
      console.error('Error loading personal bests:', error);
    }
  }, [user?.id, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPersonalBests();
    setRefreshing(false);
  }, [loadPersonalBests]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Filter personal bests based on category
  };

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    // Filter personal bests based on timeframe
  };

  const handleRecordPress = (record) => {
    // Navigate to detailed record view with history
    navigation.navigate('RecordDetail', { recordId: record.id });
  };

  const handleAddRecord = () => {
    Alert.alert(
      'Add New Record',
      'Feature coming soon! Coaches will be able to add new personal best records for their athletes.',
      [{ text: 'OK' }]
    );
  };

  const celebrateAchievement = () => {
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderPersonalBestCard = (record, index) => {
    const cardOpacity = scrollY.interpolate({
      inputRange: [0, 50 * index, 50 * (index + 2)],
      outputRange: [1, 1, 0.3],
      extrapolate: 'clamp',
    });

    const improvementPercentage = record.improvement || 0;
    const isNewRecord = record.isNew;

    return (
      <Animated.View
        key={record.id}
        style={[
          styles.recordCard,
          { opacity: cardOpacity },
          isNewRecord && styles.newRecordCard
        ]}
      >
        <Card style={[styles.card, isNewRecord && styles.newRecordBorder]} onPress={() => handleRecordPress(record)}>
          {isNewRecord && (
            <View style={styles.newRecordBadge}>
              <Text style={styles.newRecordText}>NEW! 🎉</Text>
            </View>
          )}
          
          <Card.Content style={styles.cardContent}>
            <View style={styles.recordHeader}>
              <View style={styles.recordIcon}>
                <LinearGradient
                  colors={[record.color + '40', record.color + '20']}
                  style={styles.iconBackground}
                >
                  <Icon name={record.icon} size={24} color={record.color} />
                </LinearGradient>
              </View>
              
              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordCategory}>{record.category}</Text>
              </View>
              
              {improvementPercentage > 0 && (
                <Chip 
                  mode="flat" 
                  style={[styles.improvementChip, { backgroundColor: COLORS.success + '20' }]}
                  textStyle={{ color: COLORS.success, fontSize: 10, fontWeight: 'bold' }}
                >
                  +{improvementPercentage}%
                </Chip>
              )}
            </View>

            <View style={styles.recordValue}>
              <Text style={styles.currentRecord}>{record.value}</Text>
              <Text style={styles.recordUnit}>{record.unit}</Text>
            </View>

            {record.previousValue && (
              <View style={styles.comparisonRow}>
                <Text style={styles.previousLabel}>Previous: </Text>
                <Text style={styles.previousValue}>{record.previousValue} {record.unit}</Text>
                <Icon name="trending-up" size={16} color={COLORS.success} />
              </View>
            )}

            <View style={styles.recordFooter}>
              <View style={styles.dateInfo}>
                <Icon name="event" size={14} color={COLORS.textLight} />
                <Text style={styles.recordDate}>{record.date}</Text>
              </View>
              
              <View style={styles.coachInfo}>
                <Avatar.Text
                  size={20}
                  label={record.coach.initials}
                  style={[styles.coachAvatar, { backgroundColor: record.color + '30' }]}
                  labelStyle={{ fontSize: 10, color: record.color }}
                />
                <Text style={styles.coachName}>{record.coach.name}</Text>
              </View>
            </View>

            {record.note && (
              <View style={styles.recordNote}>
                <Icon name="comment" size={14} color={COLORS.primary} />
                <Text style={styles.noteText}>{record.note}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderAchievementBadge = (achievement) => (
    <TouchableOpacity
      key={achievement.id}
      style={styles.achievementBadge}
      onPress={celebrateAchievement}
    >
      <LinearGradient
        colors={[achievement.color, achievement.color + '80']}
        style={styles.badgeGradient}
      >
        <Text style={styles.badgeEmoji}>{achievement.emoji}</Text>
      </LinearGradient>
      <Text style={styles.badgeTitle}>{achievement.title}</Text>
    </TouchableOpacity>
  );

  // Mock data for development
  const mockPersonalBests = [
    {
      id: 1,
      title: '100m Sprint',
      category: 'Speed',
      value: '14.2',
      unit: 'seconds',
      previousValue: '14.8',
      improvement: 4.1,
      date: 'Dec 15, 2024',
      isNew: true,
      icon: 'directions-run',
      color: '#FF6B35',
      coach: { name: 'Coach Sarah', initials: 'CS' },
      note: 'Excellent form and explosive start!',
    },
    {
      id: 2,
      title: 'Long Jump',
      category: 'Power',
      value: '4.8',
      unit: 'meters',
      previousValue: '4.5',
      improvement: 6.7,
      date: 'Dec 10, 2024',
      isNew: false,
      icon: 'jump-to-top',
      color: '#667eea',
      coach: { name: 'Coach Mike', initials: 'CM' },
      note: 'Great takeoff technique improvement',
    },
    {
      id: 3,
      title: 'Push-ups',
      category: 'Strength',
      value: '45',
      unit: 'reps',
      previousValue: '38',
      improvement: 18.4,
      date: 'Dec 8, 2024',
      isNew: false,
      icon: 'fitness-center',
      color: '#E74C3C',
      coach: { name: 'Coach Sarah', initials: 'CS' },
    },
    {
      id: 4,
      title: '1500m Run',
      category: 'Endurance',
      value: '6:45',
      unit: 'minutes',
      previousValue: '7:12',
      improvement: 6.2,
      date: 'Dec 5, 2024',
      isNew: false,
      icon: 'timer',
      color: '#27AE60',
      coach: { name: 'Coach Mike', initials: 'CM' },
      note: 'Consistent pace throughout the race',
    },
  ];

  const mockAchievements = [
    { id: 1, title: 'Speed Demon', emoji: '⚡', color: '#FFD700' },
    { id: 2, title: 'Power House', emoji: '💪', color: '#FF6B35' },
    { id: 3, title: 'Consistent', emoji: '🎯', color: '#667eea' },
    { id: 4, title: 'Dedicated', emoji: '🔥', color: '#E74C3C' },
  ];

  const categories = [
    { key: 'all', label: 'All', count: mockPersonalBests.length },
    { key: 'speed', label: 'Speed', count: mockPersonalBests.filter(r => r.category === 'Speed').length },
    { key: 'power', label: 'Power', count: mockPersonalBests.filter(r => r.category === 'Power').length },
    { key: 'strength', label: 'Strength', count: mockPersonalBests.filter(r => r.category === 'Strength').length },
    { key: 'endurance', label: 'Endurance', count: mockPersonalBests.filter(r => r.category === 'Endurance').length },
  ];

  const timeframes = [
    { key: 'all', label: 'All Time' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'This Quarter' },
    { key: 'year', label: 'This Year' },
  ];

  const totalRecords = mockPersonalBests.length;
  const newRecords = mockPersonalBests.filter(r => r.isNew).length;
  const avgImprovement = mockPersonalBests.reduce((sum, r) => sum + (r.improvement || 0), 0) / totalRecords;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Personal Best</Text>
            <IconButton
              icon="share"
              iconColor="white"
              size={24}
              onPress={() => Alert.alert('Share', 'Share achievements feature coming soon!')}
            />
          </View>
          <Text style={styles.headerSubtitle}>
            Celebrate your achievements! 🏆
          </Text>
        </View>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{totalRecords}</Text>
            <Text style={styles.statLabel}>Total Records</Text>
          </Surface>
          <Surface style={[styles.statCard, styles.highlightCard]}>
            <Text style={[styles.statNumber, styles.highlightNumber]}>{newRecords}</Text>
            <Text style={[styles.statLabel, styles.highlightLabel]}>New This Month</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{avgImprovement.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Avg Improvement</Text>
          </Surface>
        </View>
      </View>

      {/* Achievement Badges */}
      <View style={styles.achievementsContainer}>
        <Text style={styles.achievementsTitle}>Recent Achievements</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsScroll}
        >
          {mockAchievements.map(renderAchievementBadge)}
        </ScrollView>
      </View>

      {/* Filter Options */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <Text style={styles.filterLabel}>Category:</Text>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              onPress={() => handleCategoryChange(category.key)}
              style={[
                styles.filterChip,
                selectedCategory === category.key && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === category.key && styles.filterChipTextActive
              ]}>
                {category.label} ({category.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <Text style={styles.filterLabel}>Time:</Text>
          {timeframes.map((timeframe) => (
            <TouchableOpacity
              key={timeframe.key}
              onPress={() => handleTimeframeChange(timeframe.key)}
              style={[
                styles.filterChip,
                selectedTimeframe === timeframe.key && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterChipText,
                selectedTimeframe === timeframe.key && styles.filterChipTextActive
              ]}>
                {timeframe.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Personal Bests List */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {mockPersonalBests.map((record, index) => renderPersonalBestCard(record, index))}

          {/* Motivation Card */}
          <Card style={styles.motivationCard}>
            <LinearGradient
              colors={['#667eea40', '#764ba240']}
              style={styles.motivationGradient}
            >
              <Card.Content style={styles.motivationContent}>
                <Text style={styles.motivationTitle}>Keep Going! 🚀</Text>
                <Text style={styles.motivationText}>
                  You're improving every day. Your next personal best is just around the corner!
                </Text>
              </Card.Content>
            </LinearGradient>
          </Card>
        </Animated.View>
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleAddRecord}
        color="white"
      />

      {/* Celebration Animation Overlay */}
      <Animated.View
        style={[
          styles.celebrationOverlay,
          {
            opacity: celebrationAnim,
            transform: [{
              scale: celebrationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2],
              })
            }]
          }
        ]}
        pointerEvents="none"
      >
        <Text style={styles.celebrationText}>🎉 Amazing! 🎉</Text>
      </Animated.View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  statsContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  highlightCard: {
    backgroundColor: COLORS.primary + '10',
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  highlightNumber: {
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  highlightLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  achievementsContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  achievementsTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: '600',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  achievementsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  achievementBadge: {
    alignItems: 'center',
    width: 70,
  },
  badgeGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badgeEmoji: {
    fontSize: 20,
  },
  badgeTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    textAlign: 'center',
    fontSize: 10,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterScroll: {
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontWeight: '500',
    fontSize: 11,
  },
  filterChipTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  recordCard: {
    marginBottom: SPACING.md,
  },
  newRecordCard: {
    transform: [{ scale: 1.02 }],
  },
  card: {
    borderRadius: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  newRecordBorder: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  newRecordBadge: {
    position: 'absolute',
    top: -5,
    right: 15,
    backgroundColor: '#FFD700',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    zIndex: 1,
  },
  newRecordText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  recordIcon: {
    marginRight: SPACING.md,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  recordCategory: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  improvementChip: {
    height: 24,
  },
  recordValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  currentRecord: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  recordUnit: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  previousLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  previousValue: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    textDecorationLine: 'line-through',
    marginRight: SPACING.sm,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    marginRight: SPACING.sm,
  },
  coachName: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  recordNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  noteText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    flex: 1,
    fontStyle: 'italic',
  },
  motivationCard: {
    marginTop: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  motivationGradient: {
    flex: 1,
  },
  motivationContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  motivationTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  motivationText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  celebrationText: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
};

export default PersonalBest;