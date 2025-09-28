import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { 
  Card,
  Button,
  FAB,
  Avatar,
  Chip,
  IconButton,
  Surface,
  ProgressBar,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
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
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const PerformanceTests = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { clients } = useSelector((state) => state.clients);
  const { performanceTests } = useSelector((state) => state.performance);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Mock data for demonstration
  const [testCategories] = useState([
    { id: '1', name: 'Strength', icon: 'fitness-center', color: COLORS.primary },
    { id: '2', name: 'Cardio', icon: 'directions-run', color: COLORS.success },
    { id: '3', name: 'Flexibility', icon: 'accessibility', color: COLORS.warning },
    { id: '4', name: 'Balance', icon: 'balance', color: COLORS.secondary },
    { id: '5', name: 'Agility', icon: 'speed', color: '#e91e63' },
    { id: '6', name: 'Power', icon: 'flash-on', color: '#ff5722' },
  ]);

  const [recentTests] = useState([
    {
      id: '1',
      clientName: 'Sarah Johnson',
      testName: '5K Run Test',
      category: 'Cardio',
      result: '24:30 min',
      date: '2024-08-20',
      improvement: '+5%',
      status: 'completed',
      avatar: 'SJ',
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      testName: 'Bench Press Max',
      category: 'Strength',
      result: '185 lbs',
      date: '2024-08-19',
      improvement: '+10%',
      status: 'completed',
      avatar: 'MC',
    },
    {
      id: '3',
      clientName: 'Emma Wilson',
      testName: 'Flexibility Assessment',
      category: 'Flexibility',
      result: '85/100',
      date: '2024-08-18',
      improvement: '+2%',
      status: 'pending',
      avatar: 'EW',
    },
    {
      id: '4',
      clientName: 'David Brown',
      testName: 'Plank Hold',
      category: 'Strength',
      result: '3:45 min',
      date: '2024-08-17',
      improvement: '+15%',
      status: 'completed',
      avatar: 'DB',
    },
  ]);

  const [upcomingTests] = useState([
    {
      id: '1',
      clientName: 'Lisa Park',
      testName: 'Sprint 40m',
      category: 'Speed',
      scheduledDate: '2024-08-22',
      time: '10:00 AM',
      avatar: 'LP',
    },
    {
      id: '2',
      clientName: 'Tom Harris',
      testName: 'Pull-up Test',
      category: 'Strength',
      scheduledDate: '2024-08-23',
      time: '2:00 PM',
      avatar: 'TH',
    },
  ]);

  const [testStats] = useState({
    totalTests: 156,
    thisWeek: 12,
    completed: 142,
    pending: 8,
    averageImprovement: 8.5,
  });

  useEffect(() => {
    // Animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleCreateTest = () => {
    Alert.alert(
      'Create Performance Test',
      'This feature is under development. You will be able to create custom performance tests for your clients.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleTestDetails = (testId) => {
    Alert.alert(
      'Test Details',
      'Detailed test analytics and client performance history will be available here.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleScheduleTest = () => {
    Alert.alert(
      'Schedule Test',
      'You will be able to schedule performance tests for your clients with notifications.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const getImprovementColor = (improvement) => {
    if (improvement.startsWith('+')) return COLORS.success;
    if (improvement.startsWith('-')) return COLORS.error;
    return COLORS.textSecondary;
  };

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.statsGradient}
      >
        <View style={styles.statsContent}>
          <Text style={[TEXT_STYLES.h3, { color: '#fff' }]}>
            Performance Overview 📊
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{testStats.totalTests}</Text>
              <Text style={styles.statLabel}>Total Tests</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{testStats.thisWeek}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{testStats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{testStats.averageImprovement}%</Text>
              <Text style={styles.statLabel}>Avg Growth</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderTestCategories = () => (
    <View style={styles.section}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
        Test Categories 🎯
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          {testCategories.map((category, index) => (
            <Animated.View
              key={category.id}
              style={[
                styles.categoryCard,
                {
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, index * 5 + 50],
                    })
                  }],
                  opacity: fadeAnim,
                }
              ]}
            >
              <TouchableOpacity
                onPress={() => handleTestDetails(category.id)}
                style={styles.categoryTouchable}
              >
                <LinearGradient
                  colors={[category.color, `${category.color}CC`]}
                  style={styles.categoryGradient}
                >
                  <Icon name={category.icon} size={32} color="#fff" />
                  <Text style={styles.categoryText}>{category.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderRecentTests = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
          Recent Results 📈
        </Text>
        <TouchableOpacity onPress={() => handleTestDetails('all')}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {recentTests.map((test, index) => (
        <Animated.View
          key={test.id}
          style={[
            {
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, index % 2 === 0 ? -20 : 20],
                })
              }],
              opacity: fadeAnim,
            }
          ]}
        >
          <Card style={styles.testCard}>
            <TouchableOpacity
              onPress={() => handleTestDetails(test.id)}
              style={styles.testCardContent}
            >
              <View style={styles.testCardLeft}>
                <Avatar.Text
                  size={50}
                  label={test.avatar}
                  style={{ backgroundColor: COLORS.primary }}
                />
                <View style={styles.testInfo}>
                  <Text style={[TEXT_STYLES.body, styles.clientName]}>
                    {test.clientName}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, styles.testName]}>
                    {test.testName}
                  </Text>
                  <Chip
                    mode="outlined"
                    compact
                    style={styles.categoryChip}
                    textStyle={styles.categoryChipText}
                  >
                    {test.category}
                  </Chip>
                </View>
              </View>

              <View style={styles.testCardRight}>
                <View style={styles.resultContainer}>
                  <Text style={[TEXT_STYLES.h3, styles.resultText]}>
                    {test.result}
                  </Text>
                  <Text style={[
                    TEXT_STYLES.small,
                    { color: getImprovementColor(test.improvement) }
                  ]}>
                    {test.improvement}
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(test.status) }
                  ]} />
                  <Text style={[TEXT_STYLES.small, styles.dateText]}>
                    {test.date}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        </Animated.View>
      ))}
    </View>
  );

  const renderUpcomingTests = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
          Upcoming Tests 📅
        </Text>
        <IconButton
          icon="add"
          size={24}
          iconColor={COLORS.primary}
          onPress={handleScheduleTest}
        />
      </View>

      {upcomingTests.map((test, index) => (
        <Animated.View
          key={test.id}
          style={[
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <Surface style={styles.upcomingCard}>
            <View style={styles.upcomingContent}>
              <Avatar.Text
                size={40}
                label={test.avatar}
                style={{ backgroundColor: COLORS.secondary }}
              />
              <View style={styles.upcomingInfo}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                  {test.clientName}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {test.testName}
                </Text>
                <Text style={[TEXT_STYLES.small, { color: COLORS.primary }]}>
                  {test.scheduledDate} at {test.time}
                </Text>
              </View>
              <IconButton
                icon="notifications"
                size={20}
                iconColor={COLORS.warning}
                onPress={() => handleTestDetails(test.id)}
              />
            </View>
          </Surface>
        </Animated.View>
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
        Quick Actions ⚡
      </Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={handleCreateTest}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.quickActionGradient}
          >
            <Icon name="add-circle" size={32} color="#fff" />
            <Text style={styles.quickActionText}>Create Test</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Analytics')}
        >
          <LinearGradient
            colors={[COLORS.success, '#66bb6a']}
            style={styles.quickActionGradient}
          >
            <Icon name="analytics" size={32} color="#fff" />
            <Text style={styles.quickActionText}>Analytics</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={handleScheduleTest}
        >
          <LinearGradient
            colors={[COLORS.warning, '#ffb74d']}
            style={styles.quickActionGradient}
          >
            <Icon name="schedule" size={32} color="#fff" />
            <Text style={styles.quickActionText}>Schedule</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => handleTestDetails('templates')}
        >
          <LinearGradient
            colors={['#e91e63', '#f06292']}
            style={styles.quickActionGradient}
          >
            <Icon name="library-books" size={32} color="#fff" />
            <Text style={styles.quickActionText}>Templates</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h2, { color: '#fff' }]}>
            Performance Tests
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9 }]}>
            Track and analyze client performance
          </Text>
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
          <Searchbar
            placeholder="Search tests, clients..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />

          {renderStatsCard()}
          {renderTestCategories()}
          {renderQuickActions()}
          {renderRecentTests()}
          {renderUpcomingTests()}

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleCreateTest}
        color="#fff"
        customSize={56}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.lg,
  },
  searchbar: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statsGradient: {
    borderRadius: 12,
    padding: SPACING.lg,
  },
  statsContent: {
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
  },
  categoryCard: {
    marginRight: SPACING.md,
  },
  categoryTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  testCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testCardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  testCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  testInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  clientName: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  testName: {
    marginBottom: SPACING.xs,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  categoryChipText: {
    fontSize: 10,
  },
  testCardRight: {
    alignItems: 'flex-end',
  },
  resultContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.xs,
  },
  resultText: {
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  dateText: {
    opacity: 0.7,
  },
  upcomingCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 1,
  },
  upcomingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});

export default PerformanceTests;