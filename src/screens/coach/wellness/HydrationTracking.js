import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#f5f5f5',
  white: '#ffffff',
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
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
};

const { width, height } = Dimensions.get('window');

const HydrationTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, athletes, hydrationData } = useSelector(state => ({
    user: state.auth.user,
    athletes: state.athletes.list,
    hydrationData: state.wellness.hydration,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Mock data for demonstration
  const mockHydrationData = [
    {
      id: '1',
      athleteId: 'athlete1',
      athleteName: 'John Doe',
      avatar: '👨‍🦰',
      currentIntake: 1.8,
      dailyGoal: 3.0,
      percentage: 60,
      status: 'moderate',
      lastUpdate: '2 hours ago',
      streak: 5,
      weeklyAverage: 2.4,
      alerts: ['Low intake warning'],
      recommendations: ['Increase water intake during training', 'Consider electrolyte supplements'],
    },
    {
      id: '2',
      athleteId: 'athlete2',
      athleteName: 'Jane Smith',
      avatar: '👩‍🦱',
      currentIntake: 2.7,
      dailyGoal: 2.8,
      percentage: 96,
      status: 'good',
      lastUpdate: '30 min ago',
      streak: 12,
      weeklyAverage: 2.6,
      alerts: [],
      recommendations: ['Maintain current intake'],
    },
    {
      id: '3',
      athleteId: 'athlete3',
      athleteName: 'Mike Johnson',
      avatar: '👨‍🦲',
      currentIntake: 1.2,
      dailyGoal: 3.2,
      percentage: 38,
      status: 'critical',
      lastUpdate: '4 hours ago',
      streak: 2,
      weeklyAverage: 2.1,
      alerts: ['Critical dehydration risk', 'Missed intake reminders'],
      recommendations: ['Immediate hydration needed', 'Schedule hydration check-in', 'Consider IV therapy consultation'],
    },
    {
      id: '4',
      athleteId: 'athlete4',
      athleteName: 'Sarah Wilson',
      avatar: '👩‍🦳',
      currentIntake: 3.1,
      dailyGoal: 2.9,
      percentage: 107,
      status: 'excellent',
      lastUpdate: '15 min ago',
      streak: 18,
      weeklyAverage: 2.9,
      alerts: [],
      recommendations: ['Optimal hydration maintained', 'Great job!'],
    },
  ];

  const filteredAthletes = mockHydrationData.filter(athlete =>
    athlete.athleteName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return COLORS.success;
      case 'good': return '#8BC34A';
      case 'moderate': return COLORS.warning;
      case 'critical': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return 'water-drop';
      case 'good': return 'water-drop';
      case 'moderate': return 'warning';
      case 'critical': return 'error';
      default: return 'help';
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(100);
    }, 1500);
  }, []);

  const handleAthletePress = (athlete) => {
    setSelectedAthlete(athlete);
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  const handleAlertPress = (alert, athlete) => {
    setSelectedAlert({ alert, athlete });
    setAlertModalVisible(true);
    Vibration.vibrate(100);
  };

  const sendHydrationReminder = (athleteId) => {
    Alert.alert(
      'Reminder Sent! 💧',
      'Hydration reminder has been sent to the athlete.',
      [{ text: 'OK', onPress: () => Vibration.vibrate(100) }]
    );
  };

  const generateReport = () => {
    Alert.alert(
      'Feature Coming Soon! 📊',
      'Hydration analytics and reporting features are under development.',
      [{ text: 'Got it!', onPress: () => Vibration.vibrate(100) }]
    );
  };

  const renderAthleteCard = ({ item: athlete }) => (
    <Card style={styles.athleteCard} onPress={() => handleAthletePress(athlete)}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.athleteHeader}>
          <View style={styles.athleteInfo}>
            <Text style={styles.avatarText}>{athlete.avatar}</Text>
            <View style={styles.athleteDetails}>
              <Text style={[TEXT_STYLES.body, styles.athleteName]}>
                {athlete.athleteName}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.lastUpdate]}>
                Last update: {athlete.lastUpdate}
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <Icon 
              name={getStatusIcon(athlete.status)} 
              size={24} 
              color={getStatusColor(athlete.status)} 
            />
            <Chip
              mode="outlined"
              style={[styles.statusChip, { borderColor: getStatusColor(athlete.status) }]}
              textStyle={{ color: getStatusColor(athlete.status), fontSize: 12 }}
            >
              {athlete.status.toUpperCase()}
            </Chip>
          </View>
        </View>

        <View style={styles.hydrationProgress}>
          <View style={styles.progressHeader}>
            <Text style={[TEXT_STYLES.caption, styles.progressText]}>
              {athlete.currentIntake}L / {athlete.dailyGoal}L ({athlete.percentage}%)
            </Text>
            <Text style={[TEXT_STYLES.small, styles.streakText]}>
              🔥 {athlete.streak} day streak
            </Text>
          </View>
          <ProgressBar
            progress={athlete.percentage / 100}
            color={getStatusColor(athlete.status)}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.quickActions}>
          <Button
            mode="outlined"
            compact
            icon="notifications"
            onPress={() => sendHydrationReminder(athlete.athleteId)}
            style={styles.actionButton}
          >
            Remind
          </Button>
          {athlete.alerts.length > 0 && (
            <Button
              mode="contained"
              compact
              icon="warning"
              buttonColor={COLORS.warning}
              onPress={() => handleAlertPress(athlete.alerts[0], athlete)}
              style={styles.actionButton}
            >
              Alert ({athlete.alerts.length})
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedAthlete && (
          <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
            <Surface style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.avatarTextLarge}>{selectedAthlete.avatar}</Text>
                <View style={styles.modalHeaderText}>
                  <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
                    {selectedAthlete.athleteName}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, styles.modalSubtitle]}>
                    Hydration Details
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                />
              </View>

              <ScrollView style={styles.modalScrollContent}>
                <View style={styles.detailSection}>
                  <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Today's Progress</Text>
                  <View style={styles.progressDetail}>
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.progressCircle}
                    >
                      <Text style={styles.progressPercentage}>{selectedAthlete.percentage}%</Text>
                    </LinearGradient>
                    <View style={styles.progressStats}>
                      <Text style={[TEXT_STYLES.body, styles.currentIntake]}>
                        {selectedAthlete.currentIntake}L consumed
                      </Text>
                      <Text style={[TEXT_STYLES.caption, styles.goalText]}>
                        Goal: {selectedAthlete.dailyGoal}L
                      </Text>
                      <Text style={[TEXT_STYLES.caption, styles.remainingText]}>
                        Remaining: {(selectedAthlete.dailyGoal - selectedAthlete.currentIntake).toFixed(1)}L
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Weekly Average</Text>
                  <Text style={[TEXT_STYLES.body, styles.weeklyAverage]}>
                    {selectedAthlete.weeklyAverage}L per day
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>AI Recommendations</Text>
                  {selectedAthlete.recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Icon name="lightbulb" size={20} color={COLORS.warning} />
                      <Text style={[TEXT_STYLES.body, styles.recommendationText]}>
                        {rec}
                      </Text>
                    </View>
                  ))}
                </View>

                {selectedAthlete.alerts.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Active Alerts</Text>
                    {selectedAthlete.alerts.map((alert, index) => (
                      <View key={index} style={styles.alertItem}>
                        <Icon name="warning" size={20} color={COLORS.error} />
                        <Text style={[TEXT_STYLES.body, styles.alertText]}>
                          {alert}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  icon="notifications"
                  onPress={() => {
                    sendHydrationReminder(selectedAthlete.athleteId);
                    setModalVisible(false);
                  }}
                  style={styles.modalActionButton}
                >
                  Send Reminder
                </Button>
                <Button
                  mode="contained"
                  icon="message"
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('Chat', { athleteId: selectedAthlete.athleteId });
                  }}
                  style={styles.modalActionButton}
                >
                  Message
                </Button>
              </View>
            </Surface>
          </BlurView>
        )}
      </Modal>
    </Portal>
  );

  const renderStatsOverview = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.statsGradient}
        >
          <Text style={[TEXT_STYLES.h3, styles.statsTitle]}>Team Hydration Overview 💧</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{mockHydrationData.length}</Text>
              <Text style={styles.statLabel}>Athletes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {mockHydrationData.filter(a => a.status === 'excellent' || a.status === 'good').length}
              </Text>
              <Text style={styles.statLabel}>Well Hydrated</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {mockHydrationData.filter(a => a.alerts.length > 0).length}
              </Text>
              <Text style={styles.statLabel}>Need Attention</Text>
            </View>
          </View>
        </LinearGradient>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>Hydration Tracking 💧</Text>
        <Text style={[TEXT_STYLES.caption, styles.headerSubtitle]}>
          Monitor your athletes' hydration levels
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStatsOverview()}

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search athletes..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        <View style={styles.periodSelector}>
          {['today', 'week', 'month'].map((period) => (
            <Chip
              key={period}
              selected={selectedPeriod === period}
              onPress={() => setSelectedPeriod(period)}
              style={[
                styles.periodChip,
                selectedPeriod === period && styles.selectedPeriodChip
              ]}
              textStyle={selectedPeriod === period ? styles.selectedPeriodText : null}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Chip>
          ))}
        </View>

        <View style={styles.athletesList}>
          {filteredAthletes.map((athlete) => renderAthleteCard({ item: athlete }))}
        </View>
      </ScrollView>

      <FAB
        icon="analytics"
        style={styles.fab}
        onPress={generateReport}
        color={COLORS.white}
      />

      {renderDetailModal()}
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: COLORS.white,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  statsCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsTitle: {
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  periodChip: {
    backgroundColor: COLORS.white,
  },
  selectedPeriodChip: {
    backgroundColor: COLORS.primary,
  },
  selectedPeriodText: {
    color: COLORS.white,
  },
  athletesList: {
    gap: SPACING.md,
  },
  athleteCard: {
    elevation: 3,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  cardContent: {
    padding: SPACING.md,
  },
  athleteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  athleteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarText: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  athleteDetails: {
    flex: 1,
  },
  athleteName: {
    color: COLORS.text,
    fontWeight: '600',
  },
  lastUpdate: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statusContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusChip: {
    height: 28,
  },
  hydrationProgress: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  streakText: {
    color: COLORS.warning,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarTextLarge: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    color: COLORS.text,
  },
  modalSubtitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  closeButton: {
    margin: 0,
  },
  modalScrollContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  detailSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  progressDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  progressPercentage: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressStats: {
    flex: 1,
  },
  currentIntake: {
    color: COLORS.text,
    fontWeight: '600',
  },
  goalText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  remainingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  weeklyAverage: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  recommendationText: {
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.text,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  alertText: {
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.error,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalActionButton: {
    flex: 1,
  },
});

export default HydrationTracking;