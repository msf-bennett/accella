import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AllActivities = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedChild, setSelectedChild] = useState('All');

  const filterOptions = ['All', 'Training', 'Match', 'Tournament', 'Assessment', 'Event'];
  const children = ['All', 'Alex Mwangi', 'Sarah Wanjiku'];

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, selectedFilter, selectedChild]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual API
      const mockActivities = [
        {
          id: '1',
          title: 'Football Training Session',
          type: 'Training',
          date: '2025-08-13',
          time: '16:00',
          duration: '90 minutes',
          location: 'Main Field',
          coach: 'John Kimani',
          child: 'Alex Mwangi',
          status: 'Scheduled',
          attendance: null,
          performance: null,
          description: 'Focus on ball control and passing techniques',
          icon: 'football-outline',
          color: '#34C759',
        },
        {
          id: '2',
          title: 'Swimming Practice',
          type: 'Training',
          date: '2025-08-14',
          time: '07:00',
          duration: '60 minutes',
          location: 'Aquatic Center',
          coach: 'Mary Ochieng',
          child: 'Sarah Wanjiku',
          status: 'Completed',
          attendance: 'Present',
          performance: 8.5,
          description: 'Freestyle technique improvement',
          icon: 'water-outline',
          color: '#007AFF',
        },
        {
          id: '3',
          title: 'Regional Championship',
          type: 'Tournament',
          date: '2025-08-20',
          time: '09:00',
          duration: '8 hours',
          location: 'Nairobi Sports Complex',
          coach: 'John Kimani',
          child: 'Alex Mwangi',
          status: 'Upcoming',
          attendance: null,
          performance: null,
          description: 'Annual regional football championship',
          icon: 'trophy-outline',
          color: '#FF9500',
        },
        {
          id: '4',
          title: 'Fitness Assessment',
          type: 'Assessment',
          date: '2025-08-12',
          time: '15:00',
          duration: '45 minutes',
          location: 'Gym',
          coach: 'Peter Mbugua',
          child: 'Alex Mwangi',
          status: 'Completed',
          attendance: 'Present',
          performance: 7.8,
          description: 'Monthly fitness evaluation and measurements',
          icon: 'fitness-outline',
          color: '#FF3B30',
        },
        {
          id: '5',
          title: 'Team Match vs Eagles FC',
          type: 'Match',
          date: '2025-08-16',
          time: '14:00',
          duration: '90 minutes',
          location: 'City Stadium',
          coach: 'John Kimani',
          child: 'Alex Mwangi',
          status: 'Scheduled',
          attendance: null,
          performance: null,
          description: 'League match against Eagles FC',
          icon: 'people-outline',
          color: '#8E44AD',
        },
        {
          id: '6',
          title: 'Swimming Technique Workshop',
          type: 'Event',
          date: '2025-08-18',
          time: '10:00',
          duration: '3 hours',
          location: 'Aquatic Center',
          coach: 'Mary Ochieng',
          child: 'Sarah Wanjiku',
          status: 'Scheduled',
          attendance: null,
          performance: null,
          description: 'Special workshop on advanced swimming techniques',
          icon: 'school-outline',
          color: '#17A2B8',
        },
      ];

      setActivities(mockActivities);
    } catch (error) {
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.coach.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(activity => activity.type === selectedFilter);
    }

    // Filter by child
    if (selectedChild !== 'All') {
      filtered = filtered.filter(activity => activity.child === selectedChild);
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB - dateA; // Most recent first
    });

    setFilteredActivities(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#34C759';
      case 'Scheduled': return '#007AFF';
      case 'Upcoming': return '#FF9500';
      case 'Cancelled': return '#FF3B30';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderActivityCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.activityCard}
      onPress={() => {
        if (item.type === 'Tournament' || item.type === 'Event') {
          navigation.navigate('EventDetails', { eventId: item.id });
        } else {
          navigation.navigate('SessionDetails', { sessionId: item.id });
        }
      }}
    >
      <View style={styles.activityHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityChild}>{item.child}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.activityDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatDate(item.date)} • {item.time} ({item.duration})
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.coach}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.activityDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {/* Performance indicators for completed activities */}
      {item.status === 'Completed' && (
        <View style={styles.performanceContainer}>
          <View style={styles.performanceItem}>
            <Ionicons 
              name={item.attendance === 'Present' ? 'checkmark-circle' : 'close-circle'} 
              size={16} 
              color={item.attendance === 'Present' ? '#34C759' : '#FF3B30'} 
            />
            <Text style={styles.performanceText}>
              {item.attendance === 'Present' ? 'Attended' : 'Absent'}
            </Text>
          </View>
          
          {item.performance && (
            <View style={styles.performanceItem}>
              <Ionicons name="star" size={16} color="#FF9500" />
              <Text style={styles.performanceText}>
                Score: {item.performance}/10
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.activityFooter}>
        <Text style={styles.activityType}>{item.type}</Text>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Activities Found</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery 
          ? 'Try adjusting your search terms or filters'
          : 'No activities scheduled yet. Check back later!'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Activities</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CalendarScreen')}
        >
          <Ionicons name="calendar-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities, coaches, locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Activity Type Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.selectedFilterChip
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.selectedFilterText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Child Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {children.map((child) => (
            <TouchableOpacity
              key={child}
              style={[
                styles.childFilterChip,
                selectedChild === child && styles.selectedChildFilterChip
              ]}
              onPress={() => setSelectedChild(child)}
            >
              <Text style={[
                styles.childFilterText,
                selectedChild === child && styles.selectedChildFilterText
              ]}>
                {child}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Activities Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activities.filter(a => a.status === 'Completed').length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activities.filter(a => a.status === 'Scheduled').length}</Text>
          <Text style={styles.statLabel}>Scheduled</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activities.filter(a => a.status === 'Upcoming').length}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {activities.filter(a => a.attendance === 'Present').length}
          </Text>
          <Text style={styles.statLabel}>Attended</Text>
        </View>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredActivities.length} {filteredActivities.length === 1 ? 'Activity' : 'Activities'}
        </Text>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {
            // Sort by date toggle
            const sorted = [...filteredActivities].reverse();
            setFilteredActivities(sorted);
          }}
        >
          <Ionicons name="swap-vertical-outline" size={16} color="#007AFF" />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Activities List */}
      <FlatList
        data={filteredActivities}
        renderItem={renderActivityCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
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
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#1a1a1a',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterScroll: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedFilterChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedFilterText: {
    color: 'white',
  },
  childFilterChip: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  selectedChildFilterChip: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  childFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  selectedChildFilterText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginTop: 12,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  activityChild: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 6,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default AllActivities;