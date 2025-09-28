import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
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
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, BarChart, PieChart } from 'recharts';

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
  textLight: '#666666',
  accent: '#FF6B6B',
  sleep: '#4A90E2',
  deepSleep: '#2E5BBA',
  remSleep: '#6A4C93',
  lightSleep: '#87CEEB',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textLight,
  },
};

const { width } = Dimensions.get('window');

const SleepTracking = ({ navigation }) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const sleepData = useSelector(state => state.sleep.data || []);

  // Mock sleep data for demonstration
  const [clientSleepData, setClientSleepData] = useState([
    {
      id: '1',
      name: 'Alex Johnson',
      avatar: 'AJ',
      avgSleepHours: 7.2,
      sleepScore: 82,
      trend: 'improving',
      lastSync: '2 hours ago',
      weeklyData: [
        { day: 'Mon', hours: 7.5, quality: 85, bedtime: '22:30', wakeup: '06:00' },
        { day: 'Tue', hours: 6.8, quality: 78, bedtime: '23:15', wakeup: '06:00' },
        { day: 'Wed', hours: 7.8, quality: 88, bedtime: '22:00', wakeup: '05:50' },
        { day: 'Thu', hours: 7.2, quality: 82, bedtime: '22:45', wakeup: '06:00' },
        { day: 'Fri', hours: 6.5, quality: 75, bedtime: '23:30', wakeup: '06:00' },
        { day: 'Sat', hours: 8.2, quality: 92, bedtime: '22:00', wakeup: '06:15' },
        { day: 'Sun', hours: 7.9, quality: 89, bedtime: '21:45', wakeup: '05:45' },
      ],
      sleepStages: {
        light: 45,
        deep: 25,
        rem: 20,
        awake: 10,
      },
      insights: [
        'Consistent bedtime improves sleep quality',
        'Weekend recovery sleep is beneficial',
        'Late Friday bedtime affected quality',
      ],
    },
    {
      id: '2',
      name: 'Sarah Williams',
      avatar: 'SW',
      avgSleepHours: 6.8,
      sleepScore: 74,
      trend: 'stable',
      lastSync: '1 hour ago',
      weeklyData: [
        { day: 'Mon', hours: 6.5, quality: 72, bedtime: '23:00', wakeup: '05:30' },
        { day: 'Tue', hours: 7.0, quality: 78, bedtime: '22:45', wakeup: '05:45' },
        { day: 'Wed', hours: 6.8, quality: 75, bedtime: '23:15', wakeup: '06:00' },
        { day: 'Thu', hours: 6.2, quality: 68, bedtime: '23:30', wakeup: '05:45' },
        { day: 'Fri', hours: 7.2, quality: 80, bedtime: '22:30', wakeup: '05:45' },
        { day: 'Sat', hours: 7.8, quality: 85, bedtime: '22:00', wakeup: '05:50' },
        { day: 'Sun', hours: 6.9, quality: 76, bedtime: '23:00', wakeup: '06:00' },
      ],
      sleepStages: {
        light: 50,
        deep: 20,
        rem: 18,
        awake: 12,
      },
      insights: [
        'Early wake times are consistent',
        'Sleep debt accumulating weekdays',
        'Consider earlier bedtime routine',
      ],
    },
    {
      id: '3',
      name: 'Mike Chen',
      avatar: 'MC',
      avgSleepHours: 8.1,
      sleepScore: 89,
      trend: 'excellent',
      lastSync: '30 minutes ago',
      weeklyData: [
        { day: 'Mon', hours: 8.0, quality: 87, bedtime: '21:30', wakeup: '05:30' },
        { day: 'Tue', hours: 8.2, quality: 91, bedtime: '21:45', wakeup: '06:00' },
        { day: 'Wed', hours: 7.9, quality: 86, bedtime: '22:00', wakeup: '05:55' },
        { day: 'Thu', hours: 8.3, quality: 93, bedtime: '21:30', wakeup: '05:50' },
        { day: 'Fri', hours: 7.8, quality: 84, bedtime: '22:15', wakeup: '06:00' },
        { day: 'Sat', hours: 8.5, quality: 95, bedtime: '21:15', wakeup: '05:45' },
        { day: 'Sun', hours: 8.0, quality: 88, bedtime: '21:45', wakeup: '05:45' },
      ],
      sleepStages: {
        light: 40,
        deep: 30,
        rem: 25,
        awake: 5,
      },
      insights: [
        'Optimal sleep duration achieved',
        'Excellent deep sleep percentage',
        'Maintain current routine',
      ],
    },
  ]);

  const timeframes = [
    { id: 'week', name: 'Week', icon: 'date-range' },
    { id: 'month', name: 'Month', icon: 'calendar-today' },
    { id: 'quarter', name: '3 Months', icon: 'calendar-view-month' },
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'dashboard' },
    { id: 'trends', name: 'Trends', icon: 'trending-up' },
    { id: 'insights', name: 'Insights', icon: 'psychology' },
    { id: 'goals', name: 'Goals', icon: 'flag' },
  ];

  // Animation on mount
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

    // Pulse animation for sleep scores
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getSleepScoreColor = (score) => {
    if (score >= 85) return COLORS.success;
    if (score >= 75) return COLORS.warning;
    return COLORS.error;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      case 'excellent': return 'star';
      default: return 'trending-flat';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return COLORS.success;
      case 'declining': return COLORS.error;
      case 'excellent': return COLORS.success;
      default: return COLORS.textLight;
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    navigation.navigate('SleepDetails', { client });
  };

  const renderTimeframeChip = ({ item }) => (
    <Chip
      mode={selectedTimeframe === item.id ? 'flat' : 'outlined'}
      selected={selectedTimeframe === item.id}
      onPress={() => setSelectedTimeframe(item.id)}
      style={{
        marginRight: SPACING.sm,
        backgroundColor: selectedTimeframe === item.id ? COLORS.primary : 'transparent',
      }}
      textStyle={{
        color: selectedTimeframe === item.id ? '#fff' : COLORS.text,
        fontSize: 12,
      }}
      icon={item.icon}
    >
      {item.name}
    </Chip>
  );

  const renderTabChip = ({ item }) => (
    <Chip
      mode={activeTab === item.id ? 'flat' : 'outlined'}
      selected={activeTab === item.id}
      onPress={() => setActiveTab(item.id)}
      style={{
        marginRight: SPACING.sm,
        backgroundColor: activeTab === item.id ? COLORS.sleep : 'transparent',
      }}
      textStyle={{
        color: activeTab === item.id ? '#fff' : COLORS.text,
        fontSize: 12,
      }}
      icon={item.icon}
    >
      {item.name}
    </Chip>
  );

  const renderClientCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <Card
        style={{
          margin: SPACING.sm,
          elevation: 4,
          borderRadius: 16,
        }}
        onPress={() => handleClientSelect(item)}
      >
        <LinearGradient
          colors={['#4A90E2', '#6A4C93']}
          style={{
            height: 140,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: SPACING.md,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar.Text
                size={40}
                label={item.avatar}
                style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                labelStyle={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}
              />
              <View style={{ marginLeft: SPACING.sm }}>
                <Text style={[TEXT_STYLES.subtitle, { color: '#fff' }]}>
                  {item.name}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  Last sync: {item.lastSync}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon 
                name={getTrendIcon(item.trend)} 
                size={20} 
                color={item.trend === 'excellent' ? '#FFD700' : '#fff'} 
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.body, { color: '#fff', fontWeight: 'bold' }]}>
                {item.avgSleepHours}h
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Avg Sleep
              </Text>
            </View>
            
            <Animated.View 
              style={{ 
                transform: [{ scale: pulseAnim }],
                alignItems: 'center',
              }}
            >
              <Surface style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: getSleepScoreColor(item.sleepScore),
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 4,
              }}>
                <Text style={[TEXT_STYLES.body, { color: '#fff', fontWeight: 'bold' }]}>
                  {item.sleepScore}
                </Text>
              </Surface>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
                Sleep Score
              </Text>
            </Animated.View>
          </View>
        </LinearGradient>

        <Card.Content style={{ padding: SPACING.md }}>
          {/* Weekly Sleep Hours Chart */}
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Weekly Sleep Pattern 📊
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingVertical: SPACING.sm }}>
              {item.weeklyData.map((day, dayIndex) => (
                <View key={dayIndex} style={{ alignItems: 'center', marginRight: SPACING.md }}>
                  <View
                    style={{
                      width: 24,
                      height: Math.max(day.hours * 10, 20),
                      backgroundColor: day.quality >= 80 ? COLORS.success : 
                                    day.quality >= 70 ? COLORS.warning : COLORS.error,
                      borderRadius: 4,
                      marginBottom: SPACING.xs,
                    }}
                  />
                  <Text style={[TEXT_STYLES.caption, { fontSize: 10 }]}>
                    {day.day}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { fontSize: 9, color: COLORS.textLight }]}>
                    {day.hours}h
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Sleep Stages */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
              Sleep Stages Distribution 🌙
            </Text>
            
            <View style={{ flexDirection: 'row', marginBottom: SPACING.xs }}>
              <View style={{ flex: item.sleepStages.light, height: 8, backgroundColor: COLORS.lightSleep, marginRight: 2 }} />
              <View style={{ flex: item.sleepStages.deep, height: 8, backgroundColor: COLORS.deepSleep, marginRight: 2 }} />
              <View style={{ flex: item.sleepStages.rem, height: 8, backgroundColor: COLORS.remSleep, marginRight: 2 }} />
              <View style={{ flex: item.sleepStages.awake, height: 8, backgroundColor: COLORS.error }} />
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md }}>
                <View style={{ width: 12, height: 12, backgroundColor: COLORS.lightSleep, marginRight: 4 }} />
                <Text style={[TEXT_STYLES.caption, { fontSize: 10 }]}>Light {item.sleepStages.light}%</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md }}>
                <View style={{ width: 12, height: 12, backgroundColor: COLORS.deepSleep, marginRight: 4 }} />
                <Text style={[TEXT_STYLES.caption, { fontSize: 10 }]}>Deep {item.sleepStages.deep}%</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md }}>
                <View style={{ width: 12, height: 12, backgroundColor: COLORS.remSleep, marginRight: 4 }} />
                <Text style={[TEXT_STYLES.caption, { fontSize: 10 }]}>REM {item.sleepStages.rem}%</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 12, height: 12, backgroundColor: COLORS.error, marginRight: 4 }} />
                <Text style={[TEXT_STYLES.caption, { fontSize: 10 }]}>Awake {item.sleepStages.awake}%</Text>
              </View>
            </View>
          </View>

          <Divider style={{ marginVertical: SPACING.sm }} />

          {/* AI Insights */}
          <View>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
              AI Insights 🤖
            </Text>
            {item.insights.map((insight, insightIndex) => (
              <View key={insightIndex} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.xs }}>
                <Icon name="lightbulb" size={16} color={COLORS.warning} style={{ marginRight: SPACING.xs, marginTop: 2 }} />
                <Text style={[TEXT_STYLES.caption, { flex: 1 }]}>
                  {insight}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      paddingHorizontal: SPACING.xl,
      marginTop: 50,
    }}>
      <Icon name="bedtime" size={80} color={COLORS.textLight} />
      <Text style={[TEXT_STYLES.subtitle, { marginTop: SPACING.md, textAlign: 'center' }]}>
        No Sleep Data Available
      </Text>
      <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
        Ask your clients to connect their sleep tracking devices or manually log their sleep
      </Text>
    </View>
  );

  // Filter clients based on search
  const filteredClients = clientSleepData.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4A90E2', '#6A4C93']}
        style={{ paddingTop: 50, paddingBottom: SPACING.md }}
      >
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingHorizontal: SPACING.md,
          marginBottom: SPACING.md,
        }}>
          <IconButton
            icon="arrow-back"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.title, { color: '#fff', flex: 1, marginLeft: SPACING.sm }]}>
            Sleep Tracking 🌙
          </Text>
          <IconButton
            icon="analytics"
            iconColor="#fff"
            size={24}
            onPress={() => Alert.alert('🚧 Coming Soon', 'Advanced sleep analytics coming soon!')}
          />
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: SPACING.md }}>
          <Searchbar
            placeholder="Search clients..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 25,
            }}
            iconColor={COLORS.sleep}
            placeholderTextColor={COLORS.textLight}
          />
        </View>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={{ 
        flexDirection: 'row', 
        paddingHorizontal: SPACING.sm,
        marginTop: -20,
        marginBottom: SPACING.md,
      }}>
        <Surface style={{ 
          flex: 1, 
          margin: SPACING.xs, 
          padding: SPACING.md, 
          borderRadius: 16,
          elevation: 4,
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.sleep }]}>
            {clientSleepData.length}
          </Text>
          <Text style={TEXT_STYLES.caption}>Tracked Clients</Text>
        </Surface>
        
        <Surface style={{ 
          flex: 1, 
          margin: SPACING.xs, 
          padding: SPACING.md, 
          borderRadius: 16,
          elevation: 4,
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.success }]}>
            {Math.round(clientSleepData.reduce((sum, c) => sum + c.avgSleepHours, 0) / clientSleepData.length * 10) / 10}h
          </Text>
          <Text style={TEXT_STYLES.caption}>Avg Sleep</Text>
        </Surface>

        <Surface style={{ 
          flex: 1, 
          margin: SPACING.xs, 
          padding: SPACING.md, 
          borderRadius: 16,
          elevation: 4,
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.warning }]}>
            {Math.round(clientSleepData.reduce((sum, c) => sum + c.sleepScore, 0) / clientSleepData.length)}
          </Text>
          <Text style={TEXT_STYLES.caption}>Avg Score</Text>
        </Surface>
      </View>

      {/* Timeframe and Tab Filters */}
      <FlatList
        horizontal
        data={timeframes}
        renderItem={renderTimeframeChip}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: SPACING.md,
          marginBottom: SPACING.sm,
        }}
      />

      <FlatList
        horizontal
        data={tabs}
        renderItem={renderTabChip}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: SPACING.md,
          marginBottom: SPACING.md,
        }}
      />

      {/* Client Sleep Data List */}
      <FlatList
        data={filteredClients}
        renderItem={renderClientCard}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.sleep]}
            tintColor={COLORS.sleep}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          right: SPACING.md,
          bottom: SPACING.xl,
          backgroundColor: COLORS.sleep,
        }}
        onPress={() => Alert.alert(
          '🚧 Feature in Development',
          'Sleep goal setting and manual entry coming soon! Connect with wearable devices for automatic tracking.',
          [{ text: 'Got it! 👍', style: 'default' }]
        )}
      />
    </View>
  );
};

export default SleepTracking;