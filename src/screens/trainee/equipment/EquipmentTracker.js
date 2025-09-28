import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Vibration,
  Animated,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
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
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const EquipmentTracker = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Redux state
  const dispatch = useDispatch();
  const { user, equipment, workouts } = useSelector(state => ({
    user: state.auth.user,
    equipment: state.equipment.items || [],
    workouts: state.workouts.sessions || [],
  }));

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [usageMode, setUsageMode] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    category: 'cardio',
    location: '',
    condition: 'excellent',
    notes: '',
  });

  // Sample equipment data with usage tracking
  const [equipmentData, setEquipmentData] = useState([
    {
      id: '1',
      name: 'Treadmill Pro X1',
      category: 'cardio',
      location: 'Home Gym',
      condition: 'excellent',
      lastUsed: '2024-08-25',
      totalUsage: 45,
      maintenanceDue: '2024-09-15',
      status: 'available',
      notes: 'Regular maintenance scheduled',
      usageHistory: [
        { date: '2024-08-25', duration: 30, intensity: 'medium' },
        { date: '2024-08-23', duration: 45, intensity: 'high' },
      ],
    },
    {
      id: '2',
      name: 'Olympic Barbell Set',
      category: 'strength',
      location: 'Home Gym',
      condition: 'good',
      lastUsed: '2024-08-24',
      totalUsage: 120,
      maintenanceDue: '2024-10-01',
      status: 'in-use',
      notes: 'Need to check weight plates',
      usageHistory: [
        { date: '2024-08-24', duration: 60, intensity: 'high' },
        { date: '2024-08-22', duration: 45, intensity: 'medium' },
      ],
    },
    {
      id: '3',
      name: 'Resistance Bands Set',
      category: 'accessories',
      location: 'Travel Bag',
      condition: 'excellent',
      lastUsed: '2024-08-26',
      totalUsage: 30,
      maintenanceDue: null,
      status: 'available',
      notes: 'Perfect for travel workouts',
      usageHistory: [
        { date: '2024-08-26', duration: 25, intensity: 'low' },
      ],
    },
    {
      id: '4',
      name: 'Adjustable Dumbbells',
      category: 'strength',
      location: 'Home Gym',
      condition: 'maintenance',
      lastUsed: '2024-08-20',
      totalUsage: 85,
      maintenanceDue: '2024-08-28',
      status: 'maintenance',
      notes: 'Weight adjustment mechanism needs servicing',
      usageHistory: [
        { date: '2024-08-20', duration: 40, intensity: 'medium' },
      ],
    },
  ]);

  const categories = [
    { key: 'all', label: 'All', icon: 'fitness-center', color: COLORS.primary },
    { key: 'cardio', label: 'Cardio', icon: 'directions-run', color: '#e74c3c' },
    { key: 'strength', label: 'Strength', icon: 'fitness-center', color: '#f39c12' },
    { key: 'accessories', label: 'Accessories', icon: 'extension', color: '#9b59b6' },
  ];

  const conditionColors = {
    excellent: COLORS.success,
    good: '#f39c12',
    fair: '#e67e22',
    maintenance: COLORS.error,
  };

  const statusColors = {
    available: COLORS.success,
    'in-use': '#f39c12',
    maintenance: COLORS.error,
    unavailable: '#95a5a6',
  };

  // Initialize animations
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

  // Filter equipment based on search and category
  const filteredEquipment = equipmentData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 2000);
  }, []);

  // Handle equipment usage logging
  const logEquipmentUsage = (equipmentId, duration, intensity) => {
    setEquipmentData(prev => prev.map(item => {
      if (item.id === equipmentId) {
        const newUsage = {
          date: new Date().toISOString().split('T')[0],
          duration,
          intensity,
        };
        return {
          ...item,
          lastUsed: newUsage.date,
          totalUsage: item.totalUsage + duration,
          status: 'available',
          usageHistory: [newUsage, ...item.usageHistory.slice(0, 9)], // Keep last 10 entries
        };
      }
      return item;
    }));
    
    Vibration.vibrate(100);
    Alert.alert(
      '✅ Usage Logged!',
      'Equipment usage has been recorded successfully.',
      [{ text: 'Great!', style: 'default' }]
    );
  };

  // Handle add equipment
  const handleAddEquipment = () => {
    if (!newEquipment.name.trim()) {
      Alert.alert('Error', 'Please enter equipment name');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      ...newEquipment,
      lastUsed: null,
      totalUsage: 0,
      maintenanceDue: null,
      status: 'available',
      usageHistory: [],
    };

    setEquipmentData(prev => [newItem, ...prev]);
    setNewEquipment({ name: '', category: 'cardio', location: '', condition: 'excellent', notes: '' });
    setShowAddModal(false);
    
    Vibration.vibrate(100);
    Alert.alert('✅ Equipment Added!', 'New equipment has been added to your inventory.');
  };

  // Update equipment status
  const updateEquipmentStatus = (equipmentId, newStatus) => {
    setEquipmentData(prev => prev.map(item => 
      item.id === equipmentId ? { ...item, status: newStatus } : item
    ));
  };

  // Get usage statistics
  const getUsageStats = () => {
    const totalEquipment = equipmentData.length;
    const available = equipmentData.filter(item => item.status === 'available').length;
    const inUse = equipmentData.filter(item => item.status === 'in-use').length;
    const needsMaintenance = equipmentData.filter(item => item.condition === 'maintenance').length;
    
    return { totalEquipment, available, inUse, needsMaintenance };
  };

  const stats = getUsageStats();

  const renderEquipmentCard = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={styles.equipmentCard} onPress={() => setSelectedEquipment(item)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.equipmentInfo}>
              <Text style={styles.equipmentName}>{item.name}</Text>
              <View style={styles.categoryRow}>
                <Chip 
                  mode="outlined" 
                  style={[styles.categoryChip, { borderColor: categories.find(c => c.key === item.category)?.color }]}
                  textStyle={{ color: categories.find(c => c.key === item.category)?.color }}
                >
                  {item.category}
                </Chip>
                <Text style={styles.location}>📍 {item.location}</Text>
              </View>
            </View>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.totalUsage}h</Text>
              <Text style={styles.statLabel}>Total Usage</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.lastUsed ? new Date(item.lastUsed).toLocaleDateString() : 'Never'}</Text>
              <Text style={styles.statLabel}>Last Used</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.conditionIndicator, { backgroundColor: conditionColors[item.condition] }]} />
              <Text style={styles.statLabel}>{item.condition}</Text>
            </View>
          </View>

          {item.maintenanceDue && (
            <View style={styles.maintenanceAlert}>
              <Icon name="warning" size={16} color={COLORS.error} />
              <Text style={styles.maintenanceText}>
                Maintenance due: {new Date(item.maintenanceDue).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => {
                setSelectedEquipment(item);
                setUsageMode(true);
              }}
              style={styles.actionButton}
              disabled={item.status === 'maintenance'}
            >
              Log Usage
            </Button>
            <IconButton
              icon="dots-vertical"
              onPress={() => setSelectedEquipment(item)}
              style={styles.moreButton}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderStatsCard = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statsCard}>
      <Text style={styles.statsTitle}>📊 Equipment Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.totalEquipment}</Text>
          <Text style={styles.statTitle}>Total Equipment</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.success }]}>{stats.available}</Text>
          <Text style={styles.statTitle}>Available</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#f39c12' }]}>{stats.inUse}</Text>
          <Text style={styles.statTitle}>In Use</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: COLORS.error }]}>{stats.needsMaintenance}</Text>
          <Text style={styles.statTitle}>Maintenance</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const UsageModal = () => {
    const [duration, setDuration] = useState('');
    const [intensity, setIntensity] = useState('medium');

    return (
      <Modal
        visible={usageMode && selectedEquipment}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUsageMode(false)}
      >
        <BlurView intensity={20} style={styles.modalOverlay}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Usage - {selectedEquipment?.name}</Text>
              <IconButton
                icon="close"
                onPress={() => setUsageMode(false)}
              />
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.textInput}
                value={duration}
                onChangeText={setDuration}
                placeholder="30"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Intensity Level</Text>
              <View style={styles.intensityButtons}>
                {['low', 'medium', 'high'].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.intensityButton,
                      { backgroundColor: intensity === level ? COLORS.primary : '#f8f9fa' }
                    ]}
                    onPress={() => setIntensity(level)}
                  >
                    <Text style={[
                      styles.intensityText,
                      { color: intensity === level ? 'white' : COLORS.text }
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                mode="contained"
                onPress={() => {
                  if (duration && selectedEquipment) {
                    logEquipmentUsage(selectedEquipment.id, parseInt(duration), intensity);
                    setUsageMode(false);
                    setDuration('');
                    setIntensity('medium');
                  }
                }}
                style={styles.logButton}
                disabled={!duration}
              >
                Log Usage Session
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    );
  };

  const AddEquipmentModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <BlurView intensity={20} style={styles.modalOverlay}>
        <Surface style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>➕ Add New Equipment</Text>
            <IconButton
              icon="close"
              onPress={() => setShowAddModal(false)}
            />
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Equipment Name *</Text>
            <TextInput
              style={styles.textInput}
              value={newEquipment.name}
              onChangeText={text => setNewEquipment(prev => ({ ...prev, name: text }))}
              placeholder="e.g., Treadmill, Dumbbells..."
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categorySelector}>
              {categories.slice(1).map(category => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryOption,
                    { 
                      backgroundColor: newEquipment.category === category.key ? category.color : '#f8f9fa',
                      borderColor: category.color
                    }
                  ]}
                  onPress={() => setNewEquipment(prev => ({ ...prev, category: category.key }))}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    { color: newEquipment.category === category.key ? 'white' : category.color }
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              value={newEquipment.location}
              onChangeText={text => setNewEquipment(prev => ({ ...prev, location: text }))}
              placeholder="e.g., Home Gym, Garage..."
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={newEquipment.notes}
              onChangeText={text => setNewEquipment(prev => ({ ...prev, notes: text }))}
              placeholder="Any additional notes..."
              multiline
              numberOfLines={3}
            />

            <Button
              mode="contained"
              onPress={handleAddEquipment}
              style={styles.addButton}
            >
              Add Equipment
            </Button>
          </ScrollView>
        </Surface>
      </BlurView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🏋️ Equipment Tracker</Text>
          <Text style={styles.headerSubtitle}>Manage your fitness gear efficiently</Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
        <Searchbar
          placeholder="Search equipment..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                { backgroundColor: selectedCategory === category.key ? category.color : 'white' }
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Icon 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.key ? 'white' : category.color} 
              />
              <Text style={[
                styles.categoryButtonText,
                { color: selectedCategory === category.key ? 'white' : category.color }
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {renderStatsCard()}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Equipment ({filteredEquipment.length})</Text>
            <Badge style={styles.equipmentBadge}>{filteredEquipment.length}</Badge>
          </View>

          <FlatList
            data={filteredEquipment}
            renderItem={renderEquipmentCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />

          {filteredEquipment.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="fitness-center" size={80} color="#bdc3c7" />
              <Text style={styles.emptyTitle}>No Equipment Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search terms' : 'Add your first piece of equipment to get started'}
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      <FAB
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        icon="add"
        onPress={() => setShowAddModal(true)}
        color="white"
      />

      <UsageModal />
      <AddEquipmentModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },
  searchBar: {
    marginVertical: SPACING.md,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 25,
    marginRight: SPACING.sm,
    elevation: 2,
  },
  categoryButtonText: {
    ...TEXT_STYLES.caption,
    marginLeft: 4,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  statsCard: {
    borderRadius: 15,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 4,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  statTitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  equipmentBadge: {
    backgroundColor: COLORS.primary,
  },
  listContainer: {
    paddingBottom: 100,
  },
  equipmentCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  location: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  conditionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  maintenanceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  maintenanceText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    marginLeft: 4,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  moreButton: {
    margin: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    flex: 1,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: SPACING.md,
    ...TEXT_STYLES.body,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  intensityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  intensityButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  intensityText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  categoryOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  categoryOptionText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  logButton: {
    marginTop: SPACING.lg,
  },
  addButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.lg,
  },
});

export default EquipmentTracker;