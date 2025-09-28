import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  StatusBar,
  Animated,
  Vibration,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  ProgressBar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  Searchbar,
  Avatar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const MaintenanceSchedule = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    category: '',
    lastMaintenance: null,
    nextMaintenance: null,
    frequency: 30, // days
  });
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const equipmentList = useSelector(state => state.equipment.maintenanceSchedule || []);
  
  // Sample maintenance data
  const [maintenanceData, setMaintenanceData] = useState([
    {
      id: '1',
      name: 'Treadmill Pro X1',
      category: 'Cardio',
      lastMaintenance: '2024-07-15',
      nextMaintenance: '2024-08-15',
      status: 'due_soon',
      frequency: 30,
      icon: 'directions-run',
      color: COLORS.warning,
      maintenanceTasks: ['Belt alignment check', 'Lubrication', 'Safety key test'],
      completionRate: 85,
      cost: '$45',
    },
    {
      id: '2',
      name: 'Olympic Barbell Set',
      category: 'Strength',
      lastMaintenance: '2024-06-20',
      nextMaintenance: '2024-09-20',
      status: 'good',
      frequency: 90,
      icon: 'fitness-center',
      color: COLORS.success,
      maintenanceTasks: ['Rust inspection', 'Weight calibration', 'Sleeve rotation check'],
      completionRate: 95,
      cost: '$25',
    },
    {
      id: '3',
      name: 'Spin Bike Elite',
      category: 'Cardio',
      lastMaintenance: '2024-05-10',
      nextMaintenance: '2024-07-25',
      status: 'overdue',
      frequency: 45,
      icon: 'directions-bike',
      color: COLORS.error,
      maintenanceTasks: ['Chain maintenance', 'Brake adjustment', 'Resistance calibration'],
      completionRate: 60,
      cost: '$35',
    },
    {
      id: '4',
      name: 'Cable Machine Pro',
      category: 'Strength',
      lastMaintenance: '2024-07-01',
      nextMaintenance: '2024-08-30',
      status: 'good',
      frequency: 60,
      icon: 'fitness-center',
      color: COLORS.success,
      maintenanceTasks: ['Cable inspection', 'Pulley lubrication', 'Weight stack check'],
      completionRate: 90,
      cost: '$55',
    },
  ]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 2000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return COLORS.success;
      case 'due_soon':
        return COLORS.warning;
      case 'overdue':
        return COLORS.error;
      default:
        return COLORS.secondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'good':
        return 'Up to Date ✅';
      case 'due_soon':
        return 'Due Soon ⚠️';
      case 'overdue':
        return 'Overdue ⚠️';
      default:
        return 'Unknown';
    }
  };

  const getDaysUntilMaintenance = (nextDate) => {
    const today = new Date();
    const next = new Date(nextDate);
    const diffTime = next - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredEquipment = maintenanceData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleMarkComplete = (equipmentId) => {
    Alert.alert(
      'Complete Maintenance',
      'Mark this equipment maintenance as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            Vibration.vibrate(100);
            // Update maintenance data
            setMaintenanceData(prev =>
              prev.map(item =>
                item.id === equipmentId
                  ? {
                      ...item,
                      lastMaintenance: new Date().toISOString().split('T')[0],
                      nextMaintenance: new Date(Date.now() + item.frequency * 24 * 60 * 60 * 1000)
                        .toISOString().split('T')[0],
                      status: 'good',
                      completionRate: 100,
                    }
                  : item
              )
            );
            Alert.alert('Success! 🎉', 'Maintenance completed successfully!');
          }
        }
      ]
    );
  };

  const handleAddEquipment = () => {
    if (!newEquipment.name.trim()) {
      Alert.alert('Error', 'Please enter equipment name');
      return;
    }
    
    const newId = Math.random().toString();
    const today = new Date().toISOString().split('T')[0];
    const nextDate = new Date(Date.now() + newEquipment.frequency * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    setMaintenanceData(prev => [...prev, {
      id: newId,
      name: newEquipment.name,
      category: newEquipment.category || 'General',
      lastMaintenance: today,
      nextMaintenance: nextDate,
      status: 'good',
      frequency: newEquipment.frequency,
      icon: 'build',
      color: COLORS.primary,
      maintenanceTasks: ['General inspection', 'Cleaning', 'Function test'],
      completionRate: 100,
      cost: '$30',
    }]);

    setNewEquipment({
      name: '',
      category: '',
      lastMaintenance: null,
      nextMaintenance: null,
      frequency: 30,
    });
    setShowAddModal(false);
    Vibration.vibrate(100);
    Alert.alert('Success! 🎉', 'Equipment added to maintenance schedule!');
  };

  const renderEquipmentCard = (equipment) => {
    const daysUntil = getDaysUntilMaintenance(equipment.nextMaintenance);
    
    return (
      <Card key={equipment.id} style={styles.equipmentCard} elevation={3}>
        <LinearGradient
          colors={['rgba(102, 126, 234, 0.1)', 'transparent']}
          style={styles.cardGradient}
        >
          <Card.Content>
            <View style={styles.cardHeader}>
              <Avatar.Icon
                size={48}
                icon={equipment.icon}
                style={[styles.equipmentIcon, { backgroundColor: equipment.color }]}
              />
              <View style={styles.equipmentInfo}>
                <Text style={styles.equipmentName}>{equipment.name}</Text>
                <Text style={styles.equipmentCategory}>{equipment.category}</Text>
                <Chip
                  mode="outlined"
                  style={[styles.statusChip, { borderColor: equipment.color }]}
                  textStyle={{ color: equipment.color, fontSize: 11 }}
                >
                  {getStatusText(equipment.status)}
                </Chip>
              </View>
              <View style={styles.cardActions}>
                <IconButton
                  icon="build"
                  size={20}
                  onPress={() => handleMarkComplete(equipment.id)}
                  style={styles.actionButton}
                />
                <IconButton
                  icon="schedule"
                  size={20}
                  onPress={() => {
                    Alert.alert('Maintenance Info', `Next maintenance in ${daysUntil} days\nEstimated cost: ${equipment.cost}`);
                  }}
                  style={styles.actionButton}
                />
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Maintenance Health</Text>
                <Text style={styles.progressPercent}>{equipment.completionRate}%</Text>
              </View>
              <ProgressBar
                progress={equipment.completionRate / 100}
                color={equipment.color}
                style={styles.progressBar}
              />
            </View>

            <View style={styles.maintenanceDetails}>
              <View style={styles.dateInfo}>
                <MaterialIcons name="event" size={16} color={COLORS.textSecondary} />
                <Text style={styles.dateText}>
                  Last: {new Date(equipment.lastMaintenance).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.dateInfo}>
                <MaterialIcons name="schedule" size={16} color={equipment.color} />
                <Text style={[styles.dateText, { color: equipment.color }]}>
                  Next: {daysUntil > 0 ? `${daysUntil} days` : `${Math.abs(daysUntil)} days overdue`}
                </Text>
              </View>
            </View>

            <View style={styles.tasksList}>
              <Text style={styles.tasksTitle}>Maintenance Tasks:</Text>
              {equipment.maintenanceTasks.map((task, index) => (
                <View key={index} style={styles.taskItem}>
                  <MaterialIcons name="check-circle-outline" size={14} color={COLORS.success} />
                  <Text style={styles.taskText}>{task}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Equipment Maintenance 🔧</Text>
        <Text style={styles.headerSubtitle}>Keep your gear in perfect condition</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search equipment..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'All Equipment', icon: 'view-list' },
            { key: 'good', label: 'Up to Date', icon: 'check-circle', color: COLORS.success },
            { key: 'due_soon', label: 'Due Soon', icon: 'schedule', color: COLORS.warning },
            { key: 'overdue', label: 'Overdue', icon: 'warning', color: COLORS.error },
          ].map((filter) => (
            <Chip
              key={filter.key}
              mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
              selected={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && { backgroundColor: filter.color || COLORS.primary }
              ]}
              textStyle={[
                styles.filterChipText,
                selectedFilter === filter.key && { color: 'white' }
              ]}
              icon={filter.icon}
            >
              {filter.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
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
          {filteredEquipment.length === 0 ? (
            <Surface style={styles.emptyState}>
              <MaterialIcons name="build" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No Equipment Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search' : 'Add your first equipment to get started'}
              </Text>
            </Surface>
          ) : (
            <>
              <View style={styles.summaryCards}>
                <Card style={styles.summaryCard} elevation={2}>
                  <Card.Content style={styles.summaryContent}>
                    <MaterialIcons name="check-circle" size={24} color={COLORS.success} />
                    <Text style={styles.summaryNumber}>
                      {maintenanceData.filter(item => item.status === 'good').length}
                    </Text>
                    <Text style={styles.summaryLabel}>Up to Date</Text>
                  </Card.Content>
                </Card>
                
                <Card style={styles.summaryCard} elevation={2}>
                  <Card.Content style={styles.summaryContent}>
                    <MaterialIcons name="schedule" size={24} color={COLORS.warning} />
                    <Text style={styles.summaryNumber}>
                      {maintenanceData.filter(item => item.status === 'due_soon').length}
                    </Text>
                    <Text style={styles.summaryLabel}>Due Soon</Text>
                  </Card.Content>
                </Card>
                
                <Card style={styles.summaryCard} elevation={2}>
                  <Card.Content style={styles.summaryContent}>
                    <MaterialIcons name="warning" size={24} color={COLORS.error} />
                    <Text style={styles.summaryNumber}>
                      {maintenanceData.filter(item => item.status === 'overdue').length}
                    </Text>
                    <Text style={styles.summaryLabel}>Overdue</Text>
                  </Card.Content>
                </Card>
              </View>

              {filteredEquipment.map(renderEquipmentCard)}
            </>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.modalBlur}
            blurType="light"
            blurAmount={10}
          >
            <Surface style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Equipment</Text>
              
              <TextInput
                label="Equipment Name"
                value={newEquipment.name}
                onChangeText={(text) => setNewEquipment({...newEquipment, name: text})}
                style={styles.modalInput}
                left={<TextInput.Icon icon="build" />}
              />
              
              <TextInput
                label="Category"
                value={newEquipment.category}
                onChangeText={(text) => setNewEquipment({...newEquipment, category: text})}
                style={styles.modalInput}
                left={<TextInput.Icon icon="category" />}
              />
              
              <TextInput
                label="Maintenance Frequency (days)"
                value={newEquipment.frequency.toString()}
                onChangeText={(text) => setNewEquipment({...newEquipment, frequency: parseInt(text) || 30})}
                keyboardType="numeric"
                style={styles.modalInput}
                left={<TextInput.Icon icon="schedule" />}
              />
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAddModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddEquipment}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                >
                  Add Equipment
                </Button>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        color="white"
        onPress={() => setShowAddModal(true)}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  filterChipText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  summaryContent: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  summaryNumber: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    marginVertical: SPACING.xs,
  },
  summaryLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  equipmentCard: {
    marginBottom: SPACING.lg,
    borderRadius: 15,
  },
  cardGradient: {
    borderRadius: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  equipmentIcon: {
    marginRight: SPACING.md,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  equipmentCategory: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    marginLeft: SPACING.xs,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  progressPercent: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  maintenanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  tasksList: {
    marginTop: SPACING.sm,
  },
  tasksTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  taskText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
    borderRadius: 15,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
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
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: SPACING.xl,
    borderRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalInput: {
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  bottomPadding: {
    height: 100,
  },
});

export default MaintenanceSchedule;
