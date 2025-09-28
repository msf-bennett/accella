import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  Alert,
  RefreshControl,
  StatusBar,
  Vibration,
  Animated,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ImageBackground,
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
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const ClientList = ({ navigation }) => {
  // State management
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card'); // card or list

  // Redux
  const { user, clientsData, workouts } = useSelector(state => state.trainer);
  const dispatch = useDispatch();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Mock data for demonstration
  const mockClients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 555-0123',
      avatar: 'https://i.pravatar.cc/100?img=1',
      age: 28,
      gender: 'female',
      joinDate: '2024-01-10',
      status: 'active',
      level: 'intermediate',
      goals: ['Weight Loss', 'Strength Building'],
      currentWeight: 65,
      targetWeight: 60,
      height: 165,
      lastWorkout: '2024-01-14',
      totalWorkouts: 24,
      completionRate: 85,
      nextSession: '2024-01-16 09:00',
      package: 'Premium',
      packageExpiry: '2024-03-10',
      notes: 'Prefers morning sessions, great dedication',
      achievements: 3,
      streak: 7,
      monthlyProgress: 78
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+1 555-0456',
      avatar: 'https://i.pravatar.cc/100?img=3',
      age: 35,
      gender: 'male',
      joinDate: '2023-11-15',
      status: 'active',
      level: 'advanced',
      goals: ['Muscle Gain', 'Performance'],
      currentWeight: 78,
      targetWeight: 82,
      height: 180,
      lastWorkout: '2024-01-15',
      totalWorkouts: 56,
      completionRate: 92,
      nextSession: '2024-01-16 07:30',
      package: 'Elite',
      packageExpiry: '2024-04-15',
      notes: 'Experienced lifter, focus on compound movements',
      achievements: 8,
      streak: 12,
      monthlyProgress: 95
    },
    {
      id: 3,
      name: 'Emma Davis',
      email: 'emma.d@email.com',
      phone: '+1 555-0789',
      avatar: 'https://i.pravatar.cc/100?img=5',
      age: 24,
      gender: 'female',
      joinDate: '2024-01-05',
      status: 'active',
      level: 'beginner',
      goals: ['Flexibility', 'General Fitness'],
      currentWeight: 58,
      targetWeight: 60,
      height: 162,
      lastWorkout: '2024-01-13',
      totalWorkouts: 8,
      completionRate: 75,
      nextSession: '2024-01-17 18:00',
      package: 'Basic',
      packageExpiry: '2024-02-05',
      notes: 'New to fitness, needs encouragement and guidance',
      achievements: 1,
      streak: 3,
      monthlyProgress: 45
    },
    {
      id: 4,
      name: 'Alex Rodriguez',
      email: 'alex.r@email.com',
      phone: '+1 555-0321',
      avatar: 'https://i.pravatar.cc/100?img=7',
      age: 42,
      gender: 'male',
      joinDate: '2023-09-20',
      status: 'inactive',
      level: 'intermediate',
      goals: ['Weight Loss', 'Health Maintenance'],
      currentWeight: 85,
      targetWeight: 75,
      height: 175,
      lastWorkout: '2024-01-05',
      totalWorkouts: 32,
      completionRate: 68,
      nextSession: null,
      package: 'Premium',
      packageExpiry: '2024-02-20',
      notes: 'Busy schedule, needs flexible timing',
      achievements: 4,
      streak: 0,
      monthlyProgress: 20
    },
    {
      id: 5,
      name: 'Lisa Park',
      email: 'lisa.p@email.com',
      phone: '+1 555-0654',
      avatar: 'https://i.pravatar.cc/100?img=9',
      age: 31,
      gender: 'female',
      joinDate: '2023-12-01',
      status: 'active',
      level: 'intermediate',
      goals: ['Endurance', 'Weight Loss'],
      currentWeight: 62,
      targetWeight: 58,
      height: 168,
      lastWorkout: '2024-01-15',
      totalWorkouts: 18,
      completionRate: 88,
      nextSession: '2024-01-16 17:30',
      package: 'Premium',
      packageExpiry: '2024-03-01',
      notes: 'Marathon runner, focus on strength training',
      achievements: 2,
      streak: 5,
      monthlyProgress: 82
    }
  ];

  // Initialize component
  useEffect(() => {
    initializeData();
    animateEntrance();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchQuery, selectedFilter, clients, sortBy]);

  const initializeData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setClients(mockClients);
      setLoading(false);
    } catch (error) {
      console.error('Error loading clients:', error);
      setLoading(false);
    }
  };

  const animateEntrance = () => {
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
  };

  const filterClients = () => {
    let filtered = clients;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.goals.some(goal => goal.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by status/category
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(client => client.status === 'active');
        break;
      case 'inactive':
        filtered = filtered.filter(client => client.status === 'inactive');
        break;
      case 'newClients':
        filtered = filtered.filter(client => {
          const joinDate = new Date(client.joinDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return joinDate >= thirtyDaysAgo;
        });
        break;
      case 'expiringSoon':
        filtered = filtered.filter(client => {
          const expiryDate = new Date(client.packageExpiry);
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
          return expiryDate <= sevenDaysFromNow;
        });
        break;
      default:
        break;
    }

    // Sort clients
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'joinDate':
          return new Date(b.joinDate) - new Date(a.joinDate);
        case 'lastWorkout':
          return new Date(b.lastWorkout) - new Date(a.lastWorkout);
        case 'progress':
          return b.monthlyProgress - a.monthlyProgress;
        default:
          return 0;
      }
    });

    setFilteredClients(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await initializeData();
    setRefreshing(false);
  }, []);

  const handleClientAction = (clientId, action) => {
    Vibration.vibrate([50, 100, 50]);
    
    switch (action) {
      case 'view':
        navigation.navigate('ClientProfile', { clientId });
        break;
      case 'schedule':
        navigation.navigate('ScheduleSession', { clientId });
        break;
      case 'message':
        navigation.navigate('Chat', { clientId });
        break;
      case 'workout':
        navigation.navigate('AssignWorkout', { clientId });
        break;
      case 'call':
        const client = clients.find(c => c.id === clientId);
        Alert.alert('Call Client', `Do you want to call ${client.name}?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => Alert.alert('Feature Coming Soon', 'Voice calling feature is under development! 📞') }
        ]);
        break;
      default:
        Alert.alert('Feature Coming Soon', 'This feature is under development! 🚀');
        break;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return '#FF9500';
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? COLORS.success : COLORS.error;
  };

  const getPackageColor = (packageType) => {
    switch (packageType) {
      case 'Basic': return '#9E9E9E';
      case 'Premium': return COLORS.primary;
      case 'Elite': return '#FFD700';
      default: return COLORS.textSecondary;
    }
  };

  const renderClientCard = ({ item: client }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.medium,
      }}
    >
      <Card style={{ marginHorizontal: SPACING.medium }}>
        <TouchableOpacity
          onPress={() => handleClientAction(client.id, 'view')}
          activeOpacity={0.7}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={client.status === 'active' ? ['#667eea', '#764ba2'] : ['#757575', '#424242']}
            style={{
              padding: SPACING.medium,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Avatar.Image
                  size={50}
                  source={{ uri: client.avatar }}
                  style={{ marginRight: SPACING.medium }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.subheading, { color: 'white', fontWeight: 'bold' }]}>
                    {client.name}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                    {client.package} • {client.level.charAt(0).toUpperCase() + client.level.slice(1)}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', fontSize: 11 }]}>
                    Member since {new Date(client.joinDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                {client.streak > 0 && (
                  <View style={{ alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="local-fire-department" size={16} color="#FFD700" />
                    <Text style={[TEXT_STYLES.caption, { color: 'white', fontSize: 10 }]}>
                      {client.streak} day streak
                    </Text>
                  </View>
                )}
                <Chip
                  mode="flat"
                  textStyle={{ color: 'white', fontSize: 10 }}
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    height: 24,
                  }}
                >
                  {client.status.toUpperCase()}
                </Chip>
              </View>
            </View>
          </LinearGradient>

          <Card.Content style={{ paddingTop: SPACING.medium }}>
            {/* Progress Section */}
            <View style={{ marginBottom: SPACING.medium }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={TEXT_STYLES.caption}>Monthly Progress</Text>
                <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                  {client.monthlyProgress}%
                </Text>
              </View>
              <ProgressBar
                progress={client.monthlyProgress / 100}
                color={getLevelColor(client.level)}
                style={{ height: 6, borderRadius: 3 }}
              />
            </View>

            {/* Stats Grid */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              marginBottom: SPACING.medium 
            }}>
              <Surface style={{
                padding: SPACING.small,
                borderRadius: 8,
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                flex: 1,
                marginRight: SPACING.xsmall,
                alignItems: 'center'
              }}>
                <Text style={[TEXT_STYLES.subheading, { color: COLORS.primary, fontWeight: 'bold' }]}>
                  {client.totalWorkouts}
                </Text>
                <Text style={[TEXT_STYLES.caption, { fontSize: 10 }]}>
                  Total Workouts
                </Text>
              </Surface>
              
              <Surface style={{
                padding: SPACING.small,
                borderRadius: 8,
                backgroundColor: 'rgba(67, 160, 71, 0.1)',
                flex: 1,
                marginHorizontal: SPACING.xsmall,
                alignItems: 'center'
              }}>
                <Text style={[TEXT_STYLES.subheading, { color: COLORS.success, fontWeight: 'bold' }]}>
                  {client.completionRate}%
                </Text>
                <Text style={[TEXT_STYLES.caption, { fontSize: 10 }]}>
                  Completion
                </Text>
              </Surface>

              <Surface style={{
                padding: SPACING.small,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 149, 0, 0.1)',
                flex: 1,
                marginLeft: SPACING.xsmall,
                alignItems: 'center'
              }}>
                <Text style={[TEXT_STYLES.subheading, { color: '#FF9500', fontWeight: 'bold' }]}>
                  {client.achievements}
                </Text>
                <Text style={[TEXT_STYLES.caption, { fontSize: 10 }]}>
                  Achievements
                </Text>
              </Surface>
            </View>

            {/* Goals */}
            <View style={{ marginBottom: SPACING.medium }}>
              <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xsmall, fontWeight: 'bold' }]}>
                Goals:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {client.goals.map((goal, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    textStyle={{ fontSize: 11 }}
                    style={{
                      marginRight: SPACING.xsmall,
                      marginBottom: SPACING.xsmall,
                      height: 28,
                    }}
                  >
                    {goal}
                  </Chip>
                ))}
              </View>
            </View>

            {/* Next Session */}
            {client.nextSession && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                padding: SPACING.small,
                borderRadius: 8,
                marginBottom: SPACING.medium,
              }}>
                <Icon name="schedule" size={16} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xsmall }]}>
                  Next session: {new Date(client.nextSession).toLocaleString()}
                </Text>
              </View>
            )}

            {/* Package Expiry Warning */}
            {(() => {
              const expiryDate = new Date(client.packageExpiry);
              const today = new Date();
              const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
              
              if (daysUntilExpiry <= 7) {
                return (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    padding: SPACING.small,
                    borderRadius: 8,
                    marginBottom: SPACING.medium,
                  }}>
                    <Icon name="warning" size={16} color={COLORS.error} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xsmall, color: COLORS.error }]}>
                      Package expires in {daysUntilExpiry} days
                    </Text>
                  </View>
                );
              }
              return null;
            })()}

            {/* Notes */}
            {client.notes && (
              <Text style={[TEXT_STYLES.caption, {
                fontStyle: 'italic',
                color: COLORS.textSecondary,
                marginBottom: SPACING.small
              }]}>
                💭 {client.notes}
              </Text>
            )}
          </Card.Content>

          <Divider />

          <Card.Actions style={{ paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small }}>
            <Button
              mode="outlined"
              onPress={() => handleClientAction(client.id, 'message')}
              icon="message"
              compact
              style={{ marginRight: SPACING.xsmall }}
            >
              Message
            </Button>
            
            <Button
              mode="contained"
              onPress={() => handleClientAction(client.id, 'schedule')}
              icon="event"
              compact
              style={{ marginRight: SPACING.xsmall }}
            >
              Schedule
            </Button>

            <IconButton
              icon="phone"
              size={20}
              onPress={() => handleClientAction(client.id, 'call')}
            />
            
            <IconButton
              icon="fitness-center"
              size={20}
              onPress={() => handleClientAction(client.id, 'workout')}
            />
          </Card.Actions>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderFilterModal = () => (
    <Portal>
      <BlurView intensity={80} style={{ flex: 1 }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)'
        }}>
          <Surface style={{
            width: width * 0.9,
            padding: SPACING.large,
            borderRadius: 16,
            elevation: 8,
            maxHeight: width * 1.2,
          }}>
            <Text style={[TEXT_STYLES.heading, { textAlign: 'center', marginBottom: SPACING.large }]}>
              Filter & Sort Clients 👥
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Filter Options */}
              <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.medium }]}>Filter by:</Text>
              {[
                { key: 'all', label: 'All Clients', icon: 'people' },
                { key: 'active', label: 'Active Clients', icon: 'check-circle' },
                { key: 'inactive', label: 'Inactive Clients', icon: 'pause-circle-filled' },
                { key: 'newClients', label: 'New Clients (30 days)', icon: 'fiber-new' },
                { key: 'expiringSoon', label: 'Expiring Soon (7 days)', icon: 'warning' },
              ].map(filter => (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => {
                    setSelectedFilter(filter.key);
                    Vibration.vibrate(50);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: SPACING.small,
                    paddingHorizontal: SPACING.small,
                    backgroundColor: selectedFilter === filter.key ? COLORS.primary + '20' : 'transparent',
                    borderRadius: 8,
                    marginBottom: SPACING.xsmall,
                  }}
                >
                  <Icon
                    name={selectedFilter === filter.key ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={selectedFilter === filter.key ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Icon
                    name={filter.icon}
                    size={18}
                    color={selectedFilter === filter.key ? COLORS.primary : COLORS.textSecondary}
                    style={{ marginLeft: SPACING.small }}
                  />
                  <Text style={[
                    TEXT_STYLES.body,
                    { 
                      marginLeft: SPACING.small,
                      color: selectedFilter === filter.key ? COLORS.primary : COLORS.text,
                      fontWeight: selectedFilter === filter.key ? 'bold' : 'normal'
                    }
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <Divider style={{ marginVertical: SPACING.medium }} />

              {/* Sort Options */}
              <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.medium }]}>Sort by:</Text>
              {[
                { key: 'name', label: 'Name (A-Z)', icon: 'sort-by-alpha' },
                { key: 'joinDate', label: 'Join Date (Newest)', icon: 'date-range' },
                { key: 'lastWorkout', label: 'Last Workout', icon: 'fitness-center' },
                { key: 'progress', label: 'Progress (High to Low)', icon: 'trending-up' },
              ].map(sort => (
                <TouchableOpacity
                  key={sort.key}
                  onPress={() => {
                    setSortBy(sort.key);
                    Vibration.vibrate(50);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: SPACING.small,
                    paddingHorizontal: SPACING.small,
                    backgroundColor: sortBy === sort.key ? COLORS.success + '20' : 'transparent',
                    borderRadius: 8,
                    marginBottom: SPACING.xsmall,
                  }}
                >
                  <Icon
                    name={sortBy === sort.key ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={sortBy === sort.key ? COLORS.success : COLORS.textSecondary}
                  />
                  <Icon
                    name={sort.icon}
                    size={18}
                    color={sortBy === sort.key ? COLORS.success : COLORS.textSecondary}
                    style={{ marginLeft: SPACING.small }}
                  />
                  <Text style={[
                    TEXT_STYLES.body,
                    { 
                      marginLeft: SPACING.small,
                      color: sortBy === sort.key ? COLORS.success : COLORS.text,
                      fontWeight: sortBy === sort.key ? 'bold' : 'normal'
                    }
                  ]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={{ flexDirection: 'row', marginTop: SPACING.large }}>
              <Button
                mode="outlined"
                onPress={() => setShowFilters(false)}
                style={{ flex: 1, marginRight: SPACING.small }}
              >
                Close
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setSelectedFilter('all');
                  setSortBy('name');
                  setShowFilters(false);
                  Vibration.vibrate(100);
                }}
                style={{ flex: 1, marginLeft: SPACING.small }}
              >
                Reset
              </Button>
            </View>
          </Surface>
        </View>
      </BlurView>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.large,
      paddingVertical: SPACING.xlarge,
    }}>
      <Icon name="people-outline" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.heading, { 
        textAlign: 'center', 
        marginTop: SPACING.large,
        color: COLORS.textSecondary 
      }]}>
        {searchQuery ? 'No Matching Clients' : 'No Clients Yet'}
      </Text>
      <Text style={[TEXT_STYLES.body, { 
        textAlign: 'center', 
        marginTop: SPACING.small,
        color: COLORS.textSecondary 
      }]}>
        {searchQuery 
          ? 'Try adjusting your search or filters'
          : 'Start building your client base! Add your first client to get started 💪'
        }
      </Text>
    </View>
  );

  const renderStats = () => {
    const activeClients = clients.filter(c => c.status === 'active').length;
    const inactiveClients = clients.filter(c => c.status === 'inactive').length;
    const newThisMonth = clients.filter(c => {
      const joinDate = new Date(c.joinDate);
      const now = new Date();
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
    }).length;

    return (
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: SPACING.medium,
        marginBottom: SPACING.medium
      }}>
        <Surface style={{
          flex: 1,
          padding: SPACING.medium,
          borderRadius: 12,
          marginRight: SPACING.small,
          backgroundColor: 'rgba(102, 126, 234, 0.1)'
        }}>
          <Text style={[TEXT_STYLES.heading, { color: COLORS.primary, textAlign: 'center' }]}>
            {activeClients}
          </Text>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
            Active Clients
          </Text>
        </Surface>
        
        <Surface style={{
          flex: 1,
          padding: SPACING.medium,
          borderRadius: 12,
          marginHorizontal: SPACING.xsmall,
          backgroundColor: 'rgba(244, 67, 54, 0.1)'
        }}>
          <Text style={[TEXT_STYLES.heading, { color: COLORS.error, textAlign: 'center' }]}>
            {inactiveClients}
          </Text>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
            Inactive
          </Text>
        </Surface>

        <Surface style={{
          flex: 1,
          padding: SPACING.medium,
          borderRadius: 12,
          marginLeft: SPACING.small,
          backgroundColor: 'rgba(67, 160, 71, 0.1)'
        }}>
          <Text style={[TEXT_STYLES.heading, { color: COLORS.success, textAlign: 'center' }]}>
            {newThisMonth}
          </Text>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
            New This Month
          </Text>
        </Surface>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={{ height: 100 }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="people" size={60} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.subheading, { marginTop: SPACING.medium }]}>
            Loading Clients...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={{
        paddingTop: 50,
        paddingBottom: SPACING.large,
        paddingHorizontal: SPACING.medium,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.heading, { color: 'white', fontWeight: 'bold' }]}>
              My Clients 👥
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
              Manage and track all your client relationships
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon={viewMode === 'card' ? 'view-list' : 'view-module'}
              size={24}
              iconColor="white"
              onPress={() => {
                setViewMode(viewMode === 'card' ? 'list' : 'card');
                Vibration.vibrate(50);
              }}
            />
            <IconButton
              icon="filter-list"
              size={24}
              iconColor="white"
              onPress={() => setShowFilters(true)}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small }}>
        <Searchbar
          placeholder="Search clients, email, or goals..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          icon="search"
          style={{ elevation: 2 }}
        />
      </View>

      {/* Stats Summary */}
      {renderStats()}

      {/* Active Filter Indicator */}
      {(selectedFilter !== 'all' || sortBy !== 'name') && (
        <View style={{ 
          paddingHorizontal: SPACING.medium,
          marginBottom: SPACING.small
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.primary + '15',
            paddingHorizontal: SPACING.medium,
            paddingVertical: SPACING.small,
            borderRadius: 8,
          }}>
            <Icon name="filter-list" size={16} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.caption, { 
              marginLeft: SPACING.small, 
              flex: 1,
              color: COLORS.primary 
            }]}>
              Filtered: {selectedFilter !== 'all' ? selectedFilter : 'all'} • 
              Sorted by: {sortBy}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedFilter('all');
                setSortBy('name');
                Vibration.vibrate(50);
              }}
            >
              <Icon name="clear" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Client List */}
      {filteredClients.length > 0 ? (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderClientCard}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => (
            { length: 300, offset: 300 * index, index }
          )}
        />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={{ flex: 1 }}
        >
          {renderEmptyState()}
        </ScrollView>
      )}

      {/* Floating Action Buttons */}
      <View style={{
        position: 'absolute',
        right: SPACING.medium,
        bottom: SPACING.large,
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}>
        {/* Quick Actions FAB Group */}
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.success,
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: SPACING.small,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
          onPress={() => {
            Alert.alert('Feature Coming Soon', 'Bulk message feature is under development! 📢');
            Vibration.vibrate(50);
          }}
        >
          <Icon name="campaign" size={24} color="white" />
        </TouchableOpacity>

        {/* Main Add Client FAB */}
        <FAB
          icon="person-add"
          style={{
            backgroundColor: COLORS.primary,
          }}
          onPress={() => {
            navigation.navigate('AddClient');
            Vibration.vibrate([50, 100, 50]);
          }}
        />
      </View>

      {/* Filter Modal */}
      {showFilters && renderFilterModal()}
    </View>
  );
};

export default ClientList;