import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  RefreshControl,
  Dimensions,
  StatusBar,
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
  Portal,
  Modal,
  TextInput,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PersonalRecords = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, personalRecords, isLoading } = useSelector(state => state.records);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecordData, setNewRecordData] = useState({
    exercise: '',
    value: '',
    unit: 'kg',
    date: new Date().toISOString().split('T')[0],
  });
  const [sortBy, setSortBy] = useState('recent');

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Records', icon: 'fitness-center', color: COLORS.primary },
    { id: 'strength', name: 'Strength', icon: 'fitness-center', color: COLORS.error },
    { id: 'cardio', name: 'Cardio', icon: 'directions-run', color: COLORS.success },
    { id: 'endurance', name: 'Endurance', icon: 'timer', color: COLORS.warning },
    { id: 'flexibility', name: 'Flexibility', icon: 'self-improvement', color: COLORS.secondary },
  ];

  // Sample personal records data
  const [recordsData] = useState({
    totalRecords: 23,
    recentPRs: 5,
    thisMonthPRs: 8,
    personalBests: [
      {
        id: '1',
        exercise: 'Bench Press',
        value: 85,
        unit: 'kg',
        category: 'strength',
        date: '2024-08-20',
        previousBest: 80,
        improvement: 5,
        isNewRecord: true,
        reps: 1,
        notes: 'Perfect form! 💪',
      },
      {
        id: '2',
        exercise: '5K Run',
        value: 22.30,
        unit: 'min',
        category: 'cardio',
        date: '2024-08-18',
        previousBest: 23.15,
        improvement: -45, // negative for time improvement
        isNewRecord: false,
        distance: 5,
        notes: 'Great pacing throughout',
      },
      {
        id: '3',
        exercise: 'Deadlift',
        value: 120,
        unit: 'kg',
        category: 'strength',
        date: '2024-08-15',
        previousBest: 115,
        improvement: 5,
        isNewRecord: false,
        reps: 1,
        notes: 'Felt strong today!',
      },
      {
        id: '4',
        exercise: 'Plank Hold',
        value: 4.20,
        unit: 'min',
        category: 'endurance',
        date: '2024-08-12',
        previousBest: 3.45,
        improvement: 35,
        isNewRecord: true,
        notes: 'Core is getting stronger! 🔥',
      },
      {
        id: '5',
        exercise: 'Pull-ups',
        value: 15,
        unit: 'reps',
        category: 'strength',
        date: '2024-08-10',
        previousBest: 12,
        improvement: 3,
        isNewRecord: false,
        notes: 'Slow and controlled',
      },
      {
        id: '6',
        exercise: '10K Run',
        value: 48.30,
        unit: 'min',
        category: 'cardio',
        date: '2024-08-05',
        previousBest: 50.15,
        improvement: -105,
        isNewRecord: true,
        distance: 10,
        notes: 'New personal best! 🏃‍♂️',
      },
    ],
    milestones: [
      { id: '1', title: 'First 100kg Deadlift', date: '2024-07-15', icon: 'jump-rope' },
      { id: '2', title: 'Sub-50min 10K', date: '2024-08-05', icon: 'directions-run' },
      { id: '3', title: '5min Plank Challenge', date: 'Coming Soon', icon: 'timer', upcoming: true },
    ],
  });

  useEffect(() => {
    // Animate screen entrance
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
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Personal Records', 'Records updated! 📊');
    }, 1000);
  }, []);

  const handleAddRecord = () => {
    if (!newRecordData.exercise || !newRecordData.value) {
      Alert.alert('Missing Information', 'Please fill in exercise name and value');
      return;
    }

    // Animate celebration
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    Vibration.vibrate([0, 50, 100, 50]);
    setShowAddModal(false);
    setNewRecordData({
      exercise: '',
      value: '',
      unit: 'kg',
      date: new Date().toISOString().split('T')[0],
    });

    Alert.alert(
      '🎉 New Record Added!',
      `Great job on your ${newRecordData.exercise} record! Keep pushing your limits! 💪`,
      [{ text: 'Awesome!', onPress: () => {} }]
    );
  };

  const getFilteredRecords = () => {
    let filtered = recordsData.personalBests;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(record => record.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(record => 
        record.exercise.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort records
    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'improvement':
        return filtered.sort((a, b) => Math.abs(b.improvement) - Math.abs(a.improvement));
      case 'alphabetical':
        return filtered.sort((a, b) => a.exercise.localeCompare(b.exercise));
      default:
        return filtered;
    }
  };

  const formatValue = (value, unit) => {
    if (unit === 'min') {
      const minutes = Math.floor(value);
      const seconds = Math.round((value - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${value}${unit}`;
  };

  const getImprovementText = (improvement, unit) => {
    if (unit === 'min' && improvement < 0) {
      const minutes = Math.floor(Math.abs(improvement) / 60);
      const seconds = Math.abs(improvement) % 60;
      return `-${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return improvement > 0 ? `+${improvement}${unit}` : `${improvement}${unit}`;
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <IconButton
          icon="arrow-back"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerCenter}>
          <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center' }]}>
            Personal Records 🏆
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', textAlign: 'center' }]}>
            {recordsData.totalRecords} records • {recordsData.recentPRs} new this week
          </Text>
        </View>
        <IconButton
          icon="share"
          iconColor="white"
          size={24}
          onPress={() => Alert.alert('Share', 'Feature coming soon!')}
        />
      </View>
    </LinearGradient>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Surface style={styles.statCard} elevation={3}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.statGradient}
        >
          <Icon name="trending-up" size={28} color="white" />
          <Text style={[TEXT_STYLES.h1, { color: 'white', marginTop: 8 }]}>
            {recordsData.recentPRs}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
            New PRs This Week 🔥
          </Text>
        </LinearGradient>
      </Surface>
      
      <Surface style={styles.statCard} elevation={3}>
        <LinearGradient
          colors={['#4ECDC4', '#44A08D']}
          style={styles.statGradient}
        >
          <Icon name="jump-rope" size={28} color="white" />
          <Text style={[TEXT_STYLES.h1, { color: 'white', marginTop: 8 }]}>
            {recordsData.totalRecords}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
            Total Records
          </Text>
        </LinearGradient>
      </Surface>
      
      <Surface style={styles.statCard} elevation={3}>
        <LinearGradient
          colors={['#FFD93D', '#FF9A1F']}
          style={styles.statGradient}
        >
          <Icon name="calendar-today" size={28} color="white" />
          <Text style={[TEXT_STYLES.h1, { color: 'white', marginTop: 8 }]}>
            {recordsData.thisMonthPRs}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
            This Month
          </Text>
        </LinearGradient>
      </Surface>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Searchbar
        placeholder="Search exercises..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((category) => (
          <Chip
            key={category.id}
            mode={selectedCategory === category.id ? 'flat' : 'outlined'}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={selectedCategory === category.id ? { color: 'white' } : { color: category.color }}
            icon={category.icon}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>
      
      <View style={styles.sortContainer}>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Sort by:</Text>
        {['recent', 'improvement', 'alphabetical'].map((sort) => (
          <Chip
            key={sort}
            mode={sortBy === sort ? 'flat' : 'outlined'}
            selected={sortBy === sort}
            onPress={() => setSortBy(sort)}
            style={styles.sortChip}
            compact
          >
            {sort.charAt(0).toUpperCase() + sort.slice(1)}
          </Chip>
        ))}
      </View>
    </View>
  );

  const renderRecordCard = (record) => (
    <Card key={record.id} style={styles.recordCard}>
      <Card.Content>
        <View style={styles.recordHeader}>
          <View style={styles.recordInfo}>
            <Text style={TEXT_STYLES.h3}>{record.exercise}</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {new Date(record.date).toLocaleDateString()}
            </Text>
          </View>
          
          {record.isNewRecord && (
            <Surface style={styles.newBadge} elevation={2}>
              <Text style={[TEXT_STYLES.caption, { color: 'white', fontWeight: 'bold' }]}>
                NEW! 🎉
              </Text>
            </Surface>
          )}
        </View>
        
        <View style={styles.recordValue}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.primary }]}>
            {formatValue(record.value, record.unit)}
          </Text>
          
          <View style={styles.improvement}>
            <Icon 
              name={record.improvement > 0 || (record.unit === 'min' && record.improvement < 0) ? 'trending-up' : 'trending-flat'} 
              size={20} 
              color={COLORS.success} 
            />
            <Text style={[TEXT_STYLES.body, { color: COLORS.success, marginLeft: 4 }]}>
              {getImprovementText(record.improvement, record.unit)}
            </Text>
          </View>
        </View>
        
        {record.notes && (
          <View style={styles.recordNotes}>
            <Icon name="note" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.body, { marginLeft: 8, flex: 1 }]}>
              {record.notes}
            </Text>
          </View>
        )}
        
        <View style={styles.recordFooter}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
            Previous: {formatValue(record.previousBest, record.unit)}
          </Text>
          <View style={styles.recordActions}>
            <IconButton
              icon="edit"
              size={20}
              iconColor={COLORS.primary}
              onPress={() => Alert.alert('Edit Record', 'Feature coming soon!')}
            />
            <IconButton
              icon="share"
              size={20}
              iconColor={COLORS.secondary}
              onPress={() => Alert.alert('Share', 'Share this achievement!')}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderMilestones = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={TEXT_STYLES.h3}>Milestones 🎯</Text>
          <Button
            mode="text"
            textColor={COLORS.primary}
            onPress={() => navigation.navigate('AllMilestones')}
          >
            View All
          </Button>
        </View>
        
        {recordsData.milestones.map((milestone) => (
          <Surface 
            key={milestone.id} 
            style={[styles.milestoneItem, milestone.upcoming && styles.upcomingMilestone]} 
            elevation={1}
          >
            <Icon 
              name={milestone.icon} 
              size={24} 
              color={milestone.upcoming ? COLORS.warning : COLORS.success} 
            />
            <View style={styles.milestoneInfo}>
              <Text style={TEXT_STYLES.subtitle1}>{milestone.title}</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {milestone.upcoming ? milestone.date : `Achieved ${milestone.date}`}
              </Text>
            </View>
            {!milestone.upcoming && (
              <Icon name="check-circle" size={20} color={COLORS.success} />
            )}
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderAddModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg }]}>
          Add New Record 📈
        </Text>
        
        <TextInput
          label="Exercise Name"
          value={newRecordData.exercise}
          onChangeText={(text) => setNewRecordData({...newRecordData, exercise: text})}
          style={styles.input}
          mode="outlined"
        />
        
        <View style={styles.inputRow}>
          <TextInput
            label="Value"
            value={newRecordData.value}
            onChangeText={(text) => setNewRecordData({...newRecordData, value: text})}
            style={[styles.input, { flex: 2, marginRight: SPACING.sm }]}
            mode="outlined"
            keyboardType="numeric"
          />
          
          <Surface style={styles.unitSelector} elevation={1}>
            {['kg', 'lbs', 'reps', 'min', 'sec'].map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitOption,
                  newRecordData.unit === unit && styles.selectedUnit
                ]}
                onPress={() => setNewRecordData({...newRecordData, unit})}
              >
                <Text style={[
                  TEXT_STYLES.body,
                  newRecordData.unit === unit && { color: 'white' }
                ]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </Surface>
        </View>
        
        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => setShowAddModal(false)}
            style={{ flex: 1, marginRight: SPACING.sm }}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleAddRecord}
            style={{ flex: 1 }}
            buttonColor={COLORS.primary}
          >
            Add Record 🎉
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {renderHeader()}
          
          <View style={styles.content}>
            {renderStatsCards()}
            {renderFilters()}
            
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              Your Records 📊
            </Text>
            
            {getFilteredRecords().map(renderRecordCard)}
            
            {renderMilestones()}
            
            {/* Spacing for FAB */}
            <View style={{ height: 80 }} />
          </View>
        </ScrollView>
      </Animated.View>

      {renderAddModal()}

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => setShowAddModal(true)}
        label="Add Record"
      />

      {/* Celebration Animation Overlay */}
      <Animated.View
        style={[
          styles.celebrationOverlay,
          {
            opacity: celebrationAnim,
            transform: [{
              scale: celebrationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1.2],
              }),
            }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.celebrationText}>🎉 NEW RECORD! 🎉</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    marginHorizontal: SPACING.xs,
    overflow: 'hidden',
  },
  statGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
  },
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sortChip: {
    marginLeft: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  recordInfo: {
    flex: 1,
  },
  newBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  recordValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  improvement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordActions: {
    flexDirection: 'row',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  upcomingMilestone: {
    borderWidth: 2,
    borderColor: COLORS.warning,
    borderStyle: 'dashed',
  },
  milestoneInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: 12,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  unitSelector: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    padding: SPACING.xs,
  },
  unitOption: {
    padding: SPACING.sm,
    alignItems: 'center',
    borderRadius: 4,
    marginVertical: 1,
  },
  selectedUnit: {
    backgroundColor: COLORS.primary,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  celebrationText: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default PersonalRecords;