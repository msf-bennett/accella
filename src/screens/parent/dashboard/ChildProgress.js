import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Card, Button, Chip, Avatar, Divider, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { COLORS } from '../../../styles/colors';

const { width: screenWidth } = Dimensions.get('window');

const ChildProgress = ({ route, navigation }) => {
  const { childId, childName } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [childData, setChildData] = useState(null);

  useEffect(() => {
    loadChildProgress();
    navigation.setOptions({ title: `${childName}'s Progress` });
  }, [childId, childName]);

  const loadChildProgress = async () => {
    // Replace with actual API call
    const sampleData = {
      id: childId,
      name: childName,
      age: 12,
      sport: 'Football',
      level: 'Intermediate',
      coach: 'Coach Martinez',
      academy: 'Elite Sports Academy',
      startDate: '2025-06-01',
      currentProgram: {
        name: '12-Week Youth Football Development',
        description: 'Comprehensive skill development program focusing on technical abilities, tactical awareness, and physical conditioning.',
        duration: '12 weeks',
        sessionsPerWeek: 3,
        totalSessions: 36,
        completedSessions: 28,
        nextSession: '2025-08-13T16:00:00',
      },
      performance: {
        overall: 85, // percentage
        technical: 88,
        physical: 82,
        tactical: 87,
        mental: 80,
        attendance: 93,
      },
      recentTests: [
        { date: '2025-08-01', type: 'Sprint Speed', value: '12.5 seconds', improvement: '+5%' },
        { date: '2025-07-25', type: 'Ball Control', value: '92%', improvement: '+8%' },
        { date: '2025-07-18', type: 'Passing Accuracy', value: '78%', improvement: '+12%' },
        { date: '2025-07-11', type: 'Endurance', value: '18 min', improvement: '+15%' },
      ],
      weeklyProgress: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
        datasets: [{
          data: [65, 68, 72, 75, 78, 82, 85, 88],
          strokeWidth: 3,
        }],
      },
      skillProgress: {
        labels: ['Technical', 'Physical', 'Tactical', 'Mental'],
        datasets: [{
          data: [88, 82, 87, 80],
        }],
      },
      recentFeedback: [
        {
          date: '2025-08-10',
          coach: 'Coach Martinez',
          session: 'Technical Skills Training',
          feedback: 'Excellent improvement in ball control and first touch. Alex is showing great dedication and focus during training sessions.',
          rating: 4.5,
        },
        {
          date: '2025-08-08',
          coach: 'Coach Martinez',
          session: 'Match Simulation',
          feedback: 'Good tactical awareness during game situations. Needs to work on communication with teammates.',
          rating: 4.0,
        },
        {
          date: '2025-08-05',
          coach: 'Coach Martinez',
          session: 'Physical Conditioning',
          feedback: 'Strong improvement in endurance and speed. Keep up the excellent work!',
          rating: 4.5,
        },
      ],
      upcomingSessions: [
        { date: '2025-08-13', time: '16:00', type: 'Technical Training', focus: 'Passing & Control' },
        { date: '2025-08-15', time: '16:00', type: 'Match Play', focus: 'Game Application' },
        { date: '2025-08-17', time: '09:00', type: 'Physical Training', focus: 'Speed & Agility' },
      ],
      goals: [
        { title: 'Improve Passing Accuracy', target: '85%', current: '78%', progress: 0.78 },
        { title: 'Increase Sprint Speed', target: '11.8 sec', current: '12.5 sec', progress: 0.65 },
        { title: 'Perfect Attendance', target: '100%', current: '93%', progress: 0.93 },
      ],
    };
    setChildData(sampleData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildProgress();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getImprovementColor = (improvement) => {
    if (improvement.includes('+')) return COLORS.success;
    if (improvement.includes('-')) return COLORS.error;
    return COLORS.textSecondary;
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={16} color="#FFD700" />);
    }
    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half" size={16} color="#FFD700" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Icon key={`empty-${i}`} name="star-border" size={16} color="#DDD" />);
    }
    return <View style={styles.starRating}>{stars}</View>;
  };

  const OverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Program Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Current Program</Text>
          <Text style={styles.programName}>{childData.currentProgram.name}</Text>
          <Text style={styles.programDescription}>{childData.currentProgram.description}</Text>
          
          <View style={styles.programStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{childData.currentProgram.completedSessions}</Text>
              <Text style={styles.statLabel}>Sessions Done</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{childData.currentProgram.totalSessions - childData.currentProgram.completedSessions}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{childData.performance.attendance}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
          </View>

          <ProgressBar 
            progress={childData.currentProgram.completedSessions / childData.currentProgram.totalSessions} 
            color={COLORS.primary}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {Math.round((childData.currentProgram.completedSessions / childData.currentProgram.totalSessions) * 100)}% Complete
          </Text>
        </Card.Content>
      </Card>

      {/* Performance Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Overall Performance</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>{childData.performance.technical}%</Text>
              <Text style={styles.performanceLabel}>Technical</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>{childData.performance.physical}%</Text>
              <Text style={styles.performanceLabel}>Physical</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>{childData.performance.tactical}%</Text>
              <Text style={styles.performanceLabel}>Tactical</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>{childData.performance.mental}%</Text>
              <Text style={styles.performanceLabel}>Mental</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Goals Progress */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Training Goals</Text>
          {childData.goals.map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalProgress}>{goal.current} / {goal.target}</Text>
              </View>
              <ProgressBar 
                progress={goal.progress} 
                color={COLORS.primary}
                style={styles.goalProgressBar}
              />
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const ProgressTab = () => (
    <View style={styles.tabContent}>
      {/* Weekly Progress Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Weekly Progress Trend</Text>
          <LineChart
            data={childData.weeklyProgress}
            width={screenWidth - 60}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: COLORS.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Skills Progress */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Skills Assessment</Text>
          <BarChart
            data={childData.skillProgress}
            width={screenWidth - 60}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Recent Test Results */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Recent Performance Tests</Text>
          {childData.recentTests.map((test, index) => (
            <View key={index} style={styles.testItem}>
              <View style={styles.testInfo}>
                <Text style={styles.testType}>{test.type}</Text>
                <Text style={styles.testDate}>{formatDate(test.date)}</Text>
              </View>
              <View style={styles.testResults}>
                <Text style={styles.testValue}>{test.value}</Text>
                <Text style={[styles.testImprovement, { color: getImprovementColor(test.improvement) }]}>
                  {test.improvement}
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const FeedbackTab = () => (
    <View style={styles.tabContent}>
      {childData.recentFeedback.map((feedback, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <View style={styles.feedbackHeader}>
              <View>
                <Text style={styles.feedbackSession}>{feedback.session}</Text>
                <Text style={styles.feedbackDate}>{formatDate(feedback.date)} • {feedback.coach}</Text>
              </View>
              {renderStarRating(feedback.rating)}
            </View>
            <Text style={styles.feedbackText}>{feedback.feedback}</Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  if (!childData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.childHeaderInfo}>
          <Avatar.Text 
            size={50} 
            label={childData?.name?.split(' ').map(n => n[0]).join('') || 'NN'}
            backgroundColor={COLORS.primary}
            color="#fff"
          />
          <View style={styles.childHeaderDetails}>
            <Text style={styles.headerName}>{childData?.name || 'Unknown Child'}</Text>
            <Text style={styles.headerInfo}>
              Age {childData?.age || '0'} • {childData?.sport || 'No sport'} • {childData?.level || 'Beginner'}
            </Text>
            <Text style={styles.headerCoach}>
              {childData?.coach || 'No coach'} • {childData?.academy || 'No academy'}
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'progress', label: 'Progress' },
          { key: 'feedback', label: 'Feedback' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'progress' && <ProgressTab />}
        {activeTab === 'feedback' && <FeedbackTab />}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Schedule', { childId, childName })}
          style={styles.actionButton}
          icon="calendar-today"
        >
          View Schedule
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CoachChat', { childId, childName })}
          style={styles.actionButton}
          buttonColor={COLORS.primary}
          icon="chat"
        >
          Message Coach
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  childHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childHeaderDetails: {
    marginLeft: 15,
    flex: 1,
  },
  headerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  headerCoach: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  programDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  programStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  performanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  goalProgress: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  goalProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  testInfo: {
    flex: 1,
  },
  testType: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  testDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  testResults: {
    alignItems: 'flex-end',
  },
  testValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  testImprovement: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feedbackSession: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  feedbackDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  starRating: {
    flexDirection: 'row',
  },
  feedbackText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  quickActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default ChildProgress;