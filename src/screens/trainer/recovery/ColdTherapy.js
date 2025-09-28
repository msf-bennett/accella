import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Vibration,
  Platform,
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
  Portal,
  Modal,
  Searchbar,
  Badge,
  Switch,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import design constants
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';

const { width } = Dimensions.get('window');

const ColdTherapy = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, coldTherapyData, isLoading } = useSelector(state => state.user);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProtocol, setActiveProtocol] = useState('beginner');
  const [modalVisible, setModalVisible] = useState(false);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [selectedTherapy, setSelectedTherapy] = useState(null);
  const [completedSessions, setCompletedSessions] = useState(new Set());
  const [streakCount, setStreakCount] = useState(coldTherapyData?.streak || 0);
  const [weeklyProgress, setWeeklyProgress] = useState(0.45);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [targetTime, setTargetTime] = useState(60);
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const [safetyReminders, setSafetyReminders] = useState(true);

  // Cold therapy protocols
  const therapyProtocols = [
    { id: 'beginner', name: 'Beginner', icon: 'ac-unit', color: '#2196F3' },
    { id: 'intermediate', name: 'Intermediate', icon: 'severe-cold', color: '#1976D2' },
    { id: 'advanced', name: 'Advanced', icon: 'ice-skating', color: '#0D47A1' },
    { id: 'recovery', name: 'Recovery', icon: 'healing', color: '#4CAF50' },
  ];

  // Cold therapy methods
  const coldTherapyMethods = [
    {
      id: 1,
      title: 'Cold Shower Protocol',
      protocol: 'beginner',
      duration: '2-5 min',
      temperature: { celsius: '10-15°C', fahrenheit: '50-59°F' },
      difficulty: 'Beginner',
      points: 75,
      description: 'Gradual cold exposure through controlled cold showers',
      benefits: ['Improved circulation', 'Mental resilience', 'Faster recovery'],
      instructions: [
        'Start with lukewarm water',
        'Gradually decrease temperature',
        'Focus on deep breathing',
        'End with 30 seconds of coldest setting'
      ],
      safetyTips: [
        'Never exceed 10 minutes',
        'Exit immediately if dizzy',
        'Avoid if you have heart conditions'
      ],
      category: 'hydrotherapy',
    },
    {
      id: 2,
      title: 'Ice Bath Immersion',
      protocol: 'intermediate',
      duration: '3-8 min',
      temperature: { celsius: '2-10°C', fahrenheit: '35-50°F' },
      difficulty: 'Intermediate',
      points: 120,
      description: 'Full body cold water immersion for maximum benefits',
      benefits: ['Reduced inflammation', 'Enhanced recovery', 'Improved metabolism'],
      instructions: [
        'Fill tub with cold water and ice',
        'Enter slowly, legs first',
        'Maintain steady breathing',
        'Submerge up to chest level'
      ],
      safetyTips: [
        'Have someone nearby',
        'Monitor skin color changes',
        'Keep head above water'
      ],
      category: 'immersion',
    },
    {
      id: 3,
      title: 'Cryotherapy Session',
      protocol: 'advanced',
      duration: '2-4 min',
      temperature: { celsius: '-85 to -100°C', fahrenheit: '-121 to -148°F' },
      difficulty: 'Advanced',
      points: 150,
      description: 'Whole body cryotherapy for elite recovery',
      benefits: ['Rapid recovery', 'Pain relief', 'Hormonal optimization'],
      instructions: [
        'Enter cryotherapy chamber',
        'Keep moving constantly',
        'Breathe normally',
        'Follow technician guidance'
      ],
      safetyTips: [
        'Professional supervision required',
        'Dry skin completely first',
        'Wear protective gear'
      ],
      category: 'cryotherapy',
    },
    {
      id: 4,
      title: 'Cold Plunge Pool',
      protocol: 'intermediate',
      duration: '1-3 min',
      temperature: { celsius: '4-10°C', fahrenheit: '39-50°F' },
      difficulty: 'Intermediate',
      points: 100,
      description: 'Natural cold water plunging for mental toughness',
      benefits: ['Mental clarity', 'Stress resilience', 'Better sleep'],
      instructions: [
        'Enter gradually',
        'Control breathing rhythm',
        'Stay calm and focused',
        'Exit when comfortable'
      ],
      safetyTips: [
        'Check water conditions',
        'Never plunge alone',
        'Know your limits'
      ],
      category: 'natural',
    },
    {
      id: 5,
      title: 'Contrast Therapy',
      protocol: 'recovery',
      duration: '15-20 min',
      temperature: { celsius: 'Hot: 38-42°C, Cold: 10-15°C', fahrenheit: 'Hot: 100-108°F, Cold: 50-59°F' },
      difficulty: 'Beginner',
      points: 90,
      description: 'Alternating hot and cold exposure for circulation',
      benefits: ['Enhanced circulation', 'Reduced soreness', 'Faster healing'],
      instructions: [
        'Start with 3-4 min hot',
        'Switch to 1 min cold',
        'Repeat 3-4 cycles',
        'End with cold exposure'
      ],
      safetyTips: [
        'Gradual temperature changes',
        'Stay hydrated',
        'Monitor comfort level'
      ],
      category: 'contrast',
    },
  ];

  // Filter methods based on search and protocol
  const filteredMethods = coldTherapyMethods.filter(method => {
    const matchesSearch = method.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         method.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProtocol = activeProtocol === 'all' || method.protocol === activeProtocol;
    return matchesSearch && matchesProtocol;
  });

  // Timer functionality
  const timerInterval = useRef(null);

  useEffect(() => {
    if (isTimerRunning && currentTime > 0) {
      timerInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            Vibration.vibrate([500, 200, 500, 200, 500]);
            Alert.alert('⏰ Time Complete!', 'Great job! Cold therapy session completed successfully.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerInterval.current);
    }

    return () => clearInterval(timerInterval.current);
  }, [isTimerRunning, currentTime]);

  // Animation setup
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
  }, []);

  // Timer animation
  useEffect(() => {
    if (isTimerRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(timerAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(timerAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      timerAnim.setValue(1);
    }
  }, [isTimerRunning]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchColdTherapyData());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh cold therapy data');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Handle session completion
  const handleSessionComplete = useCallback((methodId) => {
    Vibration.vibrate([50, 100, 50]);
    setCompletedSessions(prev => new Set([...prev, methodId]));
    
    const method = coldTherapyMethods.find(m => m.id === methodId);
    if (method) {
      Alert.alert(
        '🧊 Session Completed!',
        `Excellent work! You earned ${method.points} points for completing ${method.title}. Your mental resilience is growing stronger!`,
        [{ text: 'Amazing!', style: 'default' }]
      );
      
      setStreakCount(prev => prev + 1);
      setWeeklyProgress(prev => Math.min(prev + 0.15, 1));
    }
  }, []);

  // Handle method selection
  const handleMethodPress = useCallback((method) => {
    setSelectedTherapy(method);
    setModalVisible(true);
  }, []);

  // Start timer
  const startTimer = useCallback((duration) => {
    setTargetTime(duration * 60);
    setCurrentTime(duration * 60);
    setTimerModalVisible(true);
  }, []);

  // Timer controls
  const handleStartTimer = () => setIsTimerRunning(true);
  const handlePauseTimer = () => setIsTimerRunning(false);
  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setCurrentTime(targetTime);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get protocol color
  const getProtocolColor = (protocolId) => {
    const protocol = therapyProtocols.find(p => p.id === protocolId);
    return protocol ? protocol.color : '#2196F3';
  };

  // Get temperature display
  const getTemperatureDisplay = (tempObj) => {
    return temperatureUnit === 'celsius' ? tempObj.celsius : tempObj.fahrenheit;
  };

  // Render protocol chips
  const renderProtocolChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.protocolsContainer}
      contentContainerStyle={{ paddingHorizontal: SPACING.medium }}
    >
      {therapyProtocols.map((protocol) => (
        <Chip
          key={protocol.id}
          mode={activeProtocol === protocol.id ? 'flat' : 'outlined'}
          selected={activeProtocol === protocol.id}
          onPress={() => setActiveProtocol(protocol.id)}
          style={[
            styles.protocolChip,
            activeProtocol === protocol.id && {
              backgroundColor: protocol.color,
            }
          ]}
          textStyle={[
            styles.chipText,
            activeProtocol === protocol.id && styles.selectedChipText
          ]}
          icon={() => (
            <Icon 
              name={protocol.icon} 
              size={16} 
              color={activeProtocol === protocol.id ? 'white' : protocol.color} 
            />
          )}
        >
          {protocol.name}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render stats card
  const renderStatsCard = () => (
    <Surface style={styles.statsCard} elevation={2}>
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.statsGradient}
      >
        <View style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{streakCount}</Text>
            <Text style={styles.statLabel}>Cold Streak 🧊</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Math.round(weeklyProgress * 100)}%</Text>
            <Text style={styles.statLabel}>Weekly Goal</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedSessions.size}</Text>
            <Text style={styles.statLabel}>Sessions Today</Text>
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Weekly Cold Exposure Progress</Text>
          <ProgressBar 
            progress={weeklyProgress} 
            color="white" 
            style={styles.progressBar}
          />
        </View>

        {/* Settings Row */}
        <View style={styles.settingsRow}>
          <View style={styles.settingItem}>
            <Icon name="thermostat" size={20} color="white" />
            <Text style={styles.settingLabel}>°{temperatureUnit === 'celsius' ? 'C' : 'F'}</Text>
            <Switch
              value={temperatureUnit === 'fahrenheit'}
              onValueChange={(value) => setTemperatureUnit(value ? 'fahrenheit' : 'celsius')}
              thumbColor="white"
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.5)' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Icon name="security" size={20} color="white" />
            <Text style={styles.settingLabel}>Safety</Text>
            <Switch
              value={safetyReminders}
              onValueChange={setSafetyReminders}
              thumbColor="white"
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.5)' }}
            />
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  // Render method card
  const renderMethodCard = ({ item }) => {
    const isCompleted = completedSessions.has(item.id);
    const protocolColor = getProtocolColor(item.protocol);
    
    return (
      <TouchableOpacity 
        onPress={() => handleMethodPress(item)}
        activeOpacity={0.8}
      >
        <Card style={[styles.methodCard, isCompleted && styles.completedCard]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>{item.title}</Text>
                <View style={styles.methodMeta}>
                  <Chip 
                    mode="outlined" 
                    compact
                    style={[styles.protocolBadge, { borderColor: protocolColor }]}
                    textStyle={[styles.protocolBadgeText, { color: protocolColor }]}
                  >
                    {item.protocol}
                  </Chip>
                  <Text style={styles.duration}>{item.duration}</Text>
                  <Text style={styles.difficulty}>{item.difficulty}</Text>
                </View>
                <Text style={styles.temperature}>
                  {getTemperatureDisplay(item.temperature)}
                </Text>
              </View>
              
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>{item.points}</Text>
                <Text style={styles.pointsLabel}>pts</Text>
              </View>
            </View>
            
            <Text style={styles.description}>{item.description}</Text>
            
            <View style={styles.cardFooter}>
              <View style={styles.benefits}>
                {item.benefits.slice(0, 2).map((benefit, index) => (
                  <Chip key={index} compact mode="outlined" style={styles.benefitChip}>
                    {benefit}
                  </Chip>
                ))}
              </View>
              
              <View style={styles.cardActions}>
                <IconButton
                  icon="timer"
                  size={20}
                  onPress={() => startTimer(parseInt(item.duration.split('-')[0]))}
                  style={styles.timerButton}
                  iconColor={protocolColor}
                />
                <Button
                  mode={isCompleted ? "outlined" : "contained"}
                  onPress={() => isCompleted ? null : handleSessionComplete(item.id)}
                  disabled={isCompleted}
                  style={styles.actionButton}
                  icon={isCompleted ? "check-circle" : "play-arrow"}
                  buttonColor={isCompleted ? 'transparent' : protocolColor}
                  compact
                >
                  {isCompleted ? 'Done' : 'Start'}
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  // Render timer modal
  const renderTimerModal = () => (
    <Portal>
      <Modal 
        visible={timerModalVisible} 
        onDismiss={() => {
          setTimerModalVisible(false);
          setIsTimerRunning(false);
          setCurrentTime(targetTime);
        }}
        contentContainerStyle={styles.timerModalContainer}
      >
        <BlurView style={StyleSheet.absoluteFill} blurType="dark" blurAmount={15} />
        
        <Surface style={styles.timerModalContent}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.timerGradient}
          >
            <Text style={styles.timerTitle}>Cold Therapy Timer</Text>
            
            <Animated.View 
              style={[
                styles.timerDisplay,
                { transform: [{ scale: timerAnim }] }
              ]}
            >
              <Text style={styles.timerText}>{formatTime(currentTime)}</Text>
            </Animated.View>
            
            <View style={styles.timerProgress}>
              <ProgressBar 
                progress={currentTime / targetTime} 
                color="white" 
                style={styles.timerProgressBar}
              />
              <Text style={styles.timerProgressText}>
                {Math.round((currentTime / targetTime) * 100)}% remaining
              </Text>
            </View>
            
            <View style={styles.timerControls}>
              <IconButton
                icon={isTimerRunning ? "pause" : "play-arrow"}
                size={32}
                onPress={isTimerRunning ? handlePauseTimer : handleStartTimer}
                iconColor="white"
                style={styles.timerControlButton}
              />
              <IconButton
                icon="refresh"
                size={28}
                onPress={handleResetTimer}
                iconColor="white"
                style={styles.timerControlButton}
              />
              <IconButton
                icon="close"
                size={28}
                onPress={() => setTimerModalVisible(false)}
                iconColor="white"
                style={styles.timerControlButton}
              />
            </View>
            
            {safetyReminders && (
              <View style={styles.safetyReminder}>
                <Icon name="warning" size={16} color="#FFF59D" />
                <Text style={styles.safetyText}>
                  Exit immediately if you feel dizzy or uncomfortable
                </Text>
              </View>
            )}
          </LinearGradient>
        </Surface>
      </Modal>
    </Portal>
  );

  // Render method detail modal
  const renderMethodModal = () => (
    <Portal>
      <Modal 
        visible={modalVisible} 
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={StyleSheet.absoluteFill} blurType="dark" blurAmount={10} />
        
        {selectedTherapy && (
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTherapy.title}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>{selectedTherapy.description}</Text>
              
              <View style={styles.modalMeta}>
                <View style={styles.metaItem}>
                  <Icon name="schedule" size={20} color="#2196F3" />
                  <Text style={styles.metaText}>{selectedTherapy.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="thermostat" size={20} color="#2196F3" />
                  <Text style={styles.metaText}>{getTemperatureDisplay(selectedTherapy.temperature)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="star" size={20} color="#2196F3" />
                  <Text style={styles.metaText}>{selectedTherapy.points} points</Text>
                </View>
              </View>
              
              <Text style={styles.sectionTitle}>Instructions</Text>
              {selectedTherapy.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>{index + 1}</Text>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
              
              <Text style={styles.sectionTitle}>Benefits</Text>
              {selectedTherapy.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Safety Tips</Text>
              {selectedTherapy.safetyTips.map((tip, index) => (
                <View key={index} style={styles.safetyItem}>
                  <Icon name="warning" size={16} color="#FF9800" />
                  <Text style={styles.safetyItemText}>{tip}</Text>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setModalVisible(false);
                  startTimer(parseInt(selectedTherapy.duration.split('-')[0]));
                }}
                style={styles.timerActionButton}
                icon="timer"
              >
                Start Timer
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  handleSessionComplete(selectedTherapy.id);
                  setModalVisible(false);
                }}
                style={styles.startButton}
                icon="play-arrow"
                disabled={completedSessions.has(selectedTherapy.id)}
              >
                {completedSessions.has(selectedTherapy.id) ? 'Completed' : 'Start Session'}
              </Button>
            </View>
          </Surface>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Cold Therapy</Text>
        <Text style={styles.headerSubtitle}>Build resilience through cold exposure 🧊</Text>
      </LinearGradient>
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
            progressBackgroundColor="white"
          />
        }
        opacity={fadeAnim}
        transform={[{ translateY: slideAnim }]}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search cold therapy methods..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#2196F3"
            inputStyle={styles.searchInput}
          />
        </View>

        {/* Stats Card */}
        {renderStatsCard()}

        {/* Protocol Chips */}
        {renderProtocolChips()}

        {/* Methods Section */}
        <View style={styles.methodsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Cold Therapy Methods</Text>
            <Badge style={styles.countBadge}>{filteredMethods.length}</Badge>
          </View>
          
          {filteredMethods.map(method => renderMethodCard({ item: method }))}
          
          {filteredMethods.length === 0 && (
            <Surface style={styles.emptyState}>
              <Icon name="search-off" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateTitle}>No methods found</Text>
              <Text style={styles.emptyStateText}>Try adjusting your search or protocol filter</Text>
            </Surface>
          )}
        </View>

        {/* Science & Benefits Section */}
        <Surface style={styles.scienceCard}>
          <View style={styles.scienceHeader}>
            <Icon name="science" size={24} color="#2196F3" />
            <Text style={styles.scienceTitle}>The Science of Cold Therapy</Text>
          </View>
          <Text style={styles.scienceText}>
            Cold exposure activates brown fat, increases norepinephrine by 200-300%, 
            and triggers cold shock proteins that enhance recovery and mental resilience. 
            Regular practice builds both physical and psychological strength.
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => Alert.alert('Coming Soon', 'Detailed scientific research will be available soon!')}
            style={styles.scienceButton}
          >
            Learn More
          </Button>
        </Surface>
      </Animated.ScrollView>

      {/* Method Detail Modal */}
      {renderMethodModal()}

      {/* Timer Modal */}
      {renderTimerModal()}

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="timer"
        onPress={() => Alert.alert('Quick Timer', 'Select a method above to start a guided cold therapy session!')}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.large,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
  headerTitle: {
    ...TEXT_STYLES.heading1,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  statsCard: {
    marginHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.large,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.heading2,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xsmall,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressSection: {
    marginTop: SPACING.medium,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginBottom: SPACING.small,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.large,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginHorizontal: SPACING.small,
  },
  protocolsContainer: {
    marginVertical: SPACING.medium,
  },
  protocolChip: {
    marginRight: SPACING.small,
  },
  chipText: {
    ...TEXT_STYLES.caption,
  },
  selectedChipText: {
    color: 'white',
  },
  methodsSection: {
    paddingHorizontal: SPACING.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  sectionHeaderText: {
    ...TEXT_STYLES.heading3,
    fontWeight: 'bold',
  },
  countBadge: {
    backgroundColor: '#2196F3',
  },
  methodCard: {
    marginBottom: SPACING.medium,
    borderRadius: 12,
  },
  completedCard: {
    opacity: 0.7,
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.small,
  },
  methodInfo: {
    flex: 1,
    marginRight: SPACING.medium,
  },
  methodTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  methodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: SPACING.xsmall,
  },
  protocolBadge: {
    marginRight: SPACING.small,
    marginBottom: SPACING.xsmall,
  },
  protocolBadgeText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  duration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginRight: SPACING.small,
  },
  difficulty: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  temperature: {
    ...TEXT_STYLES.body,
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  pointsBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xsmall,
    alignItems: 'center',
  },
  pointsText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
  },
  pointsLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  benefits: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitChip: {
    marginRight: SPACING.xsmall,
    marginBottom: SPACING.xsmall,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerButton: {
    margin: 0,
    marginRight: SPACING.xsmall,
  },
  actionButton: {
    borderRadius: 20,
  },
  scienceCard: {
    marginHorizontal: SPACING.medium,
    marginTop: SPACING.large,
    padding: SPACING.large,
    borderRadius: 12,
  },
  scienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  scienceTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginLeft: SPACING.small,
  },
  scienceText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
    lineHeight: 22,
  },
  scienceButton: {
    borderColor: '#2196F3',
  },
  emptyState: {
    padding: SPACING.xlarge,
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginTop: SPACING.medium,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.small,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.medium,
  },
  modalContent: {
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.heading3,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    margin: 0,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    margin: SPACING.large,
    marginTop: SPACING.medium,
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xsmall,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginHorizontal: SPACING.large,
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.xsmall,
  },
  instructionNumber: {
    ...TEXT_STYLES.body,
    color: '#2196F3',
    fontWeight: 'bold',
    width: 20,
    marginRight: SPACING.small,
  },
  instructionText: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.xsmall,
  },
  benefitText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.small,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.xsmall,
  },
  safetyItemText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.small,
    color: '#FF9800',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: 'space-between',
  },
  timerActionButton: {
    flex: 1,
    marginRight: SPACING.small,
    borderColor: '#2196F3',
  },
  startButton: {
    flex: 1,
    marginLeft: SPACING.small,
    borderRadius: 25,
  },
  timerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
  },
  timerModalContent: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  timerGradient: {
    padding: SPACING.xlarge,
    alignItems: 'center',
  },
  timerTitle: {
    ...TEXT_STYLES.heading2,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.large,
  },
  timerDisplay: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.large,
    borderWidth: 3,
    borderColor: 'white',
  },
  timerText: {
    ...TEXT_STYLES.heading1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 36,
  },
  timerProgress: {
    width: '100%',
    marginBottom: SPACING.large,
  },
  timerProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.small,
  },
  timerProgressText: {
    ...TEXT_STYLES.body,
    color: 'white',
    textAlign: 'center',
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  timerControlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: SPACING.small,
  },
  safetyReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 245, 157, 0.2)',
    padding: SPACING.medium,
    borderRadius: 10,
    marginTop: SPACING.medium,
  },
  safetyText: {
    ...TEXT_STYLES.body,
    color: '#FFF59D',
    marginLeft: SPACING.small,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.medium,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

