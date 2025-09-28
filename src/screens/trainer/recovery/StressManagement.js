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
  Divider,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
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
  textLight: '#666666',
  accent: '#FF6B6B',
  stress: {
    low: '#4CAF50',
    moderate: '#FF9800',
    high: '#FF5722',
    critical: '#D32F2F',
  },
  calm: '#00BCD4',
  mindfulness: '#9C27B0',
  breathe: '#03DAC6',
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

const StressManagement = ({ navigation }) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const stressWaveAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const stressData = useSelector(state => state.stress.data || []);

  // Mock stress management data
  const [clientStressData, setClientStressData] = useState([
    {
      id: '1',
      name: 'Emma Thompson',
      avatar: 'ET',
      currentStressLevel: 6.2,
      stressCategory: 'moderate',
      trend: 'improving',
      lastUpdate: '1 hour ago',
      heartRateVariability: 42,
      weeklyStress: [
        { day: 'Mon', level: 7.2, hrv: 38, activities: ['work', 'training'] },
        { day: 'Tue', level: 5.8, hrv: 45, activities: ['rest', 'meditation'] },
        { day: 'Wed', level: 6.5, hrv: 41, activities: ['work', 'social'] },
        { day: 'Thu', level: 7.8, hrv: 35, activities: ['deadlines', 'training'] },
        { day: 'Fri', level: 5.2, hrv: 48, activities: ['recovery', 'leisure'] },
        { day: 'Sat', level: 4.1, hrv: 52, activities: ['family', 'nature'] },
        { day: 'Sun', level: 4.8, hrv: 49, activities: ['prep', 'relaxation'] },
      ],
      stressors: ['Work deadlines', 'Training intensity', 'Sleep quality'],
      copingStrategies: ['Deep breathing', 'Yoga', 'Nature walks'],
      interventions: [
        { type: 'breathing', completed: 12, effectiveness: 8.2 },
        { type: 'meditation', completed: 8, effectiveness: 7.8 },
        { type: 'exercise', completed: 15, effectiveness: 8.5 },
      ],
      recommendations: [
        'Schedule stress-relief sessions before high-intensity training',
        'Implement morning breathing routine',
        'Consider reducing training load during work deadlines',
      ],
      riskFactors: ['High cortisol patterns', 'Inconsistent recovery'],
      alerts: [],
    },
    {
      id: '2',
      name: 'David Rodriguez',
      avatar: 'DR',
      currentStressLevel: 8.1,
      stressCategory: 'high',
      trend: 'stable',
      lastUpdate: '30 minutes ago',
      heartRateVariability: 28,
      weeklyStress: [
        { day: 'Mon', level: 8.5, hrv: 25, activities: ['competition', 'pressure'] },
        { day: 'Tue', level: 7.8, hrv: 30, activities: ['recovery', 'analysis'] },
        { day: 'Wed', level: 8.2, hrv: 27, activities: ['training', 'stress'] },
        { day: 'Thu', level: 8.7, hrv: 24, activities: ['intensity', 'fatigue'] },
        { day: 'Fri', level: 7.9, hrv: 29, activities: ['taper', 'anxiety'] },
        { day: 'Sat', level: 8.3, hrv: 26, activities: ['competition', 'nerves'] },
        { day: 'Sun', level: 7.5, hrv: 31, activities: ['debrief', 'planning'] },
      ],
      stressors: ['Competition anxiety', 'Performance pressure', 'Social expectations'],
      copingStrategies: ['Visualization', 'Progressive muscle relaxation', 'Music therapy'],
      interventions: [
        { type: 'breathing', completed: 18, effectiveness: 7.5 },
        { type: 'meditation', completed: 14, effectiveness: 8.1 },
        { type: 'therapy', completed: 6, effectiveness: 8.8 },
      ],
      recommendations: [
        'Increase pre-competition mental preparation',
        'Schedule regular sports psychology sessions',
        'Implement stress monitoring during training camps',
      ],
      riskFactors: ['Competition burnout risk', 'Elevated baseline stress'],
      alerts: [
        { type: 'high_stress', message: 'Stress levels elevated for 3+ days', priority: 'medium' }
      ],
    },
    {
      id: '3',
      name: 'Lisa Chang',
      avatar: 'LC',
      currentStressLevel: 3.8,
      stressCategory: 'low',
      trend: 'excellent',
      lastUpdate: '45 minutes ago',
      heartRateVariability: 58,
      weeklyStress: [
        { day: 'Mon', level: 4.2, hrv: 55, activities: ['routine', 'balanced'] },
        { day: 'Tue', level: 3.5, hrv: 60, activities: ['flow state', 'enjoyment'] },
        { day: 'Wed', level: 3.8, hrv: 57, activities: ['challenge', 'growth'] },
        { day: 'Thu', level: 4.1, hrv: 54, activities: ['progress', 'satisfaction'] },
        { day: 'Fri', level: 3.2, hrv: 62, activities: ['achievement', 'celebration'] },
        { day: 'Sat', level: 2.8, hrv: 65, activities: ['joy', 'connection'] },
        { day: 'Sun', level: 3.5, hrv: 59, activities: ['reflection', 'gratitude'] },
      ],
      stressors: ['Minor time management', 'Weather changes'],
      copingStrategies: ['Mindfulness', 'Journaling', 'Creative activities'],
      interventions: [
        { type: 'mindfulness', completed: 20, effectiveness: 9.1 },
        { type: 'breathing', completed: 15, effectiveness: 8.8 },
        { type: 'gratitude', completed: 25, effectiveness: 9.3 },
      ],
      recommendations: [
        'Maintain current wellness practices',
        'Share strategies with other clients',
        'Consider mentoring role for stress management',
      ],
      riskFactors: [],
      alerts: [],
    },
  ]);

  const stressCategories = [
    { id: 'all', name: 'All Clients', icon: 'group', count: clientStressData.length },
    { id: 'low', name: 'Low Stress', icon: 'sentiment-satisfied', count: 1, color: COLORS.stress.low },
    { id: 'moderate', name: 'Moderate', icon: 'sentiment-neutral', count: 1, color: COLORS.stress.moderate },
    { id: 'high', name: 'High Stress', icon: 'sentiment-dissatisfied', count: 1, color: COLORS.stress.high },
    { id: 'critical', name: 'Critical', icon: 'warning', count: 0, color: COLORS.stress.critical },
  ];

  const interventionTypes = [
    { id: 'breathing', name: 'Breathing Exercises', icon: 'air', color: COLORS.breathe },
    { id: 'meditation', name: 'Meditation', icon: 'self-improvement', color: COLORS.mindfulness },
    { id: 'exercise', name: 'Physical Activity', icon: 'fitness-center', color: COLORS.success },
    { id: 'therapy', name: 'Counseling', icon: 'psychology', color: COLORS.primary },
    { id: 'mindfulness', name: 'Mindfulness', icon: 'spa', color: COLORS.calm },
    { id: 'gratitude', name: 'Gratitude Practice', icon: 'favorite', color: COLORS.accent },
  ];

  // Animations on mount
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

    // Breathing animation
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.2,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();

    // Stress wave animation
    const stressWave = Animated.loop(
      Animated.timing(stressWaveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    stressWave.start();

    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStressColor = (level) => {
    if (level <= 4) return COLORS.stress.low;
    if (level <= 6) return COLORS.stress.moderate;
    if (level <= 8) return COLORS.stress.high;
    return COLORS.stress.critical;
  };

  const getStressLabel = (level) => {
    if (level <= 4) return 'Low';
    if (level <= 6) return 'Moderate';
    if (level <= 8) return 'High';
    return 'Critical';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return 'trending-down';
      case 'worsening': return 'trending-up';
      case 'excellent': return 'sentiment-very-satisfied';
      default: return 'trending-flat';
    }
  };

  const handleClientSelect = (client) => {
    navigation.navigate('StressDetails', { client });
  };

  const handleQuickIntervention = (client, intervention) => {
    Vibration.vibrate(100);
    Alert.alert(
      `🧘‍♀️ ${intervention.charAt(0).toUpperCase() + intervention.slice(1)} Session`,
      `Start a ${intervention} session for ${client.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Session', onPress: () => startIntervention(client, intervention) },
      ]
    );
  };

  const startIntervention = (client, intervention) => {
    switch (intervention) {
      case 'breathing':
        setShowBreathingModal(true);
        break;
      case 'meditation':
        navigation.navigate('MeditationSession', { client });
        break;
      default:
        Alert.alert('🚧 Coming Soon', `${intervention} sessions coming soon!`);
    }
  };

  const renderCategoryChip = ({ item }) => (
    <Chip
      mode={selectedCategory === item.id ? 'flat' : 'outlined'}
      selected={selectedCategory === item.id}
      onPress={() => setSelectedCategory(item.id)}
      style={{
        marginRight: SPACING.sm,
        backgroundColor: selectedCategory === item.id ? (item.color || COLORS.primary) : 'transparent',
        borderColor: item.color || COLORS.primary,
      }}
      textStyle={{
        color: selectedCategory === item.id ? '#fff' : (item.color || COLORS.text),
        fontSize: 12,
      }}
      icon={item.icon}
    >
      {item.name} ({item.count})
    </Chip>
  );

  const renderStressCard = ({ item, index }) => (
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
          borderLeftWidth: 6,
          borderLeftColor: getStressColor(item.currentStressLevel),
        }}
        onPress={() => handleClientSelect(item)}
      >
        <LinearGradient
          colors={item.stressCategory === 'low' ? ['#4CAF50', '#81C784'] :
                 item.stressCategory === 'moderate' ? ['#FF9800', '#FFB74D'] :
                 ['#FF5722', '#FF8A65']}
          style={{
            height: 120,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: SPACING.md,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Avatar.Text
                size={40}
                label={item.avatar}
                style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                labelStyle={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}
              />
              <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.subtitle, { color: '#fff' }]}>
                    {item.name}
                  </Text>
                  {item.alerts.length > 0 && (
                    <Badge
                      size={16}
                      style={{ backgroundColor: COLORS.error, marginLeft: SPACING.xs }}
                    >
                      {item.alerts.length}
                    </Badge>
                  )}
                </View>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  Updated {item.lastUpdate}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleQuickIntervention(item, 'breathing')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 20,
                padding: SPACING.xs,
              }}
            >
              <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
                <Icon name="air" size={20} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.title, { color: '#fff', fontWeight: 'bold' }]}>
                {item.currentStressLevel.toFixed(1)}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Stress Level
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name={getTrendIcon(item.trend)} size={20} color="#fff" />
                <Text style={[TEXT_STYLES.caption, { color: '#fff', marginLeft: 4 }]}>
                  {item.trend}
                </Text>
              </View>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                HRV: {item.heartRateVariability}ms
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Card.Content style={{ padding: SPACING.md }}>
          {/* Weekly Stress Pattern */}
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Weekly Stress Pattern 📊
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingVertical: SPACING.sm }}>
              {item.weeklyStress.map((day, dayIndex) => (
                <View key={dayIndex} style={{ alignItems: 'center', marginRight: SPACING.md }}>
                  <View
                    style={{
                      width: 24,
                      height: Math.max(day.level * 8, 16),
                      backgroundColor: getStressColor(day.level),
                      borderRadius: 4,
                      marginBottom: SPACING.xs,
                    }}
                  />
                  <Text style={[TEXT_STYLES.caption, { fontSize: 10 }]}>
                    {day.day}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { fontSize: 9, color: COLORS.textLight }]}>
                    {day.level.toFixed(1)}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Active Stressors */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
              Active Stressors ⚠️
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {item.stressors.map((stressor, stressorIndex) => (
                <Chip
                  key={stressorIndex}
                  mode="outlined"
                  compact
                  style={{ 
                    marginRight: SPACING.xs, 
                    borderColor: getStressColor(item.currentStressLevel),
                  }}
                  textStyle={{ fontSize: 10 }}
                >
                  {stressor}
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* Quick Interventions */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
              Quick Interventions 🎯
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {item.interventions.slice(0, 3).map((intervention, intIndex) => {
                const interventionInfo = interventionTypes.find(t => t.id === intervention.type);
                return (
                  <TouchableOpacity
                    key={intIndex}
                    onPress={() => handleQuickIntervention(item, intervention.type)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: interventionInfo?.color || COLORS.primary,
                      borderRadius: 20,
                      paddingHorizontal: SPACING.sm,
                      paddingVertical: SPACING.xs,
                      marginRight: SPACING.xs,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    <Icon name={interventionInfo?.icon || 'help'} size={16} color="#fff" />
                    <Text style={{ color: '#fff', marginLeft: 4, fontSize: 12 }}>
                      {intervention.completed}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Divider style={{ marginVertical: SPACING.sm }} />

          {/* AI Recommendations */}
          <View>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>
              AI Recommendations 🤖
            </Text>
            {item.recommendations.slice(0, 2).map((rec, recIndex) => (
              <View key={recIndex} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.xs }}>
                <Icon name="lightbulb" size={16} color={COLORS.warning} style={{ marginRight: SPACING.xs, marginTop: 2 }} />
                <Text style={[TEXT_STYLES.caption, { flex: 1 }]}>
                  {rec}
                </Text>
              </View>
            ))}
          </View>

          {/* Risk Factors */}
          {item.riskFactors.length > 0 && (
            <View style={{ marginTop: SPACING.sm }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.error, fontWeight: 'bold' }]}>
                Risk Factors: {item.riskFactors.join(', ')}
              </Text>
            </View>
          )}
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
      <Icon name="spa" size={80} color={COLORS.textLight} />
      <Text style={[TEXT_STYLES.subtitle, { marginTop: SPACING.md, textAlign: 'center' }]}>
        No Stress Data Available
      </Text>
      <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
        Start tracking stress levels and wellness metrics for your clients
      </Text>
    </View>
  );

  // Filter clients based on search and category
  const filteredClients = clientStressData.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || client.stressCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
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
            Stress Management 🧘‍♀️
          </Text>
          <IconButton
            icon="psychology"
            iconColor="#fff"
            size={24}
            onPress={() => Alert.alert('🚧 Coming Soon', 'Advanced stress analytics and AI coaching coming soon!')}
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
            iconColor={COLORS.accent}
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
          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.accent }]}>
            {clientStressData.length}
          </Text>
          <Text style={TEXT_STYLES.caption}>Monitored</Text>
        </Surface>
        
        <Surface style={{ 
          flex: 1, 
          margin: SPACING.xs, 
          padding: SPACING.md, 
          borderRadius: 16,
          elevation: 4,
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.stress.high }]}>
            {clientStressData.filter(c => c.stressCategory === 'high' || c.stressCategory === 'critical').length}
          </Text>
          <Text style={TEXT_STYLES.caption}>High Risk</Text>
        </Surface>

        <Surface style={{ 
          flex: 1, 
          margin: SPACING.xs, 
          padding: SPACING.md, 
          borderRadius: 16,
          elevation: 4,
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: 'bold', color: COLORS.success }]}>
            {clientStressData.reduce((sum, c) => sum + c.interventions.reduce((iSum, i) => iSum + i.completed, 0), 0)}
          </Text>
          <Text style={TEXT_STYLES.caption}>Sessions</Text>
        </Surface>
      </View>

      {/* Category Filters */}
      <FlatList
        horizontal
        data={stressCategories}
        renderItem={renderCategoryChip}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: SPACING.md,
          marginBottom: SPACING.md,
        }}
      />

      {/* Clients List */}
      <FlatList
        data={filteredClients}
        renderItem={renderStressCard}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
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
          backgroundColor: COLORS.accent,
        }}
        onPress={() => Alert.alert(
          '🚧 Feature in Development',
          'Stress monitoring setup and intervention scheduling coming soon! Connect with wearable devices for real-time stress tracking.',
          [{ text: 'Got it! 👍', style: 'default' }]
        )}
      />

      {/* Breathing Exercise Modal */}
      <Portal>
        <Modal
          visible={showBreathingModal}
          onDismiss={() => setShowBreathingModal(false)}
          contentContainerStyle={{
            backgroundColor: '#fff',
            margin: SPACING.lg,
            borderRadius: 20,
            padding: SPACING.xl,
            alignItems: 'center',
          }}
        >
          <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
            <Surface style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: COLORS.breathe,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 8,
            }}>
              <Icon name="air" size={40} color="#fff" />
            </Surface>
          </Animated.View>
          
          <Text style={[TEXT_STYLES.title, { marginTop: SPACING.lg, textAlign: 'center' }]}>
            Breathing Exercise 🌬️
          </Text>
          <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginVertical: SPACING.md }]}>
            Follow the circle to regulate your breathing
          </Text>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginBottom: SPACING.lg }]}>
            Breathe in as the circle grows, breathe out as it shrinks
          </Text>
          
          <View style={{ flexDirection: 'row' }}>
            <Button
              mode="outlined"
              onPress={() => setShowBreathingModal(false)}
              style={{ marginRight: SPACING.sm }}
            >
              Close
            </Button>
            <Button
              mode="contained"
              buttonColor={COLORS.breathe}
              onPress={() => {
                setShowBreathingModal(false);
                Alert.alert('🚧 Coming Soon', 'Full guided breathing sessions coming soon!');
              }}
            >
              Start Session
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default StressManagement;