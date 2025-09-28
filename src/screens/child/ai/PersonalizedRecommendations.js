import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
  FlatList,
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
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const PersonalizedRecommendations = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('today');
  const [recommendations, setRecommendations] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // AI-powered recommendations for child athletes
  const aiRecommendations = {
    today: [
      {
        id: 1,
        type: 'training',
        priority: 'high',
        title: 'Focus on Ball Control Today! ⚽',
        description: 'Your coach noticed you\'re improving! Spend 15 minutes on juggling drills.',
        icon: 'sports-soccer',
        color: '#FF6B6B',
        action: 'Start Drill',
        estimatedTime: '15 min',
        points: 25,
        category: 'skill',
      },
      {
        id: 2,
        type: 'fitness',
        priority: 'medium',
        title: 'Speed & Agility Boost! 🏃‍♂️',
        description: 'Perfect weather for outdoor sprint work. Try the cone drill challenge!',
        icon: 'directions-run',
        color: '#4ECDC4',
        action: 'View Workout',
        estimatedTime: '20 min',
        points: 30,
        category: 'fitness',
      },
      {
        id: 3,
        type: 'recovery',
        priority: 'medium',
        title: 'Stretch Time Champion! 🧘‍♂️',
        description: 'You trained hard yesterday. Let\'s do some gentle stretches.',
        icon: 'self-improvement',
        color: '#96CEB4',
        action: 'Start Stretching',
        estimatedTime: '10 min',
        points: 15,
        category: 'wellness',
      },
      {
        id: 4,
        type: 'nutrition',
        priority: 'low',
        title: 'Pre-Training Fuel! 🍌',
        description: 'Training in 2 hours? Have a banana and some water now.',
        icon: 'restaurant',
        color: '#FFEAA7',
        action: 'Set Reminder',
        estimatedTime: '5 min',
        points: 10,
        category: 'nutrition',
      },
    ],
    weekly: [
      {
        id: 5,
        type: 'skill',
        title: 'Master Your Weak Foot! 🦵',
        description: 'This week, focus on left foot practice for 10 minutes each session.',
        icon: 'sports-soccer',
        color: '#A8E6CF',
        progress: 0.4,
        totalSessions: 7,
        completedSessions: 3,
      },
      {
        id: 6,
        type: 'fitness',
        title: 'Endurance Challenge! 💪',
        description: 'Build stamina with progressive running drills throughout the week.',
        icon: 'favorite',
        color: '#FFB6C1',
        progress: 0.2,
        totalSessions: 5,
        completedSessions: 1,
      },
      {
        id: 7,
        type: 'teamwork',
        title: 'Team Captain Skills! 👥',
        description: 'Practice communication and leadership during team exercises.',
        icon: 'group',
        color: '#DDA0DD',
        progress: 0.6,
        totalSessions: 3,
        completedSessions: 2,
      },
    ],
    growth: [
      {
        id: 8,
        category: 'Technical Skills',
        currentLevel: 'Intermediate',
        nextMilestone: 'Advanced Ball Control',
        progress: 0.75,
        recommendations: [
          'Practice juggling for 10 minutes daily',
          'Work on first touch with both feet',
          'Try advanced passing patterns',
        ],
        icon: 'sports-soccer',
        color: '#FF6B6B',
      },
      {
        id: 9,
        category: 'Physical Fitness',
        currentLevel: 'Developing',
        nextMilestone: 'Sprint Speed Improvement',
        progress: 0.45,
        recommendations: [
          'Focus on acceleration drills',
          'Strengthen leg muscles',
          'Improve reaction time',
        ],
        icon: 'fitness-center',
        color: '#4ECDC4',
      },
      {
        id: 10,
        category: 'Mental Game',
        currentLevel: 'Beginner',
        nextMilestone: 'Confidence Under Pressure',
        progress: 0.3,
        recommendations: [
          'Practice visualization techniques',
          'Learn breathing exercises',
          'Set small achievable goals',
        ],
        icon: 'psychology',
        color: '#96CEB4',
      },
    ],
  };

  const tabs = [
    { key: 'today', label: 'Today', icon: 'today' },
    { key: 'weekly', label: 'This Week', icon: 'date-range' },
    { key: 'growth', label: 'Growth Plan', icon: 'trending-up' },
  ];

  useEffect(() => {
    setRecommendations(aiRecommendations[selectedTab]);
    
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

    // Pulse animation for high priority items
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [selectedTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate AI recommendation update
    setTimeout(() => {
      Alert.alert("Updated! 🤖", "Your recommendations have been refreshed based on your latest progress!");
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleRecommendationAction = (recommendation) => {
    switch (recommendation.action) {
      case 'Start Drill':
        Alert.alert(
          "Let's Train! 🏆",
          `Starting ${recommendation.title}\n\nEstimated time: ${recommendation.estimatedTime}\nPoints to earn: ${recommendation.points}`,
          [
            { text: "Maybe Later", style: "cancel" },
            { text: "Let's Go!", onPress: () => navigation.navigate('DrillSession', { drill: recommendation }) }
          ]
        );
        break;
      case 'View Workout':
        navigation.navigate('WorkoutDetails', { workout: recommendation });
        break;
      case 'Start Stretching':
        navigation.navigate('StretchingGuide', { routine: recommendation });
        break;
      case 'Set Reminder':
        Alert.alert("Reminder Set! ⏰", "I'll remind you to have your pre-training snack in 2 hours.");
        break;
      default:
        Alert.alert("Coming Soon! 🚀", "This feature is being developed just for you!");
    }
  };

  const handleGetMoreRecommendations = () => {
    Alert.alert(
      "AI Coach Speaking! 🤖",
      "I'm analyzing your performance data to create more personalized recommendations. Check back in a few hours!",
      [
        { text: "Okay!", style: "default" },
        { text: "Tell me more", onPress: () => navigation.navigate('AICoachInfo') }
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Your AI Coach 🤖</Text>
            <Text style={styles.subtitle}>Personalized recommendations just for you!</Text>
          </View>
          <TouchableOpacity onPress={handleGetMoreRecommendations}>
            <Surface style={styles.aiButton}>
              <Icon name="auto-awesome" size={24} color={COLORS.primary} />
            </Surface>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setSelectedTab(tab.key)}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.activeTab
              ]}
            >
              <Icon 
                name={tab.icon} 
                size={18} 
                color={selectedTab === tab.key ? '#667eea' : 'rgba(255,255,255,0.7)'} 
              />
              <Text style={[
                styles.tabText,
                selectedTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );

  const renderTodayRecommendations = () => (
    <Animated.View 
      style={[
        styles.recommendationsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {aiRecommendations.today.map((item, index) => (
        <Animated.View
          key={item.id}
          style={[
            item.priority === 'high' && {
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <Card style={[
            styles.recommendationCard,
            item.priority === 'high' && styles.highPriorityCard
          ]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.recommendationHeader}>
                <Surface style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                  <Icon name={item.icon} size={24} color={item.color} />
                </Surface>
                <View style={styles.recommendationInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.recommendationTitle}>{item.title}</Text>
                    {item.priority === 'high' && (
                      <Chip 
                        mode="contained" 
                        style={styles.priorityChip}
                        textStyle={styles.priorityText}
                      >
                        Hot Tip! 🔥
                      </Chip>
                    )}
                  </View>
                  <Text style={styles.recommendationDescription}>
                    {item.description}
                  </Text>
                  <View style={styles.recommendationMeta}>
                    <Text style={styles.metaText}>
                      ⏱️ {item.estimatedTime}
                    </Text>
                    <Text style={styles.metaText}>
                      🏆 +{item.points} points
                    </Text>
                  </View>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => handleRecommendationAction(item)}
                style={[styles.actionButton, { backgroundColor: item.color }]}
                contentStyle={styles.buttonContent}
              >
                {item.action}
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>
      ))}
    </Animated.View>
  );

  const renderWeeklyGoals = () => (
    <View style={styles.weeklyContainer}>
      <Text style={styles.sectionTitle}>This Week's Focus 🎯</Text>
      {aiRecommendations.weekly.map((goal) => (
        <Card key={goal.id} style={styles.weeklyCard}>
          <Card.Content>
            <View style={styles.goalHeader}>
              <Surface style={[styles.iconContainer, { backgroundColor: goal.color + '20' }]}>
                <Icon name={goal.icon} size={24} color={goal.color} />
              </Surface>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
              </View>
            </View>
            
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressCount}>
                  {goal.completedSessions}/{goal.totalSessions} sessions
                </Text>
              </View>
              <ProgressBar
                progress={goal.progress}
                color={goal.color}
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderGrowthPlan = () => (
    <View style={styles.growthContainer}>
      <Text style={styles.sectionTitle}>Your Development Path 🌟</Text>
      {aiRecommendations.growth.map((area) => (
        <Card key={area.id} style={styles.growthCard}>
          <Card.Content>
            <View style={styles.growthHeader}>
              <Surface style={[styles.iconContainer, { backgroundColor: area.color + '20' }]}>
                <Icon name={area.icon} size={24} color={area.color} />
              </Surface>
              <View style={styles.growthInfo}>
                <Text style={styles.growthCategory}>{area.category}</Text>
                <Text style={styles.currentLevel}>Current: {area.currentLevel}</Text>
                <Text style={styles.nextMilestone}>Next: {area.nextMilestone}</Text>
              </View>
            </View>
            
            <ProgressBar
              progress={area.progress}
              color={area.color}
              style={styles.growthProgressBar}
            />
            
            <View style={styles.recommendationsList}>
              <Text style={styles.recommendationsTitle}>Focus Areas:</Text>
              {area.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Icon name="check-circle-outline" size={16} color={area.color} />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'today':
        return renderTodayRecommendations();
      case 'weekly':
        return renderWeeklyGoals();
      case 'growth':
        return renderGrowthPlan();
      default:
        return renderTodayRecommendations();
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
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
        {renderContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={onRefresh}
        color="white"
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  aiButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#667eea',
  },
  scrollView: {
    flex: 1,
  },
  recommendationsContainer: {
    padding: SPACING.lg,
  },
  recommendationCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
    borderRadius: 16,
  },
  highPriorityCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  cardContent: {
    padding: SPACING.lg,
  },
  recommendationHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  recommendationInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recommendationTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    flex: 1,
  },
  priorityChip: {
    height: 24,
    backgroundColor: '#FF6B6B',
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
  },
  recommendationDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  recommendationMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaText: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionButton: {
    marginTop: SPACING.sm,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    marginHorizontal: SPACING.lg,
    color: COLORS.text,
  },
  weeklyContainer: {
    paddingBottom: SPACING.xl,
  },
  weeklyCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 3,
    borderRadius: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  goalDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  progressSection: {
    marginTop: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  progressCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  growthContainer: {
    paddingBottom: SPACING.xl,
  },
  growthCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 3,
    borderRadius: 12,
  },
  growthHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  growthInfo: {
    flex: 1,
  },
  growthCategory: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  currentLevel: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  nextMilestone: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  growthProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.md,
  },
  recommendationsList: {
    marginTop: SPACING.sm,
  },
  recommendationsTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  recommendationText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 16,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: SPACING.xl * 2,
  },
});

export default PersonalizedRecommendations;