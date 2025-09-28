import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card, Button, Chip, Avatar, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';

const ChildrenOverview = ({ navigation }) => {
  const [children, setChildren] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  // Sample data - replace with actual data from your backend/state management
  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    // Replace with actual API call
    const sampleChildren = [
      {
        id: 1,
        name: 'Alex Johnson',
        age: 12,
        sport: 'Football',
        avatar: null,
        currentProgram: '12-Week Youth Football Development',
        coach: 'Coach Martinez',
        academy: 'Elite Sports Academy',
        nextSession: '2025-08-13T16:00:00',
        completedSessions: 8,
        totalSessions: 36,
        attendance: 92,
        lastFeedback: 'Excellent improvement in ball control',
        status: 'active',
        weeklySchedule: [
          { day: 'Monday', time: '16:00', type: 'Training' },
          { day: 'Wednesday', time: '16:00', type: 'Training' },
          { day: 'Saturday', time: '09:00', type: 'Match' },
        ]
      },
      {
        id: 2,
        name: 'Emma Johnson',
        age: 9,
        sport: 'Swimming',
        avatar: null,
        currentProgram: 'Beginner Swimming Program',
        coach: 'Coach Sarah',
        academy: 'Aquatic Center',
        nextSession: '2025-08-13T15:00:00',
        completedSessions: 12,
        totalSessions: 24,
        attendance: 100,
        lastFeedback: 'Great technique development',
        status: 'active',
        weeklySchedule: [
          { day: 'Tuesday', time: '15:00', type: 'Training' },
          { day: 'Thursday', time: '15:00', type: 'Training' },
        ]
      }
    ];
    setChildren(sampleChildren);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'inactive': return COLORS.warning;
      case 'completed': return COLORS.primary;
      default: return COLORS.text;
    }
  };

  const formatNextSession = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const handleChildPress = (child) => {
    navigation.navigate('ChildProgress', { childId: child.id, childName: child.name });
  };

  const handleSchedulePress = (child) => {
    navigation.navigate('Schedule', { childId: child.id, childName: child.name });
  };

  const handleAddChild = () => {
    Alert.alert(
      'Add Child',
      'This feature will allow you to register a new child for training programs.',
      [{ text: 'OK' }]
    );
  };

  const ChildCard = ({ child }) => (
    <Card style={styles.childCard}>
      <TouchableOpacity onPress={() => handleChildPress(child)}>
        <View style={styles.cardHeader}>
          <View style={styles.childInfo}>
            <Avatar.Text 
              size={50} 
              label={child?.name ? 
                child.name.split(' ').map(n => n[0]).join('') : 
                'NN'
              }
              backgroundColor={COLORS.primary}
              color="#fff"
            />
            <View style={styles.childDetails}>
              <Text style={styles.childName}>{child?.name || 'Unknown Child'}</Text>
              <Text style={styles.childAge}>Age: {child?.age || '0'}</Text>
              <Chip 
                mode="outlined" 
                style={[styles.sportChip, { borderColor: getStatusColor(child?.status || 'inactive') }]}
                textStyle={{ color: getStatusColor(child?.status || 'inactive') }}
              >
                {child?.sport || 'No sport'}
              </Chip>
            </View>
          </View>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(child?.status || 'inactive') }]} />
            <Text style={styles.statusText}>{child?.status?.toUpperCase() || 'INACTIVE'}</Text>
          </View>
        </View>
      </TouchableOpacity>


      <View style={styles.cardContent}>
        <View style={styles.programInfo}>
          <Text style={styles.programTitle}>{child.currentProgram}</Text>
          <Text style={styles.coachInfo}>Coach: {child.coach} • {child.academy}</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progress:</Text>
            <Text style={styles.progressText}>
              {child.completedSessions}/{child.totalSessions} sessions
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(child.completedSessions / child.totalSessions) * 100}%` }
              ]} 
            />
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>Attendance: {child.attendance}%</Text>
          </View>
        </View>

        <View style={styles.nextSessionSection}>
          <Icon name="schedule" size={16} color={COLORS.primary} />
          <Text style={styles.nextSessionText}>
            Next: {formatNextSession(child.nextSession)}
          </Text>
        </View>

        {child.lastFeedback && (
          <View style={styles.feedbackSection}>
            <Icon name="feedback" size={16} color={COLORS.success} />
            <Text style={styles.feedbackText} numberOfLines={2}>
              Latest feedback: {child.lastFeedback}
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => handleSchedulePress(child)}
            style={styles.actionButton}
            icon="calendar-today"
          >
            Schedule
          </Button>
          <Button
            mode="contained"
            onPress={() => handleChildPress(child)}
            style={styles.actionButton}
            buttonColor={COLORS.primary}
          >
            View Progress
          </Button>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Children</Text>
          <Text style={styles.subtitle}>
            Manage your children's training programs and track their progress
          </Text>
        </View>

        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="child-care" size={80} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>No Children Added</Text>
            <Text style={styles.emptyText}>
              Add your children to start tracking their training progress
            </Text>
            <Button
              mode="contained"
              onPress={handleAddChild}
              style={styles.addButton}
              buttonColor={COLORS.primary}
            >
              Add First Child
            </Button>
          </View>
        ) : (
          <View style={styles.childrenList}>
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </View>
        )}
      </ScrollView>

      {children.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('RegisterChild')}
          color="#fff"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  childrenList: {
    padding: 16,
  },
  childCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 0,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  childDetails: {
    marginLeft: 12,
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  childAge: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  sportChip: {
    alignSelf: 'flex-start',
  },
  statusIndicator: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  programInfo: {
    marginBottom: 16,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  coachInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  statsRow: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  nextSessionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
  },
  nextSessionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  feedbackSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f0f9f0',
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: COLORS.success,
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addButton: {
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default ChildrenOverview;