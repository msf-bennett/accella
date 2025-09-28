import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  Dimensions,
} from 'react-native';
import { Card, Avatar, Chip, IconButton, Surface, ProgressBar, FAB, Searchbar } from 'react-native-paper';
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
const PLAYER_CARD_WIDTH = (width - SPACING.xl * 3) / 2;

const TeamOverview = ({ navigation }) => {
  const dispatch = useDispatch();
  const { teams, players, isLoading } = useSelector(state => state.coach);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Mock team and player data - replace with actual Redux data
  const mockTeamsData = {
    teams: [
      {
        id: 'all',
        name: 'All Players',
        playerCount: 24,
        color: COLORS.primary,
      },
      {
        id: '1',
        name: 'Elite Squad',
        playerCount: 8,
        color: COLORS.success,
        sport: 'Football',
        level: 'Advanced',
        avgAge: 16,
        established: '2023',
      },
      {
        id: '2',
        name: 'Rising Stars',
        playerCount: 10,
        color: COLORS.warning,
        sport: 'Football',
        level: 'Intermediate',
        avgAge: 14,
        established: '2024',
      },
      {
        id: '3',
        name: 'Future Champions',
        playerCount: 6,
        color: COLORS.info,
        sport: 'Football',
        level: 'Beginner',
        avgAge: 12,
        established: '2024',
      },
    ],
    players: [
      {
        id: '1',
        name: 'Alex Johnson',
        age: 17,
        position: 'Forward',
        teamId: '1',
        teamName: 'Elite Squad',
        avatar: null,
        rating: 4.8,
        attendanceRate: 92,
        lastSession: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'active',
        skillLevel: 'Advanced',
        joinDate: new Date('2023-08-15'),
        totalSessions: 45,
        achievements: ['Top Scorer', 'Most Improved'],
        parentContact: '+1234567890',
      },
      {
        id: '2',
        name: 'Emma Davis',
        age: 15,
        position: 'Midfielder',
        teamId: '2',
        teamName: 'Rising Stars',
        avatar: null,
        rating: 4.6,
        attendanceRate: 88,
        lastSession: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'active',
        skillLevel: 'Intermediate',
        joinDate: new Date('2024-01-10'),
        totalSessions: 32,
        achievements: ['Team Captain', 'Best Attitude'],
        parentContact: '+1234567891',
      },
      {
        id: '3',
        name: 'Mike Wilson',
        age: 16,
        position: 'Defender',
        teamId: '1',
        teamName: 'Elite Squad',
        avatar: null,
        rating: 4.7,
        attendanceRate: 95,
        lastSession: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'active',
        skillLevel: 'Advanced',
        joinDate: new Date('2023-09-01'),
        totalSessions: 52,
        achievements: ['Best Defender', 'Perfect Attendance'],
        parentContact: '+1234567892',
      },
      {
        id: '4',
        name: 'Sarah Martinez',
        age: 14,
        position: 'Goalkeeper',
        teamId: '2',
        teamName: 'Rising Stars',
        avatar: null,
        rating: 4.5,
        attendanceRate: 85,
        lastSession: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        skillLevel: 'Intermediate',
        joinDate: new Date('2024-02-20'),
        totalSessions: 28,
        achievements: ['Clean Sheets Champion'],
        parentContact: '+1234567893',
      },
      {
        id: '5',
        name: 'Tom Rodriguez',
        age: 13,
        position: 'Forward',
        teamId: '3',
        teamName: 'Future Champions',
        avatar: null,
        rating: 4.3,
        attendanceRate: 78,
        lastSession: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: 'active',
        skillLevel: 'Beginner',
        joinDate: new Date('2024-03-15'),
        totalSessions: 15,
        achievements: ['Rising Talent'],
        parentContact: '+1234567894',
      },
      {
        id: '6',
        name: 'Lisa Chen',
        age: 15,
        position: 'Midfielder',
        teamId: '1',
        teamName: 'Elite Squad',
        avatar: null,
        rating: 4.9,
        attendanceRate: 98,
        lastSession: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'active',
        skillLevel: 'Advanced',
        joinDate: new Date('2023-07-10'),
        totalSessions: 58,
        achievements: ['MVP', 'Leadership Award', 'Technical Excellence'],
        parentContact: '+1234567895',
      },
    ],
  };

  const teamsData = { teams: teams || mockTeamsData.teams, players: players || mockTeamsData.players };
  const currentTeam = teamsData.teams.find(team => team.id === selectedTeam) || teamsData.teams[0];
  
  const filteredPlayers = teamsData.players.filter(player => {
    const matchesTeam = selectedTeam === 'all' || player.teamId === selectedTeam;
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          player.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return COLORS.success;
    if (rate >= 75) return COLORS.warning;
    return COLORS.error;
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'Advanced': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Beginner': return COLORS.info;
      default: return COLORS.textSecondary;
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
      Alert.alert('🔄 Updated!', 'Team data refreshed successfully');
    }, 1500);
  }, []);

  const handlePlayerPress = (player) => {
    Vibration.vibrate(50);
    Alert.alert(
      '👤 Feature Coming Soon',
      `Detailed player profile for ${player.name} will be available soon. You'll be able to view stats, manage sessions, and track progress!`,
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  const handleTeamPress = (team) => {
    setSelectedTeam(team.id);
    Vibration.vibrate(30);
  };

  const handleAddPlayer = () => {
    Vibration.vibrate(50);
    Alert.alert(
      '➕ Feature Coming Soon',
      'Add new player functionality will be available soon. You\'ll be able to invite players, set up profiles, and assign them to teams!',
      [{ text: 'Great!', style: 'default' }]
    );
  };

  const handleManageTeams = () => {
    Vibration.vibrate(50);
    Alert.alert(
      '⚙️ Feature Coming Soon',
      'Team management tools will be available soon. Create teams, manage rosters, and organize training groups!',
      [{ text: 'Perfect!', style: 'default' }]
    );
  };

  const renderTeamSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      style={{ marginBottom: SPACING.md }}
    >
      {teamsData.teams.map((team) => (
        <TouchableOpacity
          key={team.id}
          onPress={() => handleTeamPress(team)}
          style={{ marginRight: SPACING.sm }}
        >
          <Chip
            selected={selectedTeam === team.id}
            mode={selectedTeam === team.id ? 'flat' : 'outlined'}
            textStyle={{
              color: selectedTeam === team.id ? 'white' : team.color,
              fontWeight: selectedTeam === team.id ? 'bold' : '500',
              fontSize: 12,
            }}
            style={{
              backgroundColor: selectedTeam === team.id ? team.color : 'transparent',
              borderColor: team.color,
            }}
            icon={() => (
              <Icon
                name="group"
                size={16}
                color={selectedTeam === team.id ? 'white' : team.color}
              />
            )}
          >
            {team.name} ({team.playerCount})
          </Chip>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPlayerCard = (player, index) => {
    const animationDelay = index * 50;

    return (
      <Animated.View
        key={player.id}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: SPACING.md,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handlePlayerPress(player)}
        >
          <Card
            style={{
              width: viewMode === 'grid' ? PLAYER_CARD_WIDTH : '100%',
              marginHorizontal: viewMode === 'grid' ? SPACING.xs : 0,
              borderRadius: 16,
              elevation: 4,
              backgroundColor: COLORS.surface,
            }}
          >
            <View style={{ padding: SPACING.md }}>
              {/* Player Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Avatar.Text
                  size={viewMode === 'grid' ? 40 : 50}
                  label={player.name.substring(0, 2)}
                  style={{ 
                    backgroundColor: teamsData.teams.find(t => t.id === player.teamId)?.color || COLORS.primary,
                    marginRight: SPACING.sm 
                  }}
                  labelStyle={{ fontSize: viewMode === 'grid' ? 14 : 16, fontWeight: 'bold', color: 'white' }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      TEXT_STYLES.subtitle2,
                      { color: COLORS.text, fontWeight: '600', marginBottom: 2 }
                    ]}
                    numberOfLines={1}
                  >
                    {player.name}
                  </Text>
                  <Text
                    style={[
                      TEXT_STYLES.caption,
                      { color: COLORS.textSecondary }
                    ]}
                  >
                    {player.position} • Age {player.age}
                  </Text>
                </View>
                {viewMode === 'list' && (
                  <Surface
                    style={{
                      backgroundColor: getSkillLevelColor(player.skillLevel),
                      borderRadius: 12,
                      paddingHorizontal: SPACING.xs,
                      paddingVertical: 2,
                      elevation: 1,
                    }}
                  >
                    <Text
                      style={[
                        TEXT_STYLES.caption,
                        { color: 'white', fontWeight: '600', fontSize: 10 }
                      ]}
                    >
                      {player.skillLevel}
                    </Text>
                  </Surface>
                )}
              </View>

              {/* Stats Row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Icon name="star" size={14} color={COLORS.warning} />
                    <Text
                      style={[
                        TEXT_STYLES.caption,
                        { color: COLORS.text, fontWeight: '600', marginLeft: 2 }
                      ]}
                    >
                      {player.rating}
                    </Text>
                  </View>
                  <Text
                    style={[
                      TEXT_STYLES.caption,
                      { color: COLORS.textSecondary, fontSize: 10 }
                    ]}
                  >
                    Rating
                  </Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text
                    style={[
                      TEXT_STYLES.caption,
                      { color: getAttendanceColor(player.attendanceRate), fontWeight: '600' }
                    ]}
                  >
                    {player.attendanceRate}%
                  </Text>
                  <Text
                    style={[
                      TEXT_STYLES.caption,
                      { color: COLORS.textSecondary, fontSize: 10 }
                    ]}
                  >
                    Attendance
                  </Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text
                    style={[
                      TEXT_STYLES.caption,
                      { color: COLORS.text, fontWeight: '600' }
                    ]}
                  >
                    {player.totalSessions}
                  </Text>
                  <Text
                    style={[
                      TEXT_STYLES.caption,
                      { color: COLORS.textSecondary, fontSize: 10 }
                    ]}
                  >
                    Sessions
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={{ marginBottom: SPACING.sm }}>
                <Text
                  style={[
                    TEXT_STYLES.caption,
                    { color: COLORS.textSecondary, marginBottom: 4 }
                  ]}
                >
                  Progress
                </Text>
                <ProgressBar
                  progress={player.attendanceRate / 100}
                  color={getAttendanceColor(player.attendanceRate)}
                  style={{ height: 4, borderRadius: 2, backgroundColor: COLORS.border }}
                />
              </View>

              {/* Footer */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text
                  style={[
                    TEXT_STYLES.caption,
                    { color: COLORS.textSecondary }
                  ]}
                >
                  Last: {formatDate(player.lastSession)}
                </Text>
                {viewMode === 'grid' && (
                  <Chip
                    mode="flat"
                    compact
                    textStyle={{ 
                      fontSize: 9, 
                      color: getSkillLevelColor(player.skillLevel),
                      fontWeight: '600'
                    }}
                    style={{
                      backgroundColor: `${getSkillLevelColor(player.skillLevel)}20`,
                      height: 18,
                    }}
                  >
                    {player.skillLevel.toUpperCase()}
                  </Chip>
                )}
              </View>

              {/* Achievements (List view only) */}
              {viewMode === 'list' && player.achievements.length > 0 && (
                <View style={{ marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border }}>
                  <Text
                    style={[
                      TEXT_STYLES.caption,
                      { color: COLORS.textSecondary, marginBottom: 4, fontWeight: '600' }
                    ]}
                  >
                    Achievements:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {player.achievements.map((achievement, idx) => (
                      <Chip
                        key={idx}
                        mode="outlined"
                        compact
                        textStyle={{ fontSize: 9, color: COLORS.warning }}
                        style={{
                          borderColor: COLORS.warning,
                          backgroundColor: 'transparent',
                          height: 20,
                          marginRight: 4,
                          marginBottom: 4,
                        }}
                        icon={() => <Icon name="jump-rope" size={10} color={COLORS.warning} />}
                      >
                        {achievement}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Section Header */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          marginTop: SPACING.sm,
        }}
      >
        <Text style={[TEXT_STYLES.h6, { color: COLORS.text, fontWeight: 'bold' }]}>
          Team Overview 👥
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
            size={20}
            iconColor={COLORS.primary}
            onPress={() => {
              setViewMode(viewMode === 'grid' ? 'list' : 'grid');
              Vibration.vibrate(30);
            }}
          />
          <IconButton
            icon="settings"
            size={20}
            iconColor={COLORS.textSecondary}
            onPress={handleManageTeams}
          />
        </View>
      </Animated.View>

      {/* Team Selector */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {renderTeamSelector()}
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          paddingHorizontal: SPACING.md,
          marginBottom: SPACING.md,
        }}
      >
        <Searchbar
          placeholder="Search players..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            backgroundColor: COLORS.surface,
            elevation: 2,
            borderRadius: 12,
          }}
          inputStyle={{ fontSize: 14 }}
          iconColor={COLORS.primary}
        />
      </Animated.View>

      {/* Players List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Pull to refresh team data..."
            titleColor={COLORS.textSecondary}
          />
        }
        contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: 100 }}
      >
        {filteredPlayers.length > 0 ? (
          <View style={{ 
            flexDirection: viewMode === 'grid' ? 'row' : 'column',
            flexWrap: viewMode === 'grid' ? 'wrap' : 'nowrap',
            justifyContent: viewMode === 'grid' ? 'space-between' : 'flex-start',
          }}>
            {filteredPlayers.map((player, index) => renderPlayerCard(player, index))}
          </View>
        ) : (
          <Surface
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              padding: SPACING.xl,
              alignItems: 'center',
              elevation: 2,
              marginTop: SPACING.lg,
            }}
          >
            <Icon
              name="group"
              size={48}
              color={COLORS.textSecondary}
              style={{ marginBottom: SPACING.md }}
            />
            <Text
              style={[
                TEXT_STYLES.subtitle1,
                { color: COLORS.text, fontWeight: '600', textAlign: 'center', marginBottom: SPACING.sm }
              ]}
            >
              {searchQuery ? 'No Players Found' : 'No Players Yet'}
            </Text>
            <Text
              style={[
                TEXT_STYLES.body2,
                { color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }
              ]}
            >
              {searchQuery 
                ? 'Try adjusting your search terms or filters.'
                : 'Start building your team by adding players to get started with training!'
              }
            </Text>
          </Surface>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="person-add"
        label="Add Player"
        onPress={handleAddPlayer}
        style={{
          position: 'absolute',
          bottom: SPACING.lg,
          right: SPACING.md,
          backgroundColor: COLORS.primary,
        }}
        color="white"
      />
    </View>
  );
};

export default TeamOverview;