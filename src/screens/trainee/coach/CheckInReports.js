import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
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
  Portal,
  Searchbar,
  ProgressBar,
  RadioButton,
  Slider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth } = Dimensions.get('window');

const CheckInReportsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, userRole } = useSelector(state => state.auth);
  const { checkIns, loading } = useSelector(state => state.checkIns);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [checkInForm, setCheckInForm] = useState({
    mood: 5,
    energy: 5,
    motivation: 5,
    sleep: 7,
    nutrition: 5,
    hydration: 8,
    stress: 3,
    soreness: 2,
    notes: '',
    bodyWeight: '',
    bodyFat: '',
    goals: '',
    challenges: '',
  });

  // Mock data for development
  const mockCheckIns = [
    {
      id: 1,
      userId: 'user123',
      userName: 'Alex Johnson',
      userAvatar: 'https://example.com/avatar1.jpg',
      date: '2025-08-24',
      timestamp: '08:30 AM',
      mood: 8,
      energy: 7,
      motivation: 9,
      sleep: 8,
      nutrition: 7,
      hydration: 9,
      stress: 3,
      soreness: 2,
      bodyWeight: '75.2',
      bodyFat: '12.5',
      notes: 'Feeling great today! Ready for the intense training session. Had a good breakfast and slept well.',
      goals: 'Focus on form during squats, increase running pace',
      challenges: 'Slight knee discomfort during lunges',
      overallScore: 8.2,
      streak: 12,
      consistency: 0.95,
    },
    {
      id: 2,
      userId: 'user456',
      userName: 'Maria Garcia',
      userAvatar: 'https://example.com/avatar2.jpg',
      date: '2025-08-24',
      timestamp: '07:45 AM',
      mood: 6,
      energy: 5,
      motivation: 7,
      sleep: 6,
      nutrition: 8,
      hydration: 7,
      stress: 5,
      soreness: 4,
      bodyWeight: '62.8',
      bodyFat: '18.2',
      notes: 'Tired from yesterday\'s workout but mentally ready. Need to focus on hydration today.',
      goals: 'Complete full cardio session, improve flexibility',
      challenges: 'Lower back tightness, need more stretching',
      overallScore: 6.5,
      streak: 8,
      consistency: 0.87,
    },
    {
      id: 3,
      userId: 'user789',
      userName: 'Jake Wilson',
      userAvatar: 'https://example.com/avatar3.jpg',
      date: '2025-08-23',
      timestamp: '09:15 AM',
      mood: 9,
      energy: 8,
      motivation: 9,
      sleep: 9,
      nutrition: 9,
      hydration: 8,
      stress: 2,
      soreness: 1,
      bodyWeight: '82.5',
      bodyFat: '10.8',
      notes: 'Perfect recovery day! Feeling strong and motivated. Nutrition has been on point this week.',
      goals: 'PR attempt on bench press, maintain current diet',
      challenges: 'None today, everything feels great!',
      overallScore: 8.8,
      streak: 15,
      consistency: 0.98,
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
    propsForLabels: {
      fontSize: 12,
    },
  };

  // Initialize component
  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent', true);
      StatusBar.setTranslucent(true);
    }

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadCheckIns();
  }, []);

  const loadCheckIns = useCallback(async () => {
    try {
      // Simulate API call
      // dispatch(fetchCheckIns());
    } catch (error) {
      console.error('Error loading check-ins:', error);
      Alert.alert('Error', 'Failed to load check-in reports. Please try again.');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCheckIns();
    setRefreshing(false);
  }, [loadCheckIns]);

  const handleSubmitCheckIn = () => {
    if (!checkInForm.notes.trim()) {
      Alert.alert('Validation Error', 'Please add some notes about your current state.');
      return;
    }

    const newCheckIn = {
      ...checkInForm,
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      overallScore: calculateOverallScore(checkInForm),
    };

    // dispatch(submitCheckIn(newCheckIn));
    setShowCheckInModal(false);
    resetCheckInForm();
    
    Alert.alert('Success', 'Check-in submitted successfully! 🎉');
    Vibration.vibrate([100, 50, 100]);
  };

  const calculateOverallScore = (form) => {
    const weights = {
      mood: 0.15,
      energy: 0.15,
      motivation: 0.15,
      sleep: 0.15,
      nutrition: 0.1,
      hydration: 0.1,
      stress: 0.1, // Inverted
      soreness: 0.1, // Inverted
    };

    let score = 0;
    score += form.mood * weights.mood;
    score += form.energy * weights.energy;
    score += form.motivation * weights.motivation;
    score += form.sleep * weights.sleep;
    score += form.nutrition * weights.nutrition;
    score += form.hydration * weights.hydration;
    score += (10 - form.stress) * weights.stress; // Inverted
    score += (10 - form.soreness) * weights.soreness; // Inverted

    return Math.round(score * 10) / 10;
  };

  const resetCheckInForm = () => {
    setCheckInForm({
      mood: 5,
      energy: 5,
      motivation: 5,
      sleep: 7,
      nutrition: 5,
      hydration: 8,
      stress: 3,
      soreness: 2,
      notes: '',
      bodyWeight: '',
      bodyFat: '',
      goals: '',
      challenges: '',
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return COLORS.success;
    if (score >= 6) return COLORS.warning;
    if (score >= 4) return COLORS.info;
    return COLORS.error;
  };

  const getScoreEmoji = (score) => {
    if (score >= 8) return '😄';
    if (score >= 6) return '😊';
    if (score >= 4) return '😐';
    return '😔';
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>📊 Check-In Reports</Text>
            <Text style={styles.headerSubtitle}>
              {userRole === 'coach' ? 'Monitor team progress' : 'Track your wellness journey'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="analytics"
              iconColor={COLORS.surface}
              size={24}
              onPress={() => Alert.alert('Feature Coming Soon', 'Advanced analytics will be available soon!')}
            />
            <IconButton
              icon="download"
              iconColor={COLORS.surface}
              size={24}
              onPress={() => Alert.alert('Feature Coming Soon', 'Export functionality will be available soon!')}
            />
          </View>
        </View>

        {userRole === 'coach' && (
          <Searchbar
            placeholder="Search by player name..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
        >
          {[
            { key: 'overview', label: 'Overview', icon: 'dashboard' },
            { key: 'trends', label: 'Trends', icon: 'trending-up' },
            { key: 'individual', label: 'Individual', icon: 'person' },
            ...(userRole === 'coach' ? [{ key: 'team', label: 'Team', icon: 'group' }] : []),
          ].map((tab) => (
            <Chip
              key={tab.key}
              selected={selectedTab === tab.key}
              onPress={() => setSelectedTab(tab.key)}
              style={[
                styles.tabChip,
                selectedTab === tab.key && styles.selectedTabChip
              ]}
              textStyle={[
                styles.tabChipText,
                selectedTab === tab.key && styles.selectedTabChipText
              ]}
              icon={tab.icon}
            >
              {tab.label}
            </Chip>
          ))}
        </ScrollView>
      </View>
    </LinearGradient>
  );

  const renderOverviewCards = () => (
    <View style={styles.overviewGrid}>
      <Card style={[styles.overviewCard, { backgroundColor: COLORS.success }]}>
        <Card.Content style={styles.overviewCardContent}>
          <Icon name="mood" size={32} color={COLORS.surface} />
          <Text style={styles.overviewCardValue}>8.2</Text>
          <Text style={styles.overviewCardLabel}>Avg Mood</Text>
          <Text style={styles.overviewCardChange}>+0.5 this week</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.overviewCard, { backgroundColor: COLORS.info }]}>
        <Card.Content style={styles.overviewCardContent}>
          <Icon name="energy-savings-leaf" size={32} color={COLORS.surface} />
          <Text style={styles.overviewCardValue}>7.8</Text>
          <Text style={styles.overviewCardLabel}>Energy Level</Text>
          <Text style={styles.overviewCardChange}>-0.2 this week</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.overviewCard, { backgroundColor: COLORS.warning }]}>
        <Card.Content style={styles.overviewCardContent}>
          <Icon name="nights-stay" size={32} color={COLORS.surface} />
          <Text style={styles.overviewCardValue}>7.5h</Text>
          <Text style={styles.overviewCardLabel}>Sleep Quality</Text>
          <Text style={styles.overviewCardChange}>+0.3h this week</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.overviewCard, { backgroundColor: COLORS.primary }]}>
        <Card.Content style={styles.overviewCardContent}>
          <Icon name="local-fire-department" size={32} color={COLORS.surface} />
          <Text style={styles.overviewCardValue}>12</Text>
          <Text style={styles.overviewCardLabel}>Day Streak</Text>
          <Text style={styles.overviewCardChange}>Personal best!</Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderTrendsChart = () => {
    const weeklyData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [7.2, 8.1, 7.8, 8.5, 7.9, 8.3, 8.2],
          color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Wellness Trends</Text>
            <View style={styles.periodSelector}>
              {['week', 'month', '3months'].map((period) => (
                <Chip
                  key={period}
                  selected={selectedPeriod === period}
                  onPress={() => setSelectedPeriod(period)}
                  style={[
                    styles.periodChip,
                    selectedPeriod === period && styles.selectedPeriodChip
                  ]}
                  compact
                >
                  {period === '3months' ? '3M' : period.charAt(0).toUpperCase() + period.slice(1)}
                </Chip>
              ))}
            </View>
          </View>
          
          <LineChart
            data={weeklyData}
            width={screenWidth - 64}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
            withHorizontalLabels={true}
            withVerticalLabels={true}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderCheckInsList = () => {
    const filteredCheckIns = userRole === 'coach' 
      ? mockCheckIns.filter(checkIn => 
          checkIn.userName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : mockCheckIns.filter(checkIn => checkIn.userId === user.id);

    return (
      <View style={styles.checkInsContainer}>
        <Text style={styles.sectionTitle}>Recent Check-Ins</Text>
        {filteredCheckIns.map((checkIn) => (
          <TouchableOpacity
            key={checkIn.id}
            onPress={() => {
              setSelectedReport(checkIn);
              setShowDetailModal(true);
            }}
          >
            <Card style={styles.checkInCard}>
              <Card.Content>
                <View style={styles.checkInHeader}>
                  <View style={styles.checkInUserInfo}>
                    {checkIn.userAvatar ? (
                      <Avatar.Image size={40} source={{ uri: checkIn.userAvatar }} />
                    ) : (
                      <Avatar.Icon size={40} icon="account" />
                    )}
                    <View style={styles.checkInUserDetails}>
                      <Text style={styles.checkInUserName}>{checkIn.userName}</Text>
                      <Text style={styles.checkInDate}>{checkIn.date} • {checkIn.timestamp}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.checkInScore}>
                    <Text style={styles.checkInScoreEmoji}>
                      {getScoreEmoji(checkIn.overallScore)}
                    </Text>
                    <Text style={[
                      styles.checkInScoreValue,
                      { color: getScoreColor(checkIn.overallScore) }
                    ]}>
                      {checkIn.overallScore}
                    </Text>
                  </View>
                </View>

                <View style={styles.checkInMetrics}>
                  <View style={styles.metricRow}>
                    <View style={styles.metric}>
                      <Icon name="mood" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.metricValue}>{checkIn.mood}/10</Text>
                    </View>
                    <View style={styles.metric}>
                      <Icon name="energy-savings-leaf" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.metricValue}>{checkIn.energy}/10</Text>
                    </View>
                    <View style={styles.metric}>
                      <Icon name="nights-stay" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.metricValue}>{checkIn.sleep}h</Text>
                    </View>
                    <View style={styles.metric}>
                      <Icon name="local-fire-department" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.metricValue}>{checkIn.streak}d</Text>
                    </View>
                  </View>
                </View>

                {checkIn.notes && (
                  <Text style={styles.checkInNotes} numberOfLines={2}>
                    "{checkIn.notes}"
                  </Text>
                )}

                <View style={styles.checkInFooter}>
                  <Chip
                    style={[styles.consistencyChip, { backgroundColor: getScoreColor(checkIn.consistency * 10) }]}
                    textStyle={styles.consistencyChipText}
                    compact
                  >
                    {Math.round(checkIn.consistency * 100)}% Consistent
                  </Chip>
                  <TouchableOpacity style={styles.viewDetailsButton}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Icon name="chevron-right" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCheckInModal = () => (
    <Portal>
      <Modal
        visible={showCheckInModal}
        onDismiss={() => setShowCheckInModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Check-In</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowCheckInModal(false)}
              />
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Mood & Energy Section */}
              <View style={styles.checkInSection}>
                <Text style={styles.sectionLabel}>Mood & Energy</Text>
                
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Mood</Text>
                    <Text style={styles.sliderValue}>{checkInForm.mood}/10</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={checkInForm.mood}
                    onValueChange={(value) => setCheckInForm({ ...checkInForm, mood: value })}
                    minimumTrackTintColor={COLORS.primary}
                    maximumTrackTintColor={COLORS.border}
                    thumbColor={COLORS.primary}
                  />
                </View>

                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Energy Level</Text>
                    <Text style={styles.sliderValue}>{checkInForm.energy}/10</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={checkInForm.energy}
                    onValueChange={(value) => setCheckInForm({ ...checkInForm, energy: value })}
                    minimumTrackTintColor={COLORS.primary}
                    maximumTrackTintColor={COLORS.border}
                    thumbColor={COLORS.primary}
                  />
                </View>

                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Motivation</Text>
                    <Text style={styles.sliderValue}>{checkInForm.motivation}/10</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={checkInForm.motivation}
                    onValueChange={(value) => setCheckInForm({ ...checkInForm, motivation: value })}
                    minimumTrackTintColor={COLORS.primary}
                    maximumTrackTintColor={COLORS.border}
                    thumbColor={COLORS.primary}
                  />
                </View>
              </View>

              {/* Sleep & Recovery Section */}
              <View style={styles.checkInSection}>
                <Text style={styles.sectionLabel}>Sleep & Recovery</Text>
                
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Sleep Hours</Text>
                    <Text style={styles.sliderValue}>{checkInForm.sleep}h</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={4}
                    maximumValue={12}
                    step={0.5}
                    value={checkInForm.sleep}
                    onValueChange={(value) => setCheckInForm({ ...checkInForm, sleep: value })}
                    minimumTrackTintColor={COLORS.success}
                    maximumTrackTintColor={COLORS.border}
                    thumbColor={COLORS.success}
                  />
                </View>

                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Stress Level</Text>
                    <Text style={styles.sliderValue}>{checkInForm.stress}/10</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={checkInForm.stress}
                    onValueChange={(value) => setCheckInForm({ ...checkInForm, stress: value })}
                    minimumTrackTintColor={COLORS.error}
                    maximumTrackTintColor={COLORS.border}
                    thumbColor={COLORS.error}
                  />
                </View>

                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Muscle Soreness</Text>
                    <Text style={styles.sliderValue}>{checkInForm.soreness}/10</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={checkInForm.soreness}
                    onValueChange={(value) => setCheckInForm({ ...checkInForm, soreness: value })}
                    minimumTrackTintColor={COLORS.warning}
                    maximumTrackTintColor={COLORS.border}
                    thumbColor={COLORS.warning}
                  />
                </View>
              </View>

              {/* Nutrition & Hydration Section */}
              <View style={styles.checkInSection}>
                <Text style={styles.sectionLabel}>Nutrition & Hydration</Text>
                
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Nutrition Quality</Text>
                    <Text style={styles.sliderValue}>{checkInForm.nutrition}/10</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={checkInForm.nutrition}
                    onValueChange={(value) => setCheckInForm({ ...checkInForm, nutrition: value })}
                    minimumTrackTintColor={COLORS.success}
                    maximumTrackTintColor={COLORS.border}
                    thumbColor={COLORS.success}
                  />
                </View>

                <View style={styles.sliderContainer}>
                  <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>Hydration Level</Text>
                    <Text style={styles.sliderValue}>{checkInForm.hydration}/10</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={checkInForm.hydration}
                    onValueChange={(value) => setCheckInForm({ ...checkInForm, hydration: value })}
                    minimumTrackTintColor={COLORS.info}
                    maximumTrackTintColor={COLORS.border}
                    thumbColor={COLORS.info}
                  />
                </View>
              </View>

              {/* Body Metrics Section */}
              <View style={styles.checkInSection}>
                <Text style={styles.sectionLabel}>Body Metrics (Optional)</Text>
                
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: SPACING.sm }]}
                    placeholder="Weight (kg)"
                    value={checkInForm.bodyWeight}
                    onChangeText={(text) => setCheckInForm({ ...checkInForm, bodyWeight: text })}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Body Fat (%)"
                    value={checkInForm.bodyFat}
                    onChangeText={(text) => setCheckInForm({ ...checkInForm, bodyFat: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Notes Section */}
              <View style={styles.checkInSection}>
                <Text style={styles.sectionLabel}>How are you feeling today?</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Share your thoughts, concerns, or wins from today..."
                  value={checkInForm.notes}
                  onChangeText={(text) => setCheckInForm({ ...checkInForm, notes: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={300}
                />
                <Text style={styles.characterCount}>{checkInForm.notes.length}/300</Text>
              </View>

              {/* Goals & Challenges */}
              <View style={styles.checkInSection}>
                <Text style={styles.sectionLabel}>Today's Focus</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What are your main goals for today?"
                  value={checkInForm.goals}
                  onChangeText={(text) => setCheckInForm({ ...checkInForm, goals: text })}
                  maxLength={150}
                />
                <TextInput
                  style={[styles.input, { marginTop: SPACING.sm }]}
                  placeholder="Any challenges or concerns?"
                  value={checkInForm.challenges}
                  onChangeText={(text) => setCheckInForm({ ...checkInForm, challenges: text })}
                  maxLength={150}
                />
              </View>

              {/* Predicted Score */}
              <View style={styles.predictedScore}>
                <Text style={styles.predictedScoreLabel}>Predicted Wellness Score</Text>
                <View style={styles.predictedScoreContainer}>
                  <Text style={styles.predictedScoreEmoji}>
                    {getScoreEmoji(calculateOverallScore(checkInForm))}
                  </Text>
                  <Text style={[
                    styles.predictedScoreValue,
                    { color: getScoreColor(calculateOverallScore(checkInForm)) }
                  ]}>
                    {calculateOverallScore(checkInForm).toFixed(1)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowCheckInModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmitCheckIn}
                style={styles.submitButton}
                buttonColor={COLORS.primary}
                disabled={!checkInForm.notes.trim()}
              >
                Submit Check-In
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderDetailModal = () => (
    <Portal>
      <Modal
        visible={showDetailModal}
        onDismiss={() => setShowDetailModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent}>
            {selectedReport && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Check-In Details</Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowDetailModal(false)}
                  />
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Header Info */}
                  <View style={styles.detailHeader}>
                    <View style={styles.detailUserInfo}>
                      {selectedReport.userAvatar ? (
                        <Avatar.Image size={50} source={{ uri: selectedReport.userAvatar }} />
                      ) : (
                        <Avatar.Icon size={50} icon="account" />
                      )}
                      <View style={styles.detailUserDetails}>
                        <Text style={styles.detailUserName}>{selectedReport.userName}</Text>
                        <Text style={styles.detailDate}>
                          {selectedReport.date} • {selectedReport.timestamp}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailScore}>
                      <Text style={styles.detailScoreEmoji}>
                        {getScoreEmoji(selectedReport.overallScore)}
                      </Text>
                      <Text style={[
                        styles.detailScoreValue,
                        { color: getScoreColor(selectedReport.overallScore) }
                      ]}>
                        {selectedReport.overallScore}
                      </Text>
                      <Text style={styles.detailScoreLabel}>Overall Score</Text>
                    </View>
                  </View>

                  {/* Metrics Grid */}
                  <View style={styles.metricsGrid}>
                    {[
                      { key: 'mood', label: 'Mood', value: selectedReport.mood, max: 10, icon: 'mood', color: COLORS.success },
                      { key: 'energy', label: 'Energy', value: selectedReport.energy, max: 10, icon: 'energy-savings-leaf', color: COLORS.info },
                      { key: 'motivation', label: 'Motivation', value: selectedReport.motivation, max: 10, icon: 'psychology', color: COLORS.primary },
                      { key: 'sleep', label: 'Sleep', value: selectedReport.sleep, max: 12, icon: 'nights-stay', color: COLORS.secondary },
                      { key: 'nutrition', label: 'Nutrition', value: selectedReport.nutrition, max: 10, icon: 'restaurant', color: COLORS.success },
                      { key: 'hydration', label: 'Hydration', value: selectedReport.hydration, max: 10, icon: 'water-drop', color: COLORS.info },
                      { key: 'stress', label: 'Stress', value: selectedReport.stress, max: 10, icon: 'psychology-alt', color: COLORS.error, invert: true },
                      { key: 'soreness', label: 'Soreness', value: selectedReport.soreness, max: 10, icon: 'healing', color: COLORS.warning, invert: true },
                    ].map((metric) => (
                      <View key={metric.key} style={styles.metricCard}>
                        <Icon name={metric.icon} size={24} color={metric.color} />
                        <Text style={styles.metricCardValue}>
                          {metric.key === 'sleep' ? `${metric.value}h` : `${metric.value}/${metric.max}`}
                        </Text>
                        <Text style={styles.metricCardLabel}>{metric.label}</Text>
                        <ProgressBar
                          progress={metric.invert ? (metric.max - metric.value) / metric.max : metric.value / metric.max}
                          color={metric.color}
                          style={styles.metricProgress}
                        />
                      </View>
                    ))}
                  </View>

                  {/* Body Metrics */}
                  {(selectedReport.bodyWeight || selectedReport.bodyFat) && (
                    <View style={styles.bodyMetrics}>
                      <Text style={styles.sectionTitle}>Body Metrics</Text>
                      <View style={styles.bodyMetricsRow}>
                        {selectedReport.bodyWeight && (
                          <View style={styles.bodyMetricCard}>
                            <Icon name="monitor-weight" size={20} color={COLORS.primary} />
                            <Text style={styles.bodyMetricValue}>{selectedReport.bodyWeight} kg</Text>
                            <Text style={styles.bodyMetricLabel}>Weight</Text>
                          </View>
                        )}
                        {selectedReport.bodyFat && (
                          <View style={styles.bodyMetricCard}>
                            <Icon name="fitness-center" size={20} color={COLORS.warning} />
                            <Text style={styles.bodyMetricValue}>{selectedReport.bodyFat}%</Text>
                            <Text style={styles.bodyMetricLabel}>Body Fat</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Notes */}
                  {selectedReport.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.sectionTitle}>Notes</Text>
                      <Text style={styles.notesText}>{selectedReport.notes}</Text>
                    </View>
                  )}

                  {/* Goals & Challenges */}
                  <View style={styles.goalsSection}>
                    {selectedReport.goals && (
                      <View style={styles.goalCard}>
                        <View style={styles.goalHeader}>
                          <Icon name="flag" size={20} color={COLORS.success} />
                          <Text style={styles.goalTitle}>Today's Goals</Text>
                        </View>
                        <Text style={styles.goalText}>{selectedReport.goals}</Text>
                      </View>
                    )}
                    
                    {selectedReport.challenges && (
                      <View style={styles.goalCard}>
                        <View style={styles.goalHeader}>
                          <Icon name="warning" size={20} color={COLORS.warning} />
                          <Text style={styles.goalTitle}>Challenges</Text>
                        </View>
                        <Text style={styles.goalText}>{selectedReport.challenges}</Text>
                      </View>
                    )}
                  </View>

                  {/* Stats */}
                  <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Performance Stats</Text>
                    <View style={styles.statsRow}>
                      <View style={styles.statCard}>
                        <Icon name="local-fire-department" size={20} color={COLORS.error} />
                        <Text style={styles.statValue}>{selectedReport.streak}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                      </View>
                      <View style={styles.statCard}>
                        <Icon name="trending-up" size={20} color={COLORS.success} />
                        <Text style={styles.statValue}>{Math.round(selectedReport.consistency * 100)}%</Text>
                        <Text style={styles.statLabel}>Consistency</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                {userRole === 'coach' && (
                  <View style={styles.coachActions}>
                    <Button
                      mode="outlined"
                      onPress={() => Alert.alert('Feature Coming Soon', 'Feedback functionality will be available soon!')}
                      style={styles.feedbackButton}
                      icon="comment"
                    >
                      Add Feedback
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => Alert.alert('Feature Coming Soon', 'Contact functionality will be available soon!')}
                      style={styles.contactButton}
                      buttonColor={COLORS.primary}
                      icon="message"
                    >
                      Message Player
                    </Button>
                  </View>
                )}
              </>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            {renderOverviewCards()}
            {renderTrendsChart()}
            {renderCheckInsList()}
          </>
        );
      case 'trends':
        return (
          <>
            {renderTrendsChart()}
            <Card style={styles.chartCard}>
              <Card.Content>
                <Text style={styles.chartTitle}>Wellness Distribution</Text>
                <BarChart
                  data={{
                    labels: ['Mood', 'Energy', 'Sleep', 'Nutrition'],
                    datasets: [{ data: [8.2, 7.8, 7.5, 8.0] }],
                  }}
                  width={screenWidth - 64}
                  height={200}
                  chartConfig={chartConfig}
                  style={styles.chart}
                />
              </Card.Content>
            </Card>
          </>
        );
      case 'individual':
      case 'team':
        return renderCheckInsList();
      default:
        return renderCheckInsList();
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ProgressBar indeterminate color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading check-in reports...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
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
          {renderContent()}
          <View style={styles.contentPadding} />
        </ScrollView>
      )}

      {userRole !== 'coach' && (
        <FAB
          style={styles.fab}
          icon="add"
          onPress={() => setShowCheckInModal(true)}
          color={COLORS.surface}
          label="Check-In"
        />
      )}

      {renderCheckInModal()}
      {renderDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 0,
    marginBottom: SPACING.md,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingBottom: SPACING.xs,
  },
  tabChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedTabChip: {
    backgroundColor: COLORS.surface,
  },
  tabChipText: {
    color: COLORS.surface,
    fontSize: 12,
  },
  selectedTabChipText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
  },
  overviewCard: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 3,
  },
  overviewCardContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  overviewCardValue: {
    ...TEXT_STYLES.h1,
    color: COLORS.surface,
    marginVertical: SPACING.xs,
  },
  overviewCardLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  overviewCardChange: {
    ...TEXT_STYLES.small,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 3,
    marginVertical: SPACING.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTitle: {
    ...TEXT_STYLES.h3,
  },
  periodSelector: {
    flexDirection: 'row',
  },
  periodChip: {
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  selectedPeriodChip: {
    backgroundColor: COLORS.primary,
  },
  chart: {
    borderRadius: 16,
    marginVertical: SPACING.sm,
  },
  checkInsContainer: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  checkInCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 3,
    marginBottom: SPACING.md,
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkInUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkInUserDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  checkInUserName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  checkInDate: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  checkInScore: {
    alignItems: 'center',
  },
  checkInScoreEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  checkInScoreValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  checkInMetrics: {
    marginBottom: SPACING.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    ...TEXT_STYLES.small,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  checkInNotes: {
    ...TEXT_STYLES.body,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  checkInFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consistencyChip: {
    height: 28,
  },
  consistencyChipText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  loadingText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
  },
  modalBody: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  checkInSection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  sliderContainer: {
    marginBottom: SPACING.lg,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sliderLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  sliderValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  inputRow: {
    flexDirection: 'row',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: COLORS.surface,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    ...TEXT_STYLES.small,
    textAlign: 'right',
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },
  predictedScore: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
  },
  predictedScoreLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.sm,
  },
  predictedScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictedScoreEmoji: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  predictedScoreValue: {
    ...TEXT_STYLES.h1,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 0.4,
    borderColor: COLORS.textSecondary,
  },
  submitButton: {
    flex: 0.4,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  detailUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailUserDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  detailUserName: {
    ...TEXT_STYLES.h3,
  },
  detailDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  detailScore: {
    alignItems: 'center',
  },
  detailScoreEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  detailScoreValue: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
  },
  detailScoreLabel: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metricCardValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginVertical: SPACING.xs,
  },
  metricCardLabel: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  metricProgress: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  bodyMetrics: {
    marginBottom: SPACING.xl,
  },
  bodyMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bodyMetricCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    minWidth: 120,
  },
  bodyMetricValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginVertical: SPACING.xs,
  },
  bodyMetricLabel: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  notesSection: {
    marginBottom: SPACING.xl,
  },
  notesText: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
  },
  goalsSection: {
    marginBottom: SPACING.xl,
  },
  goalCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  goalText: {
    ...TEXT_STYLES.body,
    lineHeight: 20,
  },
  statsSection: {
    marginBottom: SPACING.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    minWidth: 120,
  },
  statValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginVertical: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  coachActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  feedbackButton: {
    flex: 0.48,
    borderColor: COLORS.primary,
  },
  contactButton: {
    flex: 0.48,
  },
  contentPadding: {
    height: 100,
  },
});

export default CheckInReportsScreen;