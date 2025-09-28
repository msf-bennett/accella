import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const AttendanceReports = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players } = useSelector(state => state.coach);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalSessions: 0,
    averageAttendance: 0,
    totalPlayers: 0,
    perfectAttendance: 0,
  });

  // Mock data - replace with actual API calls
  const mockAttendanceData = [
    {
      id: '1',
      playerName: 'John Smith',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      totalSessions: 24,
      attended: 22,
      percentage: 92,
      streak: 5,
      lastMissed: '2 weeks ago',
      team: 'Varsity',
    },
    {
      id: '2',
      playerName: 'Emily Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c76a?w=150&h=150&fit=crop&crop=face',
      totalSessions: 24,
      attended: 24,
      percentage: 100,
      streak: 12,
      lastMissed: 'Never',
      team: 'Varsity',
    },
    {
      id: '3',
      playerName: 'Mike Davis',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      totalSessions: 24,
      attended: 18,
      percentage: 75,
      streak: 2,
      lastMissed: '1 week ago',
      team: 'JV',
    },
    {
      id: '4',
      playerName: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      totalSessions: 24,
      attended: 20,
      percentage: 83,
      streak: 3,
      lastMissed: '3 days ago',
      team: 'Varsity',
    },
  ];

  const periods = [
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Season', value: 'season' },
    { label: 'All Time', value: 'all' },
  ];

  const teams = [
    { label: 'All Teams', value: 'all' },
    { label: 'Varsity', value: 'Varsity' },
    { label: 'JV', value: 'JV' },
    { label: 'Freshmen', value: 'Freshmen' },
  ];

  useEffect(() => {
    loadAttendanceData();
  }, [selectedPeriod, selectedTeam]);

  const loadAttendanceData = useCallback(() => {
    // Simulate API call
    setAttendanceData(mockAttendanceData);
    setSummaryStats({
      totalSessions: 24,
      averageAttendance: 87.5,
      totalPlayers: mockAttendanceData.length,
      perfectAttendance: mockAttendanceData.filter(p => p.percentage === 100).length,
    });
  }, [selectedPeriod, selectedTeam]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAttendanceData();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadAttendanceData]);

  const filteredData = attendanceData.filter(player => {
    const matchesSearch = player.playerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || player.team === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return COLORS.success;
    if (percentage >= 70) return '#ff9500';
    return COLORS.error;
  };

  const getAttendanceIcon = (percentage) => {
    if (percentage >= 90) return 'star';
    if (percentage >= 70) return 'thumb-up';
    return 'warning';
  };

  const exportReports = () => {
    Alert.alert(
      'Export Reports',
      'Choose export format',
      [
        { text: 'PDF', onPress: () => Alert.alert('Feature Coming Soon', 'PDF export will be available in the next update! 📊') },
        { text: 'Excel', onPress: () => Alert.alert('Feature Coming Soon', 'Excel export will be available in the next update! 📈') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const sendReminder = (playerId) => {
    Alert.alert(
      'Send Reminder',
      'Send attendance reminder to player?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => Alert.alert('Feature Coming Soon', 'Automated reminders will be available in the next update! 📲') 
        },
      ]
    );
  };

  const renderSummaryCard = () => (
    <Card style={styles.summaryCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.summaryGradient}
      >
        <Text style={styles.summaryTitle}>📊 Attendance Overview</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summaryStats.totalSessions}</Text>
            <Text style={styles.summaryLabel}>Total Sessions</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summaryStats.averageAttendance}%</Text>
            <Text style={styles.summaryLabel}>Avg Attendance</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summaryStats.totalPlayers}</Text>
            <Text style={styles.summaryLabel}>Total Players</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summaryStats.perfectAttendance}</Text>
            <Text style={styles.summaryLabel}>Perfect Record</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.sectionTitle}>📅 Time Period</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {periods.map((period) => (
          <Chip
            key={period.value}
            mode={selectedPeriod === period.value ? 'flat' : 'outlined'}
            selected={selectedPeriod === period.value}
            onPress={() => setSelectedPeriod(period.value)}
            style={[
              styles.filterChip,
              selectedPeriod === period.value && styles.selectedChip
            ]}
            textStyle={selectedPeriod === period.value && styles.selectedChipText}
          >
            {period.label}
          </Chip>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>👥 Team Filter</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {teams.map((team) => (
          <Chip
            key={team.value}
            mode={selectedTeam === team.value ? 'flat' : 'outlined'}
            selected={selectedTeam === team.value}
            onPress={() => setSelectedTeam(team.value)}
            style={[
              styles.filterChip,
              selectedTeam === team.value && styles.selectedChip
            ]}
            textStyle={selectedTeam === team.value && styles.selectedChipText}
          >
            {team.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderPlayerItem = ({ item }) => (
    <Card style={styles.playerCard}>
      <View style={styles.playerHeader}>
        <Avatar.Image 
          size={50} 
          source={{ uri: item.avatar }}
          style={styles.playerAvatar}
        />
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.playerName}</Text>
          <Text style={styles.playerTeam}>{item.team} Team</Text>
        </View>
        <View style={styles.playerStats}>
          <Icon 
            name={getAttendanceIcon(item.percentage)} 
            size={24} 
            color={getAttendanceColor(item.percentage)} 
          />
          <Text style={[styles.percentage, { color: getAttendanceColor(item.percentage) }]}>
            {item.percentage}%
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar 
          progress={item.percentage / 100} 
          color={getAttendanceColor(item.percentage)}
          style={styles.progressBar}
        />
        <Text style={styles.attendanceText}>
          {item.attended}/{item.totalSessions} sessions attended
        </Text>
      </View>

      <View style={styles.playerDetails}>
        <View style={styles.detailItem}>
          <Icon name="local-fire-department" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>🔥 {item.streak} session streak</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="schedule" size={16} color={COLORS.secondary} />
          <Text style={styles.detailText}>Last missed: {item.lastMissed}</Text>
        </View>
      </View>

      <View style={styles.playerActions}>
        <Button
          mode="outlined"
          onPress={() => sendReminder(item.id)}
          style={styles.actionButton}
          icon="notifications"
        >
          Remind
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('PlayerDetails', { playerId: item.id })}
          style={styles.actionButton}
          buttonColor={COLORS.primary}
        >
          Details
        </Button>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <Icon name="people-outline" size={80} color={COLORS.secondary} />
      <Text style={styles.emptyTitle}>No Players Found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your filters or search criteria
      </Text>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Attendance Reports</Text>
          <IconButton
            icon="file-export"
            iconColor="white"
            onPress={exportReports}
          />
        </View>
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
      >
        {renderSummaryCard()}
        {renderFilters()}

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search players..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        <View style={styles.playersSection}>
          <Text style={styles.sectionTitle}>
            👥 Player Attendance ({filteredData.length})
          </Text>
          
          {filteredData.length > 0 ? (
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.id}
              renderItem={renderPlayerItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: SPACING.lg,
  },
  summaryTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    ...TEXT_STYLES.heading,
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  summaryLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  chipScroll: {
    marginBottom: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectedChipText: {
    color: 'white',
  },
  searchContainer: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  playersSection: {
    marginBottom: SPACING.xl,
  },
  playerCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  playerAvatar: {
    marginRight: SPACING.md,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
  },
  playerTeam: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  playerStats: {
    alignItems: 'center',
  },
  percentage: {
    ...TEXT_STYLES.subheading,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  attendanceText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
    color: COLORS.secondary,
  },
  playerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.secondary,
  },
  playerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 1,
  },
  emptyTitle: {
    ...TEXT_STYLES.heading,
    marginTop: SPACING.md,
    color: COLORS.secondary,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.secondary,
    marginTop: SPACING.sm,
  },
});

export default AttendanceReports;