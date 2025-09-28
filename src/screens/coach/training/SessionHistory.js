import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  StatusBar,
  TouchableOpacity,
  Vibration,
} from 'react-native';
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
  Text,
  Divider,
  Badge,
  Menu,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const SessionHistory = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, sessions, loading, error } = useSelector(state => ({
    user: state.auth.user,
    sessions: state.sessions.history,
    loading: state.sessions.loading,
    error: state.sessions.error,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [dateRange, setDateRange] = useState('all');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for session history
  const mockSessions = [
    {
      id: 1,
      title: 'Football Team Training',
      type: 'Team Training',
      date: '2024-12-15',
      time: '16:00',
      duration: 120,
      participants: 22,
      attendance: 20,
      sport: 'Football',
      location: 'Main Field',
      status: 'completed',
      rating: 4.5,
      notes: 'Great session focusing on passing accuracy and team coordination.',
      exercises: [
        { name: 'Warm-up', duration: 15, completed: true },
        { name: 'Passing Drills', duration: 30, completed: true },
        { name: 'Tactical Play', duration: 45, completed: true },
        { name: 'Cool Down', duration: 15, completed: true },
      ],
      performance: {
        energy: 85,
        focus: 90,
        participation: 88,
        improvement: 15,
      },
    },
    {
      id: 2,
      title: 'Individual Fitness Session',
      type: 'Personal Training',
      date: '2024-12-14',
      time: '09:00',
      duration: 60,
      participants: 1,
      attendance: 1,
      sport: 'Fitness',
      location: 'Gym',
      status: 'completed',
      rating: 4.8,
      notes: 'Excellent progress in strength training. Client showed great determination.',
      exercises: [
        { name: 'Strength Training', duration: 45, completed: true },
        { name: 'Cardio', duration: 15, completed: true },
      ],
      performance: {
        energy: 92,
        focus: 95,
        participation: 98,
        improvement: 25,
      },
    },
    {
      id: 3,
      title: 'Basketball Skills Workshop',
      type: 'Skills Training',
      date: '2024-12-13',
      time: '18:30',
      duration: 90,
      participants: 15,
      attendance: 14,
      sport: 'Basketball',
      location: 'Indoor Court',
      status: 'completed',
      rating: 4.2,
      notes: 'Focused on shooting techniques and defensive positioning.',
      exercises: [
        { name: 'Dribbling Drills', duration: 25, completed: true },
        { name: 'Shooting Practice', duration: 35, completed: true },
        { name: 'Defense Training', duration: 30, completed: false },
      ],
      performance: {
        energy: 78,
        focus: 82,
        participation: 85,
        improvement: 12,
      },
    },
    {
      id: 4,
      title: 'Youth Development Session',
      type: 'Youth Training',
      date: '2024-12-12',
      time: '15:00',
      duration: 75,
      participants: 18,
      attendance: 16,
      sport: 'Multi-Sport',
      location: 'Sports Complex',
      status: 'cancelled',
      rating: null,
      notes: 'Session cancelled due to weather conditions.',
      exercises: [],
      performance: null,
    },
  ];

  // Initialize animations
  useEffect(() => {
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

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch refresh action
      // await dispatch(refreshSessionHistory());
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh session history');
    }
    setRefreshing(false);
  }, [dispatch]);

  // Filter and search sessions
  const filteredSessions = mockSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'completed' && session.status === 'completed') ||
                         (selectedFilter === 'cancelled' && session.status === 'cancelled') ||
                         (selectedFilter === 'team' && session.type.includes('Team')) ||
                         (selectedFilter === 'personal' && session.type.includes('Personal'));

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.date) - new Date(a.date);
      case 'date_asc':
        return new Date(a.date) - new Date(b.date);
      case 'rating_desc':
        return (b.rating || 0) - (a.rating || 0);
      case 'participants_desc':
        return b.participants - a.participants;
      default:
        return 0;
    }
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      case 'pending':
        return COLORS.warning;
      default:
        return COLORS.text.secondary;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'cancel';
      case 'pending':
        return 'schedule';
      default:
        return 'help';
    }
  };

  // Format duration
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Calculate attendance percentage
  const getAttendancePercentage = (attendance, participants) => {
    return Math.round((attendance / participants) * 100);
  };

  // Session detail modal
  const SessionDetailModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={{
          margin: SPACING.lg,
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          maxHeight: '80%',
        }}
      >
        <BlurView
          style={{ borderRadius: 16 }}
          blurType="light"
          blurAmount={10}
        >
          {selectedSession && (
            <ScrollView style={{ padding: SPACING.lg }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
                <Text variant="headlineSmall" style={[TEXT_STYLES.heading, { flex: 1 }]}>
                  {selectedSession.title}
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>

              {/* Session Info */}
              <Surface style={{ padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                  <Icon name={getStatusIcon(selectedSession.status)} size={24} color={getStatusColor(selectedSession.status)} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, textTransform: 'capitalize' }]}>
                    {selectedSession.status}
                  </Text>
                </View>
                
                <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, marginBottom: SPACING.xs }]}>
                  📅 {selectedSession.date} at {selectedSession.time}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, marginBottom: SPACING.xs }]}>
                  ⏱️ {formatDuration(selectedSession.duration)} • 📍 {selectedSession.location}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                  👥 {selectedSession.attendance}/{selectedSession.participants} attended ({getAttendancePercentage(selectedSession.attendance, selectedSession.participants)}%)
                </Text>

                {selectedSession.rating && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm }}>
                    <Icon name="star" size={20} color={COLORS.warning} />
                    <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.xs }]}>
                      {selectedSession.rating}/5.0
                    </Text>
                  </View>
                )}
              </Surface>

              {/* Performance Metrics */}
              {selectedSession.performance && (
                <Surface style={{ padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md }}>
                  <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md }]}>
                    📊 Performance Metrics
                  </Text>
                  
                  {Object.entries(selectedSession.performance).map(([key, value]) => (
                    <View key={key} style={{ marginBottom: SPACING.sm }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs }}>
                        <Text style={[TEXT_STYLES.body, { textTransform: 'capitalize' }]}>{key}</Text>
                        <Text style={TEXT_STYLES.body}>{value}%</Text>
                      </View>
                      <ProgressBar
                        progress={value / 100}
                        color={value >= 80 ? COLORS.success : value >= 60 ? COLORS.warning : COLORS.error}
                        style={{ height: 8, borderRadius: 4 }}
                      />
                    </View>
                  ))}
                </Surface>
              )}

              {/* Exercises */}
              {selectedSession.exercises.length > 0 && (
                <Surface style={{ padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md }}>
                  <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md }]}>
                    🏋️ Exercises
                  </Text>
                  
                  {selectedSession.exercises.map((exercise, index) => (
                    <View key={index} style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingVertical: SPACING.sm,
                      borderBottomWidth: index < selectedSession.exercises.length - 1 ? 1 : 0,
                      borderBottomColor: COLORS.border,
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={TEXT_STYLES.body}>{exercise.name}</Text>
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                          {formatDuration(exercise.duration)}
                        </Text>
                      </View>
                      <Icon 
                        name={exercise.completed ? "check-circle" : "cancel"} 
                        size={24} 
                        color={exercise.completed ? COLORS.success : COLORS.error} 
                      />
                    </View>
                  ))}
                </Surface>
              )}

              {/* Notes */}
              {selectedSession.notes && (
                <Surface style={{ padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md }}>
                  <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.sm }]}>
                    📝 Session Notes
                  </Text>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.text.secondary }]}>
                    {selectedSession.notes}
                  </Text>
                </Surface>
              )}

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md }}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    Alert.alert('Feature Development', 'Export functionality coming soon! 🚀');
                  }}
                  style={{ flex: 0.48 }}
                >
                  Export Data
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    Alert.alert('Feature Development', 'Repeat session functionality coming soon! 🚀');
                  }}
                  style={{ flex: 0.48 }}
                >
                  Repeat Session
                </Button>
              </View>
            </ScrollView>
          )}
        </BlurView>
      </Modal>
    </Portal>
  );

  // Filter menu
  const FilterMenu = () => (
    <Menu
      visible={filterVisible}
      onDismiss={() => setFilterVisible(false)}
      anchor={
        <IconButton
          icon="filter-list"
          size={24}
          onPress={() => setFilterVisible(true)}
        />
      }
    >
      <Menu.Item
        onPress={() => {
          setSelectedFilter('all');
          setFilterVisible(false);
        }}
        title="All Sessions"
        leadingIcon="list"
      />
      <Menu.Item
        onPress={() => {
          setSelectedFilter('completed');
          setFilterVisible(false);
        }}
        title="Completed"
        leadingIcon="check-circle"
      />
      <Menu.Item
        onPress={() => {
          setSelectedFilter('cancelled');
          setFilterVisible(false);
        }}
        title="Cancelled"
        leadingIcon="cancel"
      />
      <Divider />
      <Menu.Item
        onPress={() => {
          setSelectedFilter('team');
          setFilterVisible(false);
        }}
        title="Team Training"
        leadingIcon="group"
      />
      <Menu.Item
        onPress={() => {
          setSelectedFilter('personal');
          setFilterVisible(false);
        }}
        title="Personal Training"
        leadingIcon="person"
      />
    </Menu>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingHorizontal: SPACING.lg,
          paddingBottom: SPACING.lg,
        }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.heading, { color: 'white', fontSize: 24, marginBottom: SPACING.xs }]}>
                Session History 📚
              </Text>
              <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
                Track your coaching journey and progress
              </Text>
            </View>
            <FilterMenu />
          </View>

          {/* Search Bar */}
          <Searchbar
            placeholder="Search sessions, sports, or types..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 25,
              elevation: 2,
            }}
            inputStyle={{ fontSize: 16 }}
            iconColor={COLORS.primary}
          />

          {/* Quick Stats */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={{ marginTop: SPACING.md }}
          >
            <Surface style={{ 
              padding: SPACING.md, 
              borderRadius: 16, 
              marginRight: SPACING.md,
              backgroundColor: 'rgba(255,255,255,0.15)',
              minWidth: 120,
            }}>
              <Text style={[TEXT_STYLES.heading, { color: 'white', fontSize: 20, textAlign: 'center' }]}>
                {mockSessions.filter(s => s.status === 'completed').length}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', textAlign: 'center' }]}>
                Completed
              </Text>
            </Surface>

            <Surface style={{ 
              padding: SPACING.md, 
              borderRadius: 16, 
              marginRight: SPACING.md,
              backgroundColor: 'rgba(255,255,255,0.15)',
              minWidth: 120,
            }}>
              <Text style={[TEXT_STYLES.heading, { color: 'white', fontSize: 20, textAlign: 'center' }]}>
                {Math.round(mockSessions.reduce((acc, s) => acc + (s.attendance || 0), 0) / mockSessions.length)}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', textAlign: 'center' }]}>
                Avg Attendance
              </Text>
            </Surface>

            <Surface style={{ 
              padding: SPACING.md, 
              borderRadius: 16, 
              marginRight: SPACING.md,
              backgroundColor: 'rgba(255,255,255,0.15)',
              minWidth: 120,
            }}>
              <Text style={[TEXT_STYLES.heading, { color: 'white', fontSize: 20, textAlign: 'center' }]}>
                {mockSessions.filter(s => s.rating).reduce((acc, s) => acc + s.rating, 0) / mockSessions.filter(s => s.rating).length || 0}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', textAlign: 'center' }]}>
                Avg Rating
              </Text>
            </Surface>
          </ScrollView>
        </Animated.View>
      </LinearGradient>

      {/* Session List */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={{ flex: 1 }}
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
          <View style={{ padding: SPACING.lg }}>
            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
              {[
                { key: 'all', label: 'All', icon: 'list' },
                { key: 'completed', label: 'Completed', icon: 'check-circle' },
                { key: 'cancelled', label: 'Cancelled', icon: 'cancel' },
                { key: 'team', label: 'Team', icon: 'group' },
                { key: 'personal', label: 'Personal', icon: 'person' },
              ].map((filter) => (
                <Chip
                  key={filter.key}
                  mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
                  selected={selectedFilter === filter.key}
                  onPress={() => setSelectedFilter(filter.key)}
                  style={{ 
                    marginRight: SPACING.sm,
                    backgroundColor: selectedFilter === filter.key ? COLORS.primary : 'transparent',
                  }}
                  textStyle={{ 
                    color: selectedFilter === filter.key ? 'white' : COLORS.text.primary 
                  }}
                  icon={filter.icon}
                >
                  {filter.label}
                </Chip>
              ))}
            </ScrollView>

            {/* Sessions */}
            {filteredSessions.length === 0 ? (
              <Surface style={{ 
                padding: SPACING.xl, 
                borderRadius: 16, 
                alignItems: 'center',
                marginTop: SPACING.xl,
              }}>
                <Icon name="search-off" size={64} color={COLORS.text.secondary} />
                <Text style={[TEXT_STYLES.subheading, { marginTop: SPACING.md, textAlign: 'center' }]}>
                  No sessions found
                </Text>
                <Text style={[TEXT_STYLES.body, { color: COLORS.text.secondary, textAlign: 'center', marginTop: SPACING.sm }]}>
                  Try adjusting your search or filters
                </Text>
              </Surface>
            ) : (
              filteredSessions.map((session, index) => (
                <Animated.View
                  key={session.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [{
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, index * 10],
                        extrapolate: 'clamp',
                      }),
                    }],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedSession(session);
                      setModalVisible(true);
                      Vibration.vibrate(50);
                    }}
                  >
                    <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
                      <Card.Content style={{ padding: SPACING.md }}>
                        {/* Session Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
                          <View style={{ flex: 1, marginRight: SPACING.sm }}>
                            <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.xs }]}>
                              {session.title}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Chip
                                mode="outlined"
                                compact
                                style={{ marginRight: SPACING.sm }}
                              >
                                {session.type}
                              </Chip>
                              <Chip
                                mode="outlined"
                                compact
                                style={{ 
                                  backgroundColor: getStatusColor(session.status),
                                  borderColor: getStatusColor(session.status),
                                }}
                                textStyle={{ color: 'white' }}
                              >
                                {session.status}
                              </Chip>
                            </View>
                          </View>
                          
                          {session.rating && (
                            <View style={{ alignItems: 'center' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name="star" size={16} color={COLORS.warning} />
                                <Text style={[TEXT_STYLES.caption, { marginLeft: 2 }]}>
                                  {session.rating}
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>

                        {/* Session Details */}
                        <View style={{ 
                          flexDirection: 'row', 
                          justifyContent: 'space-between', 
                          marginBottom: SPACING.sm,
                          backgroundColor: COLORS.surface,
                          padding: SPACING.sm,
                          borderRadius: 8,
                        }}>
                          <View style={{ flex: 1 }}>
                            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                              📅 {session.date}
                            </Text>
                            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                              ⏰ {session.time}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                              ⏱️ {formatDuration(session.duration)}
                            </Text>
                            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                              📍 {session.location}
                            </Text>
                          </View>
                        </View>

                        {/* Attendance */}
                        {session.status !== 'cancelled' && (
                          <View style={{ marginBottom: SPACING.sm }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs }}>
                              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                                Attendance
                              </Text>
                              <Text style={TEXT_STYLES.caption}>
                                {session.attendance}/{session.participants} ({getAttendancePercentage(session.attendance, session.participants)}%)
                              </Text>
                            </View>
                            <ProgressBar
                              progress={session.attendance / session.participants}
                              color={
                                getAttendancePercentage(session.attendance, session.participants) >= 80 
                                  ? COLORS.success 
                                  : getAttendancePercentage(session.attendance, session.participants) >= 60 
                                    ? COLORS.warning 
                                    : COLORS.error
                              }
                              style={{ height: 6, borderRadius: 3 }}
                            />
                          </View>
                        )}

                        {/* Performance Preview */}
                        {session.performance && (
                          <View style={{ 
                            flexDirection: 'row', 
                            justifyContent: 'space-around',
                            backgroundColor: COLORS.surface,
                            padding: SPACING.sm,
                            borderRadius: 8,
                            marginBottom: SPACING.sm,
                          }}>
                            <View style={{ alignItems: 'center' }}>
                              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>Energy</Text>
                              <Text style={TEXT_STYLES.body}>{session.performance.energy}%</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>Focus</Text>
                              <Text style={TEXT_STYLES.body}>{session.performance.focus}%</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                              <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>Improvement</Text>
                              <Text style={[TEXT_STYLES.body, { color: COLORS.success }]}>+{session.performance.improvement}%</Text>
                            </View>
                          </View>
                        )}

                        {/* Session Notes Preview */}
                        {session.notes && (
                          <Text 
                            style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, fontStyle: 'italic' }]}
                            numberOfLines={2}
                          >
                            "{session.notes}"
                          </Text>
                        )}
                      </Card.Content>
                    </Card>
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Session Detail Modal */}
      <SessionDetailModal />

      {/* Floating Action Button */}
      <FAB
        icon="analytics"
        label="Analytics"
        onPress={() => {
          Alert.alert('Feature Development', 'Advanced analytics dashboard coming soon! 📊');
          Vibration.vibrate(50);
        }}
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
      />
    </View>
  );
};

export default SessionHistory;