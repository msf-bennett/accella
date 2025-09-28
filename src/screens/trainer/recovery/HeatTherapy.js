import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
  Alert,
  Vibration,
  TouchableOpacity,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const HeatTherapy = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { recoveryData } = useSelector(state => state.recovery);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTherapy, setSelectedTherapy] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [currentTemp, setCurrentTemp] = useState(40);
  const [streakCount, setStreakCount] = useState(7);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Heat therapy methods data
  const heatTherapyMethods = [
    {
      id: 1,
      name: 'Sauna Therapy',
      icon: 'spa',
      temperature: '70-100°C',
      duration: '15-20 min',
      benefits: ['Improved circulation', 'Muscle relaxation', 'Stress relief'],
      difficulty: 'Beginner',
      calories: 150,
      color: '#FF6B6B',
      description: 'Traditional dry heat therapy for deep muscle relaxation and recovery.'
    },
    {
      id: 2,
      name: 'Hot Stone Therapy',
      icon: 'grain',
      temperature: '50-60°C',
      duration: '45-60 min',
      benefits: ['Deep muscle relief', 'Tension release', 'Improved flexibility'],
      difficulty: 'Intermediate',
      calories: 80,
      color: '#4ECDC4',
      description: 'Heated stones placed on key pressure points for targeted muscle recovery.'
    },
    {
      id: 3,
      name: 'Infrared Therapy',
      icon: 'wb_sunny',
      temperature: '45-60°C',
      duration: '20-30 min',
      benefits: ['Pain relief', 'Better sleep', 'Faster healing'],
      difficulty: 'Beginner',
      calories: 120,
      color: '#45B7D1',
      description: 'Penetrating infrared heat for deep tissue recovery and pain management.'
    },
    {
      id: 4,
      name: 'Steam Therapy',
      icon: 'cloud',
      temperature: '40-50°C',
      duration: '10-15 min',
      benefits: ['Respiratory health', 'Skin cleansing', 'Hydration'],
      difficulty: 'Beginner',
      calories: 100,
      color: '#96CEB4',
      description: 'Moist heat therapy for respiratory and skin benefits with muscle relaxation.'
    },
    {
      id: 5,
      name: 'Hot Bath Therapy',
      icon: 'hot_tub',
      temperature: '37-42°C',
      duration: '20-30 min',
      benefits: ['Joint mobility', 'Circulation', 'Sleep quality'],
      difficulty: 'Beginner',
      calories: 60,
      color: '#FFEAA7',
      description: 'Warm water immersion for gentle muscle recovery and joint care.'
    },
    {
      id: 6,
      name: 'Heat Compress',
      icon: 'healing',
      temperature: '40-45°C',
      duration: '15-20 min',
      benefits: ['Targeted relief', 'Reduced stiffness', 'Quick recovery'],
      difficulty: 'Beginner',
      calories: 30,
      color: '#DDA0DD',
      description: 'Localized heat application for specific muscle groups and injury recovery.'
    }
  ];

  const achievementBadges = [
    { name: 'Heat Master', icon: 'local_fire_department', earned: true },
    { name: 'Recovery Pro', icon: 'healing', earned: true },
    { name: 'Wellness Warrior', icon: 'fitness_center', earned: false },
    { name: 'Consistency King', icon: 'schedule', earned: true }
  ];

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for active elements
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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

    return () => pulseAnimation.stop();
  }, []);

  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (timerActive && timerDuration > 0) {
      interval = setInterval(() => {
        setTimerDuration(duration => {
          if (duration <= 1) {
            setTimerActive(false);
            Vibration.vibrate(1000);
            Alert.alert('🔥 Session Complete!', 'Great work! Your heat therapy session is finished. Time to hydrate! 💧');
            return 0;
          }
          return duration - 1;
        });
      }, 1000);
    } else if (!timerActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerDuration]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setStreakCount(prev => prev + 1);
      setRefreshing(false);
    }, 2000);
  }, []);

  const startTherapySession = (therapy) => {
    const duration = parseInt(therapy.duration) * 60; // Convert to seconds
    setSelectedTherapy(therapy);
    setTimerDuration(duration);
    setTimerActive(true);
    setModalVisible(false);
    Vibration.vibrate(100);
    Alert.alert(
      `🔥 ${therapy.name} Started!`,
      `Session duration: ${therapy.duration}\nStay hydrated and listen to your body! 💪`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const stopTherapySession = () => {
    setTimerActive(false);
    setTimerDuration(0);
    setSelectedTherapy(null);
    Alert.alert('Session Stopped', 'Your heat therapy session has been stopped. Great effort! 👏');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return '#FFA500';
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const filteredMethods = heatTherapyMethods.filter(method =>
    method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    method.benefits.some(benefit => benefit.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderTherapyCard = (therapy, index) => (
    <Animated.View
      key={therapy.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.medium,
      }}
    >
      <Card
        style={{
          marginHorizontal: SPACING.medium,
          elevation: 4,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={[therapy.color, `${therapy.color}90`]}
          style={{ padding: SPACING.medium }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Surface
                style={{
                  padding: SPACING.small,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  marginRight: SPACING.medium,
                }}
              >
                <Icon name={therapy.icon} size={28} color="#FFFFFF" />
              </Surface>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.h3, { color: '#FFFFFF', fontWeight: 'bold' }]}>
                  {therapy.name}
                </Text>
                <Text style={[TEXT_STYLES.body, { color: '#FFFFFF', opacity: 0.9 }]}>
                  {therapy.description}
                </Text>
              </View>
            </View>
            <Chip
              mode="outlined"
              textStyle={{ color: '#FFFFFF', fontSize: 12 }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderColor: '#FFFFFF',
              }}
            >
              {therapy.difficulty}
            </Chip>
          </View>

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            marginTop: SPACING.medium,
            flexWrap: 'wrap'
          }}>
            <View style={{ alignItems: 'center', minWidth: 80 }}>
              <Icon name="thermostat" size={20} color="#FFFFFF" />
              <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF', marginTop: 4 }]}>
                {therapy.temperature}
              </Text>
            </View>
            <View style={{ alignItems: 'center', minWidth: 80 }}>
              <Icon name="timer" size={20} color="#FFFFFF" />
              <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF', marginTop: 4 }]}>
                {therapy.duration}
              </Text>
            </View>
            <View style={{ alignItems: 'center', minWidth: 80 }}>
              <Icon name="local_fire_department" size={20} color="#FFFFFF" />
              <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF', marginTop: 4 }]}>
                {therapy.calories} cal
              </Text>
            </View>
          </View>

          <View style={{ marginTop: SPACING.medium }}>
            <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF', marginBottom: SPACING.small, fontWeight: 'bold' }]}>
              🎯 Key Benefits:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {therapy.benefits.map((benefit, idx) => (
                <Chip
                  key={idx}
                  mode="outlined"
                  compact
                  textStyle={{ color: '#FFFFFF', fontSize: 10 }}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderColor: '#FFFFFF',
                    marginRight: SPACING.small,
                    marginBottom: SPACING.small,
                  }}
                >
                  {benefit}
                </Chip>
              ))}
            </View>
          </View>

          <Button
            mode="contained"
            onPress={() => {
              setSelectedTherapy(therapy);
              setModalVisible(true);
            }}
            style={{
              backgroundColor: '#FFFFFF',
              marginTop: SPACING.medium,
              borderRadius: 25,
            }}
            labelStyle={{ color: therapy.color, fontWeight: 'bold' }}
            icon="play_arrow"
          >
            Start Session
          </Button>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderStatsCard = () => (
    <Card
      style={{
        marginHorizontal: SPACING.medium,
        marginBottom: SPACING.medium,
        elevation: 6,
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ padding: SPACING.large }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: '#FFFFFF', fontWeight: 'bold' }]}>
              Recovery Stats 📊
            </Text>
            <Text style={[TEXT_STYLES.body, { color: '#FFFFFF', opacity: 0.9, marginTop: 4 }]}>
              Track your heat therapy journey
            </Text>
          </View>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Surface
              style={{
                padding: SPACING.medium,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Icon name="local_fire_department" size={32} color="#FFFFFF" />
            </Surface>
          </Animated.View>
        </View>

        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          marginTop: SPACING.large 
        }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[TEXT_STYLES.h1, { color: '#FFFFFF', fontWeight: 'bold' }]}>
              {streakCount}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF', opacity: 0.8 }]}>
              Day Streak 🔥
            </Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[TEXT_STYLES.h1, { color: '#FFFFFF', fontWeight: 'bold' }]}>
              89%
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF', opacity: 0.8 }]}>
              Recovery Rate 💪
            </Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[TEXT_STYLES.h1, { color: '#FFFFFF', fontWeight: 'bold' }]}>
              24
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF', opacity: 0.8 }]}>
              Sessions 🎯
            </Text>
          </View>
        </View>

        <View style={{ marginTop: SPACING.large }}>
          <Text style={[TEXT_STYLES.body, { color: '#FFFFFF', marginBottom: SPACING.small }]}>
            Weekly Progress: 85%
          </Text>
          <ProgressBar
            progress={0.85}
            color="#FFFFFF"
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          />
        </View>
      </LinearGradient>
    </Card>
  );

  const renderActiveSession = () => {
    if (!timerActive || !selectedTherapy) return null;

    return (
      <Card
        style={{
          position: 'absolute',
          top: 100,
          left: SPACING.medium,
          right: SPACING.medium,
          zIndex: 1000,
          elevation: 10,
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={[selectedTherapy.color, `${selectedTherapy.color}CC`]}
          style={{ padding: SPACING.large }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { color: '#FFFFFF', fontWeight: 'bold' }]}>
                🔥 {selectedTherapy.name}
              </Text>
              <Text style={[TEXT_STYLES.body, { color: '#FFFFFF', opacity: 0.9 }]}>
                Active Session
              </Text>
            </View>
            <IconButton
              icon="stop"
              iconColor="#FFFFFF"
              size={28}
              onPress={stopTherapySession}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
          </View>

          <View style={{ alignItems: 'center', marginVertical: SPACING.large }}>
            <Text style={[TEXT_STYLES.h1, { color: '#FFFFFF', fontSize: 48, fontWeight: 'bold' }]}>
              {formatTime(timerDuration)}
            </Text>
            <Text style={[TEXT_STYLES.body, { color: '#FFFFFF', opacity: 0.8 }]}>
              Time Remaining
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="thermostat" size={24} color="#FFFFFF" />
              <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF', marginTop: 4 }]}>
                {selectedTherapy.temperature}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="local_fire_department" size={24} color="#FFFFFF" />
              <Text style={[TEXT_STYLES.caption, { color: '#FFFFFF', marginTop: 4 }]}>
                {Math.round((selectedTherapy.calories / parseInt(selectedTherapy.duration)) * 
                ((parseInt(selectedTherapy.duration) * 60 - timerDuration) / 60))} cal
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  const renderAchievements = () => (
    <View style={{ marginBottom: SPACING.large }}>
      <Text style={[TEXT_STYLES.h3, { 
        marginHorizontal: SPACING.medium, 
        marginBottom: SPACING.medium, 
        color: COLORS.primary,
        fontWeight: 'bold' 
      }]}>
        🏆 Achievement Badges
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.medium }}>
          {achievementBadges.map((badge, index) => (
            <Surface
              key={index}
              style={{
                padding: SPACING.medium,
                marginRight: SPACING.medium,
                borderRadius: 16,
                backgroundColor: badge.earned ? COLORS.success : COLORS.background,
                elevation: badge.earned ? 4 : 2,
                opacity: badge.earned ? 1 : 0.6,
              }}
            >
              <Icon 
                name={badge.icon} 
                size={32} 
                color={badge.earned ? '#FFFFFF' : COLORS.primary} 
              />
              <Text style={[
                TEXT_STYLES.caption, 
                { 
                  color: badge.earned ? '#FFFFFF' : COLORS.primary,
                  textAlign: 'center',
                  marginTop: SPACING.small,
                  fontWeight: 'bold'
                }
              ]}>
                {badge.name}
              </Text>
            </Surface>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ 
          paddingTop: StatusBar.currentHeight + SPACING.large,
          paddingBottom: SPACING.large,
          paddingHorizontal: SPACING.medium,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: '#FFFFFF', fontWeight: 'bold' }]}>
              Heat Therapy 🔥
            </Text>
            <Text style={[TEXT_STYLES.body, { color: '#FFFFFF', opacity: 0.9 }]}>
              Accelerate your recovery with heat
            </Text>
          </View>
          <IconButton
            icon="info"
            iconColor="#FFFFFF"
            size={24}
            onPress={() => Alert.alert(
              '🔥 Heat Therapy Benefits',
              '• Increases blood flow and circulation\n• Reduces muscle stiffness and pain\n• Promotes faster healing\n• Improves flexibility\n• Reduces stress and promotes relaxation\n\n💡 Always stay hydrated and listen to your body!'
            )}
          />
        </View>

        <Searchbar
          placeholder="Search heat therapy methods..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            marginTop: SPACING.medium,
            borderRadius: 25,
          }}
          inputStyle={{ color: COLORS.primary }}
          iconColor={COLORS.primary}
        />
      </LinearGradient>

      {/* Active Session Overlay */}
      {renderActiveSession()}

      <ScrollView
        style={{ flex: 1, paddingTop: timerActive ? 200 : SPACING.medium }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Stats Card */}
        {renderStatsCard()}

        {/* Achievement Badges */}
        {renderAchievements()}

        {/* Heat Therapy Methods */}
        <Text style={[TEXT_STYLES.h3, { 
          marginHorizontal: SPACING.medium, 
          marginBottom: SPACING.medium, 
          color: COLORS.primary,
          fontWeight: 'bold' 
        }]}>
          🌡️ Heat Therapy Methods
        </Text>

        {filteredMethods.length === 0 ? (
          <Card style={{ marginHorizontal: SPACING.medium, padding: SPACING.large }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="search_off" size={48} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, marginTop: SPACING.medium }]}>
                No methods found
              </Text>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.small }]}>
                Try adjusting your search terms
              </Text>
            </View>
          </Card>
        ) : (
          filteredMethods.map((therapy, index) => renderTherapyCard(therapy, index))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Session Confirmation Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            margin: SPACING.medium,
            backgroundColor: COLORS.background,
            borderRadius: 20,
            padding: SPACING.large,
          }}
        >
          {selectedTherapy && (
            <View>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.primary, textAlign: 'center', fontWeight: 'bold' }]}>
                🔥 Start {selectedTherapy.name}?
              </Text>
              
              <Card style={{ marginVertical: SPACING.large, padding: SPACING.medium }}>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>
                  <Text style={{ fontWeight: 'bold' }}>Duration:</Text> {selectedTherapy.duration}
                </Text>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>
                  <Text style={{ fontWeight: 'bold' }}>Temperature:</Text> {selectedTherapy.temperature}
                </Text>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>
                  <Text style={{ fontWeight: 'bold' }}>Calories:</Text> ~{selectedTherapy.calories}
                </Text>
                <Text style={[TEXT_STYLES.body]}>
                  <Text style={{ fontWeight: 'bold' }}>Benefits:</Text> {selectedTherapy.benefits.join(', ')}
                </Text>
              </Card>

              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginBottom: SPACING.large, fontStyle: 'italic' }]}>
                💡 Remember to stay hydrated and stop if you feel uncomfortable
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 0.4 }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => startTherapySession(selectedTherapy)}
                  style={{ flex: 0.4, backgroundColor: COLORS.success }}
                  icon="play_arrow"
                >
                  Start
                </Button>
              </View>
            </View>
          )}
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          right: SPACING.medium,
          bottom: SPACING.large,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert(
          '🔥 Custom Session',
          'Create your own heat therapy routine! This feature is coming soon.',
          [{ text: 'Got it!', style: 'default' }]
        )}
      />
    </View>
  );
};

export default HeatTherapy;