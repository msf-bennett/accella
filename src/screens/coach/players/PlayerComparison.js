import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  Searchbar,
  Badge,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#E91E63',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
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
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySmall: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const PlayerComparison = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth?.user);
  const playerStats = useSelector(state => state.player?.stats || {});
  const isLoading = useSelector(state => state.player?.isLoading || false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [comparisonMode, setComparisonMode] = useState('vs'); // 'vs' or 'leaderboard'

  // Mock data for development
  const currentPlayer = {
    id: 'current',
    name: 'You',
    position: 'Midfielder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    level: 12,
    xp: 2450,
    nextLevelXp: 3000,
    rank: 3,
    totalPlayers: 24,
    badges: ['🏆', '⚽', '🎯', '💪'],
  };

  const mockPlayers = [
    {
      id: '1',
      name: 'Alex Rodriguez',
      position: 'Forward',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      level: 15,
      xp: 3200,
      rank: 1,
      badges: ['👑', '⚽', '🔥', '💪', '🎯'],
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      position: 'Defender',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150',
      level: 13,
      xp: 2800,
      rank: 2,
      badges: ['🛡️', '⚽', '💪', '🎯'],
    },
    {
      id: '3',
      name: 'Mike Chen',
      position: 'Goalkeeper',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      level: 11,
      xp: 2200,
      rank: 4,
      badges: ['🧤', '⚽', '🎯'],
    },
    {
      id: '4',
      name: 'Emma Davis',
      position: 'Midfielder',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      level: 10,
      xp: 2000,
      rank: 5,
      badges: ['⚽', '💪', '🎯'],
    },
  ];

  const performanceCategories = [
    { 
      key: 'overall', 
      label: 'Overall', 
      icon: 'dashboard',
      metrics: ['Level', 'XP Points', 'Team Rank', 'Badges Earned']
    },
    { 
      key: 'fitness', 
      label: 'Fitness', 
      icon: 'fitness-center',
      metrics: ['Endurance', 'Speed', 'Strength', 'Agility']
    },
    { 
      key: 'technical', 
      label: 'Technical', 
      icon: 'sports-soccer',
      metrics: ['Ball Control', 'Passing', 'Shooting', 'First Touch']
    },
    { 
      key: 'mental', 
      label: 'Mental', 
      icon: 'psychology',
      metrics: ['Focus', 'Decision Making', 'Pressure Handling', 'Leadership']
    },
  ];

  const timeframeOptions = [
    { key: 'week', label: 'This Week', icon: 'today' },
    { key: 'month', label: 'This Month', icon: 'date-range' },
    { key: 'season', label: 'This Season', icon: 'event' },
    { key: 'all', label: 'All Time', icon: 'history' },
  ];

  const mockStats = {
    overall: {
      you: { level: 12, xp: 2450, rank: 3, badges: 4 },
      alex: { level: 15, xp: 3200, rank: 1, badges: 5 },
      sarah: { level: 13, xp: 2800, rank: 2, badges: 4 },
    },
    fitness: {
      you: { endurance: 85, speed: 78, strength: 82, agility: 80 },
      alex: { endurance: 92, speed: 88, strength: 85, agility: 90 },
      sarah: { endurance: 88, speed: 75, strength: 90, agility: 85 },
    },
    technical: {
      you: { ballControl: 82, passing: 85, shooting: 75, firstTouch: 80 },
      alex: { ballControl: 90, passing: 88, shooting: 95, firstTouch: 92 },
      sarah: { ballControl: 85, passing: 90, shooting: 70, firstTouch: 85 },
    },
    mental: {
      you: { focus: 80, decisionMaking: 85, pressureHandling: 78, leadership: 75 },
      alex: { focus: 90, decisionMaking: 92, pressureHandling: 88, leadership: 85 },
      sarah: { focus: 85, decisionMaking: 88, pressureHandling: 90, leadership: 92 },
    },
  };

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Stats Updated! 📊', 'Latest performance data loaded successfully!', [
        { text: 'Awesome! 🎉', style: 'default' },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh player comparison data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handlePlayerSelect = useCallback((player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(prev => prev.filter(p => p.id !== player.id));
    } else if (selectedPlayers.length < 3) {
      setSelectedPlayers(prev => [...prev, player]);
      Vibration.vibrate(50);
    } else {
      Alert.alert('Limit Reached', 'You can compare with up to 3 players at once! 📊');
    }
  }, [selectedPlayers]);

  const handleCompare = useCallback(() => {
    if (selectedPlayers.length === 0) {
      Alert.alert('Select Players', 'Choose at least one player to compare with! 👥');
      return;
    }
    
    navigation.navigate('DetailedComparison', {
      players: [currentPlayer, ...selectedPlayers],
      category: selectedCategory,
      timeframe: selectedTimeframe,
    });
  }, [selectedPlayers, selectedCategory, selectedTimeframe, navigation]);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return COLORS.gold;
      case 2: return COLORS.silver;
      case 3: return COLORS.bronze;
      default: return COLORS.primary;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.lg,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={[TEXT_STYLES.h2, { color: '#fff' }]}>
            Player Comparison 📊
          </Text>
          <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
            Compare your progress with teammates
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            Your Rank
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={[TEXT_STYLES.h3, { color: '#fff', marginRight: 4 }]}>
              #{currentPlayer.rank}
            </Text>
            <Text style={{ fontSize: 20 }}>
              {getRankIcon(currentPlayer.rank)}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderPlayerRankCard = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <Card style={{
        marginHorizontal: SPACING.md,
        marginTop: SPACING.md,
        elevation: 4,
        borderRadius: 16,
        backgroundColor: COLORS.surface,
      }}>
        <LinearGradient
          colors={[getRankColor(currentPlayer.rank), getRankColor(currentPlayer.rank) + '80']}
          style={{
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: SPACING.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar.Image
                size={60}
                source={{ uri: currentPlayer.avatar }}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
              <View style={{ marginLeft: SPACING.md }}>
                <Text style={[TEXT_STYLES.h3, { color: '#fff' }]}>
                  {currentPlayer.name} (You)
                </Text>
                <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.9)' }]}>
                  {currentPlayer.position} • Level {currentPlayer.level}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                  {currentPlayer.badges.map((badge, index) => (
                    <Text key={index} style={{ fontSize: 16, marginRight: 4 }}>
                      {badge}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h2, { color: '#fff' }]}>
                #{currentPlayer.rank}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                of {currentPlayer.totalPlayers}
              </Text>
            </View>
          </View>
        </LinearGradient>
        
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            <Text style={TEXT_STYLES.bodySmall}>Progress to Level {currentPlayer.level + 1}</Text>
            <Text style={TEXT_STYLES.bodySmall}>
              {currentPlayer.xp} / {currentPlayer.nextLevelXp} XP
            </Text>
          </View>
          <ProgressBar
            progress={currentPlayer.xp / currentPlayer.nextLevelXp}
            color={COLORS.primary}
            style={{ height: 8, borderRadius: 4 }}
          />
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
            {currentPlayer.nextLevelXp - currentPlayer.xp} XP to next level! 🚀
          </Text>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderCategoryFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
      }}
    >
      {performanceCategories.map((category) => (
        <Chip
          key={category.key}
          selected={selectedCategory === category.key}
          onPress={() => {
            setSelectedCategory(category.key);
            Vibration.vibrate(30);
          }}
          icon={category.icon}
          style={{
            marginRight: SPACING.sm,
            backgroundColor: selectedCategory === category.key ? COLORS.primary : COLORS.surface,
          }}
          textStyle={{
            color: selectedCategory === category.key ? '#fff' : COLORS.text,
            fontWeight: selectedCategory === category.key ? '600' : 'normal',
          }}
        >
          {category.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderTimeframeFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
      }}
    >
      {timeframeOptions.map((option) => (
        <Chip
          key={option.key}
          selected={selectedTimeframe === option.key}
          onPress={() => {
            setSelectedTimeframe(option.key);
            Vibration.vibrate(30);
          }}
          icon={option.icon}
          style={{
            marginRight: SPACING.sm,
            backgroundColor: selectedTimeframe === option.key ? COLORS.accent : COLORS.surface,
          }}
          textStyle={{
            color: selectedTimeframe === option.key ? '#fff' : COLORS.text,
          }}
        >
          {option.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderPlayerCard = ({ item, index }) => {
    const isSelected = selectedPlayers.find(p => p.id === item.id);
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <TouchableOpacity
          onPress={() => handlePlayerSelect(item)}
          activeOpacity={0.7}
          style={{ marginBottom: SPACING.sm }}
        >
          <Card style={{
            marginHorizontal: SPACING.md,
            elevation: isSelected ? 6 : 3,
            borderRadius: 12,
            backgroundColor: isSelected ? '#f0f8ff' : COLORS.surface,
            borderWidth: isSelected ? 2 : 0,
            borderColor: COLORS.primary,
          }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ position: 'relative' }}>
                    <Avatar.Image
                      size={50}
                      source={{ uri: item.avatar }}
                      style={{ backgroundColor: COLORS.primary }}
                    />
                    <View style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: getRankColor(item.rank),
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                        {item.rank}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Text style={[TEXT_STYLES.h3, { fontSize: 16 }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[TEXT_STYLES.bodySmall, { marginTop: 2 }]}>
                      {item.position} • Level {item.level}
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 4 }}>
                      {item.badges.slice(0, 4).map((badge, badgeIndex) => (
                        <Text key={badgeIndex} style={{ fontSize: 14, marginRight: 2 }}>
                          {badge}
                        </Text>
                      ))}
                      {item.badges.length > 4 && (
                        <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                          +{item.badges.length - 4}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[TEXT_STYLES.h3, { fontSize: 16, color: COLORS.primary }]}>
                    {item.xp} XP
                  </Text>
                  <Text style={[TEXT_STYLES.caption]}>
                    {getRankIcon(item.rank)} Rank #{item.rank}
                  </Text>
                  {isSelected && (
                    <Icon 
                      name="check-circle" 
                      size={20} 
                      color={COLORS.success} 
                      style={{ marginTop: 4 }}
                    />
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderQuickStats = () => {
    const currentStats = mockStats[selectedCategory];
    if (!currentStats) return null;

    return (
      <Card style={{
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        elevation: 3,
        borderRadius: 12,
      }}>
        <Card.Content style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Quick Stats Comparison 📈
          </Text>
          
          {selectedPlayers.length > 0 ? (
            <View>
              {Object.keys(currentStats.you).map((metric) => (
                <View key={metric} style={{ marginBottom: SPACING.md }}>
                  <Text style={[TEXT_STYLES.bodySmall, { marginBottom: SPACING.xs }]}>
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[TEXT_STYLES.caption, { width: 40 }]}>You</Text>
                    <ProgressBar
                      progress={currentStats.you[metric] / 100}
                      color={COLORS.primary}
                      style={{ flex: 1, height: 6, marginHorizontal: SPACING.sm }}
                    />
                    <Text style={[TEXT_STYLES.caption, { width: 30, textAlign: 'right' }]}>
                      {currentStats.you[metric]}
                    </Text>
                  </View>
                  
                  {selectedPlayers.slice(0, 1).map((player) => {
                    const playerKey = player.name.toLowerCase().split(' ')[0];
                    const playerStat = currentStats[playerKey] ? currentStats[playerKey][metric] : 0;
                    
                    return (
                      <View key={player.id} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Text style={[TEXT_STYLES.caption, { width: 40 }]} numberOfLines={1}>
                          {player.name.split(' ')[0]}
                        </Text>
                        <ProgressBar
                          progress={playerStat / 100}
                          color={COLORS.accent}
                          style={{ flex: 1, height: 6, marginHorizontal: SPACING.sm }}
                        />
                        <Text style={[TEXT_STYLES.caption, { width: 30, textAlign: 'right' }]}>
                          {playerStat}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : (
            <Text style={[TEXT_STYLES.bodySmall, { textAlign: 'center', fontStyle: 'italic' }]}>
              Select players below to see comparison stats! 👇
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  const filteredPlayers = mockPlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {renderHeader()}
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderPlayerRankCard()}
        
        <Text style={[TEXT_STYLES.h3, { 
          marginHorizontal: SPACING.md, 
          marginTop: SPACING.lg, 
          marginBottom: SPACING.sm 
        }]}>
          Performance Category 🎯
        </Text>
        {renderCategoryFilters()}
        
        <Text style={[TEXT_STYLES.h3, { 
          marginHorizontal: SPACING.md, 
          marginBottom: SPACING.sm 
        }]}>
          Time Period ⏰
        </Text>
        {renderTimeframeFilters()}

        {renderQuickStats()}

        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm }}>
          <Searchbar
            placeholder="Search teammates..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            icon="search"
            clearIcon="close"
            style={{
              backgroundColor: COLORS.surface,
              elevation: 2,
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: SPACING.sm }}>
          <Text style={TEXT_STYLES.h3}>
            Select Teammates 👥
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: selectedPlayers.length >= 3 ? COLORS.error : COLORS.textSecondary }]}>
            {selectedPlayers.length}/3 selected
          </Text>
        </View>

        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayerCard}
          scrollEnabled={false}
          contentContainerStyle={{
            paddingBottom: 100,
          }}
        />
      </ScrollView>

      {/* Compare FAB */}
      {selectedPlayers.length > 0 && (
        <FAB
          icon="compare-arrows"
          label={`Compare (${selectedPlayers.length})`}
          style={{
            position: 'absolute',
            margin: SPACING.md,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.success,
          }}
          onPress={handleCompare}
          color="#fff"
        />
      )}
    </View>
  );
};

export default PlayerComparison;