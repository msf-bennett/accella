import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
  Vibration,
  FlatList
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
  TextInput,
  Searchbar,
  Portal,
  Modal,
  RadioButton,
  Divider,
  Badge
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  water: '#00BCD4',
  waterLight: '#B2EBF2',
  waterDark: '#0097A7'
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
  button: { fontSize: 16, fontWeight: '600' }
};

const { width, height } = Dimensions.get('window');

const HydrationTracking = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const waterWaveAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tracker');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddWaterModal, setShowAddWaterModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  // Hydration state
  const [dailyGoal, setDailyGoal] = useState(2500); // ml
  const [currentIntake, setCurrentIntake] = useState(1250); // ml
  const [hydrationHistory, setHydrationHistory] = useState([
    { id: 1, amount: 250, timestamp: new Date(Date.now() - 3600000), type: 'water' },
    { id: 2, amount: 500, timestamp: new Date(Date.now() - 7200000), type: 'water' },
    { id: 3, amount: 300, timestamp: new Date(Date.now() - 10800000), type: 'sports_drink' },
    { id: 4, amount: 200, timestamp: new Date(Date.now() - 14400000), type: 'tea' }
  ]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Redux state
  const dispatch = useDispatch();
  const { user, clients } = useSelector(state => state.auth || {});

  // Quick add amounts
  const quickAmounts = [
    { amount: 250, label: '250ml', icon: '🥤', description: 'Small glass' },
    { amount: 500, label: '500ml', icon: '🧴', description: 'Water bottle' },
    { amount: 750, label: '750ml', icon: '🍶', description: 'Large bottle' },
    { amount: 1000, label: '1L', icon: '🏺', description: 'Big bottle' }
  ];

  // Drink types
  const drinkTypes = {
    water: { name: 'Water', icon: '💧', color: COLORS.water, multiplier: 1.0 },
    sports_drink: { name: 'Sports Drink', icon: '⚡', color: COLORS.warning, multiplier: 0.8 },
    tea: { name: 'Tea', icon: '🍵', color: COLORS.success, multiplier: 0.7 },
    coffee: { name: 'Coffee', icon: '☕', color: '#8D6E63', multiplier: 0.6 },
    juice: { name: 'Juice', icon: '🧃', color: COLORS.accent, multiplier: 0.5 }
  };

  // Weekly streak data (mock)
  const [weeklyStreak, setWeeklyStreak] = useState([
    { day: 'Mon', percentage: 85, achieved: true },
    { day: 'Tue', percentage: 92, achieved: true },
    { day: 'Wed', percentage: 78, achieved: false },
    { day: 'Thu', percentage: 95, achieved: true },
    { day: 'Fri', percentage: 100, achieved: true },
    { day: 'Sat', percentage: 88, achieved: true },
    { day: 'Sun', percentage: 70, achieved: false }
  ]);

  // Animation setup
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
      })
    ]).start();

    // Water wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(waterWaveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(waterWaveAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Bubble animation
    Animated.loop(
      Animated.timing(bubbleAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Calculate progress percentage
  const progressPercentage = Math.min((currentIntake / dailyGoal) * 100, 100);
  const remainingAmount = Math.max(dailyGoal - currentIntake, 0);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Add water intake
  const addWaterIntake = useCallback((amount, type = 'water') => {
    const effectiveAmount = amount * drinkTypes[type].multiplier;
    const newEntry = {
      id: Date.now(),
      amount: amount,
      effectiveAmount: Math.round(effectiveAmount),
      timestamp: new Date(),
      type: type
    };

    setHydrationHistory(prev => [newEntry, ...prev]);
    setCurrentIntake(prev => prev + Math.round(effectiveAmount));
    setShowAddWaterModal(false);
    setCustomAmount('');

    Vibration.vibrate(50);
    
    const newTotal = currentIntake + Math.round(effectiveAmount);
    if (newTotal >= dailyGoal && currentIntake < dailyGoal) {
      Alert.alert(
        '🎉 Goal Achieved!',
        'Congratulations! Daily hydration goal reached!',
        [{ text: 'Awesome!', onPress: () => setShowStreakModal(true) }]
      );
    } else {
      Alert.alert(
        'Added! 💧',
        `${amount}ml of ${drinkTypes[type].name} added\n${remainingAmount - Math.round(effectiveAmount)}ml remaining`
      );
    }
  }, [currentIntake, dailyGoal, remainingAmount]);

  // Quick add water
  const quickAddWater = useCallback((amount) => {
    addWaterIntake(amount, 'water');
  }, [addWaterIntake]);

  // Remove entry
  const removeEntry = useCallback((entryId) => {
    const entry = hydrationHistory.find(item => item.id === entryId);
    if (!entry) return;

    Alert.alert(
      'Remove Entry?',
      `Remove ${entry.amount}ml of ${drinkTypes[entry.type].name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setHydrationHistory(prev => prev.filter(item => item.id !== entryId));
            setCurrentIntake(prev => prev - (entry.effectiveAmount || entry.amount));
            Vibration.vibrate(100);
          }
        }
      ]
    );
  }, [hydrationHistory]);

  // Filter clients
  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.water, COLORS.waterDark]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <IconButton
          icon="arrow-back"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerTextContainer}>
          <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
            💧 Hydration Tracker
          </Text>
          <Text style={styles.headerSubtitle}>
            Monitor daily water intake for optimal health
          </Text>
        </View>
        <Avatar.Icon size={40} icon="water-drop" style={styles.headerAvatar} />
      </View>
    </LinearGradient>
  );

  const renderTabSelector = () => (
    <Surface style={styles.tabContainer} elevation={2}>
      <View style={styles.tabRow}>
        {['tracker', 'history', 'goals'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => {
              setActiveTab(tab);
              Vibration.vibrate(30);
            }}
          >
            <Icon
              name={tab === 'tracker' ? 'water-drop' : tab === 'history' ? 'history' : 'flag'}
              size={20}
              color={activeTab === tab ? COLORS.water : COLORS.textSecondary}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );

  const renderClientSelector = () => (
    <View style={styles.clientSection}>
      <Searchbar
        placeholder="Search clients..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.water}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientScroll}>
        {filteredClients.map((client) => (
          <TouchableOpacity
            key={client.id}
            style={[
              styles.clientCard,
              selectedClient?.id === client.id && styles.selectedClientCard
            ]}
            onPress={() => setSelectedClient(client)}
          >
            <Avatar.Text
              size={50}
              label={client.name.charAt(0)}
              style={styles.clientAvatar}
            />
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientAge}>{client.age}y</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderWaterProgress = () => (
    <Animated.View style={[
      styles.progressContainer,
      {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }
    ]}>
      <Card style={styles.progressCard} elevation={6}>
        <Card.Content>
          <View style={styles.progressHeader}>
            <Text style={[TEXT_STYLES.h3, styles.progressTitle]}>
              Today's Progress
            </Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => {
                Alert.alert('Date Picker', 'Feature Coming Soon! 📅');
              }}
            >
              <Text style={styles.dateText}>
                {selectedDate.toDateString().split(' ').slice(0, 3).join(' ')}
              </Text>
              <Icon name="calendar-today" size={16} color={COLORS.water} />
            </TouchableOpacity>
          </View>

          <View style={styles.waterBottleContainer}>
            <View style={styles.waterBottle}>
              <Animated.View
                style={[
                  styles.waterLevel,
                  {
                    height: `${progressPercentage}%`,
                    opacity: waterWaveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1]
                    })
                  }
                ]}
              />
              <View style={styles.bottleOverlay}>
                <Text style={styles.progressPercentage}>
                  {Math.round(progressPercentage)}%
                </Text>
                <Text style={styles.progressAmount}>
                  {currentIntake}ml
                </Text>
              </View>
              
              {/* Animated bubbles */}
              <Animated.View
                style={[
                  styles.bubble,
                  styles.bubble1,
                  {
                    opacity: bubbleAnim,
                    transform: [{
                      translateY: bubbleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -20]
                      })
                    }]
                  }
                ]}
              />
              <Animated.View
                style={[
                  styles.bubble,
                  styles.bubble2,
                  {
                    opacity: bubbleAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1, 0]
                    }),
                    transform: [{
                      translateY: bubbleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -30]
                      })
                    }]
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Goal</Text>
              <Text style={styles.statValue}>{dailyGoal}ml</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={[styles.statValue, { color: remainingAmount > 0 ? COLORS.warning : COLORS.success }]}>
                {remainingAmount}ml
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Entries</Text>
              <Text style={styles.statValue}>{hydrationHistory.length}</Text>
            </View>
          </View>

          <ProgressBar
            progress={progressPercentage / 100}
            color={COLORS.water}
            style={styles.mainProgressBar}
          />
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderQuickAdd = () => (
    <Animated.View style={[
      styles.quickAddContainer,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <Card style={styles.quickAddCard} elevation={4}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.quickAddTitle]}>
            ⚡ Quick Add
          </Text>
          
          <View style={styles.quickAddGrid}>
            {quickAmounts.map((item) => (
              <TouchableOpacity
                key={item.amount}
                style={styles.quickAddButton}
                onPress={() => quickAddWater(item.amount)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[COLORS.water, COLORS.waterDark]}
                  style={styles.quickAddGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.quickAddIcon}>{item.icon}</Text>
                  <Text style={styles.quickAddLabel}>{item.label}</Text>
                  <Text style={styles.quickAddDescription}>{item.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            mode="outlined"
            onPress={() => setShowAddWaterModal(true)}
            style={styles.customAddButton}
            contentStyle={styles.customAddContent}
            labelStyle={styles.customAddLabel}
            icon="add-circle"
          >
            Custom Amount
          </Button>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderRecentEntries = () => (
    <Animated.View style={[
      styles.entriesContainer,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <Card style={styles.entriesCard} elevation={4}>
        <Card.Content>
          <View style={styles.entriesHeader}>
            <Text style={[TEXT_STYLES.h3, styles.entriesTitle]}>
              📝 Recent Entries
            </Text>
            <Badge size={24} style={[styles.entriesBadge, { backgroundColor: COLORS.water }]}>
              {hydrationHistory.length}
            </Badge>
          </View>

          {hydrationHistory.length > 0 ? (
            <FlatList
              data={hydrationHistory.slice(0, 5)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.entryItem}>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryIcon}>
                      {drinkTypes[item.type].icon}
                    </Text>
                    <View style={styles.entryDetails}>
                      <Text style={styles.entryAmount}>
                        {item.amount}ml {drinkTypes[item.type].name}
                      </Text>
                      <Text style={styles.entryTime}>
                        {item.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {item.effectiveAmount && item.effectiveAmount !== item.amount && (
                          <Text style={styles.effectiveAmount}>
                            {' '}(~{item.effectiveAmount}ml hydration)
                          </Text>
                        )}
                      </Text>
                    </View>
                  </View>
                  <IconButton
                    icon="delete"
                    iconColor={COLORS.error}
                    size={20}
                    onPress={() => removeEntry(item.id)}
                  />
                </View>
              )}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyEntries}>
              <Icon name="water-drop" size={60} color={COLORS.textSecondary} />
              <Text style={styles.emptyEntriesText}>
                No hydration entries yet
              </Text>
              <Text style={styles.emptyEntriesSubtext}>
                Start tracking your water intake!
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderWeeklyStreak = () => (
    <View style={styles.streakContainer}>
      <Card style={styles.streakCard} elevation={4}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.streakTitle]}>
            🔥 Weekly Streak
          </Text>
          
          <View style={styles.streakGrid}>
            {weeklyStreak.map((day) => (
              <View key={day.day} style={styles.streakDay}>
                <View
                  style={[
                    styles.streakCircle,
                    {
                      backgroundColor: day.achieved ? COLORS.success : COLORS.error + '30',
                      borderColor: day.achieved ? COLORS.success : COLORS.error
                    }
                  ]}
                >
                  <Text style={[
                    styles.streakPercentage,
                    { color: day.achieved ? 'white' : COLORS.error }
                  ]}>
                    {day.percentage}%
                  </Text>
                </View>
                <Text style={styles.streakDayLabel}>{day.day}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderAddWaterModal = () => (
    <Portal>
      <Modal
        visible={showAddWaterModal}
        onDismiss={() => setShowAddWaterModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.addWaterCard} elevation={8}>
          <Card.Content>
            <View style={styles.modalHeader}>
              <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
                💧 Add Hydration
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowAddWaterModal(false)}
              />
            </View>

            <TextInput
              label="Amount (ml)"
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
              mode="outlined"
              left={<TextInput.Icon icon="water" />}
              style={styles.amountInput}
            />

            <Text style={styles.drinkTypeLabel}>Drink Type</Text>
            <View style={styles.drinkTypeGrid}>
              {Object.entries(drinkTypes).map(([key, drink]) => (
                <Chip
                  key={key}
                  onPress={() => {
                    if (customAmount) {
                      addWaterIntake(parseFloat(customAmount), key);
                    } else {
                      Alert.alert('Enter Amount', 'Please enter the amount first');
                    }
                  }}
                  style={[styles.drinkChip, { borderColor: drink.color }]}
                  textStyle={styles.drinkChipText}
                  icon={() => <Text style={styles.drinkChipIcon}>{drink.icon}</Text>}
                >
                  {drink.name}
                </Chip>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddWaterModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  if (customAmount) {
                    addWaterIntake(parseFloat(customAmount), 'water');
                  } else {
                    Alert.alert('Enter Amount', 'Please enter the amount first');
                  }
                }}
                disabled={!customAmount}
                style={styles.modalButton}
                icon="water-plus"
              >
                Add Water
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  const renderStreakModal = () => (
    <Portal>
      <Modal
        visible={showStreakModal}
        onDismiss={() => setShowStreakModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.streakModalCard} elevation={8}>
          <Card.Content style={styles.streakModalContent}>
            <Text style={styles.streakModalEmoji}>🎉</Text>
            <Text style={[TEXT_STYLES.h2, styles.streakModalTitle]}>
              Goal Achieved!
            </Text>
            <Text style={styles.streakModalText}>
              You've reached your daily hydration goal!
            </Text>
            <Text style={styles.streakModalStats}>
              {currentIntake}ml / {dailyGoal}ml
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowStreakModal(false)}
              style={styles.streakModalButton}
            >
              Awesome! 🚀
            </Button>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tracker':
        return (
          <View>
            {renderWaterProgress()}
            {renderQuickAdd()}
            {renderRecentEntries()}
            {renderWeeklyStreak()}
          </View>
        );
      case 'history':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.comingSoonTitle]}>
              📊 Hydration History
            </Text>
            <Icon name="construction" size={80} color={COLORS.textSecondary} style={styles.constructionIcon} />
            <Text style={styles.comingSoonText}>
              Feature Coming Soon! 🚧
            </Text>
          </View>
        );
      case 'goals':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.comingSoonTitle]}>
              🎯 Hydration Goals
            </Text>
            <Icon name="construction" size={80} color={COLORS.textSecondary} style={styles.constructionIcon} />
            <Text style={styles.comingSoonText}>
              Feature Coming Soon! 🚧
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabSelector()}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.water]}
            tintColor={COLORS.water}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'tracker' && renderClientSelector()}
        {renderTabContent()}
      </ScrollView>

      {renderAddWaterModal()}
      {renderStreakModal()}

      <FAB
        icon="water-plus"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Quick Actions 💧',
            'Choose an action:',
            [
              { text: 'Add 250ml', onPress: () => quickAddWater(250) },
              { text: 'Add 500ml', onPress: () => quickAddWater(500) },
              { text: 'Custom Amount', onPress: () => setShowAddWaterModal(true) },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }}
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  headerAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabContainer: {
    margin: SPACING.md,
    borderRadius: 12,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.water + '20',
  },
  tabText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  activeTabText: {
    color: COLORS.water,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  clientSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  clientScroll: {
    marginBottom: SPACING.md,
  },
  clientCard: {
    alignItems: 'center',
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
    width: 80,
  },
  selectedClientCard: {
    backgroundColor: COLORS.water + '20',
    borderColor: COLORS.water,
    borderWidth: 2,
  },
  clientAvatar: {
    marginBottom: SPACING.xs,
  },
  clientName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  clientAge: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  progressCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  progressTitle: {
    color: COLORS.text,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.water + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  dateText: {
    color: COLORS.water,
    fontWeight: '600',
    marginRight: SPACING.xs,
    fontSize: 12,
  },
  waterBottleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  waterBottle: {
    width: 120,
    height: 200,
    backgroundColor: COLORS.waterLight + '30',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.water,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  waterLevel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.water,
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
  },
  bottleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  progressAmount: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  bubble: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 4,
  },
  bubble1: {
    left: 30,
    bottom: 50,
  },
  bubble2: {
    right: 25,
    bottom: 80,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mainProgressBar: {
    height: 10,
    borderRadius: 5,
  },
  quickAddContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  quickAddCard: {
    borderRadius: 16,
  },
  quickAddTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  quickAddButton: {
    width: '48%',
    marginBottom: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  quickAddGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickAddIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  quickAddLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  quickAddDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  customAddButton: {
    borderColor: COLORS.water,
    borderRadius: 12,
  },
  customAddContent: {
    paddingVertical: SPACING.sm,
  },
  customAddLabel: {
    color: COLORS.water,
  },
  entriesContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  entriesCard: {
    borderRadius: 16,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  entriesTitle: {
    color: COLORS.text,
  },
  entriesBadge: {
    color: 'white',
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  entryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  entryIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  entryDetails: {
    flex: 1,
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  entryTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  effectiveAmount: {
    fontSize: 10,
    color: COLORS.water,
    fontStyle: 'italic',
  },
  emptyEntries: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyEntriesText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyEntriesSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    opacity: 0.7,
  },
  streakContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  streakCard: {
    borderRadius: 16,
  },
  streakTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  streakGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  streakDay: {
    alignItems: 'center',
  },
  streakCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  streakPercentage: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  streakDayLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 2,
  },
  comingSoonTitle: {
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  constructionIcon: {
    marginBottom: SPACING.lg,
  },
  comingSoonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    padding: SPACING.md,
    justifyContent: 'center',
  },
  addWaterCard: {
    borderRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.text,
    flex: 1,
  },
  amountInput: {
    backgroundColor: 'transparent',
    marginBottom: SPACING.md,
  },
  drinkTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  drinkTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  drinkChip: {
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  drinkChipText: {
    fontSize: 12,
  },
  drinkChipIcon: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.45,
    borderRadius: 12,
  },
  streakModalCard: {
    borderRadius: 20,
    margin: SPACING.lg,
  },
  streakModalContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  streakModalEmoji: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  streakModalTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  streakModalText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  streakModalStats: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.water,
    marginBottom: SPACING.lg,
  },
  streakModalButton: {
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.water,
  },
});

export default HydrationTracking;