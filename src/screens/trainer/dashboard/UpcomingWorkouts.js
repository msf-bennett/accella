import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  FlatList,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants (these would typically be imported from your constants file)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
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
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body1: { fontSize: 16, color: COLORS.text },
  body2: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const UpcomingWork = ({ navigation }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data - replace with actual Redux selectors
  const upcomingSessions = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      clientAvatar: 'https://i.pravatar.cc/100?img=1',
      sessionType: 'Personal Training',
      time: '09:00 AM',
      date: 'Today',
      duration: '60 min',
      location: 'Gym Floor A',
      status: 'confirmed',
      notes: 'Focus on upper body strength',
      clientLevel: 'Intermediate',
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      clientAvatar: 'https://i.pravatar.cc/100?img=3',
      sessionType: 'Group Training',
      time: '11:30 AM',
      date: 'Today',
      duration: '45 min',
      location: 'Studio B',
      status: 'pending',
      notes: 'HIIT workout session',
      clientLevel: 'Advanced',
      groupSize: 6,
    },
    {
      id: '3',
      clientName: 'Emma Davis',
      clientAvatar: 'https://i.pravatar.cc/100?img=5',
      sessionType: 'Assessment',
      time: '02:00 PM',
      date: 'Tomorrow',
      duration: '30 min',
      location: 'Assessment Room',
      status: 'confirmed',
      notes: 'Initial fitness assessment',
      clientLevel: 'Beginner',
    },
    {
      id: '4',
      clientName: 'Team Warriors',
      clientAvatar: 'https://i.pravatar.cc/100?img=8',
      sessionType: 'Team Training',
      time: '04:00 PM',
      date: 'Tomorrow',
      duration: '90 min',
      location: 'Field C',
      status: 'confirmed',
      notes: 'Football conditioning',
      clientLevel: 'Advanced',
      groupSize: 22,
    },
  ];

  const quickStats = {
    todaySessions: 3,
    weekSessions: 18,
    monthRevenue: 2450,
    completionRate: 94,
  };

  const tasks = [
    { id: '1', title: 'Review Sarah\'s progress report', priority: 'high', completed: false },
    { id: '2', title: 'Prepare HIIT workout plan', priority: 'medium', completed: false },
    { id: '3', title: 'Update client meal plans', priority: 'low', completed: true },
    { id: '4', title: 'Schedule equipment maintenance', priority: 'medium', completed: false },
  ];

  useEffect(() => {
    // Animate screen entrance
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleSessionPress = (session) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Session Details',
      `Would you like to view details for ${session.clientName}'s session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Details',
          onPress: () => navigation.navigate('SessionDetails', { sessionId: session.id })
        },
      ]
    );
  };

  const handleQuickAction = (action) => {
    Vibration.vibrate(30);
    Alert.alert(
      'Feature Coming Soon',
      `${action} feature is under development and will be available in the next update! 🚀`,
      [{ text: 'Got it!' }]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const renderSessionCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <TouchableOpacity onPress={() => handleSessionPress(item)}>
        <Card style={{ marginHorizontal: SPACING.md, elevation: 3 }}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              padding: SPACING.sm,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Chip
                mode="outlined"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                textStyle={{ color: 'white', fontSize: 12 }}
              >
                {item.date}
              </Chip>
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: SPACING.sm }]}>
                {item.time}
              </Text>
            </View>
            <Chip
              style={{ backgroundColor: getStatusColor(item.status) }}
              textStyle={{ color: 'white', fontSize: 10 }}
            >
              {item.status.toUpperCase()}
            </Chip>
          </LinearGradient>

          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Avatar.Image
                size={50}
                source={{ uri: item.clientAvatar }}
                style={{ marginRight: SPACING.md }}
              />
              <View style={{ flex: 1 }}>
                <Text style={TEXT_STYLES.h3}>{item.clientName}</Text>
                <Text style={TEXT_STYLES.body2}>{item.sessionType}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
                  <Icon name="schedule" size={14} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                    {item.duration}
                  </Text>
                  <Icon name="location-on" size={14} color={COLORS.textSecondary} style={{ marginLeft: SPACING.sm }} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                    {item.location}
                  </Text>
                </View>
              </View>
              <IconButton
                icon="chevron-right"
                size={20}
                iconColor={COLORS.primary}
              />
            </View>

            <View style={{
              backgroundColor: COLORS.background,
              padding: SPACING.sm,
              borderRadius: 8,
              marginBottom: SPACING.sm,
            }}>
              <Text style={[TEXT_STYLES.caption, { fontStyle: 'italic' }]}>
                📝 {item.notes}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Chip
                  mode="outlined"
                  style={{ marginRight: SPACING.sm }}
                  textStyle={{ fontSize: 10 }}
                >
                  {item.clientLevel}
                </Chip>
                {item.groupSize && (
                  <Chip
                    mode="outlined"
                    icon="group"
                    textStyle={{ fontSize: 10 }}
                  >
                    {item.groupSize}
                  </Chip>
                )}
              </View>
              <View style={{ flexDirection: 'row' }}>
                <IconButton
                  icon="message"
                  size={18}
                  iconColor={COLORS.primary}
                  onPress={() => handleQuickAction('Message Client')}
                />
                <IconButton
                  icon="phone"
                  size={18}
                  iconColor={COLORS.success}
                  onPress={() => handleQuickAction('Call Client')}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleQuickAction('Update Task')}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        marginBottom: SPACING.sm,
        borderRadius: 8,
        elevation: 1,
      }}
    >
      <Icon
        name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
        size={20}
        color={item.completed ? COLORS.success : COLORS.textSecondary}
        style={{ marginRight: SPACING.sm }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={[
            TEXT_STYLES.body1,
            item.completed && { textDecorationLine: 'line-through', color: COLORS.textSecondary }
          ]}
        >
          {item.title}
        </Text>
      </View>
      <Chip
        style={{
          backgroundColor: getPriorityColor(item.priority),
          opacity: item.completed ? 0.5 : 1,
        }}
        textStyle={{ color: 'white', fontSize: 10 }}
      >
        {item.priority.toUpperCase()}
      </Chip>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              Today's Schedule 📅
            </Text>
            <Text style={[TEXT_STYLES.body2, { color: 'rgba(255,255,255,0.8)' }]}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <IconButton
            icon="filter-list"
            size={24}
            iconColor="white"
            onPress={() => setShowFilterModal(true)}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: SPACING.md }}
        >
          <Surface style={{
            padding: SPACING.md,
            marginRight: SPACING.md,
            borderRadius: 12,
            minWidth: 120,
            alignItems: 'center',
          }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              {quickStats.todaySessions}
            </Text>
            <Text style={TEXT_STYLES.caption}>Today's Sessions</Text>
          </Surface>

          <Surface style={{
            padding: SPACING.md,
            marginRight: SPACING.md,
            borderRadius: 12,
            minWidth: 120,
            alignItems: 'center',
          }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
              {quickStats.weekSessions}
            </Text>
            <Text style={TEXT_STYLES.caption}>This Week</Text>
          </Surface>

          <Surface style={{
            padding: SPACING.md,
            marginRight: SPACING.md,
            borderRadius: 12,
            minWidth: 120,
            alignItems: 'center',
          }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>
              ${quickStats.monthRevenue}
            </Text>
            <Text style={TEXT_STYLES.caption}>Month Revenue</Text>
          </Surface>

          <Surface style={{
            padding: SPACING.md,
            borderRadius: 12,
            minWidth: 120,
            alignItems: 'center',
          }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              {quickStats.completionRate}%
            </Text>
            <Text style={TEXT_STYLES.caption}>Completion Rate</Text>
            <ProgressBar
              progress={quickStats.completionRate / 100}
              color={COLORS.success}
              style={{ width: 80, marginTop: SPACING.xs }}
            />
          </Surface>
        </ScrollView>
      </LinearGradient>

      <ScrollView
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
        {/* Quick Actions */}
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Quick Actions ⚡
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => handleQuickAction('Create Session')}
              style={{
                backgroundColor: COLORS.primary,
                padding: SPACING.md,
                borderRadius: 12,
                marginRight: SPACING.md,
                alignItems: 'center',
                minWidth: 100,
              }}
            >
              <Icon name="add" size={24} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: SPACING.xs }]}>
                New Session
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickAction('View Analytics')}
              style={{
                backgroundColor: COLORS.success,
                padding: SPACING.md,
                borderRadius: 12,
                marginRight: SPACING.md,
                alignItems: 'center',
                minWidth: 100,
              }}
            >
              <Icon name="analytics" size={24} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: SPACING.xs }]}>
                Analytics
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickAction('Message All')}
              style={{
                backgroundColor: COLORS.warning,
                padding: SPACING.md,
                borderRadius: 12,
                marginRight: SPACING.md,
                alignItems: 'center',
                minWidth: 100,
              }}
            >
              <Icon name="message" size={24} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: SPACING.xs }]}>
                Messages
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickAction('Training Plans')}
              style={{
                backgroundColor: COLORS.secondary,
                padding: SPACING.md,
                borderRadius: 12,
                alignItems: 'center',
                minWidth: 100,
              }}
            >
              <Icon name="fitness-center" size={24} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: SPACING.xs }]}>
                Plans
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Upcoming Sessions */}
        <View style={{ marginTop: SPACING.md }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: SPACING.md,
            marginBottom: SPACING.md,
          }}>
            <Text style={TEXT_STYLES.h3}>
              Upcoming Sessions 🏋️‍♂️
            </Text>
            <Button
              mode="text"
              onPress={() => handleQuickAction('View All')}
              textColor={COLORS.primary}
            >
              View All
            </Button>
          </View>

          <FlatList
            data={upcomingSessions}
            renderItem={renderSessionCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Tasks & Reminders */}
        <View style={{ padding: SPACING.md, marginTop: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Tasks & Reminders ✓
          </Text>
          <FlatList
            data={tasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => handleQuickAction('Quick Add')}
      />
    </View>
  );
};

export default UpcomingWork;