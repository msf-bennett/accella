import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { Text, Card, Chip, FAB, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';
import { SESSION_STATUS } from '../../utils/constants';

const AssignedSessions = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { assignments } = useSelector(state => state.training);

  const mockSessions = [
    {
      id: 1,
      title: 'Morning Cardio Workout',
      description: 'High intensity cardio session focusing on endurance',
      date: '2025-08-07',
      time: '07:00 AM',
      duration: 45,
      status: SESSION_STATUS.PENDING,
      coach: 'Coach Johnson',
      plan: '12-Week Football Program'
    },
    {
      id: 2,
      title: 'Strength Training - Upper Body',
      description: 'Focus on chest, shoulders, and arms',
      date: '2025-08-07',
      time: '05:00 PM',
      duration: 60,
      status: SESSION_STATUS.PENDING,
      coach: 'Coach Johnson',
      plan: '12-Week Football Program'
    },
    {
      id: 3,
      title: 'Speed & Agility Training',
      description: 'Cone drills and sprint intervals',
      date: '2025-08-06',
      time: '06:00 PM',
      duration: 50,
      status: SESSION_STATUS.COMPLETED,
      coach: 'Coach Johnson',
      plan: 'Speed Development'
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch latest sessions
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case SESSION_STATUS.COMPLETED:
        return COLORS.success;
      case SESSION_STATUS.PENDING:
        return COLORS.primary;
      case SESSION_STATUS.MISSED:
        return COLORS.error;
      case SESSION_STATUS.CANCELLED:
        return COLORS.textSecondary;
      default:
        return COLORS.primary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case SESSION_STATUS.COMPLETED:
        return 'check-circle';
      case SESSION_STATUS.PENDING:
        return 'schedule';
      case SESSION_STATUS.MISSED:
        return 'cancel';
      case SESSION_STATUS.CANCELLED:
        return 'block';
      default:
        return 'schedule';
    }
  };

  const filteredSessions = mockSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || session.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderSession = ({ item }) => (
    <Card 
      style={styles.sessionCard}
      onPress={() => navigation.navigate('SessionDetails', { session: item })}>
      <Card.Content>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>{item.title}</Text>
          <Chip 
            icon={() => <Icon name={getStatusIcon(item.status)} size={16} color="white" />}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.chipText}>
            {item.status.toUpperCase()}
          </Chip>
        </View>
        
        <Text style={styles.sessionDescription}>{item.description}</Text>
        
        <View style={styles.sessionDetails}>
          <View style={styles.detailItem}>
            <Icon name="today" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="timer" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.duration} min</Text>
          </View>
        </View>
        
        <View style={styles.sessionFooter}>
          <Text style={styles.coachText}>Coach: {item.coach}</Text>
          <Text style={styles.planText}>{item.plan}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: SESSION_STATUS.PENDING, label: 'Pending' },
    { key: SESSION_STATUS.COMPLETED, label: 'Completed' },
    { key: SESSION_STATUS.MISSED, label: 'Missed' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search sessions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.filterContainer}>
        {filterButtons.map((filter) => (
          <Chip
            key={filter.key}
            selected={filterStatus === filter.key}
            onPress={() => setFilterStatus(filter.key)}
            style={[
              styles.filterChip,
              filterStatus === filter.key && styles.selectedFilterChip
            ]}>
            {filter.label}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filteredSessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  searchBar: {
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  listContainer: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  sessionCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  sessionTitle: {
    ...TEXT_STYLES.h3,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusChip: {
    height: 24,
  },
  chipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sessionDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  sessionFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  coachText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  planText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

export default AssignedSessions;