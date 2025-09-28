import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Alert,
  StatusBar,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width } = Dimensions.get('window');

const PersonalRecords = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [recordsAnim] = useState(new Animated.Value(0));

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const recordsData = useSelector(state => state.performance.personalRecords);

  // Mock personal records data
  const mockRecordsData = {
    totalRecords: 15,
    recentRecords: 3,
    categories: [
      { id: 'all', name: 'All Records', count: 15, icon: 'jump-rope' },
      { id: 'speed', name: 'Speed', count: 4, icon: 'flash-on' },
      { id: 'strength', name: 'Strength', count: 3, icon: 'fitness-center' },
      { id: 'endurance', name: 'Endurance', count: 5, icon: 'directions-run' },
      { id: 'skill', name: 'Technical', count: 3, icon: 'sports-soccer' },
    ],
    records: [
      {
        id: 1,
        title: '40m Sprint',
        value: '6.2s',
        previousBest: '6.5s',
        improvement: '0.3s',
        date: '2024-08-25',
        category: 'speed',
        rank: 1,
        isNew: true,
        icon: 'timer',
      },
      {
        id: 2,
        title: 'Vertical Jump',
        value: '45cm',
        previousBest: '40cm',
        improvement: '5cm',
        date: '2024-08-20',
        category: 'strength',
        rank: 1,
        isNew: true,
        icon: 'expand-less',
      },
      {
        id: 3,
        title: '1km Run',
        value: '4:32',
        previousBest: '4:45',
        improvement: '13s',
        date: '2024-08-18',
        category: 'endurance',
        rank: 2,
        isNew: false,
        icon: 'directions-run',
      },
      {
        id: 4,
        title: 'Ball Juggling',
        value: '47 touches',
        previousBest: '42 touches',
        improvement: '5 touches',
        date: '2024-08-15',
        category: 'skill',
        rank: 1,
        isNew: true,
        icon: 'sports-soccer',
      },
      {
        id: 5,
        title: 'Push-ups',
        value: '25 reps',
        previousBest: '20 reps',
        improvement: '5 reps',
        date: '2024-08-12',
        category: 'strength',
        rank: 3,
        isNew: false,
        icon: 'fitness-center',
      },
      {
        id: 6,
        title: 'Agility Ladder',
        value: '12.8s',
        previousBest: '13.3s',
        improvement: '0.5s',
        date: '2024-08-10',
        category: 'speed',
        rank: 2,
        isNew: false,
        icon: 'grid-on',
      },
      {
        id: 7,
        title: 'Plank Hold',
        value: '2:15',
        previousBest: '1:50',
        improvement: '25s',
        date: '2024-08-08',
        category: 'strength',
        rank: 1,
        isNew: false,
        icon: 'schedule',
      },
      {
        id: 8,
        title: 'Shuttle Run',
        value: '28.5s',
        previousBest: '29.2s',
        improvement: '0.7s',
        date: '2024-08-05',
        category: 'speed',
        rank: 3,
        isNew: false,
        icon: 'compare-arrows',
      },
    ],
    achievements: [
      { name: 'First Record', description: 'Set your first personal record', unlocked: true },
      { name: 'Speed Demon', description: 'Break 3 speed records', unlocked: true },
      { name: 'Consistency King', description: '5 records in one month', unlocked: true },
      { name: 'All-Rounder', description: 'Records in all categories', unlocked: false },
    ],
    streaks: {
      current: 7,
      longest: 12,
      recordsThisMonth: 3,
    },
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.stagger(100, 
        mockRecordsData.records.map(() =>
          Animated.timing(recordsAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Awesome! 🎉', 'Your records have been updated!');
    } catch (error) {
      Alert.alert('Oops! 😅', 'Unable to refresh records. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleAddRecord = () => {
    Alert.alert(
      'Add New Record! 🎯',
      'This feature will allow you to log your latest achievements!',
      [{ text: 'Coming Soon!', style: 'default' }]
    );
  };

  const handleRecordPress = (record) => {
    Alert.alert(
      `${record.title} Record! 🏆`,
      `Your best: ${record.value}\nPrevious: ${record.previousBest}\nImprovement: +${record.improvement}\nDate: ${record.date}`,
      [
        { text: 'Share', onPress: () => handleShareRecord(record) },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleShareRecord = (record) => {
    Alert.alert(
      'Share Success! 📱',
      `Your ${record.title} record has been shared with your coach!`
    );
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return COLORS.gold;
      case 2: return COLORS.silver;
      case 3: return COLORS.bronze;
      default: return COLORS.textSecondary;
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return 'looks-one';
      case 2: return 'looks-two';
      case 3: return 'looks-3';
      default: return 'more-horiz';
    }
  };

  const filteredRecords = mockRecordsData.records.filter(record => {
    const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderStatsOverview = () => (
    <Card style={styles.overviewCard} elevation={4}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.overviewGradient}
      >
        <View style={styles.overviewContent}>
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Icon name="jump-rope" size={32} color="#fff" />
              <Text style={styles.statValue}>{mockRecordsData.totalRecords}</Text>
              <Text style={styles.statLabel}>Total Records</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="new-releases" size={32} color="#fff" />
              <Text style={styles.statValue}>{mockRecordsData.recentRecords}</Text>
              <Text style={styles.statLabel}>New This Month</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="local-fire-department" size={32} color="#fff" />
              <Text style={styles.statValue}>{mockRecordsData.streaks.current}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
          <Text style={styles.motivationText}>
            Keep pushing your limits! 💪
          </Text>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderCategories = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.categoriesContainer}
      contentContainerStyle={styles.categoriesContent}
    >
      {mockRecordsData.categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.selectedCategoryChip
          ]}
        >
          <Icon 
            name={category.icon} 
            size={20} 
            color={selectedCategory === category.id ? '#fff' : COLORS.primary} 
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id && styles.selectedCategoryText
          ]}>
            {category.name}
          </Text>
          <Surface style={styles.categoryBadge}>
            <Text style={styles.categoryCount}>{category.count}</Text>
          </Surface>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRecordCard = (record, index) => (
    <Animated.View
      key={record.id}
      style={[
        styles.recordCardContainer,
        {
          opacity: recordsAnim,
          transform: [{
            translateY: recordsAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}
    >
      <TouchableOpacity onPress={() => handleRecordPress(record)}>
        <Card style={[styles.recordCard, record.isNew && styles.newRecordCard]} elevation={3}>
          <Card.Content style={styles.recordContent}>
            <View style={styles.recordHeader}>
              <View style={styles.recordLeft}>
                <Surface style={[styles.recordIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                  <Icon name={record.icon} size={24} color={COLORS.primary} />
                </Surface>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  <Text style={styles.recordDate}>{record.date}</Text>
                </View>
              </View>
              <View style={styles.recordRight}>
                <Surface style={[styles.rankBadge, { backgroundColor: `${getRankColor(record.rank)}20` }]}>
                  <Icon name={getRankIcon(record.rank)} size={20} color={getRankColor(record.rank)} />
                </Surface>
                {record.isNew && (
                  <Chip mode="flat" style={styles.newBadge} textStyle={styles.newBadgeText}>
                    NEW! 🎉
                  </Chip>
                )}
              </View>
            </View>

            <View style={styles.recordValues}>
              <View style={styles.currentValue}>
                <Text style={styles.valueLabel}>Personal Best</Text>
                <Text style={styles.currentValueText}>{record.value}</Text>
              </View>
              <View style={styles.improvement}>
                <Text style={styles.improvementLabel}>Improvement</Text>
                <View style={styles.improvementRow}>
                  <Icon name="trending-up" size={16} color={COLORS.success} />
                  <Text style={styles.improvementText}>+{record.improvement}</Text>
                </View>
                <Text style={styles.previousValueText}>from {record.previousBest}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderAchievements = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="military-tech" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.subheading, { marginLeft: SPACING.sm }]}>
            Record Achievements 🏅
          </Text>
        </View>
        {mockRecordsData.achievements.map((achievement, index) => (
          <Surface key={index} style={[
            styles.achievementItem,
            { opacity: achievement.unlocked ? 1 : 0.6 }
          ]}>
            <Icon 
              name={achievement.unlocked ? "check-circle" : "radio-button-unchecked"} 
              size={24} 
              color={achievement.unlocked ? COLORS.success : COLORS.textSecondary} 
            />
            <View style={styles.achievementContent}>
              <Text style={[styles.achievementName, !achievement.unlocked && styles.lockedText]}>
                {achievement.name}
              </Text>
              <Text style={[styles.achievementDescription, !achievement.unlocked && styles.lockedText]}>
                {achievement.description}
              </Text>
            </View>
            {achievement.unlocked && (
              <Icon name="stars" size={20} color={COLORS.warning} />
            )}
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderQuickStats = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <Text style={[TEXT_STYLES.subheading, styles.sectionTitle]}>
          Quick Stats 📊
        </Text>
        <View style={styles.quickStatsGrid}>
          <Surface style={styles.quickStatItem}>
            <Icon name="whatshot" size={24} color={COLORS.error} />
            <Text style={styles.quickStatValue}>{mockRecordsData.streaks.longest}</Text>
            <Text style={styles.quickStatLabel}>Longest Streak</Text>
          </Surface>
          <Surface style={styles.quickStatItem}>
            <Icon name="calendar-today" size={24} color={COLORS.primary} />
            <Text style={styles.quickStatValue}>{mockRecordsData.streaks.recordsThisMonth}</Text>
            <Text style={styles.quickStatLabel}>This Month</Text>
          </Surface>
          <Surface style={styles.quickStatItem}>
            <Icon name="trending-up" size={24} color={COLORS.success} />
            <Text style={styles.quickStatValue}>85%</Text>
            <Text style={styles.quickStatLabel}>Improvement Rate</Text>
          </Surface>
          <Surface style={styles.quickStatItem}>
            <Icon name="jump-rope" size={24} color={COLORS.warning} />
            <Text style={styles.quickStatValue}>12</Text>
            <Text style={styles.quickStatLabel}>Top Records</Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Personal Records</Text>
        <Text style={styles.headerSubtitle}>Your amazing achievements! 🏆</Text>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStatsOverview()}

        <Searchbar
          placeholder="Search your records... 🔍"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />

        {renderCategories()}

        <View style={styles.recordsSection}>
          <Text style={[TEXT_STYLES.subheading, styles.recordsTitle]}>
            {selectedCategory === 'all' ? 'All Records' : 
             mockRecordsData.categories.find(cat => cat.id === selectedCategory)?.name + ' Records'
            } ({filteredRecords.length})
          </Text>
          
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record, index) => renderRecordCard(record, index))
          ) : (
            <Card style={styles.emptyCard} elevation={1}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="search-off" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No records found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search or category filter</Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {renderAchievements()}
        {renderQuickStats()}

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleAddRecord}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.md,
  },
  overviewCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: SPACING.lg,
  },
  overviewContent: {
    alignItems: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  motivationText: {
    ...TEXT_STYLES.body,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  searchbar: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: SPACING.md,
  },
  categoriesContent: {
    paddingRight: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    elevation: 1,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    marginRight: SPACING.sm,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  categoryBadge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  recordsSection: {
    marginBottom: SPACING.md,
  },
  recordsTitle: {
    marginBottom: SPACING.md,
  },
  recordCardContainer: {
    marginBottom: SPACING.md,
  },
  recordCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  newRecordCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  recordContent: {
    padding: SPACING.md,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  recordDate: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  recordRight: {
    alignItems: 'flex-end',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  newBadge: {
    backgroundColor: COLORS.success,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recordValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  currentValue: {
    flex: 1,
  },
  valueLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  currentValueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  improvement: {
    alignItems: 'flex-end',
  },
  improvementLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  improvementRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  improvementText: {
    ...TEXT_STYLES.body,
    color: COLORS.success,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  previousValueText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  sectionCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    elevation: 1,
  },
  achievementContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  achievementName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  achievementDescription: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  lockedText: {
    opacity: 0.6,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickStatItem: {
    width: (width - SPACING.md * 3) / 2 - SPACING.sm,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  quickStatLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  emptyCard: {
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.subheading,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginTop: SPACING.sm,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: SPACING.xl * 2,
  },
});

export default PersonalRecords;