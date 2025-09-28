import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  Vibration,
  FlatList,
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
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/styles';

const { width } = Dimensions.get('window');

const TeamRoster = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { currentTeam, teamMembers, teamStats } = useSelector(state => state.teams);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'group' },
    { key: 'players', label: 'Players', icon: 'sports-soccer' },
    { key: 'coaches', label: 'Coaches', icon: 'sports' },
    { key: 'active', label: 'Active', icon: 'check-circle' },
    { key: 'injured', label: 'Injured', icon: 'local-hospital' },
  ];

  useEffect(() => {
    loadTeamRoster();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadTeamRoster = useCallback(async () => {
    try {
      // dispatch(loadTeamMembers(currentTeam.id));
    } catch (error) {
      console.error('Error loading team roster:', error);
      Alert.alert('Error', 'Failed to load team roster');
    }
  }, [dispatch, currentTeam]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTeamRoster();
    setRefreshing(false);
  }, [loadTeamRoster]);

  const handlePlayerPress = (player) => {
    Vibration.vibrate(50);
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  const handleMessagePlayer = (player) => {
    navigation.navigate('TeamMessages', { 
      conversationType: 'direct',
      targetUser: player 
    });
    setShowPlayerModal(false);
  };

  const handleViewPlayerProfile = (player) => {
    navigation.navigate('PlayerProfile', { playerId: player.id });
    setShowPlayerModal(false);
  };

  const handleAddPlayer = () => {
    if (user.role === 'coach' || user.role === 'admin') {
      setShowAddPlayerModal(true);
    } else {
      Alert.alert(
        "Access Restricted", 
        "Only coaches can add new players to the team."
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'injured':
        return COLORS.error;
      case 'inactive':
        return COLORS.textSecondary;
      default:
        return COLORS.primary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return 'check-circle';
      case 'injured':
        return 'local-hospital';
      case 'inactive':
        return 'pause-circle';
      default:
        return 'help-circle';
    }
  };

  // Mock team data
  const mockTeamMembers = [
    {
      id: 1,
      name: "Alex Johnson",
      position: "Forward",
      jerseyNumber: 10,
      avatar: "https://via.placeholder.com/100",
      status: "active",
      role: "player",
      age: 22,
      height: "5'11\"",
      weight: "165 lbs",
      joinDate: "2024-01-15",
      goals: 12,
      assists: 8,
      attendance: 95,
      rating: 4.5,
      isCapitain: true,
    },
    {
      id: 2,
      name: "Coach Martinez",
      position: "Head Coach",
      jerseyNumber: null,
      avatar: "https://via.placeholder.com/100",
      status: "active",
      role: "coach",
      age: 45,
      experience: "15 years",
      joinDate: "2023-08-01",
      certifications: ["UEFA A", "Sports Science"],
      rating: 4.8,
    },
    {
      id: 3,
      name: "Sarah Chen",
      position: "Midfielder",
      jerseyNumber: 7,
      avatar: "https://via.placeholder.com/100",
      status: "injured",
      role: "player",
      age: 20,
      height: "5'6\"",
      weight: "130 lbs",
      joinDate: "2024-02-01",
      goals: 5,
      assists: 15,
      attendance: 88,
      rating: 4.3,
      injuryStatus: "Ankle sprain - 2 weeks",
    },
    {
      id: 4,
      name: "Mike Wilson",
      position: "Goalkeeper",
      jerseyNumber: 1,
      avatar: "https://via.placeholder.com/100",
      status: "active",
      role: "player",
      age: 24,
      height: "6'2\"",
      weight: "180 lbs",
      joinDate: "2023-12-01",
      saves: 45,
      cleanSheets: 8,
      attendance: 100,
      rating: 4.6,
    },
    {
      id: 5,
      name: "Emma Rodriguez",
      position: "Defender",
      jerseyNumber: 4,
      avatar: "https://via.placeholder.com/100",
      status: "active",
      role: "player",
      age: 21,
      height: "5'8\"",
      weight: "145 lbs",
      joinDate: "2024-01-30",
      goals: 2,
      assists: 4,
      attendance: 92,
      rating: 4.2,
    },
  ];

  const filteredMembers = mockTeamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (selectedFilter) {
      case 'players':
        return matchesSearch && member.role === 'player';
      case 'coaches':
        return matchesSearch && member.role === 'coach';
      case 'active':
        return matchesSearch && member.status === 'active';
      case 'injured':
        return matchesSearch && member.status === 'injured';
      default:
        return matchesSearch;
    }
  });

  const renderPlayerCard = ({ item }) => (
    <Animated.View
      style={[
        styles.playerCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => handlePlayerPress(item)}
        style={styles.playerTouchable}
        activeOpacity={0.7}
      >
        <Surface style={styles.playerSurface}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
            style={styles.playerGradient}
          >
            <View style={styles.playerHeader}>
              <View style={styles.avatarContainer}>
                <Avatar.Image
                  size={60}
                  source={{ uri: item.avatar }}
                  style={styles.playerAvatar}
                />
                {item.jerseyNumber && (
                  <Surface style={styles.jerseyBadge}>
                    <Text style={styles.jerseyNumber}>
                      {item.jerseyNumber}
                    </Text>
                  </Surface>
                )}
                {item.isCapitain && (
                  <Surface style={styles.captainBadge}>
                    <Icon name="star" size={14} color={COLORS.warning} />
                  </Surface>
                )}
              </View>
              
              <View style={styles.statusContainer}>
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
                  textStyle={{ color: getStatusColor(item.status) }}
                  icon={getStatusIcon(item.status)}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Chip>
              </View>
            </View>
            
            <View style={styles.playerInfo}>
              <Text style={styles.playerName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.playerPosition}>
                {item.position}
              </Text>
              
              {item.injuryStatus && (
                <Text style={styles.injuryStatus}>
                  🏥 {item.injuryStatus}
                </Text>
              )}
            </View>
            
            <View style={styles.playerStats}>
              {item.role === 'player' && (
                <>
                  {item.position === 'Goalkeeper' ? (
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{item.saves || 0}</Text>
                        <Text style={styles.statLabel}>Saves</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{item.cleanSheets || 0}</Text>
                        <Text style={styles.statLabel}>Clean Sheets</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{item.goals || 0}</Text>
                        <Text style={styles.statLabel}>Goals</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{item.assists || 0}</Text>
                        <Text style={styles.statLabel}>Assists</Text>
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.attendanceRow}>
                    <Text style={styles.attendanceLabel}>Attendance</Text>
                    <Text style={styles.attendanceValue}>{item.attendance}%</Text>
                  </View>
                  <ProgressBar
                    progress={item.attendance / 100}
                    color={COLORS.success}
                    style={styles.attendanceBar}
                  />
                </>
              )}
              
              {item.role === 'coach' && (
                <View style={styles.coachInfo}>
                  <Text style={styles.experienceText}>
                    📚 {item.experience}
                  </Text>
                  {item.certifications && (
                    <View style={styles.certificationRow}>
                      {item.certifications.map((cert, index) => (
                        <Chip
                          key={index}
                          mode="outlined"
                          compact
                          style={styles.certChip}
                        >
                          {cert}
                        </Chip>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
            
            <View style={styles.ratingRow}>
              <Icon name="star" size={16} color={COLORS.warning} />
              <Text style={styles.ratingText}>
                {item.rating} Rating
              </Text>
            </View>
          </LinearGradient>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPlayerModal = () => (
    <Portal>
      <Modal
        visible={showPlayerModal}
        onDismiss={() => setShowPlayerModal(false)}
        contentContainerStyle={styles.playerModal}
      >
        <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            {selectedPlayer && (
              <>
                {/* Modal Header */}
                <LinearGradient
                  colors={[COLORS.primary, '#764ba2']}
                  style={styles.modalHeader}
                >
                  <View style={styles.modalHeaderContent}>
                    <Avatar.Image
                      size={80}
                      source={{ uri: selectedPlayer.avatar }}
                      style={styles.modalAvatar}
                    />
                    <View style={styles.modalPlayerInfo}>
                      <Text style={styles.modalPlayerName}>
                        {selectedPlayer.name}
                      </Text>
                      <Text style={styles.modalPlayerPosition}>
                        {selectedPlayer.position}
                      </Text>
                      {selectedPlayer.jerseyNumber && (
                        <Text style={styles.modalJerseyNumber}>
                          #{selectedPlayer.jerseyNumber}
                        </Text>
                      )}
                    </View>
                    <IconButton
                      icon="close"
                      iconColor="white"
                      size={24}
                      onPress={() => setShowPlayerModal(false)}
                    />
                  </View>
                </LinearGradient>

                {/* Player Details */}
                <ScrollView style={styles.modalScrollView}>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Player Info</Text>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Age</Text>
                        <Text style={styles.infoValue}>{selectedPlayer.age}</Text>
                      </View>
                      {selectedPlayer.height && (
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Height</Text>
                          <Text style={styles.infoValue}>{selectedPlayer.height}</Text>
                        </View>
                      )}
                      {selectedPlayer.weight && (
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Weight</Text>
                          <Text style={styles.infoValue}>{selectedPlayer.weight}</Text>
                        </View>
                      )}
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Joined</Text>
                        <Text style={styles.infoValue}>
                          {new Date(selectedPlayer.joinDate).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {selectedPlayer.role === 'player' && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionTitle}>Performance</Text>
                      <View style={styles.performanceGrid}>
                        {selectedPlayer.position === 'Goalkeeper' ? (
                          <>
                            <Surface style={styles.performanceCard}>
                              <Text style={styles.performanceValue}>
                                {selectedPlayer.saves}
                              </Text>
                              <Text style={styles.performanceLabel}>Saves</Text>
                            </Surface>
                            <Surface style={styles.performanceCard}>
                              <Text style={styles.performanceValue}>
                                {selectedPlayer.cleanSheets}
                              </Text>
                              <Text style={styles.performanceLabel}>Clean Sheets</Text>
                            </Surface>
                          </>
                        ) : (
                          <>
                            <Surface style={styles.performanceCard}>
                              <Text style={styles.performanceValue}>
                                {selectedPlayer.goals}
                              </Text>
                              <Text style={styles.performanceLabel}>Goals</Text>
                            </Surface>
                            <Surface style={styles.performanceCard}>
                              <Text style={styles.performanceValue}>
                                {selectedPlayer.assists}
                              </Text>
                              <Text style={styles.performanceLabel}>Assists</Text>
                            </Surface>
                          </>
                        )}
                        <Surface style={styles.performanceCard}>
                          <Text style={styles.performanceValue}>
                            {selectedPlayer.attendance}%
                          </Text>
                          <Text style={styles.performanceLabel}>Attendance</Text>
                        </Surface>
                        <Surface style={styles.performanceCard}>
                          <Text style={styles.performanceValue}>
                            ⭐ {selectedPlayer.rating}
                          </Text>
                          <Text style={styles.performanceLabel}>Rating</Text>
                        </Surface>
                      </View>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <Button
                      mode="contained"
                      onPress={() => handleViewPlayerProfile(selectedPlayer)}
                      style={styles.actionButton}
                      icon="account"
                    >
                      View Profile
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => handleMessagePlayer(selectedPlayer)}
                      style={styles.actionButton}
                      icon="message"
                    >
                      Message
                    </Button>
                  </View>
                </ScrollView>
              </>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Team Roster</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
              iconColor="white"
              size={24}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            />
            <IconButton
              icon="filter-list"
              iconColor="white"
              size={24}
              onPress={() => {
                Alert.alert('Filters', 'Feature coming soon!');
              }}
            />
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search team members..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
        </View>
      </LinearGradient>

      {/* Team Stats */}
      <Surface style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="group" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{mockTeamMembers.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="sports-soccer" size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>
              {mockTeamMembers.filter(m => m.role === 'player').length}
            </Text>
            <Text style={styles.statLabel}>Players</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="sports" size={24} color={COLORS.secondary} />
            <Text style={styles.statNumber}>
              {mockTeamMembers.filter(m => m.role === 'coach').length}
            </Text>
            <Text style={styles.statLabel}>Coaches</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="local-hospital" size={24} color={COLORS.error} />
            <Text style={styles.statNumber}>
              {mockTeamMembers.filter(m => m.status === 'injured').length}
            </Text>
            <Text style={styles.statLabel}>Injured</Text>
          </View>
        </View>
      </Surface>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <Chip
            key={option.key}
            mode={selectedFilter === option.key ? 'flat' : 'outlined'}
            selected={selectedFilter === option.key}
            onPress={() => setSelectedFilter(option.key)}
            style={[
              styles.filterChip,
              selectedFilter === option.key && styles.selectedFilterChip,
            ]}
            icon={option.icon}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Team Members List */}
      <FlatList
        data={filteredMembers}
        renderItem={renderPlayerCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={styles.membersList}
        columnWrapperStyle={viewMode === 'grid' ? styles.row : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB for Add Player */}
      {(user.role === 'coach' || user.role === 'admin') && (
        <FAB
          icon="person-add"
          style={styles.fab}
          onPress={handleAddPlayer}
          color="white"
        />
      )}

      {/* Player Detail Modal */}
      {renderPlayerModal()}
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.header,
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchContainer: {
    marginTop: SPACING.sm,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 0,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  statsContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  filterContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginHorizontal: SPACING.xs,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  membersList: {
    padding: SPACING.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  playerCard: {
    flex: 1,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.xs,
  },
  playerTouchable: {
    borderRadius: 16,
  },
  playerSurface: {
    borderRadius: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  playerGradient: {
    padding: SPACING.md,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  playerAvatar: {
    backgroundColor: COLORS.primary,
  },
  jerseyBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  jerseyNumber: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  captainBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 28,
  },
  playerInfo: {
    marginBottom: SPACING.sm,
  },
  playerName: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
  },
  playerPosition: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  injuryStatus: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    fontStyle: 'italic',
  },
  playerStats: {
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    textAlign: 'center',
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  attendanceLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  attendanceValue: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  attendanceBar: {
    height: 4,
    borderRadius: 2,
  },
  coachInfo: {
    alignItems: 'center',
  },
  experienceText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  certificationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  certChip: {
    margin: SPACING.xs,
    height: 24,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  playerModal: {
    flex: 1,
    margin: 0,
  },
  blurContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modalHeader: {
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  modalAvatar: {
    backgroundColor: COLORS.secondary,
    marginRight: SPACING.md,
  },
  modalPlayerInfo: {
    flex: 1,
  },
  modalPlayerName: {
    ...TEXT_STYLES.h2,
    color: 'white',
  },
  modalPlayerPosition: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  modalJerseyNumber: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  modalScrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceCard: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 1,
    marginBottom: SPACING.sm,
  },
  performanceValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
  },
  performanceLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});

export default TeamRoster;