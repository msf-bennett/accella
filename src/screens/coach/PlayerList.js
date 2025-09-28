import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
  Vibration,
  Dimensions,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  ProgressBar,
  Portal,
  Modal,
  ActivityIndicator,
  Snackbar,
  Menu,
  Divider,
  Badge,
} from 'react-native-paper';
//import { Divider,
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../components/shared/BlurView';
import { LinearGradient } from '../../components/shared/LinearGradient';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';

const { width } = Dimensions.get('window');

// Enhanced placeholder data with more realistic information
const fetchPlayers = async (filters = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const allPlayers = [
    {
      id: '1',
      name: 'Amina Yusuf',
      age: 13,
      sport: 'Football',
      position: 'Midfielder',
      level: 'intermediate',
      joinDate: '2024-01-15',
      status: 'active',
      performance: 85,
      attendanceRate: 92,
      avatar: null,
      achievements: ['Goal Scorer', 'Team Player'],
      lastSession: '2024-08-15',
      sessionsCompleted: 45,
      parentEmail: 'parent@example.com',
      phoneNumber: '+254700123456',
      medicalNotes: 'No known allergies',
      emergencyContact: '+254700654321',
    },
    {
      id: '2',
      name: 'Brian Otieno',
      age: 10,
      sport: 'Athletics',
      position: 'Sprinter',
      level: 'beginner',
      joinDate: '2024-02-20',
      status: 'active',
      performance: 78,
      attendanceRate: 88,
      avatar: null,
      achievements: ['Fast Starter'],
      lastSession: '2024-08-14',
      sessionsCompleted: 32,
      parentEmail: 'brian.parent@example.com',
      phoneNumber: '+254700789012',
      medicalNotes: 'Mild asthma',
      emergencyContact: '+254700321654',
    },
    {
      id: '3',
      name: 'Catherine Wanjiku',
      age: 15,
      sport: 'Basketball',
      position: 'Point Guard',
      level: 'advanced',
      joinDate: '2023-11-10',
      status: 'active',
      performance: 93,
      attendanceRate: 96,
      avatar: null,
      achievements: ['MVP', 'Leadership', 'Perfect Attendance'],
      lastSession: '2024-08-16',
      sessionsCompleted: 67,
      parentEmail: 'catherine.parent@example.com',
      phoneNumber: '+254700345678',
      medicalNotes: 'None',
      emergencyContact: '+254700987654',
    },
    {
      id: '4',
      name: 'David Kimani',
      age: 12,
      sport: 'Swimming',
      position: 'Freestyle',
      level: 'intermediate',
      joinDate: '2024-03-05',
      status: 'inactive',
      performance: 71,
      attendanceRate: 65,
      avatar: null,
      achievements: [],
      lastSession: '2024-07-20',
      sessionsCompleted: 28,
      parentEmail: 'david.parent@example.com',
      phoneNumber: '+254700456789',
      medicalNotes: 'Chlorine sensitivity',
      emergencyContact: '+254700123789',
    },
    {
      id: '5',
      name: 'Faith Achieng',
      age: 14,
      sport: 'Tennis',
      position: 'Singles Player',
      level: 'advanced',
      joinDate: '2023-09-15',
      status: 'active',
      performance: 89,
      attendanceRate: 91,
      avatar: null,
      achievements: ['Tournament Winner', 'Consistent Player'],
      lastSession: '2024-08-16',
      sessionsCompleted: 58,
      parentEmail: 'faith.parent@example.com',
      phoneNumber: '+254700567890',
      medicalNotes: 'Previous ankle injury',
      emergencyContact: '+254700456123',
    },
  ];

  // Apply filters
  let filteredPlayers = allPlayers;
  
  if (filters.sport && filters.sport !== 'all') {
    filteredPlayers = filteredPlayers.filter(p => p.sport.toLowerCase() === filters.sport.toLowerCase());
  }
  
  if (filters.level && filters.level !== 'all') {
    filteredPlayers = filteredPlayers.filter(p => p.level === filters.level);
  }
  
  if (filters.status && filters.status !== 'all') {
    filteredPlayers = filteredPlayers.filter(p => p.status === filters.status);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredPlayers = filteredPlayers.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.sport.toLowerCase().includes(searchLower) ||
      p.position.toLowerCase().includes(searchLower)
    );
  }

  return filteredPlayers;
};

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'performance', 'attendance'
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, isOffline, playerStats } = useSelector(state => ({
    user: state.auth.user,
    isOffline: state.app.isOffline,
    playerStats: state.players.stats,
  }));

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Sport categories
  const sports = [
    { id: 'all', name: 'All Sports', icon: 'sports', color: COLORS.primary },
    { id: 'football', name: 'Football', icon: 'sports-football', color: '#4CAF50' },
    { id: 'basketball', name: 'Basketball', icon: 'sports-basketball', color: '#FF9800' },
    { id: 'athletics', name: 'Athletics', icon: 'directions-run', color: '#9C27B0' },
    { id: 'swimming', name: 'Swimming', icon: 'pool', color: '#00BCD4' },
    { id: 'tennis', name: 'Tennis', icon: 'sports-tennis', color: '#2196F3' },
  ];

  const levels = [
    { id: 'all', name: 'All Levels', color: COLORS.primary },
    { id: 'beginner', name: 'Beginner', color: '#4CAF50' },
    { id: 'intermediate', name: 'Intermediate', color: '#FF9800' },
    { id: 'advanced', name: 'Advanced', color: '#F44336' },
  ];

  const statusOptions = [
    { id: 'all', name: 'All Status', color: COLORS.primary },
    { id: 'active', name: 'Active', color: '#4CAF50' },
    { id: 'inactive', name: 'Inactive', color: '#9E9E9E' },
  ];

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Load players on focus
  useFocusEffect(
    useCallback(() => {
      loadPlayers();
    }, [selectedSport, selectedLevel, selectedStatus, searchQuery])
  );

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        sport: selectedSport,
        level: selectedLevel,
        status: selectedStatus,
        search: searchQuery,
      };
      const data = await fetchPlayers(filters);
      setPlayers(data);
    } catch (error) {
      console.error('Failed to load players:', error);
      Alert.alert('Error', 'Failed to load players. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedSport, selectedLevel, selectedStatus, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlayers();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadPlayers]);

  const sortedPlayers = useMemo(() => {
    const sorted = [...players].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'performance':
          aValue = a.performance;
          bValue = b.performance;
          break;
        case 'attendance':
          aValue = a.attendanceRate;
          bValue = b.attendanceRate;
          break;
        case 'age':
          aValue = a.age;
          bValue = b.age;
          break;
        case 'joinDate':
          aValue = new Date(a.joinDate);
          bValue = new Date(b.joinDate);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return sorted;
  }, [players, sortBy, sortOrder]);

  const togglePlayerSelection = useCallback((playerId) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.includes(playerId);
      if (isSelected) {
        const newSelection = prev.filter(id => id !== playerId);
        if (newSelection.length === 0) {
          setSelectionMode(false);
        }
        return newSelection;
      } else {
        return [...prev, playerId];
      }
    });
    Vibration.vibrate(10);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlayers([]);
    setSelectionMode(false);
  }, []);

  const handleBulkAction = useCallback((action) => {
    Alert.alert(
      `${action} Players`,
      `Are you sure you want to ${action.toLowerCase()} ${selectedPlayers.length} selected player(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // Handle bulk action here
            Alert.alert('Success', `${action} completed for ${selectedPlayers.length} players`);
            clearSelection();
          },
        },
      ]
    );
  }, [selectedPlayers.length, clearSelection]);

  const getPlayerAvatar = useCallback((player) => {
    if (player.avatar) {
      return <Avatar.Image source={{ uri: player.avatar }} size={50} />;
    }
    
    const initials = player.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    const sport = sports.find(s => s.id === player.sport.toLowerCase());
    const backgroundColor = sport?.color || COLORS.primary;
    
    return (
      <Avatar.Text 
        label={initials} 
        size={50} 
        style={{ backgroundColor }}
      />
    );
  }, [sports]);

  const getStatusColor = useCallback((status) => {
    return status === 'active' ? '#4CAF50' : '#9E9E9E';
  }, []);

  const getLevelColor = useCallback((level) => {
    const levelObj = levels.find(l => l.id === level);
    return levelObj?.color || COLORS.primary;
  }, [levels]);

  const renderPlayerCard = useCallback(({ item, index }) => {
    const isSelected = selectedPlayers.includes(item.id);
    const cardScale = isSelected ? 0.95 : 1;
    
    return (
      <Animated.View
        style={[
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (selectionMode) {
              togglePlayerSelection(item.id);
            } else {
              navigation.navigate('PlayerProfile', { player: item });
            }
          }}
          onLongPress={() => {
            if (!selectionMode) {
              setSelectionMode(true);
              togglePlayerSelection(item.id);
              Vibration.vibrate(100);
            }
          }}
        >
          <Card style={[
            styles.playerCard,
            isSelected && styles.selectedCard,
            { transform: [{ scale: cardScale }] }
          ]}>
            <LinearGradient
              colors={isSelected ? ['#667eea', '#764ba2'] : ['transparent', 'transparent']}
              style={styles.cardGradient}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.playerHeader}>
                  <View style={styles.avatarContainer}>
                    {getPlayerAvatar(item)}
                    <Badge
                      size={16}
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status) }
                      ]}
                    />
                  </View>
                  
                  <View style={styles.playerInfo}>
                    <Text style={[
                      styles.playerName,
                      isSelected && { color: '#fff' }
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={[
                      styles.playerSubtitle,
                      isSelected && { color: '#fff', opacity: 0.8 }
                    ]}>
                      {item.sport} • {item.position}
                    </Text>
                    <View style={styles.playerMeta}>
                      <Chip
                        compact
                        style={styles.levelChip}
                        textStyle={{ color: COLORS.text, fontSize: 11, fontWeight: '600' }}
                      >
                        {item.level.toUpperCase()}
                      </Chip>
                      <Text style={[
                        styles.ageText,
                        isSelected && { color: '#fff' }
                      ]}>
                        Age {item.age}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.performanceIndicator}>
                    <Text style={[
                      styles.performanceLabel,
                      isSelected && { color: '#fff' }
                    ]}>
                      Performance
                    </Text>
                    <View style={styles.performanceCircle}>
                      <Text style={[
                        styles.performanceValue,
                        isSelected && { color: '#fff' }
                      ]}>
                        {item.performance}%
                      </Text>
                    </View>
                  </View>
                </View>
                

                <View style={styles.playerFooter}>
                  <View style={styles.achievementContainer}>
                    {item.achievements.slice(0, 2).map((achievement, idx) => (
                      <Chip
                        key={idx}
                        compact
                        icon="jump-rope"
                        style={styles.achievementChip}
                        textStyle={{ fontSize: 10, color: COLORS.text, fontWeight: '500' }}
                        iconColor={COLORS.primary}
                      >
                        {achievement}
                      </Chip>
                    ))}
                    {item.achievements.length > 2 && (
                      <Text style={[
                        styles.moreAchievements,
                        isSelected && { color: '#fff' }
                      ]}>
                        +{item.achievements.length - 2} more
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.messageButton]}
                      onPress={() => {
                        navigation.navigate('Chat', { chatName: item.name, playerId: item.id });
                      }}
                    >
                      <MaterialIcons name="message" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Message</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.callButton]}
                      onPress={() => {
                        Alert.alert('Call', `Call ${item.phoneNumber}`, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Call', onPress: () => console.log('Calling...') }
                        ]);
                      }}
                    >
                      <MaterialIcons name="phone" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Call</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.playerMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, isSelected && { color: '#fff' }]}>
                      Attendance
                    </Text>
                    <Text style={[styles.metricValue, isSelected && { color: '#fff' }]}>
                      {item.attendanceRate}%
                    </Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, isSelected && { color: '#fff' }]}>
                      Sessions
                    </Text>
                    <Text style={[styles.metricValue, isSelected && { color: '#fff' }]}>
                      {item.sessionsCompleted}
                    </Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, isSelected && { color: '#fff' }]}>
                      Last Active
                    </Text>
                    <Text style={[styles.metricValue, isSelected && { color: '#fff' }]}>
                      {new Date(item.lastSession).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </LinearGradient>
            
            {selectionMode && (
              <View style={styles.selectionOverlay}>
                <MaterialIcons
                  name={isSelected ? "check-circle" : "radio-button-unchecked"}
                  size={24}
                  color={isSelected ? "#4CAF50" : "#999"}
                />
              </View>
            )}
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [
    selectedPlayers,
    selectionMode,
    fadeAnim,
    slideAnim,
    scaleAnim,
    getPlayerAvatar,
    getStatusColor,
    getLevelColor,
    togglePlayerSelection,
    navigation,
  ]);

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.blurContainer}>
          <Surface style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Players</Text>
              <IconButton
                icon="close"
                onPress={() => setShowFilters(false)}
              />
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sport</Text>
              <View style={styles.filterChips}>
                {sports.map((sport) => (
                  <Chip
                    key={sport.id}
                    selected={selectedSport === sport.id}
                    onPress={() => setSelectedSport(sport.id)}
                    style={styles.filterChip}
                    icon={sport.icon}
                  >
                    {sport.name}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Level</Text>
              <View style={styles.filterChips}>
                {levels.map((level) => (
                  <Chip
                    key={level.id}
                    selected={selectedLevel === level.id}
                    onPress={() => setSelectedLevel(level.id)}
                    style={styles.filterChip}
                  >
                    {level.name}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterChips}>
                {statusOptions.map((status) => (
                  <Chip
                    key={status.id}
                    selected={selectedStatus === status.id}
                    onPress={() => setSelectedStatus(status.id)}
                    style={styles.filterChip}
                  >
                    {status.name}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedSport('all');
                  setSelectedLevel('all');
                  setSelectedStatus('all');
                }}
                style={styles.clearButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                style={styles.applyButton}
              >
                Apply Filters
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>
    </Portal>
  );

const renderHeader = () => (
  <Surface style={styles.headerContainer}>
    <View style={[styles.headerGradient, { backgroundColor: '#667eea' }]}>
      <View style={styles.headerContent}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            My Players {isOffline && '(Offline)'}
          </Text>
          <View style={styles.headerIcons}>
            <IconButton
              icon="chart-line"
              onPress={() => navigation.navigate('Analytics')}
              style={styles.headerIconButton}
              iconColor="#fff"
              size={20}
            />
            <IconButton
              icon="bell"
              onPress={() => navigation.navigate('Notifications')}
              style={styles.headerIconButton}
              iconColor="#fff"
              size={20}
            />
            <IconButton
              icon="dots-vertical"
              onPress={() => setShowSettingsMenu(true)}
              style={styles.headerIconButton}
              iconColor="#fff"
              size={20}
            />
          </View>
        </View>
        
        <Searchbar
          placeholder="Search players..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.text }}
        />
        
        <View style={styles.controlsAndStatsRow}>
          <View style={styles.filterControls}>
            <IconButton
              icon="tune"
              selected={showFilters}
              onPress={() => setShowFilters(true)}
              style={styles.controlButton}
              iconColor="#fff"
            />
            
            <Menu
              visible={showSortMenu}
              onDismiss={() => setShowSortMenu(false)}
              anchor={
                <IconButton
                  icon="sort"
                  onPress={() => setShowSortMenu(true)}
                  style={styles.controlButton}
                  iconColor="#fff"
                />
              }
            >
              <Menu.Item
                leadingIcon="sort-alphabetical-ascending"
                onPress={() => {
                  setSortBy('name');
                  setSortOrder('asc');
                  setShowSortMenu(false);
                }}
                title="Name A-Z"
              />
              <Menu.Item
                leadingIcon="trending-up"
                onPress={() => {
                  setSortBy('performance');
                  setSortOrder('desc');
                  setShowSortMenu(false);
                }}
                title="Performance"
              />
              <Menu.Item
                leadingIcon="calendar-check"
                onPress={() => {
                  setSortBy('attendance');
                  setSortOrder('desc');
                  setShowSortMenu(false);
                }}
                title="Attendance"
              />
              <Menu.Item
                leadingIcon="cake"
                onPress={() => {
                  setSortBy('age');
                  setSortOrder('asc');
                  setShowSortMenu(false);
                }}
                title="Age"
              />
            </Menu>
            
            <IconButton
              icon={viewMode === 'list' ? 'view-grid' : 'view-list'}
              onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              style={styles.controlButton}
              iconColor="#fff"
            />
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sortedPlayers.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {sortedPlayers.filter(p => p.status === 'active').length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  </Surface>
);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="group-off" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Players Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedSport !== 'all' || selectedLevel !== 'all' 
          ? 'Try adjusting your search or filters'
          : 'Add your first player to get started'
        }
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddPlayer')}
        style={styles.addFirstButton}
        icon="plus"
      >
        Add First Player
      </Button>
    </View>
  );

  const renderSelectionBar = () => {
    if (!selectionMode) return null;
    
    return (
      <Surface style={styles.selectionBar}>
        <Text style={styles.selectionText}>
          {selectedPlayers.length} selected
        </Text>
        <View style={styles.selectionActions}>
          <IconButton
            icon="message"
            onPress={() => handleBulkAction('Message')}
            iconColor={COLORS.primary}
          />
          <IconButton
            icon="delete"
            onPress={() => handleBulkAction('Archive')}
            iconColor={COLORS.error}
          />
          <IconButton
            icon="close"
            onPress={clearSelection}
            iconColor={COLORS.textSecondary}
          />
        </View>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      {renderSelectionBar()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading players...</Text>
        </View>
      ) : sortedPlayers.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={sortedPlayers}
          renderItem={renderPlayerCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
        />
      )}

      {renderFilterModal()}

      {!selectionMode && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('AddPlayer')}
          label="Add Player"
          color="#fff"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerGradient: {
  paddingTop: 45,
  paddingBottom: SPACING.sd,
},
  headerContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: '#fff',
    elevation: 2,
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    elevation: 4,
  },
  selectionText: {
    ...TEXT_STYLES.body1,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectionActions: {
    flexDirection: 'row',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.body1,
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  addFirstButton: {
    backgroundColor: COLORS.primary,
  },
  playerCard: {
  marginBottom: SPACING.md,
  elevation: 3,
  backgroundColor: COLORS.surface,
  borderRadius: 12,
  overflow: 'hidden',
},
  selectedCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    elevation: 8,
  },
  cardGradient: {
    flex: 1,
  },
  cardContent: {
  padding: SPACING.md,
},
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  statusBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: 2,
  },
  playerSubtitle: {
    ...TEXT_STYLES.body2,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelChip: {
  marginRight: SPACING.sm,
  backgroundColor: 'rgba(255,255,255,0.9)',
  height: 28,
  paddingHorizontal: 8,
},
  ageText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  playerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  achievementChip: {
  marginRight: SPACING.sm,
  marginBottom: SPACING.sm,
  backgroundColor: 'rgba(255,255,255,0.9)',
  height: 26,
  paddingHorizontal: 6,
},
  moreAchievements: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  selectionOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  filterModal: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
  },
  filterSection: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterLabel: {
    ...TEXT_STYLES.body1,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterChip: {
    marginBottom: SPACING.sm,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  clearButton: {
    flex: 0.4,
  },
  applyButton: {
    flex: 0.55,
    backgroundColor: COLORS.primary,
  },
  fab: {
  position: 'absolute',
  right: SPACING.lg,
  bottom: SPACING.xl,
  backgroundColor: COLORS.primary,
  borderRadius: 8,
},

  headerTitleContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: SPACING.md,
},
headerIcons: {
  flexDirection: 'row',
},
headerIconButton: {
  backgroundColor: 'rgba(255,255,255,0.2)',
  marginLeft: 4,
},
statsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginBottom: SPACING.md,
  paddingHorizontal: SPACING.md,
},
statItem: {
  alignItems: 'center',
},
statNumber: {
  ...TEXT_STYLES.h3,
  color: '#fff',
  fontWeight: 'bold',
},
statLabel: {
  ...TEXT_STYLES.caption,
  color: '#fff',
  opacity: 0.8,
  marginTop: 2,
},
filterControls: {
  flexDirection: 'row',
},
controlsAndStatsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
filterControls: {
  flexDirection: 'row',
},
statsContainer: {
  flexDirection: 'row',
  alignItems: 'center',
},
statItem: {
  alignItems: 'center',
  marginLeft: SPACING.md,
},
statNumber: {
  ...TEXT_STYLES.body1,
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},
statLabel: {
  ...TEXT_STYLES.caption,
  color: '#fff',
  opacity: 0.8,
  fontSize: 11,
},
actionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 8,
  marginLeft: 8,
  minWidth: 80,
  justifyContent: 'center',
},
messageButton: {
  backgroundColor: '#4CAF50',
},
callButton: {
  backgroundColor: '#2196F3',
},
actionButtonText: {
  color: '#fff',
  fontSize: 13,
  fontWeight: '600',
  marginLeft: 6,
},
playerMetrics: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingTop: SPACING.md,
  marginTop: SPACING.md,
  borderTopWidth: 1,
  borderTopColor: 'rgba(0,0,0,0.1)',
},
metricItem: {
  alignItems: 'center',
  flex: 1,
},
metricLabel: {
  ...TEXT_STYLES.caption,
  color: COLORS.textSecondary,
  fontSize: 10,
  marginBottom: 2,
},
metricValue: {
  ...TEXT_STYLES.body2,
  color: COLORS.text,
  fontWeight: 'bold',
  fontSize: 12,
},
performanceIndicator: {
  alignItems: 'center',
},
performanceLabel: {
  ...TEXT_STYLES.caption,
  color: COLORS.textSecondary,
  fontSize: 10,
  marginBottom: 4,
},
performanceCircle: {
  width: 45,
  height: 45,
  borderRadius: 22.5,
  backgroundColor: COLORS.primary,
  justifyContent: 'center',
  alignItems: 'center',
},
performanceValue: {
  ...TEXT_STYLES.caption,
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 11,
},
});

export default PlayerList;